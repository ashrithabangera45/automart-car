import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Clock, ThumbsUp, Car, Star, MessageSquare, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { VALUATION_BRANDS, INDIAN_STATES_RTO, BRAND_MODELS_MAP } from '../data/valuationCatalog';

const Home = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredCars, setFeaturedCars] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentReviews, setRecentReviews] = useState([]);
    const [websiteStats, setWebsiteStats] = useState({ totalReviews: 0, averageRating: 0 });

    // Valuation section states
    const [valPlateNumber, setValPlateNumber] = useState('');
    const [valPlateError, setValPlateError] = useState('');
    const [valDetectedState, setValDetectedState] = useState('');
    const carouselRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        document.title = 'AutoMart | Find Your Perfect Car';
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'description';
            document.head.appendChild(meta);
        }
        meta.content = 'AutoMart is your trusted destination for finding the right premium car. Explore, compare, and buy your perfect car today.';

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

        axios.get(`${API_URL}/cars`).then(res => {
            setFeaturedCars(res.data.slice(0, 4));
        }).catch(err => console.error(err));

        axios.get(`${API_URL}/feedback?limit=3`).then(res => {
            if (res.data.success) {
                setRecentReviews(res.data.reviews || []);
                setWebsiteStats({
                    totalReviews: res.data.totalReviews || 0,
                    averageRating: res.data.averageRating || 0
                });
            }
        }).catch(err => console.error(err));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        if (searchQuery.trim()) {
            axios.get(`${API_URL}/cars?search=${searchQuery}`).then(res => {
                setFeaturedCars(res.data);
                setIsSearching(true);
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
            }).catch(err => console.error(err));
        } else {
            axios.get(`${API_URL}/cars`).then(res => {
                setFeaturedCars(res.data.slice(0, 4));
                setIsSearching(false);
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
            }).catch(err => console.error(err));
        }
    };

    // Check carousel scroll buttons
    const checkCarouselScroll = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkCarouselScroll();
        window.addEventListener('resize', checkCarouselScroll);
        return () => window.removeEventListener('resize', checkCarouselScroll);
    }, []);

    const scrollBrandCarousel = (direction) => {
        if (carouselRef.current) {
            const amount = 320;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -amount : amount,
                behavior: 'smooth'
            });
            setTimeout(checkCarouselScroll, 350);
        }
    };

    const handleValPlateChange = (e) => {
        const raw = e.target.value.toUpperCase();
        const filtered = raw.replace(/[^A-Z0-9 ]/g, '').slice(0, 15);
        setValPlateNumber(filtered);
        setValPlateError('');

        const cleanNoSpaces = filtered.replace(/\s+/g, '');
        if (cleanNoSpaces.length >= 2) {
            const code = cleanNoSpaces.slice(0, 2);
            if (INDIAN_STATES_RTO[code]) {
                setValDetectedState(INDIAN_STATES_RTO[code]);
            } else if (/^\d{2}$/.test(code)) {
                setValDetectedState('BH Series (All India)');
            } else {
                setValDetectedState('');
            }
        } else {
            setValDetectedState('');
        }
    };

    const handleValuationPlateSubmit = (e) => {
        e.preventDefault();
        const trimmed = valPlateNumber.trim();
        if (!trimmed) {
            setValPlateError('Please enter your car registration number to continue.');
            return;
        }

        const clean = trimmed.replace(/\s+/g, '').toUpperCase();
        const standardRegex = /^([A-Z]{2})([0-9]{1,2})([A-Z]{0,3})([0-9]{4})$/;
        const bhRegex = /^([0-9]{2})(BH)([0-9]{4})([A-Z]{1,2})$/;

        if (!standardRegex.test(clean) && !bhRegex.test(clean)) {
            setValPlateError('Please enter a valid registration number (e.g., DL 03 AB 1234 or KA 01 AB 1234).');
            return;
        }

        setValPlateError('');
        navigate('/sell-used-cars', {
            state: {
                initialPlateNumber: trimmed,
                initialState: valDetectedState,
                step: 1
            }
        });
    };

    const handleBrandClick = (brand) => {
        navigate('/sell-used-cars', {
            state: {
                initialBrand: brand.name,
                initialPlateNumber: valPlateNumber.trim(),
                initialState: valDetectedState,
                step: 1
            }
        });
    };

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <Header />

            <style>{`
                .home-hero {
                    position: relative;
                    min-height: 480px;
                    background-color: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    padding: 50px 16px;
                }
                .hero-title {
                    font-size: clamp(2rem, 5.5vw, 3.2rem);
                    color: #1e293b;
                    margin: 0 0 16px 0;
                    font-weight: 900;
                    letter-spacing: -1px;
                    line-height: 1.2;
                }
                .hero-subtitle {
                    font-size: clamp(1rem, 2.5vw, 1.2rem);
                    color: #475569;
                    margin: 0 0 30px 0;
                    line-height: 1.6;
                    max-width: 700px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .hero-search-form {
                    display: flex;
                    background-color: #fff;
                    padding: 8px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    max-width: 600px;
                    margin: 0 auto;
                    width: 100%;
                    box-sizing: border-box;
                }
                .hero-search-input {
                    flex: 1;
                    border: none;
                    font-size: 1.05em;
                    outline: none;
                    padding: 10px;
                    min-width: 0;
                }
                .hero-search-btn {
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    padding: 14px 26px;
                    border-radius: 8px;
                    font-size: 1.02em;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: background-color 0.2s;
                }
                .trust-cards-grid {
                    max-width: 1200px;
                    margin: -35px auto 50px auto;
                    position: relative;
                    z-index: 2;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 18px;
                    padding: 0 20px;
                    box-sizing: border-box;
                }
                .featured-cars-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
                    gap: 24px;
                }
                .featured-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                @media (max-width: 992px) {
                    .trust-cards-grid {
                        grid-template-columns: repeat(2, 1fr);
                        margin: -20px auto 40px auto;
                    }
                }
                @media (max-width: 600px) {
                    .hero-search-form {
                        flex-direction: column;
                        gap: 10px;
                        padding: 12px;
                    }
                    .hero-search-btn {
                        width: 100%;
                        padding: 12px;
                    }
                    .trust-cards-grid {
                        grid-template-columns: 1fr;
                        margin: 20px auto 40px auto;
                        padding: 0 16px;
                    }
                }
            `}</style>

            {/* HERO SECTION */}
            <div className="home-hero">
                <img 
                    src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2000&auto=format&fit=crop" 
                    alt="Cars background" 
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} 
                />
                
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px', width: '100%' }}>
                    <div style={{ display: 'inline-block', padding: '6px 18px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '50px', fontWeight: '700', fontSize: '0.9em', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
                        Find. Choose. Drive.
                    </div>
                    <h1 className="hero-title">
                        Find the Car That Fits <span style={{ color: '#007bff' }}>Your Journey</span>
                    </h1>
                    <p className="hero-subtitle">
                        Explore quality cars, compare your options, and find your perfect drive with AutoMart.
                    </p>

                    {/* SEARCH BOX */}
                    <form onSubmit={handleSearch} className="hero-search-form">
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                            <Search size={20} color="#94a3b8" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by brand, model or budget..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="hero-search-input"
                        />
                        <button type="submit" className="hero-search-btn">
                            Search Cars
                        </button>
                    </form>
                </div>
            </div>

            {/* UNLOCK YOUR CAR'S BEST PRICE / VALUATION SECTION */}
            <div style={{ maxWidth: '960px', margin: '-45px auto 55px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e8f0',
                    padding: '36px 32px',
                    boxSizing: 'border-box'
                }}>
                    {/* Card Header */}
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.85rem)', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
                            Unlock Your Car's Best Price
                        </h2>
                        <p style={{ fontSize: '0.96rem', color: '#64748b', margin: 0 }}>
                            Enter your car plate number
                        </p>
                    </div>

                    {/* Registration Plate Form */}
                    <form onSubmit={handleValuationPlateSubmit} style={{ maxWidth: '640px', margin: '0 auto 30px' }}>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            alignItems: 'stretch'
                        }}>
                            {/* License Plate Styled Input Container */}
                            <div style={{
                                flex: '1 1 320px',
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#ffffff',
                                border: valPlateError ? '2px solid #ef4444' : '2px solid #0f172a',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}>
                                {/* Blue Indian "IND" Strip */}
                                <div style={{
                                    backgroundColor: '#0284c7',
                                    color: '#ffffff',
                                    padding: '12px 14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '2px',
                                    borderRight: '1.5px solid rgba(255,255,255,0.2)',
                                    userSelect: 'none'
                                }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                    </div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '900', letterSpacing: '0.5px' }}>IND</span>
                                </div>

                                {/* Plate Text Input */}
                                <input 
                                    type="text"
                                    value={valPlateNumber}
                                    onChange={handleValPlateChange}
                                    placeholder="DL  03  AB  XXXX"
                                    aria-label="Car Registration Plate Number"
                                    style={{
                                        flex: 1,
                                        padding: '14px 16px',
                                        fontSize: '1.18rem',
                                        fontWeight: '800',
                                        letterSpacing: '2.5px',
                                        color: '#0f172a',
                                        border: 'none',
                                        outline: 'none',
                                        textTransform: 'uppercase',
                                        fontFamily: "'Courier New', Courier, monospace, 'Inter', sans-serif",
                                        boxSizing: 'border-box'
                                    }}
                                />

                                {/* Detected state badge inside input */}
                                {valDetectedState && (
                                    <div style={{
                                        marginRight: '12px',
                                        padding: '4px 10px',
                                        backgroundColor: '#f0fdf4',
                                        color: '#16a34a',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        border: '1px solid #bbf7d0'
                                    }}>
                                        <span>📍</span> {valDetectedState}
                                    </div>
                                )}
                            </div>

                            {/* Primary Action Button */}
                            <button 
                                type="submit"
                                style={{
                                    padding: '14px 28px',
                                    background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)',
                                    transition: 'transform 0.15s, box-shadow 0.2s',
                                    flex: '1 1 auto',
                                    minWidth: '220px'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <span>Get Instant Car Price</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>

                        {/* Validation error notification */}
                        {valPlateError && (
                            <div style={{
                                marginTop: '12px',
                                color: '#ef4444',
                                fontSize: '0.88rem',
                                fontWeight: '600',
                                textAlign: 'left'
                            }}>
                                ⚠️ {valPlateError}
                            </div>
                        )}
                    </form>

                    {/* Divider with OR */}
                    <div style={{
                        position: 'relative',
                        textAlign: 'center',
                        margin: '36px 0 28px'
                    }}>
                        <div style={{ height: '1px', backgroundColor: '#e2e8f0', width: '100%' }} />
                        <span style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#ffffff',
                            padding: '4px 18px',
                            color: '#64748b',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0'
                        }}>
                            OR
                        </span>
                    </div>

                    {/* Section: Select Your Brands */}
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '18px'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                                    Select Your Brands
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                    Choose your manufacturer to begin valuation
                                </p>
                            </div>

                            <Link 
                                to="/sell-used-cars"
                                style={{
                                    textDecoration: 'none',
                                    color: '#0284c7',
                                    fontWeight: '700',
                                    fontSize: '0.92rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <span>View All Brands</span>
                                <ArrowRight size={15} />
                            </Link>
                        </div>

                        {/* Horizontal Brand Carousel */}
                        <div style={{ position: 'relative' }}>
                            {canScrollLeft && (
                                <button 
                                    type="button"
                                    onClick={() => scrollBrandCarousel('left')}
                                    aria-label="Previous Brands"
                                    style={{
                                        position: 'absolute',
                                        left: '-16px',
                                        top: '40%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 3,
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '50%',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #cbd5e1',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#1e293b'
                                    }}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}

                            {/* Scroll Track */}
                            <div 
                                ref={carouselRef}
                                onScroll={checkCarouselScroll}
                                style={{
                                    display: 'flex',
                                    gap: '16px',
                                    overflowX: 'auto',
                                    scrollBehavior: 'smooth',
                                    padding: '10px 4px 18px',
                                    WebkitOverflowScrolling: 'touch',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }}
                            >
                                {VALUATION_BRANDS.map((brand) => (
                                    <div 
                                        key={brand.id}
                                        onClick={() => handleBrandClick(brand)}
                                        style={{
                                            flex: '0 0 auto',
                                            width: '108px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            padding: '12px 6px',
                                            borderRadius: '16px',
                                            backgroundColor: '#ffffff',
                                            border: '1.5px solid #f1f5f9',
                                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                            userSelect: 'none'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.borderColor = '#0284c7';
                                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(2, 132, 199, 0.12)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.borderColor = '#f1f5f9';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Circular Logo Container */}
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '50%',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            margin: '0 auto 10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '12px',
                                            boxSizing: 'border-box'
                                        }}>
                                            <img 
                                                src={brand.logo} 
                                                alt={brand.name} 
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <div style={{
                                            fontSize: '0.82rem',
                                            fontWeight: '700',
                                            color: '#1e293b',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {brand.name}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {canScrollRight && (
                                <button 
                                    type="button"
                                    onClick={() => scrollBrandCarousel('right')}
                                    aria-label="Next Brands"
                                    style={{
                                        position: 'absolute',
                                        right: '-16px',
                                        top: '40%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 3,
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '50%',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #cbd5e1',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#1e293b'
                                    }}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FEATURED CARS */}
            <div style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 20px' }} id="results">
                <div className="featured-header-row">
                    <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2em)', color: '#1e293b', margin: 0 }}>
                        {isSearching ? `Search Results for "${searchQuery}"` : 'Newly Added Cars'}
                    </h2>
                    <Link to="/cars" style={{ padding: '8px 18px', border: '2px solid #007bff', color: '#007bff', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '0.95em', whiteSpace: 'nowrap' }}>
                        View All Cars
                    </Link>
                </div>
                
                <div className="featured-cars-grid">
                    {featuredCars.map(car => (
                        <div 
                            key={car._id} 
                            onClick={() => navigate(`/cars/${car._id}`)} 
                            className="car-card-hover"
                            style={{ 
                                backgroundColor: '#fff', 
                                borderRadius: '12px', 
                                overflow: 'hidden', 
                                border: '1px solid #e2e8f0', 
                                cursor: 'pointer', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 16px 24px -4px rgba(0, 0, 0, 0.12), 0 8px 12px -4px rgba(0, 0, 0, 0.06)';
                                const img = e.currentTarget.querySelector('.car-card-image');
                                if (img) img.style.transform = 'scale(1.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                                const img = e.currentTarget.querySelector('.car-card-image');
                                if (img) img.style.transform = 'scale(1)';
                            }}
                        >
                            <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                <img 
                                    className="car-card-image"
                                    src={car.images && car.images.length > 0 && car.images[0] ? car.images[0] : 'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=800&auto=format&fit=crop'} 
                                    alt={car.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} 
                                />
                                {car.stock > 0 && (
                                    <div style={{ position: 'absolute', top: '15px', left: '15px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold', color: '#1e293b' }}>
                                        Assured
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1em', color: '#1e293b', fontWeight: '700' }}>{car.modelYear} {car.brand} {car.name}</h3>
                                <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '0.9em' }}>{car.condition || 'Good'} Condition</p>

                                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85em', color: '#475569', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                                    <span>⛽ {car.fuelType}</span>
                                    <span>⚙️ {car.transmission || 'Manual'}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#1e293b' }}>₹{car.price?.toLocaleString()}</div>
                                    <div style={{ color: '#007bff', fontWeight: '600', fontSize: '0.9em' }}>View Details</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CUSTOMER REVIEWS & FEEDBACK HIGHLIGHT */}
            <div style={{ backgroundColor: '#f8fafc', padding: '60px 20px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                <Star size={15} fill="#f59e0b" color="#f59e0b" /> Verified AutoMart Community
                            </div>
                            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: '#0f172a', margin: '0 0 8px 0', fontWeight: 800 }}>
                                What Our Customers Say
                            </h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>
                                {websiteStats.totalReviews > 0 ? (
                                    <span>Rated <strong style={{ color: '#0f172a' }}>{websiteStats.averageRating.toFixed(1)} / 5</strong> based on {websiteStats.totalReviews} verified customer reviews</span>
                                ) : (
                                    <span>Real feedback from drivers who found their perfect match with AutoMart.</span>
                                )}
                            </p>
                        </div>

                        <Link 
                            to="/feedback" 
                            style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                padding: '10px 20px', 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #007bff', 
                                color: '#007bff', 
                                borderRadius: '8px', 
                                fontWeight: 700, 
                                textDecoration: 'none', 
                                fontSize: '0.95rem',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 6px rgba(0, 123, 255, 0.1)'
                            }}
                        >
                            <MessageSquare size={16} /> View All & Give Feedback <ArrowRight size={16} />
                        </Link>
                    </div>

                    {recentReviews.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px' }}>
                            {recentReviews.map((rev) => (
                                <div key={rev._id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', gap: '3px' }}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star 
                                                        key={s} 
                                                        size={16} 
                                                        fill={s <= rev.rating ? '#f59e0b' : '#e2e8f0'} 
                                                        color={s <= rev.rating ? '#f59e0b' : '#cbd5e1'} 
                                                    />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <ShieldCheck size={12} /> Verified
                                            </span>
                                        </div>

                                        {rev.title && (
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: 700 }}>
                                                {rev.title}
                                            </h4>
                                        )}
                                        <p style={{ margin: '0 0 16px 0', color: '#475569', fontSize: '0.92rem', lineHeight: '1.6' }}>
                                            "{rev.comment}"
                                        </p>
                                    </div>

                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                                            {rev.userName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{rev.userName}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{new Date(rev.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', padding: '36px 20px', textAlign: 'center' }}>
                            <MessageSquare size={32} color="#0284c7" style={{ marginBottom: '8px' }} />
                            <h3 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.15rem' }}>No reviews yet. Be the first to share your experience!</h3>
                            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.9rem' }}>Share your feedback on AutoMart car listings, customer care, and checkout process.</p>
                            <Link to="/feedback" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#007bff', color: '#ffffff', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
                                Share Your Experience
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

const TrustCard = ({ icon, title, desc }) => (
    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid #f1f5f9' }}>
        <div style={{ width: '60px', height: '60px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
            {icon}
        </div>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1em', color: '#1e293b' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '0.9em', color: '#64748b' }}>{desc}</p>
    </div>
);

const BrandBadge = ({ name, logo, onClick }) => (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '120px', cursor: 'pointer' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'transform 0.2s' }}>
            <img src={logo} alt={name} style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
        </div>
        <span style={{ fontWeight: '500', color: '#334155' }}>{name}</span>
    </div>
);

export default Home;
