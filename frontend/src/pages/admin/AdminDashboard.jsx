import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    LayoutDashboard, PlusCircle, Trash2, Car, Users, ClipboardList, 
    Truck, LogOut, ChevronDown, BarChart3, User, Search, Mail, MessageSquare 
} from 'lucide-react';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.token) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setFetchError(null);
                const res = await axios.get('http://localhost:5000/api/admin/dashboard', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setData(res.data);
            } catch (error) {
                console.error('Failed to load admin dashboard data:', error);
                setFetchError(error.response?.data?.message || 'Failed to connect to admin server');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#fff', fontSize: '1.2em' }}>Loading Dashboard...</div>;

    if (fetchError) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
                    <h3 style={{ color: '#fca5a5', marginTop: 0 }}>Error Loading Dashboard</h3>
                    <p>{fetchError}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>No dashboard data available.</div>;

    const { stats = {}, recentOrders = [], registeredUsers = [], availableCarsList = [], recentContactMessages = [] } = data;

    return (
        <div className="admin-dashboard-page">
            <style>{`
                .admin-tables-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .admin-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .admin-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(min(140px, 100%), 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .admin-table-scroll {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    width: 100%;
                }
                .admin-summary-box {
                    background-color: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #fff;
                    padding: 20px 24px;
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
                    flex-wrap: wrap;
                    gap: 16px;
                }
                @media (max-width: 1200px) {
                    .admin-tables-row {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 480px) {
                    .admin-stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 12px !important;
                    }
                    .admin-actions-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 12px !important;
                    }
                    .admin-summary-box {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        text-align: center;
                    }
                    .admin-summary-box a {
                        text-align: center;
                    }
                }
            `}</style>
                    
            {/* STATS CARDS */}
            <div className="admin-stats-grid">
                <StatCard icon={<Car color="#60a5fa" size={26}/>} title="Total Cars" value={stats.totalCars} />
                <StatCard icon={<Users color="#34d399" size={26}/>} title="Total Users" value={stats.totalUsers} />
                <StatCard icon={<BarChart3 color="#fbbf24" size={26}/>} title="Cars Sold" value={stats.carsSold} />
                <StatCard icon={<ClipboardList color="#c084fc" size={26}/>} title="Pending Orders" value={stats.pendingOrders} />
                <StatCard icon={<Truck color="#22d3ee" size={26}/>} title="Deliveries" value={stats.deliveries} />
                <StatCard icon={<Car color="#f472b6" size={26}/>} title="Available Cars" value={stats.availableCars} />
                <StatCard 
                    icon={<Mail color="#38bdf8" size={26}/>} 
                    title="Contact Messages" 
                    value={stats.contactMessages || 0} 
                    sub={stats.newContactMessages ? `${stats.newContactMessages} new` : null}
                />
            </div>

            {/* ACTION CARDS */}
            <div className="admin-actions-grid">
                <ActionCard to="/admin/cars/add" icon={<PlusCircle size={24} color="#fff"/>} title="Add Car" desc="Add a new car to inventory" iconBg="#3b82f6" />
                <ActionCard to="/admin/cars" icon={<Trash2 size={24} color="#fff"/>} title="Manage Cars" desc="View & remove inventory" iconBg="#ef4444" />
                <ActionCard to="/admin/users" icon={<Users size={24} color="#fff"/>} title="View Users" desc="See registered users" iconBg="#8b5cf6" />
                <ActionCard to="/admin/orders" icon={<ClipboardList size={24} color="#fff"/>} title="Orders" desc="Manage car orders" iconBg="#f59e0b" />
                <ActionCard to="/admin/messages" icon={<Mail size={24} color="#fff"/>} title="Contact Messages" desc="Inquiries from Contact Us" iconBg="#0284c7" />
                <ActionCard to="/admin/issues" icon={<MessageSquare size={24} color="#fff"/>} title="User Issues" desc="Tickets & Service" iconBg="#10b981" />
            </div>

            {/* 3 TABLES ROW */}
            <div className="admin-tables-row">
                
                {/* Recent Orders */}
                <div style={tableContainerStyle}>
                    <div style={tableHeaderStyle}>
                        <h3 style={{ margin: 0, color: '#fff' }}>Recent Orders</h3>
                        <Link to="/admin/orders" style={viewAllStyle}>View All</Link>
                    </div>
                    <div className="admin-table-scroll">
                        <table style={tableStyle}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8' }}>
                                    <th style={{ padding: '8px 4px' }}>Order ID</th>
                                    <th style={{ padding: '8px 4px' }}>User</th>
                                    <th style={{ padding: '8px 4px' }}>Car</th>
                                    <th style={{ padding: '8px 4px' }}>Price</th>
                                    <th style={{ padding: '8px 4px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(o => (
                                    <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <td style={{ color: '#94a3b8', padding: '10px 4px' }}>#{o.orderId ? o.orderId.slice(-4) : (o._id ? String(o._id).slice(-4) : '----')}</td>
                                        <td style={{ padding: '10px 4px', color: '#f1f5f9' }}>{o.userId?.fullName || o.customerName || 'User'}</td>
                                        <td style={{ padding: '10px 4px', color: '#f1f5f9' }}>{o.carName}</td>
                                        <td style={{ padding: '10px 4px', color: '#f1f5f9' }}>₹{o.totalAmount?.toLocaleString?.() || o.totalAmount || 0}</td>
                                        <td style={{ padding: '10px 4px' }}><StatusBadge status={o.orderStatus} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Available Cars */}
                <div style={tableContainerStyle}>
                    <div style={tableHeaderStyle}>
                        <h3 style={{ margin: 0, color: '#fff' }}>Available Cars</h3>
                        <Link to="/admin/cars" style={viewAllStyle}>View All</Link>
                    </div>
                    <div className="admin-table-scroll">
                        <table style={tableStyle}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8' }}>
                                    <th style={{ padding: '8px 4px' }}>Image</th>
                                    <th style={{ padding: '8px 4px' }}>Car Name</th>
                                    <th style={{ padding: '8px 4px' }}>Brand</th>
                                    <th style={{ padding: '8px 4px' }}>Price</th>
                                    <th style={{ padding: '8px 4px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {availableCarsList.map(c => (
                                    <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <td style={{ padding: '10px 4px' }}>
                                            <img 
                                                src={c.images && c.images.length > 0 && c.images[0] ? c.images[0] : 'https://via.placeholder.com/40x25?text=Car'} 
                                                alt={c.name} 
                                                style={{ width:'40px', height:'25px', objectFit:'cover', borderRadius:'4px' }} 
                                            />
                                        </td>
                                        <td style={{ padding: '10px 4px', color: '#f1f5f9' }}>{c.name}</td>
                                        <td style={{ padding: '10px 4px', color: '#f1f5f9' }}>{c.brand}</td>
                                        <td style={{ padding: '10px 4px', color: '#f1f5f9' }}>₹{c.price?.toLocaleString?.() || c.price || 0}</td>
                                        <td style={{ padding: '10px 4px' }}><StatusBadge status="Available" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Registered Users */}
                <div style={tableContainerStyle}>
                    <div style={tableHeaderStyle}>
                        <h3 style={{ margin: 0, color: '#fff' }}>Registered Users</h3>
                        <Link to="/admin/users" style={viewAllStyle}>View All</Link>
                    </div>
                    <div className="admin-table-scroll">
                        <table style={tableStyle}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8' }}>
                                    <th style={{ padding: '8px 4px' }}>Name</th>
                                    <th style={{ padding: '8px 4px' }}>Email</th>
                                    <th style={{ padding: '8px 4px' }}>Phone</th>
                                    <th style={{ padding: '8px 4px' }}>Cars Bought</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registeredUsers.map(u => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <td style={{ padding: '10px 4px', color: '#f1f5f9' }}>{u.fullName || 'No Name'}</td>
                                        <td style={{ padding: '10px 4px', color: '#cbd5e1' }}>{u.email}</td>
                                        <td style={{ padding: '10px 4px', color: '#cbd5e1' }}>{u.phone || 'N/A'}</td>
                                        <td style={{ padding: '10px 4px', textAlign: 'center', color: '#f1f5f9' }}>{u.carsBought}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* RECENT CONTACT INQUIRIES SECTION */}
            <div style={{ ...tableContainerStyle, marginBottom: '30px' }}>
                <div style={tableHeaderStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <Mail size={20} color="#38bdf8" />
                        <h3 style={{ margin: 0, color: '#fff' }}>Recent Contact Page Inquiries</h3>
                        <span style={{ fontSize: '0.8em', backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                            Target: ashrithabangera45@gmail.com
                        </span>
                    </div>
                    <Link to="/admin/messages" style={viewAllStyle}>View All Messages &rarr;</Link>
                </div>
                {recentContactMessages.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                        No contact messages yet. Submissions from the Contact Us form will appear here.
                    </div>
                ) : (
                    <div className="admin-table-scroll">
                        <table style={tableStyle}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8' }}>
                                    <th style={{ padding: '10px 8px' }}>Date</th>
                                    <th style={{ padding: '10px 8px' }}>Name</th>
                                    <th style={{ padding: '10px 8px' }}>Email</th>
                                    <th style={{ padding: '10px 8px' }}>Phone</th>
                                    <th style={{ padding: '10px 8px' }}>Subject</th>
                                    <th style={{ padding: '10px 8px' }}>Status</th>
                                    <th style={{ padding: '10px 8px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentContactMessages.map(m => (
                                    <tr key={m._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <td style={{ color: '#94a3b8', padding: '10px 8px' }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: '600', color: '#fff', padding: '10px 8px' }}>{m.fullName}</td>
                                        <td style={{ padding: '10px 8px' }}><a href={`mailto:${m.email}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{m.email}</a></td>
                                        <td style={{ color: '#cbd5e1', padding: '10px 8px' }}>{m.phone}</td>
                                        <td style={{ color: '#cbd5e1', padding: '10px 8px', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.subject}</td>
                                        <td style={{ padding: '10px 8px' }}><StatusBadge status={m.status || 'New'} /></td>
                                        <td style={{ padding: '10px 8px' }}>
                                            <Link to="/admin/messages" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '600' }}>
                                                Review &rarr;
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* BOTTOM SUMMARY */}
            <div className="admin-summary-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <BarChart3 size={32} color="#60a5fa" />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1em', color: '#fff' }}>Total Cars Sold</h3>
                                <p style={{ margin: '5px 0 0 0', color: '#cbd5e1', fontSize: '0.9em' }}>
                                    Out of {stats.totalCars} total cars, {stats.carsSold} have been sold so far.
                                </p>
                            </div>
                        </div>
                        <Link to="/admin/orders" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>
                            View Orders &rarr;
                        </Link>
                    </div>

                </div>
    );
};



const StatCard = ({ icon, title, value, sub }) => (
    <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.08)', 
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '20px', 
        borderRadius: '12px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)' 
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>{icon}</div>
            {sub && <span style={{ fontSize: '0.75em', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: '700' }}>{sub}</span>}
        </div>
        <div style={{ fontSize: '0.85em', color: '#cbd5e1', fontWeight: '500' }}>{title}</div>
        <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#fff' }}>{value}</div>
    </div>
);

const ActionCard = ({ to, icon, title, desc, iconBg }) => (
    <Link to={to} style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.08)', 
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '20px', 
        borderRadius: '12px', 
        textDecoration: 'none', 
        color: 'inherit', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center', 
        gap: '10px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <div style={{ fontWeight: '600', color: '#fff', fontSize: '1em' }}>{title}</div>
        <div style={{ fontSize: '0.75em', color: '#cbd5e1' }}>{desc}</div>
    </Link>
);

const tableContainerStyle = { 
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#fff', 
    borderRadius: '12px', 
    padding: '20px', 
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)' 
};
const tableHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const viewAllStyle = { color: '#60a5fa', textDecoration: 'none', fontSize: '0.9em', fontWeight: '500' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85em', textAlign: 'left', color: '#fff' };

const StatusBadge = ({ status }) => {
    let bg = 'rgba(255, 255, 255, 0.1)', color = '#cbd5e1', border = 'rgba(255, 255, 255, 0.2)';
    if(status === 'Pending') { bg = 'rgba(245, 158, 11, 0.2)'; color = '#fbbf24'; border = 'rgba(245, 158, 11, 0.4)'; }
    if(status === 'Delivered') { bg = 'rgba(16, 185, 129, 0.2)'; color = '#34d399'; border = 'rgba(16, 185, 129, 0.4)'; }
    if(status === 'Out for Delivery' || status === 'Dispatched') { bg = 'rgba(59, 130, 246, 0.2)'; color = '#60a5fa'; border = 'rgba(59, 130, 246, 0.4)'; }
    if(status === 'Available') { bg = 'rgba(16, 185, 129, 0.2)'; color = '#34d399'; border = 'rgba(16, 185, 129, 0.4)'; }
    if(status === 'Booked') { bg = 'rgba(168, 85, 247, 0.2)'; color = '#c084fc'; border = 'rgba(168, 85, 247, 0.4)'; }
    if(status === 'New') { bg = 'rgba(239, 68, 68, 0.2)'; color = '#f87171'; border = 'rgba(239, 68, 68, 0.4)'; }
    if(status === 'Read') { bg = 'rgba(245, 158, 11, 0.2)'; color = '#fbbf24'; border = 'rgba(245, 158, 11, 0.4)'; }
    if(status === 'Replied') { bg = 'rgba(16, 185, 129, 0.2)'; color = '#34d399'; border = 'rgba(16, 185, 129, 0.4)'; }
    
    return <span style={{ backgroundColor: bg, color, border: `1px solid ${border}`, padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: '600' }}>{status}</span>;
};

export default AdminDashboard;

