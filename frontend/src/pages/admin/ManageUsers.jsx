import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/users`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setUsers(res.data);
            } catch (error) {
                console.error(error);
                setError(error.response ? error.response.data.message || error.message : error.message);
            }
        };
        fetchUsers();
    }, [user]);

    const tableStyle = { width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.95em', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', color: 'white' };
    const thStyle = { backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px 16px', color: 'white', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.2)' };
    const tdStyle = { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' };

    return (
        <div style={{ padding: 'clamp(10px, 2.5vw, 20px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={26} color="#8b5cf6" />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', color: 'white' }}>Manage Users</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>View all registered users and their details</p>
                </div>
            </div>

            {error && <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>Error: {error}</div>}

            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Phone</th>
                            <th style={thStyle}>Address</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>Cars Bought</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id}>
                                <td style={{ ...tdStyle, fontWeight: '500', color: 'white' }}>{u.fullName || 'N/A'}</td>
                                <td style={tdStyle}>{u.email}</td>
                                <td style={tdStyle}>{u.phone || 'N/A'}</td>
                                <td style={tdStyle}>{u.address ? `${u.address}, ${u.state} - ${u.pincode}` : 'N/A'}</td>
                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                    <span style={{ backgroundColor: u.carsBought > 0 ? '#dcfce3' : '#f1f5f9', color: u.carsBought > 0 ? '#166534' : '#64748b', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
                                        {u.carsBought}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
