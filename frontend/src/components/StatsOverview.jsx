import React from 'react';
import './StatsOverview.css';

const StatsOverview = ({ stats }) => {
    return (
        <div className="stats-overview fade-in">
            <div className="stat-card glass">
                <div className="stat-icon">🔍</div>
                <div className="stat-content">
                    <div className="stat-value">{stats.by_category.security}</div>
                    <div className="stat-label">Security Issues</div>
                </div>
            </div>

            <div className="stat-card glass">
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                    <div className="stat-value">{stats.by_category.performance}</div>
                    <div className="stat-label">Performance Issues</div>
                </div>
            </div>

            <div className="stat-card glass">
                <div className="stat-icon">✨</div>
                <div className="stat-content">
                    <div className="stat-value">{stats.by_category.code_quality}</div>
                    <div className="stat-label">Quality Issues</div>
                </div>
            </div>

            <div className="stat-card glass">
                <div className="stat-icon">📁</div>
                <div className="stat-content">
                    <div className="stat-value">{stats.total_files_analyzed}</div>
                    <div className="stat-label">Files Analyzed</div>
                </div>
            </div>
        </div>
    );
};

export default StatsOverview;
