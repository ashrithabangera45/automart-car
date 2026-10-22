import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    Mail, Phone, Calendar, Clock, CheckCircle, Trash2, 
    Search, MessageSquare, AlertCircle, RefreshCw, Send,
    ExternalLink, Filter, UserCheck, Inbox
} from 'lucide-react';

const ManageMessages = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/contact`);
            setMessages(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load contact messages:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const showToast = (text, type = 'success') => {
        setNotification({ text, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setActionLoading(true);
        try {
            await axios.put(`${API_URL}/contact/${id}/status`, { status: newStatus });
            setMessages(prev => prev.map(m => m._id === id ? { ...m, status: newStatus } : m));
            if (selectedMessage && selectedMessage._id === id) {
                setSelectedMessage(prev => ({ ...prev, status: newStatus }));
            }
            showToast(`Marked inquiry as ${newStatus}`);
        } catch (err) {
            console.error(err);
            showToast('Failed to update status', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        setActionLoading(true);
        try {
            await axios.delete(`${API_URL}/contact/${id}`);
            setMessages(prev => prev.filter(m => m._id !== id));
            if (selectedMessage && selectedMessage._id === id) {
                setSelectedMessage(null);
            }
            showToast('Message deleted successfully');
        } catch (err) {
            console.error(err);
            showToast('Failed to delete message', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Filter and search
    const filteredMessages = messages.filter(msg => {
        const matchesFilter = filterStatus === 'All' ? true : msg.status === filterStatus;
        const matchesSearch = 
            msg.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.message?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const totalCount = messages.length;
    const newCount = messages.filter(m => m.status === 'New').length;
    const readCount = messages.filter(m => m.status === 'Read').length;
    const repliedCount = messages.filter(m => m.status === 'Replied').length;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'New':
                return { bg: 'rgba(239, 68, 68, 0.25)', text: '#f87171', border: 'rgba(239, 68, 68, 0.45)', label: 'New' };
            case 'Read':
                return { bg: 'rgba(245, 158, 11, 0.25)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.45)', label: 'Read' };
            case 'Replied':
                return { bg: 'rgba(16, 185, 129, 0.25)', text: '#34d399', border: 'rgba(16, 185, 129, 0.45)', label: 'Replied' };
            default:
                return { bg: 'rgba(255, 255, 255, 0.1)', text: '#cbd5e1', border: 'rgba(255, 255, 255, 0.2)', label: status || 'Unknown' };
        }
    };

    return (
        <div style={{ padding: '10px 0', color: '#fff' }}>
            
            {/* TOAST NOTIFICATION */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: notification.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    zIndex: 9999,
                    fontWeight: '600',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    {notification.text}
                </div>
            )}

            {/* TOP HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8em', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
                        <Inbox size={28} color="#38bdf8" />
                        Contact Page Messages
                    </h1>
                    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95em' }}>
                        Manage incoming inquiries submitted from the website's "Send a Message" form.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.85em',
                        color: '#38bdf8',
                        fontWeight: '600',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <Mail size={16} />
                        Notifications sent to: <strong>ashrithabangera45@gmail.com</strong>
                    </div>

                    <button 
                        onClick={fetchMessages} 
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(8px)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '0.9em',
                            transition: 'all 0.2s'
                        }}
                    >
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* STATS OVERVIEW CARDS (GLASSMORPHIC) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '18px 22px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ color: '#cbd5e1', fontSize: '0.85em', fontWeight: '600', textTransform: 'uppercase' }}>Total Inquiries</div>
                    <div style={{ fontSize: '1.8em', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{totalCount}</div>
                </div>

                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '18px 22px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ color: '#f87171', fontSize: '0.85em', fontWeight: '600', textTransform: 'uppercase' }}>New (Unresolved)</div>
                    <div style={{ fontSize: '1.8em', fontWeight: '800', color: '#f87171', marginTop: '6px' }}>{newCount}</div>
                </div>

                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '18px 22px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ color: '#fbbf24', fontSize: '0.85em', fontWeight: '600', textTransform: 'uppercase' }}>Read</div>
                    <div style={{ fontSize: '1.8em', fontWeight: '800', color: '#fbbf24', marginTop: '6px' }}>{readCount}</div>
                </div>

                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '18px 22px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ color: '#34d399', fontSize: '0.85em', fontWeight: '600', textTransform: 'uppercase' }}>Replied</div>
                    <div style={{ fontSize: '1.8em', fontWeight: '800', color: '#34d399', marginTop: '6px' }}>{repliedCount}</div>
                </div>
            </div>

            {/* FILTER & SEARCH BAR (GLASSMORPHIC) */}
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
                {/* STATUS FILTER BUTTONS */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['All', 'New', 'Read', 'Replied'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: filterStatus === status ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85em',
                                backgroundColor: filterStatus === status ? '#0284c7' : 'rgba(255, 255, 255, 0.08)',
                                color: filterStatus === status ? '#fff' : '#cbd5e1',
                                transition: '0.2s'
                            }}
                        >
                            {status} {status === 'New' && newCount > 0 && `(${newCount})`}
                        </button>
                    ))}
                </div>

                {/* SEARCH INPUT */}
                <div style={{ position: 'relative', minWidth: '280px' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search by name, email, subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '9px 14px 9px 38px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            color: '#fff',
                            fontSize: '0.9em',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
            </div>

            {/* MAIN CONTENT: LIST & DETAIL VIEW */}
            <style>{`
                @media (max-width: 900px) {
                    .messages-main-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .messages-detail-panel {
                        position: static !important;
                        top: auto !important;
                    }
                }
            `}</style>
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}>
                    <RefreshCw size={32} color="#38bdf8" className="spin" style={{ margin: '0 auto 15px' }} />
                    <p style={{ color: '#cbd5e1', margin: 0 }}>Loading contact messages...</p>
                </div>
            ) : filteredMessages.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}>
                    <Mail size={42} color="#94a3b8" style={{ margin: '0 auto 15px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>No messages found</h3>
                    <p style={{ color: '#cbd5e1', margin: 0 }}>
                        {searchQuery || filterStatus !== 'All' 
                            ? 'No messages matched your filter criteria.' 
                            : 'Any inquiries submitted on the Contact Us page will appear here.'}
                    </p>
                </div>
            ) : (
                <div className="messages-main-grid" style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1fr 1.2fr' : '1fr', gap: '20px' }}>
                    
                    {/* MESSAGES LIST (GLASSMORPHIC) */}
                    <div style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.08)', 
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        borderRadius: '12px', 
                        border: '1px solid rgba(255, 255, 255, 0.15)', 
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)' 
                    }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', backgroundColor: 'rgba(255, 255, 255, 0.04)', fontWeight: '700', color: '#fff', fontSize: '0.9em' }}>
                            Inquiries List ({filteredMessages.length})
                        </div>
                        
                        <div style={{ maxHeight: '650px', overflowY: 'auto' }}>
                            {filteredMessages.map((msg) => {
                                const badge = getStatusBadge(msg.status);
                                const isSelected = selectedMessage?._id === msg._id;
                                
                                return (
                                    <div
                                        key={msg._id}
                                        onClick={() => {
                                            setSelectedMessage(msg);
                                            if (msg.status === 'New') {
                                                handleUpdateStatus(msg._id, 'Read');
                                            }
                                        }}
                                        style={{
                                            padding: '16px 20px',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                            cursor: 'pointer',
                                            backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                                            borderLeft: isSelected ? '4px solid #38bdf8' : (msg.status === 'New' ? '4px solid #f87171' : '4px solid transparent'),
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <div style={{ fontWeight: msg.status === 'New' ? '700' : '600', color: '#fff', fontSize: '0.95em' }}>
                                                {msg.fullName}
                                            </div>
                                            <span style={{
                                                backgroundColor: badge.bg,
                                                color: badge.text,
                                                border: `1px solid ${badge.border}`,
                                                fontSize: '0.7em',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontWeight: '700'
                                            }}>
                                                {badge.label}
                                            </span>
                                        </div>

                                        <div style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '0.9em', marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {msg.subject}
                                        </div>

                                        <div style={{ color: '#94a3b8', fontSize: '0.85em', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginBottom: '8px' }}>
                                            {msg.message}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8em', color: '#94a3b8' }}>
                                            <span>{msg.email}</span>
                                            <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SELECTED MESSAGE DETAILS PANEL (GLASSMORPHIC) */}
                    {selectedMessage && (
                        <div className="messages-detail-panel" style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.09)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            padding: 'clamp(14px, 3vw, 24px)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            position: 'sticky',
                            top: '20px',
                            height: 'fit-content',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            color: '#fff'
                        }}>
                            {/* DETAIL HEADER */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '16px' }}>
                                <div>
                                    <span style={{
                                        backgroundColor: getStatusBadge(selectedMessage.status).bg,
                                        color: getStatusBadge(selectedMessage.status).text,
                                        border: `1px solid ${getStatusBadge(selectedMessage.status).border}`,
                                        fontSize: '0.75em',
                                        padding: '3px 10px',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        display: 'inline-block',
                                        marginBottom: '8px'
                                    }}>
                                        {selectedMessage.status}
                                    </span>
                                    <h2 style={{ margin: '0 0 6px 0', fontSize: '1.3em', color: '#fff', fontWeight: '800' }}>
                                        {selectedMessage.subject}
                                    </h2>
                                    <div style={{ color: '#cbd5e1', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} />
                                        Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#cbd5e1',
                                        fontSize: '1.4em',
                                        cursor: 'pointer'
                                    }}
                                >
                                    &times;
                                </button>
                            </div>

                            {/* SENDER INFO BOX */}
                            <div style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                padding: '16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                fontSize: '0.9em'
                            }}>
                                <div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8em', textTransform: 'uppercase', fontWeight: '600' }}>Sender Name</div>
                                    <div style={{ fontWeight: '700', color: '#fff', marginTop: '2px' }}>{selectedMessage.fullName}</div>
                                </div>

                                <div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8em', textTransform: 'uppercase', fontWeight: '600' }}>Phone</div>
                                    <a href={`tel:${selectedMessage.phone}`} style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Phone size={14} /> {selectedMessage.phone}
                                    </a>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8em', textTransform: 'uppercase', fontWeight: '600' }}>Email Address</div>
                                    <a href={`mailto:${selectedMessage.email}`} style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Mail size={14} /> {selectedMessage.email}
                                    </a>
                                </div>
                            </div>

                            {/* MESSAGE BODY */}
                            <div>
                                <div style={{ color: '#cbd5e1', fontSize: '0.85em', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>
                                    Message Content
                                </div>
                                <div style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    lineHeight: '1.7',
                                    fontSize: '0.95em',
                                    color: '#f1f5f9',
                                    whiteSpace: 'pre-wrap',
                                    maxHeight: '220px',
                                    overflowY: 'auto'
                                }}>
                                    {selectedMessage.message}
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => handleUpdateStatus(selectedMessage._id, 'Replied')}
                                        style={{
                                            backgroundColor: '#0284c7',
                                            color: '#fff',
                                            textDecoration: 'none',
                                            padding: '9px 16px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            fontSize: '0.85em',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Send size={15} /> Reply via Email
                                    </a>

                                    <a
                                        href={`tel:${selectedMessage.phone}`}
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            color: '#fff',
                                            textDecoration: 'none',
                                            padding: '9px 14px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            fontSize: '0.85em',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            border: '1px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <Phone size={15} /> Call
                                    </a>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {selectedMessage.status !== 'Replied' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedMessage._id, 'Replied')}
                                            disabled={actionLoading}
                                            style={{
                                                backgroundColor: '#10b981',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '9px 14px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '0.85em',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <CheckCircle size={15} /> Mark Replied
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(selectedMessage._id)}
                                        disabled={actionLoading}
                                        style={{
                                            backgroundColor: 'rgba(239, 68, 68, 0.18)',
                                            color: '#f87171',
                                            border: '1px solid rgba(239, 68, 68, 0.35)',
                                            padding: '9px 14px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.85em',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Trash2 size={15} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageMessages;
