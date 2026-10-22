import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminRegister = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        try {
            await axios.post(`${API_URL}/admin/register`, { email, password });
            navigate('/admin/login');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        }
    };

    return (
        <div style={{ maxWidth: '420px', width: '90%', margin: '40px auto', padding: 'clamp(16px, 4vw, 24px)', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', borderRadius: '12px', boxSizing: 'border-box', color: 'white' }}>
            <h2 style={{ color: '#ef4444', marginTop: 0 }}>Admin Register</h2>
            {error && <div style={{ color: '#f87171', marginBottom: '12px', fontSize: '0.9rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Register Admin</button>
            </form>
        </div>
    );
};

export default AdminRegister;
