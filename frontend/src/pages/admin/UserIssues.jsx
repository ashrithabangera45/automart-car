import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { MessageSquare, Wrench, User, Mail, Phone, Calendar, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserIssues = () => {
    const { user } = useContext(AuthContext);
    const [issues, setIssues] = useState({ tickets: [], serviceRequests: [], contactMessages: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tickets'); // 'tickets', 'service', or 'contact'

    const fetchIssues = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/issues', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setIssues(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [user]);

    const handleUpdateStatus = async (type, id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/issues/${type}/${id}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchIssues(); // Refresh the list
        } catch (err) {
            console.error(err);
            alert(`Failed: ${err.response?.data?.message || err.message}`);
        }
    };

    if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

    const tabStyle = (active) => ({
        padding: '10px 20px',
        backgroundColor: active ? '#007bff' : 'rgba(255,255,255,0.1)',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginRight: '10px'
    });

    const cardStyle = {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare /> User Issues & Support
            </h1>
            
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '6px', marginBottom: '20px' }}>
                <button style={tabStyle(activeTab === 'tickets')} onClick={() => setActiveTab('tickets')}>
                    Support Tickets ({issues.tickets.length})
                </button>
                <button style={tabStyle(activeTab === 'service')} onClick={() => setActiveTab('service')}>
                    Service Requests ({issues.serviceRequests.length})
                </button>
                <button style={tabStyle(activeTab === 'contact')} onClick={() => setActiveTab('contact')}>
                    Contact Messages ({issues.contactMessages?.length || 0})
                </button>
            </div>

            <div>
                {activeTab === 'tickets' && (
                    <div>
                        {issues.tickets.length === 0 ? <p>No support tickets.</p> : issues.tickets.map(t => (
                            <div key={t._id} style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t.subject} <span style={{ fontSize: '0.7em', padding: '3px 8px', backgroundColor: '#e9ecef', color: '#1e293b', borderRadius: '4px', verticalAlign: 'middle' }}>{t.category}</span></h3>
                                    <strong style={{ color: t.status === 'Open' ? '#ef4444' : '#10b981' }}>{t.status}</strong>
                                </div>
                                <div style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '6px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    {t.description}
                                </div>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px', fontSize: '0.9em' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16}/> {t.userId?.fullName || 'Unknown User'}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={16}/> {t.userId?.email || 'N/A'}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={16}/> {t.userId?.phone || 'N/A'}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={{ fontSize: '0.85em', color: '#cbd5e1' }}>Submitted: {new Date(t.createdAt).toLocaleString()}</div>
                                    {t.status !== 'Resolved' && t.status !== 'Closed' && (
                                        <button 
                                            onClick={() => handleUpdateStatus('ticket', t._id, 'Resolved')}
                                            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Mark as Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'service' && (
                    <div>
                        {issues.serviceRequests.length === 0 ? <p>No service requests.</p> : issues.serviceRequests.map(s => (
                            <div key={s._id} style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                                        <Wrench size={20} color="#007bff"/> {s.serviceType}
                                    </h3>
                                    <strong style={{ color: '#007bff' }}>{s.status}</strong>
                                </div>
                                <div style={{ fontSize: '1.05em', fontWeight: '500' }}>
                                    Car: {s.carId?.name || s.carName || 'Vehicle'} {s.carId?.brand || ''}
                                </div>
                                <div style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '6px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    {s.description}
                                </div>
                                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', color: '#60a5fa', fontWeight: '500', fontSize: '0.95rem' }}>
                                    <Calendar size={18}/> Preferred: {new Date(s.preferredDate).toLocaleDateString()} at {s.preferredTime}
                                </div>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px', fontSize: '0.9em' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16}/> {s.userId?.fullName || 'Unknown User'}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={16}/> {s.userId?.email || 'N/A'}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={16}/> {s.userId?.phone || 'N/A'}</div>
                                </div>
                                {s.status === 'Requested' && (
                                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => handleUpdateStatus('service', s._id, 'Accepted')}
                                            style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Accept Request
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                            <span style={{ fontSize: '0.9em', color: '#cbd5e1' }}>
                                Messages sent from the Contact Us form (notifying <strong>ashrithabangera45@gmail.com</strong>)
                            </span>
                            <Link to="/admin/messages" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.9em', fontWeight: 'bold' }}>
                                Open Dedicated Inquiries Hub &rarr;
                            </Link>
                        </div>
                        {(!issues.contactMessages || issues.contactMessages.length === 0) ? (
                            <p>No contact messages yet.</p>
                        ) : (
                            issues.contactMessages.map(c => (
                                <div key={c._id} style={cardStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{c.subject}</h3>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.8em',
                                            fontWeight: 'bold',
                                            backgroundColor: c.status === 'New' ? '#ef4444' : (c.status === 'Read' ? '#f59e0b' : '#10b981'),
                                            color: '#fff'
                                        }}>
                                            {c.status || 'New'}
                                        </span>
                                    </div>
                                    <div style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '6px', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '0.95rem' }}>
                                        {c.message}
                                    </div>
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px', fontSize: '0.9em' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16}/> {c.fullName}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Mail size={16}/> <a href={`mailto:${c.email}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{c.email}</a>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={16}/> <a href={`tel:${c.phone}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{c.phone}</a>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
                                        <div style={{ fontSize: '0.85em', color: '#cbd5e1' }}>Received: {new Date(c.createdAt).toLocaleString()}</div>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <a
                                                href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`}
                                                style={{ backgroundColor: '#0284c7', color: 'white', textDecoration: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                onClick={() => handleUpdateStatus('contact', c._id, 'Replied')}
                                            >
                                                <Send size={14} /> Reply
                                            </a>
                                            {c.status !== 'Replied' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus('contact', c._id, 'Replied')}
                                                    style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                >
                                                    <CheckCircle size={14} /> Mark Replied
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserIssues;
