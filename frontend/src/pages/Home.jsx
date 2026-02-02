import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewCode } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Home.css';

const Home = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const report = await reviewCode(url);
            navigate('/report', { state: { report } });
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to analyze code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="home-container">
            <div className="container">
                {/* Professional Hero Section */}
                <section className="hero-section fade-in">
                    <div className="hero-badge">
                        <span className="hero-badge-icon">🚀</span>
                        <span>AI-Powered Code Analysis</span>
                    </div>

                    <h1 className="hero-title">
                        Elevate Your Code Quality with
                        <span className="text-gradient"> AI Intelligence</span>
                    </h1>

                    <p className="hero-description">
                        Professional code review powered by advanced static analysis and GPT-4.
                        Detect security vulnerabilities, performance bottlenecks, and code quality issues instantly.
                    </p>

                    {/* Review Form */}
                    <form onSubmit={handleSubmit} className="review-form card">
                        <div className="form-header">
                            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Enter Repository URL</span>
                        </div>

                        <div className="form-group">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://github.com/owner/repository"
                                required
                                className="url-input"
                            />
                            <div className="input-hint">
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Supports GitHub repositories and pull requests
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <button type="submit" className="analyze-button btn-primary" disabled={!url || loading}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            Start Analysis
                        </button>
                    </form>
                </section>

                {/* Features Grid */}
                <section className="features-section">
                    <div className="section-header">
                        <h2 className="section-title">Comprehensive Code Analysis</h2>
                        <p className="section-subtitle">Three-pillar approach to ensuring code excellence</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card card slide-in">
                            <div className="feature-icon security-icon">
                                <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3>Security Analysis</h3>
                            <p>Detect vulnerabilities including SQL injection, hardcoded secrets, dangerous functions, and command injection risks.</p>
                            <div className="feature-stats">
                                <div className="stat-item">
                                    <span className="stat-value">10+</span>
                                    <span className="stat-label">Security Checks</span>
                                </div>
                            </div>
                        </div>

                        <div className="feature-card card slide-in" style={{ animationDelay: '0.1s' }}>
                            <div className="feature-icon performance-icon">
                                <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3>Performance Review</h3>
                            <p>Identify bottlenecks like nested loops, inefficient operations, and blocking I/O calls that slow down your application.</p>
                            <div className="feature-stats">
                                <div className="stat-item">
                                    <span className="stat-value">5+</span>
                                    <span className="stat-label">Performance Patterns</span>
                                </div>
                            </div>
                        </div>

                        <div className="feature-card card slide-in" style={{ animationDelay: '0.2s' }}>
                            <div className="feature-icon quality-icon">
                                <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <h3>Code Quality</h3>
                            <p>Enforce best practices with checks for documentation, naming conventions, complexity, and maintainability standards.</p>
                            <div className="feature-stats">
                                <div className="stat-item">
                                    <span className="stat-value">8+</span>
                                    <span className="stat-label">Quality Metrics</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="how-it-works-section">
                    <div className="section-header">
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-subtitle">Fast, accurate, and AI-enhanced analysis in four simple steps</p>
                    </div>

                    <div className="steps-container">
                        <div className="step-card card">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h4>Connect Repository</h4>
                                <p>Enter your GitHub repository or pull request URL</p>
                            </div>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step-card card">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h4>Static Analysis</h4>
                                <p>AST-based parsing detects patterns and issues</p>
                            </div>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step-card card">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h4>AI Enhancement</h4>
                                <p>GPT-4 explains issues and suggests fixes</p>
                            </div>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step-card card">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h4>Download Report</h4>
                                <p>Export comprehensive PDF or JSON report</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section card">
                    <div className="cta-content">
                        <h2>Ready to Improve Your Code Quality?</h2>
                        <p>Start analyzing your repositories with AI-powered insights</p>
                        <button onClick={() => document.querySelector('.url-input').focus()} className="btn-primary">
                            Get Started Now
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
