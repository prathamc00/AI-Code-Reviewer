import React from 'react';

const SeverityBadge = ({ severity }) => {
    const getSeverityClass = (level) => {
        if (level >= 5) return 'badge-critical';
        if (level >= 4) return 'badge-high';
        if (level >= 3) return 'badge-medium';
        if (level >= 2) return 'badge-low';
        return 'badge-info';
    };

    const getSeverityLabel = (level) => {
        if (level >= 5) return 'Critical';
        if (level >= 4) return 'High';
        if (level >= 3) return 'Medium';
        if (level >= 2) return 'Low';
        return 'Info';
    };

    return (
        <span className={`badge ${getSeverityClass(severity)}`}>
            {getSeverityLabel(severity)}
        </span>
    );
};

export default SeverityBadge;
