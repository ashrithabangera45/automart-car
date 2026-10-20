import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import ExploreOtherCars from '../components/ExploreOtherCars';

import { useToast } from '../context/ToastContext';

const Wishlist = () => {
    const { updateCartCount, updateWishlistCount } = useContext(AuthContext);
    const { showToast } = useToast();
    const [wishlist, setWishlist] = useState([]);
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) return;
        try {
            const { data } = await axios.get('http://localhost:5000/api/wishlist', { headers: { Authorization: `Bearer ${user.token}` }});
            setWishlist(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchWishlist(); }, []);

    const remove = async (carId) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) return;
        try {
            await axios.delete(`http://localhost:5000/api/wishlist/${carId}`, { headers: { Authorization: `Bearer ${user.token}` }});
            fetchWishlist();
            updateWishlistCount();
            showToast({
                title: 'Removed from Wishlist',
                message: 'Car removed from your wishlist.',
                type: 'info'
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddToCart = async (car) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
            showToast({
                title: 'Login Required',
                message: 'Please login to add this car to your cart.',
                type: 'error',
                actionText: 'Login Now',
                actionLink: '/user/login'
            });
            return navigate('/user/login', { state: { from: '/wishlist' } });
        }
        if (car.stock <= 0) {
            showToast({
                title: 'Out of Stock',
                message: 'This car is currently unavailable.',
                type: 'error'
            });
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/cart', { carId: car._id, price: car.price }, { headers: { Authorization: `Bearer ${user.token}` }});
            updateCartCount();
            showToast({
                title: 'Added to Cart! 🛒',
                message: `${car.modelYear ? car.modelYear + ' ' : ''}${car.brand ? car.brand + ' ' : ''}${car.name} added to your cart.`,
                type: 'success',
                actionText: 'View Cart',
                actionLink: '/cart'
            });
        } catch (err) {
            showToast({
                title: 'Error',
                message: err.response?.data?.message || 'Error adding to cart',
                type: 'error'
            });
        }
    };

    return (
        <div className="wishlist-page-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
            <style>{`
                .wishlist-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
                    gap: 20px;
                }
                @media (max-width: 500px) {
                    .wishlist-page-container {
                        padding: 16px 12px !important;
                    }
                }
            `}</style>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', margin: '0 0 20px 0' }}>My Wishlist</h1>
            {wishlist.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                    <p style={{ fontSize: '1.1rem', margin: 0 }}>No cars saved in your wishlist yet.</p>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlist.map(item => {
                        const car = item.carId;
                        if (!car) {
                            return (
                                <div key={item._id} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                    <p style={{ color: '#dc2626', fontWeight: 'bold' }}>Car no longer available</p>
                                    <button onClick={() => {
                                        const user = JSON.parse(localStorage.getItem('user'));
                                        axios.delete(`http://localhost:5000/api/wishlist/${item._id}`, { headers: { Authorization: `Bearer ${user?.token}` }})
                                            .then(() => { fetchWishlist(); updateWishlistCount(); });
                                    }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Remove</button>
                                </div>
                            );
                        }

                        const originalPrice = car.discount > 0 ? (car.price + car.discount) : null;

                        return (
                            <div 
                                key={item._id} 
                                style={{ 
                                    backgroundColor: '#ffffff', 
                                    borderRadius: '16px', 
                                    border: '1px solid #e2e8f0', 
                                    overflow: 'hidden', 
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                }}
                            >
                                {/* Car Image */}
                                <div 
                                    style={{ position: 'relative', width: '100%', height: '210px', cursor: 'pointer', backgroundColor: '#f1f5f9', overflow: 'hidden' }} 
                                    onClick={() => navigate(`/cars/${car._id}`)}
                                >
                                    <img 
                                        src={car.images && car.images.length > 0 ? car.images[0] : 'https://via.placeholder.com/600x400?text=No+Image'} 
                                        alt={car.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                                    />
                                </div>

                                {/* Card Body */}
                                <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                    <div>
                                        {/* Header: Title and Heart */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                            <div onClick={() => navigate(`/cars/${car._id}`)} style={{ cursor: 'pointer', flex: 1 }}>
                                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', lineHeight: 1.3 }}>
                                                    {car.modelYear ? `${car.modelYear} ` : ''}{car.brand ? `${car.brand} ` : ''}{car.name}
                                                </h3>
                                                {car.variant && (
                                                    <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                                                        {car.variant}
                                                    </div>
                                                )}
                                            </div>

                                            <button 
                                                type="button"
                                                onClick={() => remove(car._id)} 
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    cursor: 'pointer', 
                                                    padding: '4px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    outline: 'none',
                                                    flexShrink: 0
                                                }}
                                                title="Remove from Wishlist"
                                            >
                                                <svg 
                                                    width="24" 
                                                    height="24" 
                                                    viewBox="0 0 24 24" 
                                                    fill="#ef4444" 
                                                    stroke="#ef4444" 
                                                    strokeWidth="2" 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round"
                                                    style={{ transition: 'transform 0.15s ease' }}
                                                >
                                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                                                </svg>
                                            </button>
                                        </div>
                                        
                                        {/* Specs Row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: '#475569', marginTop: '12px', flexWrap: 'wrap' }}>
                                            {car.kmDriven && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                                                        <circle cx="7" cy="7" r=".5" fill="#94a3b8"/>
                                                    </svg>
                                                    {car.kmDriven.toLocaleString()} km
                                                </span>
                                            )}
                                            {car.fuelType && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="3" y1="22" x2="15" y2="22"/>
                                                        <line x1="4" y1="9" x2="14" y2="9"/>
                                                        <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/>
                                                        <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>
                                                    </svg>
                                                    {car.fuelType}
                                                </span>
                                            )}
                                            {car.transmission && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="3"/>
                                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                                                    </svg>
                                                    {car.transmission}
                                                </span>
                                            )}
                                        </div>

                                        {/* Location Row */}
                                        {car.location?.city && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                                    <circle cx="12" cy="10" r="3"/>
                                                </svg>
                                                <span>{car.location.city}{car.location.state ? `, ${car.location.state}` : ''}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Price & Action Buttons */}
                                    <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '10px' }}>
                                        <div>
                                            {originalPrice ? (
                                                <div style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'line-through', lineHeight: 1.2 }}>
                                                    ₹{originalPrice.toLocaleString('en-IN')}
                                                </div>
                                            ) : (
                                                <div style={{ height: '14px' }}></div>
                                            )}
                                            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.2, margin: '2px 0 3px 0' }}>
                                                ₹{car.price?.toLocaleString('en-IN')}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: car.stock > 0 ? '#16a34a' : '#dc2626' }}>
                                                {car.stock > 0 ? '✓ In Stock' : '✕ Out of Stock'}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '110px' }}>
                                            <button 
                                                onClick={() => handleAddToCart(car)} 
                                                disabled={car.stock <= 0}
                                                style={{ 
                                                    backgroundColor: car.stock > 0 ? '#0070f3' : '#cbd5e1', 
                                                    color: '#ffffff', 
                                                    border: 'none', 
                                                    padding: '7px 14px', 
                                                    borderRadius: '6px', 
                                                    fontWeight: '600', 
                                                    fontSize: '0.85rem', 
                                                    cursor: car.stock > 0 ? 'pointer' : 'not-allowed',
                                                    textAlign: 'center',
                                                    transition: 'background-color 0.15s ease'
                                                }}
                                            >
                                                Add to Cart
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/cars/${car._id}`)} 
                                                style={{ 
                                                    backgroundColor: '#ffffff', 
                                                    color: '#0070f3', 
                                                    border: '1.5px solid #0070f3', 
                                                    padding: '6px 14px', 
                                                    borderRadius: '6px', 
                                                    fontWeight: '600', 
                                                    fontSize: '0.85rem', 
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'background-color 0.15s ease'
                                                }}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <ExploreOtherCars />
        </div>
    );
};

export default Wishlist;
