import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';

const Login = ({ initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);
    
    // Login State
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    
    // Signup State
    const [signupData, setSignupData] = useState({
        fullName: '', email: '', phone: '', address: '', state: '', pincode: '', password: '', confirmPassword: ''
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const { loginSuccess } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleSignupChange = (e) => setSignupData({ ...signupData, [e.target.name]: e.target.value });

    const validateSignup = () => {
        const newErrors = {};
        if (!signupData.fullName.trim()) newErrors.fullName = 'Full Name is required';
        if (!signupData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(signupData.email)) newErrors.email = 'Email is invalid';
        
        if (!signupData.phone.trim()) newErrors.phone = 'Phone Number is required';
        else if (!/^\d{10}$/.test(signupData.phone)) newErrors.phone = 'Phone Number must be 10 digits';
        
        if (!signupData.address.trim()) newErrors.address = 'Address is required';
        if (!signupData.state.trim()) newErrors.state = 'State is required';
        
        if (!signupData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(signupData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
        
        if (!signupData.password) newErrors.password = 'Password is required';
        else if (signupData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        
        if (signupData.password !== signupData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', loginData);
            loginSuccess(data.user);
            if (location.state?.autoBuy && (location.state?.fromCar || location.state?.carId)) {
                navigate(`/checkout?carId=${location.state.fromCar || location.state.carId}`);
            } else if (location.state?.redirectTo) {
                navigate(location.state.redirectTo, { state: location.state });
            } else if (location.state?.from) {
                navigate(location.state.from, { state: location.state });
            } else if (location.state?.fromCar) {
                navigate(`/cars/${location.state.fromCar}`, { state: location.state });
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        if (!validateSignup()) return;
        
        setIsLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/register', signupData);
            setSuccessMessage("Account created successfully. Please login.");
            setTimeout(() => {
                setMode('login');
                setSuccessMessage(null);
                setSignupData({ fullName: '', email: '', phone: '', address: '', state: '', pincode: '', password: '', confirmPassword: '' });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelLogin = () => {
        if (location.state?.fromValuation) {
            sessionStorage.removeItem('automart_auto_valuate');
            navigate('/sell-used-cars', {
                state: {
                    ...location.state,
                    autoValuate: false,
                    cancelled: true
                }
            });
            return;
        }

        if (location.state?.redirectTo) {
            navigate(location.state.redirectTo, { state: { ...location.state, autoValuate: false, cancelled: true } });
        } else if (location.state?.from) {
            navigate(location.state.from, { state: { ...location.state, autoValuate: false, cancelled: true } });
        } else {
            navigate(-1);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            {/* LEFT COLUMN - CAR IMAGE */}
            <div style={{ flex: 1, position: 'relative', display: 'none', '@media (min-width: 768px)': { display: 'block' }, overflow: 'hidden' }} className="desktop-only-bg">
                <img 
                    src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2000&auto=format&fit=crop" 
                    alt="AutoMart" 
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)' }}></div>
                
                <div style={{ position: 'relative', zIndex: 1, padding: '60px', color: 'white', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                    <Link to="/" style={{ display: 'inline-block', marginBottom: 'auto' }}>
                        <img src="/logo.png" alt="AutoMart" style={{ height: '44px', backgroundColor: 'black', padding: '5px 10px', borderRadius: '8px' }} />
                    </Link>
                    
                    <div style={{ marginBottom: 'auto', marginTop: 'auto' }}>
                        <h1 style={{ fontSize: '3.5em', fontWeight: '800', lineHeight: 1.1, marginBottom: '20px' }}>AutoMart</h1>
                        <h2 style={{ fontSize: '2em', fontWeight: '400', marginBottom: '20px', color: '#e2e8f0' }}>Find Your Perfect Car</h2>
                        <p style={{ fontSize: '1.1em', opacity: 0.8, maxWidth: '400px', lineHeight: 1.6 }}>
                            Explore premium cars, compare your options and find the car that's right for you.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN - AUTH FORM */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 20px', overflowY: 'auto' }}>
                
                {/* Mobile header / image */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }} className="mobile-only-header">
                    <Link to="/" style={{ display: 'inline-block' }}>
                        <img src="/logo.png" alt="AutoMart" style={{ height: '40px', backgroundColor: 'black', padding: '5px 10px', borderRadius: '8px' }} />
                    </Link>
                </div>

                <div style={{ maxWidth: '450px', width: '100%', margin: 'auto' }}>
                    {/* Back / Cancel button when redirected from valuation or another flow */}
                    {(location.state?.fromValuation || location.state?.redirectTo || location.state?.from) && (
                        <div style={{ marginBottom: '18px' }}>
                            <button
                                type="button"
                                id="cancel-login-btn"
                                onClick={handleCancelLogin}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    padding: '0',
                                    transition: 'color 0.15s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#0284c7'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                            >
                                <ChevronLeft size={16} />
                                <span>{location.state?.fromValuation ? 'Cancel & Return to Car Valuation' : 'Return to Previous Page'}</span>
                            </button>
                        </div>
                    )}
                    {mode === 'login' ? (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <h2 style={{ fontSize: '2.2em', color: '#0f172a', marginBottom: '10px', fontWeight: '800' }}>Welcome Back</h2>
                            <p style={{ color: '#64748b', marginBottom: '30px' }}>Login to your AutoMart account</p>

                            {error && <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #fecaca' }}>{error}</div>}
                            {successMessage && <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #a7f3d0' }}>{successMessage}</div>}

                            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Email Address</label>
                                    <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} required style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '1em' }} placeholder="example@gmail.com" />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPassword ? "text" : "password"} name="password" value={loginData.password} onChange={handleLoginChange} required style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '1em' }} placeholder="••••••••" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                        <Link 
                                            to="/forgot-password" 
                                            id="forgot-password-link"
                                            style={{ color: '#0284c7', fontSize: '0.88em', fontWeight: '600', textDecoration: 'none' }}
                                            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.05em', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'background-color 0.2s', opacity: isLoading ? 0.7 : 1 }}>
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                            <div style={{ marginTop: '30px', textAlign: 'center', color: '#64748b' }}>
                                Don't have an account? <button onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: '700', cursor: 'pointer', fontSize: '1em', padding: 0 }}>Sign Up</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <h2 style={{ fontSize: '2.2em', color: '#0f172a', marginBottom: '10px', fontWeight: '800' }}>Create Account</h2>
                            <p style={{ color: '#64748b', marginBottom: '30px' }}>Join AutoMart to buy your next car</p>

                            {error && <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #fecaca' }}>{error}</div>}

                            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Full Name *</label>
                                    <input type="text" name="fullName" value={signupData.fullName} onChange={handleSignupChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                                    {errors.fullName && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.fullName}</span>}
                                </div>
                                
                                <div className="auth-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Email *</label>
                                        <input type="email" name="email" value={signupData.email} onChange={handleSignupChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                                        {errors.email && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.email}</span>}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Phone Number *</label>
                                        <input type="tel" name="phone" value={signupData.phone} onChange={handleSignupChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                                        {errors.phone && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.phone}</span>}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Address *</label>
                                    <input type="text" name="address" value={signupData.address} onChange={handleSignupChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                                    {errors.address && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.address}</span>}
                                </div>

                                <div className="auth-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>State *</label>
                                        <input type="text" name="state" value={signupData.state} onChange={handleSignupChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                                        {errors.state && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.state}</span>}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Pincode *</label>
                                        <input type="text" name="pincode" value={signupData.pincode} onChange={handleSignupChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                                        {errors.pincode && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.pincode}</span>}
                                    </div>
                                </div>

                                <div className="auth-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Password *</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type={showPassword ? "text" : "password"} name="password" value={signupData.password} onChange={handleSignupChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}>
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.password && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.password}</span>}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Confirm Password *</label>
                                        <input type={showPassword ? "text" : "password"} name="confirmPassword" value={signupData.confirmPassword} onChange={handleSignupChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                                        {errors.confirmPassword && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.confirmPassword}</span>}
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.05em', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'background-color 0.2s', opacity: isLoading ? 0.7 : 1 }}>
                                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </form>

                            <div style={{ marginTop: '25px', textAlign: 'center', color: '#64748b' }}>
                                Already have an account? <button onClick={() => { setMode('login'); setError(null); }} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: '700', cursor: 'pointer', fontSize: '1em', padding: 0 }}>Login</button>
                            </div>
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
                @media (max-width: 500px) {
                    .auth-grid-row {
                        grid-template-columns: 1fr !important;
                        gap: 12px !important;
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Login;
