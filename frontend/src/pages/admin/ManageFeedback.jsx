import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Star, Trash2, CheckCircle2, XCircle, Search, Filter, MessageSquare, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

const ManageFeedback = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // 'all', 'car', 'general'
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'Approved', 'Pending', 'Rejected'
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchAdminFeedback = async (pageNum = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pageNum,
                limit: 15
            });
            if (filterType !== 'all') params.append('type', filterType);
            if (filterStatus !== 'all') params.append('status', filterStatus);

            const res = await axios.get(`http://localhost:5000/api/feedback/admin/all?${params.toString()}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (res.data.success) {
                setReviews(res.data.reviews || []);
                setTotal(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
                setPage(pageNum);
            }
        } catch (err) {
            console.error('Error fetching admin feedback:', err);
            showToast({
                title: 'Error',
                message: err.response?.data?.message || 'Failed to fetch reviews',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.token) {
            fetchAdminFeedback(1);
        }
    }, [user, filterType, filterStatus]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await axios.patch(
                `http://localhost:5000/api/feedback/admin/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            if (res.data.success) {
                showToast({
                    title: 'Status Updated',
                    message: `Review status changed to ${newStatus}`,
                    type: 'success'
                });
                setReviews(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
            }
        } catch (err) {
            console.error('Error updating review status:', err);
            showToast({
                title: 'Update Error',
                message: 'Failed to update review status',
                type: 'error'
            });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review permanently?')) return;

        try {
            const res = await axios.delete(`http://localhost:5000/api/feedback/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (res.data.success) {
                showToast({
                    title: 'Deleted',
                    message: 'Review permanently removed',
                    type: 'info'
                });
                fetchAdminFeedback(page);
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            showToast({
                title: 'Delete Error',
                message: 'Failed to delete review',
                type: 'error'
            });
        }
    };

    const filteredReviews = reviews.filter(r => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            (r.userName && r.userName.toLowerCase().includes(q)) ||
            (r.comment && r.comment.toLowerCase().includes(q)) ||
            (r.title && r.title.toLowerCase().includes(q)) ||
            (r.carId?.name && r.carId.name.toLowerCase().includes(q)) ||
            (r.carId?.brand && r.carId.brand.toLowerCase().includes(q))
        );
    });

    return (
        <div style={{ color: '#fff', maxWidth: '1300px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Star size={26} color="#38bdf8" /> Manage Customer Feedback
                    </h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
                        Moderate, approve, and manage customer reviews for specific cars and AutoMart general feedback.
                    </p>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.92rem', fontWeight: 600 }}>
                    Total Reviews: <span style={{ color: '#38bdf8', fontWeight: 800 }}>{total}</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.7)', 
                backdropFilter: 'blur(10px)', 
                borderRadius: '12px', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                padding: '16px 20px', 
                marginBottom: '24px',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="text" 
                            placeholder="Search by user, car, comment..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '9px 12px 9px 36px', 
                                borderRadius: '8px', 
                                border: '1px solid rgba(255,255,255,0.2)', 
                                backgroundColor: 'rgba(0,0,0,0.3)', 
                                color: '#fff', 
                                outline: 'none', 
                                fontSize: '0.88rem', 
                                boxSizing: 'border-box' 
                            }} 
                        />
                    </div>

                    {/* Filter Type */}
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ 
                            padding: '9px 14px', 
                            borderRadius: '8px', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            backgroundColor: '#1e293b', 
                            color: '#fff', 
                            outline: 'none', 
                            fontSize: '0.88rem' 
                        }}
                    >
                        <option value="all">All Types (Car & Website)</option>
                        <option value="car">Vehicle Specific Reviews</option>
                        <option value="general">General Website Feedback</option>
                    </select>

                    {/* Filter Status */}
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ 
                            padding: '9px 14px', 
                            borderRadius: '8px', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            backgroundColor: '#1e293b', 
                            color: '#fff', 
                            outline: 'none', 
                            fontSize: '0.88rem' 
                        }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                    <Loader2 size={36} color="#38bdf8" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
                    <p>Loading reviews...</p>
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div style={{ 
                    padding: '50px 20px', 
                    textAlign: 'center', 
                    backgroundColor: 'rgba(15, 23, 42, 0.5)', 
                    borderRadius: '12px', 
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    color: '#94a3b8'
                }}>
                    <MessageSquare size={36} style={{ marginBottom: '10px', opacity: 0.6 }} />
                    <h3 style={{ margin: '0 0 6px 0', color: '#f8fafc' }}>No reviews found</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No feedback matching the selected filters or query.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filteredReviews.map(review => {
                        const isCarReview = Boolean(review.carId);
                        return (
                            <div 
                                key={review._id} 
                                style={{ 
                                    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                                    backdropFilter: 'blur(10px)', 
                                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                                    borderRadius: '12px', 
                                    padding: '18px 22px',
                                    transition: 'border-color 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>
                                                {review.userName}
                                            </span>
                                            {isCarReview ? (
                                                <span style={{ 
                                                    padding: '3px 8px', 
                                                    backgroundColor: 'rgba(14, 165, 233, 0.2)', 
                                                    color: '#38bdf8', 
                                                    borderRadius: '4px', 
                                                    fontSize: '0.78rem', 
                                                    fontWeight: 700 
                                                }}>
                                                    🚗 {review.carId?.brand} {review.carId?.name}
                                                </span>
                                            ) : (
                                                <span style={{ 
                                                    padding: '3px 8px', 
                                                    backgroundColor: 'rgba(168, 85, 247, 0.2)', 
                                                    color: '#c084fc', 
                                                    borderRadius: '4px', 
                                                    fontSize: '0.78rem', 
                                                    fontWeight: 700 
                                                }}>
                                                    🌐 AutoMart Website
                                                </span>
                                            )}

                                            <span style={{ 
                                                padding: '3px 8px', 
                                                borderRadius: '4px', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 700,
                                                backgroundColor: review.status === 'Approved' ? 'rgba(34, 197, 94, 0.2)' : (review.status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                                                color: review.status === 'Approved' ? '#4ade80' : (review.status === 'Pending' ? '#facc15' : '#f87171')
                                            }}>
                                                {review.status}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star 
                                                        key={star} 
                                                        size={14} 
                                                        fill={star <= review.rating ? '#f59e0b' : 'none'} 
                                                        color={star <= review.rating ? '#f59e0b' : '#64748b'} 
                                                    />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons for Admin */}
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {review.status !== 'Approved' && (
                                            <button 
                                                onClick={() => handleStatusChange(review._id, 'Approved')}
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    borderRadius: '6px', 
                                                    border: '1px solid #16a34a', 
                                                    backgroundColor: 'rgba(22, 163, 74, 0.2)', 
                                                    color: '#4ade80', 
                                                    fontSize: '0.82rem', 
                                                    fontWeight: 600, 
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <CheckCircle2 size={14} /> Approve
                                            </button>
                                        )}

                                        {review.status !== 'Rejected' && (
                                            <button 
                                                onClick={() => handleStatusChange(review._id, 'Rejected')}
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    borderRadius: '6px', 
                                                    border: '1px solid #ea580c', 
                                                    backgroundColor: 'rgba(234, 88, 12, 0.2)', 
                                                    color: '#fb923c', 
                                                    fontSize: '0.82rem', 
                                                    fontWeight: 600, 
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => handleDelete(review._id)}
                                            style={{ 
                                                padding: '6px 12px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #dc2626', 
                                                backgroundColor: 'rgba(220, 38, 38, 0.2)', 
                                                color: '#f87171', 
                                                fontSize: '0.82rem', 
                                                fontWeight: 600, 
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>

                                {review.title && (
                                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.98rem', marginBottom: '6px' }}>
                                        {review.title}
                                    </div>
                                )}
                                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
                                    {review.comment}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ManageFeedback;
