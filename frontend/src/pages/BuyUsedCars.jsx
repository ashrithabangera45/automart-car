import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
    Search, 
    Heart, 
    ShieldCheck, 
    CheckCircle, 
    RotateCcw, 
    Award, 
    ArrowRight, 
    Fuel, 
    Gauge, 
    SlidersHorizontal,
    Car as CarIcon,
    Filter
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BrandLogoCarousel from '../components/BrandLogoCarousel';

const BuyUsedCars = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateWishlistCount } = useContext(AuthContext);
    const { showToast } = useToast();

    const [usedCars, setUsedCars] = useState([]);
    const [facets, setFacets] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [wishlist, setWishlist] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // Parse brand query if any
    const queryParams = new URLSearchParams(location.search);
    const currentBrand = queryParams.get('brand') || '';

    useEffect(() => {
        document.title = 'Buy Used Cars | AutoMart - Certified Pre-Owned Vehicles';
    }, []);

    // Fetch wishlist for logged-in user
    useEffect(() => {
        if (user && user.token) {
            axios.get('http://localhost:5000/api/wishlist', { 
                headers: { Authorization: `Bearer ${user.token}` } 
            })
            .then(res => setWishlist(new Set(res.data.map(item => item.carId?._id || item.carId))))
            .catch(console.error);
        } else {
            setWishlist(new Set());
        }
    }, [user]);

    // Fetch cars (optionally filtered by brand, condition=Used or all inventory)
    useEffect(() => {
        const fetchCars = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (currentBrand) {
                    params.set('brand', currentBrand);
                }
                params.set('includeFacets', 'true');

                const { data } = await axios.get(`http://localhost:5000/api/cars?${params.toString()}`);
                const carList = data.cars || (Array.isArray(data) ? data : []);
                setUsedCars(carList);
                if (data.facets) setFacets(data.facets);
            } catch (err) {
                console.error('Failed to fetch used cars:', err);
                setUsedCars([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCars();
    }, [currentBrand]);

    const handleBrandSelect = (brandName) => {
        if (!brandName) {
            navigate('/cars');
        } else {
            // Navigate to existing Cars listing page and filter by brand as required
            navigate(`/cars?brand=${encodeURIComponent(brandName)}`);
        }
    };

    useEffect(() => {
        if (location.state?.autoWishlist && location.state?.fromCar && user && user.token) {
            const targetCarId = location.state.fromCar;
            axios.post('http://localhost:5000/api/wishlist', { carId: targetCarId }, { headers: { Authorization: `Bearer ${user.token}` }})
                .then(() => {
                    updateWishlistCount();
                    setWishlist(prev => new Set(prev).add(targetCarId));
                    showToast({
                        title: 'Saved to Wishlist! ❤️',
                        message: 'Car added to your wishlist.',
                        type: 'success'
                    });
                })
                .catch(console.error);
            navigate(location.pathname + location.search, { replace: true, state: {} });
        }
    }, [location.state, user]);

    const toggleWishlist = async (e, carId) => {
        e.stopPropagation();
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
                    from: location.pathname + location.search, 
                    fromCar: carId, 
                    autoWishlist: true 
                } 
            });
        }
        try {
            if (wishlist.has(carId)) {
                await axios.delete(`http://localhost:5000/api/wishlist/${carId}`, { 
                    headers: { Authorization: `Bearer ${user.token}` } 
                });
                updateWishlistCount();
                setWishlist(prev => {
                    const next = new Set(prev);
                    next.delete(carId);
                    return next;
                });
            } else {
                await axios.post('http://localhost:5000/api/wishlist', { carId }, { 
                    headers: { Authorization: `Bearer ${user.token}` } 
                });
                updateWishlistCount();
                setWishlist(prev => {
                    const next = new Set(prev);
                    next.add(carId);
                    return next;
                });
            }
        } catch (err) {
            console.error('Wishlist toggle error:', err);
        }
    };

    // Filter displayed cars by local search if entered
    const filteredCars = usedCars.filter(car => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            car.name?.toLowerCase().includes(q) ||
            car.brand?.toLowerCase().includes(q) ||
            car.model?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="buy-used-cars-page" style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
            <style>{`
                .buy-used-cars-hero {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    border-radius: 20px;
                    padding: 36px 32px;
                    color: #ffffff;
                    margin-bottom: 28px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                }
                .hero-trust-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    padding: 8px 14px;
                    border-radius: 30px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .used-car-card {
                    background: #ffffff;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
                }
                .used-car-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.12);
                    border-color: #cbd5e1;
                }
                .used-car-card img {
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .used-car-card:hover img {
                    transform: scale(1.08);
                }
                @media (max-width: 768px) {
                    .buy-used-cars-hero {
                        padding: 24px 18px !important;
                    }
                    .hero-trust-badges-wrap {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 8px !important;
                    }
                }
            `}</style>

            {/* HERO SECTION */}
            <div className="buy-used-cars-hero">
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(2, 132, 199, 0.25)', border: '1px solid rgba(2, 132, 199, 0.5)', padding: '5px 12px', borderRadius: '20px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <Award size={14} /> AutoMart Assured Selection
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 900, margin: '0 0 12px 0', letterSpacing: '-0.5px', color: '#ffffff' }}>
                        Buy Used Cars
                    </h1>
                    <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', margin: '0 0 24px 0', color: '#cbd5e1', lineHeight: 1.6 }}>
                        Browse 100% verified, pre-owned cars from top brands. Every car comes with inspection reports, transparent pricing, and instant ownership transfer.
                    </p>

                    {/* Trust Highlights */}
                    <div className="hero-trust-badges-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        <div className="hero-trust-badge">
                            <ShieldCheck size={16} color="#38bdf8" /> 140+ Points Inspected
                        </div>
                        <div className="hero-trust-badge">
                            <RotateCcw size={16} color="#38bdf8" /> 7-Day Money Back
                        </div>
                        <div className="hero-trust-badge">
                            <CheckCircle size={16} color="#38bdf8" /> 1-Year Warranty Included
                        </div>
                    </div>
                </div>
            </div>

            {/* POPULAR BRANDS LOGO CAROUSEL */}
            <BrandLogoCarousel 
                selectedBrand={currentBrand}
                onBrandSelect={handleBrandSelect}
                brandCounts={facets?.brands || {}}
                title="Popular Brands"
            />

            {/* LISTING CONTROLS / HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
                <div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                        {currentBrand ? `${currentBrand} Used Cars` : 'Featured Used Cars'}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                        Showing {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'} available for instant booking
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Quick Search */}
                    <div style={{ position: 'relative', width: '260px' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="text" 
                            placeholder="Search within used cars..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 12px 9px 36px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                fontSize: '0.88rem',
                                backgroundColor: '#ffffff',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <Link 
                        to="/cars" 
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 16px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                    >
                        <SlidersHorizontal size={15} /> All Inventory Filters
                    </Link>
                </div>
            </div>

            {/* CARS GRID / EMPTY STATE */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '1.1rem' }}>
                    Loading verified used cars...
                </div>
            ) : filteredCars.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 24px', 
                    backgroundColor: '#ffffff', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' 
                }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CarIcon size={30} color="#64748b" />
                    </div>
                    <h2 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '1.45rem', fontWeight: 800 }}>
                        {currentBrand ? 'No cars available for this brand' : 'No cars found matching your search'}
                    </h2>
                    <p style={{ color: '#64748b', maxWidth: '460px', margin: '0 auto 24px', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        {currentBrand 
                            ? `We currently do not have any ${currentBrand} cars in stock. You can browse our other popular brands above or explore all cars.`
                            : 'Try adjusting your search query or clear the brand filter to see all cars.'}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Link 
                            to="/cars" 
                            style={{ 
                                padding: '12px 24px', 
                                backgroundColor: '#0284c7', 
                                color: '#ffffff', 
                                borderRadius: '8px', 
                                textDecoration: 'none', 
                                fontWeight: 700, 
                                fontSize: '0.95rem' 
                            }}
                        >
                            View All Cars
                        </Link>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(290px, 100%), 1fr))', gap: '22px' }}>
                    {filteredCars.map(car => (
                        <div 
                            key={car._id} 
                            className="used-car-card"
                            onClick={() => navigate(`/cars/${car._id}`)}
                            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Card Image */}
                            <div style={{ position: 'relative', height: '200px', backgroundColor: '#f1f5f9' }}>
                                <img 
                                    src={car.images && car.images[0] ? car.images[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop'} 
                                    alt={car.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />

                                {/* Assured Badge */}
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '12px', 
                                    left: '12px', 
                                    backgroundColor: 'rgba(255, 255, 255, 0.94)', 
                                    color: '#0284c7', 
                                    padding: '4px 10px', 
                                    borderRadius: '6px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <ShieldCheck size={13} /> ASSURED
                                </div>

                                {/* Wishlist Button */}
                                <button
                                    type="button"
                                    onClick={(e) => toggleWishlist(e, car._id)}
                                    aria-label="Save to Wishlist"
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        width: '34px',
                                        height: '34px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    <Heart 
                                        size={18} 
                                        color={wishlist.has(car._id) ? '#ef4444' : '#64748b'} 
                                        fill={wishlist.has(car._id) ? '#ef4444' : 'none'} 
                                    />
                                </button>
                            </div>

                            {/* Card Content */}
                            <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                                        {car.brand} {car.modelYear ? `• ${car.modelYear}` : ''}
                                    </div>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                                        {car.name}
                                    </h3>

                                    {/* Specs Pills */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                        {car.kmDriven !== undefined && car.kmDriven !== null && (
                                            <span style={{ fontSize: '0.76rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Gauge size={12} /> {car.kmDriven.toLocaleString()} km
                                            </span>
                                        )}
                                        {car.fuelType && (
                                            <span style={{ fontSize: '0.76rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Fuel size={12} /> {car.fuelType}
                                            </span>
                                        )}
                                        {car.transmission && (
                                            <span style={{ fontSize: '0.76rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                                {car.transmission}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Price and Action */}
                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Price</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>
                                            ₹{car.price?.toLocaleString()}
                                        </div>
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/cars/${car._id}`);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#0f172a',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        View Car <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BuyUsedCars;
