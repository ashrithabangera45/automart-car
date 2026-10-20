import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    fontFamily: "'Inter', sans-serif",
                    padding: '20px'
                }}>
                    <div style={{
                        maxWidth: '600px',
                        width: '100%',
                        backgroundColor: '#1e293b',
                        padding: '30px',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                    }}>
                        <h2 style={{ color: '#ef4444', marginTop: 0 }}>Something went wrong</h2>
                        <p style={{ color: '#94a3b8' }}>
                            An unexpected error occurred while rendering this page:
                        </p>
                        <pre style={{
                            backgroundColor: '#0b1120',
                            padding: '15px',
                            borderRadius: '8px',
                            color: '#fca5a5',
                            overflowX: 'auto',
                            fontSize: '0.85em',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {this.state.error?.toString()}
                        </pre>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '10px 18px',
                                    backgroundColor: '#3b82f6',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('user');
                                    window.location.href = '/admin/login';
                                }}
                                style={{
                                    padding: '10px 18px',
                                    backgroundColor: '#475569',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Re-login as Admin
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
