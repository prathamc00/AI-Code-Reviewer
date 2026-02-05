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
        const totalIssues = report?.total_issues || 0;
        const stats = report?.stats || {};
        const byCat = stats.by_category || {};
        const bySev = stats.by_severity || {};
        const findings = report?.findings || [];
        const repoUrl = report?.repo_url || 'N/A';

        // Colors
        const primaryColor = [124, 58, 237]; // Purple
        const accentColor = [34, 211, 238]; // Cyan
        const successColor = [34, 197, 94]; // Green

        // Add header with gradient-like effect
        doc.setFillColor(124, 58, 237);
        doc.rect(0, 0, 220, 35, 'F');

        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text('AI Code Review Report', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(200, 200, 255);
        doc.text(new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }), 14, 30);

        // Repository URL
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text('Repository:', 14, 45);
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, 'italic');

        // Truncate long URLs
        const displayUrl = repoUrl.length > 70 ? repoUrl.substring(0, 67) + '...' : repoUrl;
        doc.text(displayUrl, 14, 51);
        doc.setFont(undefined, 'normal');

        // Executive Summary Box
        doc.setDrawColor(...primaryColor);
        doc.setFillColor(245, 243, 255);
        doc.roundedRect(14, 58, 182, 38, 3, 3, 'FD');

        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text('Executive Summary', 20, 68);

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        doc.text(`Total Issues Found: ${totalIssues}`, 20, 77);
        doc.text(`Security Issues: ${byCat.security || 0}`, 20, 84);
        doc.text(`Performance Issues: ${byCat.performance || 0}`, 80, 84);
        doc.text(`Code Quality Issues: ${byCat.code_quality || 0}`, 140, 84);
        doc.text(`Files Analyzed: ${stats.total_files_analyzed || 0}`, 20, 91);

        // Severity Distribution
        let yPos = 107;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Severity Distribution', 14, yPos);
        yPos += 10;

        const severityData = [
            ['Critical', bySev.critical || 0, [220, 38, 38]],
            ['High', bySev.high || 0, [234, 88, 12]],
            ['Medium', bySev.medium || 0, [234, 179, 8]],
            ['Low', bySev.low || 0, [59, 130, 246]],
            ['Info', bySev.info || 0, [100, 116, 139]]
        ];

        severityData.forEach(([label, count, color]) => {
            doc.setFillColor(...color);
            doc.circle(20, yPos - 1.5, 3, 'F');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`${label}: ${count}`, 28, yPos);
            yPos += 7;
        });

        // If no findings, show success message
        if (findings.length === 0) {
            doc.addPage();
            doc.setFillColor(...successColor);
            doc.rect(0, 0, 220, 100, 'F');
            doc.setFontSize(20);
            doc.setTextColor(255, 255, 255);
            doc.text('No issues found!', 14, 40);
            doc.setFontSize(14);
            doc.text('Your code looks great!', 14, 55);
            doc.save(`code-review-${Date.now()}.pdf`);
            return;
        }

        // Add new page for detailed findings
        doc.addPage();

        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 220, 25, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('Detailed Findings', 14, 16);

        // Create table for findings
        const tableData = findings.map((finding, index) => {
            const issue = finding?.issue || 'Unknown Issue';
            const file = finding?.file || 'Unknown';
            const line = finding?.line || '-';
            const category = finding?.category || 'Unknown';
            const severity = finding?.severity || '-';

            return [
                index + 1,
                file.length > 25 ? file.substring(0, 22) + '...' : file,
                line,
                category,
                severity,
                issue.length > 40 ? issue.substring(0, 37) + '...' : issue
            ];
        });

        doc.autoTable({
            startY: 32,
            head: [['#', 'File', 'Line', 'Category', 'Sev', 'Issue']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 35 },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 25 },
                4: { cellWidth: 12, halign: 'center' },
                5: { cellWidth: 85 }
            },
            alternateRowStyles: {
                fillColor: [250, 248, 255]
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
            doc.setTextColor(...primaryColor);
            const issue = finding?.issue || 'Unknown Issue';
            const issueTitle = `Issue #${index + 1}: ${issue.substring(0, 60)}${issue.length > 60 ? '...' : ''}`;
            doc.text(issueTitle, 14, currentY);
            currentY += 7;

            // File and line
            const file = finding?.file || 'Unknown';
            const line = finding?.line || '?';
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`${file}:${line}`, 14, currentY);
            currentY += 6;

            // Category and Severity badges
            const category = finding?.category || 'Unknown';
            const severity = finding?.severity || 1;

            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);

            // Category badge
            const categoryColors = {
                'Security': [220, 38, 38],
                'Performance': [234, 179, 8],
                'Code Quality': [59, 130, 246]
            };
            const catColor = categoryColors[category] || [100, 100, 100];
            doc.setFillColor(...catColor);
            doc.roundedRect(14, currentY - 3.5, 28, 6, 1, 1, 'F');
            doc.text(category.substring(0, 12), 16, currentY);

            // Severity badge
            const sevColor = severity >= 5 ? [220, 38, 38] :
                severity >= 4 ? [234, 88, 12] :
                    severity >= 3 ? [234, 179, 8] :
                        severity >= 2 ? [59, 130, 246] : [100, 116, 139];
            doc.setFillColor(...sevColor);
            doc.roundedRect(46, currentY - 3.5, 22, 6, 1, 1, 'F');
            doc.text(`Sev: ${severity}`, 48, currentY);
            currentY += 10;

            // Explanation
            if (finding?.explanation) {
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.text('Explanation:', 14, currentY);
                currentY += 5;
                doc.setFontSize(8);
                doc.setTextColor(60, 60, 60);
                const explanationLines = doc.splitTextToSize(finding.explanation, 180);
                const maxLines = Math.min(explanationLines.length, 4);
                doc.text(explanationLines.slice(0, maxLines), 14, currentY);
                currentY += maxLines * 4 + 3;
            }

            // Suggested Fix
            if (finding?.suggested_fix) {
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.text('Suggested Fix:', 14, currentY);
                currentY += 5;
                doc.setFontSize(8);
                doc.setTextColor(...successColor);
                const fixLines = doc.splitTextToSize(finding.suggested_fix, 180);
                const maxFixLines = Math.min(fixLines.length, 3);
                doc.text(fixLines.slice(0, maxFixLines), 14, currentY);
                currentY += maxFixLines * 4 + 8;
            }

            // Separator
            doc.setDrawColor(220, 220, 220);
            doc.line(14, currentY, 196, currentY);
            currentY += 12;
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
        const fileName = `code-review-${Date.now()}.pdf`;
        doc.save(fileName);

        console.log('PDF generated successfully:', fileName);
        return fileName;

    } catch (error) {
        console.error('PDF Generation Error:', error);
        console.error('Error details:', error.message, error.stack);
        throw new Error(`Failed to generate PDF: ${error.message}`);
    }
};

export default generatePDFReport;
