"""
Performance-focused static analysis rules.
"""

import ast
from typing import List
from .models import Finding, IssueCategory
from .static_rules import BaseAnalyzer, ASTVisitor


class PerformanceAnalyzer:
    """Analyzer for performance issues."""
    
    @staticmethod
    def analyze(filename: str, code: str) -> List[Finding]:
        """
        Run all performance checks on the code.
        
        Args:
            filename: Name of the file
            code: Source code content
            
        Returns:
            List of performance findings
        """
        findings = []
        lines = code.split('\n')
        
        # Run AST-based checks
        tree = BaseAnalyzer.parse_ast_safely(code)
        if tree:
            visitor = PerformanceVisitor(filename, lines)
            visitor.visit(tree)
            findings.extend(visitor.findings)
            
        return findings


class PerformanceVisitor(ASTVisitor):
    """AST visitor for performance issues."""
    
    def __init__(self, filename: str, lines: List[str]):
        super().__init__(filename, lines)
        self.loop_depth = 0
        self.in_async_function = False
        
    def visit_For(self, node: ast.For):
        """Check for nested loops and inefficient patterns."""
        self.loop_depth += 1
        
        # Check for deeply nested loops (3+ levels)
        if self.loop_depth >= 3:
            self.findings.append(BaseAnalyzer.create_finding(
                file=self.filename,
                line=node.lineno,
                issue=f"Deeply nested loop (depth {self.loop_depth}) may cause performance issues",
                category=IssueCategory.PERFORMANCE,
                code_snippet=self.get_line_content(node.lineno),
                context=self.get_context(node.lineno)
            ))
        
        # Check for list operations inside loops
        for child in ast.walk(node):
            if isinstance(child, ast.Call):
                if isinstance(child.func, ast.Attribute):
                    # Check for .append() in loops (consider list comprehension)
                    if child.func.attr == 'append' and self.loop_depth == 1:
                        self.findings.append(BaseAnalyzer.create_finding(
                            file=self.filename,
                            line=child.lineno,
                            issue="List append in loop - consider using list comprehension for better performance",
                            category=IssueCategory.PERFORMANCE,
                            code_snippet=self.get_line_content(child.lineno),
                            context=self.get_context(child.lineno)
                        ))
                        
        self.generic_visit(node)
        self.loop_depth -= 1
        
    def visit_While(self, node: ast.While):
        """Check while loops for performance issues."""
        self.loop_depth += 1
        
        if self.loop_depth >= 3:
            self.findings.append(BaseAnalyzer.create_finding(
                file=self.filename,
                line=node.lineno,
                issue=f"Deeply nested while loop (depth {self.loop_depth}) may cause performance issues",
                category=IssueCategory.PERFORMANCE,
                code_snippet=self.get_line_content(node.lineno),
                context=self.get_context(node.lineno)
            ))
            
        self.generic_visit(node)
        self.loop_depth -= 1
        
    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        """Track async functions to check for blocking calls."""
        old_async = self.in_async_function
        self.in_async_function = True
        self.generic_visit(node)
        self.in_async_function = old_async
        
    def visit_Call(self, node: ast.Call):
        """Check for blocking calls in async contexts."""
        if self.in_async_function:
            # Check for blocking I/O calls
            blocking_funcs = ['sleep', 'read', 'write', 'connect']
            
            if isinstance(node.func, ast.Attribute):
                if node.func.attr in blocking_funcs:
                    # Make sure it's not asyncio.sleep
                    if not (isinstance(node.func.value, ast.Name) and 
                           node.func.value.id == 'asyncio'):
                        self.findings.append(BaseAnalyzer.create_finding(
                            file=self.filename,
                            line=node.lineno,
                            issue=f"Blocking call '{node.func.attr}()' in async function - use async version",
                            category=IssueCategory.PERFORMANCE,
                            code_snippet=self.get_line_content(node.lineno),
                            context=self.get_context(node.lineno)
                        ))
            elif isinstance(node.func, ast.Name):
                if node.func.id == 'sleep':
                    self.findings.append(BaseAnalyzer.create_finding(
                        file=self.filename,
                        line=node.lineno,
                        issue="Use 'await asyncio.sleep()' instead of 'time.sleep()' in async functions",
                        category=IssueCategory.PERFORMANCE,
                        code_snippet=self.get_line_content(node.lineno),
                        context=self.get_context(node.lineno)
                    ))
                    
        self.generic_visit(node)
    
    def visit_ListComp(self, node: ast.ListComp):
        """Check for inefficient list comprehensions."""
        # Check for nested list comprehensions (can be hard to read and slow)
        for generator in node.generators:
            if isinstance(generator.iter, ast.ListComp):
                self.findings.append(BaseAnalyzer.create_finding(
                    file=self.filename,
                    line=node.lineno,
                    issue="Nested list comprehension detected - consider breaking into separate steps for readability",
                    category=IssueCategory.PERFORMANCE,
                    code_snippet=self.get_line_content(node.lineno),
                    context=self.get_context(node.lineno)
                ))
                
        self.generic_visit(node)
