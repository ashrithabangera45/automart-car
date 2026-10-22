import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Car, CheckCircle, Heart, User, ChevronRight, FileText, Wrench, MessageSquare, MapPin, Truck, Settings
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customTruckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3119/3119092.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user || !user.token) return;
        const fetchData = async () => {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            try {
                const res = await axios.get(`${API_URL}/users/dashboard`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setData(res.data);
            } catch (error) {
                console.error(error);
                setError('Failed to load dashboard data. Please try logging in again.');
            }
        };
        fetchData();
    }, [user]);

    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    const { profileStatus, totalOrders, ordersInProgress, savedCars, latestOrder } = data;

    // Delivery Status Logic
    const statuses = ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Out for Delivery', 'Delivered'];
    const currentStatusIndex = latestOrder ? statuses.indexOf(latestOrder.status) : -1;

    // Map Coordinates
    const pickup = [latestOrder?.pickup_latitude || 12.9716, latestOrder?.pickup_longitude || 77.5946];
    const destination = [latestOrder?.destination_latitude || 13.0827, latestOrder?.destination_longitude || 80.2707];
    const current = [latestOrder?.current_latitude || 12.9716, latestOrder?.current_longitude || 77.5946];

    return (
        <div className="user-dashboard-wrap" style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto' }}>
            <style>{`
                .user-dash-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .user-dash-main-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }
                .user-dash-car-row {
                    display: flex;
                    gap: 20px;
                    align-items: center;
                }
                .user-dash-car-img {
                    width: 200px;
                    height: 120px;
                    object-fit: cover;
                    border-radius: 8px;
                    flex-shrink: 0;
                }
                .user-dash-quick-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }
                .user-dash-timeline-scroll {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    padding-bottom: 8px;
                }
                .user-dash-timeline-inner {
                    min-width: 480px;
                    position: relative;
                }
                @media (max-width: 992px) {
                    .user-dash-main-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    .user-dash-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .user-dash-quick-grid {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 540px) {
                    .user-dashboard-wrap {
                        padding: 16px 10px !important;
                    }
                    .user-dash-stats-grid {
                        grid-template-columns: 1fr;
                    }
                    .user-dash-car-row {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .user-dash-car-img {
                        width: 100%;
                        height: 160px;
                    }
                }
            `}</style>
            
            {/* WELCOME */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 5px 0', fontSize: '1.7em', color: '#1e293b' }}>Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!</h1>
                <p style={{ margin: 0, color: '#64748b' }}>Here is an overview of your car purchase and account.</p>
            </div>

            {/* TOP STAT CARDS */}
            <div className="user-dash-stats-grid">
                <StatCard to="/myorders" icon={<Car color="#3b82f6"/>} title="Total Orders" value={totalOrders} bg="#eef2ff" iconBg="#3b82f6" />
                <StatCard icon={<CheckCircle color="#10b981"/>} title="Order in Progress" value={ordersInProgress} bg="#ecfdf5" iconBg="#10b981" />
                <StatCard to="/wishlist" icon={<Heart color="#ef4444"/>} title="Saved Cars" value={savedCars} bg="#fef2f2" iconBg="#ef4444" />
                <StatCard to="/profile" icon={<User color="#3b82f6"/>} title="Profile" value={profileStatus} valueColor={profileStatus === 'Complete' ? '#166534' : '#b91c1c'} bg="#f8fafc" iconBg="#3b82f6" />
            </div>

            {latestOrder ? (
                <div className="user-dash-main-grid">
                    
                    {/* LEFT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* MY CAR ORDER */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1em' }}>My Car Order</h3>
                                <Link to={`/myorders`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9em', fontWeight: '500' }}>View Details</Link>
                            </div>
                            <div className="user-dash-car-row">
                                <img src={latestOrder.carDetails?.image || 'https://via.placeholder.com/200x120?text=Car'} alt="Car" className="user-dash-car-img" />
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1em' }}>{latestOrder.carDetails?.name || 'Car Model'}</h4>
                                    <p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '0.9em' }}>{latestOrder.carDetails?.variant || 'Variant'}</p>
                                    <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '0.9em' }}>White Pearl</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
                                        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85em', fontWeight: '500' }}>
                                            Order ID: #{latestOrder.orderId?.substring(latestOrder.orderId.length - 6)}
                                        </span>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>₹ {latestOrder.totalAmount?.toLocaleString()}</div>
                                            <div style={{ fontSize: '0.75em', color: '#64748b' }}>(Ex-showroom)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ORDER DETAILS */}
                        <div style={cardStyle}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1em' }}>Order Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <DetailRow icon={<Car size={18}/>} label="Model" value={latestOrder.carDetails?.name || 'Car Model'} />
                                <DetailRow icon={<Settings size={18}/>} label="Variant" value={latestOrder.carDetails?.variant || 'Variant'} />
                                <DetailRow icon={<div style={{width:'14px', height:'14px', borderRadius:'50%', border:'2px solid #ccc', backgroundColor:'#fff'}}></div>} label="Color" value="White Pearl" />
                                <DetailRow icon={<div style={{width:'18px', height:'18px', border:'2px solid #64748b', borderRadius:'4px'}}></div>} label="Booking Date" value={new Date(latestOrder.bookingDate).toLocaleDateString('en-GB')} />
                                <DetailRow icon={<FileText size={18}/>} label="Expected Delivery" value={latestOrder.expectedDelivery ? new Date(latestOrder.expectedDelivery).toLocaleDateString('en-GB') : 'TBD'} />
                                <DetailRow icon={<MapPin size={18}/>} label="Delivery Location" value={latestOrder.deliveryAddress} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        
                        {/* DELIVERY STATUS TIMELINE */}
                        <div style={cardStyle}>
                            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1em' }}>Delivery Status</h3>
                            <div className="user-dash-timeline-scroll">
                                <div className="user-dash-timeline-inner">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                        {/* Track Line */}
                                        <div style={{ position: 'absolute', top: '15px', left: '20px', right: '20px', height: '4px', backgroundColor: '#e2e8f0', zIndex: 1 }}></div>
                                        <div style={{ position: 'absolute', top: '15px', left: '20px', width: `${Math.max(0, (currentStatusIndex / (statuses.length - 1)) * 100)}%`, height: '4px', backgroundColor: '#10b981', zIndex: 2, transition: '1s' }}></div>
                                        
                                        {statuses.map((status, index) => {
                                            const isCompleted = index <= currentStatusIndex;
                                            const isCurrent = index === currentStatusIndex;
                                            return (
                                                <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '60px' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: isCompleted ? '#10b981' : '#fff', border: `3px solid ${isCompleted ? '#10b981' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                                        {isCompleted ? (index === currentStatusIndex && index !== statuses.length-1 ? <Truck size={14} color="#fff"/> : <CheckCircle size={14} color="#fff"/>) : null}
                                                    </div>
                                                    <div style={{ fontSize: '0.75em', textAlign: 'center', fontWeight: isCurrent ? '600' : '400', color: isCurrent ? '#1e293b' : '#64748b' }}>
                                                        {status}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TRACK YOUR CAR MAP */}
                        <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Track Your Car</h3>
                            <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', minHeight: '250px' }}>
                                <MapContainer center={current} zoom={6} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    
                                    {/* Pickup Location */}
                                    <Marker position={pickup}>
                                        <Popup>Manufacturer / Showroom</Popup>
                                    </Marker>
                                    
                                    {/* Destination Location */}
                                    <Marker position={destination}>
                                        <Popup>Delivery Address</Popup>
                                    </Marker>

                                    {/* Current Vehicle Location */}
                                    <Marker position={current} icon={customTruckIcon}>
                                        <Popup>Vehicle is currently here. <br/> Status: {latestOrder.status}</Popup>
                                    </Marker>

                                    {/* Route Line */}
                                    <Polyline positions={[pickup, current, destination]} color="#3b82f6" weight={4} dashArray="10, 10" />
                                </MapContainer>
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
                    <Car size={48} color="#cbd5e1" style={{ marginBottom: '20px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>No active orders found</h3>
                    <p style={{ margin: '0 0 20px 0', color: '#64748b' }}>When you book a car, your order details and live tracking will appear here.</p>
                    <Link to="/cars" style={{ display: 'inline-block', backgroundColor: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>Browse Cars</Link>
                </div>
            )}

            {/* QUICK ACTIONS */}
            <div className="user-dash-quick-grid">
                <QuickActionCard icon={<FileText size={24} color="#64748b"/>} title="View Invoice" desc="Download your purchase invoice" />
                <QuickActionCard icon={<Wrench size={24} color="#64748b"/>} title="Service & Support" desc="Book service or get help" />
                <QuickActionCard icon={<MessageSquare size={24} color="#64748b"/>} title="Contact Dealer" desc="Chat with your showroom" />
            </div>

        </div>
    );
};

// --- STYLES & COMPONENTS ---

const cardStyle = { backgroundColor: '#fff', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };

const StatCard = ({ icon, title, value, bg, iconBg, valueColor = '#1e293b', to }) => {
    const cardContent = (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', cursor: to ? 'pointer' : 'default', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '5px' }}>{title}</div>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: valueColor, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {value} <ChevronRight size={16} color="#cbd5e1" />
                </div>
            </div>
        </div>
    );
    return to ? <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>{cardContent}</Link> : cardContent;
};

const DetailRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '25px', color: '#64748b', display: 'flex', justifyContent: 'center' }}>{icon}</div>
        <div style={{ width: '150px', color: '#64748b', fontSize: '0.9em', paddingLeft: '15px' }}>{label}</div>
        <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '0.95em' }}>{value}</div>
    </div>
);

const QuickActionCard = ({ icon, title, desc }) => (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                {icon}
            </div>
            <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1em', color: '#1e293b' }}>{title}</h4>
                <p style={{ margin: 0, fontSize: '0.8em', color: '#64748b' }}>{desc}</p>
            </div>
        </div>
        <ChevronRight size={20} color="#cbd5e1" />
    </div>
);

export default Dashboard;
