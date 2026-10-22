import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { 
    Search, 
    Filter, 
    Eye, 
    X, 
    CheckCircle2, 
    Clock, 
    Truck, 
    CreditCard, 
    Phone, 
    Mail, 
    MapPin, 
    Car, 
    DollarSign, 
    Calendar, 
    Package, 
    AlertCircle, 
    RefreshCw,
    Building,
    Globe,
    FileText,
    Check
} from 'lucide-react';

const STATUS_OPTIONS = [
    'Pending',
    'Confirmed',
    'Processing',
    'Dispatched',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
];

const PAYMENT_STATUS_OPTIONS = ['Pending', 'Paid', 'Failed'];

const ManageOrders = () => {
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch all orders
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const { data } = await axios.get(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            showToast({
                title: 'Error Fetching Orders',
                message: error.response?.data?.message || 'Could not load orders from database.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Close modal on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedOrder(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Update Order Status
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setIsUpdating(true);
            const user = JSON.parse(localStorage.getItem('user'));
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const { data } = await axios.put(
                `${API_URL}/orders/${orderId}/status`, 
                { status: newStatus }, 
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            // Update state
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...data, orderStatus: newStatus } : o));
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder(prev => ({ ...prev, ...data, orderStatus: newStatus }));
            }

            showToast({
                title: 'Order Status Updated',
                message: `Order status changed to "${newStatus}".`,
                type: 'success'
            });
        } catch (error) {
            console.error('Error updating status:', error);
            showToast({
                title: 'Update Failed',
                message: error.response?.data?.message || 'Failed to update order status.',
                type: 'error'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    // Confirm / Update Payment Status
    const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
        try {
            setIsUpdating(true);
            const user = JSON.parse(localStorage.getItem('user'));
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const { data } = await axios.put(
                `${API_URL}/orders/${orderId}/status`, 
                { paymentStatus: newPaymentStatus }, 
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...data, paymentStatus: newPaymentStatus } : o));
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder(prev => ({ ...prev, ...data, paymentStatus: newPaymentStatus }));
            }

            showToast({
                title: 'Payment Status Updated',
                message: `Payment status marked as "${newPaymentStatus}".`,
                type: 'success'
            });
        } catch (error) {
            console.error('Error updating payment status:', error);
            showToast({
                title: 'Update Failed',
                message: error.response?.data?.message || 'Failed to update payment status.',
                type: 'error'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    // Filtered orders
    const filteredOrders = orders.filter(order => {
        // Search filter
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
            (order.orderId && order.orderId.toLowerCase().includes(query)) ||
            (order.customerName && order.customerName.toLowerCase().includes(query)) ||
            (order.customerEmail && order.customerEmail.toLowerCase().includes(query)) ||
            (order.customerPhone && order.customerPhone.toLowerCase().includes(query)) ||
            (order.carName && order.carName.toLowerCase().includes(query)) ||
            (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(query)) ||
            (order.state && order.state.toLowerCase().includes(query)) ||
            (order.pincode && order.pincode.toLowerCase().includes(query));

        // Status filter
        const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;

        // Payment filter
        const matchesPayment = paymentFilter === 'All' || order.paymentStatus === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    // Overview Stats
    const totalRevenue = orders.reduce((sum, o) => o.paymentStatus === 'Paid' ? sum + (o.totalAmount || 0) : sum, 0);
    const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
    const deliveredCount = orders.filter(o => o.orderStatus === 'Delivered').length;

    // Helper to format values or display 'Not provided'
    const valOrFallback = (val) => (val && String(val).trim() ? val : 'Not provided');

    // Status Badge Color Helper
    const getStatusBadgeStyle = (status) => {
        switch (status) {
            case 'Delivered':
                return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.4)' };
            case 'Dispatched':
            case 'Out for Delivery':
                return { bg: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', border: 'rgba(14, 165, 233, 0.4)' };
            case 'Confirmed':
            case 'Processing':
                return { bg: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.4)' };
            case 'Cancelled':
                return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
            default: // Pending
                return { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
        }
    };

    const getPaymentBadgeStyle = (paymentStatus) => {
        switch (paymentStatus) {
            case 'Paid':
                return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.4)' };
            case 'Failed':
                return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
            default: // Pending
                return { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
        }
    };

    return (
        <div style={{ padding: 'clamp(12px, 3vw, 24px)', maxWidth: '1440px', margin: '0 auto', color: 'white' }}>
            <style>{`
                .admin-orders-table {
                    width: 100%;
                    min-width: 900px;
                    border-collapse: collapse;
                    background-color: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    color: white;
                }
                .admin-orders-table th {
                    padding: 14px 12px;
                    background-color: rgba(255, 255, 255, 0.1);
                    text-align: left;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #cbd5e1;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
                }
                .admin-orders-table td {
                    padding: 14px 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                    font-size: 0.92rem;
                }
                .admin-orders-table tr:hover {
                    background-color: rgba(255, 255, 255, 0.04);
                }
                .order-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(6px);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                }
                .order-modal-container {
                    background-color: #0f172a;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 14px;
                    width: 100%;
                    max-width: 900px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
                    animation: modalFadeIn 0.25s ease-out;
                }
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.96); }
                    to { opacity: 1; transform: scale(1); }
                }
                .detail-section-card {
                    background-color: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 10px;
                    padding: 18px;
                }
                .detail-label {
                    font-size: 0.78rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #94a3b8;
                    margin-bottom: 3px;
                }
                .detail-value {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #ffffff;
                }
                .link-contact {
                    color: #38bdf8;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .link-contact:hover {
                    color: #7dd3fc;
                    text-decoration: underline;
                }
                .stats-card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                @media (max-width: 768px) {
                    .stats-card-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    .modal-grid-2col {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 800 }}>Manage Orders</h2>
                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                        Track and manage customer car orders, live delivery statuses, and payment verifications.
                    </p>
                </div>

                <button 
                    onClick={fetchOrders}
                    disabled={loading}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Orders
                </button>
            </div>

            {/* Overview Stats Cards */}
            <div className="stats-card-grid">
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                        <span>TOTAL ORDERS</span>
                        <Package size={18} color="#38bdf8" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
                        {orders.length}
                    </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                        <span>COLLECTED REVENUE</span>
                        <DollarSign size={18} color="#4ade80" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', color: '#4ade80' }}>
                        ₹{totalRevenue.toLocaleString('en-IN')}
                    </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                        <span>ACTIVE / IN TRANSIT</span>
                        <Truck size={18} color="#fbbf24" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', color: '#fbbf24' }}>
                        {pendingOrdersCount}
                    </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                        <span>SUCCESSFULLY DELIVERED</span>
                        <CheckCircle2 size={18} color="#22c55e" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', color: '#22c55e' }}>
                        {deliveredCount}
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {/* Search input */}
                <div style={{ flex: '1 1 260px', position: 'relative' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text"
                        placeholder="Search by Order ID, Customer, Car, Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px 10px 38px',
                            backgroundColor: 'rgba(15, 23, 42, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.84rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Order Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '9px 12px',
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.88rem',
                            outline: 'none'
                        }}
                    >
                        <option value="All">All Statuses</option>
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* Payment Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.84rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Payment:</label>
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        style={{
                            padding: '9px 12px',
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.88rem',
                            outline: 'none'
                        }}
                    >
                        <option value="All">All Payments</option>
                        {PAYMENT_STATUS_OPTIONS.map(ps => (
                            <option key={ps} value={ps}>{ps}</option>
                        ))}
                    </select>
                </div>

                {/* Reset Filters button */}
                {(searchQuery || statusFilter !== 'All' || paymentFilter !== 'All') && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('All');
                            setPaymentFilter('All');
                        }}
                        style={{
                            padding: '9px 14px',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            borderRadius: '8px',
                            fontSize: '0.84rem',
                            cursor: 'pointer'
                        }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Orders Table */}
            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <table className="admin-orders-table">
                    <thead>
                        <tr>
                            <th>Order ID & Date</th>
                            <th>Customer</th>
                            <th>Car</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Order Status</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => {
                            const statusStyle = getStatusBadgeStyle(order.orderStatus);
                            const paymentStyle = getPaymentBadgeStyle(order.paymentStatus);
                            const customerName = order.customerName || order.userId?.fullName || 'Not provided';
                            const customerPhone = order.customerPhone || order.userId?.phone || 'Not provided';
                            const carImg = order.carId?.images?.[0];

                            return (
                                <tr key={order._id}>
                                    {/* Order ID & Date */}
                                    <td>
                                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                                            {order.orderId}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>
                                            {order.bookingDate ? new Date(order.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </div>
                                    </td>

                                    {/* Customer Name & Phone */}
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#ffffff' }}>
                                            {customerName}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                                            {customerPhone !== 'Not provided' ? (
                                                <a href={`tel:${customerPhone}`} className="link-contact">
                                                    {customerPhone}
                                                </a>
                                            ) : (
                                                'Not provided'
                                            )}
                                        </div>
                                    </td>

                                    {/* Car Name & Thumbnail */}
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {carImg ? (
                                                <img 
                                                    src={carImg} 
                                                    alt={order.carName} 
                                                    style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)' }} 
                                                />
                                            ) : (
                                                <div style={{ width: '48px', height: '36px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Car size={18} color="#94a3b8" />
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#ffffff', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {order.carName}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                                    {order.carId?.brand || ''} {order.carId?.variant ? `• ${order.carId.variant}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Total Amount */}
                                    <td>
                                        <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>
                                            ₹{order.totalAmount?.toLocaleString('en-IN')}
                                        </div>
                                        {order.discount > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#4ade80' }}>
                                                - ₹{order.discount.toLocaleString('en-IN')} off
                                            </div>
                                        )}
                                    </td>

                                    {/* Payment Method & Status */}
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '4px' }}>
                                            {order.paymentMethod}
                                        </div>
                                        <span 
                                            style={{ 
                                                display: 'inline-block',
                                                padding: '2px 8px', 
                                                borderRadius: '4px', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 700, 
                                                backgroundColor: paymentStyle.bg, 
                                                color: paymentStyle.color,
                                                border: `1px solid ${paymentStyle.border}`
                                            }}
                                        >
                                            {order.paymentStatus}
                                        </span>
                                    </td>

                                    {/* Order Status Dropdown */}
                                    <td>
                                        <select 
                                            value={order.orderStatus} 
                                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                            disabled={isUpdating}
                                            style={{ 
                                                padding: '6px 10px', 
                                                backgroundColor: statusStyle.bg, 
                                                color: statusStyle.color, 
                                                border: `1px solid ${statusStyle.border}`, 
                                                borderRadius: '6px', 
                                                fontSize: '0.84rem',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {STATUS_OPTIONS.map(opt => (
                                                <option key={opt} value={opt} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* Actions */}
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                id={`btn-view-details-${order.orderId}`}
                                                style={{ 
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    padding: '7px 13px', 
                                                    backgroundColor: 'rgba(2, 132, 199, 0.25)', 
                                                    color: '#38bdf8', 
                                                    border: '1px solid rgba(2, 132, 199, 0.5)', 
                                                    borderRadius: '6px', 
                                                    cursor: 'pointer', 
                                                    fontSize: '0.84rem', 
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Eye size={15} /> View Details
                                            </button>

                                            {(order.paymentMethod === 'Cash on Delivery' || order.paymentMethod === 'Offline') && order.paymentStatus === 'Pending' && (
                                                <button 
                                                    onClick={() => handleUpdatePaymentStatus(order._id, 'Paid')}
                                                    disabled={isUpdating}
                                                    style={{ 
                                                        padding: '7px 11px', 
                                                        backgroundColor: 'rgba(34, 197, 94, 0.25)', 
                                                        color: '#4ade80', 
                                                        border: '1px solid rgba(34, 197, 94, 0.5)', 
                                                        borderRadius: '6px', 
                                                        cursor: 'pointer', 
                                                        fontSize: '0.82rem', 
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap' 
                                                    }}
                                                    title="Mark payment as received"
                                                >
                                                    <Check size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} /> Confirm Paid
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {filteredOrders.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    <Package size={40} color="#64748b" style={{ marginBottom: '10px' }} />
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0' }}>No matching orders found</div>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>Try adjusting your search criteria or filter selections.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ORDER DETAILS MODAL / DRAWER */}
            {selectedOrder && (
                <div 
                    className="order-modal-backdrop" 
                    onClick={() => setSelectedOrder(null)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div 
                        className="order-modal-container" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'white' }}>
                                        Order #{selectedOrder.orderId}
                                    </h3>
                                    <span 
                                        style={{ 
                                            padding: '3px 10px', 
                                            borderRadius: '6px', 
                                            fontSize: '0.8rem', 
                                            fontWeight: 700, 
                                            backgroundColor: getStatusBadgeStyle(selectedOrder.orderStatus).bg, 
                                            color: getStatusBadgeStyle(selectedOrder.orderStatus).color,
                                            border: `1px solid ${getStatusBadgeStyle(selectedOrder.orderStatus).border}`
                                        }}
                                    >
                                        {selectedOrder.orderStatus}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '4px' }}>
                                    Placed on: {selectedOrder.bookingDate ? new Date(selectedOrder.bookingDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not provided'}
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedOrder(null)}
                                id="btn-close-order-modal"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    color: '#cbd5e1',
                                    cursor: 'pointer',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s'
                                }}
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            {/* Two-Column Grid: Customer Details & Delivery Address */}
                            <div className="modal-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                                
                                {/* Section B: Customer Information */}
                                <div className="detail-section-card">
                                    <h4 style={{ margin: '0 0 14px 0', fontSize: '0.98rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Package size={17} /> Customer Information
                                    </h4>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <div className="detail-label">Full Name</div>
                                            <div className="detail-value">
                                                {valOrFallback(selectedOrder.customerName || selectedOrder.userId?.fullName)}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="detail-label">Email Address</div>
                                            <div className="detail-value">
                                                {selectedOrder.customerEmail || selectedOrder.userId?.email ? (
                                                    <a 
                                                        href={`mailto:${selectedOrder.customerEmail || selectedOrder.userId?.email}`} 
                                                        className="link-contact"
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        <Mail size={14} /> {selectedOrder.customerEmail || selectedOrder.userId?.email}
                                                    </a>
                                                ) : (
                                                    'Not provided'
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="detail-label">Phone Number</div>
                                            <div className="detail-value">
                                                {selectedOrder.customerPhone || selectedOrder.userId?.phone ? (
                                                    <a 
                                                        href={`tel:${selectedOrder.customerPhone || selectedOrder.userId?.phone}`} 
                                                        className="link-contact"
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        <Phone size={14} /> {selectedOrder.customerPhone || selectedOrder.userId?.phone}
                                                    </a>
                                                ) : (
                                                    'Not provided'
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section C: Delivery Address */}
                                <div className="detail-section-card">
                                    <h4 style={{ margin: '0 0 14px 0', fontSize: '0.98rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={17} /> Delivery Address
                                    </h4>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <div className="detail-label">Complete Delivery Address</div>
                                            <div className="detail-value" style={{ lineHeight: 1.45, color: '#f1f5f9' }}>
                                                {valOrFallback(selectedOrder.deliveryAddress || selectedOrder.userId?.address)}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <div className="detail-label">City</div>
                                                <div className="detail-value">
                                                    {valOrFallback(selectedOrder.carId?.location?.city)}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="detail-label">State</div>
                                                <div className="detail-value">
                                                    {valOrFallback(selectedOrder.state || selectedOrder.userId?.state)}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <div className="detail-label">Pincode</div>
                                                <div className="detail-value">
                                                    {valOrFallback(selectedOrder.pincode || selectedOrder.userId?.pincode)}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="detail-label">Country</div>
                                                <div className="detail-value">
                                                    India
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section D: Car Information */}
                            <div className="detail-section-card">
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.98rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Car size={18} /> Vehicle Specification & Car Information
                                </h4>

                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                    {/* Car Image */}
                                    <div style={{ width: '180px', height: '120px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {selectedOrder.carId?.images?.[0] ? (
                                            <img 
                                                src={selectedOrder.carId.images[0]} 
                                                alt={selectedOrder.carName} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                                <Car size={36} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Specs Grid */}
                                    <div style={{ flex: 1, minWidth: '260px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                                        <div>
                                            <div className="detail-label">Car Name</div>
                                            <div className="detail-value">{valOrFallback(selectedOrder.carName)}</div>
                                        </div>

                                        <div>
                                            <div className="detail-label">Brand</div>
                                            <div className="detail-value">{valOrFallback(selectedOrder.carId?.brand || selectedOrder.carName?.split(' ')[0])}</div>
                                        </div>

                                        <div>
                                            <div className="detail-label">Model</div>
                                            <div className="detail-value">{valOrFallback(selectedOrder.carId?.model)}</div>
                                        </div>

                                        <div>
                                            <div className="detail-label">Variant</div>
                                            <div className="detail-value">{valOrFallback(selectedOrder.carId?.variant)}</div>
                                        </div>

                                        <div>
                                            <div className="detail-label">Model Year</div>
                                            <div className="detail-value">{valOrFallback(selectedOrder.carId?.modelYear)}</div>
                                        </div>

                                        <div>
                                            <div className="detail-label">Registration Year</div>
                                            <div className="detail-value">{valOrFallback(selectedOrder.carId?.registrationYear)}</div>
                                        </div>

                                        <div>
                                            <div className="detail-label">Fuel Type</div>
                                            <div className="detail-value">{valOrFallback(selectedOrder.carId?.fuelType)}</div>
                                        </div>

                                        <div>
                                            <div className="detail-label">Transmission</div>
                                            <div className="detail-value">{valOrFallback(selectedOrder.carId?.transmission)}</div>
                                        </div>

                                        <div>
                                            <div className="detail-label">Quantity</div>
                                            <div className="detail-value">1 Vehicle</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section A & D: Payment & Financial Summary */}
                            <div className="detail-section-card">
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.98rem', fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <DollarSign size={18} /> Pricing & Payment Breakdown
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <div className="detail-label">Base Vehicle Price</div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                                            ₹{(selectedOrder.carPrice || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="detail-label">Discount Applied</div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#4ade80' }}>
                                            {selectedOrder.discount > 0 ? `- ₹${selectedOrder.discount.toLocaleString('en-IN')}` : '₹0'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="detail-label">Taxes & RTO (10%)</div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#cbd5e1' }}>
                                            + ₹{(selectedOrder.tax || 0).toLocaleString('en-IN')}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="detail-label">Final Order Amount</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                                            ₹{(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                                    <div>
                                        <div className="detail-label">Payment Method</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                                            {selectedOrder.paymentMethod}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="detail-label" style={{ margin: 0 }}>Payment Status:</span>
                                        <select
                                            value={selectedOrder.paymentStatus}
                                            onChange={(e) => handleUpdatePaymentStatus(selectedOrder._id, e.target.value)}
                                            disabled={isUpdating}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: getPaymentBadgeStyle(selectedOrder.paymentStatus).bg,
                                                color: getPaymentBadgeStyle(selectedOrder.paymentStatus).color,
                                                border: `1px solid ${getPaymentBadgeStyle(selectedOrder.paymentStatus).border}`,
                                                borderRadius: '6px',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {PAYMENT_STATUS_OPTIONS.map(ps => (
                                                <option key={ps} value={ps} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                                                    {ps}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Live Order Status Management in Modal */}
                            <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>Update Delivery Status</div>
                                    <small style={{ color: '#94a3b8' }}>Changes will update the live tracker on the customer's dashboard.</small>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <select
                                        value={selectedOrder.orderStatus}
                                        onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                                        disabled={isUpdating}
                                        style={{
                                            padding: '8px 14px',
                                            backgroundColor: '#1e293b',
                                            border: '1px solid rgba(255, 255, 255, 0.25)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt} value={opt} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                style={{
                                    padding: '9px 20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
