import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
    MapPin, 
    User, 
    Phone, 
    Mail, 
    Edit3, 
    CheckCircle2, 
    X, 
    Save, 
    CreditCard, 
    Truck, 
    AlertCircle,
    Building2,
    ShieldCheck
} from 'lucide-react';

const Checkout = () => {
    const { user, updateUserProfile } = useContext(AuthContext);
    const { showToast } = useToast();
    const [singleCar, setSingleCar] = useState(null);
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);
    const carId = queryParams.get('carId');

    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Customer & Delivery Address details state
    const [customerDetails, setCustomerDetails] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        state: '',
        pincode: ''
    });

    // Edit form state
    const [editForm, setEditForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        state: '',
        pincode: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [savePreference, setSavePreference] = useState('order_only'); // 'order_only' | 'profile'
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [hasCustomized, setHasCustomized] = useState(false);

    // Fetch user profile from MongoDB and load car or cart
    useEffect(() => {
        if (!user || !user.token) {
            navigate('/user/login');
            return;
        }

        setIsLoading(true);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

        // 1. Fetch user's saved profile details from MongoDB
        const profilePromise = axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${user.token}` }
        }).then(res => {
            const profile = res.data;
            const loaded = {
                fullName: profile.fullName || user.fullName || '',
                email: profile.email || user.email || '',
                phone: profile.phone || user.phone || '',
                address: profile.address || user.address || '',
                state: profile.state || user.state || '',
                pincode: profile.pincode || user.pincode || ''
            };
            setCustomerDetails(loaded);
            setEditForm(loaded);
        }).catch(err => {
            console.warn('Could not fetch latest user profile from API, falling back to local user:', err);
            const fallback = {
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                state: user.state || '',
                pincode: user.pincode || ''
            };
            setCustomerDetails(fallback);
            setEditForm(fallback);
        });

        // 2. Fetch Car or Cart
        const itemPromise = carId 
            ? axios.get(`${API_URL}/cars/${carId}`)
                .then(res => setSingleCar(res.data))
                .catch(err => {
                    console.error('Failed to load car details:', err);
                    setFetchError('Failed to load car details. It may have been removed.');
                })
            : axios.get(`${API_URL}/cart`, { 
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => setCart(res.data))
                .catch(err => {
                    console.error('Failed to load cart:', err);
                    setFetchError('Failed to load cart.');
                });

        Promise.all([profilePromise, itemPromise])
            .finally(() => setIsLoading(false));

    }, [carId, user, navigate]);

    if (isLoading) {
        return (
            <div style={{ maxWidth: '850px', margin: '40px auto', padding: '30px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <h3 style={{ marginTop: '16px', color: '#475569' }}>Loading checkout details...</h3>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div style={{ maxWidth: '850px', margin: '40px auto', padding: '30px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', textAlign: 'center', color: '#b91c1c' }}>
                <h2>Checkout Error</h2>
                <p>{fetchError}</p>
                <button 
                    onClick={() => navigate('/cars')} 
                    style={{ padding: '10px 20px', backgroundColor: '#b91c1c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}
                >
                    Browse Cars
                </button>
            </div>
        );
    }

    if (!singleCar && cart.length === 0) {
        return (
            <div style={{ maxWidth: '850px', margin: '40px auto', padding: '40px 20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <h2>Your Cart is empty</h2>
                <p style={{ color: '#64748b' }}>Please select a vehicle to proceed to checkout.</p>
                <button 
                    onClick={() => navigate('/cars')} 
                    style={{ padding: '12px 24px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '12px', fontWeight: 600 }}
                >
                    Browse Showroom
                </button>
            </div>
        );
    }

    const total = singleCar ? singleCar.price : cart.reduce((acc, item) => acc + item.price, 0);
    const discount = singleCar ? (singleCar.discount || 0) : cart.reduce((acc, item) => acc + (item.carId?.discount || 0), 0);
    const priceAfterDiscount = total - discount;
    const taxes = priceAfterDiscount * 0.1; // 10% tax
    const grandTotal = priceAfterDiscount + taxes;

    // Validate fields helper
    const validateFields = (fields) => {
        const errors = {};
        if (!fields.fullName || !fields.fullName.trim()) {
            errors.fullName = 'Full Name is required';
        }
        
        if (!fields.email || !fields.email.trim()) {
            errors.email = 'Email Address is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fields.email.trim())) {
                errors.email = 'Please provide a valid email address';
            }
        }

        const phoneDigits = (fields.phone || '').trim().replace(/\D/g, '');
        if (!phoneDigits) {
            errors.phone = 'Phone Number is required';
        } else if (phoneDigits.length < 10) {
            errors.phone = 'Phone number must have at least 10 digits';
        }

        if (!fields.address || !fields.address.trim()) {
            errors.address = 'Delivery Address is required';
        }

        if (!fields.state || !fields.state.trim()) {
            errors.state = 'State is required';
        }

        const pin = (fields.pincode || '').trim();
        if (!pin) {
            errors.pincode = 'Pincode is required';
        } else if (!/^[0-9]{5,6}$/.test(pin)) {
            errors.pincode = 'Pincode must be 5 or 6 digits';
        }

        return errors;
    };

    // Open edit mode
    const handleStartEdit = () => {
        setEditForm({ ...customerDetails });
        setFieldErrors({});
        setIsEditing(true);
    };

    // Cancel edit mode
    const handleCancelEdit = () => {
        setEditForm({ ...customerDetails });
        setFieldErrors({});
        setIsEditing(false);
    };

    // Save changes from edit form
    const handleSaveEdit = async () => {
        const errors = validateFields(editForm);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            showToast({
                title: 'Validation Error',
                message: 'Please fill in all delivery details correctly.',
                type: 'error'
            });
            return;
        }

        setFieldErrors({});

        // If user chose "Save to my profile", also persist to MongoDB profile endpoint immediately
        if (savePreference === 'profile') {
            setIsSavingProfile(true);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            try {
                const response = await axios.put(`${API_URL}/users/profile`, {
                    fullName: editForm.fullName.trim(),
                    email: editForm.email.trim(),
                    phone: editForm.phone.trim(),
                    address: editForm.address.trim(),
                    state: editForm.state.trim(),
                    pincode: editForm.pincode.trim()
                }, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });

                if (updateUserProfile) {
                    updateUserProfile(response.data);
                }

                showToast({
                    title: 'Profile Updated! 💾',
                    message: 'Your contact and delivery details have been saved to your MongoDB profile.',
                    type: 'success'
                });
            } catch (err) {
                console.error('Failed to update user profile:', err);
                const msg = err.response?.data?.message || 'Failed to update profile. Please verify your details.';
                showToast({
                    title: 'Profile Update Failed',
                    message: msg,
                    type: 'error'
                });
                setIsSavingProfile(false);
                return;
            } finally {
                setIsSavingProfile(false);
            }
        } else {
            showToast({
                title: 'Details Updated for this Order',
                message: 'Your edited details will be used for this purchase without changing your saved profile.',
                type: 'info'
            });
        }

        setCustomerDetails({ ...editForm });
        setHasCustomized(true);
        setIsEditing(false);
    };

    // Place Order handler
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Check if currently editing and has unsaved changes
        if (isEditing) {
            showToast({
                title: 'Unsaved Changes',
                message: 'Please click "Save Changes" or "Cancel" on the address editor before placing your order.',
                type: 'warning'
            });
            return;
        }

        // Validate final customer details
        const errors = validateFields(customerDetails);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setIsEditing(true);
            showToast({
                title: 'Delivery Details Incomplete',
                message: 'Please complete all required delivery fields before purchasing.',
                type: 'error'
            });
            return;
        }

        if (!paymentMethod) {
            showToast({
                title: 'Payment Method Required',
                message: 'Please select a payment method to complete your order.',
                type: 'error'
            });
            return;
        }

        if (isProcessing) return;
        setIsProcessing(true);

        try {
            // Simulate Payment Gateway delay for online payments
            if (paymentMethod === 'Online') {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const orderPayload = {
                paymentMethod,
                paymentStatus: paymentMethod === 'Online' ? 'Paid' : 'Pending',
                customerName: customerDetails.fullName.trim(),
                customerEmail: customerDetails.email.trim(),
                customerPhone: customerDetails.phone.trim(),
                deliveryAddress: customerDetails.address.trim(),
                state: customerDetails.state.trim(),
                pincode: customerDetails.pincode.trim(),
                saveToProfile: savePreference === 'profile'
            };

            let firstOrderId = '';
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            if (singleCar) {
                const response = await axios.post(`${API_URL}/orders`, {
                    ...orderPayload,
                    carId: singleCar._id
                }, { headers: { Authorization: `Bearer ${user.token}` }});
                firstOrderId = response.data.orderId;
            } else {
                for (let item of cart) {
                    const response = await axios.post(`${API_URL}/orders`, {
                        ...orderPayload,
                        carId: item.carId._id
                    }, { headers: { Authorization: `Bearer ${user.token}` }});
                    if (!firstOrderId) firstOrderId = response.data.orderId;
                }
                await axios.delete(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${user.token}` }});
            }

            // Sync AuthContext if saveToProfile was requested
            if (savePreference === 'profile' && updateUserProfile) {
                updateUserProfile({
                    fullName: customerDetails.fullName.trim(),
                    email: customerDetails.email.trim(),
                    phone: customerDetails.phone.trim(),
                    address: customerDetails.address.trim(),
                    state: customerDetails.state.trim(),
                    pincode: customerDetails.pincode.trim()
                });
            }
            
            if (paymentMethod === 'Online') {
                showToast({
                    title: 'Payment Successful! 🎉',
                    message: `Order placed successfully. Order ID: ${firstOrderId}`,
                    type: 'success',
                    actionText: 'View Orders',
                    actionLink: '/myorders',
                    duration: 5000
                });
            } else {
                showToast({
                    title: 'Order Placed! 📦',
                    message: `Your Cash on Delivery order has been submitted. Pay upon vehicle delivery.`,
                    type: 'success',
                    actionText: 'View Orders',
                    actionLink: '/myorders',
                    duration: 5000
                });
            }
            navigate('/myorders');
        } catch (error) {
            console.error('Order placement error:', error);
            const msg = error.response?.data?.message || 'Failed to process checkout. Please retry.';
            showToast({
                title: 'Checkout Failed',
                message: msg,
                type: 'error'
            });
            setIsProcessing(false);
        }
    };

    return (
        <div className="checkout-page-card" style={{ maxWidth: '920px', margin: '30px auto', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
            <style>{`
                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1.15fr 0.85fr;
                    gap: 24px;
                    margin-top: 20px;
                }
                .checkout-payment-methods {
                    display: flex;
                    gap: 16px;
                }
                .form-input-control {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    box-sizing: border-box;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    font-family: inherit;
                }
                .form-input-control:focus {
                    outline: none;
                    border-color: #0284c7;
                    box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
                }
                .form-input-control.error {
                    border-color: #ef4444;
                    background-color: #fef2f2;
                }
                .field-error-msg {
                    color: #dc2626;
                    font-size: 0.8rem;
                    margin-top: 4px;
                    display: block;
                    font-weight: 500;
                }
                .preference-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px 14px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    background-color: #ffffff;
                    transition: all 0.2s;
                }
                .preference-card:hover {
                    border-color: #94a3b8;
                }
                .preference-card.selected {
                    border-color: #0284c7;
                    background-color: #f0f9ff;
                }
                @media (max-width: 820px) {
                    .checkout-page-card {
                        margin: 15px 10px !important;
                        padding: 18px 14px !important;
                    }
                    .checkout-grid {
                        grid-template-columns: 1fr !important;
                        gap: 20px !important;
                    }
                    .checkout-payment-methods {
                        flex-direction: column !important;
                        gap: 12px !important;
                    }
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '14px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.6rem', fontWeight: 800 }}>Complete Your Purchase</h2>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Review customer details, vehicle specifications, and payment method.</p>
                </div>
            </div>
            
            <div className="checkout-grid">
                {/* Left Column: Customer & Delivery Details */}
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={20} color="#0284c7" /> Customer & Delivery Details
                            </h3>
                            <div style={{ marginTop: '6px' }}>
                                {hasCustomized ? (
                                    savePreference === 'profile' ? (
                                        <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600 }}>
                                            ✓ Saved to Profile & Order
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
                                            • For this order only
                                        </span>
                                    )
                                ) : (
                                    <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                                        ✓ Saved Profile Details Auto-Filled
                                    </span>
                                )}
                            </div>
                        </div>

                        {!isEditing && (
                            <button
                                type="button"
                                id="btn-edit-address"
                                onClick={handleStartEdit}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '7px 14px',
                                    backgroundColor: '#f8fafc',
                                    border: '1.5px solid #cbd5e1',
                                    borderRadius: '6px',
                                    color: '#0284c7',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Edit3 size={15} /> Edit Address
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        /* Read-only Display Mode */
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.94rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <User size={17} color="#64748b" style={{ flexShrink: 0 }} />
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '0.82rem', display: 'block' }}>Full Name</span>
                                        <strong style={{ color: '#1e293b' }}>{customerDetails.fullName || '—'}</strong>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Phone size={17} color="#64748b" style={{ flexShrink: 0 }} />
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '0.82rem', display: 'block' }}>Phone Number</span>
                                        <strong style={{ color: '#1e293b' }}>{customerDetails.phone || '—'}</strong>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Mail size={17} color="#64748b" style={{ flexShrink: 0 }} />
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '0.82rem', display: 'block' }}>Email Address</span>
                                        <strong style={{ color: '#1e293b' }}>{customerDetails.email || '—'}</strong>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                    <MapPin size={17} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '0.82rem', display: 'block' }}>Delivery Address</span>
                                        <div style={{ color: '#1e293b', fontWeight: 600, lineHeight: 1.4 }}>
                                            {customerDetails.address || '—'}
                                        </div>
                                        <div style={{ color: '#475569', fontSize: '0.88rem', marginTop: '2px' }}>
                                            {customerDetails.state ? `${customerDetails.state} - ` : ''}{customerDetails.pincode}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleStartEdit}
                                style={{
                                    marginTop: '20px',
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#f0f9ff',
                                    border: '1px dashed #0284c7',
                                    borderRadius: '6px',
                                    color: '#0284c7',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                ✏️ Change or Edit Delivery Address
                            </button>
                        </div>
                    ) : (
                        /* Interactive Edit Mode */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ padding: '10px 12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', fontSize: '0.85rem', color: '#0369a1' }}>
                                Edit your delivery details below. You can apply them solely for this purchase or update your profile permanently.
                            </div>

                            {/* Full Name */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="checkout-fullName"
                                    value={editForm.fullName}
                                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                    className={`form-input-control ${fieldErrors.fullName ? 'error' : ''}`}
                                    placeholder="e.g. John Doe"
                                />
                                {fieldErrors.fullName && <span className="field-error-msg">{fieldErrors.fullName}</span>}
                            </div>

                            {/* Phone & Email Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                                        Phone Number <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="checkout-phone"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className={`form-input-control ${fieldErrors.phone ? 'error' : ''}`}
                                        placeholder="10-digit mobile"
                                    />
                                    {fieldErrors.phone && <span className="field-error-msg">{fieldErrors.phone}</span>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                                        Email Address <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="checkout-email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className={`form-input-control ${fieldErrors.email ? 'error' : ''}`}
                                        placeholder="user@example.com"
                                    />
                                    {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                                    Delivery Address <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                    id="checkout-address"
                                    rows="2"
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    className={`form-input-control ${fieldErrors.address ? 'error' : ''}`}
                                    placeholder="Flat / House No., Street, Area, Landmark"
                                />
                                {fieldErrors.address && <span className="field-error-msg">{fieldErrors.address}</span>}
                            </div>

                            {/* State & Pincode Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                                        State <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="checkout-state"
                                        value={editForm.state}
                                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                                        className={`form-input-control ${fieldErrors.state ? 'error' : ''}`}
                                        placeholder="e.g. Karnataka"
                                    />
                                    {fieldErrors.state && <span className="field-error-msg">{fieldErrors.state}</span>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                                        Pincode <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="checkout-pincode"
                                        maxLength="6"
                                        value={editForm.pincode}
                                        onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                                        className={`form-input-control ${fieldErrors.pincode ? 'error' : ''}`}
                                        placeholder="5 or 6 digits"
                                    />
                                    {fieldErrors.pincode && <span className="field-error-msg">{fieldErrors.pincode}</span>}
                                </div>
                            </div>

                            {/* Save Address Options */}
                            <div style={{ marginTop: '6px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                                    Save Address Option:
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className={`preference-card ${savePreference === 'order_only' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="savePreference"
                                            value="order_only"
                                            checked={savePreference === 'order_only'}
                                            onChange={() => setSavePreference('order_only')}
                                            style={{ marginTop: '3px' }}
                                        />
                                        <div>
                                            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Use for this order only</strong>
                                            <small style={{ display: 'block', color: '#64748b', fontSize: '0.78rem', marginTop: '2px' }}>
                                                Apply these details to this purchase without updating your saved profile in MongoDB.
                                            </small>
                                        </div>
                                    </label>

                                    <label className={`preference-card ${savePreference === 'profile' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="savePreference"
                                            value="profile"
                                            checked={savePreference === 'profile'}
                                            onChange={() => setSavePreference('profile')}
                                            style={{ marginTop: '3px' }}
                                        />
                                        <div>
                                            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Save to my profile</strong>
                                            <small style={{ display: 'block', color: '#64748b', fontSize: '0.78rem', marginTop: '2px' }}>
                                                Also update your saved contact & address in MongoDB for future orders.
                                            </small>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    id="btn-save-address-changes"
                                    onClick={handleSaveEdit}
                                    disabled={isSavingProfile}
                                    style={{
                                        flex: 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        padding: '11px',
                                        backgroundColor: '#0284c7',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        fontSize: '0.92rem',
                                        cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <Save size={16} /> {isSavingProfile ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    id="btn-cancel-address-edit"
                                    onClick={handleCancelEdit}
                                    disabled={isSavingProfile}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        padding: '11px 18px',
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        fontSize: '0.92rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={16} /> Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Items */}
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '16px' }}>
                        Selected Vehicle ({singleCar ? 1 : cart.length})
                    </h3>

                    {singleCar ? (
                        <div>
                            {singleCar.images && singleCar.images[0] && (
                                <img 
                                    src={singleCar.images[0]} 
                                    alt={singleCar.name} 
                                    style={{ width: '100%', height: '170px', objectFit: 'cover', borderRadius: '8px', marginBottom: '14px', border: '1px solid #f1f5f9' }} 
                                />
                            )}
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#0f172a' }}>
                                {singleCar.brand} {singleCar.name} {singleCar.variant || ''}
                            </h4>
                            <p style={{ margin: '4px 0', color: '#64748b', fontSize: '0.88rem' }}>
                                Model Year: <strong style={{ color: '#1e293b' }}>{singleCar.modelYear}</strong> • Transmission: <strong style={{ color: '#1e293b' }}>{singleCar.transmission}</strong>
                            </p>
                            <div style={{ marginTop: '14px', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Vehicle Price</span>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
                                    ₹{singleCar.price?.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '280px' }}>
                            <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {cart.map(item => (
                                    <li key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                                        <div>
                                            <strong style={{ color: '#1e293b', fontSize: '0.92rem' }}>
                                                {item.carId?.brand} {item.carId?.name}
                                            </strong>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Qty: 1</div>
                                        </div>
                                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                                            ₹{item.price?.toLocaleString('en-IN')}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '0.84rem' }}>
                        <ShieldCheck size={16} /> 100% Verified Vehicle & Fast Delivery Guarantee
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div style={{ backgroundColor: '#fff', padding: '22px 24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginTop: '24px' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '14px' }}>Order Financial Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#475569' }}>
                    <span>Vehicle Base Price:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#16a34a' }}>
                        <span>Promotional Discount:</span>
                        <span style={{ fontWeight: 600 }}>- ₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#475569' }}>
                    <span>Estimated Taxes & RTO Processing (10%):</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>+ ₹{taxes.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 4px', borderTop: '2px solid #e2e8f0', marginTop: '10px', fontWeight: 800, fontSize: '1.3rem', color: '#0f172a' }}>
                    <span>Total Payable Amount:</span>
                    <span style={{ color: '#0284c7' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
            </div>

            {/* Payment Method Selection */}
            <div style={{ backgroundColor: '#fff', padding: '22px 24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginTop: '24px' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '14px' }}>Select Payment Method</h3>
                <div className="checkout-payment-methods">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: `1.5px solid ${paymentMethod === 'Online' ? '#0284c7' : '#e2e8f0'}`, borderRadius: '8px', flex: 1, cursor: 'pointer', backgroundColor: paymentMethod === 'Online' ? '#f0f9ff' : '#fff', transition: 'all 0.2s' }}>
                        <input type="radio" name="payment" id="payment-online" value="Online" checked={paymentMethod === 'Online'} onChange={(e) => setPaymentMethod(e.target.value)} />
                        <div>
                            <span style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CreditCard size={18} color="#0284c7" /> Online Payment
                            </span>
                            <small style={{ color: '#64748b', fontSize: '0.78rem' }}>UPI, Net Banking, Debit/Credit Card</small>
                        </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: `1.5px solid ${paymentMethod === 'Cash on Delivery' ? '#0284c7' : '#e2e8f0'}`, borderRadius: '8px', flex: 1, cursor: 'pointer', backgroundColor: paymentMethod === 'Cash on Delivery' ? '#f0f9ff' : '#fff', transition: 'all 0.2s' }}>
                        <input type="radio" name="payment" id="payment-cod" value="Cash on Delivery" checked={paymentMethod === 'Cash on Delivery'} onChange={(e) => setPaymentMethod(e.target.value)} />
                        <div>
                            <span style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Truck size={18} color="#16a34a" /> Cash on Delivery (COD)
                            </span>
                            <small style={{ color: '#64748b', fontSize: '0.78rem' }}>Pay at the time of doorstep car delivery</small>
                        </div>
                    </label>
                </div>

                {paymentMethod === 'Online' && (
                    <div style={{ marginTop: '16px', padding: '14px 16px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.9rem' }}>
                        <strong>Online Payment - Demo / Secure Gateway</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Transaction is processed over a 256-bit SSL encrypted connection. In this testing mode, immediate confirmation will be simulated.</p>
                    </div>
                )}

                {paymentMethod === 'Cash on Delivery' && (
                    <div style={{ marginTop: '16px', padding: '14px 16px', backgroundColor: '#f0fdf4', color: '#15803d', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.9rem' }}>
                        <strong>💵 Doorstep Payment (COD)</strong>
                        <p style={{ margin: '4px 0 0', color: '#166534', fontSize: '0.85rem' }}>You may inspect the car and finalize payment via Cash, Bank Transfer, or UPI when our delivery executive arrives at your address.</p>
                    </div>
                )}
            </div>

            {/* Final Place Order Button */}
            <button 
                id="btn-place-order"
                onClick={handlePlaceOrder} 
                disabled={!paymentMethod || isProcessing}
                style={{ 
                    width: '100%', 
                    padding: '16px', 
                    marginTop: '24px',
                    backgroundColor: (!paymentMethod || isProcessing) ? '#94a3b8' : '#0284c7', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontSize: '1.15rem', 
                    fontWeight: 700, 
                    cursor: (!paymentMethod || isProcessing) ? 'not-allowed' : 'pointer',
                    boxShadow: (!paymentMethod || isProcessing) ? 'none' : '0 4px 14px rgba(2, 132, 199, 0.35)',
                    transition: 'all 0.2s'
                }}
            >
                {isProcessing ? 'Processing Order... Please wait.' : 'Place Order'}
            </button>
        </div>
    );
};

export default Checkout;
