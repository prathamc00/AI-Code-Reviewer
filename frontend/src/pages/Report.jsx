import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IssueCard from '../components/IssueCard';
import StatsOverview from '../components/StatsOverview';
import { generatePDFReport } from '../utils/pdfGenerator';
import './Report.css';

const Report = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const report = location.state?.report;

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSeverity, setSelectedSeverity] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    // Redirect if no report data
    if (!report) {
        navigate('/');
        return null;
    }

    // Filter findings
    const filteredFindings = report.findings.filter((finding) => {
        const categoryMatch = selectedCategory === 'all' || finding.category === selectedCategory;
        const severityMatch = selectedSeverity === 'all' || finding.severity === parseInt(selectedSeverity);
        return categoryMatch && severityMatch;
    });

    // Handle PDF export
    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            await generatePDFReport(report);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report');
        } finally {
            setIsExporting(false);
        }
    };

    // Handle export to JSON
    const handleExportJSON = () => {
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `code-review-${new Date().getTime()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="report-container">
            <div className="container">
                {/* Professional Header */}
                <div className="report-header fade-in">
                    <div className="header-top">
                        <button onClick={() => navigate('/')} className="back-button btn-secondary">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back to Home
                        </button>

                        <div className="header-actions">
                            <button
                                onClick={handleExportJSON}
                                className="btn-secondary"
                                title="Export as JSON"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                JSON
                            </button>

                            <button
                                onClick={handleExportPDF}
                                className="btn-primary"
                                disabled={isExporting}
                                title="Export as PDF"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                </svg>
                                {isExporting ? 'Generating...' : 'Export PDF'}
                            </button>
                        </div>
                    </div>

                    <div className="header-content">
                        <h1 className="report-title">
                            <span className="title-icon">📊</span>
                            Code Review Report
                        </h1>
                        <div className="report-meta">
                            <div className="meta-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="repo-url">{report.repo_url}</span>
                            </div>
                            <div className="meta-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                {report.stats && <StatsOverview stats={report.stats} />}

                {/* No Issues Message */}
                {report.total_issues === 0 ? (
                    <div className="no-issues-card card fade-in">
                        <div className="success-icon">✅</div>
                        <h2>Excellent Code Quality!</h2>
                        <p>No issues found in your code. Your codebase follows best practices for security, performance, and code quality.</p>
                    </div>
                ) : (
                    <>
                        {/* Professional Filters Bar */}
                        <div className="filters-bar card fade-in">
                            <div className="filters-left">
                                <div className="filter-group">
                                    <label htmlFor="category-filter">
                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        Category
                                    </label>
                                    <select
                                        id="category-filter"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="Security">🔒 Security</option>
                                        <option value="Performance">⚡ Performance</option>
                                        <option value="Code Quality">✨ Code Quality</option>
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label htmlFor="severity-filter">
                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Severity
                                    </label>
                                    <select
                                        id="severity-filter"
                                        value={selectedSeverity}
                                        onChange={(e) => setSelectedSeverity(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="all">All Severities</option>
                                        <option value="5">🔴 Critical (5)</option>
                                        <option value="4">🟠 High (4)</option>
                                        <option value="3">🟡 Medium (3)</option>
                                        <option value="2">🔵 Low (2)</option>
                                        <option value="1">⚪ Info (1)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="results-badge">
                                <span className="results-count">{filteredFindings.length}</span>
                                <span className="results-label">of {report.total_issues} issues</span>
                            </div>
                        </div>

                        {/* Issues List */}
                        <div className="issues-section">
                            <div className="section-header">
                                <h2>Detailed Findings</h2>
                                <span className="section-subtitle">Review each issue with AI-generated explanations and fixes</span>
                            </div>

                            <div className="issues-list">
                                {filteredFindings.length > 0 ? (
                                    filteredFindings.map((finding, index) => (
                                        <IssueCard key={index} finding={finding} index={index + 1} />
                                    ))
                                ) : (
                                    <div className="no-results card">
                                        <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                        <p>No issues match the selected filters.</p>
                                        <button onClick={() => { setSelectedCategory('all'); setSelectedSeverity('all'); }} className="btn-secondary">
                                            Clear Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Report;
