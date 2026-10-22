import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
    Star, 
    MessageSquare, 
    CheckCircle, 
    AlertCircle, 
    User as UserIcon, 
    Calendar, 
    Trash2, 
    Send, 
    Sparkles,
    ShieldCheck,
    ChevronDown,
    Loader2
} from 'lucide-react';

/**
 * Reusable Feedback & Reviews Component
 * Supports both Car-specific feedback (when carId is passed)
 * and General AutoMart website feedback (when carId is null or omitted).
 */
const FeedbackSection = ({ 
    carId = null, 
    targetTitle = "Customer Ratings & Reviews",
    targetDescription = "Real reviews from verified buyers and AutoMart community members.",
    itemName = "this vehicle"
}) => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const formRef = useRef(null);

    // Reviews list & stats
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [userExistingReview, setUserExistingReview] = useState(null);

    // Rating text mapping
    const ratingLabels = {
        1: 'Poor - Needs improvement',
        2: 'Fair - Below expectations',
        3: 'Good - Met expectations',
        4: 'Very Good - Highly satisfied',
        5: 'Excellent - Exceeded expectations!'
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Determine the API base URL
    const fetchUrl = carId 
        ? `${API_URL}/feedback/car/${carId}` 
        : `${API_URL}/feedback`;

    // Fetch Reviews
    const fetchFeedback = async (pageNum = 1, append = false) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const res = await axios.get(`${fetchUrl}?page=${pageNum}&limit=5`);
            if (res.data.success) {
                setStats({
                    totalReviews: res.data.totalReviews || 0,
                    averageRating: res.data.averageRating || 0,
                    ratingDistribution: res.data.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
                });
                setTotalPages(res.data.totalPages || 1);
                setHasMore(res.data.hasMore || false);
                setPage(pageNum);

                if (append) {
                    setReviews(prev => [...prev, ...(res.data.reviews || [])]);
                } else {
                    setReviews(res.data.reviews || []);
                }
            }
        } catch (err) {
            console.error('Error fetching feedback:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Check if logged-in user already reviewed
    const checkUserReview = async () => {
        if (!user || !user.token) {
            setUserExistingReview(null);
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const url = `${API_URL}/feedback/my-review${carId ? `?carId=${carId}` : ''}`;
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (res.data.success && res.data.hasReviewed && res.data.review) {
                setUserExistingReview(res.data.review);
                setRating(res.data.review.rating || 5);
                setTitle(res.data.review.title || '');
                setComment(res.data.review.comment || '');
            } else {
                setUserExistingReview(null);
            }
        } catch (err) {
            console.error('Error checking user review:', err);
        }
    };

    // Initial load
    useEffect(() => {
        fetchFeedback(1, false);
        checkUserReview();
    }, [carId, user]);

    // Handle incoming redirect after login if user clicked "Write a Review"
    useEffect(() => {
        if (location.state?.openReviewForm && user) {
            setShowForm(true);
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, [location.state, user]);

    // Click handler for "Write a Review" button
    const handleWriteReviewClick = () => {
        if (!user || !user.token) {
            showToast({
                title: 'Login Required',
                message: 'Please login or register to share your review.',
                type: 'info',
                actionText: 'Login Now',
                actionLink: '/user/login'
            });

            // Redirect to login and preserve the current page URL and openReviewForm flag
            navigate('/user/login', {
                state: {
                    from: location.pathname,
                    fromCar: carId,
                    redirectTo: location.pathname,
                    openReviewForm: true
                }
            });
            return;
        }

        setShowForm(prev => !prev);
        if (!showForm) {
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    // Submit review form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSuccessMessage('');

        if (!user || !user.token) {
            setFormError('You must be logged in to submit a review.');
            return;
        }

        if (!rating || rating < 1 || rating > 5) {
            setFormError('Please select a star rating between 1 and 5.');
            return;
        }

        if (!comment.trim()) {
            setFormError('Please write your review comment before submitting.');
            return;
        }

        if (comment.trim().length < 3) {
            setFormError('Your feedback comment must be at least 3 characters long.');
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                rating: Number(rating),
                title: title.trim(),
                comment: comment.trim(),
                carId: carId || null
            };

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${API_URL}/feedback`, payload, {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                }
            });

            if (res.data.success) {
                setSuccessMessage(res.data.message || 'Review submitted successfully!');
                showToast({
                    title: 'Review Saved',
                    message: res.data.message || 'Thank you! Your feedback is now live.',
                    type: 'success'
                });

                setUserExistingReview(res.data.review);
                // Refresh reviews list and stats
                await fetchFeedback(1, false);

                // Auto hide form or clear form
                setTimeout(() => {
                    setSuccessMessage('');
                    setShowForm(false);
                }, 2200);
            } else {
                setFormError(res.data.message || 'Failed to submit feedback.');
            }
        } catch (err) {
            console.error('Error submitting feedback:', err);
            const msg = err.response?.data?.message || 'Failed to submit review. Please try again.';
            setFormError(msg);
            showToast({
                title: 'Submission Error',
                message: msg,
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Delete review
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.delete(`${API_URL}/feedback/${reviewId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (res.data.success) {
                showToast({
                    title: 'Review Deleted',
                    message: 'Your review was deleted successfully.',
                    type: 'info'
                });
                setUserExistingReview(null);
                setTitle('');
                setComment('');
                setRating(5);
                fetchFeedback(1, false);
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            showToast({
                title: 'Error',
                message: err.response?.data?.message || 'Failed to delete review.',
                type: 'error'
            });
        }
    };

    // Helper to format date
    const formatDate = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return '';
        }
    };

    // Load more handler
    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            fetchFeedback(page + 1, true);
        }
    };

    return (
        <section 
            id="reviews-section"
            style={{ 
                marginTop: '45px', 
                marginBottom: '45px', 
                fontFamily: "'Inter', sans-serif" 
            }}
        >
            <style>{`
                .feedback-container {
                    background-color: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 32px 28px;
                    box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
                }
                .feedback-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-bottom: 28px;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 20px;
                }
                .feedback-overview-grid {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 28px;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 24px;
                    margin-bottom: 32px;
                }
                .rating-score-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    border-right: 1px solid #cbd5e1;
                    padding-right: 20px;
                }
                .distribution-bars {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    justify-content: center;
                }
                .dist-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.85rem;
                    color: #475569;
                }
                .dist-bar-bg {
                    flex: 1;
                    height: 8px;
                    background-color: #e2e8f0;
                    border-radius: 10px;
                    overflow: hidden;
                }
                .dist-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #0284c7, #007bff);
                    border-radius: 10px;
                    transition: width 0.4s ease;
                }
                .review-card {
                    background-color: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 22px;
                    margin-bottom: 18px;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
                }
                .review-card:hover {
                    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
                    border-color: #cbd5e1;
                }
                .star-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 3px;
                    transition: transform 0.15s ease;
                    outline: none;
                }
                .star-btn:hover {
                    transform: scale(1.18);
                }
                .review-btn-primary {
                    background: linear-gradient(135deg, #007bff 0%, #0284c7 100%);
                    color: #ffffff;
                    border: none;
                    padding: 11px 22px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
                    transition: all 0.2s ease;
                }
                .review-btn-primary:hover {
                    background: linear-gradient(135deg, #0069d9 0%, #0369a1 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
                }
                .review-form-box {
                    background: #ffffff;
                    border: 2px solid #e0f2fe;
                    border-radius: 14px;
                    padding: 26px;
                    margin-bottom: 32px;
                    box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.08);
                }
                @media (max-width: 768px) {
                    .feedback-container {
                        padding: 20px 16px;
                    }
                    .feedback-overview-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                        padding: 16px;
                    }
                    .rating-score-box {
                        border-right: none;
                        border-bottom: 1px solid #cbd5e1;
                        padding-right: 0;
                        padding-bottom: 18px;
                    }
                }
            `}</style>

            <div className="feedback-container">
                {/* 1. Header with Title & Action Button */}
                <div className="feedback-header-row">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px', 
                                padding: '4px 10px', 
                                backgroundColor: '#e0f2fe', 
                                color: '#0284c7', 
                                borderRadius: '20px', 
                                fontSize: '0.78rem', 
                                fontWeight: 700, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.5px' 
                            }}>
                                <Sparkles size={13} /> Feedback & Reviews
                            </span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.85rem)', color: '#0f172a', margin: '0 0 6px 0', fontWeight: 800 }}>
                            {targetTitle}
                        </h2>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>
                            {targetDescription}
                        </p>
                    </div>

                    <div>
                        <button 
                            id="write-review-btn"
                            onClick={handleWriteReviewClick}
                            className="review-btn-primary"
                        >
                            <MessageSquare size={17} />
                            {userExistingReview ? 'Edit Your Review' : (showForm ? 'Close Form' : 'Write a Review')}
                        </button>
                    </div>
                </div>

                {/* 2. Rating Overview & Breakdown (when reviews exist) */}
                {stats.totalReviews > 0 ? (
                    <div className="feedback-overview-grid">
                        {/* Big Average Score */}
                        <div className="rating-score-box">
                            <div style={{ fontSize: '3.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                                {stats.averageRating.toFixed(1)}
                            </div>
                            <div style={{ display: 'flex', gap: '4px', margin: '10px 0 6px 0' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star 
                                        key={star} 
                                        size={22} 
                                        fill={star <= Math.round(stats.averageRating) ? '#f59e0b' : '#e2e8f0'} 
                                        color={star <= Math.round(stats.averageRating) ? '#f59e0b' : '#cbd5e1'} 
                                    />
                                ))}
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
                                Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'verified review' : 'verified reviews'}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                                100% Genuine AutoMart Customer Feedback
                            </div>
                        </div>

                        {/* Star Distribution Progress Bars */}
                        <div className="distribution-bars">
                            {[5, 4, 3, 2, 1].map(starNum => {
                                const count = stats.ratingDistribution[starNum] || 0;
                                const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
                                return (
                                    <div key={starNum} className="dist-row">
                                        <span style={{ width: '42px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            {starNum} <Star size={13} fill="#f59e0b" color="#f59e0b" />
                                        </span>
                                        <div className="dist-bar-bg">
                                            <div className="dist-bar-fill" style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <span style={{ width: '60px', textAlign: 'right', color: '#64748b', fontSize: '0.8rem' }}>
                                            {count} ({pct}%)
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : null}

                {/* 3. Review Submission Form */}
                {showForm && (
                    <div ref={formRef} className="review-form-box" id="feedback-submission-form">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e0f2fe', paddingBottom: '12px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>
                                    {userExistingReview ? 'Update Your Review' : `Share Your Experience with ${itemName}`}
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                    Posting publicly as <strong style={{ color: '#0284c7' }}>{user?.fullName || 'Verified User'}</strong>
                                </p>
                            </div>
                            {userExistingReview && (
                                <span style={{ 
                                    padding: '4px 10px', 
                                    backgroundColor: '#dcfce7', 
                                    color: '#15803d', 
                                    borderRadius: '6px', 
                                    fontSize: '0.78rem', 
                                    fontWeight: 700 
                                }}>
                                    ✓ You already reviewed this
                                </span>
                            )}
                        </div>

                        {formError && (
                            <div style={{ 
                                backgroundColor: '#fef2f2', 
                                color: '#b91c1c', 
                                border: '1px solid #fecaca', 
                                padding: '12px 16px', 
                                borderRadius: '8px', 
                                marginBottom: '18px', 
                                fontSize: '0.9rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px' 
                            }}>
                                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                                <span>{formError}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div style={{ 
                                backgroundColor: '#f0fdf4', 
                                color: '#15803d', 
                                border: '1px solid #bbf7d0', 
                                padding: '14px 16px', 
                                borderRadius: '8px', 
                                marginBottom: '18px', 
                                fontSize: '0.92rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                fontWeight: 600
                            }}>
                                <CheckCircle size={20} style={{ flexShrink: 0 }} />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Star Rating Picker */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                                    Your Rating <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const isFilled = (hoverRating || rating) >= star;
                                        return (
                                            <button
                                                type="button"
                                                key={star}
                                                id={`star-rating-select-${star}`}
                                                className="star-btn"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                aria-label={`Rate ${star} stars`}
                                            >
                                                <Star 
                                                    size={32} 
                                                    fill={isFilled ? '#f59e0b' : 'none'} 
                                                    color={isFilled ? '#f59e0b' : '#cbd5e1'} 
                                                    strokeWidth={1.5}
                                                />
                                            </button>
                                        );
                                    })}
                                    <span style={{ 
                                        marginLeft: '12px', 
                                        fontSize: '0.9rem', 
                                        fontWeight: 600, 
                                        color: (hoverRating || rating) >= 4 ? '#16a34a' : ((hoverRating || rating) === 3 ? '#d97706' : '#dc2626') 
                                    }}>
                                        {ratingLabels[hoverRating || rating]}
                                    </span>
                                </div>
                            </div>

                            {/* Optional Review Title */}
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                    Review Title <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.82rem' }}>(Optional)</span>
                                </label>
                                <input 
                                    id="review-title-input"
                                    type="text" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    placeholder="e.g. Smooth performance and immaculate condition!"
                                    maxLength={100}
                                    style={{ 
                                        width: '100%', 
                                        padding: '11px 14px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #cbd5e1', 
                                        fontSize: '0.95rem', 
                                        outline: 'none', 
                                        boxSizing: 'border-box' 
                                    }} 
                                />
                            </div>

                            {/* Review Comment (Required) */}
                            <div style={{ marginBottom: '22px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                                    Your Feedback / Review <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea 
                                    id="review-comment-input"
                                    rows={4} 
                                    value={comment} 
                                    onChange={(e) => setComment(e.target.value)} 
                                    placeholder="Write your honest thoughts, condition of the car, driving experience, customer support, delivery, etc..."
                                    required
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px 14px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #cbd5e1', 
                                        fontSize: '0.95rem', 
                                        outline: 'none', 
                                        resize: 'vertical', 
                                        boxSizing: 'border-box',
                                        lineHeight: 1.5
                                    }} 
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.78rem', color: '#94a3b8' }}>
                                    <span>Minimum 3 characters</span>
                                    <span>{comment.length} characters</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <button 
                                    id="submit-feedback-btn"
                                    type="submit" 
                                    disabled={submitting}
                                    className="review-btn-primary"
                                    style={{ opacity: submitting ? 0.75 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Saving Feedback...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            {userExistingReview ? 'Update Review' : 'Submit Feedback'}
                                        </>
                                    )}
                                </button>

                                <button 
                                    type="button" 
                                    onClick={() => setShowForm(false)}
                                    style={{ 
                                        padding: '10px 18px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #cbd5e1', 
                                        backgroundColor: '#ffffff', 
                                        color: '#475569', 
                                        fontWeight: 600, 
                                        fontSize: '0.9rem', 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    Cancel
                                </button>

                                {userExistingReview && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteReview(userExistingReview._id)}
                                        style={{ 
                                            marginLeft: 'auto', 
                                            padding: '10px 14px', 
                                            borderRadius: '8px', 
                                            border: '1px solid #fecaca', 
                                            backgroundColor: '#fef2f2', 
                                            color: '#dc2626', 
                                            fontWeight: 600, 
                                            fontSize: '0.85rem', 
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        <Trash2 size={14} /> Delete My Review
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* 4. Reviews List */}
                <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>
                            Customer Reviews ({stats.totalReviews})
                        </h3>
                    </div>

                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            <Loader2 size={32} color="#007bff" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
                            <p style={{ margin: 0, fontSize: '0.95rem' }}>Loading reviews from AutoMart database...</p>
                            <style>{`
                                @keyframes spin { 100% { transform: rotate(360deg); } }
                            `}</style>
                        </div>
                    ) : reviews.length === 0 ? (
                        /* Empty state: clear message as requested */
                        <div 
                            id="no-reviews-message"
                            style={{ 
                                padding: '48px 20px', 
                                textAlign: 'center', 
                                backgroundColor: '#f8fafc', 
                                borderRadius: '12px', 
                                border: '1px dashed #cbd5e1', 
                                color: '#475569' 
                            }}
                        >
                            <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '50%', 
                                backgroundColor: '#e0f2fe', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: '0 auto 16px auto',
                                color: '#0284c7'
                            }}>
                                <MessageSquare size={28} />
                            </div>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#1e293b', fontWeight: 700 }}>
                                No reviews yet. Be the first to share your experience!
                            </h4>
                            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
                                Have you driven or inspected {itemName}? Help fellow automotive enthusiasts by sharing your rating and feedback.
                            </p>
                            <button 
                                onClick={handleWriteReviewClick}
                                className="review-btn-primary"
                            >
                                <MessageSquare size={16} /> Write the First Review
                            </button>
                        </div>
                    ) : (
                        <div>
                            {reviews.map((item) => {
                                const isCurrentUser = user && (user._id === item.userId || user.id === item.userId);
                                return (
                                    <div key={item._id} className="review-card" id={`review-card-${item._id}`}>
                                        {/* Review Header: User avatar, name, rating, date */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {/* Avatar with initials */}
                                                <div style={{ 
                                                    width: '42px', 
                                                    height: '42px', 
                                                    borderRadius: '50%', 
                                                    background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)', 
                                                    color: '#ffffff', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    fontWeight: 700, 
                                                    fontSize: '1rem',
                                                    flexShrink: 0
                                                }}>
                                                    {item.userName ? item.userName.charAt(0).toUpperCase() : 'U'}
                                                </div>

                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                                                            {item.userName || 'Verified Buyer'}
                                                        </span>
                                                        <span style={{ 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            gap: '3px', 
                                                            fontSize: '0.72rem', 
                                                            fontWeight: 700, 
                                                            backgroundColor: '#ecfdf5', 
                                                            color: '#059669', 
                                                            padding: '2px 7px', 
                                                            borderRadius: '4px' 
                                                        }}>
                                                            <ShieldCheck size={12} /> Verified
                                                        </span>
                                                        {isCurrentUser && (
                                                            <span style={{ 
                                                                fontSize: '0.72rem', 
                                                                fontWeight: 700, 
                                                                backgroundColor: '#eff6ff', 
                                                                color: '#2563eb', 
                                                                padding: '2px 7px', 
                                                                borderRadius: '4px' 
                                                            }}>
                                                                You
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                                                        <div style={{ display: 'flex', gap: '2px' }}>
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star 
                                                                    key={s} 
                                                                    size={15} 
                                                                    fill={s <= item.rating ? '#f59e0b' : '#e2e8f0'} 
                                                                    color={s <= item.rating ? '#f59e0b' : '#cbd5e1'} 
                                                                />
                                                            ))}
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Calendar size={12} /> {formatDate(item.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action for Owner / Admin */}
                                            {isCurrentUser && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button 
                                                        onClick={() => {
                                                            setShowForm(true);
                                                            setTimeout(() => {
                                                                formRef.current?.scrollIntoView({ behavior: 'smooth' });
                                                            }, 100);
                                                        }}
                                                        style={{ 
                                                            padding: '5px 10px', 
                                                            borderRadius: '6px', 
                                                            border: '1px solid #cbd5e1', 
                                                            backgroundColor: '#fff', 
                                                            color: '#0284c7', 
                                                            fontSize: '0.8rem', 
                                                            fontWeight: 600, 
                                                            cursor: 'pointer' 
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteReview(item._id)}
                                                        style={{ 
                                                            padding: '5px 10px', 
                                                            borderRadius: '6px', 
                                                            border: '1px solid #fecaca', 
                                                            backgroundColor: '#fff', 
                                                            color: '#dc2626', 
                                                            fontSize: '0.8rem', 
                                                            fontWeight: 600, 
                                                            cursor: 'pointer' 
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Title (if present) */}
                                        {item.title && (
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.02rem', fontWeight: 700, color: '#1e293b' }}>
                                                {item.title}
                                            </h4>
                                        )}

                                        {/* Comment Body */}
                                        <p style={{ margin: 0, fontSize: '0.94rem', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                            {item.comment}
                                        </p>
                                    </div>
                                );
                            })}

                            {/* Load More Button */}
                            {hasMore && (
                                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                    <button 
                                        id="load-more-reviews-btn"
                                        onClick={handleLoadMore} 
                                        disabled={loadingMore}
                                        style={{ 
                                            padding: '10px 24px', 
                                            borderRadius: '8px', 
                                            border: '1px solid #0284c7', 
                                            backgroundColor: '#ffffff', 
                                            color: '#0284c7', 
                                            fontWeight: 700, 
                                            fontSize: '0.92rem', 
                                            cursor: loadingMore ? 'not-allowed' : 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Loading Reviews...
                                            </>
                                        ) : (
                                            <>
                                                Load More Reviews ({reviews.length} of {stats.totalReviews}) <ChevronDown size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FeedbackSection;
