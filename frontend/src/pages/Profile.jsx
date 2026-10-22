import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Map, Hash, LayoutDashboard, ClipboardList, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user || !user.token) return;
        const fetchProfile = async () => {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            try {
                const res = await axios.get(`${API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setProfile(res.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || err.message || 'An error occurred while fetching profile');
            }
        };
        fetchProfile();
    }, [user]);

    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
    if (!profile) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    const rowStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '20px',
        borderBottom: '1px solid #f1f5f9',
        gap: '20px'
    };

    const iconStyle = {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#eef2ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3b82f6'
    };

    return (
        <div className="profile-page-container" style={{ padding: '24px 16px', maxWidth: '800px', margin: '0 auto' }}>
            <style>{`
                .profile-nav-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    padding-bottom: 6px;
                }
                .profile-nav-tabs a {
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                @media (max-width: 500px) {
                    .profile-page-container {
                        padding: 16px 12px !important;
                    }
                }
            `}</style>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '1.7em', color: '#1e293b' }}>My Account</h1>
            <p style={{ margin: '0 0 20px 0', color: '#64748b' }}>Manage your profile, orders, and saved cars.</p>
            
            <div className="profile-nav-tabs">
                <Link to="/user/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' }}>
                    <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' }}>
                    <User size={18} /> Profile
                </Link>
                <Link to="/myorders" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' }}>
                    <ClipboardList size={18} /> My Orders
                </Link>
                <Link to="/wishlist" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' }}>
                    <Heart size={18} /> Wishlist
                </Link>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
                <div style={rowStyle}>
                    <div style={iconStyle}><User size={20} /></div>
                    <div>
                        <div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '2px' }}>Full Name</div>
                        <div style={{ fontSize: '1.1em', fontWeight: '500', color: '#1e293b' }}>{profile.fullName}</div>
                    </div>
                </div>
                
                <div style={rowStyle}>
                    <div style={iconStyle}><Mail size={20} /></div>
                    <div>
                        <div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '2px' }}>Email Address</div>
                        <div style={{ fontSize: '1.1em', fontWeight: '500', color: '#1e293b' }}>{profile.email}</div>
                    </div>
                </div>

                <div style={rowStyle}>
                    <div style={iconStyle}><Phone size={20} /></div>
                    <div>
                        <div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '2px' }}>Mobile Number</div>
                        <div style={{ fontSize: '1.1em', fontWeight: '500', color: '#1e293b' }}>{profile.phone}</div>
                    </div>
                </div>

                <div style={rowStyle}>
                    <div style={iconStyle}><MapPin size={20} /></div>
                    <div>
                        <div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '2px' }}>Address</div>
                        <div style={{ fontSize: '1.1em', fontWeight: '500', color: '#1e293b' }}>{profile.address}</div>
                    </div>
                </div>

                <div style={rowStyle}>
                    <div style={iconStyle}><Map size={20} /></div>
                    <div>
                        <div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '2px' }}>State</div>
                        <div style={{ fontSize: '1.1em', fontWeight: '500', color: '#1e293b' }}>{profile.state}</div>
                    </div>
                </div>

                <div style={{ ...rowStyle, borderBottom: 'none' }}>
                    <div style={iconStyle}><Hash size={20} /></div>
                    <div>
                        <div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '2px' }}>Pincode</div>
                        <div style={{ fontSize: '1.1em', fontWeight: '500', color: '#1e293b' }}>{profile.pincode}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
