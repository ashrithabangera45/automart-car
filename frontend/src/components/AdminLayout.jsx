import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, PlusCircle, Car, Users, ClipboardList, 
    LogOut, ChevronDown, User, MessageSquare, Mail, Menu, X, Star
} from 'lucide-react';

const AdminLayout = () => {
    const { logout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.body.className = 'admin-body';
        return () => { document.body.className = ''; };
    }, []);

    // Auto-close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path;

    const sidebarLinkStyle = (active) => ({
        display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 20px',
        color: active ? '#fff' : '#cbd5e1', backgroundColor: active ? '#3b82f6' : 'transparent',
        textDecoration: 'none', fontSize: '0.95em', transition: '0.2s', borderRadius: '8px',
        margin: '2px 10px'
    });

    return (
        <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'transparent', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .admin-sidebar {
                    width: 250px;
                    background-color: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(12px);
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    z-index: 1000;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .admin-mobile-backdrop {
                    display: none;
                }
                .admin-menu-toggle {
                    display: none;
                    background: transparent;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 6px;
                }
                .admin-main-wrap {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    height: 100vh;
                    overflow: hidden;
                }
                .admin-top-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    background-color: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255,255,255,0.2);
                    gap: 12px;
                }
                .admin-outlet-wrap {
                    padding: 12px 24px 24px 24px;
                    overflow-y: auto;
                    flex: 1;
                }

                @media (max-width: 1023px) {
                    .admin-menu-toggle {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .admin-sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        bottom: 0;
                        width: 280px;
                        max-width: 85vw;
                        transform: translateX(-100%);
                        box-shadow: 4px 0 24px rgba(0,0,0,0.5);
                    }
                    .admin-sidebar.open {
                        transform: translateX(0);
                    }
                    .admin-mobile-backdrop.open {
                        display: block;
                        position: fixed;
                        inset: 0;
                        background-color: rgba(0, 0, 0, 0.6);
                        backdrop-filter: blur(4px);
                        z-index: 999;
                    }
                    .admin-top-header {
                        padding: 12px 16px;
                    }
                    .admin-outlet-wrap {
                        padding: 16px 12px;
                    }
                }
            `}</style>

            {/* Mobile Backdrop Overlay */}
            <div 
                className={`admin-mobile-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)} 
                aria-label="Close admin menu"
            />
            
            {/* SIDEBAR */}
            <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <img 
                            src="/logo.png" 
                            alt="AutoMart" 
                            style={{ 
                                height: '42px', 
                                objectFit: 'contain', 
                                borderRadius: '8px', 
                                backgroundColor: '#000', 
                                padding: '3px 8px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                alignSelf: 'flex-start'
                            }} 
                        />
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '700' }}>Admin Panel</span>
                    </Link>

                    {/* Close button for mobile drawer */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="admin-menu-toggle"
                        style={{ color: '#cbd5e1' }}
                        aria-label="Close sidebar"
                    >
                        <X size={22} />
                    </button>
                </div>
                
                <div style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
                    <Link to="/admin/dashboard" style={sidebarLinkStyle(isActive('/admin/dashboard'))}><LayoutDashboard size={20} /> Dashboard</Link>
                    <Link to="/admin/cars/add" style={sidebarLinkStyle(isActive('/admin/cars/add'))}><PlusCircle size={20} /> Add Car</Link>
                    <Link to="/admin/cars" style={sidebarLinkStyle(isActive('/admin/cars'))}><Car size={20} /> Manage Cars</Link>
                    <Link to="/admin/users" style={sidebarLinkStyle(isActive('/admin/users'))}><Users size={20} /> View Users</Link>
                    <Link to="/admin/orders" style={sidebarLinkStyle(isActive('/admin/orders'))}><ClipboardList size={20} /> Orders</Link>
                    <Link to="/admin/issues" style={sidebarLinkStyle(isActive('/admin/issues'))}><MessageSquare size={20} /> User Issues</Link>
                    <Link to="/admin/messages" style={sidebarLinkStyle(isActive('/admin/messages') || isActive('/admin/contact-messages'))}><Mail size={20} /> Contact Messages</Link>
                    <Link to="/admin/feedback" style={sidebarLinkStyle(isActive('/admin/feedback'))}><Star size={20} /> Customer Reviews</Link>
                </div>
                
                <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button onClick={handleLogout} style={{ ...sidebarLinkStyle(false), width: 'calc(100% - 20px)', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: 'none', cursor: 'pointer', padding: '12px 16px' }}>
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="admin-main-wrap">
                
                {/* TOP HEADER */}
                <header className="admin-top-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="admin-menu-toggle"
                            aria-label="Open admin navigation menu"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 style={{ margin: 0, fontSize: '1.3em', color: 'inherit' }}>Admin Panel</h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={18} color="#64748b" />
                        </div>
                        <span style={{ fontWeight: '600', color: 'inherit', fontSize: '0.9em' }}>Admin</span>
                        <ChevronDown size={14} color="#64748b" />
                    </div>
                </header>

                <div className="admin-outlet-wrap">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
