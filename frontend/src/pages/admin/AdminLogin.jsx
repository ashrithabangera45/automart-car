import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/admin/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            // Trigger a page reload to let AuthContext pick it up correctly, or navigate
            window.location.href = '/admin/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            {/* LEFT COLUMN - CAR IMAGE */}
            <div style={{ flex: 1, position: 'relative', display: 'none', '@media (min-width: 768px)': { display: 'block' }, overflow: 'hidden' }} className="desktop-only-bg">
                <img 
                    src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2000&auto=format&fit=crop" 
                    alt="AutoMart Admin" 
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)' }}></div>
                
                <div style={{ position: 'relative', zIndex: 1, padding: '60px', color: 'white', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                    <Link to="/" style={{ display: 'inline-block', marginBottom: 'auto' }}>
                        <img src="/logo.png" alt="AutoMart" style={{ height: '44px', backgroundColor: 'black', padding: '5px 10px', borderRadius: '8px' }} />
                    </Link>
                    
                    <div style={{ marginBottom: 'auto', marginTop: 'auto' }}>
                        <div style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' }}>ADMINISTRATION</div>
                        <h1 style={{ fontSize: '3.5em', fontWeight: '800', lineHeight: 1.1, marginBottom: '20px' }}>AutoMart</h1>
                        <h2 style={{ fontSize: '2em', fontWeight: '400', marginBottom: '20px', color: '#e2e8f0' }}>Manage the Platform</h2>
                        <p style={{ fontSize: '1.1em', opacity: 0.8, maxWidth: '400px', lineHeight: 1.6 }}>
                            Secure access to manage inventory, track orders, and administer the AutoMart platform.
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
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <h2 style={{ fontSize: '2.2em', color: '#0f172a', marginBottom: '10px', fontWeight: '800' }}>Admin Login</h2>
                        <p style={{ color: '#64748b', marginBottom: '30px' }}>Sign in to your AutoMart Admin Panel</p>

                        {error && <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #fecaca' }}>{error}</div>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Email Address</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '1em' }} placeholder="admin@example.com" />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box', fontSize: '1em' }} placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.05em', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'background-color 0.2s', opacity: isLoading ? 0.7 : 1 }}>
                                {isLoading ? 'Authenticating...' : 'Admin Login'}
                            </button>
                        </form>
                        
                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <Link to="/user/login" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9em' }}>← Back to User Login</Link>
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
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;
