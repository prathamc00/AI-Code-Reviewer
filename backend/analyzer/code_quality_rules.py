"""
Code quality static analysis rules.
"""

import ast
from typing import List
from .models import Finding, IssueCategory
from .static_rules import BaseAnalyzer, ASTVisitor


class CodeQualityAnalyzer:
    """Analyzer for code quality issues."""
    
    @staticmethod
    def analyze(filename: str, code: str) -> List[Finding]:
        """
        Run all code quality checks on the code.
        
        Args:
            filename: Name of the file
            code: Source code content
            
        Returns:
            List of code quality findings
        """
        findings = []
        lines = code.split('\n')
        
        # Run AST-based checks
        tree = BaseAnalyzer.parse_ast_safely(code)
        if tree:
            visitor = CodeQualityVisitor(filename, lines)
            visitor.visit(tree)
            findings.extend(visitor.findings)
            
        return findings


class CodeQualityVisitor(ASTVisitor):
    """AST visitor for code quality issues."""
    
    def visit_FunctionDef(self, node: ast.FunctionDef):
        """Check function definitions for quality issues."""
        self._check_function_length(node)
        self._check_missing_docstring(node)
        self._check_parameter_count(node)
        self._check_complexity(node)
        self.generic_visit(node)
    
    def _check_function_length(self, node: ast.FunctionDef):
        """Check if function is too long."""
        if hasattr(node, 'end_lineno'):
            func_length = node.end_lineno - node.lineno
            if func_length > 50:
                self.findings.append(BaseAnalyzer.create_finding(
                    file=self.filename,
                    line=node.lineno,
                    issue=f"Function '{node.name}' is too long ({func_length} lines) - consider breaking it down",
                    category=IssueCategory.CODE_QUALITY,
                    code_snippet=f"def {node.name}(...)",
                    context=self.get_context(node.lineno)
                ))

    def _check_missing_docstring(self, node: ast.FunctionDef):
        """Check for missing docstring in public functions."""
        docstring = ast.get_docstring(node)
        if not docstring and not node.name.startswith('_'):
            self.findings.append(BaseAnalyzer.create_finding(
                file=self.filename,
                line=node.lineno,
                issue=f"Function '{node.name}' is missing a docstring",
                category=IssueCategory.CODE_QUALITY,
                code_snippet=f"def {node.name}(...)",
                context=self.get_context(node.lineno)
            ))

    def _check_parameter_count(self, node: ast.FunctionDef):
        """Check if function has too many parameters."""
        if len(node.args.args) > 5:
            self.findings.append(BaseAnalyzer.create_finding(
                file=self.filename,
                line=node.lineno,
                issue=f"Function '{node.name}' has too many parameters ({len(node.args.args)}) - consider using a config object",
                category=IssueCategory.CODE_QUALITY,
                code_snippet=f"def {node.name}(...)",
                context=self.get_context(node.lineno)
            ))

    def _check_complexity(self, node: ast.FunctionDef):
        """Check cyclomatic complexity."""
        complexity = self._calculate_complexity(node)
        if complexity > 10:
            self.findings.append(BaseAnalyzer.create_finding(
                file=self.filename,
                line=node.lineno,
                issue=f"Function '{node.name}' has high cyclomatic complexity ({complexity}) - consider simplifying",
                category=IssueCategory.CODE_QUALITY,
                code_snippet=f"def {node.name}(...)",
                context=self.get_context(node.lineno)
            ))

    def visit_ClassDef(self, node: ast.ClassDef):
        """Check class definitions for quality issues."""
        # Check for missing docstring
        docstring = ast.get_docstring(node)
        if not docstring and not node.name.startswith('_'):
            self.findings.append(BaseAnalyzer.create_finding(
                file=self.filename,
                line=node.lineno,
                issue=f"Class '{node.name}' is missing a docstring",
                category=IssueCategory.CODE_QUALITY,
                code_snippet=f"class {node.name}:",
                context=self.get_context(node.lineno)
            ))
        
        # Check for too many methods
        methods = [body_node for body_node in node.body if isinstance(body_node, ast.FunctionDef)]
        if len(methods) > 20:
            self.findings.append(BaseAnalyzer.create_finding(
                file=self.filename,
                line=node.lineno,
                issue=f"Class '{node.name}' has too many methods ({len(methods)}) - consider splitting into multiple classes",
                category=IssueCategory.CODE_QUALITY,
                code_snippet=f"class {node.name}:",
                context=self.get_context(node.lineno)
            ))
            
        self.generic_visit(node)
    
    def visit_Name(self, node: ast.Name):
        """Check variable names for quality."""
        # Check for single-letter variable names (except common ones like i, j, k in loops)
        if len(node.id) == 1 and node.id not in ['i', 'j', 'k', 'x', 'y', 'z', '_']:
            self.findings.append(BaseAnalyzer.create_finding(
                file=self.filename,
                line=node.lineno,
                issue=f"Single-letter variable name '{node.id}' - use descriptive names",
                category=IssueCategory.CODE_QUALITY,
                code_snippet=self.get_line_content(node.lineno),
                context=self.get_context(node.lineno)
            ))
            
        self.generic_visit(node)
    
    def _calculate_complexity(self, node: ast.FunctionDef) -> int:
        """Calculate simplified cyclomatic complexity."""
        complexity = 1  # Base complexity
        
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.For, ast.While, ast.ExceptHandler)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
                
        return complexity
