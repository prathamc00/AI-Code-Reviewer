import React, { useState } from 'react';
import SeverityBadge from './SeverityBadge';
import './IssueCard.css';

const IssueCard = ({ finding, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getCategoryBadgeClass = (category) => {
        switch (category) {
            case 'Security':
                return 'badge-security';
            case 'Performance':
                return 'badge-performance';
            case 'Code Quality':
                return 'badge-quality';
            default:
                return 'badge-info';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Security':
                return '🔒';
            case 'Performance':
                return '⚡';
            case 'Code Quality':
                return '✨';
            default:
                return '📋';
        }
    };

    return (
        <div className={`issue-card card fade-in ${isExpanded ? 'expanded' : ''}`}>
            <div className="issue-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="issue-number">#{index}</div>

                <div className="issue-header-content">
                    <div className="issue-title-row">
                        <h3 className="issue-title">{finding.issue}</h3>
                        <button className="expand-button" aria-label={isExpanded ? "Collapse" : "Expand"}>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                            >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div className="issue-meta">
                        <div className="issue-badges">
                            <span className={`badge badge-category ${getCategoryBadgeClass(finding.category)}`}>
                                <span className="badge-icon">{getCategoryIcon(finding.category)}</span>
                                {finding.category}
                            </span>
                            <SeverityBadge severity={finding.severity} />
                        </div>

                        <div className="issue-location">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <span className="file-name">{finding.file}</span>
                            <span className="line-separator">:</span>
                            <span className="line-number">L{finding.line}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="issue-body">
                    <div className="code-section">
                        <div className="section-label">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Code Snippet
                        </div>
                        <pre className="code-block"><code>{finding.code_snippet}</code></pre>
                    </div>

                    {finding.context && (
                        <div className="code-section">
                            <div className="section-label">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Context
                            </div>
                            <pre className="code-block context"><code>{finding.context}</code></pre>
                        </div>
                    )}

                    <div className="explanation-section">
                        <div className="section-label">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            Why is this a problem?
                        </div>
                        <p className="explanation-text">{finding.explanation}</p>
                    </div>

                    <div className="fix-section">
                        <div className="section-label">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Recommended Fix
                        </div>
                        <p className="fix-text">{finding.suggested_fix}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueCard;
