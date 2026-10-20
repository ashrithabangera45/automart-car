import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ManageCars = () => {
    const [cars, setCars] = useState([]);
    
    const fetchCars = async () => {
        const { data } = await axios.get('http://localhost:5000/api/cars');
        setCars(data);
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const deleteCar = async (id) => {
        if (window.confirm('Are you sure you want to delete this car?')) {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/cars/${id}`, config);
            fetchCars(); // Refresh immediately
        }
    };

    const updateStock = async (car, newStock) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`http://localhost:5000/api/cars/${car._id}`, { stock: newStock }, config);
        fetchCars(); // Refresh immediately
    };

    return (
        <div style={{ padding: 'clamp(12px, 3vw, 20px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0, fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)' }}>Manage Cars</h2>
                <Link to="/admin/cars/add" style={{ padding: '10px 16px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>+ Add New Car</Link>
            </div>
            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginTop: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', backgroundColor: 'transparent', color: 'white' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(255,255,255,0.1)', textAlign: 'left', color: 'white' }}>
                            <th style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Name</th>
                            <th style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Brand</th>
                            <th style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Price</th>
                            <th style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Status</th>
                            <th style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cars.map(car => (
                            <tr key={car._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <td style={{ padding: '12px 10px', fontWeight: '500' }}>{car.name}</td>
                                <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{car.brand}</td>
                                <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>₹{car.price?.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '12px 10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ color: car.stock > 0 ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                                            {car.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                        <span style={{ color: '#94a3b8', fontSize: '0.9em' }}>({car.stock})</span>
                                        {car.stock > 0 ? (
                                            <button onClick={() => updateStock(car, 0)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8em' }}>Mark Sold (0)</button>
                                        ) : (
                                            <button onClick={() => updateStock(car, 1)} style={{ padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8em' }}>Mark Available (1)</button>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '12px 10px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <Link to={`/admin/cars/edit/${car._id}`} style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '500' }}>Edit</Link>
                                        <button onClick={() => deleteCar(car._id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '500', padding: 0 }}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageCars;
