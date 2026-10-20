import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ShieldCheck, ThumbsUp, Star, Award, HeartHandshake } from 'lucide-react';
import FeedbackSection from '../components/FeedbackSection';

const Feedback = () => {
    useEffect(() => {
        document.title = 'Customer Feedback & Reviews | AutoMart';
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'description';
            document.head.appendChild(meta);
        }
        meta.content = 'Read honest customer feedback, ratings, and reviews about AutoMart. Share your experience with buying, customer service, and vehicle quality.';
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .feedback-hero-banner {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%);
                    color: white;
                    padding: 56px 20px;
                    text-align: center;
                    border-radius: 20px;
                    margin-bottom: 35px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
                }
                .feedback-trust-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .trust-box {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 22px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }
                .trust-box-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background-color: #e0f2fe;
                    color: #0284c7;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                @media (max-width: 850px) {
                    .feedback-trust-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    .feedback-hero-banner {
                        padding: 36px 16px;
                    }
                }
            `}</style>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Hero Banner */}
                <div className="feedback-hero-banner">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', backgroundColor: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" /> Community Trust
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', margin: '0 0 14px 0', fontWeight: 900, letterSpacing: '-0.5px' }}>
                        AutoMart Customer Feedback & Reviews
                    </h1>
                    <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', opacity: 0.9, maxWidth: '720px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                        Transparent, genuine reviews from real car owners and shoppers. Read experiences or share your own thoughts on AutoMart's platform and customer service.
                    </p>
                </div>

                {/* Trust Markers Row */}
                <div className="feedback-trust-grid">
                    <div className="trust-box">
                        <div className="trust-box-icon">
                            <ShieldCheck size={26} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: '2px' }}>Verified Buyers</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Every review is submitted by authenticated AutoMart users.</div>
                        </div>
                    </div>

                    <div className="trust-box">
                        <div className="trust-box-icon">
                            <ThumbsUp size={26} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: '2px' }}>100% Genuine Experiences</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Unfiltered ratings that help buyers make informed decisions.</div>
                        </div>
                    </div>

                    <div className="trust-box">
                        <div className="trust-box-icon">
                            <HeartHandshake size={26} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: '2px' }}>Continuous Improvement</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Your feedback shapes our car inspection and delivery services.</div>
                        </div>
                    </div>
                </div>

                {/* Main General Feedback Section Component */}
                <FeedbackSection 
                    carId={null} 
                    targetTitle="AutoMart Platform & Service Feedback"
                    targetDescription="Overall customer reviews regarding purchasing experience, customer support, vehicle condition, and delivery."
                    itemName="AutoMart"
                />

                {/* Bottom FAQ / Helpful Info Card */}
                <div style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0', 
                    padding: '28px', 
                    marginTop: '40px', 
                    marginBottom: '60px' 
                }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 16px 0', fontWeight: 800 }}>
                        Frequently Asked Questions about Feedback & Reviews
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>Who can read reviews?</div>
                            <div style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                                Anyone can read reviews! All approved car reviews and platform feedback are publicly accessible to both visitors and registered members.
                            </div>
                        </div>

                        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>How do I review a specific car?</div>
                            <div style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                                To review an individual vehicle, navigate to that vehicle's <Link to="/cars" style={{ color: '#0284c7', fontWeight: 600 }}>Car Details page</Link> and scroll down to the "Feedback & Reviews" section.
                            </div>
                        </div>

                        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>Can I edit my feedback later?</div>
                            <div style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                                Yes! Once logged in, you can update your rating, title, or review comments at any time, or delete your review if needed.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
