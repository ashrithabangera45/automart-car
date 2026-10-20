import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    Search, 
    Heart, 
    User as UserIcon, 
    LogOut, 
    LogIn, 
    MapPin, 
    ShoppingCart, 
    ChevronDown, 
    Package, 
    LayoutDashboard, 
    ShieldCheck, 
    Phone, 
    Mail,
    Wrench,
    Menu,
    X
} from 'lucide-react';

const Header = () => {
    const { user, logout, cartCount, wishlistCount } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close menus on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
        setIsMobileSearchOpen(false);
    }, [location.pathname]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Prevent background scrolling when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/cars?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsMobileSearchOpen(false);
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
            
            <style>{`
                .header-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 30px;
                    max-width: 1400px;
                    margin: 0 auto;
                    width: 100%;
                    box-sizing: border-box;
                    gap: 15px;
                }
                .desktop-nav {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 0.95em;
                }
                .desktop-search-form {
                    position: relative;
                    width: 320px;
                }
                .mobile-toggle-btn {
                    display: none;
                    background: none;
                    border: none;
                    padding: 8px;
                    cursor: pointer;
                    color: #1e293b;
                    border-radius: 8px;
                    align-items: center;
                    justify-content: center;
                }
                .mobile-search-toggle-btn {
                    display: none;
                    background: none;
                    border: none;
                    padding: 8px;
                    cursor: pointer;
                    color: #1e293b;
                    border-radius: 8px;
                    align-items: center;
                    justify-content: center;
                }
                @media (max-width: 992px) {
                    .header-container {
                        padding: 10px 16px;
                    }
                    .desktop-nav {
                        display: none !important;
                    }
                    .desktop-search-form {
                        display: none !important;
                    }
                    .mobile-toggle-btn {
                        display: flex !important;
                    }
                    .mobile-search-toggle-btn {
                        display: flex !important;
                    }
                    .user-desktop-details {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Main Nav Bar */}
            <div className="header-container">
                
                {/* Brand / Logo + Desktop Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <img 
                            src="/logo.png" 
                            alt="AutoMart" 
                            style={{ 
                                height: '40px', 
                                objectFit: 'contain', 
                                borderRadius: '8px',
                                backgroundColor: '#000',
                                padding: '3px 8px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                            }} 
                        />
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="desktop-nav">
                        <Link to="/" style={{ textDecoration: 'none', color: location.pathname === '/' ? '#0284c7' : 'inherit' }}>Home</Link>
                        <Link to="/buy-used-cars" style={{ textDecoration: 'none', color: location.pathname === '/buy-used-cars' ? '#0284c7' : 'inherit' }}>Buy Used Cars</Link>
                        <Link to="/cars" style={{ textDecoration: 'none', color: location.pathname === '/cars' ? '#0284c7' : 'inherit' }}>Cars</Link>
                        <Link to="/about" style={{ textDecoration: 'none', color: location.pathname === '/about' ? '#0284c7' : 'inherit' }}>About</Link>
                        <Link to="/contact" style={{ textDecoration: 'none', color: location.pathname === '/contact' ? '#0284c7' : 'inherit' }}>Contact</Link>
                        <Link to="/feedback" style={{ textDecoration: 'none', color: location.pathname === '/feedback' ? '#0284c7' : 'inherit' }}>Reviews</Link>
                    </nav>
                </div>

                {/* Right side actions & search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    
                    {/* Desktop Search Form */}
                    <form onSubmit={handleSearch} className="desktop-search-form">
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by brand, model..." 
                            style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.92em', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </form>

                    {/* Mobile Search Toggle Button */}
                    <button 
                        type="button" 
                        className="mobile-search-toggle-btn"
                        onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        aria-label="Toggle Search"
                    >
                        <Search size={22} />
                    </button>

                    {/* Saved / Wishlist */}
                    <Link to="/wishlist" style={{ color: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', position: 'relative', padding: '4px' }}>
                        <Heart size={22} color={wishlistCount > 0 ? '#ef4444' : 'currentColor'} fill={wishlistCount > 0 ? '#ef4444' : 'none'} />
                        {wishlistCount > 0 && (
                            <span style={{ position: 'absolute', top: '-2px', right: '-4px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.65em', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px', minWidth: '16px', textAlign: 'center' }}>
                                {wishlistCount}
                            </span>
                        )}
                        <span style={{ fontSize: '0.65em', fontWeight: '600', marginTop: '2px' }}>Wishlist</span>
                    </Link>
                    
                    {/* Cart */}
                    <Link to="/cart" style={{ color: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', position: 'relative', padding: '4px' }}>
                        <ShoppingCart size={22} color={cartCount > 0 ? '#0284c7' : 'currentColor'} />
                        {cartCount > 0 && (
                            <span style={{ position: 'absolute', top: '-2px', right: '-4px', backgroundColor: '#0284c7', color: 'white', fontSize: '0.65em', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px', minWidth: '16px', textAlign: 'center' }}>
                                {cartCount}
                            </span>
                        )}
                        <span style={{ fontSize: '0.65em', fontWeight: '600', marginTop: '2px' }}>Cart</span>
                    </Link>
                    
                    {/* Desktop/Tablet User Account Dropdown */}
                    {user ? (
                        <div ref={dropdownRef} style={{ position: 'relative' }}>
                            <div 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                                style={{ 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    backgroundColor: isDropdownOpen ? '#f1f5f9' : 'transparent',
                                    transition: 'background-color 0.2s',
                                    userSelect: 'none'
                                }}
                            >
                                <div className="user-desktop-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ fontWeight: '700', fontSize: '0.85em', color: '#1e293b', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user?.fullName?.split(' ')[0] || 'User'}
                                    </span>
                                    <span style={{ fontSize: '0.7em', color: '#64748b' }}>
                                        Account
                                    </span>
                                </div>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserIcon size={18} color="#0284c7" />
                                </div>
                                <ChevronDown 
                                    size={14} 
                                    color="#64748b" 
                                    style={{ 
                                        transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                                        transition: 'transform 0.2s ease' 
                                    }} 
                                />
                            </div>

                            {/* Dropdown Menu Content */}
                            {isDropdownOpen && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: 'calc(100% + 10px)', 
                                    right: 0, 
                                    width: '280px', 
                                    backgroundColor: '#ffffff', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15), 0 2px 6px rgba(0,0,0,0.04)', 
                                    border: '1px solid #e2e8f0', 
                                    zIndex: 1100,
                                    overflow: 'hidden'
                                }}>
                                    {/* User Details Header Card */}
                                    <div style={{ padding: '14px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ 
                                                width: '38px', 
                                                height: '38px', 
                                                borderRadius: '50%', 
                                                backgroundColor: '#0284c7', 
                                                color: '#ffffff', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                fontWeight: '700',
                                                fontSize: '1rem'
                                            }}>
                                                {(user?.fullName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {user?.fullName || 'User'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {user?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dropdown Navigation Links */}
                                    <div style={{ padding: '6px 8px' }}>
                                        <Link 
                                            to="/profile" 
                                            onClick={() => setIsDropdownOpen(false)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', textDecoration: 'none', color: '#1e293b' }}
                                        >
                                            <UserIcon size={16} color="#0284c7" />
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Profile</div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Account details</div>
                                            </div>
                                        </Link>

                                        <Link 
                                            to="/myorders" 
                                            onClick={() => setIsDropdownOpen(false)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', textDecoration: 'none', color: '#1e293b' }}
                                        >
                                            <Package size={16} color="#16a34a" />
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>My Orders</div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Live delivery tracking</div>
                                            </div>
                                        </Link>

                                        <Link 
                                            to="/service" 
                                            onClick={() => setIsDropdownOpen(false)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', textDecoration: 'none', color: '#1e293b' }}
                                        >
                                            <Wrench size={16} color="#4f46e5" />
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Service & Support</div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Assistance & warranty</div>
                                            </div>
                                        </Link>

                                        {user.role === 'admin' && (
                                            <Link 
                                                to="/admin/dashboard" 
                                                onClick={() => setIsDropdownOpen(false)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', textDecoration: 'none', color: '#7c3aed' }}
                                            >
                                                <ShieldCheck size={16} color="#7c3aed" />
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Admin Dashboard</div>
                                                    <div style={{ fontSize: '0.72rem', color: '#8b5cf6' }}>Manage cars & orders</div>
                                                </div>
                                            </Link>
                                        )}
                                    </div>

                                    <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '4px 0' }} />

                                    <div style={{ padding: '6px 8px 8px' }}>
                                        <button 
                                            onClick={handleLogout} 
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left', color: '#ef4444', fontWeight: '600', fontSize: '0.88rem' }}
                                        >
                                            <LogOut size={16} color="#ef4444" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link 
                            to="/user/login" 
                            state={{ from: location.pathname !== '/user/login' ? (location.pathname + location.search) : '/' }}
                            style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '8px 18px', 
                                backgroundColor: '#0284c7', 
                                color: '#ffffff', 
                                textDecoration: 'none', 
                                borderRadius: '8px', 
                                fontWeight: '700', 
                                fontSize: '0.9rem',
                                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <LogIn size={17} />
                            <span>Login</span>
                        </Link>
                    )}

                    {/* Hamburger Menu Toggle Button */}
                    <button 
                        type="button" 
                        className="mobile-toggle-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Expandable Search Bar */}
            {isMobileSearchOpen && (
                <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                    <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search cars by brand, model..." 
                            autoFocus
                            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '1em', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </form>
                </div>
            )}

            {/* Mobile Drawer Backdrop & Panel */}
            {isMobileMenuOpen && (
                <div 
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1200,
                        display: 'flex',
                        justifyContent: 'flex-start'
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '85%',
                            maxWidth: '320px',
                            height: '100%',
                            backgroundColor: '#ffffff',
                            boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                            animation: 'slideInLeft 0.25s ease-out'
                        }}
                    >
                        {/* Drawer Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                            <img 
                                src="/logo.png" 
                                alt="AutoMart" 
                                style={{ height: '36px', backgroundColor: '#000', padding: '2px 8px', borderRadius: '6px' }} 
                            />
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* User Card in Drawer if logged in */}
                        {user ? (
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#eff6ff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        {(user?.fullName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.fullName}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
                                <Link 
                                    to="/user/login" 
                                    state={{ from: location.pathname !== '/user/login' ? (location.pathname + location.search) : '/' }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    style={{ flex: 1, textAlign: 'center', padding: '10px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}
                                >
                                    Log In
                                </Link>
                                <Link 
                                    to="/user/register" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    style={{ flex: 1, textAlign: 'center', padding: '10px', backgroundColor: '#f1f5f9', color: '#1e293b', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div style={{ flex: 1, padding: '15px 0' }}>
                            <div style={{ padding: '6px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Explore
                            </div>
                            <Link 
                                to="/" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ display: 'block', padding: '12px 20px', color: location.pathname === '/' ? '#0284c7' : '#1e293b', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}
                            >
                                Home
                            </Link>
                            <Link 
                                to="/buy-used-cars" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ display: 'block', padding: '12px 20px', color: location.pathname === '/buy-used-cars' ? '#0284c7' : '#1e293b', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}
                            >
                                Buy Used Cars
                            </Link>
                            <Link 
                                to="/cars" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ display: 'block', padding: '12px 20px', color: location.pathname === '/cars' ? '#0284c7' : '#1e293b', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}
                            >
                                Cars
                            </Link>
                            <Link 
                                to="/about" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ display: 'block', padding: '12px 20px', color: location.pathname === '/about' ? '#0284c7' : '#1e293b', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}
                            >
                                About
                            </Link>
                            <Link 
                                to="/contact" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ display: 'block', padding: '12px 20px', color: location.pathname === '/contact' ? '#0284c7' : '#1e293b', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}
                            >
                                Contact
                            </Link>
                            <Link 
                                to="/wishlist" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', color: location.pathname === '/wishlist' ? '#0284c7' : '#1e293b', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Heart size={18} color="#ef4444" fill={wishlistCount > 0 ? '#ef4444' : 'none'} /> Wishlist
                                </span>
                                {wishlistCount > 0 && (
                                    <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                            <Link 
                                to="/cart" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', color: location.pathname === '/cart' ? '#0284c7' : '#1e293b', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ShoppingCart size={18} color="#0284c7" /> Cart
                                </span>
                                {cartCount > 0 && (
                                    <span style={{ backgroundColor: '#0284c7', color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            <Link 
                                to="/feedback" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ display: 'block', padding: '12px 20px', color: location.pathname === '/feedback' ? '#0284c7' : '#1e293b', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}
                            >
                                Reviews
                            </Link>

                            {/* User Specific Links */}
                            {user && (
                                <>
                                    <div style={{ padding: '16px 20px 6px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        My Account
                                    </div>
                                    <Link 
                                        to="/profile" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#1e293b', textDecoration: 'none', fontWeight: '500' }}
                                    >
                                        <UserIcon size={18} color="#0284c7" /> Profile & Details
                                    </Link>
                                    <Link 
                                        to="/myorders" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#1e293b', textDecoration: 'none', fontWeight: '500' }}
                                    >
                                        <Package size={18} color="#16a34a" /> My Orders & Tracking
                                    </Link>
                                    <Link 
                                        to="/service" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#1e293b', textDecoration: 'none', fontWeight: '500' }}
                                    >
                                        <Wrench size={18} color="#4f46e5" /> Service & Support
                                    </Link>

                                    {user.role === 'admin' && (
                                        <Link 
                                            to="/admin/dashboard" 
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#7c3aed', textDecoration: 'none', fontWeight: '600' }}
                                        >
                                            <ShieldCheck size={18} color="#7c3aed" /> Admin Dashboard
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Bottom Actions */}
                        {user && (
                            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
                                <button 
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        backgroundColor: '#fee2e2',
                                        color: '#ef4444',
                                        border: 'none',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
