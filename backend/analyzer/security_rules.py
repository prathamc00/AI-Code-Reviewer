"""
Security-focused static analysis rules.
"""

import ast
import re
from typing import List
from .models import Finding, IssueCategory
from .static_rules import BaseAnalyzer, ASTVisitor


class SecurityAnalyzer:
    """Analyzer for security vulnerabilities."""
    
    @staticmethod
    def analyze(filename: str, code: str) -> List[Finding]:
        """
        Run all security checks on the code.
        
        Args:
            filename: Name of the file
            code: Source code content
            
        Returns:
            List of security findings
        """
        findings = []
        lines = code.split('\n')
        
        # Run regex-based checks
        findings.extend(SecurityAnalyzer._check_hardcoded_secrets(filename, code, lines))
        findings.extend(SecurityAnalyzer._check_sql_injection(filename, code, lines))
        
        # Run AST-based checks
        tree = BaseAnalyzer.parse_ast_safely(code)
        if tree:
            visitor = SecurityVisitor(filename, lines)
            visitor.visit(tree)
            findings.extend(visitor.findings)
            
        return findings
    
    @staticmethod
    def _check_hardcoded_secrets(filename: str, code: str, lines: List[str]) -> List[Finding]:
        """Detect hardcoded API keys, tokens, and passwords."""
        findings = []
        
        # Patterns for common secrets
        patterns = [
            (r'api[_-]?key\s*=\s*["\']([A-Za-z0-9_-]{20,})["\']', "Hardcoded API key detected"),
            (r'password\s*=\s*["\'](.{3,})["\']', "Hardcoded password detected"),
            (r'secret[_-]?key\s*=\s*["\'](.{10,})["\']', "Hardcoded secret key detected"),
            (r'token\s*=\s*["\']([A-Za-z0-9_-]{20,})["\']', "Hardcoded token detected"),
            (r'aws[_-]?access[_-]?key[_-]?id\s*=\s*["\']([A-Z0-9]{20})["\']', "Hardcoded AWS access key detected"),
        ]
        
        for pattern, message in patterns:
            for match in re.finditer(pattern, code, re.IGNORECASE):
                # Find line number
                line_num = code[:match.start()].count('\n') + 1
                snippet = lines[line_num - 1].strip()
                
                findings.append(BaseAnalyzer.create_finding(
                    file=filename,
                    line=line_num,
                    issue=message,
                    category=IssueCategory.SECURITY,
                    code_snippet=snippet,
                    context=BaseAnalyzer.get_code_context(lines, line_num)
                ))
                
        return findings
    
    @staticmethod
    def _check_sql_injection(filename: str, code: str, lines: List[str]) -> List[Finding]:
        """Detect potential SQL injection vulnerabilities."""
        findings = []
        
        # Look for string concatenation with SQL keywords
        pattern = r'(SELECT|INSERT|UPDATE|DELETE|DROP).*?[+%].*?(WHERE|FROM|INTO|VALUES)'
        
        for match in re.finditer(pattern, code, re.IGNORECASE):
            line_num = code[:match.start()].count('\n') + 1
            snippet = lines[line_num - 1].strip()
            
            findings.append(BaseAnalyzer.create_finding(
                file=filename,
                line=line_num,
                issue="Potential SQL injection: SQL query uses string concatenation",
                category=IssueCategory.SECURITY,
                code_snippet=snippet,
                context=BaseAnalyzer.get_code_context(lines, line_num)
            ))
            
        return findings


class SecurityVisitor(ASTVisitor):
    """AST visitor for security issues."""
    
    def visit_Call(self, node: ast.Call):
        """Check function calls for dangerous patterns."""
        # Check for eval() and exec()
        if isinstance(node.func, ast.Name):
            if node.func.id in ['eval', 'exec']:
                self.findings.append(BaseAnalyzer.create_finding(
                    file=self.filename,
                    line=node.lineno,
                    issue=f"Dangerous function '{node.func.id}()' detected - can execute arbitrary code",
                    category=IssueCategory.SECURITY,
                    code_snippet=self.get_line_content(node.lineno),
                    context=self.get_context(node.lineno)
                ))
            
            # Check for pickle.loads
            elif node.func.id == 'loads':
                # Check if it's from pickle module
                self.findings.append(BaseAnalyzer.create_finding(
                    file=self.filename,
                    line=node.lineno,
                    issue="Use of pickle.loads() can execute arbitrary code from untrusted data",
                    category=IssueCategory.SECURITY,
                    code_snippet=self.get_line_content(node.lineno),
                    context=self.get_context(node.lineno)
                ))
                
        # Check for os.system and subprocess without shell=False
        if isinstance(node.func, ast.Attribute):
            if node.func.attr == 'system':
                self.findings.append(BaseAnalyzer.create_finding(
                    file=self.filename,
                    line=node.lineno,
                    issue="os.system() is unsafe - use subprocess with proper argument handling",
                    category=IssueCategory.SECURITY,
                    code_snippet=self.get_line_content(node.lineno),
                    context=self.get_context(node.lineno)
                ))
            elif node.func.attr == 'Popen' or node.func.attr == 'call':
                # Check for shell=True
                for keyword in node.keywords:
                    if keyword.arg == 'shell' and isinstance(keyword.value, ast.Constant):
                        if keyword.value.value is True:
                            self.findings.append(BaseAnalyzer.create_finding(
                                file=self.filename,
                                line=node.lineno,
                                issue="subprocess with shell=True is vulnerable to injection attacks",
                                category=IssueCategory.SECURITY,
                                code_snippet=self.get_line_content(node.lineno),
                                context=self.get_context(node.lineno)
                            ))
                            
        self.generic_visit(node)
