import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', address: '', state: '', pincode: '', password: '', confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone Number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone Number must be 10 digits';
        }
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = 'Pincode must be 6 digits';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        setSuccessMessage(null);
        
        if (!validate()) return;
        
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            
            setSuccessMessage("Account created successfully. Please login.");
            setTimeout(() => {
                navigate('/user/login');
            }, 2000);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="register-card" style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', border: '1px solid #e2e8f0', borderRadius: '16px', backgroundColor: '#fff', color: '#333', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <style>{`
                .register-row {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 15px;
                }
                @media (max-width: 500px) {
                    .register-card {
                        margin: 20px 12px !important;
                        padding: 20px 14px !important;
                    }
                    .register-row {
                        flex-direction: column !important;
                        gap: 12px !important;
                    }
                }
            `}</style>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '15px' }}>
                <img 
                    src="/logo.png" 
                    alt="AutoMart" 
                    style={{ 
                        height: '52px', 
                        objectFit: 'contain', 
                        borderRadius: '8px', 
                        backgroundColor: '#000', 
                        padding: '3px 10px' 
                    }} 
                />
            </Link>
            <h2 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '1.4rem', color: '#1e293b' }}>Create an Account</h2>
            {apiError && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'left' }}>{apiError}</div>}
            {successMessage && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'left' }}>{successMessage}</div>}
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#64748b' }}>Full Name *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    {errors.fullName && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.fullName}</span>}
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#64748b' }}>Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    {errors.email && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.email}</span>}
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#64748b' }}>Phone Number *</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    {errors.phone && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.phone}</span>}
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#64748b' }}>Delivery Address *</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    {errors.address && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.address}</span>}
                </div>
                
                <div className="register-row">
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#64748b' }}>State *</label>
                        <select name="state" value={formData.state} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}>
                            <option value="">Select State ▼</option>
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                            <option value="Assam">Assam</option>
                            <option value="Bihar">Bihar</option>
                            <option value="Chhattisgarh">Chhattisgarh</option>
                            <option value="Goa">Goa</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Haryana">Haryana</option>
                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                            <option value="Jharkhand">Jharkhand</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Manipur">Manipur</option>
                            <option value="Meghalaya">Meghalaya</option>
                            <option value="Mizoram">Mizoram</option>
                            <option value="Nagaland">Nagaland</option>
                            <option value="Odisha">Odisha</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Rajasthan">Rajasthan</option>
                            <option value="Sikkim">Sikkim</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Tripura">Tripura</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Uttarakhand">Uttarakhand</option>
                            <option value="West Bengal">West Bengal</option>
                            <option value="Delhi">Delhi</option>
                        </select>
                        {errors.state && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.state}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#64748b' }}>Pincode *</label>
                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                        {errors.pincode && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.pincode}</span>}
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#64748b' }}>Password *</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    {errors.password && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.password}</span>}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#64748b' }}>Confirm Password *</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    {errors.confirmPassword && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.confirmPassword}</span>}
                </div>

                <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.05em', fontWeight: 'bold', cursor: 'pointer' }}>Create Account</button>
                
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <span style={{ color: '#64748b' }}>Already have an account? </span>
                    <Link to="/user/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
                </div>
            </form>
        </div>
    );
};

export default Register;
