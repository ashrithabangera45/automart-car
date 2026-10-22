import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ExploreOtherCars = ({ excludeIds = [] }) => {
    const navigate = useNavigate();
    const { user, updateCartCount, updateWishlistCount } = useContext(AuthContext);
    const { showToast } = useToast();
    const [cars, setCars] = useState([]);
    const [wishlist, setWishlist] = useState(new Set());
    const scrollRef = useRef(null);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        // Fetch all cars
        axios.get(`${API_URL}/cars`)
            .then(res => {
                const fetchedCars = Array.isArray(res.data) ? res.data : (res.data?.cars || []);
                setCars(fetchedCars);
            })
            .catch(err => console.error("Error fetching explore cars", err));
    }, []);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        // Fetch user's wishlist
        if (user && user.token) {
            axios.get(`${API_URL}/wishlist`, { headers: { Authorization: `Bearer ${user.token}` }})
                 .then(res => setWishlist(new Set(res.data.map(item => item.carId?._id || item.carId))))
                 .catch(err => console.error(err));
        } else {
            setWishlist(new Set());
        }
    }, [user]);

    const toggleWishlist = async (e, carId) => {
        if (e) e.stopPropagation();
        if (!user) {
            showToast({
                title: 'Login Required',
                message: 'Please login to save cars to your wishlist.',
                type: 'error',
                actionText: 'Login Now',
                actionLink: '/user/login'
            });
            return navigate('/user/login', { 
                state: { 
                    from: window.location.pathname, 
                    fromCar: carId, 
                    autoWishlist: true 
                } 
            });
        }
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            if (wishlist.has(carId)) {
                await axios.delete(`${API_URL}/wishlist/${carId}`, { headers: { Authorization: `Bearer ${user.token}` }});
                updateWishlistCount();
                setWishlist(prev => {
                    const next = new Set(prev);
                    next.delete(carId);
                    return next;
                });
                showToast({
                    title: 'Removed from Wishlist',
                    message: 'Car removed from your wishlist.',
                    type: 'info'
                });
            } else {
                await axios.post(`${API_URL}/wishlist`, { carId }, { headers: { Authorization: `Bearer ${user.token}` }});
                updateWishlistCount();
                setWishlist(prev => {
                    const next = new Set(prev);
                    next.add(carId);
                    return next;
                });
                showToast({
                    title: 'Saved to Wishlist! ❤️',
                    message: 'Car added to your wishlist.',
                    type: 'success',
                    actionText: 'View Wishlist',
                    actionLink: '/wishlist'
                });
            }
        } catch (err) {
            showToast({
                title: 'Error',
                message: err.response?.data?.message || 'Error updating wishlist',
                type: 'error'
            });
        }
    };

    const handleAddToCartItem = async (e, targetCar) => {
        if (e) e.stopPropagation();
        if (!user) {
            showToast({
                title: 'Login Required',
                message: 'Please login to add this car to your cart.',
                type: 'error',
                actionText: 'Login Now',
                actionLink: '/user/login'
            });
            return navigate('/user/login', { 
                state: { 
                    from: window.location.pathname, 
                    fromCar: targetCar._id, 
                    autoCart: true 
                } 
            });
        }
        if (targetCar.stock <= 0) {
            showToast({
                title: 'Out of Stock',
                message: 'This car is currently unavailable.',
                type: 'error'
            });
            return;
        }
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(`${API_URL}/cart`, { carId: targetCar._id, price: targetCar.price }, { headers: { Authorization: `Bearer ${user.token}` }});
            updateCartCount();
            showToast({
                title: 'Added to Cart! 🛒',
                message: `${targetCar.modelYear ? targetCar.modelYear + ' ' : ''}${targetCar.brand ? targetCar.brand + ' ' : ''}${targetCar.name} added to your cart.`,
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

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' });

    if (cars.length === 0) return null;

    return (
        <div style={{ marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.65rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Explore other cars</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={scrollLeft} 
                        aria-label="Scroll left"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #cbd5e1', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'background-color 0.2s' }}
                    >
                        <ChevronLeft size={22} color="#475569" />
                    </button>
                    <button 
                        onClick={scrollRight} 
                        aria-label="Scroll right"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #cbd5e1', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'background-color 0.2s' }}
                    >
                        <ChevronRight size={22} color="#475569" />
                    </button>
                </div>
            </div>
            
            <div 
                ref={scrollRef} 
                style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    overflowX: 'auto', 
                    scrollBehavior: 'smooth', 
                    scrollSnapType: 'x mandatory', 
                    paddingBottom: '24px', 
                    paddingTop: '4px',
                    msOverflowStyle: 'none', 
                    scrollbarWidth: 'none' 
                }}
            >
                <style>{`
                    .explore-scroll-container::-webkit-scrollbar { display: none; }
                `}</style>
                {cars.map(simCar => {
                    const isWishlisted = wishlist.has(simCar._id);
                    const originalPrice = simCar.discount > 0 ? (simCar.price + simCar.discount) : null;

                    return (
                        <div 
                            key={simCar._id} 
                            style={{ 
                                flex: '0 0 325px', 
                                backgroundColor: '#ffffff', 
                                borderRadius: '16px', 
                                border: '1px solid #e2e8f0', 
                                overflow: 'hidden', 
                                scrollSnapAlign: 'start', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 16px 24px -4px rgba(0, 0, 0, 0.12), 0 8px 12px -4px rgba(0, 0, 0, 0.06)';
                                const img = e.currentTarget.querySelector('.explore-car-image');
                                if (img) img.style.transform = 'scale(1.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                                const img = e.currentTarget.querySelector('.explore-car-image');
                                if (img) img.style.transform = 'scale(1)';
                            }}
                        >
                            {/* Car Image */}
                            <div 
                                style={{ position: 'relative', width: '100%', height: '210px', cursor: 'pointer', backgroundColor: '#f1f5f9', overflow: 'hidden' }} 
                                onClick={() => navigate(`/cars/${simCar._id}`)}
                            >
                                <img 
                                    className="explore-car-image"
                                    src={simCar.images && simCar.images.length > 0 ? simCar.images[0] : 'https://via.placeholder.com/600x400?text=No+Image'} 
                                    alt={simCar.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} 
                                />
                            </div>

                            {/* Card Body */}
                            <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                <div>
                                    {/* Header: Title and Heart */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                        <div onClick={() => navigate(`/cars/${simCar._id}`)} style={{ cursor: 'pointer', flex: 1 }}>
                                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', lineHeight: 1.3 }}>
                                                {simCar.modelYear ? `${simCar.modelYear} ` : ''}{simCar.brand ? `${simCar.brand} ` : ''}{simCar.name}
                                            </h3>
                                            {simCar.variant && (
                                                <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                                                    {simCar.variant}
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            type="button"
                                            onClick={(e) => toggleWishlist(e, simCar._id)} 
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
                                            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                                        >
                                            <svg 
                                                width="24" 
                                                height="24" 
                                                viewBox="0 0 24 24" 
                                                fill={isWishlisted ? "#ef4444" : "none"} 
                                                stroke={isWishlisted ? "#ef4444" : "#94a3b8"} 
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
                                        {simCar.kmDriven && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                                                    <circle cx="7" cy="7" r=".5" fill="#94a3b8"/>
                                                </svg>
                                                {simCar.kmDriven.toLocaleString()} km
                                            </span>
                                        )}
                                        {simCar.fuelType && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="3" y1="22" x2="15" y2="22"/>
                                                    <line x1="4" y1="9" x2="14" y2="9"/>
                                                    <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/>
                                                    <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>
                                                </svg>
                                                {simCar.fuelType}
                                            </span>
                                        )}
                                        {simCar.transmission && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="3"/>
                                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                                                </svg>
                                                {simCar.transmission}
                                            </span>
                                        )}
                                    </div>

                                    {/* Location Row */}
                                    {simCar.location?.city && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                                <circle cx="12" cy="10" r="3"/>
                                            </svg>
                                            <span>{simCar.location.city}{simCar.location.state ? `, ${simCar.location.state}` : ''}</span>
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
                                            ₹{simCar.price?.toLocaleString('en-IN')}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: simCar.stock > 0 ? '#16a34a' : '#dc2626' }}>
                                            {simCar.stock > 0 ? '✓ In Stock' : '✕ Out of Stock'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '110px' }}>
                                        <button 
                                            onClick={(e) => handleAddToCartItem(e, simCar)} 
                                            disabled={simCar.stock <= 0}
                                            style={{ 
                                                backgroundColor: simCar.stock > 0 ? '#0070f3' : '#cbd5e1', 
                                                color: '#ffffff', 
                                                border: 'none', 
                                                padding: '7px 14px', 
                                                borderRadius: '6px', 
                                                fontWeight: '600', 
                                                fontSize: '0.85rem', 
                                                cursor: simCar.stock > 0 ? 'pointer' : 'not-allowed',
                                                textAlign: 'center',
                                                transition: 'background-color 0.15s ease'
                                            }}
                                        >
                                            Add to Cart
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/cars/${simCar._id}`)} 
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
        </div>
    );
};
export default ExploreOtherCars;
