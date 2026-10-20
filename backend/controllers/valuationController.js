const Car = require('../models/Car');
const ValuationLead = require('../models/ValuationLead');

// Comprehensive automotive catalog for all 16 supported brands
const VALUATION_CATALOG = {
    'Maruti Suzuki': {
        popularModels: [
            { name: 'Swift', basePrice: 650000, bodyType: 'Hatchback', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['LXI', 'VXI', 'ZXI', 'ZXI+'] },
            { name: 'Baleno', basePrice: 720000, bodyType: 'Hatchback', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['Sigma', 'Delta', 'Zeta', 'Alpha'] },
            { name: 'Brezza', basePrice: 920000, bodyType: 'Compact SUV', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['LXI', 'VXI', 'ZXI', 'ZXI+'] },
            { name: 'Ertiga', basePrice: 980000, bodyType: 'MPV', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['LXI', 'VXI', 'ZXI', 'ZXI+'] },
            { name: 'Dzire', basePrice: 710000, bodyType: 'Sedan', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['LXI', 'VXI', 'ZXI', 'ZXI+'] },
            { name: 'Wagon R', basePrice: 580000, bodyType: 'Hatchback', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['LXI', 'VXI', 'ZXI'] },
            { name: 'Grand Vitara', basePrice: 1250000, bodyType: 'SUV', fuelTypes: ['Petrol', 'Hybrid', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['Sigma', 'Delta', 'Zeta', 'Alpha'] },
            { name: 'Fronx', basePrice: 850000, bodyType: 'Crossover', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['Sigma', 'Delta', 'Zeta', 'Alpha'] },
            { name: 'Ciaz', basePrice: 990000, bodyType: 'Sedan', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'], variants: ['Sigma', 'Delta', 'Zeta', 'Alpha'] },
            { name: 'Jimny', basePrice: 1350000, bodyType: 'Off-Road SUV', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'], variants: ['Zeta', 'Alpha'] },
            { name: 'Alto K10', basePrice: 420000, bodyType: 'Hatchback', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['Std', 'LXI', 'VXI', 'VXI+'] }
        ]
    },
    'Hyundai': {
        popularModels: [
            { name: 'Creta', basePrice: 1220000, bodyType: 'SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['E', 'EX', 'S', 'SX', 'SX(O)'] },
            { name: 'Venue', basePrice: 850000, bodyType: 'Compact SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['E', 'S', 'SX', 'SX(O)'] },
            { name: 'i20', basePrice: 780000, bodyType: 'Hatchback', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'], variants: ['Era', 'Magna', 'Sportz', 'Asta', 'Asta(O)'] },
            { name: 'Verna', basePrice: 1150000, bodyType: 'Sedan', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'], variants: ['EX', 'S', 'SX', 'SX(O)'] },
            { name: 'Grand i10 Nios', basePrice: 620000, bodyType: 'Hatchback', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['Era', 'Magna', 'Sportz', 'Asta'] },
            { name: 'Exter', basePrice: 660000, bodyType: 'Micro SUV', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['EX', 'S', 'SX', 'SX(O)'] },
            { name: 'Tucson', basePrice: 3000000, bodyType: 'Premium SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'], variants: ['Platinum', 'Signature'] },
            { name: 'Alcazar', basePrice: 1750000, bodyType: '7-Seater SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['Prestige', 'Platinum', 'Signature'] },
            { name: 'Ioniq 5', basePrice: 4600000, bodyType: 'Electric SUV', fuelTypes: ['Electric'], transmissions: ['Automatic'], variants: ['Long Range RWD'] }
        ]
    },
    'Tata': {
        popularModels: [
            { name: 'Nexon', basePrice: 880000, bodyType: 'Compact SUV', fuelTypes: ['Petrol', 'Diesel', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['Smart', 'Pure', 'Creative', 'Fearless'] },
            { name: 'Punch', basePrice: 650000, bodyType: 'Micro SUV', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['Pure', 'Adventure', 'Accomplished', 'Creative'] },
            { name: 'Harrier', basePrice: 1650000, bodyType: 'Midsize SUV', fuelTypes: ['Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['Smart', 'Pure', 'Adventure', 'Fearless'] },
            { name: 'Safari', basePrice: 1750000, bodyType: '7-Seater SUV', fuelTypes: ['Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['Smart', 'Pure', 'Adventure', 'Accomplished'] },
            { name: 'Altroz', basePrice: 710000, bodyType: 'Hatchback', fuelTypes: ['Petrol', 'Diesel', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['XE', 'XM', 'XT', 'XZ', 'XZ+'] },
            { name: 'Tiago', basePrice: 590000, bodyType: 'Hatchback', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['XE', 'XM', 'XT', 'XZ', 'XZ+'] },
            { name: 'Tigor', basePrice: 680000, bodyType: 'Sedan', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['XE', 'XM', 'XZ', 'XZ+'] },
            { name: 'Nexon EV', basePrice: 1550000, bodyType: 'Electric SUV', fuelTypes: ['Electric'], transmissions: ['Automatic'], variants: ['Creative', 'Fearless', 'Empowered'] },
            { name: 'Curvv', basePrice: 1050000, bodyType: 'Coupe SUV', fuelTypes: ['Petrol', 'Diesel', 'Electric'], transmissions: ['Manual', 'Automatic'], variants: ['Smart', 'Pure', 'Creative', 'Accomplished'] }
        ]
    },
    'Mahindra': {
        popularModels: [
            { name: 'Thar', basePrice: 1450000, bodyType: 'Off-Road SUV', fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Manual', 'Automatic'], variants: ['AX Opt', 'LX 4x2', 'LX 4x4', 'Earth Edition'] },
            { name: 'XUV700', basePrice: 1550000, bodyType: 'Premium SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['MX', 'AX3', 'AX5', 'AX7', 'AX7 Luxury'] },
            { name: 'Scorpio-N', basePrice: 1400000, bodyType: 'Rugged SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['Z2', 'Z4', 'Z6', 'Z8', 'Z8L'] },
            { name: 'Scorpio Classic', basePrice: 1350000, bodyType: 'SUV', fuelTypes: ['Diesel'], transmissions: ['Manual'], variants: ['S', 'S11'] },
            { name: 'XUV 3XO', basePrice: 820000, bodyType: 'Compact SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['MX1', 'MX2', 'AX5', 'AX7'] },
            { name: 'Bolero', basePrice: 990000, bodyType: 'Utility SUV', fuelTypes: ['Diesel'], transmissions: ['Manual'], variants: ['B4', 'B6', 'B6 Opt'] },
            { name: 'Bolero Neo', basePrice: 1020000, bodyType: 'Compact SUV', fuelTypes: ['Diesel'], transmissions: ['Manual'], variants: ['N4', 'N8', 'N10', 'N10(O)'] }
        ]
    },
    'Toyota': {
        popularModels: [
            { name: 'Fortuner', basePrice: 3450000, bodyType: 'Full-size SUV', fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Manual', 'Automatic'], variants: ['4x2', '4x4', 'Legender', 'GR-S'] },
            { name: 'Innova Crysta', basePrice: 2050000, bodyType: 'MPV', fuelTypes: ['Diesel'], transmissions: ['Manual'], variants: ['GX', 'VX', 'ZX'] },
            { name: 'Innova Hycross', basePrice: 2100000, bodyType: 'Premium MPV', fuelTypes: ['Petrol', 'Hybrid'], transmissions: ['Automatic'], variants: ['GX', 'VX', 'ZX', 'ZX(O)'] },
            { name: 'Urban Cruiser Hyryder', basePrice: 1180000, bodyType: 'SUV', fuelTypes: ['Petrol', 'Hybrid', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['E', 'S', 'G', 'V'] },
            { name: 'Glanza', basePrice: 720000, bodyType: 'Hatchback', fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'], variants: ['E', 'S', 'G', 'V'] },
            { name: 'Camry', basePrice: 4600000, bodyType: 'Luxury Sedan', fuelTypes: ['Hybrid'], transmissions: ['Automatic'], variants: ['Hybrid 2.5L'] },
            { name: 'Hilux', basePrice: 3200000, bodyType: 'Pickup Truck', fuelTypes: ['Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['Standard', 'High'] }
        ]
    },
    'Kia': {
        popularModels: [
            { name: 'Seltos', basePrice: 1150000, bodyType: 'Midsize SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic', 'iMT'], variants: ['HTE', 'HTK', 'HTX', 'GTX', 'X-Line'] },
            { name: 'Sonet', basePrice: 820000, bodyType: 'Compact SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic', 'iMT'], variants: ['HTE', 'HTK', 'HTX', 'GTX', 'X-Line'] },
            { name: 'Carens', basePrice: 1100000, bodyType: 'MPV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['Premium', 'Prestige', 'Luxury', 'Luxury Plus'] },
            { name: 'Carnival', basePrice: 3400000, bodyType: 'Luxury MPV', fuelTypes: ['Diesel'], transmissions: ['Automatic'], variants: ['Limousine', 'Limousine Plus'] },
            { name: 'EV6', basePrice: 6200000, bodyType: 'Electric Crossover', fuelTypes: ['Electric'], transmissions: ['Automatic'], variants: ['GT-Line', 'GT-Line AWD'] }
        ]
    },
    'Honda': {
        popularModels: [
            { name: 'City', basePrice: 1220000, bodyType: 'Sedan', fuelTypes: ['Petrol', 'Hybrid'], transmissions: ['Manual', 'Automatic (CVT)'], variants: ['SV', 'V', 'VX', 'ZX', 'e:HEV'] },
            { name: 'Amaze', basePrice: 750000, bodyType: 'Compact Sedan', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic (CVT)'], variants: ['E', 'S', 'VX', 'Elite'] },
            { name: 'Elevate', basePrice: 1180000, bodyType: 'Midsize SUV', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic (CVT)'], variants: ['SV', 'V', 'VX', 'ZX'] },
            { name: 'WR-V', basePrice: 950000, bodyType: 'Crossover', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual'], variants: ['SV', 'VX'] },
            { name: 'Civic', basePrice: 1950000, bodyType: 'Premium Sedan', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['V', 'VX', 'ZX'] }
        ]
    },
    'BMW': {
        popularModels: [
            { name: '3 Series', basePrice: 4800000, bodyType: 'Luxury Sedan', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'], variants: ['330i', '320d', 'M340i xDrive', 'Gran Limousine'] },
            { name: '5 Series', basePrice: 6900000, bodyType: 'Executive Sedan', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'], variants: ['530i M Sport', '520d Luxury Line'] },
            { name: 'X1', basePrice: 4700000, bodyType: 'Luxury Compact SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'], variants: ['sDrive18i xLine', 'sDrive18d M Sport'] },
            { name: 'X3', basePrice: 6800000, bodyType: 'Luxury Midsize SUV', fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Automatic'], variants: ['xDrive20d M Sport', 'xDrive30i'] },
            { name: 'X5', basePrice: 9600000, bodyType: 'Luxury Full-size SUV', fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Automatic'], variants: ['xDrive30d', 'xDrive40i M Sport'] },
            { name: 'M5', basePrice: 17500000, bodyType: 'High-Performance Sedan', fuelTypes: ['Petrol'], transmissions: ['Automatic'], variants: ['Competition', 'M5 CS'] }
        ]
    },
    'Mercedes-Benz': {
        popularModels: [
            { name: 'C-Class', basePrice: 5900000, bodyType: 'Luxury Sedan', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'], variants: ['C 200', 'C 220d', 'C 300d AMG Line'] },
            { name: 'E-Class', basePrice: 7600000, bodyType: 'Executive Sedan', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'], variants: ['E 200 Exclusive', 'E 220d', 'E 350d AMG'] },
            { name: 'GLA', basePrice: 5100000, bodyType: 'Luxury Compact SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'], variants: ['GLA 200', 'GLA 220d 4MATIC'] },
            { name: 'GLC', basePrice: 7400000, bodyType: 'Luxury Midsize SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'], variants: ['GLC 300 4MATIC', 'GLC 220d 4MATIC'] },
            { name: 'GLE', basePrice: 9800000, bodyType: 'Luxury Full-size SUV', fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Automatic'], variants: ['GLE 300d', 'GLE 450 4MATIC'] },
            { name: 'S-Class', basePrice: 17200000, bodyType: 'Ultra-Luxury Sedan', fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Automatic'], variants: ['S 350d', 'S 450 4MATIC'] }
        ]
    },
    'Audi': {
        popularModels: [
            { name: 'A4', basePrice: 4500000, bodyType: 'Luxury Sedan', fuelTypes: ['Petrol'], transmissions: ['Automatic'], variants: ['Premium', 'Premium Plus', 'Technology'] },
            { name: 'A6', basePrice: 6400000, bodyType: 'Executive Sedan', fuelTypes: ['Petrol'], transmissions: ['Automatic'], variants: ['Premium Plus', 'Technology'] },
            { name: 'Q3', basePrice: 4400000, bodyType: 'Luxury Compact SUV', fuelTypes: ['Petrol'], transmissions: ['Automatic'], variants: ['Premium Plus', 'Technology'] },
            { name: 'Q5', basePrice: 6500000, bodyType: 'Luxury Midsize SUV', fuelTypes: ['Petrol'], transmissions: ['Automatic'], variants: ['Premium Plus', 'Technology'] },
            { name: 'Q7', basePrice: 8700000, basePrice: 8700000, bodyType: 'Luxury 7-Seater SUV', fuelTypes: ['Petrol'], transmissions: ['Automatic'], variants: ['Premium Plus', 'Technology'] },
            { name: 'Q8', basePrice: 11000000, bodyType: 'Luxury Coupe SUV', fuelTypes: ['Petrol'], transmissions: ['Automatic'], variants: ['55 TFSI Quattro'] }
        ]
    },
    'Volkswagen': {
        popularModels: [
            { name: 'Taigun', basePrice: 1200000, bodyType: 'Compact SUV', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic (DSG)'], variants: ['Comfortline', 'Highline', 'Topline', 'GT', 'GT Plus'] },
            { name: 'Virtus', basePrice: 1180000, bodyType: 'Midsize Sedan', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic (DSG)'], variants: ['Comfortline', 'Highline', 'Topline', 'GT', 'GT Plus'] },
            { name: 'Polo', basePrice: 750000, bodyType: 'Hatchback', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic (AT/DSG)'], variants: ['Trendline', 'Comfortline', 'Highline Plus', 'GT TSI'] },
            { name: 'Vento', basePrice: 980000, bodyType: 'Sedan', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['Trendline', 'Comfortline', 'Highline Plus'] },
            { name: 'Tiguan', basePrice: 3500000, bodyType: 'Premium SUV', fuelTypes: ['Petrol'], transmissions: ['Automatic (DSG)'], variants: ['Elegance 2.0 TSI'] }
        ]
    },
    'Skoda': {
        popularModels: [
            { name: 'Kushaq', basePrice: 1180000, bodyType: 'Compact SUV', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic (AT/DSG)'], variants: ['Active', 'Ambition', 'Style', 'Monte Carlo'] },
            { name: 'Slavia', basePrice: 1160000, bodyType: 'Sedan', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic (AT/DSG)'], variants: ['Active', 'Ambition', 'Style', 'Monte Carlo'] },
            { name: 'Octavia', basePrice: 2750000, bodyType: 'Premium Sedan', fuelTypes: ['Petrol'], transmissions: ['Automatic (DSG)'], variants: ['Style', 'L&K', 'RS'] },
            { name: 'Superb', basePrice: 3600000, bodyType: 'Executive Sedan', fuelTypes: ['Petrol'], transmissions: ['Automatic (DSG)'], variants: ['SportLine', 'L&K'] },
            { name: 'Kodiaq', basePrice: 3950000, bodyType: 'Luxury 7-Seater SUV', fuelTypes: ['Petrol'], transmissions: ['Automatic (DSG)'], variants: ['Style', 'Sportline', 'L&K'] },
            { name: 'Rapid', basePrice: 900000, bodyType: 'Sedan', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['Rider', 'Ambition', 'Style', 'Onyx'] }
        ]
    },
    'MG': {
        popularModels: [
            { name: 'Hector', basePrice: 1550000, bodyType: 'Midsize SUV', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic (CVT)'], variants: ['Style', 'Shine', 'Smart', 'Sharp Pro', 'Savvy Pro'] },
            { name: 'Astor', basePrice: 1050000, bodyType: 'Compact SUV', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic (CVT/AT)'], variants: ['Sprint', 'Shine', 'Select', 'Smart', 'Savvy'] },
            { name: 'ZS EV', basePrice: 1950000, bodyType: 'Electric SUV', fuelTypes: ['Electric'], transmissions: ['Automatic'], variants: ['Executive', 'Excite', 'Exclusive Plus', 'Essence'] },
            { name: 'Comet EV', basePrice: 720000, bodyType: 'Urban Electric Car', fuelTypes: ['Electric'], transmissions: ['Automatic'], variants: ['Pace', 'Play', 'Plush'] },
            { name: 'Gloster', basePrice: 3900000, bodyType: 'Full-size Luxury SUV', fuelTypes: ['Diesel'], transmissions: ['Automatic'], variants: ['Sharp 4x2', 'Savvy 4x4', 'Desertstorm'] }
        ]
    },
    'Jeep': {
        popularModels: [
            { name: 'Compass', basePrice: 2150000, bodyType: 'Compact Luxury SUV', fuelTypes: ['Diesel'], transmissions: ['Manual', 'Automatic'], variants: ['Sport', 'Longitude', 'Night Eagle', 'Limited', 'Model S'] },
            { name: 'Meridian', basePrice: 3200000, bodyType: '7-Seater Luxury SUV', fuelTypes: ['Diesel'], transmissions: ['Automatic', 'Manual'], variants: ['Longitude', 'Limited Opt', 'Overland'] },
            { name: 'Wrangler', basePrice: 6700000, bodyType: 'Iconic Off-Roader', fuelTypes: ['Petrol'], transmissions: ['Automatic'], variants: ['Unlimited', 'Rubicon'] },
            { name: 'Grand Cherokee', basePrice: 8000000, bodyType: 'Flagship SUV', fuelTypes: ['Petrol'], transmissions: ['Automatic'], variants: ['Limited (O)'] }
        ]
    },
    'Nissan': {
        popularModels: [
            { name: 'Magnite', basePrice: 620000, bodyType: 'Compact SUV', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic (CVT/AMT)'], variants: ['Visia', 'Acenta', 'N-Connecta', 'Tekna', 'Tekna+'] },
            { name: 'Kicks', basePrice: 1050000, bodyType: 'SUV', fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic (CVT)'], variants: ['XL', 'XV', 'XV Premium'] },
            { name: 'Micra', basePrice: 640000, bodyType: 'Hatchback', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic (CVT)'], variants: ['XL', 'XV'] },
            { name: 'Sunny', basePrice: 850000, bodyType: 'Sedan', fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic (CVT)'], variants: ['XE', 'XL', 'XV'] },
            { name: 'X-Trail', basePrice: 4900000, bodyType: 'Premium 7-Seater SUV', fuelTypes: ['Petrol', 'Hybrid'], transmissions: ['Automatic (CVT)'], variants: ['Variable Compression Turbo'] }
        ]
    },
    'Bentley': {
        popularModels: [
            { name: 'Bentayga', basePrice: 42000000, bodyType: 'Ultra-Luxury SUV', fuelTypes: ['Petrol', 'Hybrid'], transmissions: ['Automatic'], variants: ['V8', 'Azure', 'S', 'Speed'] },
            { name: 'Continental GT', basePrice: 38000000, bodyType: 'Grand Tourer Coupe', fuelTypes: ['Petrol'], transmissions: ['Automatic'], variants: ['V8', 'Mulliner', 'Speed'] },
            { name: 'Flying Spur', basePrice: 35000000, bodyType: 'Ultra-Luxury Sedan', fuelTypes: ['Petrol', 'Hybrid'], transmissions: ['Automatic'], variants: ['V8', 'Azure', 'Mulliner'] }
        ]
    }
};

// Map of state abbreviations in Indian registration plates
const STATE_PLATE_MAP = {
    'AN': 'Andaman and Nicobar Islands',
    'AP': 'Andhra Pradesh',
    'AR': 'Arunachal Pradesh',
    'AS': 'Assam',
    'BR': 'Bihar',
    'CH': 'Chandigarh',
    'CG': 'Chhattisgarh',
    'DD': 'Daman and Diu',
    'DL': 'Delhi',
    'DN': 'Dadra and Nagar Haveli',
    'GA': 'Goa',
    'GJ': 'Gujarat',
    'HP': 'Himachal Pradesh',
    'HR': 'Haryana',
    'JH': 'Jharkhand',
    'JK': 'Jammu and Kashmir',
    'KA': 'Karnataka',
    'KL': 'Kerala',
    'LA': 'Ladakh',
    'LD': 'Lakshadweep',
    'MH': 'Maharashtra',
    'ML': 'Meghalaya',
    'MN': 'Manipur',
    'MP': 'Madhya Pradesh',
    'MZ': 'Mizoram',
    'NL': 'Nagaland',
    'OD': 'Odisha',
    'PB': 'Punjab',
    'PY': 'Puducherry',
    'RJ': 'Rajasthan',
    'SK': 'Sikkim',
    'TN': 'Tamil Nadu',
    'TR': 'Tripura',
    'TS': 'Telangana',
    'UK': 'Uttarakhand',
    'UP': 'Uttar Pradesh',
    'WB': 'West Bengal'
};

// Helper: Normalize and validate Indian registration number
const parseRegistrationNumber = (rawPlate) => {
    if (!rawPlate || typeof rawPlate !== 'string') {
        return { isValid: false, normalized: '', error: 'Registration number is required' };
    }

    // Strip special characters and spaces
    const clean = rawPlate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Standard Indian plate: e.g. KA01AB1234 or KA011234
    const standardRegex = /^([A-Z]{2})([0-9]{1,2})([A-Z]{0,3})([0-9]{4})$/;
    // Bharat series plate: e.g. 22BH1234AA
    const bhRegex = /^([0-9]{2})(BH)([0-9]{4})([A-Z]{1,2})$/;

    if (standardRegex.test(clean)) {
        const matches = clean.match(standardRegex);
        const stateCode = matches[1];
        const rtoCode = matches[2].padStart(2, '0');
        const series = matches[3];
        const num = matches[4];
        const formatted = series ? `${stateCode} ${rtoCode} ${series} ${num}` : `${stateCode} ${rtoCode} ${num}`;
        const stateName = STATE_PLATE_MAP[stateCode] || 'India';
        return {
            isValid: true,
            clean,
            formatted,
            stateCode,
            stateName,
            isBH: false
        };
    } else if (bhRegex.test(clean)) {
        const matches = clean.match(bhRegex);
        const formatted = `${matches[1]} BH ${matches[3]} ${matches[4]}`;
        return {
            isValid: true,
            clean,
            formatted,
            stateCode: 'BH',
            stateName: 'All India (BH Series)',
            isBH: true
        };
    }

    return {
        isValid: false,
        clean,
        formatted: rawPlate.trim().toUpperCase(),
        error: 'Invalid registration format. Use standard format like DL 03 AB 1234 or KA 01 AB 1234'
    };
};

// @desc    Get all available brands for valuation
// @route   GET /api/valuation/brands
exports.getValuationBrands = async (req, res) => {
    try {
        const brands = Object.keys(VALUATION_CATALOG).map(name => {
            const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const data = VALUATION_CATALOG[name];
            return {
                id,
                name,
                logo: `/brands/${id}.svg`,
                modelCount: data.popularModels.length,
                models: data.popularModels.map(m => m.name)
            };
        });

        res.json({
            success: true,
            count: brands.length,
            brands
        });
    } catch (err) {
        console.error('Error fetching valuation brands:', err);
        res.status(500).json({ success: false, message: 'Server error fetching brands' });
    }
};

// @desc    Get models and options for a selected brand
// @route   GET /api/valuation/models
exports.getValuationModels = async (req, res) => {
    try {
        const { brand } = req.query;
        if (!brand) {
            return res.status(400).json({ success: false, message: 'Brand query parameter is required' });
        }

        // Case-insensitive lookup
        const catalogKey = Object.keys(VALUATION_CATALOG).find(
            k => k.trim().toLowerCase() === brand.trim().toLowerCase()
        );

        if (!catalogKey) {
            return res.status(404).json({ 
                success: false, 
                message: `Brand '${brand}' not found in valuation catalog` 
            });
        }

        const brandData = VALUATION_CATALOG[catalogKey];

        // Also check if existing cars in MongoDB have additional models for this brand
        const dbCars = await Car.find({ 
            brand: { $regex: new RegExp(`^${catalogKey}$`, 'i') } 
        }, 'model name price fuelType transmission modelYear').lean();

        res.json({
            success: true,
            brand: catalogKey,
            models: brandData.popularModels,
            dbComparablesCount: dbCars.length
        });
    } catch (err) {
        console.error('Error fetching valuation models:', err);
        res.status(500).json({ success: false, message: 'Server error fetching models' });
    }
};

// @desc    Calculate instant car valuation estimate
// @route   POST /api/valuation/estimate
exports.calculateValuationEstimate = async (req, res) => {
    try {
        const {
            registrationNumber,
            brand,
            model,
            variant,
            manufacturingYear,
            kmDriven,
            fuelType,
            transmission,
            condition = 'Good',
            owners = 1,
            city = '',
            state = ''
        } = req.body;

        if (!brand || !model || !manufacturingYear) {
            return res.status(400).json({
                success: false,
                message: 'Brand, model, and manufacturing year are required for valuation'
            });
        }

        // Validate plate if provided
        let plateDetails = null;
        if (registrationNumber && registrationNumber.trim()) {
            plateDetails = parseRegistrationNumber(registrationNumber.trim());
        }

        // Lookup catalog baseline
        const catalogKey = Object.keys(VALUATION_CATALOG).find(
            k => k.trim().toLowerCase() === brand.trim().toLowerCase()
        );
        const brandData = catalogKey ? VALUATION_CATALOG[catalogKey] : null;
        const modelData = brandData ? brandData.popularModels.find(
            m => m.name.toLowerCase() === model.toLowerCase()
        ) : null;

        // Find database comparables
        const dbComparables = await Car.find({
            brand: { $regex: new RegExp(`^${brand}$`, 'i') },
            $or: [
                { model: { $regex: new RegExp(`^${model}$`, 'i') } },
                { name: { $regex: new RegExp(model, 'i') } }
            ]
        }, 'price modelYear kmDriven fuelType condition').lean();

        // Baseline Ex-Showroom / New Price determination
        let baseNewPrice = 800000; // default fallback
        if (modelData && modelData.basePrice) {
            baseNewPrice = modelData.basePrice;
        } else if (dbComparables.length > 0) {
            // Estimate original value from used listing prices (adjusting for their age)
            const avgUsedPrice = dbComparables.reduce((acc, c) => acc + (c.price || 0), 0) / dbComparables.length;
            baseNewPrice = Math.round(avgUsedPrice * 1.6);
        }

        // 1. Age Depreciation (Indian automotive industry standard)
        const currentYear = new Date().getFullYear();
        const yearNum = Number(manufacturingYear);
        const vehicleAge = Math.max(0, currentYear - yearNum);

        let ageDeprecRate = 0.15; // default 1st year ~15%
        if (vehicleAge === 0) ageDeprecRate = 0.08;
        else if (vehicleAge === 1) ageDeprecRate = 0.15;
        else if (vehicleAge === 2) ageDeprecRate = 0.25;
        else if (vehicleAge === 3) ageDeprecRate = 0.35;
        else if (vehicleAge === 4) ageDeprecRate = 0.44;
        else if (vehicleAge === 5) ageDeprecRate = 0.52;
        else if (vehicleAge === 6) ageDeprecRate = 0.59;
        else if (vehicleAge === 7) ageDeprecRate = 0.65;
        else if (vehicleAge === 8) ageDeprecRate = 0.70;
        else if (vehicleAge === 9) ageDeprecRate = 0.74;
        else ageDeprecRate = Math.min(0.82, 0.75 + (vehicleAge - 10) * 0.015); // floor at 18% residual

        const ageDepreciationAmount = Math.round(baseNewPrice * ageDeprecRate);
        let currentValue = baseNewPrice - ageDepreciationAmount;

        // 2. Mileage Adjustment (Benchmark: 10,000 - 12,000 km / year)
        const km = Number(kmDriven) || 30000;
        const expectedKm = Math.max(8000, vehicleAge * 11000);
        let mileageAdjustmentRate = 0;

        if (km < expectedKm * 0.75) {
            // Low mileage bonus (+2% to +5%)
            mileageAdjustmentRate = 0.04;
        } else if (km > expectedKm * 1.35) {
            // High mileage deduction (-3% to -8%)
            mileageAdjustmentRate = -0.05;
        } else if (km > expectedKm * 1.8) {
            // Very high mileage deduction (-10%)
            mileageAdjustmentRate = -0.10;
        }
        const mileageAdjustmentAmount = Math.round(currentValue * mileageAdjustmentRate);
        currentValue += mileageAdjustmentAmount;

        // 3. Vehicle Condition Factor
        let conditionRate = 0;
        const condNormalized = (condition || 'Good').toLowerCase();
        if (condNormalized.includes('excellent')) {
            conditionRate = 0.05; // +5% for pristine condition
        } else if (condNormalized.includes('fair')) {
            conditionRate = -0.10; // -10% for visible cosmetic scratches/dents
        } else if (condNormalized.includes('need') || condNormalized.includes('poor') || condNormalized.includes('work')) {
            conditionRate = -0.22; // -22% for mechanical or structural issues
        } else {
            conditionRate = 0.0; // Good baseline
        }
        const conditionAdjustmentAmount = Math.round(currentValue * conditionRate);
        currentValue += conditionAdjustmentAmount;

        // 4. Transmission & Fuel Market Demand Factor
        let optionAdjustmentRate = 0;
        if (transmission && transmission.toLowerCase().includes('auto')) {
            optionAdjustmentRate += 0.03; // Automatic premium
        }
        if (fuelType) {
            const f = fuelType.toLowerCase();
            if (f.includes('diesel')) {
                // Diesel has high utility in SUVs/MPVs, neutral to slight discount in older Delhi NCR
                optionAdjustmentRate += (city && city.toLowerCase().includes('delhi')) ? -0.04 : 0.02;
            } else if (f.includes('cng')) {
                optionAdjustmentRate += 0.02;
            } else if (f.includes('hybrid')) {
                optionAdjustmentRate += 0.04;
            }
        }
        const optionsAdjustmentAmount = Math.round(currentValue * optionAdjustmentRate);
        currentValue += optionsAdjustmentAmount;

        // 5. Owners deduction
        const numOwners = Number(owners) || 1;
        let ownerAdjustmentRate = 0;
        if (numOwners === 2) ownerAdjustmentRate = -0.06;
        else if (numOwners >= 3) ownerAdjustmentRate = -0.14;
        const ownerAdjustmentAmount = Math.round(currentValue * ownerAdjustmentRate);
        currentValue += ownerAdjustmentAmount;

        // Final Fair Market Price (rounded to nearest 1,000 INR)
        const fairMarketPrice = Math.max(50000, Math.round(currentValue / 1000) * 1000);
        const minPrice = Math.max(45000, Math.round((fairMarketPrice * 0.94) / 1000) * 1000);
        const maxPrice = Math.round((fairMarketPrice * 1.06) / 1000) * 1000;

        // Explainable transparent breakdown
        const breakdown = {
            baseNewEstimate: baseNewPrice,
            ageYears: vehicleAge,
            ageDepreciationPercent: Math.round(ageDeprecRate * 100),
            ageDepreciationAmount,
            kmDriven: km,
            mileageImpact: mileageAdjustmentAmount,
            conditionRated: condition,
            conditionImpact: conditionAdjustmentAmount,
            optionsImpact: optionsAdjustmentAmount,
            ownerImpact: ownerAdjustmentAmount,
            fairMarketPrice,
            minPrice,
            maxPrice
        };

        const explanationPoints = [
            `Original market reference value for ${brand} ${model} estimated at approximately ₹${baseNewPrice.toLocaleString('en-IN')}.`,
            `Depreciation of ${Math.round(ageDeprecRate * 100)}% applied for vehicle age of ${vehicleAge} year${vehicleAge === 1 ? '' : 's'}.`,
            mileageAdjustmentAmount !== 0 
                ? (mileageAdjustmentAmount > 0 
                    ? `Low mileage bonus of +₹${Math.abs(mileageAdjustmentAmount).toLocaleString('en-IN')} applied based on ${km.toLocaleString('en-IN')} km driven.` 
                    : `High mileage adjustment of -₹${Math.abs(mileageAdjustmentAmount).toLocaleString('en-IN')} applied for ${km.toLocaleString('en-IN')} km driven.`)
                : `Normal expected usage (${km.toLocaleString('en-IN')} km) — zero mileage penalty applied.`,
            conditionAdjustmentAmount !== 0
                ? `${condition} vehicle condition factor adjusted price by ${conditionAdjustmentAmount > 0 ? '+' : ''}₹${conditionAdjustmentAmount.toLocaleString('en-IN')}.`
                : `Good vehicle condition chosen as solid market baseline.`,
            `Estimated fair resale market range calculated between ₹${minPrice.toLocaleString('en-IN')} and ₹${maxPrice.toLocaleString('en-IN')}.`
        ];

        res.json({
            success: true,
            plateDetails,
            valuation: {
                brand,
                model,
                variant: variant || (modelData?.variants ? modelData.variants[0] : 'Standard'),
                manufacturingYear: yearNum,
                kmDriven: km,
                fuelType: fuelType || 'Petrol',
                transmission: transmission || 'Manual',
                condition,
                city: city || (plateDetails?.stateName || 'India'),
                state: state || (plateDetails?.stateName || 'India'),
                fairMarketPrice,
                minPrice,
                maxPrice,
                priceFormatted: `₹${(fairMarketPrice / 100000).toFixed(2)} Lakhs`,
                rangeFormatted: `₹${(minPrice / 100000).toFixed(2)} Lakhs – ₹${(maxPrice / 100000).toFixed(2)} Lakhs`,
                breakdown,
                explanationPoints,
                disclaimer: 'This estimated valuation is calculated using AutoMart’s proprietary market valuation algorithm based on vehicle age, mileage, condition, and market demand. It is not an official government RTO lookup or a binding purchase offer until verified by our technical inspector.'
            }
        });
    } catch (err) {
        console.error('Error calculating car valuation:', err);
        res.status(500).json({
            success: false,
            message: 'Server error calculating car valuation'
        });
    }
};

// @desc    Submit valuation lead / Book free doorstep inspection
// @route   POST /api/valuation/lead
exports.submitValuationLead = async (req, res) => {
    try {
        const {
            registrationNumber,
            brand,
            model,
            variant,
            manufacturingYear,
            kmDriven,
            fuelType,
            transmission,
            condition,
            city,
            state,
            estimatedMinPrice,
            estimatedMaxPrice,
            fairMarketPrice,
            sellerName,
            sellerPhone,
            sellerEmail,
            preferredDate,
            preferredTime,
            address,
            userId
        } = req.body;

        if (!brand || !model || !sellerName || !sellerPhone) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle brand, model, your name, and phone number are required'
            });
        }

        const lead = await ValuationLead.create({
            registrationNumber: registrationNumber || '',
            brand,
            model,
            variant: variant || '',
            manufacturingYear: Number(manufacturingYear) || new Date().getFullYear(),
            kmDriven: Number(kmDriven) || 0,
            fuelType: fuelType || 'Petrol',
            transmission: transmission || 'Manual',
            condition: condition || 'Good',
            city: city || '',
            state: state || '',
            estimatedMinPrice: Number(estimatedMinPrice) || 0,
            estimatedMaxPrice: Number(estimatedMaxPrice) || 0,
            fairMarketPrice: Number(fairMarketPrice) || 0,
            sellerName: sellerName.trim(),
            sellerPhone: sellerPhone.trim(),
            sellerEmail: sellerEmail ? sellerEmail.trim() : '',
            preferredDate: preferredDate || '',
            preferredTime: preferredTime || '',
            address: address ? address.trim() : '',
            user: userId || null,
            status: 'Inspection Scheduled'
        });

        res.status(201).json({
            success: true,
            message: 'Inspection request booked successfully! Our AutoMart car specialist will call you shortly.',
            leadId: lead._id
        });
    } catch (err) {
        console.error('Error submitting valuation lead:', err);
        res.status(500).json({
            success: false,
            message: 'Server error submitting inspection request'
        });
    }
};
