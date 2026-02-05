"""
Report generator for creating structured code review reports.
"""

from typing import List, Dict
from analyzer.models import EnhancedFinding, ReviewReport, IssueCategory


class ReportGenerator:
    """Generates structured code review reports."""
    
    @staticmethod
    def generate_report(repo_url: str, enhanced_findings: List[EnhancedFinding]) -> ReviewReport:
        """
        Generate a complete review report.
        
        Args:
            repo_url: GitHub repository or PR URL
            enhanced_findings: List of enhanced findings
            
        Returns:
            ReviewReport object with statistics
        """
        # Calculate statistics
        stats = ReportGenerator._calculate_stats(enhanced_findings)
        
        return ReviewReport(
            repo_url=repo_url,
            total_issues=len(enhanced_findings),
            findings=enhanced_findings,
            stats=stats
        )
    
    @staticmethod
    def _calculate_stats(findings: List[EnhancedFinding]) -> Dict:
        """
        Calculate statistics from findings.
        
        Args:
            findings: List of enhanced findings
            
        Returns:
            Dictionary with category and severity breakdowns
        """
        category_counts = ReportGenerator._count_by_category(findings)
        severity_counts = ReportGenerator._count_by_severity(findings)
        file_counts = ReportGenerator._count_by_file(findings)
        
        return {
            'by_category': {
                'security': category_counts[IssueCategory.SECURITY],
                'performance': category_counts[IssueCategory.PERFORMANCE],
                'code_quality': category_counts[IssueCategory.CODE_QUALITY]
            },
            'by_severity': {
                'critical': severity_counts[5],
                'high': severity_counts[4],
                'medium': severity_counts[3],
                'low': severity_counts[2],
                'info': severity_counts[1]
            },
            'by_file': file_counts,
            'total_files_analyzed': len(file_counts)
        }

    @staticmethod
    def _count_by_category(findings: List[EnhancedFinding]) -> Dict[IssueCategory, int]:
        """Count findings by category."""
        counts = {
            IssueCategory.SECURITY: 0,
            IssueCategory.PERFORMANCE: 0,
            IssueCategory.CODE_QUALITY: 0
        }
        for finding in findings:
            counts[finding.category] += 1
        return counts

    @staticmethod
    def _count_by_severity(findings: List[EnhancedFinding]) -> Dict[int, int]:
        """Count findings by severity."""
        counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for finding in findings:
            if 1 <= finding.severity <= 5:
                counts[finding.severity] += 1
        return counts

    @staticmethod
    def _count_by_file(findings: List[EnhancedFinding]) -> Dict[str, int]:
        """Count findings by file."""
        counts = {}
        for finding in findings:
            if finding.file not in counts:
                counts[finding.file] = 0
            counts[finding.file] += 1
        return counts
