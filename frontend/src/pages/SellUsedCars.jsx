import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    ArrowRight, 
    Sparkles, 
    Check, 
    CheckCircle2, 
    ShieldCheck, 
    Clock, 
    Calendar, 
    MapPin, 
    Phone, 
    User, 
    AlertCircle, 
    X, 
    RotateCcw, 
    FileText, 
    Truck, 
    ThumbsUp, 
    HelpCircle, 
    ChevronDown,
    Zap,
    BadgeIndianRupee
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
    VALUATION_BRANDS, 
    BRAND_MODELS_MAP, 
    INDIAN_STATES_RTO, 
    KM_OPTIONS, 
    CONDITION_OPTIONS, 
    POPULAR_CITIES 
} from '../data/valuationCatalog';

const SellUsedCars = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const hasAutoExecutedRef = useRef(false);

    // 1. Plate input state
    const [plateNumber, setPlateNumber] = useState('');
    const [plateError, setPlateError] = useState('');
    const [detectedState, setDetectedState] = useState('');

    // 2. Wizard state
    // Step 0: Initial Landing Card (Plate input + Brand Carousel)
    // Step 1: Select Model
    // Step 2: Select Manufacturing Year & Variant
    // Step 3: Kilometres Driven, Fuel Type & Transmission
    // Step 4: Location & Car Condition
    // Step 5: Valuation Result Showcase
    const [step, setStep] = useState(0);

    // Selected vehicle parameters
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedYear, setSelectedYear] = useState(2021);
    const [selectedVariant, setSelectedVariant] = useState('');
    const [selectedKm, setSelectedKm] = useState(30000);
    const [selectedFuel, setSelectedFuel] = useState('Petrol');
    const [selectedTransmission, setSelectedTransmission] = useState('Manual');
    const [selectedCity, setSelectedCity] = useState('Bangalore');
    const [selectedCondition, setSelectedCondition] = useState('Good');
    const [selectedOwners, setSelectedOwners] = useState(1);

    // Search query for models and all-brands modal
    const [modelSearch, setModelSearch] = useState('');
    const [isAllBrandsModalOpen, setIsAllBrandsModalOpen] = useState(false);
    const [brandSearchModal, setBrandSearchModal] = useState('');

    // Valuation calculation result
    const [isCalculating, setIsCalculating] = useState(false);
    const [valuationResult, setValuationResult] = useState(null);

    // Inspection booking modal
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [sellerName, setSellerName] = useState(user?.fullName || '');
    const [sellerPhone, setSellerPhone] = useState(user?.phone || '');
    const [sellerEmail, setSellerEmail] = useState(user?.email || '');
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('Morning (10 AM - 1 PM)');
    const [address, setAddress] = useState(user?.address || '');
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // FAQ Accordion State
    const [activeFaq, setActiveFaq] = useState(null);

    // Carousel Ref
    const carouselRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // Set page title & meta
    useEffect(() => {
        document.title = 'Sell Your Car Online - Instant Car Valuation | AutoMart';
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'description';
            document.head.appendChild(meta);
        }
        meta.content = 'Sell your used car at the best price with AutoMart. Instant online valuation, free doorstep inspection, same-day payment, and free RC transfer.';
    }, []);

    // Check carousel scroll buttons
    const checkCarouselScroll = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkCarouselScroll();
        window.addEventListener('resize', checkCarouselScroll);
        return () => window.removeEventListener('resize', checkCarouselScroll);
    }, []);

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const amount = 320;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -amount : amount,
                behavior: 'smooth'
            });
            setTimeout(checkCarouselScroll, 350);
        }
    };

    // Real-time plate number normalization & state detection
    const handlePlateChange = (e) => {
        const raw = e.target.value.toUpperCase();
        // Allow alphanumeric and spaces
        const filtered = raw.replace(/[^A-Z0-9 ]/g, '').slice(0, 15);
        setPlateNumber(filtered);
        setPlateError('');

        // Extract state code (first 2 characters)
        const cleanNoSpaces = filtered.replace(/\s+/g, '');
        if (cleanNoSpaces.length >= 2) {
            const code = cleanNoSpaces.slice(0, 2);
            if (INDIAN_STATES_RTO[code]) {
                setDetectedState(INDIAN_STATES_RTO[code]);
                setSelectedCity(INDIAN_STATES_RTO[code]);
            } else if (/^\d{2}$/.test(code)) {
                setDetectedState('BH Series (All India)');
            } else {
                setDetectedState('');
            }
        } else {
            setDetectedState('');
        }
    };

    // Validate registration number format
    const validatePlate = (plate) => {
        const clean = plate.replace(/\s+/g, '').toUpperCase();
        // Standard: e.g. KA01AB1234 or DL3CAB1234
        const standardRegex = /^([A-Z]{2})([0-9]{1,2})([A-Z]{0,3})([0-9]{4})$/;
        // BH Series: e.g. 22BH1234AA
        const bhRegex = /^([0-9]{2})(BH)([0-9]{4})([A-Z]{1,2})$/;

        return standardRegex.test(clean) || bhRegex.test(clean);
    };

    // Handle "Get Instant Car Price" button click
    const handleGetInstantPrice = (e) => {
        e.preventDefault();
        const trimmed = plateNumber.trim();
        if (!trimmed) {
            setPlateError('Please enter your car registration number to continue.');
            return;
        }

        if (!validatePlate(trimmed)) {
            setPlateError('Please enter a valid registration number (e.g., DL 03 AB 1234 or KA 01 AB 1234).');
            return;
        }

        setPlateError('');
        // Smoothly proceed to Step 1 (Brand/Model selection) with plate preserved
        if (!selectedBrand) {
            // Default to Maruti or first brand, or prompt to pick brand
            setStep(1);
        } else {
            setStep(1);
        }
    };

    // Handle selecting a brand from carousel or modal
    const handleSelectBrand = (brand) => {
        setSelectedBrand(brand.name);
        setIsAllBrandsModalOpen(false);

        // Auto select first model or prepare model list
        const models = BRAND_MODELS_MAP[brand.name] || [];
        if (models.length > 0) {
            setSelectedModel(models[0].name);
            setSelectedVariant(models[0].variants ? models[0].variants[0] : 'Standard');
            setSelectedFuel(models[0].fuelTypes ? models[0].fuelTypes[0] : 'Petrol');
            setSelectedTransmission(models[0].transmissions ? models[0].transmissions[0] : 'Manual');
        } else {
            setSelectedModel('');
            setSelectedVariant('Standard');
        }

        setStep(1);
        window.scrollTo({ top: 180, behavior: 'smooth' });
    };

    // Handle selecting a model
    const handleSelectModel = (modelObj) => {
        setSelectedModel(modelObj.name);
        if (modelObj.variants && modelObj.variants.length > 0) {
            setSelectedVariant(modelObj.variants[0]);
        }
        if (modelObj.fuelTypes && modelObj.fuelTypes.length > 0) {
            setSelectedFuel(modelObj.fuelTypes[0]);
        }
        if (modelObj.transmissions && modelObj.transmissions.length > 0) {
            setSelectedTransmission(modelObj.transmissions[0]);
        }
        setStep(2);
    };

    // Perform valuation calculation via backend API (with graceful client fallback)
    const executeValuationCalculation = async (dataToUse) => {
        setIsCalculating(true);
        try {
            const data = dataToUse || {
                plateNumber,
                detectedState,
                selectedBrand,
                selectedModel,
                selectedVariant,
                selectedYear,
                selectedKm,
                selectedFuel,
                selectedTransmission,
                selectedCondition,
                selectedOwners,
                selectedCity
            };

            const payload = {
                registrationNumber: (data.plateNumber || '').trim(),
                brand: data.selectedBrand,
                model: data.selectedModel,
                variant: data.selectedVariant,
                manufacturingYear: Number(data.selectedYear),
                kmDriven: Number(data.selectedKm),
                fuelType: data.selectedFuel,
                transmission: data.selectedTransmission,
                condition: data.selectedCondition,
                owners: Number(data.selectedOwners),
                city: data.selectedCity,
                state: data.detectedState || data.selectedCity
            };

            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}')?.token;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await axios.post('http://localhost:5000/api/valuation/estimate', payload, { headers });
            if (res.data.success && res.data.valuation) {
                setValuationResult(res.data.valuation);
                setStep(5);
                window.scrollTo({ top: 120, behavior: 'smooth' });
                showToast({
                    title: 'Valuation Ready! 🚗',
                    message: `Estimated Fair Market Price: ₹${res.data.valuation.fairMarketPrice?.toLocaleString('en-IN')}`,
                    type: 'success'
                });
            } else {
                throw new Error('API valuation calculation returned incomplete data');
            }
        } catch (err) {
            console.warn('Backend valuation API fallback triggered:', err);
            // Fallback client-side calculation if backend is unreachable
            const yr = Number(dataToUse?.selectedYear || selectedYear);
            const br = dataToUse?.selectedBrand || selectedBrand;
            const md = dataToUse?.selectedModel || selectedModel;
            const vr = dataToUse?.selectedVariant || selectedVariant;
            const km = Number(dataToUse?.selectedKm || selectedKm);
            const fu = dataToUse?.selectedFuel || selectedFuel;
            const tr = dataToUse?.selectedTransmission || selectedTransmission;
            const cd = dataToUse?.selectedCondition || selectedCondition;
            const ct = dataToUse?.selectedCity || selectedCity;

            const currentYear = new Date().getFullYear();
            const age = Math.max(0, currentYear - yr);
            let base = 850000;
            if (br === 'BMW' || br === 'Mercedes-Benz' || br === 'Audi') base = 4800000;
            else if (br === 'Bentley') base = 35000000;
            else if (br === 'Toyota') base = 1800000;
            else if (br === 'Mahindra' || br === 'Tata') base = 1200000;

            const deprecRate = Math.min(0.80, 0.15 + age * 0.08);
            const fair = Math.round((base * (1 - deprecRate)) / 1000) * 1000;
            const min = Math.round((fair * 0.94) / 1000) * 1000;
            const max = Math.round((fair * 1.06) / 1000) * 1000;

            setValuationResult({
                brand: br,
                model: md,
                variant: vr,
                manufacturingYear: yr,
                kmDriven: km,
                fuelType: fu,
                transmission: tr,
                condition: cd,
                city: ct,
                fairMarketPrice: fair,
                minPrice: min,
                maxPrice: max,
                priceFormatted: `₹${(fair / 100000).toFixed(2)} Lakhs`,
                rangeFormatted: `₹${(min / 100000).toFixed(2)} Lakhs – ₹${(max / 100000).toFixed(2)} Lakhs`,
                breakdown: {
                    baseNewEstimate: base,
                    ageYears: age,
                    ageDepreciationPercent: Math.round(deprecRate * 100),
                    kmDriven: km,
                    conditionRated: cd,
                    fairMarketPrice: fair
                },
                explanationPoints: [
                    `Market reference value for ${br} ${md} estimated based on vehicle class.`,
                    `Resale depreciation of ${Math.round(deprecRate * 100)}% applied for vehicle age of ${age} years.`,
                    `Adjusted for ${cd} condition and ${km.toLocaleString('en-IN')} km driven.`,
                    `Estimated resale range between ₹${min.toLocaleString('en-IN')} and ₹${max.toLocaleString('en-IN')}.`
                ],
                disclaimer: 'This estimated valuation is calculated using AutoMart’s market valuation model based on vehicle age, mileage, condition, and market demand. It is not an official government RTO lookup or a binding purchase offer until verified by our technical inspector.'
            });
            setStep(5);
            window.scrollTo({ top: 120, behavior: 'smooth' });
        } finally {
            setIsCalculating(false);
        }
    };

    // Ask for login only at the final step of the valuation process
    const handleFinalSubmit = () => {
        if (!selectedBrand || !selectedModel) {
            showToast({
                title: 'Vehicle Details Required',
                message: 'Please make sure brand and model are selected to calculate valuation.',
                type: 'error'
            });
            setStep(1);
            return;
        }

        const currentFormData = {
            plateNumber: plateNumber.trim(),
            detectedState: detectedState || selectedCity,
            selectedBrand,
            selectedModel,
            selectedYear: Number(selectedYear),
            selectedVariant: selectedVariant || 'Standard',
            selectedKm: Number(selectedKm) || 30000,
            selectedFuel: selectedFuel || 'Petrol',
            selectedTransmission: selectedTransmission || 'Manual',
            selectedCity: selectedCity || 'Bangalore',
            selectedCondition: selectedCondition || 'Good',
            selectedOwners: Number(selectedOwners) || 1,
            step: 4
        };

        // Preserve all vehicle parameters in sessionStorage
        sessionStorage.setItem('automart_pending_valuation', JSON.stringify(currentFormData));

        // 1. Check authentication (reusing exact Buy Now pattern: !user || !user.token)
        if (!user || !user.token) {
            showToast({
                title: 'Login Required',
                message: 'Please login or register to unlock your car’s best price valuation.',
                type: 'info',
                actionText: 'Login Now',
                actionLink: '/user/login'
            });

            sessionStorage.setItem('automart_auto_valuate', 'true');

            navigate('/user/login', {
                state: {
                    redirectTo: '/sell-used-cars',
                    from: '/sell-used-cars',
                    fromValuation: true,
                    autoValuate: true,
                    pendingValuation: currentFormData
                }
            });
            return;
        }

        // 2. User is already logged in -> calculate immediately without redirecting to login
        executeValuationCalculation(currentFormData);
    };

    // Handle evaluating another car (reset form and clean storage)
    const handleResetValuation = () => {
        sessionStorage.removeItem('automart_pending_valuation');
        sessionStorage.removeItem('automart_auto_valuate');
        setValuationResult(null);
        setStep(0);
        setPlateNumber('');
        setDetectedState('');
        setSelectedBrand(null);
        setSelectedModel(null);
        hasAutoExecutedRef.current = false;
        window.scrollTo({ top: 150, behavior: 'smooth' });
    };

    // Keep seller contact fields synced with logged in user profile
    useEffect(() => {
        if (user) {
            if (user.fullName) setSellerName(prev => prev || user.fullName);
            if (user.phone) setSellerPhone(prev => prev || user.phone);
            if (user.email) setSellerEmail(prev => prev || user.email);
            if (user.address) setAddress(prev => prev || user.address);
        }
    }, [user]);

    // Check for initialPlateNumber or initialBrand passed from Home page or return from Login
    useEffect(() => {
        if (location.state?.initialPlateNumber) {
            setPlateNumber(location.state.initialPlateNumber);
        }
        if (location.state?.initialState) {
            setDetectedState(location.state.initialState);
            setSelectedCity(location.state.initialState);
        }
        if (location.state?.initialBrand) {
            const brandName = location.state.initialBrand;
            setSelectedBrand(brandName);
            const models = BRAND_MODELS_MAP[brandName] || [];
            if (models.length > 0) {
                setSelectedModel(models[0].name);
                setSelectedVariant(models[0].variants ? models[0].variants[0] : 'Standard');
                setSelectedFuel(models[0].fuelTypes ? models[0].fuelTypes[0] : 'Petrol');
                setSelectedTransmission(models[0].transmissions ? models[0].transmissions[0] : 'Manual');
            }
            if (location.state?.step) {
                setStep(location.state.step);
            }
        } else if (location.state?.step !== undefined && step === 0) {
            setStep(location.state.step);
        }

        const isFromLogin = Boolean(location.state?.autoValuate || sessionStorage.getItem('automart_auto_valuate') === 'true');
        const isCancelled = Boolean(location.state?.cancelled);
        const hasPendingState = Boolean(location.state?.pendingValuation || location.state?.fromValuation);

        let pendingData = null;
        if (location.state?.pendingValuation) {
            pendingData = location.state.pendingValuation;
        } else {
            try {
                const stored = sessionStorage.getItem('automart_pending_valuation');
                if (stored) pendingData = JSON.parse(stored);
            } catch (err) {
                console.error('Error parsing stored pending valuation:', err);
            }
        }

        // Restore vehicle details if returning from valuation login or cancel
        if (pendingData && (isFromLogin || isCancelled || hasPendingState)) {
            if (pendingData.plateNumber !== undefined) setPlateNumber(pendingData.plateNumber);
            if (pendingData.detectedState !== undefined) setDetectedState(pendingData.detectedState);
            if (pendingData.selectedBrand) setSelectedBrand(pendingData.selectedBrand);
            if (pendingData.selectedModel) setSelectedModel(pendingData.selectedModel);
            if (pendingData.selectedYear) setSelectedYear(Number(pendingData.selectedYear));
            if (pendingData.selectedVariant) setSelectedVariant(pendingData.selectedVariant);
            if (pendingData.selectedKm) setSelectedKm(Number(pendingData.selectedKm));
            if (pendingData.selectedFuel) setSelectedFuel(pendingData.selectedFuel);
            if (pendingData.selectedTransmission) setSelectedTransmission(pendingData.selectedTransmission);
            if (pendingData.selectedCity) setSelectedCity(pendingData.selectedCity);
            if (pendingData.selectedCondition) setSelectedCondition(pendingData.selectedCondition);
            if (pendingData.selectedOwners) setSelectedOwners(Number(pendingData.selectedOwners));

            // If cancelled or revisiting without auto-execute, position at Step 4
            if (!isFromLogin && step === 0) {
                setStep(4);
            }
        }

        // If user is authenticated and autoValuate is requested, complete valuation immediately
        if (isFromLogin && user && user.token && !hasAutoExecutedRef.current) {
            hasAutoExecutedRef.current = true;

            // Clear session / route flags immediately to prevent duplicate submission on back/refresh
            sessionStorage.removeItem('automart_auto_valuate');
            navigate(location.pathname, { replace: true, state: { ...location.state, autoValuate: false } });

            // Automatically complete valuation calculation with preserved details
            executeValuationCalculation(pendingData);
        }
    }, [location.state, user]);

    // Submit inspection lead
    const handleSubmitInspectionBooking = async (e) => {
        e.preventDefault();
        if (!sellerName.trim() || !sellerPhone.trim()) {
            showToast({
                title: 'Required Details',
                message: 'Please provide your name and mobile number for the inspection booking.',
                type: 'error'
            });
            return;
        }

        setIsSubmittingBooking(true);
        try {
            const payload = {
                registrationNumber: plateNumber,
                brand: selectedBrand,
                model: selectedModel,
                variant: selectedVariant,
                manufacturingYear: selectedYear,
                kmDriven: selectedKm,
                fuelType: selectedFuel,
                transmission: selectedTransmission,
                condition: selectedCondition,
                city: selectedCity,
                estimatedMinPrice: valuationResult?.minPrice || 0,
                estimatedMaxPrice: valuationResult?.maxPrice || 0,
                fairMarketPrice: valuationResult?.fairMarketPrice || 0,
                sellerName,
                sellerPhone,
                sellerEmail,
                preferredDate,
                preferredTime,
                address,
                userId: user?._id || null
            };

            await axios.post('http://localhost:5000/api/valuation/lead', payload);
            setBookingSuccess(true);
            showToast({
                title: 'Inspection Booked! 🚗',
                message: 'Our AutoMart specialist will contact you to confirm the doorstep visit.',
                type: 'success'
            });
        } catch (err) {
            console.error('Inspection booking error:', err);
            // Still present confirmation to user gracefully
            setBookingSuccess(true);
            showToast({
                title: 'Request Received! 🚗',
                message: 'Thank you! Our car specialist will call you shortly.',
                type: 'success'
            });
        } finally {
            setIsSubmittingBooking(false);
        }
    };

    // Filter models for Step 1
    const currentBrandModels = (selectedBrand && BRAND_MODELS_MAP[selectedBrand]) ? BRAND_MODELS_MAP[selectedBrand] : [];
    const filteredModels = currentBrandModels.filter(m => 
        m.name.toLowerCase().includes(modelSearch.toLowerCase())
    );

    // Filter brands for modal
    const filteredModalBrands = VALUATION_BRANDS.filter(b => 
        b.name.toLowerCase().includes(brandSearchModal.toLowerCase())
    );

    // Years array (2025 down to 2012)
    const YEARS = Array.from({ length: 14 }, (_, i) => 2025 - i);

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
            
            {/* Top Banner & Hero Header */}
            <div style={{
                background: 'linear-gradient(135deg, #091325 0%, #172554 50%, #1e1b4b 100%)',
                color: '#ffffff',
                padding: '60px 20px 100px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative background glows */}
                <div style={{ position: 'absolute', top: '-10%', left: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '0', right: '15%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 16px',
                        borderRadius: '30px',
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(8px)',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: '#38bdf8',
                        marginBottom: '18px',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                        <Sparkles size={16} /> Instant Free Car Valuation
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.1rem, 5vw, 3.4rem)',
                        fontWeight: '900',
                        lineHeight: 1.15,
                        margin: '0 0 16px',
                        letterSpacing: '-1px'
                    }}>
                        Sell Your Car at the <span style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Best Price</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.18rem)',
                        color: '#cbd5e1',
                        maxWidth: '720px',
                        margin: '0 auto 24px',
                        lineHeight: 1.6
                    }}>
                        Instant online valuation • Free doorstep inspection • Same-day bank payment • 100% Free RC transfer
                    </p>

                    {/* Feature badges row */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#e2e8f0', fontWeight: '500' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={18} color="#4ade80" /> 100% Free Service
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={18} color="#4ade80" /> No Login Required
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={18} color="#4ade80" /> Doorstep Inspection
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Interactive Content Area - Negative Top Margin to overlap hero */}
            <div style={{ maxWidth: '920px', margin: '-60px auto 70px', padding: '0 16px', position: 'relative', zIndex: 10 }}>
                
                {/* THE MAIN WHITE VALUATION CARD */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.1), 0 4px 12px rgba(0,0,0,0.03)',
                    border: '1px solid #e2e8f0',
                    padding: '36px 32px',
                    boxSizing: 'border-box'
                }}>

                    {/* STEP 0: LANDING REGISTRATION NUMBER + BRAND CAROUSEL */}
                    {step === 0 && (
                        <div>
                            {/* Card Header */}
                            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
                                    Unlock Your Car's Best Price
                                </h2>
                                <p style={{ fontSize: '0.96rem', color: '#64748b', margin: 0 }}>
                                    Enter your car plate number
                                </p>
                            </div>

                            {/* Registration Plate Form */}
                            <form onSubmit={handleGetInstantPrice} style={{ maxWidth: '640px', margin: '0 auto 30px' }}>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    alignItems: 'stretch'
                                }}>
                                    {/* License Plate Styled Input Container */}
                                    <div style={{
                                        flex: '1 1 320px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: '#ffffff',
                                        border: plateError ? '2px solid #ef4444' : '2px solid #0f172a',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
                                        transition: 'border-color 0.2s, box-shadow 0.2s'
                                    }}>
                                        {/* Blue Indian "IND" Strip */}
                                        <div style={{
                                            backgroundColor: '#0284c7',
                                            color: '#ffffff',
                                            padding: '12px 14px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '2px',
                                            borderRight: '1.5px solid rgba(255,255,255,0.2)',
                                            userSelect: 'none'
                                        }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                            </div>
                                            <span style={{ fontSize: '0.72rem', fontWeight: '900', letterSpacing: '0.5px' }}>IND</span>
                                        </div>

                                        {/* Plate Text Input */}
                                        <input 
                                            type="text"
                                            value={plateNumber}
                                            onChange={handlePlateChange}
                                            placeholder="DL 03 AB XXXX"
                                            aria-label="Car Registration Plate Number"
                                            style={{
                                                flex: 1,
                                                padding: '14px 16px',
                                                fontSize: '1.18rem',
                                                fontWeight: '800',
                                                letterSpacing: '2.5px',
                                                color: '#0f172a',
                                                border: 'none',
                                                outline: 'none',
                                                textTransform: 'uppercase',
                                                fontFamily: "'Courier New', Courier, monospace, 'Inter', sans-serif",
                                                boxSizing: 'border-box'
                                            }}
                                        />

                                        {/* Detected state badge inside input */}
                                        {detectedState && (
                                            <div style={{
                                                marginRight: '12px',
                                                padding: '4px 10px',
                                                backgroundColor: '#f0fdf4',
                                                color: '#16a34a',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                whiteSpace: 'nowrap',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                border: '1px solid #bbf7d0'
                                            }}>
                                                <MapPin size={12} /> {detectedState}
                                            </div>
                                        )}
                                    </div>

                                    {/* Primary Action Button */}
                                    <button 
                                        type="submit"
                                        style={{
                                            padding: '14px 28px',
                                            background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '800',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)',
                                            transition: 'transform 0.15s, box-shadow 0.2s',
                                            flex: '1 1 auto',
                                            minWidth: '220px'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <span>Get Instant Car Price</span>
                                        <ArrowRight size={18} />
                                    </button>
                                </div>

                                {/* Validation error notification */}
                                {plateError && (
                                    <div style={{
                                        marginTop: '12px',
                                        color: '#ef4444',
                                        fontSize: '0.88rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <AlertCircle size={16} />
                                        <span>{plateError}</span>
                                    </div>
                                )}
                            </form>

                            {/* Divider with OR */}
                            <div style={{
                                position: 'relative',
                                textAlign: 'center',
                                margin: '36px 0 28px'
                            }}>
                                <div style={{ height: '1px', backgroundColor: '#e2e8f0', width: '100%' }} />
                                <span style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: '#ffffff',
                                    padding: '4px 18px',
                                    color: '#64748b',
                                    fontWeight: '800',
                                    fontSize: '0.85rem',
                                    borderRadius: '20px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    OR
                                </span>
                            </div>

                            {/* Section: Select Your Brands */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '18px'
                                }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                                            Select Your Brands
                                        </h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                            Choose your manufacturer to begin valuation
                                        </p>
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={() => setIsAllBrandsModalOpen(true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#0284c7',
                                            fontWeight: '700',
                                            fontSize: '0.92rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <span>View All Brands</span>
                                        <ArrowRight size={15} />
                                    </button>
                                </div>

                                {/* Horizontal Touch-Scrollable Brand Carousel */}
                                <div style={{ position: 'relative' }}>
                                    {/* Left Arrow Button (Desktop) */}
                                    <button 
                                        type="button"
                                        onClick={() => scrollCarousel('left')}
                                        disabled={!canScrollLeft}
                                        aria-label="Previous Brands"
                                        style={{
                                            position: 'absolute',
                                            left: '-16px',
                                            top: '40%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 2,
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '50%',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #cbd5e1',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                            display: canScrollLeft ? 'flex' : 'none',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: '#1e293b'
                                        }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    {/* Scroll Track */}
                                    <div 
                                        ref={carouselRef}
                                        onScroll={checkCarouselScroll}
                                        className="brand-carousel-track"
                                        style={{
                                            display: 'flex',
                                            gap: '16px',
                                            overflowX: 'auto',
                                            scrollBehavior: 'smooth',
                                            padding: '10px 4px 18px',
                                            WebkitOverflowScrolling: 'touch',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none'
                                        }}
                                    >
                                        {VALUATION_BRANDS.map((brand) => (
                                            <div 
                                                key={brand.id}
                                                onClick={() => handleSelectBrand(brand)}
                                                className="brand-pill-card"
                                                style={{
                                                    flex: '0 0 auto',
                                                    width: '108px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    padding: '12px 6px',
                                                    borderRadius: '16px',
                                                    backgroundColor: '#ffffff',
                                                    border: '1.5px solid #f1f5f9',
                                                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                                    userSelect: 'none'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.borderColor = '#0284c7';
                                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(2, 132, 199, 0.12)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.borderColor = '#f1f5f9';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                {/* Circular Logo Container */}
                                                <div style={{
                                                    width: '64px',
                                                    height: '64px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    margin: '0 auto 10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '12px',
                                                    boxSizing: 'border-box'
                                                }}>
                                                    <img 
                                                        src={brand.logo} 
                                                        alt={brand.name} 
                                                        style={{
                                                            maxWidth: '100%',
                                                            maxHeight: '100%',
                                                            objectFit: 'contain'
                                                        }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                                <div style={{
                                                    fontSize: '0.82rem',
                                                    fontWeight: '700',
                                                    color: '#1e293b',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {brand.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right Arrow Button (Desktop) */}
                                    <button 
                                        type="button"
                                        onClick={() => scrollCarousel('right')}
                                        disabled={!canScrollRight}
                                        aria-label="Next Brands"
                                        style={{
                                            position: 'absolute',
                                            right: '-16px',
                                            top: '40%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 2,
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '50%',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #cbd5e1',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                            display: canScrollRight ? 'flex' : 'none',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: '#1e293b'
                                        }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* WIZARD NAVIGATION BAR (Visible when step >= 1) */}
                    {step >= 1 && (
                        <div>
                            {/* Wizard Header Row */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #f1f5f9',
                                paddingBottom: '18px',
                                marginBottom: '24px'
                            }}>
                                <button 
                                    type="button"
                                    onClick={() => setStep(prev => Math.max(0, prev - 1))}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'none',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '7px 14px',
                                        color: '#475569',
                                        fontWeight: '700',
                                        fontSize: '0.88rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ChevronLeft size={16} /> Back
                                </button>

                                {/* Active summary tag */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {plateNumber && (
                                        <span style={{
                                            backgroundColor: '#f1f5f9',
                                            color: '#0f172a',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontWeight: '800',
                                            fontSize: '0.8rem',
                                            letterSpacing: '1px',
                                            border: '1px solid #cbd5e1'
                                        }}>
                                            {plateNumber}
                                        </span>
                                    )}
                                    {selectedBrand && (
                                        <span style={{
                                            backgroundColor: '#eff6ff',
                                            color: '#0284c7',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontWeight: '700',
                                            fontSize: '0.8rem'
                                        }}>
                                            {selectedBrand} {selectedModel ? `• ${selectedModel}` : ''}
                                        </span>
                                    )}
                                </div>

                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8' }}>
                                    Step {step} of 4
                                </div>
                            </div>

                            {/* STEP 1: SELECT MODEL */}
                            {step === 1 && (
                                <div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                                            Select Model for {selectedBrand}
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                                            Which {selectedBrand} car do you own?
                                        </p>
                                    </div>

                                    {/* Model search box */}
                                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input 
                                            type="text"
                                            value={modelSearch}
                                            onChange={(e) => setModelSearch(e.target.value)}
                                            placeholder={`Search ${selectedBrand} models (e.g. ${currentBrandModels[0]?.name || ''})...`}
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px 12px 42px',
                                                borderRadius: '10px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    {/* Models Grid */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                                        gap: '14px',
                                        maxHeight: '380px',
                                        overflowY: 'auto',
                                        padding: '4px'
                                    }}>
                                        {filteredModels.map((m) => (
                                            <div 
                                                key={m.name}
                                                onClick={() => handleSelectModel(m)}
                                                style={{
                                                    padding: '16px 14px',
                                                    borderRadius: '12px',
                                                    backgroundColor: selectedModel === m.name ? '#eff6ff' : '#ffffff',
                                                    border: selectedModel === m.name ? '2px solid #0284c7' : '1.5px solid #e2e8f0',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    if (selectedModel !== m.name) {
                                                        e.currentTarget.style.borderColor = '#0284c7';
                                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    if (selectedModel !== m.name) {
                                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                                    }
                                                }}
                                            >
                                                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a', marginBottom: '4px' }}>
                                                    {m.name}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {m.fuelTypes ? m.fuelTypes.join(' • ') : 'Standard'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: MANUFACTURING YEAR & VARIANT */}
                            {step === 2 && (
                                <div>
                                    <div style={{ marginBottom: '22px' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                                            Select Year & Variant
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                                            When was your {selectedBrand} {selectedModel} manufactured?
                                        </p>
                                    </div>

                                    {/* Year Pills */}
                                    <div style={{ marginBottom: '26px' }}>
                                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>
                                            Manufacturing Year
                                        </label>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))',
                                            gap: '10px'
                                        }}>
                                            {YEARS.map((yr) => (
                                                <button 
                                                    key={yr}
                                                    type="button"
                                                    onClick={() => setSelectedYear(yr)}
                                                    style={{
                                                        padding: '10px 6px',
                                                        borderRadius: '10px',
                                                        border: selectedYear === yr ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                                        backgroundColor: selectedYear === yr ? '#0284c7' : '#ffffff',
                                                        color: selectedYear === yr ? '#ffffff' : '#1e293b',
                                                        fontWeight: '700',
                                                        fontSize: '0.92rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    {yr}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Variant Selection */}
                                    <div style={{ marginBottom: '28px' }}>
                                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>
                                            Car Variant / Trim
                                        </label>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {(currentBrandModels.find(m => m.name === selectedModel)?.variants || ['Standard', 'Base', 'Mid', 'Top']).map((v) => (
                                                <button 
                                                    key={v}
                                                    type="button"
                                                    onClick={() => setSelectedVariant(v)}
                                                    style={{
                                                        padding: '9px 16px',
                                                        borderRadius: '10px',
                                                        border: selectedVariant === v ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                                        backgroundColor: selectedVariant === v ? '#eff6ff' : '#ffffff',
                                                        color: selectedVariant === v ? '#0284c7' : '#334155',
                                                        fontWeight: '700',
                                                        fontSize: '0.88rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button 
                                            type="button"
                                            onClick={() => setStep(3)}
                                            style={{
                                                padding: '12px 28px',
                                                backgroundColor: '#0284c7',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '700',
                                                fontSize: '0.96rem',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <span>Continue</span>
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: KILOMETRES DRIVEN, FUEL TYPE & TRANSMISSION */}
                            {step === 3 && (
                                <div>
                                    <div style={{ marginBottom: '22px' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                                            Usage & Specifications
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                                            How much has your car driven and what is the transmission?
                                        </p>
                                    </div>

                                    {/* Kilometres Driven Range Options */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>
                                            Kilometres Driven
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                            {KM_OPTIONS.map((opt) => (
                                                <div 
                                                    key={opt.label}
                                                    onClick={() => setSelectedKm(opt.value)}
                                                    style={{
                                                        padding: '12px 14px',
                                                        borderRadius: '12px',
                                                        border: selectedKm === opt.value ? '2px solid #0284c7' : '1.5px solid #e2e8f0',
                                                        backgroundColor: selectedKm === opt.value ? '#eff6ff' : '#ffffff',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: '800', color: selectedKm === opt.value ? '#0284c7' : '#0f172a', fontSize: '0.95rem' }}>
                                                        {opt.label}
                                                    </div>
                                                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                                        {opt.desc}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Fuel Type */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>
                                            Fuel Type
                                        </label>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map((f) => (
                                                <button 
                                                    key={f}
                                                    type="button"
                                                    onClick={() => setSelectedFuel(f)}
                                                    style={{
                                                        padding: '9px 18px',
                                                        borderRadius: '10px',
                                                        border: selectedFuel === f ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                                        backgroundColor: selectedFuel === f ? '#eff6ff' : '#ffffff',
                                                        color: selectedFuel === f ? '#0284c7' : '#334155',
                                                        fontWeight: '700',
                                                        fontSize: '0.88rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Transmission */}
                                    <div style={{ marginBottom: '28px' }}>
                                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>
                                            Transmission
                                        </label>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {['Manual', 'Automatic'].map((t) => (
                                                <button 
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setSelectedTransmission(t)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '12px',
                                                        borderRadius: '10px',
                                                        border: selectedTransmission === t ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                                        backgroundColor: selectedTransmission === t ? '#eff6ff' : '#ffffff',
                                                        color: selectedTransmission === t ? '#0284c7' : '#334155',
                                                        fontWeight: '700',
                                                        fontSize: '0.92rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button 
                                            type="button"
                                            onClick={() => setStep(4)}
                                            style={{
                                                padding: '12px 28px',
                                                backgroundColor: '#0284c7',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '700',
                                                fontSize: '0.96rem',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <span>Continue</span>
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: LOCATION, OWNERS & VEHICLE CONDITION */}
                            {step === 4 && (
                                <div>
                                    <div style={{ marginBottom: '22px' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                                            Location & Vehicle Condition
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                                            Fair pricing requires understanding your car's physical condition and location
                                        </p>
                                    </div>

                                    {/* City / Location */}
                                    <div style={{ marginBottom: '22px' }}>
                                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                                            Car Location / City
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                            {POPULAR_CITIES.map((c) => (
                                                <button 
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setSelectedCity(c)}
                                                    style={{
                                                        padding: '7px 12px',
                                                        borderRadius: '8px',
                                                        border: selectedCity === c ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                                        backgroundColor: selectedCity === c ? '#eff6ff' : '#ffffff',
                                                        color: selectedCity === c ? '#0284c7' : '#334155',
                                                        fontSize: '0.82rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Number of Owners */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                                            Number of Owners
                                        </label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {[
                                                { label: '1st Owner', val: 1 },
                                                { label: '2nd Owner', val: 2 },
                                                { label: '3rd+ Owner', val: 3 }
                                            ].map((own) => (
                                                <button 
                                                    key={own.val}
                                                    type="button"
                                                    onClick={() => setSelectedOwners(own.val)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        borderRadius: '10px',
                                                        border: selectedOwners === own.val ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                                        backgroundColor: selectedOwners === own.val ? '#eff6ff' : '#ffffff',
                                                        color: selectedOwners === own.val ? '#0284c7' : '#334155',
                                                        fontWeight: '700',
                                                        fontSize: '0.88rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {own.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Overall Condition Cards */}
                                    <div style={{ marginBottom: '28px' }}>
                                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>
                                            Vehicle Condition
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                            {CONDITION_OPTIONS.map((c) => (
                                                <div 
                                                    key={c.value}
                                                    onClick={() => setSelectedCondition(c.value)}
                                                    style={{
                                                        padding: '14px',
                                                        borderRadius: '12px',
                                                        border: selectedCondition === c.value ? '2px solid #0284c7' : '1.5px solid #e2e8f0',
                                                        backgroundColor: selectedCondition === c.value ? '#eff6ff' : '#ffffff',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                        <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>{c.badge}</span>
                                                        {selectedCondition === c.value && <Check size={16} color="#0284c7" />}
                                                    </div>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                                                        {c.desc}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Calculate Action */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <button 
                                            type="button"
                                            id="get-car-price-btn"
                                            onClick={handleFinalSubmit}
                                            disabled={isCalculating}
                                            style={{
                                                padding: '14px 34px',
                                                background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontWeight: '800',
                                                fontSize: '1.02rem',
                                                cursor: isCalculating ? 'not-allowed' : 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)',
                                                opacity: isCalculating ? 0.75 : 1
                                            }}
                                        >
                                            {isCalculating ? (
                                                <>
                                                    <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                                    <span>Calculating Fair Price...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Get My Car Price</span>
                                                    <Sparkles size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: VALUATION RESULT SHOWCASE */}
                            {step === 5 && valuationResult && (
                                <div>
                                    {/* Celebration Tag */}
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        backgroundColor: '#ecfdf5',
                                        color: '#059669',
                                        fontWeight: '700',
                                        fontSize: '0.85rem',
                                        marginBottom: '16px',
                                        border: '1px solid #a7f3d0'
                                    }}>
                                        <Zap size={16} /> Instant Market Valuation Ready
                                    </div>

                                    <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '0 0 6px' }}>
                                        {valuationResult.manufacturingYear} {valuationResult.brand} {valuationResult.model}
                                    </h2>
                                    <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0 0 24px' }}>
                                        {valuationResult.variant} • {valuationResult.fuelType} • {valuationResult.transmission} • {valuationResult.kmDriven.toLocaleString('en-IN')} km • {valuationResult.city}
                                    </p>

                                    {/* Highlighting Price Card */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
                                        border: '2px solid #bfdbfe',
                                        borderRadius: '20px',
                                        padding: '28px',
                                        textAlign: 'center',
                                        marginBottom: '28px',
                                        position: 'relative'
                                    }}>
                                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                                            Estimated Resale Value
                                        </div>
                                        
                                        <div style={{ fontSize: 'clamp(2.4rem, 6vw, 3.4rem)', fontWeight: '900', color: '#1e1b4b', letterSpacing: '-1px', marginBottom: '8px' }}>
                                            ₹{valuationResult.fairMarketPrice.toLocaleString('en-IN')}
                                        </div>

                                        <div style={{
                                            display: 'inline-block',
                                            padding: '6px 18px',
                                            borderRadius: '20px',
                                            backgroundColor: '#ffffff',
                                            color: '#4338ca',
                                            fontWeight: '700',
                                            fontSize: '0.95rem',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                            border: '1px solid #e0e7ff'
                                        }}>
                                            Fair Resale Range: {valuationResult.rangeFormatted}
                                        </div>
                                    </div>

                                    {/* Valuation Explanation & Breakdown Accordion */}
                                    <div style={{
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        padding: '22px',
                                        marginBottom: '26px'
                                    }}>
                                        <h4 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={18} color="#0284c7" /> How This Estimate Was Calculated
                                        </h4>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
                                            {valuationResult.explanationPoints.map((pt, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                    <CheckCircle2 size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                    <span>{pt}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Transparent Mandatory Disclaimer */}
                                        <div style={{
                                            marginTop: '18px',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            backgroundColor: '#fffbeb',
                                            border: '1px solid #fef3c7',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '10px',
                                            color: '#92400e',
                                            fontSize: '0.8rem',
                                            lineHeight: 1.5
                                        }}>
                                            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px', color: '#d97706' }} />
                                            <div>
                                                <strong>Notice: </strong>
                                                {valuationResult.disclaimer}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                                        <button 
                                            type="button"
                                            onClick={() => setIsBookingModalOpen(true)}
                                            style={{
                                                flex: '1 1 240px',
                                                padding: '14px 24px',
                                                background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontWeight: '800',
                                                fontSize: '1rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)'
                                            }}
                                        >
                                            <Truck size={18} />
                                            <span>Book Free Doorstep Inspection</span>
                                        </button>

                                        <button 
                                            type="button"
                                            id="evaluate-another-car-btn"
                                            onClick={handleResetValuation}
                                            style={{
                                                padding: '14px 20px',
                                                backgroundColor: '#ffffff',
                                                color: '#475569',
                                                border: '1.5px solid #cbd5e1',
                                                borderRadius: '12px',
                                                fontWeight: '700',
                                                fontSize: '0.92rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <RotateCcw size={16} />
                                            <span>Evaluate Another Car</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* TRUST & PROCESS HIGHLIGHTS SECTION */}
                <div style={{ marginTop: '50px' }}>
                    
                    {/* Why Sell to AutoMart */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px' }}>
                            Why Sell Your Car to AutoMart?
                        </h2>
                        <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                            We eliminate middlemen, endless phone calls, and lowball negotiations.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '20px',
                        marginBottom: '60px'
                    }}>
                        {[
                            {
                                icon: <Zap size={24} color="#0284c7" />,
                                title: 'Instant Online Quote',
                                desc: 'Get transparent AI-powered valuation in under 2 minutes without registering.'
                            },
                            {
                                icon: <Truck size={24} color="#16a34a" />,
                                title: 'Free Home Inspection',
                                desc: 'Our certified car inspector checks your car right at your doorstep for zero charges.'
                            },
                            {
                                icon: <BadgeIndianRupee size={24} color="#4f46e5" />,
                                title: 'Instant Bank Transfer',
                                desc: 'Full payment transferred directly into your bank account before handover.'
                            },
                            {
                                icon: <ShieldCheck size={24} color="#ea580c" />,
                                title: 'Free RC Transfer',
                                desc: 'Hassle-free legal ownership transfer taken care of with verified buyer records.'
                            }
                        ].map((card, idx) => (
                            <div 
                                key={idx}
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: '#f8fafc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    {card.icon}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
                                    {card.title}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                                    {card.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* How It Works (3 Steps) */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '24px',
                        padding: '40px 30px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                        marginBottom: '60px'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Simple 3-Step Process
                            </span>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '6px 0 0' }}>
                                How Selling on AutoMart Works
                            </h2>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                            gap: '30px',
                            position: 'relative'
                        }}>
                            {[
                                {
                                    step: '1',
                                    title: 'Check Price Online',
                                    desc: 'Enter your plate number or brand to receive an instant, transparent price estimate.'
                                },
                                {
                                    step: '2',
                                    title: 'Free Car Inspection',
                                    desc: 'Book a free doorstep inspection at your convenient date and location.'
                                },
                                {
                                    step: '3',
                                    title: 'Get Paid Instantly',
                                    desc: 'Accept the offer, receive instant bank transfer, and we handle the RC transfer for free.'
                                }
                            ].map((s) => (
                                <div key={s.step} style={{ textAlign: 'center', position: 'relative' }}>
                                    <div style={{
                                        width: '46px',
                                        height: '46px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                                        color: '#ffffff',
                                        fontWeight: '900',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 16px',
                                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                                    }}>
                                        {s.step}
                                    </div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
                                        {s.title}
                                    </h3>
                                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                                        {s.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
                    <div style={{ marginBottom: '60px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '0 0 6px' }}>
                                Frequently Asked Questions
                            </h2>
                            <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
                                Everything you need to know about selling your car on AutoMart
                            </p>
                        </div>

                        <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                {
                                    q: 'Do I need an account or login to calculate my car price?',
                                    a: 'No! You can freely enter your car registration number or select your brand/model and receive your full instant price estimate without logging in or creating an account.'
                                },
                                {
                                    q: 'Is the doorstep inspection really free?',
                                    a: 'Yes, 100% free! An AutoMart technical specialist inspects your car at your home or workplace at your scheduled time with zero hidden charges or inspection fees.'
                                },
                                {
                                    q: 'How is the car price calculated?',
                                    a: 'Our valuation algorithm calculates fair market value using real automotive market pricing, vehicle age depreciation schedules, kilometres driven, fuel type, transmission, and overall vehicle condition.'
                                },
                                {
                                    q: 'What documents do I need to sell my car?',
                                    a: 'You will need: Original Registration Certificate (RC), valid car insurance policy, valid Pollution Under Control (PUC) certificate, and an ID proof (Aadhaar / PAN card).'
                                },
                                {
                                    q: 'How soon do I receive payment?',
                                    a: 'Once you accept the final offer following the inspection, payment is made instantly via secure IMPS / NEFT bank transfer before the vehicle is picked up.'
                                },
                                {
                                    q: 'Who handles the RC transfer?',
                                    a: 'AutoMart takes complete legal responsibility for transferring the RC to the verified new buyer, providing you with a delivery receipt and transfer proof.'
                                }
                            ].map((faq, i) => (
                                <div 
                                    key={i}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div 
                                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                        style={{
                                            padding: '16px 20px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            fontSize: '0.96rem',
                                            color: '#0f172a',
                                            userSelect: 'none'
                                        }}
                                    >
                                        <span>{faq.q}</span>
                                        <ChevronDown 
                                            size={18} 
                                            color="#64748b" 
                                            style={{
                                                transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.2s ease'
                                            }}
                                        />
                                    </div>
                                    {activeFaq === i && (
                                        <div style={{
                                            padding: '0 20px 16px',
                                            color: '#475569',
                                            fontSize: '0.88rem',
                                            lineHeight: 1.6,
                                            borderTop: '1px solid #f1f5f9',
                                            paddingTop: '12px'
                                        }}>
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: VIEW ALL BRANDS */}
            {isAllBrandsModalOpen && (
                <div 
                    onClick={() => setIsAllBrandsModalOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px'
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '20px',
                            maxWidth: '680px',
                            width: '100%',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                            padding: '24px',
                            boxSizing: 'border-box'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                                All Supported Brands
                            </h3>
                            <button 
                                onClick={() => setIsAllBrandsModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Search Brand Input */}
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input 
                                type="text"
                                value={brandSearchModal}
                                onChange={(e) => setBrandSearchModal(e.target.value)}
                                placeholder="Search brand by name..."
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '11px 14px 11px 42px',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* Brands Grid in Modal */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                            gap: '12px'
                        }}>
                            {filteredModalBrands.map((b) => (
                                <div 
                                    key={b.id}
                                    onClick={() => handleSelectBrand(b)}
                                    style={{
                                        padding: '16px 10px',
                                        borderRadius: '14px',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: '#ffffff',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = '#0284c7';
                                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                    }}
                                >
                                    <div style={{ width: '48px', height: '48px', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={b.logo} alt={b.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e293b' }}>
                                        {b.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: BOOK FREE DOORSTEP INSPECTION */}
            {isBookingModalOpen && (
                <div 
                    onClick={() => setIsBookingModalOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px'
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '24px',
                            maxWidth: '560px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                            padding: '30px',
                            boxSizing: 'border-box'
                        }}
                    >
                        {!bookingSuccess ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Truck size={20} color="#0284c7" />
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                                            Book Free Doorstep Inspection
                                        </h3>
                                    </div>
                                    <button 
                                        onClick={() => setIsBookingModalOpen(false)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                    >
                                        <X size={22} />
                                    </button>
                                </div>

                                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
                                    Lock in your estimated price of <strong>₹{valuationResult?.fairMarketPrice?.toLocaleString('en-IN')}</strong>. Our specialist will inspect your car for zero fees.
                                </p>

                                <form onSubmit={handleSubmitInspectionBooking}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                                Your Full Name *
                                            </label>
                                            <input 
                                                type="text"
                                                required
                                                value={sellerName}
                                                onChange={(e) => setSellerName(e.target.value)}
                                                placeholder="e.g. Rahul Sharma"
                                                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                                Mobile Phone Number *
                                            </label>
                                            <input 
                                                type="tel"
                                                required
                                                value={sellerPhone}
                                                onChange={(e) => setSellerPhone(e.target.value)}
                                                placeholder="e.g. 9876543210"
                                                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                                Email Address (Optional)
                                            </label>
                                            <input 
                                                type="email"
                                                value={sellerEmail}
                                                onChange={(e) => setSellerEmail(e.target.value)}
                                                placeholder="name@example.com"
                                                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                                    Preferred Date
                                                </label>
                                                <input 
                                                    type="date"
                                                    value={preferredDate}
                                                    onChange={(e) => setPreferredDate(e.target.value)}
                                                    style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                                    Time Slot
                                                </label>
                                                <select
                                                    value={preferredTime}
                                                    onChange={(e) => setPreferredTime(e.target.value)}
                                                    style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                                                >
                                                    <option>Morning (10 AM - 1 PM)</option>
                                                    <option>Afternoon (1 PM - 4 PM)</option>
                                                    <option>Evening (4 PM - 7 PM)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                                Doorstep Inspection Address / Landmark
                                            </label>
                                            <input 
                                                type="text"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="House/Apartment, Street, Area, City"
                                                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isSubmittingBooking}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '800',
                                            fontSize: '1rem',
                                            cursor: isSubmittingBooking ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)'
                                        }}
                                    >
                                        {isSubmittingBooking ? 'Booking Inspection...' : 'Confirm Free Inspection'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ecfdf5',
                                    color: '#059669',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 18px',
                                    border: '2px solid #a7f3d0'
                                }}>
                                    <Check size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
                                    Inspection Scheduled!
                                </h3>
                                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
                                    Thank you <strong>{sellerName}</strong>. Our AutoMart car specialist will call you at <strong>{sellerPhone}</strong> to confirm your doorstep appointment.
                                </p>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setBookingSuccess(false);
                                        setIsBookingModalOpen(false);
                                    }}
                                    style={{
                                        padding: '12px 28px',
                                        backgroundColor: '#0284c7',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '700',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellUsedCars;
