"""
Base static analysis utilities and common functions.
"""

import ast
import re
from typing import List, Optional
from .models import Finding, IssueCategory


class BaseAnalyzer:
    """Base class for static code analyzers."""
    
    @staticmethod
    def get_code_context(lines: List[str], line_number: int, context_size: int = 3) -> str:
        """
        Get surrounding lines of code for context.
        
        Args:
            lines: All lines of the file
            line_number: Target line number (1-indexed)
            context_size: Number of lines before/after to include
            
        Returns:
            String with context lines
        """
        start = max(0, line_number - context_size - 1)
        end = min(len(lines), line_number + context_size)
        
        context_lines = []
        for i in range(start, end):
            prefix = ">>> " if i == line_number - 1 else "    "
            context_lines.append(f"{prefix}{lines[i].rstrip()}")
            
        return "\n".join(context_lines)
    
    @staticmethod
    def parse_ast_safely(code: str) -> Optional[ast.AST]:
        """
        Safely parse Python code into AST.
        
        Args:
            code: Python source code
            
        Returns:
            AST tree or None if parsing fails
        """
        try:
            return ast.parse(code)
        except SyntaxError:
            return None
    
    @staticmethod
    def create_finding(
        file: str,
        line: int,
        issue: str,
        category: IssueCategory,
        code_snippet: str,
        context: Optional[str] = None
    ) -> Finding:
        """
        Create a structured finding.
        
        Args:
            file: File path
            line: Line number
            issue: Issue description
            category: Issue category
            code_snippet: Code that triggered the issue
            context: Optional surrounding code context
            
        Returns:
            Finding object
        """
        return Finding(
            file=file,
            line=line,
            issue=issue,
            category=category,
            code_snippet=code_snippet,
            context=context
        )


class ASTVisitor(ast.NodeVisitor):
    """Base AST visitor for pattern detection."""
    
    def __init__(self, filename: str, lines: List[str]):
        """
        Initialize visitor.
        
        Args:
            filename: Name of the file being analyzed
            lines: Lines of code (for context and snippets)
        """
        self.filename = filename
        self.lines = lines
        self.findings: List[Finding] = []
        
    def get_line_content(self, lineno: int) -> str:
        """Get content of a specific line."""
        if 0 <= lineno - 1 < len(self.lines):
            return self.lines[lineno - 1].strip()
        return ""
    
    def get_context(self, lineno: int) -> str:
        """Get context around a line."""
        return BaseAnalyzer.get_code_context(self.lines, lineno)
