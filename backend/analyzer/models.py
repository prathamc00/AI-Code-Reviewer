"""
Data models for code analysis findings and reports.
"""

from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class IssueCategory(str, Enum):
    """Category of code issue."""
    SECURITY = "Security"
    PERFORMANCE = "Performance"
    CODE_QUALITY = "Code Quality"


class Finding(BaseModel):
    """Structured finding from static analysis."""
    file: str
    line: int
    issue: str
    category: IssueCategory
    code_snippet: str
    context: Optional[str] = None  # Lines before/after for context
    
    
class EnhancedFinding(BaseModel):
    """Finding enhanced with LLM insights."""
    # Original finding data
    file: str
    line: int
    issue: str
    category: IssueCategory
    code_snippet: str
    context: Optional[str] = None
    
    # LLM enhancements
    explanation: str
    suggested_fix: str
    severity: int  # 1-5 scale
    
    
class ReviewReport(BaseModel):
    """Complete code review report."""
    repo_url: str
    total_issues: int
    findings: List[EnhancedFinding]
    stats: dict  # Category breakdown, severity distribution
