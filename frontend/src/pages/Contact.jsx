import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Phone, Mail, Clock, ChevronDown, ChevronUp, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default marker icons in Vite/bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FAQS = [
    {
        question: "How can I search for a car?",
        answer: "You can use the search bar in the navigation menu to find cars by brand or model. Additionally, on the Cars page, you can use advanced filters for price, fuel type, transmission, and more."
    },
    {
        question: "How do I add a car to Wishlist?",
        answer: "When viewing a car, simply click the heart icon (❤️) on the car card or the 'Add to Wishlist' button on the car details page. You must be logged in to save cars to your wishlist."
    },
    {
        question: "How do I add a car to Cart?",
        answer: "On the car details page, click the 'Add to Cart' button. The car will be saved in your shopping cart for easy checkout when you're ready to purchase."
    },
    {
        question: "How can I place an order?",
        answer: "Once you have added a car to your Cart, navigate to the Cart page and click 'Proceed to Checkout'. Follow the steps to enter your delivery details, select a payment method, and confirm your order."
    },
    {
        question: "How can I track my order?",
        answer: "Go to 'My Orders' from the user dropdown menu or navigation. There you can see the live delivery status of your order, view the timeline, and track the vehicle on the interactive map."
    },
    {
        question: "How can I contact a dealer?",
        answer: "You can reach out to our central support team using the contact form on this page, or call our customer support number directly. We will coordinate with the relevant regional dealer for your specific query."
    }
];

