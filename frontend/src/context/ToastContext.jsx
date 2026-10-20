import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((options) => {
        // Support both string or object parameter
        const config = typeof options === 'string' 
            ? { message: options, type: 'info' } 
            : { ...options };

        const id = Date.now() + Math.random().toString(36).substring(2, 5);
        const duration = config.duration || 3500;
        const type = config.type || (config.message?.toLowerCase().includes('success') || config.message?.toLowerCase().includes('added') ? 'success' : config.message?.toLowerCase().includes('fail') || config.message?.toLowerCase().includes('error') ? 'error' : 'info');
        const title = config.title || (type === 'success' ? 'Success' : type === 'error' ? 'Notice' : 'Information');

        const newToast = {
            id,
            title,
            message: config.message || '',
            type,
            actionText: config.actionText,
            actionLink: config.actionLink,
            duration,
        };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    // Override window.alert so any browser alert automatically becomes a modern popup
    useEffect(() => {
        const originalAlert = window.alert;
        window.alert = (msg) => {
            const messageStr = String(msg || '');
            const isCart = messageStr.toLowerCase().includes('cart');
            const isSuccess = messageStr.toLowerCase().includes('success') || isCart;
            const isError = messageStr.toLowerCase().includes('error') || messageStr.toLowerCase().includes('fail');

            showToast({
                title: isCart ? 'Added to Cart' : isSuccess ? 'Success' : isError ? 'Error' : 'Notice',
                message: messageStr,
                type: isError ? 'error' : 'success',
                actionText: isCart ? 'View Cart' : null,
                actionLink: isCart ? '/cart' : null,
            });
        };

        return () => {
            window.alert = originalAlert;
        };
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div 
            style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '420px',
                width: 'calc(100% - 48px)',
                pointerEvents: 'none',
            }}
        >
            <style>{`
                @keyframes toastSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes toastProgress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
            ))}
        </div>
    );
};

const ToastItem = ({ toast, onRemove }) => {
    const navigate = useNavigate();

    const isSuccess = toast.type === 'success';
    const isError = toast.type === 'error';

    const accentColor = isSuccess ? '#16a34a' : isError ? '#ef4444' : '#007bff';
    const lightBg = isSuccess ? '#f0fdf4' : isError ? '#fef2f2' : '#f0f9ff';

    return (
        <div
            style={{
                pointerEvents: 'auto',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderLeft: `5px solid ${accentColor}`,
                borderRadius: '12px',
                padding: '16px 18px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Inter', sans-serif",
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                {/* Icon */}
                <div
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: lightBg,
                        color: accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                    }}
                >
                    {isSuccess ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : isError ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingRight: '10px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.2 }}>
                        {toast.title}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                        {toast.message}
                    </div>

                    {toast.actionText && toast.actionLink && (
                        <div style={{ marginTop: '10px' }}>
                            <button
                                onClick={() => {
                                    onRemove();
                                    navigate(toast.actionLink);
                                }}
                                style={{
                                    backgroundColor: accentColor,
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    fontSize: '0.82rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: `0 2px 6px ${accentColor}40`,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                {toast.actionText} →
                            </button>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onRemove}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        outline: 'none',
                    }}
                    title="Dismiss"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Countdown Progress Bar */}
            {toast.duration > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '3px',
                        backgroundColor: accentColor,
                        opacity: 0.35,
                        animation: `toastProgress ${toast.duration}ms linear forwards`,
                    }}
                />
            )}
        </div>
    );
};
