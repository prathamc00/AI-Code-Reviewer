import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ status = 'Analyzing code...' }) => {
    return (
        <div className="loading-container fade-in">
            <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">{status}</p>
            <div className="loading-steps">
                <div className="step pulse">Fetching code from GitHub...</div>
                <div className="step pulse">Running static analysis...</div>
                <div className="step pulse">Enhancing with AI...</div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
