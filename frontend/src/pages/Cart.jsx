import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ExploreOtherCars from '../components/ExploreOtherCars';

const Cart = () => {
    const { updateCartCount } = useContext(AuthContext);
    const [cart, setCart] = useState([]);

    const fetchCart = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const { data } = await axios.get('http://localhost:5000/api/cart', { headers: { Authorization: `Bearer ${user.token}` }});
        setCart(data);
    };

    useEffect(() => { fetchCart(); }, []);

    const remove = async (id) => {
        const user = JSON.parse(localStorage.getItem('user'));
        await axios.delete(`http://localhost:5000/api/cart/${id}`, { headers: { Authorization: `Bearer ${user.token}` }});
        fetchCart();
        updateCartCount();
    };

    const total = cart.reduce((acc, item) => acc + item.price, 0);
    const hasOutOfStock = cart.some(item => item.carId && item.carId.stock <= 0);
    const excludedIds = cart.map(item => item.carId?._id || item.carId).filter(Boolean);

    return (
        <div className="cart-page-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 14px' }}>
            <style>{`
                .cart-item-row {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                }
                .cart-item-img {
                    width: 130px;
                    height: 95px;
                    object-fit: cover;
                    border-radius: 10px;
                    flex-shrink: 0;
                }
                .cart-footer-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                @media (max-width: 540px) {
                    .cart-item-row {
                        flex-direction: column;
                    }
                    .cart-item-img {
                        width: 100%;
                        height: 160px;
                    }
                    .cart-footer-bar {
                        flex-direction: column;
                        align-items: stretch;
                        text-align: center;
                    }
                    .cart-footer-bar a {
                        display: block !important;
                        width: 100%;
                        text-align: center;
                        box-sizing: border-box;
                    }
                }
            `}</style>
            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>My Cart</h1>
                {cart.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                        <p style={{ fontSize: '1.1rem', margin: 0 }}>Your cart is empty.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            {cart.map((item, idx) => (
                                <div key={item._id} style={{ borderBottom: idx === cart.length - 1 ? 'none' : '1px solid #f1f5f9', padding: '16px 0' }}>
                                    <div className="cart-item-row">
                                        {item.carId?.images && item.carId.images.length > 0 && (
                                            <img src={item.carId.images[0]} alt={item.carId?.name} className="cart-item-img" />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.15rem', color: '#1e293b' }}>{item.carId?.brand} {item.carId?.name}</h3>
                                                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 8px 0' }}>
                                                    {item.carId?.modelYear || 'N/A'} | {item.carId?.fuelType || 'N/A'} | {item.carId?.transmission || 'N/A'}
                                                </p>
                                                <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>₹{item.price?.toLocaleString('en-IN')}</p>
                                                {item.carId && item.carId.stock <= 0 && (
                                                    <p style={{ color: '#dc2626', fontWeight: '600', margin: '5px 0', fontSize: '0.88rem' }}>✕ Out of Stock</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                                        <button onClick={() => remove(item._id)} style={{ color: '#ef4444', background: 'none', border: '1px solid #fecaca', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Remove</button>
                                        {item.carId && item.carId.stock > 0 ? (
                                            <Link to={`/checkout?carId=${item.carId._id}`} style={{ backgroundColor: '#0070f3', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', display: 'inline-block' }}>Buy Now</Link>
                                        ) : (
                                            <button disabled style={{ backgroundColor: '#cbd5e1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'not-allowed', fontWeight: '600', fontSize: '0.85rem' }}>Out of Stock</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-footer-bar">
                            <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b' }}>Total: <span style={{ color: '#0070f3', fontWeight: '800' }}>₹{total.toLocaleString('en-IN')}</span></h3>
                            <div>
                                {hasOutOfStock && (
                                    <div style={{ color: '#dc2626', marginBottom: '8px', fontWeight: '600', fontSize: '0.88rem' }}>Please remove out-of-stock items to proceed.</div>
                                )}
                                <Link 
                                    to={hasOutOfStock ? "#" : "/checkout"} 
                                    style={{ 
                                        display: 'inline-block',
                                        padding: '14px 28px', 
                                        backgroundColor: hasOutOfStock ? '#cbd5e1' : '#16a34a', 
                                        color: 'white', 
                                        textDecoration: 'none', 
                                        borderRadius: '8px',
                                        fontWeight: '700',
                                        pointerEvents: hasOutOfStock ? 'none' : 'auto',
                                        boxShadow: hasOutOfStock ? 'none' : '0 2px 6px rgba(22, 163, 74, 0.3)'
                                    }}
                                >
                                    Proceed to Checkout
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            <ExploreOtherCars />
        </div>
    );
};

export default Cart;
