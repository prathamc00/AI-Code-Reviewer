"""
Code analyzer package - orchestrates all static analysis rules.
"""

from typing import Dict, List
from .models import Finding
from .security_rules import SecurityAnalyzer
from .performance_rules import PerformanceAnalyzer
from .code_quality_rules import CodeQualityAnalyzer


def analyze_code(files: Dict[str, str]) -> List[Finding]:
    """
    Analyze all files and return findings.
    
    Args:
        files: Dictionary mapping file paths to file contents
        
    Returns:
        List of all findings from all analyzers
    """
    all_findings = []
    
    for filename, code in files.items():
        # Run all analyzers
        all_findings.extend(SecurityAnalyzer.analyze(filename, code))
        all_findings.extend(PerformanceAnalyzer.analyze(filename, code))
        all_findings.extend(CodeQualityAnalyzer.analyze(filename, code))
    
    return all_findings
