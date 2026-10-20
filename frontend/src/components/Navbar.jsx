import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', backgroundColor: '#343a40', color: 'white' }}>
            <div>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <img 
                        src="/logo.png" 
                        alt="AutoMart" 
                        style={{ 
                            height: '42px', 
                            objectFit: 'contain', 
                            borderRadius: '6px', 
                            backgroundColor: '#000', 
                            padding: '2px 8px' 
                        }} 
                    />
                </Link>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/cars" style={{ color: 'white', textDecoration: 'none' }}>Browse Cars</Link>
                
                {user ? (
                    user.role === 'admin' ? (
                        <>
                            <Link to="/admin/dashboard" style={{ color: '#ffc107', textDecoration: 'none' }}>Admin Dashboard</Link>
                            <Link to="/admin/cars" style={{ color: 'white', textDecoration: 'none' }}>Manage Cars</Link>
                            <Link to="/admin/orders" style={{ color: 'white', textDecoration: 'none' }}>Manage Orders</Link>
                            <button onClick={handleLogout} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/wishlist" style={{ color: 'white', textDecoration: 'none' }}>Wishlist</Link>
                            <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>Cart</Link>
                            <Link to="/user/dashboard" style={{ color: '#28a745', textDecoration: 'none', fontWeight: 'bold' }}>My Dashboard</Link>
                            <button onClick={handleLogout} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                        </>
                    )
                ) : (
                    <>
                        <Link to="/user/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
                        <Link to="/user/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
                        <Link to="/admin/login" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em' }}>Admin</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
