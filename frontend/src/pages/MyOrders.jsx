import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
    ChevronDown, 
    ChevronUp, 
    Truck, 
    CheckCircle2, 
    Clock, 
    MapPin, 
    Calendar, 
    CreditCard, 
    Package, 
    ShieldCheck, 
    Fuel, 
    Gauge, 
    Users, 
    ShoppingBag
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default marker icons in Vite/bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom high-contrast SVG divIcons for markers matching Pic 3
const truckPinIcon = L.divIcon({
    className: 'custom-truck-pin',
    html: `
        <div style="background-color: #0284c7; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(2,132,199,0.5); border: 2.5px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
        </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
});

const showroomPinIcon = L.divIcon({
    className: 'custom-showroom-pin',
    html: `
        <div style="background-color: #1e293b; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 2.5px solid white;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
});

const destinationPinIcon = L.divIcon({
    className: 'custom-dest-pin',
    html: `
        <div style="background-color: #10b981; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(16,185,129,0.4); border: 2.5px solid white;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -30]
});

const STATUS_STEPS = [
    'Pending',
    'Confirmed',
    'Processing',
    'Dispatched',
    'Out for Delivery',
    'Delivered'
];

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState({});

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
            setLoading(false);
            return;
        }

        axios.get('http://localhost:5000/api/orders/myorders', { 
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            setOrders(data);
            // Expand the first order by default so the user immediately sees the rich details
            if (data.length > 0) {
                setExpandedOrders({ [data[0]._id]: true });
            }
            setLoading(false);
        })
        .catch(err => {
            console.error('Failed to load orders:', err);
            setLoading(false);
        });
    }, []);

    const toggleOrder = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return '#0284c7'; // Vibrant Blue as in Pic 1
            case 'Out for Delivery': return '#0ea5e9';
            case 'Dispatched': return '#3b82f6';
            case 'Processing': return '#f59e0b';
            case 'Confirmed': return '#10b981';
            case 'Cancelled': return '#ef4444';
            default: return '#64748b';
        }
    };

    // Calculate map coordinates based on delivery state and order progress
    const getMapCoordinates = (order) => {
        // Showroom / Hub: Bengaluru
        const hub = [12.9716, 77.5946];

        const stateLower = (order.state || '').trim().toLowerCase();
        const cityLower = (order.deliveryAddress || '').trim().toLowerCase();

        // Destination coordinate map
        let destination = [13.0827, 80.2707]; // Chennai default (shows East coast route like Pic 3)

        if (stateLower.includes('karnataka') || cityLower.includes('bangalore') || cityLower.includes('bengaluru')) {
            destination = [12.9716, 77.5946];
        } else if (stateLower.includes('telangana') || cityLower.includes('hyderabad')) {
            destination = [17.3850, 78.4867];
        } else if (stateLower.includes('maharashtra') || cityLower.includes('mumbai')) {
            destination = [19.0760, 72.8777];
        } else if (stateLower.includes('delhi')) {
            destination = [28.6139, 77.2090];
        } else if (stateLower.includes('kerala') || cityLower.includes('kochi')) {
            destination = [9.9312, 76.2673];
        } else if (stateLower.includes('andhra') || cityLower.includes('vijayawada')) {
            destination = [16.5062, 80.6480];
        }

        // Calculate vehicle transit position based on orderStatus
        const status = order.orderStatus || 'Pending';
        let factor = 0.05;
        if (status === 'Confirmed') factor = 0.15;
        else if (status === 'Processing') factor = 0.35;
        else if (status === 'Dispatched') factor = 0.60;
        else if (status === 'Out for Delivery') factor = 0.88;
        else if (status === 'Delivered') factor = 1.0;

        const current = [
            hub[0] + (destination[0] - hub[0]) * factor,
            hub[1] + (destination[1] - hub[1]) * factor
        ];

        return { hub, destination, current };
    };

    if (loading) {
        return (
            <div style={{ maxWidth: '1100px', margin: '60px auto', padding: '20px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '14px', fontSize: '1rem', fontWeight: 500 }}>Loading your orders & tracking...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="orders-page-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px 60px', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                @media (max-width: 640px) {
                    .orders-page-container {
                        padding: 16px 10px 40px !important;
                    }
                    .orders-card-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 10px !important;
                        padding: 14px 16px !important;
                    }
                    .orders-card-header-right {
                        width: 100% !important;
                        justify-content: space-between !important;
                    }
                    .orders-car-overview {
                        flex-direction: column !important;
                    }
                    .orders-car-img {
                        width: 100% !important;
                        height: 180px !important;
                    }
                    .orders-specs-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .orders-address-col {
                        border-left: none !important;
                        border-top: 1px solid #e2e8f0 !important;
                        padding-left: 0 !important;
                        padding-top: 16px !important;
                    }
                }
                .orders-stepper-container {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    padding-bottom: 12px;
                }
                .orders-stepper-inner {
                    position: relative;
                    margin: 0 auto;
                    min-width: 540px;
                }
            `}</style>
            
            {/* Page Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                        My Orders & Tracking
                    </h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>
                        Monitor your car delivery status, real-time route tracking, and purchase specifications.
                    </p>
                </div>
                <Link 
                    to="/cars" 
                    style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '10px 18px', 
                        backgroundColor: '#0284c7', 
                        color: '#fff', 
                        borderRadius: '8px', 
                        textDecoration: 'none', 
                        fontWeight: 600, 
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
                    }}
                >
                    <ShoppingBag size={17} /> Browse More Cars
                </Link>
            </div>

            {orders.length === 0 ? (
                <div style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '14px', 
                    border: '1px solid #e2e8f0', 
                    padding: '60px 20px', 
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}>
                    <Package size={52} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>No Orders Found</h3>
                    <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '0.95rem' }}>
                        You have not placed any car orders yet. Explore our showroom and drive home your dream car today!
                    </p>
                    <Link 
                        to="/cars" 
                        style={{ 
                            display: 'inline-block', 
                            padding: '11px 24px', 
                            backgroundColor: '#0284c7', 
                            color: '#fff', 
                            borderRadius: '8px', 
                            textDecoration: 'none', 
                            fontWeight: 600 
                        }}
                    >
                        Explore Cars
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    {orders.map(order => {
                        const isExpanded = !!expandedOrders[order._id];
                        const { hub, destination, current } = getMapCoordinates(order);
                        const currentStatusIndex = STATUS_STEPS.indexOf(order.orderStatus);
                        const progressPercent = currentStatusIndex >= 0 
                            ? (currentStatusIndex / (STATUS_STEPS.length - 1)) * 100 
                            : 0;

                        const carImg = order.carId?.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop';
                        const carModel = order.carId?.model || order.carId?.name || order.carName;
                        const carVariant = order.carId?.variant || 'Standard Edition';
                        const carColor = order.carId?.colour || 'White Pearl';

                        return (
                            <div 
                                key={order._id} 
                                style={{ 
                                    backgroundColor: '#fff', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e2e8f0', 
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                    overflow: 'hidden',
                                    transition: 'box-shadow 0.2s ease'
                                }}
                            >
                                {/* CARD HEADER (Matches Pic 1 with Dropdown Toggle Arrow) */}
                                <div 
                                    className="orders-card-header"
                                    onClick={() => toggleOrder(order._id)}
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        padding: '18px 24px',
                                        backgroundColor: '#ffffff',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        borderBottom: isExpanded ? '1px solid #edf2f7' : 'none'
                                    }}
                                >
                                    {/* Left: Order ID (Pic 1) */}
                                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#000000', letterSpacing: '-0.2px' }}>
                                        Order ID: {order.orderId}
                                    </div>

                                    {/* Right: Delivery Status Text + Dropdown Arrow (Pic 1) */}
                                    <div className="orders-card-header-right" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <span style={{ 
                                            color: getStatusColor(order.orderStatus), 
                                            fontWeight: 700, 
                                            fontSize: '1.05rem'
                                        }}>
                                            {order.orderStatus}
                                        </span>

                                        <button 
                                            type="button"
                                            aria-label={isExpanded ? 'Collapse order' : 'Expand order'}
                                            style={{ 
                                                background: '#f8fafc', 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: '50%', 
                                                width: '32px', 
                                                height: '32px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                cursor: 'pointer',
                                                color: '#334155',
                                                transition: 'transform 0.2s ease'
                                            }}
                                        >
                                            {isExpanded ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
                                        </button>
                                    </div>
                                </div>

                                {/* COLLAPSIBLE CONTENT */}
                                {isExpanded && (
                                    <div style={{ padding: '20px 16px' }}>
                                        
                                        {/* 1. CAR DETAILS OVERVIEW */}
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                                            gap: '24px',
                                            backgroundColor: '#f8fafc',
                                            padding: '18px',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            marginBottom: '26px'
                                        }}>
                                            {/* Car Image & Headline */}
                                            <div className="orders-car-overview" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <img 
                                                    src={carImg} 
                                                    alt={order.carName} 
                                                    className="orders-car-img"
                                                    style={{ 
                                                        width: '140px', 
                                                        height: '95px', 
                                                        objectFit: 'cover', 
                                                        borderRadius: '8px',
                                                        border: '1px solid #cbd5e1',
                                                        flexShrink: 0
                                                    }} 
                                                />
                                                <div>
                                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                                                        {order.carName}
                                                    </h3>
                                                    <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.88rem' }}>
                                                        Variant: <strong style={{ color: '#1e293b' }}>{carVariant}</strong>
                                                    </p>
                                                    <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.88rem' }}>
                                                        Color: <strong style={{ color: '#1e293b' }}>{carColor}</strong>
                                                    </p>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                                                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                                                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginLeft: '6px' }}>(Total on Road)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Key Specifications Grid */}
                                            <div className="orders-specs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px', fontSize: '0.88rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                                                    <Fuel size={16} color="#0284c7" />
                                                    <span>Fuel: <strong>{order.carId?.fuelType || 'Petrol'}</strong></span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                                                    <Gauge size={16} color="#0284c7" />
                                                    <span>Transmission: <strong>{order.carId?.transmission || 'Automatic'}</strong></span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                                                    <Users size={16} color="#0284c7" />
                                                    <span>Seats: <strong>{order.carId?.seatingCapacity || 5} Seater</strong></span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                                                    <CreditCard size={16} color="#0284c7" />
                                                    <span>Payment: <strong>{order.paymentMethod}</strong></span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                                                    <ShieldCheck size={16} color="#10b981" />
                                                    <span>Payment Status: <strong style={{ color: order.paymentStatus === 'Paid' ? '#166534' : '#b45309' }}>{order.paymentStatus}</strong></span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                                                    <Calendar size={16} color="#0284c7" />
                                                    <span>Booked: <strong>{new Date(order.bookingDate).toLocaleDateString('en-IN')}</strong></span>
                                                </div>
                                            </div>

                                            {/* Delivery Address & Expected Date */}
                                            <div className="orders-address-col" style={{ fontSize: '0.88rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '18px' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', marginBottom: '8px' }}>
                                                    <MapPin size={17} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                    <div>
                                                        <span style={{ color: '#64748b' }}>Delivery Location:</span>
                                                        <div style={{ color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                                                            {order.deliveryAddress}, {order.state} - {order.pincode}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                                                    <Clock size={16} color="#0284c7" />
                                                    <div>
                                                        <span style={{ color: '#64748b' }}>Expected Delivery: </span>
                                                        <strong style={{ color: '#0f172a' }}>
                                                            {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Within 7 Days'}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. DELIVERY STATUS STEPPER (Matches Pic 2) */}
                                        <div style={{ 
                                            backgroundColor: '#ffffff', 
                                            border: '1px solid #e2e8f0', 
                                            borderRadius: '12px', 
                                            padding: '24px 20px 28px', 
                                            marginBottom: '30px' 
                                        }}>
                                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#000000', margin: '0 0 24px 0' }}>
                                                Delivery Status
                                            </h2>

                                            <div className="orders-stepper-container">
                                                <div className="orders-stepper-inner">
                                                {/* Background Connecting Line (Pic 2) */}
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: '15px', 
                                                    left: '30px', 
                                                    right: '30px', 
                                                    height: '4px', 
                                                    backgroundColor: '#e2e8f0', 
                                                    zIndex: 1,
                                                    borderRadius: '4px'
                                                }} />

                                                {/* Active Progress Line */}
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: '15px', 
                                                    left: '30px', 
                                                    width: `calc(${progressPercent}% * (100% - 60px) / 100)`, 
                                                    height: '4px', 
                                                    backgroundColor: '#0284c7', 
                                                    zIndex: 2,
                                                    borderRadius: '4px',
                                                    transition: 'width 0.4s ease'
                                                }} />

                                                {/* 6 Step Nodes (Pic 2) */}
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'flex-start', 
                                                    position: 'relative', 
                                                    zIndex: 3 
                                                }}>
                                                    {STATUS_STEPS.map((step, idx) => {
                                                        const isCompleted = idx <= currentStatusIndex;
                                                        const isCurrent = idx === currentStatusIndex;

                                                        return (
                                                            <div 
                                                                key={step} 
                                                                style={{ 
                                                                    display: 'flex', 
                                                                    flexDirection: 'column', 
                                                                    alignItems: 'center', 
                                                                    width: '74px',
                                                                    textAlign: 'center'
                                                                }}
                                                            >
                                                                {/* Circular Node (matches Pic 2 clean circle shape) */}
                                                                <div style={{ 
                                                                    width: '32px', 
                                                                    height: '32px', 
                                                                    borderRadius: '50%', 
                                                                    backgroundColor: isCurrent ? '#0284c7' : isCompleted ? '#e0f2fe' : '#ffffff', 
                                                                    border: `3px solid ${isCompleted ? '#0284c7' : '#cbd5e1'}`,
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    justifyContent: 'center', 
                                                                    marginBottom: '10px',
                                                                    boxShadow: isCurrent ? '0 0 0 4px rgba(2, 132, 199, 0.2)' : 'none',
                                                                    transition: 'all 0.3s ease'
                                                                }}>
                                                                    {isCurrent ? (
                                                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                                                    ) : isCompleted ? (
                                                                        <CheckCircle2 size={16} color="#0284c7" />
                                                                    ) : null}
                                                                </div>

                                                                {/* Step Label (matches Pic 2) */}
                                                                <span style={{ 
                                                                    fontSize: '0.82rem', 
                                                                    color: isCurrent ? '#0f172a' : isCompleted ? '#334155' : '#64748b', 
                                                                    fontWeight: isCurrent ? 700 : isCompleted ? 600 : 400,
                                                                    lineHeight: '1.25'
                                                                }}>
                                                                    {step === 'Out for Delivery' ? (
                                                                        <>Out for<br/>Delivery</>
                                                                    ) : step}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. TRACK YOUR CAR MAP (Matches Pic 3) */}
                                        <div style={{ 
                                            backgroundColor: '#ffffff', 
                                            border: '1px solid #e2e8f0', 
                                            borderRadius: '12px', 
                                            padding: '24px 20px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#000000', margin: 0 }}>
                                                    Track Your Car
                                                </h2>
                                                <span style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '6px', 
                                                    fontSize: '0.85rem', 
                                                    color: '#0284c7', 
                                                    fontWeight: 600,
                                                    backgroundColor: '#f0f9ff',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px'
                                                }}>
                                                    <Truck size={15} /> Real-time Dispatch Transit
                                                </span>
                                            </div>

                                            {/* Leaflet Map Box (Pic 3) */}
                                            <div style={{ 
                                                height: '280px', 
                                                width: '100%', 
                                                borderRadius: '10px', 
                                                overflow: 'hidden', 
                                                border: '1px solid #cbd5e1' 
                                            }}>
                                                <MapContainer 
                                                    key={`${order._id}-${order.orderStatus}`}
                                                    center={current} 
                                                    zoom={6} 
                                                    style={{ height: '100%', width: '100%' }}
                                                    scrollWheelZoom={false}
                                                >
                                                    <TileLayer 
                                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                                                    />

                                                    {/* Showroom / Hub Marker */}
                                                    <Marker position={hub} icon={showroomPinIcon}>
                                                        <Popup>
                                                            <div style={{ fontWeight: 'bold' }}>AutoMart Central Hub</div>
                                                            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Bengaluru Regional Showroom</div>
                                                        </Popup>
                                                    </Marker>

                                                    {/* Delivery Address Destination Marker */}
                                                    <Marker position={destination} icon={destinationPinIcon}>
                                                        <Popup>
                                                            <div style={{ fontWeight: 'bold' }}>Delivery Destination</div>
                                                            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{order.deliveryAddress}, {order.state}</div>
                                                        </Popup>
                                                    </Marker>

                                                    {/* Live Moving Transit Truck Marker */}
                                                    <Marker position={current} icon={truckPinIcon}>
                                                        <Popup>
                                                            <div style={{ fontWeight: 'bold', color: '#0284c7' }}>Car Carrier in Transit</div>
                                                            <div style={{ fontSize: '0.82rem' }}>Vehicle: <strong>{order.carName}</strong></div>
                                                            <div style={{ fontSize: '0.82rem' }}>Status: <strong>{order.orderStatus}</strong></div>
                                                        </Popup>
                                                    </Marker>

                                                    {/* Dashed Route Polyline connecting Origin, Current, and Destination */}
                                                    <Polyline 
                                                        positions={[hub, current, destination]} 
                                                        color="#0284c7" 
                                                        weight={4} 
                                                        dashArray="8, 8" 
                                                    />
                                                </MapContainer>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap', gap: '8px' }}>
                                                <span>Origin: <strong>AutoMart Hub, Bengaluru</strong></span>
                                                <span>Carrier Tracking: <strong>Active GPS Link</strong></span>
                                                <span>Destination: <strong>{order.state || 'Local Region'}</strong></span>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
