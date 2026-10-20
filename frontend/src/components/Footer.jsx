import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#0f172a', color: '#e2e8f0', fontFamily: "'Inter', sans-serif", paddingTop: '50px', paddingBottom: '30px', marginTop: 'auto', width: '100%' }}>
            <div className="footer-container">
                <style>{`
                    .footer-container {
                        max-width: 1400px;
                        margin: 0 auto;
                        padding: 0 40px;
                        box-sizing: border-box;
                    }
                    .footer-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 40px;
                        margin-bottom: 50px;
                    }
                    .footer-heading {
                        color: #fff;
                        font-size: 1.2em;
                        font-weight: 700;
                        margin-bottom: 20px;
                    }
                    .footer-link {
                        color: #94a3b8;
                        text-decoration: none;
                        display: block;
                        margin-bottom: 12px;
                        transition: color 0.2s;
                    }
                    .footer-link:hover {
                        color: #38bdf8;
                    }
                    .social-icon {
                        color: #94a3b8;
                        transition: color 0.2s, transform 0.2s;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background-color: rgba(255, 255, 255, 0.05);
                    }
                    .social-icon:hover {
                        color: #fff;
                        background-color: #007bff;
                        transform: translateY(-3px);
                    }
                    @media (max-width: 992px) {
                        .footer-container {
                            padding: 0 24px;
                        }
                        .footer-grid {
                            grid-template-columns: repeat(2, 1fr);
                            gap: 30px;
                        }
                    }
                    @media (max-width: 576px) {
                        .footer-container {
                            padding: 0 16px;
                        }
                        .footer-grid {
                            grid-template-columns: 1fr;
                            gap: 25px;
                        }
                    }
                `}</style>
                
                <div className="footer-grid">
                    {/* 1. AutoMart Brand */}
                    <div>
                        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '18px' }}>
                            <img 
                                src="/logo.png" 
                                alt="AutoMart" 
                                style={{ 
                                    height: '52px', 
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                    backgroundColor: '#000',
                                    padding: '3px 8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    display: 'block'
                                }} 
                            />
                        </Link>
                        <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '25px', fontSize: '0.95em' }}>
                            Find your perfect car with trusted listings, transparent pricing and a simple buying experience.
                        </p>
                    </div>

                    {/* 2. Quick Links */}
                    <div>
                        <h4 className="footer-heading">Quick Links</h4>
                        <Link to="/" className="footer-link">Home</Link>
                        <Link to="/cars" className="footer-link">Cars</Link>
                        <Link to="/about" className="footer-link">About Us</Link>
                        <Link to="/contact" className="footer-link">Contact Us</Link>
                        <Link to="/feedback" className="footer-link">Reviews</Link>
                        <Link to="/cars" className="footer-link">Search Cars</Link>
                    </div>

                    {/* 3. Customer Support */}
                    <div>
                        <h4 className="footer-heading">Customer Support</h4>
                        <Link to="/service" className="footer-link">Car Service</Link>
                        <Link to="/contact" className="footer-link">Contact Dealer</Link>
                        <Link to="/service" className="footer-link">Customer Support</Link>
                    </div>

                    {/* 4. Contact Us */}
                    <div>
                        <h4 className="footer-heading">Contact Us</h4>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', color: '#94a3b8', alignItems: 'flex-start' }}>
                            <MapPin size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#38bdf8' }} />
                            <span>Mangalore, Karnataka, India</span>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', color: '#94a3b8', alignItems: 'center' }}>
                            <Phone size={20} style={{ flexShrink: 0, color: '#38bdf8' }} />
                            <span>+91 98765 43210</span>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', color: '#94a3b8', alignItems: 'center' }}>
                            <Mail size={20} style={{ flexShrink: 0, color: '#38bdf8' }} />
                            <span>support@automart.com</span>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', color: '#94a3b8', alignItems: 'flex-start' }}>
                            <Clock size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#38bdf8' }} />
                            <span>
                                Monday – Saturday<br/>
                                9:00 AM – 6:00 PM
                            </span>
                        </div>
                    </div>
                </div>

                {/* Follow Us Section */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '25px', paddingBottom: '25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#fff', fontSize: '0.95em', fontWeight: '600' }}>Follow Us:</span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <a href="#" className="social-icon" aria-label="Instagram">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                            <a href="#" className="social-icon" aria-label="Facebook">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            </a>
                            <a href="#" className="social-icon" aria-label="YouTube">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 19.5 12 19.5 12 19.5s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                            </a>
                            <a href="#" className="social-icon" aria-label="LinkedIn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', color: '#64748b', fontSize: '0.9em' }}>
                    <div>
                        © 2026 AutoMart. All Rights Reserved.
                    </div>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <Link to="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color='#38bdf8'} onMouseOut={(e) => e.target.style.color='#64748b'}>Privacy Policy</Link>
                        <Link to="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color='#38bdf8'} onMouseOut={(e) => e.target.style.color='#64748b'}>Terms & Conditions</Link>
                        <Link to="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color='#38bdf8'} onMouseOut={(e) => e.target.style.color='#64748b'}>Refund Policy</Link>
                        <Link to="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color='#38bdf8'} onMouseOut={(e) => e.target.style.color='#64748b'}>Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
