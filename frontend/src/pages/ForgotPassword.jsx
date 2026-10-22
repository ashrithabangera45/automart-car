import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [apiError, setApiError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = () => {
        if (!email.trim()) {
            setEmailError('Email address is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email.trim())) {
            setEmailError('Please enter a valid email address (e.g. user@example.com)');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        setSuccessMessage(null);

        if (!validateEmail()) return;

        setIsLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        try {
            const response = await axios.post(`${API_URL}/auth/forgot-password`, {
                email: email.trim()
            }, {
                timeout: 12000
            });

            setSuccessMessage(response.data?.message || 'If an account exists with this email address, a password reset link has been sent.');
        } catch (err) {
            setApiError(err.response?.data?.message || 'Unable to process your request. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            {/* LEFT COLUMN - CAR IMAGE & BRANDING */}
            <div style={{ flex: 1, position: 'relative', display: 'none', overflow: 'hidden' }} className="desktop-only-bg">
                <img 
                    src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2000&auto=format&fit=crop" 
                    alt="AutoMart Cars" 
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.72)' }}></div>
                
                <div style={{ position: 'relative', zIndex: 1, padding: '60px', color: 'white', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                    <Link to="/" style={{ display: 'inline-block', marginBottom: 'auto' }}>
                        <img src="/logo.png" alt="AutoMart" style={{ height: '44px', backgroundColor: 'black', padding: '5px 10px', borderRadius: '8px' }} />
                    </Link>
                    
                    <div style={{ marginBottom: 'auto', marginTop: 'auto' }}>
                        <h1 style={{ fontSize: '3.5em', fontWeight: '800', lineHeight: 1.1, marginBottom: '20px' }}>AutoMart</h1>
                        <h2 style={{ fontSize: '2em', fontWeight: '400', marginBottom: '20px', color: '#e2e8f0' }}>Account Recovery</h2>
                        <p style={{ fontSize: '1.1em', opacity: 0.85, maxWidth: '420px', lineHeight: 1.6 }}>
                            Quickly regain access to your AutoMart account to manage your car bookings, wishlist, and exclusive automotive deals.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN - FORGOT PASSWORD FORM */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px', overflowY: 'auto' }}>
                
                {/* Mobile Header / Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }} className="mobile-only-header">
                    <Link to="/" style={{ display: 'inline-block' }}>
                        <img src="/logo.png" alt="AutoMart" style={{ height: '40px', backgroundColor: 'black', padding: '5px 10px', borderRadius: '8px' }} />
                    </Link>
                </div>

                <div style={{ maxWidth: '450px', width: '100%', margin: 'auto' }}>
                    
                    {/* Back to Login Button */}
                    <div style={{ marginBottom: '24px' }}>
                        <Link 
                            to="/user/login"
                            id="back-to-login-top-link"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#64748b',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                transition: 'color 0.15s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#0284c7'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                        >
                            <ChevronLeft size={18} />
                            <span>Back to Login</span>
                        </Link>
                    </div>

                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <Mail size={24} />
                        </div>

                        <h2 style={{ fontSize: '2.2em', color: '#0f172a', marginBottom: '8px', fontWeight: '800' }}>
                            Forgot Your Password?
                        </h2>
                        <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '0.97rem', lineHeight: '1.5' }}>
                            Enter your registered email address below, and we'll send you a secure link to reset your password.
                        </p>

                        {/* Error Message Alert */}
                        {apiError && (
                            <div 
                                id="forgot-password-error-alert"
                                style={{ 
                                    backgroundColor: '#fef2f2', 
                                    color: '#991b1b', 
                                    padding: '14px 16px', 
                                    borderRadius: '8px', 
                                    marginBottom: '24px', 
                                    border: '1px solid #fecaca',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    fontSize: '0.92rem',
                                    lineHeight: '1.4'
                                }}
                            >
                                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>{apiError}</div>
                            </div>
                        )}

                        {/* Success Message Alert */}
                        {successMessage ? (
                            <div 
                                id="forgot-password-success-alert"
                                style={{ 
                                    backgroundColor: '#ecfdf5', 
                                    color: '#065f46', 
                                    padding: '20px', 
                                    borderRadius: '10px', 
                                    marginBottom: '28px', 
                                    border: '1px solid #a7f3d0' 
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontWeight: '700', fontSize: '1.05rem' }}>
                                    <CheckCircle2 size={22} color="#059669" />
                                    <span>Reset Request Processed</span>
                                </div>
                                <p style={{ margin: '0 0 14px', fontSize: '0.94rem', lineHeight: '1.5', color: '#047857' }}>
                                    {successMessage}
                                </p>
                                <div style={{ fontSize: '0.85rem', color: '#065f46', opacity: 0.9, lineHeight: '1.4' }}>
                                    The secure password reset link remains valid for 15 minutes.
                                </div>

                                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => { setSuccessMessage(null); }}
                                        style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                                    >
                                        Try another email
                                    </button>
                                    <Link 
                                        to="/user/login" 
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#065f46', fontSize: '0.88rem', fontWeight: '700', textDecoration: 'none' }}
                                    >
                                        Return to Login <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label 
                                        htmlFor="email-input" 
                                        style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}
                                    >
                                        Registered Email Address
                                    </label>
                                    <input 
                                        id="email-input"
                                        type="email" 
                                        name="email" 
                                        value={email} 
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError('');
                                        }} 
                                        required 
                                        placeholder="e.g. yourname@example.com" 
                                        style={{ 
                                            width: '100%', 
                                            padding: '14px 16px', 
                                            borderRadius: '8px', 
                                            border: emailError ? '1px solid #ef4444' : '1px solid #cbd5e1', 
                                            backgroundColor: '#fff', 
                                            outline: 'none', 
                                            boxSizing: 'border-box', 
                                            fontSize: '1em',
                                            transition: 'border-color 0.2s'
                                        }} 
                                    />
                                    {emailError && (
                                        <span style={{ color: '#dc2626', fontSize: '0.84em', marginTop: '6px', display: 'block' }}>
                                            {emailError}
                                        </span>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    id="send-reset-btn"
                                    disabled={isLoading} 
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        backgroundColor: '#0284c7', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        fontSize: '1.05em', 
                                        fontWeight: '700', 
                                        cursor: isLoading ? 'not-allowed' : 'pointer', 
                                        marginTop: '6px', 
                                        transition: 'background-color 0.2s, opacity 0.2s', 
                                        opacity: isLoading ? 0.75 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
                                            <span>Sending Reset Link...</span>
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        )}

                        <div style={{ marginTop: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
                            Remember your password?{' '}
                            <Link 
                                to="/user/login" 
                                id="back-to-login-bottom-link"
                                style={{ color: '#0284c7', fontWeight: '700', textDecoration: 'none' }}
                                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .desktop-only-bg { display: block !important; }
                    .mobile-only-header { display: none !important; }
                }
                @media (max-width: 767px) {
                    .desktop-only-bg { display: none !important; }
                    .mobile-only-header { display: flex !important; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
