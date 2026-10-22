import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Wrench, PhoneCall, HeadphonesIcon, Package, ShieldCheck, HelpCircle, 
    ChevronLeft, Send, PlusCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ServiceSupport = () => {
    const { user } = useContext(AuthContext);
    const [activeSection, setActiveSection] = useState(null);

    const sections = [
        { id: 'service', title: 'Car Service', icon: <Wrench size={32} color="#3b82f6"/>, desc: 'Request service or repairs' },
        { id: 'contact', title: 'Contact Dealer', icon: <PhoneCall size={32} color="#10b981"/>, desc: 'Call or message us directly' },
        { id: 'support', title: 'Customer Support', icon: <HeadphonesIcon size={32} color="#8b5cf6"/>, desc: 'Open a support ticket' },
        { id: 'warranty', title: 'Warranty & Insurance', icon: <ShieldCheck size={32} color="#ef4444"/>, desc: 'View warranty plans' }
    ];

    if (!user) return <div>Loading...</div>;

    return (
        <div className="servicesupport-page-container" style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto' }}>
            <style>{`
                .servicesupport-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                .servicesupport-two-col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                @media (max-width: 900px) {
                    .servicesupport-cards-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .servicesupport-two-col {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 500px) {
                    .servicesupport-cards-grid {
                        grid-template-columns: 1fr;
                    }
                    .servicesupport-page-container {
                        padding: 16px 12px !important;
                    }
                }
            `}</style>
            {activeSection ? (
                <div>
                    <button onClick={() => setActiveSection(null)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: '20px', fontSize: '1em', padding: 0 }}>
                        <ChevronLeft size={20} /> Back to Support Menu
                    </button>
                    {activeSection === 'service' && <CarService />}
                    {activeSection === 'contact' && <ContactDealer />}
                    {activeSection === 'support' && <CustomerSupport />}
                    {activeSection === 'warranty' && <WarrantyInsurance />}
                </div>
            ) : (
                <>
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ margin: '0 0 5px 0', fontSize: '1.8em', color: '#1e293b' }}>Service & Support</h1>
                        <p style={{ margin: 0, color: '#64748b' }}>How can we help you today?</p>
                    </div>
                    <div className="servicesupport-cards-grid">
                        {sections.map(s => (
                            <div key={s.id} onClick={() => setActiveSection(s.id)} style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: '0.2s', transform: 'translateY(0)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ width: '65px', height: '65px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                                    {s.icon}
                                </div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2em', color: '#1e293b' }}>{s.title}</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// --- SECTION COMPONENTS ---

const CarService = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [requests, setRequests] = useState([]);
    const [formData, setFormData] = useState({ carId: '', carName: '', serviceType: 'General Service', preferredDate: '', preferredTime: '', description: '' });
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        axios.get(`${API_URL}/orders/myorders`, { headers: { Authorization: `Bearer ${user.token}` }}).then(res => setOrders(res.data));
        fetchRequests();
    }, []);

    const fetchRequests = () => {
        axios.get(`${API_URL}/support/service-requests`, { headers: { Authorization: `Bearer ${user.token}` }}).then(res => setRequests(res.data));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/support/service-requests`, formData, { headers: { Authorization: `Bearer ${user.token}` }});
            setStatusMsg({ type: 'success', text: 'Service request submitted successfully!' });
            setFormData({ carId: '', carName: '', serviceType: 'General Service', preferredDate: '', preferredTime: '', description: '' });
            fetchRequests();
        } catch (err) {
            setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit request.' });
        }
    };

    return (
        <div>
            <h2>Request Car Service</h2>
            <div className="servicesupport-two-col">
                <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    {statusMsg.text && (
                        <div style={{ 
                            padding: '10px 14px', 
                            borderRadius: '8px', 
                            marginBottom: '15px', 
                            backgroundColor: statusMsg.type === 'error' ? '#fee2e2' : '#dcfce7', 
                            color: statusMsg.type === 'error' ? '#b91c1c' : '#15803d',
                            fontWeight: '600'
                        }}>
                            {statusMsg.text}
                        </div>
                    )}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Select Car</label>
                        <select 
                            required 
                            style={inputStyle} 
                            value={formData.carId} 
                            onChange={e => {
                                const selectedId = e.target.value;
                                const selectedOrder = orders.find(o => {
                                    const cId = (typeof o.carId === 'object' && o.carId?._id) ? o.carId._id : (o.carId || o._id);
                                    return String(cId) === String(selectedId) || String(o._id) === String(selectedId);
                                });
                                const carTitle = (typeof selectedOrder?.carId === 'object' && selectedOrder?.carId?.name) 
                                    ? selectedOrder.carId.name 
                                    : (selectedOrder?.carName || 'Vehicle');
                                setFormData({
                                    ...formData, 
                                    carId: selectedId,
                                    carName: carTitle
                                });
                            }}
                        >
                            <option value="">-- Choose Car --</option>
                            {orders.map(o => {
                                const id = (typeof o.carId === 'object' && o.carId?._id) ? o.carId._id : (o.carId || o._id);
                                const carTitle = (typeof o.carId === 'object' && o.carId?.name) ? o.carId.name : (o.carName || 'Vehicle');
                                const orderDate = o.bookingDate ? new Date(o.bookingDate).toLocaleDateString() : 'N/A';
                                return (
                                    <option key={o._id || id} value={id}>
                                        {carTitle} (Ordered: {orderDate})
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Service Type</label>
                        <select required style={inputStyle} value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}>
                            <option>General Service</option>
                            <option>Oil Change</option>
                            <option>Brake Service</option>
                            <option>AC Service</option>
                            <option>Battery Check</option>
                            <option>Tyre Service</option>
                            <option>Engine Check</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Preferred Date</label>
                            <input type="date" required style={inputStyle} value={formData.preferredDate} onChange={e => setFormData({...formData, preferredDate: e.target.value})} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Preferred Time</label>
                            <input type="time" required style={inputStyle} value={formData.preferredTime} onChange={e => setFormData({...formData, preferredTime: e.target.value})} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Description of Problem</label>
                        <textarea required rows="4" style={inputStyle} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                    <button type="submit" style={btnStyle}>Submit Service Request</button>
                </form>

                <div>
                    <h3>Previous Requests</h3>
                    {requests.length === 0 ? <p>No service requests found.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {requests.map(req => (
                                <div key={req._id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <strong>{req.serviceType}</strong>
                                        <span style={{ fontSize: '0.85em', padding: '3px 8px', borderRadius: '4px', backgroundColor: req.status === 'Requested' ? '#fef3c7' : '#dcfce3', color: req.status === 'Requested' ? '#d97706' : '#166534' }}>{req.status}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9em', color: '#64748b' }}>Date: {new Date(req.preferredDate).toLocaleDateString()} at {req.preferredTime}</div>
                                    <div style={{ fontSize: '0.9em', color: '#64748b' }}>Car: {req.carId?.name || req.carName || 'Vehicle'}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ContactDealer = () => {
    return (
        <div>
            <h2>Contact Dealer</h2>
            <div style={{ backgroundColor: '#fff', padding: '24px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="servicesupport-two-col">
                    <div>
                        <h3>DriveCart Official Showroom</h3>
                        <p><strong>Address:</strong> 123 Car Avenue, Auto District, Bangalore, 560001</p>
                        <p><strong>Phone:</strong> +91 98765 43210</p>
                        <p><strong>Email:</strong> support@drivecart.com</p>
                        <p><strong>Working Hours:</strong> Mon-Sat, 9:00 AM - 7:00 PM</p>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
                            <button style={{ ...btnStyle, flex: 1, backgroundColor: '#10b981' }}>Call Dealer</button>
                            <button style={{ ...btnStyle, flex: 1 }}>Email Dealer</button>
                        </div>
                    </div>
                    <div>
                        <h3>Send a Message</h3>
                        <input type="text" placeholder="Subject" style={{ ...inputStyle, marginBottom: '15px' }} />
                        <textarea rows="4" placeholder="Your message here..." style={{ ...inputStyle, marginBottom: '15px' }}></textarea>
                        <button style={btnStyle}><Send size={16} style={{ marginRight: '5px' }}/> Send Message</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomerSupport = () => {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({ category: 'Order Problem', subject: '', description: '', orderId: '' });

    useEffect(() => {
        axios.get(`${API_URL}/orders/myorders`, { headers: { Authorization: `Bearer ${user.token}` }}).then(res => setOrders(res.data));
        fetchTickets();
    }, []);

    const fetchTickets = () => {
        axios.get(`${API_URL}/support/tickets`, { headers: { Authorization: `Bearer ${user.token}` }}).then(res => setTickets(res.data));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/support/tickets`, formData, { headers: { Authorization: `Bearer ${user.token}` }});
            setFormData({ category: 'Order Problem', subject: '', description: '', orderId: '' });
            fetchTickets();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Customer Support Tickets</h2>
            <div className="servicesupport-two-col">
                <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
                        <select style={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option>Order Problem</option>
                            <option>Payment Problem</option>
                            <option>Delivery Problem</option>
                            <option>Car Information</option>
                            <option>Service Problem</option>
                            <option>Account Problem</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Related Order (Optional)</label>
                        <select style={inputStyle} value={formData.orderId} onChange={e => setFormData({...formData, orderId: e.target.value})}>
                            <option value="">-- No Order Selected --</option>
                            {orders.map(o => (
                                <option key={o.orderId} value={o.orderId}>Order #{o.orderId}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Subject</label>
                        <input type="text" required style={inputStyle} value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                        <textarea required rows="4" style={inputStyle} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                    <button type="submit" style={{ ...btnStyle, backgroundColor: '#8b5cf6' }}>Open Support Ticket</button>
                </form>

                <div>
                    <h3>My Tickets</h3>
                    {tickets.length === 0 ? <p>No support tickets opened.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {tickets.map(t => (
                                <div key={t._id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <strong style={{ color: '#1e293b' }}>{t.subject}</strong>
                                        <span style={{ fontSize: '0.8em', fontWeight: 'bold', color: t.status === 'Open' ? '#ef4444' : '#10b981' }}>{t.status}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '5px' }}>Category: {t.category}</div>
                                    <div style={{ fontSize: '0.9em' }}>{t.description}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DeliverySupport = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/orders/myorders`, { headers: { Authorization: `Bearer ${user.token}` }}).then(res => setOrders(res.data));
    }, []);

    return (
        <div>
            <h2>Order & Delivery Support</h2>
            {orders.length === 0 ? <p>You have no active orders.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map(o => (
                        <div key={o._id} style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0' }}>Order #{o.orderId} - {o.carDetails?.name}</h3>
                                <p style={{ margin: '0 0 5px 0', color: '#64748b' }}>Expected Delivery: {new Date(o.expectedDelivery).toLocaleDateString()}</p>
                                <p style={{ margin: '0 0 15px 0', color: '#64748b' }}>Status: <strong>{o.status}</strong></p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button style={{ ...btnStyle, backgroundColor: '#f59e0b', padding: '8px 15px', fontSize: '0.9em' }}>Track Order</button>
                                    <button style={{ ...btnStyle, backgroundColor: '#ef4444', padding: '8px 15px', fontSize: '0.9em' }}>Report Issue</button>
                                </div>
                            </div>
                            {o.carDetails?.image && (
                                <img src={o.carDetails.image} alt={o.carDetails.name} style={{ width: '150px', borderRadius: '8px' }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const WarrantyInsurance = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/support/warranty-insurance`, { headers: { Authorization: `Bearer ${user.token}` }}).then(res => setData(res.data));
    }, []);

    return (
        <div>
            <h2>Warranty & Insurance</h2>
            {data.length === 0 ? <p>No warranty information found.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {data.map(item => (
                        <div key={item.orderId} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '15px 25px', borderBottom: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: 0 }}>{item.carName} (Order #{item.orderId})</h3>
                            </div>
                            <div className="servicesupport-two-col" style={{ padding: '20px' }}>
                                <div>
                                    <h4 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={18}/> Warranty Details</h4>
                                    <p><strong>Period:</strong> {item.warranty.period}</p>
                                    <p><strong>Valid Until:</strong> {new Date(item.warranty.expiryDate).toLocaleDateString()}</p>
                                    <p><strong>Covered:</strong> {item.warranty.coveredItems.join(', ')}</p>
                                    <p><strong>Not Covered:</strong> {item.warranty.notCoveredItems.join(', ')}</p>
                                </div>
                                <div>
                                    <h4 style={{ color: '#3b82f6' }}>Insurance Details</h4>
                                    <p><strong>Provider:</strong> {item.insurance.provider}</p>
                                    <p><strong>Policy No:</strong> {item.insurance.policyNumber}</p>
                                    <p><strong>Valid Until:</strong> {new Date(item.insurance.expiryDate).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{item.insurance.status}</span></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const FAQSection = () => {
    const faqs = [
        { q: 'How can I track my car order?', a: 'You can track your order in the "Order & Delivery Support" section or via the "My Orders" page. Both provide real-time updates.' },
        { q: 'Can I cancel my car order?', a: 'Orders can be cancelled before the "Dispatched" stage. Contact support via a ticket to request a cancellation.' },
        { q: 'How long does car delivery take?', a: 'Delivery usually takes 7-14 business days depending on the vehicle availability and your location.' },
        { q: 'How can I request car service?', a: 'Navigate to the "Car Service" section on this page, select your vehicle, and pick a preferred date and time.' },
        { q: 'How can I check my warranty?', a: 'All warranty and insurance information is automatically tied to your account under the "Warranty & Insurance" section.' }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div style={{ maxWidth: '800px' }}>
            <h2>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {faqs.map((faq, idx) => (
                    <div key={idx} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <div 
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)} 
                            style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: openIndex === idx ? '#f8fafc' : '#fff' }}
                        >
                            <h4 style={{ margin: 0, color: '#1e293b' }}>{faq.q}</h4>
                            <PlusCircle size={18} color="#64748b" style={{ transform: openIndex === idx ? 'rotate(45deg)' : 'none', transition: '0.2s' }} />
                        </div>
                        {openIndex === idx && (
                            <div style={{ padding: '0 20px 20px 20px', color: '#64748b', lineHeight: '1.6' }}>
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- COMMON STYLES ---
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1em', boxSizing: 'border-box' };
const btnStyle = { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '1em', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default ServiceSupport;