const Contact = () => {
    useEffect(() => {
        document.title = 'Contact Us | AutoMart';
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'description';
            document.head.appendChild(meta);
        }
        meta.content = 'Contact AutoMart. Reach out to our support team, find our office locations, or submit your queries directly.';
    }, []);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [openFaq, setOpenFaq] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (submitError) setSubmitError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const trimmedName = formData.fullName.trim();
        const trimmedEmail = formData.email.trim();
        const trimmedPhone = formData.phone.trim();
        const trimmedSubject = formData.subject.trim();
        const trimmedMessage = formData.message.trim();

        // Frontend field validation
        if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedSubject || !trimmedMessage) {
            setSubmitError('Please fill in all required fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setSubmitError('Please enter a valid email address.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess(false);
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        try {
            const response = await axios.post(`${API_URL}/contact`, {
                fullName: trimmedName,
                email: trimmedEmail,
                phone: trimmedPhone,
                subject: trimmedSubject,
                message: trimmedMessage
            });

            if (response.data && response.data.success !== false) {
                setSubmitSuccess(true);
                setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
                setTimeout(() => setSubmitSuccess(false), 6000);
            } else {
                setSubmitError(response.data?.message || 'Failed to send message. Please try again.');
            }
        } catch (err) {
            console.error('Contact submission error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to send message. Please try again later.';
            setSubmitError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Mangalore coordinates for the map
    const mangalorePosition = [12.9141, 74.8560];

    return (
        <div className="contact-page-wrap" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '60px' }}>
            <style>{`
                .contact-hero-title {
                    font-size: clamp(2.2rem, 7vw, 3.5rem);
                    margin: 0 0 15px 0;
                    font-weight: 900;
                    letter-spacing: -1px;
                }
                .contact-main-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                    gap: 32px;
                    align-items: start;
                }
                .contact-form-card {
                    background-color: #fff;
                    border-radius: 20px;
                    padding: 36px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.03);
                    border: 1px solid #e2e8f0;
                }
                .contact-form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                @media (max-width: 860px) {
                    .contact-main-grid {
                        grid-template-columns: 1fr !important;
                        gap: 24px;
                    }
                }
                @media (max-width: 560px) {
                    .contact-form-row {
                        grid-template-columns: 1fr !important;
                        gap: 14px;
                    }
                    .contact-form-card {
                        padding: 24px 16px !important;
                    }
                }
            `}</style>
            {/* HERO SECTION */}
            <div style={{ position: 'relative', height: '320px', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img 
                    src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2000&auto=format&fit=crop" 
                    alt="Contact Us" 
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} 
                />
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', color: 'white' }}>
                    <h1 className="contact-hero-title">
                        Contact Us
                    </h1>
                    <p style={{ fontSize: '1.15em', opacity: 0.9, margin: '0', maxWidth: '600px', lineHeight: '1.6' }}>
                        We're here to help you find the right car and answer your questions.
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '-40px auto 0 auto', padding: '0 16px', position: 'relative', zIndex: 2 }}>
                
                {/* CONTACT INFO CARDS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                    {[
                        { icon: <MapPin size={24} color="#0284c7" />, title: 'Address', detail: 'Mangalore, Karnataka, India' },
                        { icon: <Phone size={24} color="#0284c7" />, title: 'Phone', detail: '+91 98765 43210' },
                        { icon: <Mail size={24} color="#0284c7" />, title: 'Email', detail: 'support@automart.com' },
                        { icon: <Clock size={24} color="#0284c7" />, title: 'Working Hours', detail: 'Monday – Saturday\n9:00 AM – 6:00 PM' }
                    ].map((info, idx) => (
                        <div key={idx} style={{ backgroundColor: '#fff', padding: '24px 16px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <div style={{ width: '56px', height: '56px', backgroundColor: '#f0f9ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                {info.icon}
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.15em' }}>{info.title}</h3>
                            <p style={{ margin: 0, color: '#64748b', whiteSpace: 'pre-line', lineHeight: '1.5', fontSize: '0.92em' }}>{info.detail}</p>
                        </div>
                    ))}
                </div>

                <div className="contact-main-grid">
                    
                    {/* CONTACT FORM */}
                    <div className="contact-form-card">
                        <h2 style={{ fontSize: '1.8em', color: '#0f172a', margin: '0 0 24px 0', fontWeight: '800' }}>Send a Message</h2>
                        
                        {submitSuccess && (
                            <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '15px 18px', borderRadius: '10px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #a7f3d0' }}>
                                <CheckCircle size={22} color="#059669" />
                                <strong style={{ fontSize: '0.98em' }}>Your message has been sent successfully!</strong>
                            </div>
                        )}

                        {submitError && (
                            <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '15px 18px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AlertCircle size={22} color="#dc2626" />
                                <span style={{ fontSize: '0.95em', fontWeight: '500' }}>{submitError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div className="contact-form-row">
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Full Name *</label>
                                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} placeholder="John Doe" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Email *</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} placeholder="john@example.com" />
                                </div>
                            </div>
                            
                            <div className="contact-form-row">
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Phone Number *</label>
                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} placeholder="+91 XXXXX XXXXX" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Subject *</label>
                                    <input type="text" name="subject" required value={formData.subject} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} placeholder="How can we help?" />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9em' }}>Message *</label>
                                <textarea name="message" required rows="5" value={formData.message} onChange={handleChange} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} placeholder="Write your message here..."></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                style={{ 
                                    padding: '16px', 
                                    backgroundColor: '#0ea5e9', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    fontWeight: '700', 
                                    fontSize: '1em', 
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '10px',
                                    transition: 'background-color 0.3s',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}
                            >
                                {isSubmitting ? 'Sending...' : <>Send Message <Send size={18} /></>}
                            </button>
                        </form>
                    </div>

                    {/* LOCATION MAP */}
                    <div className="contact-form-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.8em', color: '#0f172a', margin: '0 0 10px 0', fontWeight: '800' }}>Visit Us</h2>
                        <p style={{ color: '#64748b', margin: '0 0 20px 0' }}>Mangalore, Karnataka, India</p>
                        
                        <div style={{ flex: 1, minHeight: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <MapContainer center={mangalorePosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer 
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                                />
                                <Marker position={mangalorePosition}>
                                    <Popup>
                                        <strong>AutoMart Hub</strong><br />Mangalore, Karnataka
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* FAQ SECTION */}
                <div style={{ marginTop: '80px', maxWidth: '800px', margin: '80px auto 0 auto' }}>
                    <h2 style={{ fontSize: '2.5em', color: '#0f172a', marginBottom: '40px', fontWeight: '800', textAlign: 'center' }}>Frequently Asked Questions</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {FAQS.map((faq, index) => (
                            <div key={index} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                <button 
                                    onClick={() => toggleFaq(index)}
                                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#1e293b', fontWeight: '600', fontSize: '1.1em' }}
                                >
                                    {faq.question}
                                    {openFaq === index ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                                </button>
                                
                                {openFaq === index && (
                                    <div style={{ padding: '0 20px 20px 20px', color: '#64748b', lineHeight: '1.6' }}>
                                        <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '-10px 0 15px 0' }} />
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Contact;
