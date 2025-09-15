// src/components/ErrorBoundary.js - Enhanced error handling
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h2>Oops! Something went wrong</h2>
                        <p>We're sorry, but something unexpected happened.</p>
                        
                        <div className="error-actions">
                            <button 
                                className="btn-primary"
                                onClick={() => window.location.reload()}
                            >
                                🔄 Reload Page
                            </button>
                            <button 
                                className="btn-secondary"
                                onClick={() => window.history.back()}
                            >
                                ← Go Back
                            </button>
                        </div>
                        
                        {process.env.NODE_ENV === 'development' && (
                            <details className="error-details">
                                <summary>Error Details (Development)</summary>
                                <pre>{this.state.error && this.state.error.toString()}</pre>
                                <pre>{this.state.errorInfo.componentStack}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
