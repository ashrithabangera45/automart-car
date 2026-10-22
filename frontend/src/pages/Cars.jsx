import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Check, Heart, Filter, X, MapPin } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BrandLogoCarousel from '../components/BrandLogoCarousel';

const Cars = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [cars, setCars] = useState([]);
    const [facets, setFacets] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    
    const { user, updateWishlistCount } = useContext(AuthContext);
    const { showToast } = useToast();
    const [wishlist, setWishlist] = useState(new Set());

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        if (user && user.token) {
            axios.get(`${API_URL}/wishlist`, { headers: { Authorization: `Bearer ${user.token}` } })
                 .then(res => setWishlist(new Set(res.data.map(item => item.carId?._id || item.carId))))
                 .catch(console.error);
        } else {
            setWishlist(new Set());
        }
    }, [user]);

    useEffect(() => {
        if (location.state?.autoWishlist && location.state?.fromCar && user && user.token) {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const targetCarId = location.state.fromCar;
            axios.post(`${API_URL}/wishlist`, { carId: targetCarId }, { headers: { Authorization: `Bearer ${user.token}` }})
                .then(() => {
                    updateWishlistCount();
                    setWishlist(prev => new Set(prev).add(targetCarId));
                    showToast({
                        title: 'Saved to Wishlist! ❤️',
                        message: 'Car added to your wishlist.',
                        type: 'success'
                    });
                })
                .catch(console.error);
            navigate(location.pathname + location.search, { replace: true, state: {} });
        }
    }, [location.state, user]);

    const toggleWishlist = async (e, carId) => {
        e.stopPropagation();
        if (!user) {
            showToast({
                title: 'Login Required',
                message: 'Please login to save cars to your wishlist.',
                type: 'error',
                actionText: 'Login Now',
                actionLink: '/user/login'
            });
            return navigate('/user/login', { 
                state: { 
                    from: location.pathname + location.search, 
                    fromCar: carId, 
                    autoWishlist: true 
                } 
            });
        }
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            if (wishlist.has(carId)) {
                await axios.delete(`${API_URL}/wishlist/${carId}`, { headers: { Authorization: `Bearer ${user.token}` }});
                updateWishlistCount();
                setWishlist(prev => {
                    const next = new Set(prev);
                    next.delete(carId);
                    return next;
                });
            } else {
                await axios.post(`${API_URL}/wishlist`, { carId }, { headers: { Authorization: `Bearer ${user.token}` }});
                updateWishlistCount();
                setWishlist(prev => {
                    const next = new Set(prev);
                    next.add(carId);
                    return next;
                });
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    const parseParams = () => {
        const params = new URLSearchParams(location.search);
        return {
            search: params.get('search') || '',
            brand: params.get('brand') ? params.get('brand').split(',') : [],
            model: params.get('model') ? params.get('model').split(',') : [],
            minPrice: params.get('minPrice') || '',
            maxPrice: params.get('maxPrice') || '',
            fuelType: params.get('fuelType') ? params.get('fuelType').split(',') : [],
            transmission: params.get('transmission') ? params.get('transmission').split(',') : [],
            bodyType: params.get('bodyType') ? params.get('bodyType').split(',') : [],
            colour: params.get('colour') ? params.get('colour').split(',') : [],
            features: params.get('features') ? params.get('features').split(',') : [],
            seatingCapacity: params.get('seatingCapacity') ? params.get('seatingCapacity').split(',') : [],
            owners: params.get('owners') ? params.get('owners').split(',') : [],
            location: params.get('location') ? params.get('location').split(',') : [],
            modelYear: params.get('modelYear') ? params.get('modelYear').split(',') : [],
            condition: params.get('condition') ? params.get('condition').split(',') : [],
            discount: params.get('discount') || '',
            sort: params.get('sort') || 'newest'
        };
    };

    const [filters, setFilters] = useState(parseParams());
    
    const [expanded, setExpanded] = useState({
        budget: true, brand: true, fuelType: true, bodyType: false, 
        transmission: false, colour: false, features: false, seatingCapacity: false, 
        owners: false, location: false, modelYear: false, condition: false
    });

    const toggleExpand = (section) => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        setFilters(parseParams());
    }, [location.search]);

    useEffect(() => {
        const fetchCars = async () => {
            setIsLoading(true);
            const queryParams = new URLSearchParams();
            
            Object.keys(filters).forEach(key => {
                if (Array.isArray(filters[key]) && filters[key].length > 0) {
                    queryParams.set(key, filters[key].join(','));
                } else if (!Array.isArray(filters[key]) && filters[key]) {
                    queryParams.set(key, filters[key]);
                }
            });
            
            queryParams.set('includeFacets', 'true');
            
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const { data } = await axios.get(`${API_URL}/cars?${queryParams.toString()}`);
                setCars(data.cars || []);
                if (data.facets) setFacets(data.facets);
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        };

        fetchCars();
    }, [filters]);

    const updateUrl = (newFilters) => {
        const queryParams = new URLSearchParams();
        Object.keys(newFilters).forEach(key => {
            if (Array.isArray(newFilters[key]) && newFilters[key].length > 0) {
                queryParams.set(key, newFilters[key].join(','));
            } else if (!Array.isArray(newFilters[key]) && newFilters[key]) {
                queryParams.set(key, newFilters[key]);
            }
        });
        navigate({ search: queryParams.toString() });
    };

    const handleRadioChange = (category, value) => {
        const valStr = String(value);
        const currentArr = filters[category] || [];
        // Toggle off if already selected, otherwise select only this value (radio behavior)
        const newArr = currentArr.includes(valStr) ? [] : [valStr];
        updateUrl({ ...filters, [category]: newArr });
    };

    const handleClearAll = () => {
        updateUrl({
            search: '', brand: [], model: [], minPrice: '', maxPrice: '', fuelType: [],
            transmission: [], bodyType: [], colour: [], features: [], seatingCapacity: [],
            owners: [], location: [], modelYear: [], condition: [], discount: '', sort: 'newest'
        });
    };

    const handlePricePreset = (min, max) => {
        updateUrl({ ...filters, minPrice: min, maxPrice: max });
    };

    const renderCheckboxList = (facetCategory, filterKey) => {
        if (!facets || !facets[facetCategory] || Object.keys(facets[facetCategory]).length === 0) {
            return <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>No options available</div>;
        }
        
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {Object.entries(facets[facetCategory]).map(([val, count]) => {
                    const isChecked = filters[filterKey]?.includes(String(val));
                    return (
                        <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95em', color: '#334155' }}>
                            <input type="radio" name={filterKey} style={{ display: 'none' }} checked={isChecked} onChange={() => handleRadioChange(filterKey, val)} />
                            <div style={{ width: '18px', height: '18px', border: '2px solid #cbd5e1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: isChecked ? '#007bff' : '#cbd5e1', flexShrink: 0 }}>
                                {isChecked && <div style={{ width: '10px', height: '10px', backgroundColor: '#007bff', borderRadius: '50%' }} />}
                            </div>
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.85em' }}>({count})</span>
                        </label>
                    );
                })}
            </div>
        );
    };

    const renderModelCheckboxList = () => {
        if (!facets || !facets.modelsByBrand) return null;
        
        let availableModels = {};
        filters.brand.forEach(b => {
            if (facets.modelsByBrand[b]) {
                Object.entries(facets.modelsByBrand[b]).forEach(([model, count]) => {
                    availableModels[model] = (availableModels[model] || 0) + count;
                });
            }
        });
        
        if (Object.keys(availableModels).length === 0) {
            return <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>No options available</div>;
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {Object.entries(availableModels).map(([val, count]) => {
                    const isChecked = filters.model?.includes(String(val));
                    return (
                        <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95em', color: '#334155' }}>
                            <input type="radio" name="model" style={{ display: 'none' }} checked={isChecked} onChange={() => handleRadioChange('model', val)} />
                            <div style={{ width: '18px', height: '18px', border: '2px solid #cbd5e1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: isChecked ? '#007bff' : '#cbd5e1', flexShrink: 0 }}>
                                {isChecked && <div style={{ width: '10px', height: '10px', backgroundColor: '#007bff', borderRadius: '50%' }} />}
                            </div>
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.85em' }}>({count})</span>
                        </label>
                    );
                })}
            </div>
        );
    };

    const FilterSection = ({ title, stateKey, children }) => (
        <div style={{ borderBottom: '1px solid #e2e8f0', padding: '15px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: expanded[stateKey] ? '15px' : '0' }} onClick={() => toggleExpand(stateKey)}>
                <h3 style={{ margin: 0, fontSize: '1em', color: '#1e293b', fontWeight: '600' }}>{title}</h3>
                {expanded[stateKey] ? <ChevronUp size={18} color="#64748b"/> : <ChevronDown size={18} color="#64748b"/>}
            </div>
            {expanded[stateKey] && <div>{children}</div>}
        </div>
    );

    const SidebarContent = () => (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2em', margin: 0, color: '#1e293b' }}>Filters</h2>
                <button onClick={handleClearAll} style={{ background: 'none', border: 'none', color: '#007bff', fontSize: '0.9em', cursor: 'pointer', fontWeight: '600' }}>Clear All</button>
            </div>
            
            {/* Budget */}
            <FilterSection title="Budget" stateKey="budget">
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8em', color: '#64748b', marginBottom: '5px' }}>Min Price (₹)</div>
                        <input type="number" value={filters.minPrice} onChange={(e) => updateUrl({ ...filters, minPrice: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="Min" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8em', color: '#64748b', marginBottom: '5px' }}>Max Price (₹)</div>
                        <input type="number" value={filters.maxPrice} onChange={(e) => updateUrl({ ...filters, maxPrice: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="Max" />
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button onClick={() => handlePricePreset('0', '500000')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85em', cursor: 'pointer', color: '#475569' }}>Under ₹5 Lakh</button>
                    <button onClick={() => handlePricePreset('500000', '1000000')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85em', cursor: 'pointer', color: '#475569' }}>₹5 - 10 Lakh</button>
                    <button onClick={() => handlePricePreset('1000000', '2000000')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85em', cursor: 'pointer', color: '#475569' }}>₹10 - 20 Lakh</button>
                    <button onClick={() => handlePricePreset('2000000', '5000000')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85em', cursor: 'pointer', color: '#475569' }}>₹20 - 50 Lakh</button>
                </div>
            </FilterSection>

            <FilterSection title="Make & Brand" stateKey="brand">
                {renderCheckboxList('brands', 'brand')}
            </FilterSection>

            {filters.brand.length > 0 && (
                <FilterSection title="Model" stateKey="model">
                    {renderModelCheckboxList()}
                </FilterSection>
            )}

            <FilterSection title="Fuel Type" stateKey="fuelType">
                {renderCheckboxList('fuelTypes', 'fuelType')}
            </FilterSection>

            <FilterSection title="Body Type" stateKey="bodyType">
                {renderCheckboxList('bodyTypes', 'bodyType')}
            </FilterSection>

            <FilterSection title="Transmission" stateKey="transmission">
                {renderCheckboxList('transmissions', 'transmission')}
            </FilterSection>

            <FilterSection title="Model Year" stateKey="modelYear">
                {renderCheckboxList('modelYears', 'modelYear')}
            </FilterSection>

            <FilterSection title="Condition" stateKey="condition">
                {renderCheckboxList('conditions', 'condition')}
            </FilterSection>

            <FilterSection title="Color" stateKey="colour">
                {renderCheckboxList('colours', 'colour')}
            </FilterSection>

            <FilterSection title="Seats" stateKey="seatingCapacity">
                {renderCheckboxList('seatingCapacities', 'seatingCapacity')}
            </FilterSection>

            <FilterSection title="Owners" stateKey="owners">
                {renderCheckboxList('owners', 'owners')}
            </FilterSection>

            <FilterSection title="Location" stateKey="location">
                {renderCheckboxList('locations', 'location')}
            </FilterSection>

            <FilterSection title="Features" stateKey="features">
                {renderCheckboxList('features', 'features')}
            </FilterSection>

            <div style={{ padding: '15px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95em', color: '#334155' }}>
                    <input type="checkbox" style={{ display: 'none' }} checked={filters.discount === 'true'} onChange={() => updateUrl({ ...filters, discount: filters.discount === 'true' ? '' : 'true' })} />
                    <div style={{ width: '18px', height: '18px', border: '1px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: filters.discount === 'true' ? '#007bff' : '#fff', borderColor: filters.discount === 'true' ? '#007bff' : '#cbd5e1' }}>
                        {filters.discount === 'true' && <Check size={14} color="#fff" />}
                    </div>
                    <span style={{ flex: 1 }}>Cars with Discount Only</span>
                </label>
            </div>
        </>
    );

    useEffect(() => {
        document.title = 'Browse Cars | AutoMart';
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'description';
            document.head.appendChild(meta);
        }
        meta.content = 'Search and browse our premium collection of cars at AutoMart. Find the perfect vehicle for you.';
    }, []);

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '50px' }}>
            <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px' }}>
                
                {/* Brand Logo Carousel */}
                <BrandLogoCarousel 
                    selectedBrand={filters.brand}
                    onBrandSelect={(brandName) => {
                        if (!brandName) {
                            updateUrl({ ...filters, brand: [] });
                        } else {
                            updateUrl({ ...filters, brand: [brandName] });
                        }
                    }}
                    brandCounts={facets?.brands || {}}
                    title="Popular Brands"
                />

                {/* Search Bar Top */}
                <div style={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '12px', padding: '15px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <Search size={20} color="#94a3b8" />
                    <input 
                        type="text" 
                        placeholder="Search cars, brands or models..." 
                        value={filters.search}
                        onChange={(e) => updateUrl({ ...filters, search: e.target.value })}
                        style={{ border: 'none', flex: 1, fontSize: '1.1em', outline: 'none' }}
                    />
                    {filters.search && (
                        <X 
                            size={20} 
                            color="#94a3b8" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => updateUrl({ ...filters, search: '' })} 
                        />
                    )}
                </div>

                <div style={{ display: 'flex', gap: '30px' }}>
                    
                    {/* DESKTOP SIDEBAR */}
                    <div className="desktop-sidebar" style={{ width: '280px', flexShrink: 0, backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', alignSelf: 'flex-start', position: 'sticky', top: '20px', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
                        <SidebarContent />
                    </div>

                    {/* MOBILE FILTER DRAWER */}
                    {isMobileFilterOpen && (
                        <div 
                            onClick={() => setIsMobileFilterOpen(false)}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', zIndex: 1200, display: 'flex', justifyContent: 'flex-end' }}
                        >
                            <div 
                                onClick={(e) => e.stopPropagation()}
                                style={{ width: '88%', maxWidth: '360px', backgroundColor: '#fff', height: '100%', overflowY: 'auto', padding: '20px 18px', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)', animation: 'slideInRight 0.25s ease-out' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
                                    <h2 style={{ fontSize: '1.25em', margin: 0, color: '#1e293b', fontWeight: '800' }}>Filters</h2>
                                    <button 
                                        onClick={() => setIsMobileFilterOpen(false)} 
                                        style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334155' }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    <SidebarContent />
                                </div>

                                <div style={{ position: 'sticky', bottom: 0, backgroundColor: '#fff', paddingTop: '15px', borderTop: '1px solid #e2e8f0', marginTop: '15px', display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={handleClearAll} 
                                        style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.95em', cursor: 'pointer' }}
                                    >
                                        Clear All
                                    </button>
                                    <button 
                                        onClick={() => setIsMobileFilterOpen(false)} 
                                        style={{ flex: 2, padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95em', cursor: 'pointer' }}
                                    >
                                        Apply Filters ({cars.length})
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <style>{`
                        @media (max-width: 900px) {
                            .desktop-sidebar { display: none !important; }
                            .mobile-filter-btn { display: flex !important; }
                        }
                        @keyframes slideInRight {
                            from { transform: translateX(100%); }
                            to { transform: translateX(0); }
                        }
                    `}</style>

                    {/* MAIN CONTENT */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', color: '#1e293b', fontWeight: '800' }}>
                                    {filters.brand && filters.brand.length > 0 ? `${filters.brand.join(', ')} Cars` : 'Find your perfect car'}
                                </h1>
                                <span style={{ color: '#64748b', fontSize: '0.9em' }}>{cars.length} {cars.length === 1 ? 'Car' : 'Cars'} Found</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* Mobile Filter Toggle */}
                                <button className="mobile-filter-btn" onClick={() => setIsMobileFilterOpen(true)} style={{ display: 'none', alignItems: 'center', gap: '8px', padding: '9px 14px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '0.9em' }}>
                                    <Filter size={17} color="#007bff" /> Filters
                                </button>

                                {/* Sort Dropdown */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.85em', whiteSpace: 'nowrap' }}>Sort:</span>
                                    <select 
                                        value={filters.sort} 
                                        onChange={(e) => updateUrl({ ...filters, sort: e.target.value })}
                                        style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff', color: '#334155', cursor: 'pointer', fontSize: '0.9em' }}
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="km_asc">Lowest KM</option>
                                        <option value="km_desc">Highest KM</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b', fontSize: '1.2em' }}>Loading cars...</div>
                        ) : cars.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <h2 style={{ color: '#1e293b', marginBottom: '10px', fontSize: '1.45rem', fontWeight: 800 }}>
                                    {filters.brand && filters.brand.length > 0 
                                        ? 'No cars available for this brand' 
                                        : 'No cars found'}
                                </h2>
                                <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 24px', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                    {filters.brand && filters.brand.length > 0 
                                        ? `We currently do not have any ${filters.brand.join(', ')} cars in our inventory. Explore other popular brands above or clear your filters.`
                                        : 'Try changing or clearing your filters to find what you\'re looking for.'}
                                </p>
                                <button onClick={handleClearAll} style={{ padding: '12px 26px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95em', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                                    {filters.brand && filters.brand.length > 0 ? 'Clear Brand Filter' : 'Clear All Filters'}
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '20px' }}>
                                {cars.map(car => (
                                    <div 
                                        key={car._id} 
                                        className="car-card-hover"
                                        style={{ 
                                            backgroundColor: '#fff', 
                                            borderRadius: '12px', 
                                            overflow: 'hidden', 
                                            border: '1px solid #e2e8f0', 
                                            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)', 
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-6px)';
                                            e.currentTarget.style.boxShadow = '0 16px 24px -4px rgba(0, 0, 0, 0.12), 0 8px 12px -4px rgba(0, 0, 0, 0.06)';
                                            const img = e.currentTarget.querySelector('.car-card-image');
                                            if (img) img.style.transform = 'scale(1.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                                            const img = e.currentTarget.querySelector('.car-card-image');
                                            if (img) img.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <div style={{ position: 'relative', height: '200px', cursor: 'pointer', overflow: 'hidden' }} onClick={() => navigate(`/cars/${car._id}`)}>
                                            <img 
                                                className="car-card-image"
                                                src={car.images && car.images.length > 0 && car.images[0] ? car.images[0] : 'https://via.placeholder.com/600x400?text=No+Image'} 
                                                alt={car.name} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} 
                                            />
                                            {car.stock > 0 && (
                                                <div style={{ position: 'absolute', top: '15px', left: '15px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold', color: '#1e293b' }}>
                                                    Assured
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                <div onClick={() => navigate(`/cars/${car._id}`)} style={{ cursor: 'pointer' }}>
                                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1em', color: '#1e293b', fontWeight: '700' }}>{car.modelYear} {car.brand} {car.name} {car.variant}</h3>
                                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85em' }}>{car.condition || 'Good'} Condition</p>
                                                </div>
                                                <div onClick={(e) => toggleWishlist(e, car._id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                                                    <Heart 
                                                        size={22} 
                                                        fill={wishlist.has(car._id) ? '#ef4444' : 'none'} 
                                                        color={wishlist.has(car._id) ? '#ef4444' : '#94a3b8'} 
                                                        style={{ transition: 'all 0.2s ease', transform: wishlist.has(car._id) ? 'scale(1.15)' : 'scale(1)' }} 
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.8em', color: '#475569', marginBottom: '12px', flexWrap: 'wrap' }}>
                                                {car.kmDriven && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📏 {car.kmDriven.toLocaleString()} km</span>}
                                                {car.fuelType && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>⛽ {car.fuelType}</span>}
                                                {car.transmission && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>⚙️ {car.transmission}</span>}
                                            </div>

                                            {car.location?.city && (
                                                <div style={{ fontSize: '0.8em', color: '#94a3b8', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MapPin size={14}/> {car.location.city}{car.location.state ? `, ${car.location.state}` : ''}
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                                <div>
                                                    {car.discount > 0 && <div style={{ fontSize: '0.85em', color: '#94a3b8', textDecoration: 'line-through' }}>₹{(car.price + car.discount).toLocaleString('en-IN')}</div>}
                                                    <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#1e293b' }}>₹{car.price?.toLocaleString('en-IN')}</div>
                                                    <div style={{ marginTop: '5px', fontSize: '0.9em', fontWeight: 'bold', color: car.stock > 0 ? '#16a34a' : '#dc2626' }}>
                                                        {car.stock > 0 ? '✓ In Stock' : '🔴 OUT OF STOCK'}
                                                    </div>
                                                </div>
                                                <button onClick={() => navigate(`/cars/${car._id}`)} style={{ backgroundColor: '#fff', color: '#007bff', border: '1px solid #007bff', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9em', cursor: 'pointer' }}>
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cars;
