import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ChevronLeft, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    // Token verification state
    const [tokenStatus, setTokenStatus] = useState('validating'); // 'validating' | 'valid' | 'invalid'
    const [tokenError, setTokenError] = useState('');

    // Form state
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);

    // Verify token validity on initial mount
    useEffect(() => {
        let isMounted = true;

        const verifyToken = async () => {
            if (!token) {
                setTokenStatus('invalid');
                setTokenError('Password reset token is missing from the link.');
                return;
            }

            try {
                await axios.get(`http://localhost:5000/api/auth/reset-password/${token}`);
                if (isMounted) {
                    setTokenStatus('valid');
                }
            } catch (err) {
                if (isMounted) {
                    setTokenStatus('invalid');
                    setTokenError(
                        err.response?.data?.message || 
                        'This password reset link is invalid, expired, or has already been used.'
                    );
                }
            }
        };

        verifyToken();

        return () => {
            isMounted = false;
        };
    }, [token]);

    // Redirect countdown after successful password reset
    useEffect(() => {
        if (!isSuccess) return;

        if (countdown <= 0) {
            navigate('/user/login');
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [isSuccess, countdown, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters long';
        }

        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm your new password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword
            });

            setIsSuccess(true);
        } catch (err) {
            setApiError(
                err.response?.data?.message || 
                'Failed to reset password. The link may have expired or was already used.'
            );
        } finally {
            setIsSubmitting(false);
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
                        <h2 style={{ fontSize: '2em', fontWeight: '400', marginBottom: '20px', color: '#e2e8f0' }}>Secure Reset</h2>
                        <p style={{ fontSize: '1.1em', opacity: 0.85, maxWidth: '420px', lineHeight: 1.6 }}>
                            Choose a strong, memorable password to secure your personal account and car transactions.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN - RESET FORM */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px', overflowY: 'auto' }}>
                
                {/* Mobile Header / Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }} className="mobile-only-header">
                    <Link to="/" style={{ display: 'inline-block' }}>
                        <img src="/logo.png" alt="AutoMart" style={{ height: '40px', backgroundColor: 'black', padding: '5px 10px', borderRadius: '8px' }} />
                    </Link>
                </div>

                <div style={{ maxWidth: '450px', width: '100%', margin: 'auto' }}>
                    
                    {/* Back to Login Link */}
                    <div style={{ marginBottom: '24px' }}>
                        <Link 
                            to="/user/login"
                            id="reset-back-to-login-link"
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

                    {/* STATE 1: VALIDATING TOKEN */}
                    {tokenStatus === 'validating' && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', animation: 'fadeIn 0.3s ease-out' }}>
                            <div className="spinner" style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }}></div>
                            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '8px', fontWeight: '700' }}>
                                Verifying Reset Link...
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                                Please wait while we authenticate your secure reset token.
                            </p>
                        </div>
                    )}

                    {/* STATE 2: INVALID OR EXPIRED TOKEN */}
                    {tokenStatus === 'invalid' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                <AlertCircle size={28} />
                            </div>

                            <h2 style={{ fontSize: '2em', color: '#0f172a', marginBottom: '12px', fontWeight: '800' }}>
                                Invalid or Expired Link
                            </h2>
                            <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '0.96rem', lineHeight: '1.5' }}>
                                {tokenError || 'This password reset link is invalid, expired, or has already been used.'}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Link 
                                    to="/forgot-password"
                                    id="request-new-link-btn"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        width: '100%',
                                        padding: '14px',
                                        backgroundColor: '#0284c7',
                                        color: '#ffffff',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: '700',
                                        fontSize: '1rem',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <KeyRound size={18} />
                                    <span>Request a New Reset Link</span>
                                </Link>

                                <Link 
                                    to="/user/login"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#f1f5f9',
                                        color: '#334155',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    Return to Login
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* STATE 3: TOKEN IS VALID - SHOW RESET FORM OR SUCCESS */}
                    {tokenStatus === 'valid' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            {isSuccess ? (
                                <div 
                                    id="reset-password-success-card"
                                    style={{
                                        backgroundColor: '#ecfdf5',
                                        border: '1px solid #a7f3d0',
                                        borderRadius: '12px',
                                        padding: '28px 24px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h2 style={{ fontSize: '1.8em', color: '#065f46', marginBottom: '10px', fontWeight: '800' }}>
                                        Password Reset Successful!
                                    </h2>
                                    <p style={{ color: '#047857', fontSize: '0.96rem', lineHeight: '1.5', margin: '0 0 20px' }}>
                                        Your password has been securely updated. You can now log in using your new credentials.
                                    </p>

                                    <div style={{ fontSize: '0.88rem', color: '#065f46', marginBottom: '24px', fontWeight: '500' }}>
                                        Redirecting to login in <strong>{countdown}</strong> seconds...
                                    </div>

                                    <Link 
                                        to="/user/login"
                                        id="go-to-login-btn"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            padding: '14px',
                                            backgroundColor: '#059669',
                                            color: '#ffffff',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            fontWeight: '700',
                                            fontSize: '1rem',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <span>Login with New Password</span>
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                        <Lock size={24} />
                                    </div>

                                    <h2 style={{ fontSize: '2.2em', color: '#0f172a', marginBottom: '8px', fontWeight: '800' }}>
                                        Reset Your Password
                                    </h2>
                                    <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '0.96rem', lineHeight: '1.5' }}>
                                        Please create a new, strong password for your AutoMart account.
                                    </p>

                                    {/* Error Message */}
                                    {apiError && (
                                        <div 
                                            id="reset-password-error-alert"
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
                                                fontSize: '0.92rem'
                                            }}
                                        >
                                            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <div>{apiError}</div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* New Password Field */}
                                        <div>
                                            <label 
                                                htmlFor="new-password" 
                                                style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}
                                            >
                                                New Password
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <input 
                                                    id="new-password"
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    name="newPassword" 
                                                    value={passwordData.newPassword} 
                                                    onChange={handleChange} 
                                                    required 
                                                    placeholder="At least 6 characters" 
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '14px 44px 14px 16px', 
                                                        borderRadius: '8px', 
                                                        border: errors.newPassword ? '1px solid #ef4444' : '1px solid #cbd5e1', 
                                                        backgroundColor: '#fff', 
                                                        outline: 'none', 
                                                        boxSizing: 'border-box', 
                                                        fontSize: '1em' 
                                                    }} 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowNewPassword(!showNewPassword)} 
                                                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                                                    aria-label="Toggle password visibility"
                                                >
                                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            {errors.newPassword && (
                                                <span style={{ color: '#dc2626', fontSize: '0.84em', marginTop: '6px', display: 'block' }}>
                                                    {errors.newPassword}
                                                </span>
                                            )}
                                        </div>

                                        {/* Confirm New Password Field */}
                                        <div>
                                            <label 
                                                htmlFor="confirm-password" 
                                                style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}
                                            >
                                                Confirm New Password
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <input 
                                                    id="confirm-password"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    name="confirmPassword" 
                                                    value={passwordData.confirmPassword} 
                                                    onChange={handleChange} 
                                                    required 
                                                    placeholder="Re-enter your new password" 
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '14px 44px 14px 16px', 
                                                        borderRadius: '8px', 
                                                        border: errors.confirmPassword ? '1px solid #ef4444' : '1px solid #cbd5e1', 
                                                        backgroundColor: '#fff', 
                                                        outline: 'none', 
                                                        boxSizing: 'border-box', 
                                                        fontSize: '1em' 
                                                    }} 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                                                    aria-label="Toggle confirm password visibility"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <span style={{ color: '#dc2626', fontSize: '0.84em', marginTop: '6px', display: 'block' }}>
                                                    {errors.confirmPassword}
                                                </span>
                                            )}
                                        </div>

                                        {/* Password requirements hint */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '10px 12px', borderRadius: '6px' }}>
                                            <ShieldCheck size={16} color="#0284c7" />
                                            <span>Password must contain at least 6 characters.</span>
                                        </div>

                                        {/* Submit Button */}
                                        <button 
                                            type="submit" 
                                            id="reset-password-submit-btn"
                                            disabled={isSubmitting} 
                                            style={{ 
                                                width: '100%', 
                                                padding: '14px', 
                                                backgroundColor: '#0284c7', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: '8px', 
                                                fontSize: '1.05em', 
                                                fontWeight: '700', 
                                                cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                                                marginTop: '6px', 
                                                transition: 'background-color 0.2s, opacity 0.2s', 
                                                opacity: isSubmitting ? 0.75 : 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
                                                    <span>Resetting Password...</span>
                                                </>
                                            ) : (
                                                'Reset Password'
                                            )}
                                        </button>
                                    </form>

                                    <div style={{ marginTop: '30px', textAlign: 'center', color: '#64748b' }}>
                                        Remember your password?{' '}
                                        <Link 
                                            to="/user/login" 
                                            style={{ color: '#0284c7', fontWeight: '700', textDecoration: 'none' }}
                                            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                                        >
                                            Login
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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

export default ResetPassword;
