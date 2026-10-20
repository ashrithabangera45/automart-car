import { Link } from 'react-router-dom';
import { Search, List, Heart, ShoppingCart, Info, CheckCircle, Headphones, Lock } from 'lucide-react';
import { useEffect } from 'react';

const About = () => {
    useEffect(() => {
        document.title = 'About Us | AutoMart';
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'description';
            document.head.appendChild(meta);
        }
        meta.content = 'Learn more about AutoMart, your trusted destination for finding the right car. We make buying a car simple, transparent, and convenient.';
    }, []);
    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .about-hero-title {
                    font-size: clamp(2.2rem, 7vw, 3.5rem);
                    margin: 0 0 15px 0;
                    font-weight: 900;
                    letter-spacing: -1px;
                }
                .about-main-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 16px;
                }
                .about-box-card {
                    margin-bottom: 60px;
                    background-color: #fff;
                    border-radius: 20px;
                    padding: 40px 24px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.03);
                    border: 1px solid #e2e8f0;
                }
                .about-cta-card {
                    text-align: center;
                    background-color: #0f172a;
                    padding: 48px 20px;
                    border-radius: 20px;
                    color: white;
                }
                @media (max-width: 600px) {
                    .about-box-card {
                        padding: 24px 16px !important;
                    }
                    .about-cta-card {
                        padding: 32px 16px !important;
                    }
                }
            `}</style>
            {/* HERO SECTION */}
            <div style={{ position: 'relative', height: '360px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img 
                    src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2000&auto=format&fit=crop" 
                    alt="About AutoMart" 
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} 
                />
                
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px', padding: '0 20px', color: 'white' }}>
                    <h1 className="about-hero-title">
                        About AutoMart
                    </h1>
                    <p style={{ fontSize: '1.2em', opacity: 0.9, lineHeight: '1.6', margin: '0' }}>
                        Your trusted destination for finding the right car.
                    </p>
                </div>
            </div>

            <div className="about-main-content">
                
                {/* WHO WE ARE */}
                <div style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '800px', margin: '0 auto 60px auto' }}>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', color: '#0f172a', marginBottom: '16px', fontWeight: '800' }}>Who We Are</h2>
                    <p style={{ fontSize: '1.05em', color: '#475569', lineHeight: '1.8' }}>
                        AutoMart is a modern car e-commerce platform designed to make buying a car simple, convenient and transparent. Users can explore cars, compare important details, save their favourite cars to Wishlist and add cars to their Cart before placing an order.
                    </p>
                </div>

                {/* WHAT WE OFFER */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '2.5em', color: '#0f172a', marginBottom: '40px', fontWeight: '800', textAlign: 'center' }}>What We Offer</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                        {[
                            { title: 'Wide Selection', icon: <List size={30} color="#0284c7" />, desc: 'Explore cars from different brands, models, fuel types and price ranges.' },
                            { title: 'Easy Search', icon: <Search size={30} color="#0284c7" />, desc: 'Find the right car using filters such as brand, model, price, fuel, transmission, body type and more.' },
                            { title: 'Wishlist', icon: <Heart size={30} color="#ef4444" />, desc: 'Save cars you are interested in and view them later.' },
                            { title: 'Easy Buying', icon: <ShoppingCart size={30} color="#10b981" />, desc: 'Add cars to your Cart and continue through the checkout and order process.' }
                        ].map((item, idx) => (
                            <div key={idx} style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', transition: 'transform 0.3s', border: '1px solid #e2e8f0' }}>
                                <div style={{ width: '60px', height: '60px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                                    {item.icon}
                                </div>
                                <h3 style={{ fontSize: '1.3em', color: '#1e293b', marginBottom: '15px' }}>{item.title}</h3>
                                <p style={{ color: '#64748b', lineHeight: '1.6' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WHY CHOOSE AUTOMART */}
                <div className="about-box-card">
                    <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', color: '#0f172a', marginBottom: '32px', fontWeight: '800', textAlign: 'center' }}>Why Choose AutoMart?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                        {[
                            { title: 'Transparent Information', icon: <Info size={24} color="#0284c7" />, desc: 'Get important information about price, mileage, fuel, transmission, specifications, features and inspection details.' },
                            { title: 'Simple Experience', icon: <CheckCircle size={24} color="#10b981" />, desc: 'Browse, compare, wishlist, add to cart and purchase from one convenient platform.' },
                            { title: 'Customer Support', icon: <Headphones size={24} color="#f59e0b" />, desc: 'Get help with car service, orders, delivery, warranty, insurance and customer support.' },
                            { title: 'Trusted Process', icon: <Lock size={24} color="#8b5cf6" />, desc: 'Car and order information is managed through a secure platform with user authentication.' }
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ flexShrink: 0, width: '50px', height: '50px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2em', color: '#1e293b', marginBottom: '10px' }}>{item.title}</h3>
                                    <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* HOW IT WORKS */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '2.5em', color: '#0f172a', marginBottom: '50px', fontWeight: '800', textAlign: 'center' }}>How It Works</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                        {[
                            { num: '01', title: 'Search Cars' },
                            { num: '02', title: 'Explore Details' },
                            { num: '03', title: 'Add to Wishlist/Cart' },
                            { num: '04', title: 'Place Your Order' }
                        ].map((step, idx) => (
                            <div key={idx} style={{ flex: '1 1 200px', position: 'relative', textAlign: 'center' }}>
                                <div style={{ fontSize: '4em', fontWeight: '900', color: '#e2e8f0', marginBottom: '-30px', position: 'relative', zIndex: 0 }}>
                                    {step.num}
                                </div>
                                <div style={{ position: 'relative', zIndex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', fontWeight: '600', color: '#1e293b' }}>
                                    {step.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CALL TO ACTION */}
                <div className="about-cta-card">
                    <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '16px', fontWeight: '800' }}>Find Your Perfect Car Today</h2>
                    <p style={{ fontSize: '1.2em', opacity: 0.8, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                        Explore our collection and discover a car that fits your needs and budget.
                    </p>
                    <Link 
                        to="/cars" 
                        style={{ 
                            display: 'inline-block', 
                            padding: '16px 40px', 
                            backgroundColor: '#0284c7', 
                            color: '#fff', 
                            borderRadius: '50px', 
                            textDecoration: 'none', 
                            fontWeight: '700',
                            fontSize: '1.1em',
                            transition: 'background-color 0.3s',
                            boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)'
                        }}
                    >
                        Explore Cars
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default About;
