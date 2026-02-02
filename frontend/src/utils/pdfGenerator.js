import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate and download PDF report from review data
 * @param {Object} report - The review report data
 */
export const generatePDFReport = (report) => {
    try {
        const doc = new jsPDF();

        // Set document properties
        doc.setProperties({
            title: 'Code Review Report',
            subject: 'AI-Generated Code Analysis',
            author: 'AI Code Reviewer',
            keywords: 'code review, static analysis, AI',
            creator: 'AI Code Reviewer'
        });

        // Safe data extraction with defaults
        const totalIssues = report.total_issues || 0;
        const stats = report.stats || {};
        const byCat = stats.by_category || {};
        const bySev = stats.by_severity || {};
        const findings = report.findings || [];

        // Add header with logo/title
        doc.setFontSize(24);
        doc.setTextColor(99, 102, 241); // Primary color
        doc.text('AI Code Review Report', 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }), 14, 27);

        // Repository URL
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Repository:', 14, 35);
        doc.setTextColor(99, 102, 241);
        doc.setFont(undefined, 'italic');
        doc.text(report.repo_url || 'N/A', 14, 40);
        doc.setFont(undefined, 'normal');

        // Executive Summary Box
        doc.setDrawColor(99, 102, 241);
        doc.setFillColor(245, 247, 255);
        doc.roundedRect(14, 48, 182, 35, 3, 3, 'FD');

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Executive Summary', 20, 56);

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        doc.text(`Total Issues Found: ${totalIssues}`, 20, 64);
        doc.text(`Security Issues: ${byCat.security || 0}`, 20, 70);
        doc.text(`Performance Issues: ${byCat.performance || 0}`, 80, 70);
        doc.text(`Code Quality Issues: ${byCat.code_quality || 0}`, 140, 70);
        doc.text(`Files Analyzed: ${stats.total_files_analyzed || 0}`, 20, 76);

        // Severity Distribution
        let yPos = 93;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Severity Distribution', 14, yPos);
        yPos += 8;

        const severityData = [
            ['Critical (5)', bySev.critical || 0, [220, 38, 38]],
            ['High (4)', bySev.high || 0, [234, 88, 12]],
            ['Medium (3)', bySev.medium || 0, [245, 158, 11]],
            ['Low (2)', bySev.low || 0, [59, 130, 246]],
            ['Info (1)', bySev.info || 0, [100, 116, 139]]
        ];

        severityData.forEach(([label, count, color]) => {
            if (count > 0) {
                doc.setFillColor(...color);
                doc.circle(20, yPos - 1.5, 2, 'F');
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`${label}: ${count}`, 26, yPos);
                yPos += 6;
            }
        });

        if (findings.length === 0) {
            doc.addPage();
            doc.setFontSize(16);
            doc.setTextColor(16, 185, 129);
            doc.text('No issues found! Your code looks great!', 14, 40);
            doc.save(`code-review-${new Date().getTime()}.pdf`);
            return;
        }

        // Add new page for detailed findings
        doc.addPage();

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Detailed Findings', 14, 20);

        // Create table for findings
        const tableData = findings.map((finding, index) => [
            index + 1,
            finding.file || 'Unknown',
            finding.line || '-',
            finding.category || 'Unknown',
            finding.severity || '-',
            (finding.issue || '').substring(0, 50) + ((finding.issue || '').length > 50 ? '...' : '')
        ]);

        doc.autoTable({
            startY: 28,
            head: [['#', 'File', 'Line', 'Category', 'Severity', 'Issue']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [99, 102, 241],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 40 },
                2: { cellWidth: 15 },
                3: { cellWidth: 25 },
                4: { cellWidth: 20 },
                5: { cellWidth: 80 }
            },
            alternateRowStyles: {
                fillColor: [245, 247, 255]
            }
        });

        // Add detailed findings on subsequent pages
        let currentY = doc.lastAutoTable.finalY + 15;

        findings.forEach((finding, index) => {
            // Check if we need a new page
            if (currentY > 250) {
                doc.addPage();
                currentY = 20;
            }

            // Issue number and title
            doc.setFontSize(12);
            doc.setTextColor(99, 102, 241);
            const issueTitle = `Issue #${index + 1}: ${finding.issue || 'Unknown Issue'}`;
            doc.text(issueTitle, 14, currentY);
            currentY += 7;

            // File and line
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`${finding.file || 'Unknown'}:${finding.line || '?'}`, 14, currentY);
            currentY += 5;

            // Category and Severity badges
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);

            // Category badge
            const categoryColors = {
                'Security': [220, 38, 38],
                'Performance': [245, 158, 11],
                'Code Quality': [59, 130, 246]
            };
            const catColor = categoryColors[finding.category] || [100, 100, 100];
            doc.setFillColor(...catColor);
            doc.roundedRect(14, currentY - 3, 25, 5, 1, 1, 'F');
            doc.text(finding.category || 'Unknown', 15, currentY);

            // Severity badge
            const severity = finding.severity || 1;
            const sevColor = severity >= 5 ? [220, 38, 38] :
                severity >= 4 ? [234, 88, 12] :
                    severity >= 3 ? [245, 158, 11] :
                        severity >= 2 ? [59, 130, 246] : [100, 116, 139];
            doc.setFillColor(...sevColor);
            doc.roundedRect(42, currentY - 3, 28, 5, 1, 1, 'F');
            doc.text(`Severity: ${severity}`, 43, currentY);
            currentY += 8;

            // Explanation
            if (finding.explanation) {
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.text('Explanation:', 14, currentY);
                currentY += 5;
                doc.setFontSize(8);
                doc.setTextColor(60, 60, 60);
                const explanationLines = doc.splitTextToSize(finding.explanation, 180);
                doc.text(explanationLines, 14, currentY);
                currentY += explanationLines.length * 4 + 3;
            }

            // Suggested Fix
            if (finding.suggested_fix) {
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.text('Suggested Fix:', 14, currentY);
                currentY += 5;
                doc.setFontSize(8);
                doc.setTextColor(16, 185, 129);
                const fixLines = doc.splitTextToSize(finding.suggested_fix, 180);
                doc.text(fixLines, 14, currentY);
                currentY += fixLines.length * 4 + 8;
            }

            // Separator
            doc.setDrawColor(200, 200, 200);
            doc.line(14, currentY, 196, currentY);
            currentY += 10;
        });

        // Add footer to all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Page ${i} of ${pageCount} | Generated by AI Code Reviewer`,
                14,
                doc.internal.pageSize.height - 10
            );
        }

        // Save the PDF
        const fileName = `code-review-${new Date().getTime()}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw new Error(`Failed to generate PDF: ${error.message}`);
    }
};

export default generatePDFReport;
