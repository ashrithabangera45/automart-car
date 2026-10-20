import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart, CheckCircle, ShieldCheck, MapPin, Map, User, Cog, Calendar, FileText, Phone, Mail, Award, Check, ChevronLeft, ChevronRight, Video, ExternalLink, VideoOff, Box, Image as ImageIcon } from 'lucide-react';
import FeedbackSection from '../components/FeedbackSection';
import CarViewer360 from '../components/CarViewer360';


const extractYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const clean = url.trim();
    if (!clean) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
    const match = clean.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
};

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const location = useLocation();
    const [isProcessing, setIsProcessing] = useState(false);
    const { user, updateCartCount, updateWishlistCount } = useContext(AuthContext);
    const { showToast } = useToast();
    
    const [mainImage, setMainImage] = useState('');
    const [viewMode, setViewMode] = useState('gallery'); // 'gallery' or '3d'
    const [activeTab, setActiveTab] = useState('features'); // 'features' or 'specs'
    const [similarCars, setSimilarCars] = useState([]);
    const [wishlist, setWishlist] = useState(new Set());
    const [galleryDragging, setGalleryDragging] = useState(false);
    const galleryDragStartXRef = useRef(null);
    const galleryDragStartIndexRef = useRef(0);
    const scrollRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get(`http://localhost:5000/api/cars/${id}`).then(res => {
            setCar(res.data);
            if (res.data.images && res.data.images.length > 0) {
                setMainImage(res.data.images[0]);
            }
            if (res.data.model3d && res.data.model3d.trim()) {
                setViewMode('3d');
            } else {
                setViewMode('gallery');
            }
            
            // Fetch similar cars
            axios.get(`http://localhost:5000/api/cars/${id}/similar`)
                .then(simRes => setSimilarCars(simRes.data))
                .catch(err => console.error("Error fetching similar cars", err));
                
        }).catch(err => {
            console.error(err);
            setCar(false); // false indicates error or not found
        });

        // Check if wishlisted
        if (user && user.token) {
            axios.get('http://localhost:5000/api/wishlist', { headers: { Authorization: `Bearer ${user.token}` }})
                 .then(res => setWishlist(new Set(res.data.map(item => item.carId?._id || item.carId))))
                 .catch(err => console.error(err));
        } else {
            setWishlist(new Set());
        }
    }, [id, user]);

    useEffect(() => {
        if (car) {
            document.title = `${car.brand || ''} ${car.name || ''} ${car.variant || ''} | AutoMart`.trim();
            let meta = document.querySelector('meta[name="description"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = 'description';
                document.head.appendChild(meta);
            }
            meta.content = `Buy ${car.brand || ''} ${car.name || ''} at AutoMart. Explore premium features, specs, and price.`;
        }
    }, [car]);

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' });

    useEffect(() => {
        if (!car || !user || !user.token) return;

        if (location.state?.autoBuy) {
            navigate(`/checkout?carId=${car._id}`, { replace: true });
        } else if (location.state?.autoCart) {
            handleAddToCartItem(null, car);
            navigate(location.pathname, { replace: true, state: {} });
        } else if (location.state?.autoWishlist) {
            toggleWishlist(null, location.state.fromCar || car._id);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [car, location.state, user, navigate]);

    const handleBuyNow = () => {
        if (!user || !user.token) {
            showToast({
                title: 'Login Required',
                message: 'Please login or register to complete your car purchase.',
                type: 'info',
                actionText: 'Login Now',
                actionLink: '/user/login'
            });
            navigate('/user/login', { state: { autoBuy: true, fromCar: id } });
            return;
        }
        navigate(`/checkout?carId=${car._id}`);
    };

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
                    from: location.pathname, 
                    fromCar: carId || id, 
                    autoWishlist: true 
                } 
            });
        }
        try {
            if (wishlist.has(carId)) {
                await axios.delete(`http://localhost:5000/api/wishlist/${carId}`, { headers: { Authorization: `Bearer ${user.token}` }});
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
                await axios.post('http://localhost:5000/api/wishlist', { carId }, { headers: { Authorization: `Bearer ${user.token}` }});
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
                    from: location.pathname, 
                    fromCar: targetCar._id || id, 
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
            await axios.post('http://localhost:5000/api/cart', { carId: targetCar._id, price: targetCar.price }, { headers: { Authorization: `Bearer ${user.token}` }});
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

    if (car === null) return <div style={{ padding: '50px', textAlign: 'center' }}><h2>Loading Car Details...</h2></div>;
    
    if (car === false) return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Car not found</h2>
            <button onClick={() => navigate('/cars')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>Back to Cars</button>
        </div>
    );

    const formatPrice = (p) => `₹${p?.toLocaleString('en-IN')}`;

    const originalPrice = car.price + (car.discount || 0);

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '50px' }}>
            <style>{`
                .cardetails-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .cardetails-layout {
                    display: flex;
                    flex-direction: row;
                    gap: 30px;
                    flex-wrap: wrap;
                }
                .cardetails-left {
                    flex: 1 1 60%;
                    min-width: 0;
                }
                .cardetails-right {
                    flex: 1 1 35%;
                    min-width: 0;
                }
                .cardetails-overview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 20px;
                }
                .cardetails-features-list {
                    column-count: 2;
                    column-gap: 40px;
                    margin: 0;
                    padding: 0 0 0 20px;
                    color: #475569;
                    line-height: 2;
                }
                @media (max-width: 992px) {
                    .cardetails-layout {
                        flex-direction: column;
                        gap: 20px;
                    }
                    .cardetails-left, .cardetails-right {
                        flex: 1 1 100%;
                        width: 100%;
                    }
                }
                .cardetails-reasons-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                .cardetails-reason-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background-color: #f8fafc;
                    padding: 14px 16px;
                    border-radius: 8px;
                    border: 1px solid #f1f5f9;
                    min-height: 52px;
                    box-sizing: border-box;
                    transition: all 0.2s ease;
                }
                .cardetails-reason-item.span-full {
                    grid-column: 1 / -1;
                }
                @media (max-width: 640px) {
                    .cardetails-reasons-grid {
                        grid-template-columns: 1fr;
                    }
                    .cardetails-reason-item.span-full {
                        grid-column: auto;
                    }
                }
                @media (max-width: 600px) {
                    .cardetails-container {
                        padding: 14px 12px;
                    }
                    .cardetails-overview-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 14px;
                    }
                    .cardetails-features-list {
                        column-count: 1;
                        padding-left: 16px;
                    }
                }
                .car-video-preview-card:hover .car-video-thumb {
                    transform: scale(1.05);
                }
                .car-video-preview-card:hover .car-video-play-btn {
                    transform: translate(-50%, -50%) scale(1.15) !important;
                    background-color: #cc0000 !important;
                }
            `}</style>
            <div className="cardetails-container">
                <div style={{ marginBottom: '20px', fontSize: '0.9em', color: '#64748b', fontWeight: 'bold', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '4px' }}>
                    <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Home</Link> / <Link to="/cars" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Cars</Link> / {car.brand} {car.name}
                </div>

                <div className="cardetails-layout">
                    
                    {/* LEFT COLUMN: Gallery & Details */}
                    <div className="cardetails-left">
                        
                        {/* GALLERY WITH 360° 3D VIEWER & MULTI-ANGLE SUPPORT */}
                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            
                            {/* Mode Switcher Tabs if 3D model is available */}
                            {car.model3d && (
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '8px', 
                                    marginBottom: '14px', 
                                    borderBottom: '1px solid #e2e8f0', 
                                    paddingBottom: '10px' 
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('3d')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '7px',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            border: viewMode === '3d' ? '1px solid #0284c7' : '1px solid #e2e8f0',
                                            backgroundColor: viewMode === '3d' ? '#e0f2fe' : '#f8fafc',
                                            color: viewMode === '3d' ? '#0369a1' : '#64748b',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Box size={17} color={viewMode === '3d' ? '#0284c7' : '#64748b'} />
                                        <span>360° 3D View</span>
                                        <span style={{ 
                                            fontSize: '0.65rem', 
                                            backgroundColor: '#0284c7', 
                                            color: '#fff', 
                                            padding: '1px 6px', 
                                            borderRadius: '10px',
                                            fontWeight: 700
                                        }}>3D</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setViewMode('gallery')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '7px',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            border: viewMode === 'gallery' ? '1px solid #0284c7' : '1px solid #e2e8f0',
                                            backgroundColor: viewMode === 'gallery' ? '#e0f2fe' : '#f8fafc',
                                            color: viewMode === 'gallery' ? '#0369a1' : '#64748b',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <ImageIcon size={17} color={viewMode === 'gallery' ? '#0284c7' : '#64748b'} />
                                        <span>Photo Gallery ({car.images?.length || 0})</span>
                                    </button>
                                </div>
                            )}

                            {/* Viewport Area: 3D Model or Photo Gallery */}
                            {car.model3d && viewMode === '3d' ? (
                                <CarViewer360 
                                    modelUrl={car.model3d} 
                                    carName={car.name} 
                                    onSwitchToGallery={() => setViewMode('gallery')} 
                                />
                            ) : (
                                <div 
                                    style={{ 
                                        position: 'relative', 
                                        width: '100%', 
                                        borderRadius: '10px', 
                                        overflow: 'hidden', 
                                        backgroundColor: '#0f172a',
                                        cursor: car.images && car.images.length > 1 ? (galleryDragging ? 'grabbing' : 'grab') : 'default',
                                        touchAction: 'none',
                                        userSelect: 'none'
                                    }}
                                    onPointerDown={(e) => {
                                        if (!car.images || car.images.length <= 1) return;
                                        if (e.button !== undefined && e.button !== 0) return;
                                        setGalleryDragging(true);
                                        galleryDragStartXRef.current = e.clientX;
                                        const currentIdx = car.images.indexOf(mainImage);
                                        galleryDragStartIndexRef.current = currentIdx >= 0 ? currentIdx : 0;
                                        try {
                                            e.currentTarget.setPointerCapture(e.pointerId);
                                        } catch {
                                            // Ignore if pointer capture fails
                                        }
                                    }}
                                    onPointerMove={(e) => {
                                        if (!galleryDragging || !car.images || car.images.length <= 1 || galleryDragStartXRef.current === null) return;
                                        const deltaX = e.clientX - galleryDragStartXRef.current;
                                        // Pixels of horizontal drag needed per frame
                                        const pixelsPerFrame = 40;
                                        const frameOffset = Math.round(deltaX / pixelsPerFrame);
                                        const totalFrames = car.images.length;
                                        // Calculate wrapped index
                                        let newIndex = (galleryDragStartIndexRef.current + frameOffset) % totalFrames;
                                        if (newIndex < 0) newIndex += totalFrames;
                                        if (car.images[newIndex] && car.images[newIndex] !== mainImage) {
                                            setMainImage(car.images[newIndex]);
                                        }
                                    }}
                                    onPointerUp={(e) => {
                                        setGalleryDragging(false);
                                        galleryDragStartXRef.current = null;
                                        try {
                                            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                                                e.currentTarget.releasePointerCapture(e.pointerId);
                                            }
                                        } catch {
                                            // Ignore
                                        }
                                    }}
                                    onPointerCancel={() => {
                                        setGalleryDragging(false);
                                        galleryDragStartXRef.current = null;
                                    }}
                                >
                                    <img 
                                        src={mainImage || 'https://via.placeholder.com/800x500?text=No+Image'} 
                                        alt={car.name} 
                                        draggable={false}
                                        style={{ width: '100%', height: 'auto', maxHeight: '500px', minHeight: '260px', objectFit: 'contain', display: 'block', margin: '0 auto', transition: 'filter 0.2s ease', userSelect: 'none', pointerEvents: 'none' }} 
                                    />

                                    {/* Assured Badge */}
                                    {car.stock > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '16px',
                                            left: '16px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            padding: '4px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            color: '#1e293b',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            zIndex: 2,
                                            pointerEvents: 'none',
                                            letterSpacing: '0.3px'
                                        }}>
                                            Assured
                                        </div>
                                    )}

                                    {/* Prev / Next Angle Navigation Arrows */}
                                    {car.images && car.images.length > 1 && (
                                        <>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const currentIndex = car.images.indexOf(mainImage);
                                                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : car.images.length - 1;
                                                    setMainImage(car.images[prevIndex]);
                                                }}
                                                aria-label="Previous angle"
                                                style={{
                                                    position: 'absolute',
                                                    left: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    backdropFilter: 'blur(4px)',
                                                    transition: 'background-color 0.2s',
                                                    zIndex: 2
                                                }}
                                            >
                                                <ChevronLeft size={24} />
                                            </button>

                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const currentIndex = car.images.indexOf(mainImage);
                                                    const nextIndex = currentIndex < car.images.length - 1 ? currentIndex + 1 : 0;
                                                    setMainImage(car.images[nextIndex]);
                                                }}
                                                aria-label="Next angle"
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    backdropFilter: 'blur(4px)',
                                                    transition: 'background-color 0.2s',
                                                    zIndex: 2
                                                }}
                                            >
                                                <ChevronRight size={24} />
                                            </button>

                                            {/* Helper indicator when multi-images available */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '16px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                                                color: '#e2e8f0',
                                                padding: '6px 16px',
                                                borderRadius: '20px',
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                letterSpacing: '0.3px',
                                                backdropFilter: 'blur(6px)',
                                                zIndex: 2,
                                                pointerEvents: 'none',
                                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                Click and drag to rotate 360°
                                            </div>
                                        </>
                                    )}

                                    {/* Angle / Photo Counter Badge */}
                                    {car.images && car.images.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '12px',
                                            right: '12px',
                                            backgroundColor: 'rgba(15, 23, 42, 0.75)',
                                            color: '#fff',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            backdropFilter: 'blur(6px)',
                                            zIndex: 2,
                                            letterSpacing: '0.5px'
                                        }}>
                                            Angle {Math.max(1, car.images.indexOf(mainImage) + 1)} / {car.images.length}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Angle Thumbnails Carousel */}
                            <div style={{ marginTop: '14px' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Vehicle Angles & Views ({car.images?.length || 0})
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
                                    {car.images?.map((img, i) => {
                                        const isSelected = mainImage === img;
                                        // Standard car photography angle labels
                                        const angleLabels = ['Front View', 'Side Profile', 'Rear View', 'Interior Cabin', 'Dashboard', 'Engine Bay', 'Boot / Trunk', 'Wheel / Alloy'];
                                        const label = angleLabels[i] || `View ${i + 1}`;

                                        return (
                                            <div 
                                                key={i} 
                                                onClick={() => {
                                                    setMainImage(img);
                                                    setViewMode('gallery');
                                                }}
                                                style={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    alignItems: 'center', 
                                                    cursor: 'pointer',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <div style={{
                                                    width: '100px',
                                                    height: '70px',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    border: isSelected ? '3px solid #0284c7' : '2px solid #e2e8f0',
                                                    boxShadow: isSelected ? '0 0 0 2px rgba(2, 132, 199, 0.25)' : 'none',
                                                    transition: 'all 0.2s ease',
                                                    backgroundColor: '#f8fafc'
                                                }}>
                                                    <img 
                                                        src={img} 
                                                        alt={label} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSelected ? 1 : 0.7 }}
                                                    />
                                                </div>
                                                <span style={{ 
                                                    fontSize: '0.72rem', 
                                                    fontWeight: isSelected ? 700 : 500, 
                                                    color: isSelected ? '#0284c7' : '#64748b', 
                                                    marginTop: '4px',
                                                    textAlign: 'center',
                                                    maxWidth: '100px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* QUICK OVERVIEW */}
                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.3em', color: '#1e293b' }}>Car Overview</h2>
                            <div className="cardetails-overview-grid">
                                {car.registrationYear && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>Registration Year</div><div style={{ fontWeight: '600' }}>{car.registrationYear}</div></div>}
                                {car.fuelType && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>Fuel Type</div><div style={{ fontWeight: '600' }}>{car.fuelType}</div></div>}
                                {car.kmDriven && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>KM Driven</div><div style={{ fontWeight: '600' }}>{car.kmDriven.toLocaleString()} km</div></div>}
                                {car.transmission && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>Transmission</div><div style={{ fontWeight: '600' }}>{car.transmission}</div></div>}
                                {car.engineCapacity && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>Engine Capacity</div><div style={{ fontWeight: '600' }}>{car.engineCapacity}</div></div>}
                                {car.owners && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>Ownership</div><div style={{ fontWeight: '600' }}>{car.owners} {car.owners === 1 ? 'Owner' : 'Owners'}</div></div>}
                                {car.manufacturingYear && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>Manufacturing Year</div><div style={{ fontWeight: '600' }}>{car.manufacturingYear}</div></div>}
                                {car.spareKey !== undefined && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>Spare Key</div><div style={{ fontWeight: '600' }}>{car.spareKey ? 'Available' : 'No'}</div></div>}
                                {car.registrationNumber && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>Registration No.</div><div style={{ fontWeight: '600' }}>{car.registrationNumber}</div></div>}
                                {car.bodyType && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>Body Type</div><div style={{ fontWeight: '600' }}>{car.bodyType}</div></div>}
                                {car.colour && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>Colour</div><div style={{ fontWeight: '600' }}>{car.colour}</div></div>}
                                {car.seatingCapacity && <div><div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '4px' }}>Seating Capacity</div><div style={{ fontWeight: '600' }}>{car.seatingCapacity}</div></div>}
                            </div>
                        </div>

                        {/* REASONS TO BUY */}
                        {(() => {
                            const validReasons = (car.reasonsToBuy || []).filter(r => typeof r === 'string' && r.trim().length > 0);
                            if (validReasons.length === 0) return null;

                            return (
                                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px 20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                                    <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25em', color: '#1e293b', fontWeight: '800' }}>Reasons to buy this car</h2>
                                    <div className="cardetails-reasons-grid">
                                        {validReasons.map((reason, idx) => {
                                            const isLastOdd = validReasons.length % 2 !== 0 && idx === validReasons.length - 1;
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className={`cardetails-reason-item ${isLastOdd ? 'span-full' : ''}`}
                                                    style={isLastOdd ? { gridColumn: '1 / -1' } : {}}
                                                >
                                                    <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                                                    <span style={{ fontWeight: '500', color: '#334155', fontSize: '0.92rem', lineHeight: '1.4' }}>{reason.trim()}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* TOP FEATURES */}
                        {car.features && car.features.length > 0 && (
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                                <h2 style={{ margin: '0 0 20px 0', fontSize: '1.3em', color: '#1e293b' }}>Top Features</h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {car.features.map((feature, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '20px', color: '#475569', fontSize: '0.9em' }}>
                                            <Award size={16} color="#007bff" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CAR DESCRIPTION */}
                        {car.description && (
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                                <h2 style={{ margin: '0 0 15px 0', fontSize: '1.3em', color: '#1e293b' }}>About this car</h2>
                                <p style={{ lineHeight: '1.7', color: '#475569', whiteSpace: 'pre-wrap' }}>{car.description}</p>
                            </div>
                        )}

                        {/* FEATURES & SPECIFICATIONS TABS */}
                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '0', border: '1px solid #e2e8f0', marginBottom: '20px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                                <button onClick={() => setActiveTab('features')} style={{ flex: 1, padding: '14px', border: 'none', background: 'none', fontSize: '1.05em', fontWeight: 'bold', color: activeTab === 'features' ? '#007bff' : '#64748b', borderBottom: activeTab === 'features' ? '3px solid #007bff' : '3px solid transparent', cursor: 'pointer' }}>Features</button>
                                <button onClick={() => setActiveTab('specs')} style={{ flex: 1, padding: '14px', border: 'none', background: 'none', fontSize: '1.05em', fontWeight: 'bold', color: activeTab === 'specs' ? '#007bff' : '#64748b', borderBottom: activeTab === 'specs' ? '3px solid #007bff' : '3px solid transparent', cursor: 'pointer' }}>Specifications</button>
                            </div>
                            <div style={{ padding: '20px' }}>
                                {activeTab === 'features' ? (
                                    <ul className="cardetails-features-list">
                                        {car.features?.map((f, i) => <li key={i}>{f}</li>)}
                                        {(!car.features || car.features.length === 0) && <li>No features added.</li>}
                                    </ul>
                                ) : (
                                    <div>
                                        {car.specifications && Object.keys(car.specifications).length > 0 ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                                {Object.entries(car.specifications).map(([key, val]) => (
                                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                                        <span style={{ color: '#64748b' }}>{key}</span>
                                                        <span style={{ fontWeight: '500', color: '#334155' }}>{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>No specifications added.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* INSPECTION REPORT */}
                        {car.inspection && Object.keys(car.inspection).length > 0 && (
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '25px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <FileText size={24} color="#007bff" />
                                    <h2 style={{ margin: 0, fontSize: '1.4em', color: '#1e293b' }}>Car Inspection Report</h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                    {car.inspection.accidentHistory && <div><div style={{ color: '#64748b', fontSize: '0.85em' }}>Accident History</div><div style={{ fontWeight: '500' }}><Check size={16} color="#16a34a" /> {car.inspection.accidentHistory}</div></div>}
                                    {car.inspection.odometerStatus && <div><div style={{ color: '#64748b', fontSize: '0.85em' }}>Odometer Status</div><div style={{ fontWeight: '500' }}><Check size={16} color="#16a34a" /> {car.inspection.odometerStatus}</div></div>}
                                    {car.inspection.waterDamage && <div><div style={{ color: '#64748b', fontSize: '0.85em' }}>Water Damage</div><div style={{ fontWeight: '500' }}><Check size={16} color="#16a34a" /> {car.inspection.waterDamage}</div></div>}
                                    {car.inspection.engineCondition && <div><div style={{ color: '#64748b', fontSize: '0.85em' }}>Engine Condition</div><div style={{ fontWeight: '500' }}><Check size={16} color="#16a34a" /> {car.inspection.engineCondition}</div></div>}
                                    {car.inspection.tyreCondition && <div><div style={{ color: '#64748b', fontSize: '0.85em' }}>Tyre Condition</div><div style={{ fontWeight: '500' }}><Check size={16} color="#16a34a" /> {car.inspection.tyreCondition}</div></div>}
                                    {car.inspection.overallStatus && <div><div style={{ color: '#64748b', fontSize: '0.85em' }}>Overall Status</div><div style={{ fontWeight: '500' }}><Check size={16} color="#16a34a" /> {car.inspection.overallStatus}</div></div>}
                                </div>
                                {car.inspection.notes && <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #007bff' }}><strong style={{ color: '#334155' }}>Inspection Notes:</strong><p style={{ margin: '5px 0 0 0', color: '#475569' }}>{car.inspection.notes}</p></div>}
                            </div>
                        )}

                        {/* WARRANTY & INSURANCE */}
                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '25px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <h2 style={{ fontSize: '1.2em', margin: '0 0 15px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={20} color="#16a34a"/> Warranty</h2>
                                {car.warranty && car.warranty.available ? (
                                    <div style={{ color: '#475569', lineHeight: '1.8' }}>
                                        <div><strong>Period:</strong> {car.warranty.period}</div>
                                        <div><strong>Start:</strong> {car.warranty.startDate ? new Date(car.warranty.startDate).toLocaleDateString() : 'N/A'}</div>
                                        <div><strong>End:</strong> {car.warranty.endDate ? new Date(car.warranty.endDate).toLocaleDateString() : 'N/A'}</div>
                                        {car.warranty.description && <div style={{ marginTop: '5px', fontSize: '0.9em' }}>{car.warranty.description}</div>}
                                    </div>
                                ) : (
                                    <div style={{ color: '#94a3b8' }}>Warranty information not available</div>
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <h2 style={{ fontSize: '1.2em', margin: '0 0 15px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={20} color="#007bff"/> Insurance</h2>
                                {car.insurance && car.insurance.available ? (
                                    <div style={{ color: '#475569', lineHeight: '1.8' }}>
                                        <div><strong>Provider:</strong> {car.insurance.provider}</div>
                                        <div><strong>Policy No:</strong> {car.insurance.policyNumber}</div>
                                        <div><strong>Start:</strong> {car.insurance.startDate ? new Date(car.insurance.startDate).toLocaleDateString() : 'N/A'}</div>
                                        <div><strong>Expiry:</strong> {car.insurance.expiryDate ? new Date(car.insurance.expiryDate).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                ) : (
                                    <div style={{ color: '#94a3b8' }}>Insurance information not available</div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Sticky Info & Buy */}
                    <div className="cardetails-right">
                        <div style={{ position: 'sticky', top: '20px' }}>
                            
                            {/* CAR HEADER & PRICE */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '25px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <h1 style={{ margin: '0 0 5px 0', fontSize: '1.6em', color: '#1e293b' }}>{car.modelYear} {car.brand} {car.name} {car.variant}</h1>
                                
                                <div style={{ marginTop: '4px', marginBottom: '8px' }}>
                                    <a 
                                        href="#reviews-section" 
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '5px', 
                                            color: '#0284c7', 
                                            fontSize: '0.86rem', 
                                            fontWeight: 600, 
                                            textDecoration: 'none',
                                            cursor: 'pointer'
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span style={{ color: '#f59e0b', fontSize: '1rem' }}>★</span>
                                        <span>Customer Reviews & Ratings</span>
                                    </a>
                                </div>
                                <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.9em', marginTop: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                    {car.kmDriven && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📏 {car.kmDriven.toLocaleString()} km</span>}
                                    {car.owners && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={14}/> {car.owners} Owner</span>}
                                    {car.transmission && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Cog size={14}/> {car.transmission}</span>}
                                    {car.fuelType && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>⛽ {car.fuelType}</span>}
                                </div>

                                {car.location?.city && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                                        <MapPin size={16} color="#007bff" />
                                        <span>{car.location.city}{car.location.state ? `, ${car.location.state}` : ''}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                                    <div>
                                        {car.discount > 0 && <div style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '1.1em' }}>{formatPrice(originalPrice)}</div>}
                                        <div style={{ fontSize: '2.2em', fontWeight: 'bold', color: '#1e293b', lineHeight: '1' }}>{formatPrice(car.price)}</div>
                                    </div>
                                    {car.discount > 0 && <div style={{ backgroundColor: '#dcfce3', color: '#166534', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9em' }}>{formatPrice(car.discount)} OFF</div>}
                                </div>

                                {car.stock > 0 && <div style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.2em', marginBottom: '15px' }}>✓ In Stock</div>}
                                {car.stock <= 0 && <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '1.2em', marginBottom: '15px' }}>🔴 OUT OF STOCK</div>}

                                {car.stock > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <button onClick={handleBuyNow} disabled={isProcessing} style={{ width: '100%', padding: '16px', backgroundColor: '#007bff', color: '#fff', fontSize: '1.1em', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1, transition: 'background-color 0.2s' }}>
                                            {isProcessing ? 'Processing...' : 'Buy Now'}
                                        </button>
                                        <button onClick={(e) => handleAddToCartItem(e, car)} style={{ width: '100%', padding: '16px', backgroundColor: '#fff', color: '#007bff', fontSize: '1.1em', fontWeight: 'bold', border: '2px solid #007bff', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                                            Add to Cart
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <button disabled style={{ width: '100%', padding: '16px', backgroundColor: '#94a3b8', color: '#fff', fontSize: '1.1em', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'not-allowed' }}>
                                            Buy Now - Disabled
                                        </button>
                                        <button disabled style={{ width: '100%', padding: '16px', backgroundColor: '#f1f5f9', color: '#94a3b8', fontSize: '1.1em', fontWeight: 'bold', border: '2px solid #cbd5e1', borderRadius: '8px', cursor: 'not-allowed' }}>
                                            Add to Cart - Disabled
                                        </button>
                                    </div>
                                )}

                                <button onClick={(e) => toggleWishlist(e, car._id)} style={{ width: '100%', padding: '12px', background: 'transparent', color: wishlist.has(car._id) ? '#ef4444' : '#475569', fontSize: '1em', fontWeight: '600', border: 'none', marginTop: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                                    <Heart size={18} fill={wishlist.has(car._id) ? '#ef4444' : 'none'} color={wishlist.has(car._id) ? '#ef4444' : 'currentColor'} style={{ transform: wishlist.has(car._id) ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s ease' }} /> 
                                    {wishlist.has(car._id) ? 'Added to Wishlist' : 'Add to Wishlist'}
                                </button>
                            </div>

                            {/* DEALER INFO */}
                            {car.dealer && car.dealer.name && (
                                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '25px', border: '1px solid #e2e8f0' }}>
                                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2em', color: '#1e293b' }}>Seller Information</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                        <div style={{ width: '50px', height: '50px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={24} color="#64748b" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#334155', fontSize: '1.1em' }}>{car.dealer.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.9em' }}>Verified Dealer</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#475569', fontSize: '0.95em' }}>
                                        {car.location?.address && <div style={{ display: 'flex', gap: '10px' }}><Map size={18} color="#94a3b8" /> <span>{car.location.address}</span></div>}
                                        {car.dealer.phone && <div style={{ display: 'flex', gap: '10px' }}><Phone size={18} color="#94a3b8" /> <span>{car.dealer.phone}</span></div>}
                                        {car.dealer.email && <div style={{ display: 'flex', gap: '10px' }}><Mail size={18} color="#94a3b8" /> <span>{car.dealer.email}</span></div>}
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        {car.dealer.phone && <a href={`tel:${car.dealer.phone}`} style={{ flex: 1, textAlign: 'center', padding: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold', textDecoration: 'none', borderRadius: '6px' }}>Call Dealer</a>}
                                        {car.dealer.email && <a href={`mailto:${car.dealer.email}`} style={{ flex: 1, textAlign: 'center', padding: '10px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 'bold', textDecoration: 'none', borderRadius: '6px' }}>Email Dealer</a>}
                                    </div>
                                </div>
                            )}

                            {/* CAR VIDEO SECTION */}
                            {(() => {
                                const videoId = extractYouTubeId(car.videoUrl);

                                return (
                                    <div 
                                        id="car-video-section" 
                                        style={{ 
                                            backgroundColor: '#fff', 
                                            borderRadius: '12px', 
                                            padding: '24px', 
                                            border: '1px solid #e2e8f0', 
                                            marginTop: '20px',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.2em', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Video size={20} color="#007bff" /> Car Video
                                            </h3>
                                            {videoId && (
                                                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 700, letterSpacing: '0.5px' }}>
                                                    YouTube Walkthrough
                                                </span>
                                            )}
                                        </div>

                                        {videoId ? (
                                            <div>
                                                <a
                                                    href={`https://www.youtube.com/watch?v=${videoId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="car-video-preview-card"
                                                    id="car-video-play-link"
                                                    style={{
                                                        display: 'block',
                                                        position: 'relative',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        textDecoration: 'none',
                                                        backgroundColor: '#000',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {/* 16:9 Aspect Ratio Video Thumbnail */}
                                                    <div style={{ width: '100%', aspectRatio: '16 / 9', position: 'relative', overflow: 'hidden' }}>
                                                        <img
                                                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                                            alt={`${car.brand} ${car.name} Video Tour`}
                                                            className="car-video-thumb"
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                display: 'block',
                                                                transition: 'transform 0.3s ease'
                                                            }}
                                                        />

                                                        {/* Dark Gradient Overlay */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)'
                                                        }} />

                                                        {/* Center Play Button Overlay */}
                                                        <div 
                                                            className="car-video-play-btn"
                                                            style={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                                width: '60px',
                                                                height: '42px',
                                                                backgroundColor: '#ff0000',
                                                                borderRadius: '12px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                                                                transition: 'transform 0.2s ease, background-color 0.2s ease'
                                                            }}
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        </div>

                                                        {/* Top-Right YouTube Badge */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '10px',
                                                            right: '10px',
                                                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                                            color: '#fff',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            YOUTUBE
                                                        </div>
                                                    </div>

                                                    {/* Card Footer Bar */}
                                                    <div style={{
                                                        padding: '12px 14px',
                                                        backgroundColor: '#0f172a',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '8px'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                                                                Watch Full Car Video on YouTube
                                                            </div>
                                                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                                                                Official video walkthrough for this vehicle
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '6px 12px',
                                                            backgroundColor: '#0284c7',
                                                            color: '#ffffff',
                                                            borderRadius: '6px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700,
                                                            flexShrink: 0
                                                        }}>
                                                            Watch <ExternalLink size={13} />
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                        ) : (
                                            <div style={{
                                                padding: '24px 16px',
                                                backgroundColor: '#f8fafc',
                                                borderRadius: '8px',
                                                border: '1px dashed #cbd5e1',
                                                textAlign: 'center',
                                                color: '#64748b'
                                            }}>
                                                <VideoOff size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                                                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                                                    No video available for this car
                                                </div>
                                                <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                                                    A video walkthrough has not been uploaded yet for this vehicle.
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                        </div>
                    </div>
                </div>

                {/* FEEDBACK & REVIEWS SECTION */}
                <FeedbackSection 
                    carId={id} 
                    targetTitle={`${car.brand || ''} ${car.name || ''} Owner Reviews`}
                    targetDescription={`Authentic ratings and verified reviews from people who bought or reviewed this ${car.brand} ${car.name}.`}
                    itemName={`${car.brand} ${car.name}`}
                />

                {/* SIMILAR CARS SECTION */}
                <div style={{ marginTop: '50px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.6em', color: '#1e293b', margin: 0 }}>Explore other cars</h2>
                        {similarCars.length > 0 && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={scrollLeft} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #cbd5e1', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><ChevronLeft size={24} color="#475569" /></button>
                                <button onClick={scrollRight} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #cbd5e1', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><ChevronRight size={24} color="#475569" /></button>
                            </div>
                        )}
                    </div>
                    
                    {similarCars.length > 0 ? (
                        <div ref={scrollRef} style={{ display: 'flex', gap: '20px', overflowX: 'auto', scrollBehavior: 'smooth', scrollSnapType: 'x mandatory', paddingBottom: '20px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                            <style>{`
                                div::-webkit-scrollbar { display: none; }
                            `}</style>
                            {similarCars.map(simCar => (
                                <div key={simCar._id} style={{ flex: '0 0 min(280px, 85vw)', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', scrollSnapAlign: 'start', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                    <div style={{ position: 'relative', height: '180px', cursor: 'pointer' }} onClick={() => navigate(`/cars/${simCar._id}`)}>
                                        <img src={simCar.images && simCar.images.length > 0 ? simCar.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'} alt={simCar.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ padding: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div onClick={() => navigate(`/cars/${simCar._id}`)} style={{ cursor: 'pointer' }}>
                                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1em', color: '#1e293b' }}>{simCar.modelYear} {simCar.brand} {simCar.name}</h3>
                                                {simCar.variant && <div style={{ fontSize: '0.85em', color: '#64748b' }}>{simCar.variant}</div>}
                                            </div>
                                            <div onClick={(e) => toggleWishlist(e, simCar._id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                                                <Heart 
                                                    size={22} 
                                                    fill={wishlist.has(simCar._id) ? '#ef4444' : 'none'} 
                                                    color={wishlist.has(simCar._id) ? '#ef4444' : '#94a3b8'} 
                                                    style={{ transition: 'all 0.2s ease', transform: wishlist.has(simCar._id) ? 'scale(1.15)' : 'scale(1)' }} 
                                                />
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '10px', fontSize: '0.8em', color: '#475569', marginTop: '12px', flexWrap: 'wrap' }}>
                                            {simCar.kmDriven && <span>📏 {simCar.kmDriven.toLocaleString()} km</span>}
                                            {simCar.fuelType && <span>⛽ {simCar.fuelType}</span>}
                                            {simCar.transmission && <span>⚙️ {simCar.transmission}</span>}
                                        </div>

                                        {simCar.location?.city && (
                                            <div style={{ fontSize: '0.8em', color: '#64748b', marginTop: '8px' }}>
                                                📍 {simCar.location.city}{simCar.location.state ? `, ${simCar.location.state}` : ''}
                                            </div>
                                        )}

                                        <div style={{ marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
                                            <div>
                                                {simCar.discount > 0 && <div style={{ fontSize: '0.8em', color: '#94a3b8', textDecoration: 'line-through' }}>₹{(simCar.price + simCar.discount).toLocaleString('en-IN')}</div>}
                                                <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#1e293b' }}>₹{simCar.price?.toLocaleString('en-IN')}</div>
                                                <div style={{ marginTop: '4px', fontSize: '0.85em', fontWeight: 'bold', color: simCar.stock > 0 ? '#16a34a' : '#dc2626' }}>
                                                    {simCar.stock > 0 ? '✓ In Stock' : '🔴 OUT OF STOCK'}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <button 
                                                    onClick={(e) => handleAddToCartItem(e, simCar)} 
                                                    disabled={simCar.stock <= 0}
                                                    style={{ backgroundColor: simCar.stock > 0 ? '#007bff' : '#f1f5f9', color: simCar.stock > 0 ? '#fff' : '#94a3b8', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85em', cursor: simCar.stock > 0 ? 'pointer' : 'not-allowed' }}
                                                >
                                                    Add to Cart
                                                </button>
                                                <button onClick={() => navigate(`/cars/${simCar._id}`)} style={{ backgroundColor: '#fff', color: '#007bff', border: '1px solid #007bff', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85em', cursor: 'pointer' }}>
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                            No other cars available
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CarDetails;
