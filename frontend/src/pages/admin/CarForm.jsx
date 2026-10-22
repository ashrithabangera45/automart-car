import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_FEATURES = [
    'ABS', 'Airbags', 'Air Conditioner', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 
    'Cruise Control', 'Sunroof', '360° Camera', 'Rear Camera', 'GPS Navigation', 
    'Push Button Start', 'Power Windows', 'Alloy Wheels', 'Rear AC', 'Parking Sensors', 'Wireless Charging'
];

const CarForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '', brand: '', model: '', variant: '', price: '', discount: 0,
        condition: 'New', modelYear: '', registrationYear: '',
        fuelType: '', transmission: '', mileage: '', engineCapacity: '', seatingCapacity: '', colour: '', bodyType: '',
        kmDriven: '', owners: '', registrationNumber: '', registrationState: '',
        manufacturingYear: '', manufacturingMonth: '', spareKey: false, serviceHistory: false,
        location: { city: '', state: '', address: '' },
        dealer: { name: '', phone: '', email: '' },
        features: [],
        specifications: {},
        reasonsToBuy: [''],
        description: '',
        inspection: { accidentHistory: '', odometerStatus: '', waterDamage: '', engineCondition: '', tyreCondition: '', overallStatus: '', notes: '' },
        warranty: { available: false, period: '', startDate: '', endDate: '', description: '' },
        insurance: { available: false, provider: '', policyNumber: '', startDate: '', expiryDate: '' },
        stock: 1, availability: true,
        videoUrl: '',
        model3d: '',
        images: []
    });

    const [specKey, setSpecKey] = useState('');
    const [specValue, setSpecValue] = useState('');
    const [customFeature, setCustomFeature] = useState('');
    const [uploading3D, setUploading3D] = useState(false);
    const [upload3DError, setUpload3DError] = useState('');

    useEffect(() => {
        if (id) {
            axios.get(`${API_URL}/cars/${id}`).then(res => {
                const data = res.data;
                setFormData({
                    ...data,
                    location: data.location || { city: '', state: '', address: '' },
                    dealer: data.dealer || { name: '', phone: '', email: '' },
                    inspection: data.inspection || { accidentHistory: '', odometerStatus: '', waterDamage: '', engineCondition: '', tyreCondition: '', overallStatus: '', notes: '' },
                    warranty: data.warranty || { available: false, period: '', startDate: '', endDate: '', description: '' },
                    insurance: data.insurance || { available: false, provider: '', policyNumber: '', startDate: '', expiryDate: '' },
                    features: data.features || [],
                    specifications: data.specifications || {},
                    reasonsToBuy: data.reasonsToBuy && data.reasonsToBuy.length > 0 ? data.reasonsToBuy : [''],
                    videoUrl: data.videoUrl || '',
                    model3d: data.model3d || '',
                    images: data.images || []
                });
            });
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === 'checkbox' ? checked : value;
        if (type === 'number' && val !== '') {
            val = Number(val);
        }
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleNestedChange = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: { ...prev[category], [field]: value }
        }));
    };

    const handleFeatureToggle = (feat) => {
        setFormData(prev => {
            const features = prev.features.includes(feat) ? prev.features.filter(f => f !== feat) : [...prev.features, feat];
            return { ...prev, features };
        });
    };

    const addCustomFeature = () => {
        if (customFeature.trim() && !formData.features.includes(customFeature)) {
            setFormData(prev => ({ ...prev, features: [...prev.features, customFeature.trim()] }));
            setCustomFeature('');
        }
    };

    const addSpecification = () => {
        if (specKey.trim() && specValue.trim()) {
            setFormData(prev => ({
                ...prev,
                specifications: { ...prev.specifications, [specKey.trim()]: specValue.trim() }
            }));
            setSpecKey('');
            setSpecValue('');
        }
    };

    const removeSpecification = (key) => {
        setFormData(prev => {
            const newSpecs = { ...prev.specifications };
            delete newSpecs[key];
            return { ...prev, specifications: newSpecs };
        });
    };

    const handleReasonChange = (index, value) => {
        const newReasons = [...formData.reasonsToBuy];
        newReasons[index] = value;
        setFormData(prev => ({ ...prev, reasonsToBuy: newReasons }));
    };

    const addReason = () => {
        setFormData(prev => ({ ...prev, reasonsToBuy: [...prev.reasonsToBuy, ''] }));
    };

    const removeReason = (index) => {
        setFormData(prev => ({ ...prev, reasonsToBuy: prev.reasonsToBuy.filter((_, i) => i !== index) }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleModel3dUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'glb' && ext !== 'gltf') {
            setUpload3DError('Please select a valid .glb or .gltf 3D model file.');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            setUpload3DError('File size exceeds the 50MB limit.');
            return;
        }

        setUpload3DError('');
        setUploading3D(true);

        const uploadData = new FormData();
        uploadData.append('modelFile', file);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user?.token}`
                }
            };

            const res = await axios.post(`${API_URL}/cars/upload-model`, uploadData, config);
            if (res.data && res.data.modelUrl) {
                setFormData(prev => ({ ...prev, model3d: res.data.modelUrl }));
            }
        } catch (err) {
            console.error('3D model upload error:', err);
            setUpload3DError(err.response?.data?.message || 'Failed to upload 3D model file. Please try again.');
        } finally {
            setUploading3D(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        try {
            const cleanedData = {
                ...formData,
                reasonsToBuy: formData.reasonsToBuy.filter(r => typeof r === 'string' && r.trim().length > 0)
            };

            if (id) {
                await axios.put(`${API_URL}/cars/${id}`, cleanedData, config);
            } else {
                await axios.post(`${API_URL}/cars`, cleanedData, config);
            }
            navigate('/admin/dashboard');
        } catch (err) {
            alert('Failed to save car. Check console.');
            console.error(err);
        }
    };

    const sectionStyle = { padding: 'clamp(14px, 3vw, 20px)', backgroundColor: 'transparent', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.2)' };
    const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em', color: 'white' };
    const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', marginBottom: '15px', outline: 'none', boxSizing: 'border-box' };
    const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '15px' };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 clamp(12px, 3vw, 20px) 20px', color: 'white' }}>
            <style>{`
                select option {
                    background-color: #1e293b;
                    color: white;
                }
                @media (max-width: 640px) {
                    .carform-flex-row {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .carform-flex-row input {
                        width: 100% !important;
                    }
                    .carform-submit-btn {
                        width: 100% !important;
                    }
                }
            `}</style>
            <h1 style={{ margin: '0 0 20px 0', borderBottom: '2px solid #007bff', paddingBottom: '10px', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>{id ? 'Edit Car' : 'Add New Car'}</h1>
            
            <form onSubmit={handleSubmit}>
                {/* BASIC INFO */}
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Basic Information</h3>
                    <div style={gridStyle}>
                        <div><label style={labelStyle}>Car Name *</label><input style={inputStyle} name="name" value={formData.name} onChange={handleChange} required /></div>
                        <div><label style={labelStyle}>Brand *</label><input style={inputStyle} name="brand" value={formData.brand} onChange={handleChange} required /></div>
                        <div><label style={labelStyle}>Model</label><input style={inputStyle} name="model" value={formData.model} onChange={handleChange} /></div>
                        <div><label style={labelStyle}>Variant</label><input style={inputStyle} name="variant" value={formData.variant} onChange={handleChange} /></div>
                        <div><label style={labelStyle}>Price (₹) *</label><input style={inputStyle} type="number" name="price" value={formData.price} onChange={handleChange} required /></div>
                        <div><label style={labelStyle}>Discount (₹)</label><input style={inputStyle} type="number" name="discount" value={formData.discount} onChange={handleChange} /></div>
                        <div>
                            <label style={labelStyle}>Condition</label>
                            <select style={inputStyle} name="condition" value={formData.condition} onChange={handleChange}>
                                <option value="New">New</option>
                                <option value="Used">Used</option>
                            </select>
                        </div>
                        <div><label style={labelStyle}>Model Year</label><input style={inputStyle} type="number" name="modelYear" value={formData.modelYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 1} step="1" /></div>
                        <div><label style={labelStyle}>Registration Year</label><input style={inputStyle} type="number" name="registrationYear" value={formData.registrationYear} onChange={handleChange} min="1900" max={new Date().getFullYear() + 1} step="1" /></div>
                        <div><label style={labelStyle}>Stock</label><input style={inputStyle} type="number" name="stock" value={formData.stock} onChange={handleChange} required /></div>
                    </div>
                </div>

                {/* CAR DETAILS */}
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Car Details</h3>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Fuel Type</label>
                            <select style={inputStyle} name="fuelType" value={formData.fuelType} onChange={handleChange}>
                                <option value="">Select Fuel</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="CNG">CNG</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Transmission</label>
                            <select style={inputStyle} name="transmission" value={formData.transmission} onChange={handleChange}>
                                <option value="">Select Transmission</option>
                                <option value="Manual">Manual</option>
                                <option value="Automatic">Automatic</option>
                            </select>
                        </div>
                        <div><label style={labelStyle}>Mileage</label><input style={inputStyle} name="mileage" value={formData.mileage} onChange={handleChange} placeholder="e.g. 15 kmpl" /></div>
                        <div><label style={labelStyle}>Engine Capacity</label><input style={inputStyle} name="engineCapacity" value={formData.engineCapacity} onChange={handleChange} placeholder="e.g. 1998 cc" /></div>
                        <div><label style={labelStyle}>Seating Capacity</label><input style={inputStyle} type="number" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} /></div>
                        <div><label style={labelStyle}>Colour</label><input style={inputStyle} name="colour" value={formData.colour} onChange={handleChange} /></div>
                        <div><label style={labelStyle}>Body Type</label><input style={inputStyle} name="bodyType" value={formData.bodyType} onChange={handleChange} placeholder="e.g. SUV, Sedan" /></div>
                    </div>
                </div>

                {/* USED CAR INFORMATION */}
                {formData.condition === 'Used' && (
                    <div style={sectionStyle}>
                        <h3 style={{ marginTop: 0 }}>Used Car Information</h3>
                        <div style={gridStyle}>
                            <div><label style={labelStyle}>KM Driven</label><input style={inputStyle} type="number" name="kmDriven" value={formData.kmDriven} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Number of Owners</label><input style={inputStyle} type="number" name="owners" value={formData.owners} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Registration Number</label><input style={inputStyle} name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Registration State</label><input style={inputStyle} name="registrationState" value={formData.registrationState} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Manufacturing Year</label><input style={inputStyle} type="number" name="manufacturingYear" value={formData.manufacturingYear} onChange={handleChange} /></div>
                            <div><label style={labelStyle}>Manufacturing Month</label><input style={inputStyle} name="manufacturingMonth" value={formData.manufacturingMonth} onChange={handleChange} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
                            <label><input type="checkbox" name="spareKey" checked={formData.spareKey} onChange={handleChange} /> Spare Key Available</label>
                            <label><input type="checkbox" name="serviceHistory" checked={formData.serviceHistory} onChange={handleChange} /> Full Service History</label>
                        </div>
                    </div>
                )}

                {/* LOCATION & DEALER */}
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Location & Dealer Info</h3>
                    <div style={gridStyle}>
                        <div><label style={labelStyle}>City</label><input style={inputStyle} value={formData.location.city} onChange={(e) => handleNestedChange('location', 'city', e.target.value)} /></div>
                        <div><label style={labelStyle}>State</label><input style={inputStyle} value={formData.location.state} onChange={(e) => handleNestedChange('location', 'state', e.target.value)} /></div>
                        <div><label style={labelStyle}>Dealer Name</label><input style={inputStyle} value={formData.dealer.name} onChange={(e) => handleNestedChange('dealer', 'name', e.target.value)} /></div>
                        <div><label style={labelStyle}>Dealer Phone</label><input style={inputStyle} value={formData.dealer.phone} onChange={(e) => handleNestedChange('dealer', 'phone', e.target.value)} /></div>
                    </div>
                </div>

                {/* FEATURES */}
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Features</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: '10px', marginBottom: '15px' }}>
                        {DEFAULT_FEATURES.map(feat => (
                            <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.features.includes(feat)} onChange={() => handleFeatureToggle(feat)} />
                                <span style={{ fontSize: '0.9rem' }}>{feat}</span>
                            </label>
                        ))}
                    </div>
                    <div className="carform-flex-row" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input style={{...inputStyle, marginBottom: 0, flex: 1, maxWidth: '300px'}} placeholder="Add custom feature" value={customFeature} onChange={e => setCustomFeature(e.target.value)} />
                        <button type="button" onClick={addCustomFeature} style={{ padding: '10px 20px', backgroundColor: '#333', color: '#fff', borderRadius: '4px', border: '1px solid #555', cursor: 'pointer', height: '42px' }}>Add</button>
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {formData.features.filter(f => !DEFAULT_FEATURES.includes(f)).map(f => (
                            <span key={f} style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85em', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                {f} <button type="button" onClick={() => handleFeatureToggle(f)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: '1.1rem', lineHeight: 1 }}>&times;</button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* SPECIFICATIONS */}
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Specifications</h3>
                    {Object.entries(formData.specifications).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', gap: '15px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <strong style={{ minWidth: '120px' }}>{key}:</strong>
                            <span style={{ color: '#cbd5e1' }}>{val}</span>
                            <button type="button" onClick={() => removeSpecification(key)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>Remove</button>
                        </div>
                    ))}
                    <div className="carform-flex-row" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <input style={{...inputStyle, marginBottom: 0, flex: 1}} placeholder="Spec Name (e.g. Ground Clearance)" value={specKey} onChange={e => setSpecKey(e.target.value)} />
                        <input style={{...inputStyle, marginBottom: 0, flex: 1}} placeholder="Value (e.g. 200 mm)" value={specValue} onChange={e => setSpecValue(e.target.value)} />
                        <button type="button" onClick={addSpecification} style={{ padding: '10px 20px', backgroundColor: '#333', color: '#fff', borderRadius: '4px', border: '1px solid #555', cursor: 'pointer', whiteSpace: 'nowrap', height: '42px' }}>Add Spec</button>
                    </div>
                </div>

                {/* REASONS TO BUY */}
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Reasons to Buy</h3>
                    {formData.reasonsToBuy.map((reason, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                            <input style={{...inputStyle, marginBottom: 0, flex: 1}} value={reason} onChange={e => handleReasonChange(index, e.target.value)} placeholder="e.g. Excellent condition" />
                            <button type="button" onClick={() => removeReason(index)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addReason} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>+ Add Reason</button>
                </div>

                {/* INSPECTION */}
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Inspection Report</h3>
                    <div style={gridStyle}>
                        <div><label style={labelStyle}>Accident History</label><input style={inputStyle} value={formData.inspection.accidentHistory} onChange={(e) => handleNestedChange('inspection', 'accidentHistory', e.target.value)} /></div>
                        <div><label style={labelStyle}>Odometer Status</label><input style={inputStyle} value={formData.inspection.odometerStatus} onChange={(e) => handleNestedChange('inspection', 'odometerStatus', e.target.value)} /></div>
                        <div><label style={labelStyle}>Engine Condition</label><input style={inputStyle} value={formData.inspection.engineCondition} onChange={(e) => handleNestedChange('inspection', 'engineCondition', e.target.value)} /></div>
                        <div><label style={labelStyle}>Overall Status</label><input style={inputStyle} value={formData.inspection.overallStatus} onChange={(e) => handleNestedChange('inspection', 'overallStatus', e.target.value)} /></div>
                    </div>
                </div>

                {/* WARRANTY & INSURANCE */}
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Warranty & Insurance</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
                        <div>
                            <h4>Warranty</h4>
                            <label style={{ display: 'block', marginBottom: '10px', cursor: 'pointer' }}><input type="checkbox" checked={formData.warranty.available} onChange={(e) => handleNestedChange('warranty', 'available', e.target.checked)} /> Available</label>
                            {formData.warranty.available && (
                                <>
                                    <input style={inputStyle} placeholder="Period (e.g. 6 Months)" value={formData.warranty.period} onChange={(e) => handleNestedChange('warranty', 'period', e.target.value)} />
                                    <input style={inputStyle} placeholder="Description" value={formData.warranty.description} onChange={(e) => handleNestedChange('warranty', 'description', e.target.value)} />
                                </>
                            )}
                        </div>
                        <div>
                            <h4>Insurance</h4>
                            <label style={{ display: 'block', marginBottom: '10px', cursor: 'pointer' }}><input type="checkbox" checked={formData.insurance.available} onChange={(e) => handleNestedChange('insurance', 'available', e.target.checked)} /> Available</label>
                            {formData.insurance.available && (
                                <>
                                    <input style={inputStyle} placeholder="Provider" value={formData.insurance.provider} onChange={(e) => handleNestedChange('insurance', 'provider', e.target.value)} />
                                    <input style={inputStyle} placeholder="Policy Number" value={formData.insurance.policyNumber} onChange={(e) => handleNestedChange('insurance', 'policyNumber', e.target.value)} />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Description</h3>
                    <textarea style={{...inputStyle, minHeight: '120px'}} name="description" value={formData.description} onChange={handleChange} placeholder="Complete car description..."></textarea>
                </div>

                {/* YOUTUBE VIDEO SECTION */}
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#ef4444' }}>▶</span> YouTube Video Walkthrough (Optional)
                    </h3>
                    <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        Paste an optional YouTube video URL for this car. Customers can watch the video walkthrough from the car details page.
                    </p>
                    <div>
                        <label style={labelStyle}>YouTube Video URL</label>
                        <input 
                            style={inputStyle} 
                            name="videoUrl" 
                            id="car-video-url-input"
                            value={formData.videoUrl || ''} 
                            onChange={handleChange} 
                            placeholder="e.g. https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID" 
                        />
                    </div>

                    {/* Live Video Preview if valid YouTube ID */}
                    {(() => {
                        const extractYouTubeId = (url) => {
                            if (!url || typeof url !== 'string') return null;
                            const clean = url.trim();
                            if (!clean) return null;
                            if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
                            const match = clean.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                            return match ? match[1] : null;
                        };

                        if (!formData.videoUrl || !formData.videoUrl.trim()) return null;
                        const videoId = extractYouTubeId(formData.videoUrl);

                        if (videoId) {
                            return (
                                <div style={{ marginTop: '10px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ width: '160px', height: '90px', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: '#000', flexShrink: 0 }}>
                                        <img 
                                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                                            alt="YouTube Video Thumbnail" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '32px', height: '24px', backgroundColor: '#ef4444', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: '#fff', fontSize: '12px' }}>▶</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            ✓ Valid YouTube Video Detected
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                                            Video ID: <strong style={{ color: '#f1f5f9' }}>{videoId}</strong>
                                        </div>
                                        <a 
                                            href={`https://www.youtube.com/watch?v=${videoId}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.82rem', color: '#38bdf8', textDecoration: 'none' }}
                                        >
                                            Open Video on YouTube ↗
                                        </a>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div style={{ marginTop: '8px', padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#fca5a5', fontSize: '0.85rem' }}>
                                    ⚠️ Invalid YouTube URL. Supported formats: <code>https://www.youtube.com/watch?v=...</code> or <code>https://youtu.be/...</code>
                                </div>
                            );
                        }
                    })()}
                </div>

                {/* IMAGES & ANGLES */}
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Car Images (Different Angles)</h3>
                    <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        Upload multiple photos to show all vehicle angles (Front, Side, Rear, Interior, Dashboard, Engine).
                    </p>

                    {/* File Upload Input */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={labelStyle}>Upload from Device (Multiple Files):</label>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ width: '100%' }} />
                    </div>

                    {/* Direct Image URL input for quick web image addition */}
                    <div className="carform-flex-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                        <input 
                            id="car-image-url-input" 
                            style={{ ...inputStyle, marginBottom: 0, flex: 1 }} 
                            placeholder="Or paste image URL (e.g. https://... or /images/angle.jpg)" 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.target.value.trim();
                                    if (val) {
                                        setFormData(prev => ({ ...prev, images: [...prev.images, val] }));
                                        e.target.value = '';
                                    }
                                }
                            }}
                        />
                        <button 
                            type="button" 
                            onClick={() => {
                                const el = document.getElementById('car-image-url-input');
                                if (el && el.value.trim()) {
                                    setFormData(prev => ({ ...prev, images: [...prev.images, el.value.trim()] }));
                                    el.value = '';
                                }
                            }}
                            style={{ padding: '10px 18px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', height: '42px', fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                            + Add Image URL
                        </button>
                    </div>

                    {/* Uploaded Angles Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 150px), 1fr))', gap: '15px' }}>
                        {formData.images.map((img, index) => {
                            const angleLabels = ['Front View (Primary)', 'Side Profile', 'Rear View', 'Interior Cabin', 'Dashboard', 'Engine Bay', 'Boot / Trunk'];
                            const angleName = angleLabels[index] || `Angle ${index + 1}`;
                            return (
                                <div key={index} style={{ position: 'relative', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '6px' }}>
                                    <img src={img} alt={`Upload ${index}`} style={{ width: '100%', height: '105px', objectFit: 'cover', borderRadius: '6px', display: 'block' }} />
                                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, marginTop: '6px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {angleName}
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage(index)} 
                                        aria-label="Remove image"
                                        style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontWeight: 'bold' }}
                                    >
                                        &times;
                                    </button>
                                    {index === 0 && (
                                        <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#16a34a', color: '#fff', fontSize: '0.68em', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                            Primary
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3D CAR MODEL (360° VIEWER) */}
                <div style={sectionStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <h3 style={{ margin: 0 }}>Interactive 360° 3D Car Model</h3>
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                            Optional Feature
                        </span>
                    </div>
                    <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        Provide a real 3D model file (<strong>.glb</strong> or <strong>.gltf</strong>) to enable the interactive 360° rotating viewer on the car details page. If none is provided, the photo gallery will be displayed automatically.
                    </p>

                    {/* Upload from Device */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Upload 3D Model File (.glb, .gltf — max 50MB):</label>
                        <input 
                            type="file" 
                            accept=".glb,.gltf" 
                            onChange={handleModel3dUpload} 
                            disabled={uploading3D}
                            style={{ width: '100%' }} 
                        />
                        {uploading3D && (
                            <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#38bdf8' }}>
                                ⏳ Uploading 3D model to server, please wait...
                            </div>
                        )}
                        {upload3DError && (
                            <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#ef4444' }}>
                                ⚠️ {upload3DError}
                            </div>
                        )}
                    </div>

                    {/* Or Direct Model URL */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Or 3D Model URL / Path:</label>
                        <input 
                            type="text"
                            name="model3d"
                            value={formData.model3d || ''}
                            onChange={handleChange}
                            placeholder="e.g. /uploads/models3d/car-model.glb or https://..."
                            style={inputStyle}
                        />
                    </div>

                    {/* Current 3D Model Status */}
                    {formData.model3d && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'rgba(2, 132, 199, 0.15)',
                            border: '1px solid #0284c7',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            marginTop: '10px'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>
                                    ✓ Active 3D Model Assigned
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', wordBreak: 'break-all', marginTop: '2px' }}>
                                    {formData.model3d}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, model3d: '' }))}
                                style={{
                                    backgroundColor: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 10px',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    marginLeft: '12px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Remove 3D Model
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <button className="carform-submit-btn" type="submit" style={{ padding: '14px 36px', backgroundColor: '#28a745', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', width: 'auto' }}>
                        {id ? 'UPDATE CAR' : 'SAVE CAR'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CarForm;
