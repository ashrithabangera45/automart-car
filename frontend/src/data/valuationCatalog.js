export const VALUATION_BRANDS = [
    { id: 'maruti-suzuki', name: 'Maruti Suzuki', logo: '/brands/maruti-suzuki.svg' },
    { id: 'hyundai', name: 'Hyundai', logo: '/brands/hyundai.svg' },
    { id: 'tata', name: 'Tata', logo: '/brands/tata.svg' },
    { id: 'mahindra', name: 'Mahindra', logo: '/brands/mahindra.svg' },
    { id: 'toyota', name: 'Toyota', logo: '/brands/toyota.svg' },
    { id: 'kia', name: 'Kia', logo: '/brands/kia.svg' },
    { id: 'honda', name: 'Honda', logo: '/brands/honda.svg' },
    { id: 'bmw', name: 'BMW', logo: '/brands/bmw.svg' },
    { id: 'mercedes-benz', name: 'Mercedes-Benz', logo: '/brands/mercedes-benz.svg' },
    { id: 'audi', name: 'Audi', logo: '/brands/audi.svg' },
    { id: 'volkswagen', name: 'Volkswagen', logo: '/brands/volkswagen.svg' },
    { id: 'skoda', name: 'Skoda', logo: '/brands/skoda.svg' },
    { id: 'mg', name: 'MG', logo: '/brands/mg.svg' },
    { id: 'jeep', name: 'Jeep', logo: '/brands/jeep.svg' },
    { id: 'nissan', name: 'Nissan', logo: '/brands/nissan.svg' },
    { id: 'bentley', name: 'Bentley', logo: '/brands/bentley.svg' }
];

export const BRAND_MODELS_MAP = {
    'Maruti Suzuki': [
        { name: 'Swift', variants: ['LXI', 'VXI', 'ZXI', 'ZXI+'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Baleno', variants: ['Sigma', 'Delta', 'Zeta', 'Alpha'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Brezza', variants: ['LXI', 'VXI', 'ZXI', 'ZXI+'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Ertiga', variants: ['LXI', 'VXI', 'ZXI', 'ZXI+'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Dzire', variants: ['LXI', 'VXI', 'ZXI', 'ZXI+'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Grand Vitara', variants: ['Sigma', 'Delta', 'Zeta', 'Alpha'], fuelTypes: ['Petrol', 'Hybrid', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Fronx', variants: ['Sigma', 'Delta', 'Zeta', 'Alpha'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Wagon R', variants: ['LXI', 'VXI', 'ZXI'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Alto K10', variants: ['Std', 'LXI', 'VXI', 'VXI+'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Jimny', variants: ['Zeta', 'Alpha'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Ciaz', variants: ['Sigma', 'Delta', 'Zeta', 'Alpha'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] }
    ],
    'Hyundai': [
        { name: 'Creta', variants: ['E', 'EX', 'S', 'SX', 'SX(O)'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Venue', variants: ['E', 'S', 'SX', 'SX(O)'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'i20', variants: ['Era', 'Magna', 'Sportz', 'Asta', 'Asta(O)'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Verna', variants: ['EX', 'S', 'SX', 'SX(O)'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Grand i10 Nios', variants: ['Era', 'Magna', 'Sportz', 'Asta'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Exter', variants: ['EX', 'S', 'SX', 'SX(O)'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Alcazar', variants: ['Prestige', 'Platinum', 'Signature'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Tucson', variants: ['Platinum', 'Signature'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'] },
        { name: 'Ioniq 5', variants: ['Long Range RWD'], fuelTypes: ['Electric'], transmissions: ['Automatic'] }
    ],
    'Tata': [
        { name: 'Nexon', variants: ['Smart', 'Pure', 'Creative', 'Fearless'], fuelTypes: ['Petrol', 'Diesel', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Punch', variants: ['Pure', 'Adventure', 'Accomplished', 'Creative'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Harrier', variants: ['Smart', 'Pure', 'Adventure', 'Fearless'], fuelTypes: ['Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Safari', variants: ['Smart', 'Pure', 'Adventure', 'Accomplished'], fuelTypes: ['Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Altroz', variants: ['XE', 'XM', 'XT', 'XZ', 'XZ+'], fuelTypes: ['Petrol', 'Diesel', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Tiago', variants: ['XE', 'XM', 'XT', 'XZ', 'XZ+'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Tigor', variants: ['XE', 'XM', 'XZ', 'XZ+'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Nexon EV', variants: ['Creative', 'Fearless', 'Empowered'], fuelTypes: ['Electric'], transmissions: ['Automatic'] },
        { name: 'Curvv', variants: ['Smart', 'Pure', 'Creative', 'Accomplished'], fuelTypes: ['Petrol', 'Diesel', 'Electric'], transmissions: ['Manual', 'Automatic'] }
    ],
    'Mahindra': [
        { name: 'Thar', variants: ['AX Opt', 'LX 4x2', 'LX 4x4', 'Earth Edition'], fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'XUV700', variants: ['MX', 'AX3', 'AX5', 'AX7', 'AX7 Luxury'], fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Scorpio-N', variants: ['Z2', 'Z4', 'Z6', 'Z8', 'Z8L'], fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Scorpio Classic', variants: ['S', 'S11'], fuelTypes: ['Diesel'], transmissions: ['Manual'] },
        { name: 'XUV 3XO', variants: ['MX1', 'MX2', 'AX5', 'AX7'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Bolero', variants: ['B4', 'B6', 'B6 Opt'], fuelTypes: ['Diesel'], transmissions: ['Manual'] },
        { name: 'Bolero Neo', variants: ['N4', 'N8', 'N10', 'N10(O)'], fuelTypes: ['Diesel'], transmissions: ['Manual'] }
    ],
    'Toyota': [
        { name: 'Fortuner', variants: ['4x2', '4x4', 'Legender', 'GR-S'], fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Innova Crysta', variants: ['GX', 'VX', 'ZX'], fuelTypes: ['Diesel'], transmissions: ['Manual'] },
        { name: 'Innova Hycross', variants: ['GX', 'VX', 'ZX', 'ZX(O)'], fuelTypes: ['Petrol', 'Hybrid'], transmissions: ['Automatic'] },
        { name: 'Urban Cruiser Hyryder', variants: ['E', 'S', 'G', 'V'], fuelTypes: ['Petrol', 'Hybrid', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Glanza', variants: ['E', 'S', 'G', 'V'], fuelTypes: ['Petrol', 'CNG'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Camry', variants: ['Hybrid 2.5L'], fuelTypes: ['Hybrid'], transmissions: ['Automatic'] },
        { name: 'Hilux', variants: ['Standard', 'High'], fuelTypes: ['Diesel'], transmissions: ['Manual', 'Automatic'] }
    ],
    'Kia': [
        { name: 'Seltos', variants: ['HTE', 'HTK', 'HTX', 'GTX', 'X-Line'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Sonet', variants: ['HTE', 'HTK', 'HTX', 'GTX', 'X-Line'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Carens', variants: ['Premium', 'Prestige', 'Luxury', 'Luxury Plus'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Carnival', variants: ['Limousine', 'Limousine Plus'], fuelTypes: ['Diesel'], transmissions: ['Automatic'] },
        { name: 'EV6', variants: ['GT-Line', 'GT-Line AWD'], fuelTypes: ['Electric'], transmissions: ['Automatic'] }
    ],
    'Honda': [
        { name: 'City', variants: ['SV', 'V', 'VX', 'ZX', 'e:HEV'], fuelTypes: ['Petrol', 'Hybrid'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Amaze', variants: ['E', 'S', 'VX', 'Elite'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Elevate', variants: ['SV', 'V', 'VX', 'ZX'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'WR-V', variants: ['SV', 'VX'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual'] },
        { name: 'Civic', variants: ['V', 'VX', 'ZX'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] }
    ],
    'BMW': [
        { name: '3 Series', variants: ['330i', '320d', 'M340i xDrive', 'Gran Limousine'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'] },
        { name: '5 Series', variants: ['530i M Sport', '520d Luxury Line'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'] },
        { name: 'X1', variants: ['sDrive18i xLine', 'sDrive18d M Sport'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'] },
        { name: 'X3', variants: ['xDrive20d M Sport', 'xDrive30i'], fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Automatic'] },
        { name: 'X5', variants: ['xDrive30d', 'xDrive40i M Sport'], fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Automatic'] },
        { name: 'M5', variants: ['Competition', 'M5 CS'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] }
    ],
    'Mercedes-Benz': [
        { name: 'C-Class', variants: ['C 200', 'C 220d', 'C 300d AMG Line'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'] },
        { name: 'E-Class', variants: ['E 200 Exclusive', 'E 220d', 'E 350d AMG'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'] },
        { name: 'GLA', variants: ['GLA 200', 'GLA 220d 4MATIC'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'] },
        { name: 'GLC', variants: ['GLC 300 4MATIC', 'GLC 220d 4MATIC'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Automatic'] },
        { name: 'GLE', variants: ['GLE 300d', 'GLE 450 4MATIC'], fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Automatic'] },
        { name: 'S-Class', variants: ['S 350d', 'S 450 4MATIC'], fuelTypes: ['Diesel', 'Petrol'], transmissions: ['Automatic'] }
    ],
    'Audi': [
        { name: 'A4', variants: ['Premium', 'Premium Plus', 'Technology'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] },
        { name: 'A6', variants: ['Premium Plus', 'Technology'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] },
        { name: 'Q3', variants: ['Premium Plus', 'Technology'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] },
        { name: 'Q5', variants: ['Premium Plus', 'Technology'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] },
        { name: 'Q7', variants: ['Premium Plus', 'Technology'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] },
        { name: 'Q8', variants: ['55 TFSI Quattro'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] }
    ],
    'Volkswagen': [
        { name: 'Taigun', variants: ['Comfortline', 'Highline', 'Topline', 'GT', 'GT Plus'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Virtus', variants: ['Comfortline', 'Highline', 'Topline', 'GT', 'GT Plus'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Polo', variants: ['Trendline', 'Comfortline', 'Highline Plus', 'GT TSI'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Vento', variants: ['Trendline', 'Comfortline', 'Highline Plus'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Tiguan', variants: ['Elegance 2.0 TSI'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] }
    ],
    'Skoda': [
        { name: 'Kushaq', variants: ['Active', 'Ambition', 'Style', 'Monte Carlo'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Slavia', variants: ['Active', 'Ambition', 'Style', 'Monte Carlo'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Octavia', variants: ['Style', 'L&K', 'RS'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] },
        { name: 'Superb', variants: ['SportLine', 'L&K'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] },
        { name: 'Kodiaq', variants: ['Style', 'Sportline', 'L&K'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] },
        { name: 'Rapid', variants: ['Rider', 'Ambition', 'Style', 'Onyx'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] }
    ],
    'MG': [
        { name: 'Hector', variants: ['Style', 'Shine', 'Smart', 'Sharp Pro', 'Savvy Pro'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Astor', variants: ['Sprint', 'Shine', 'Select', 'Smart', 'Savvy'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'ZS EV', variants: ['Executive', 'Excite', 'Exclusive Plus', 'Essence'], fuelTypes: ['Electric'], transmissions: ['Automatic'] },
        { name: 'Comet EV', variants: ['Pace', 'Play', 'Plush'], fuelTypes: ['Electric'], transmissions: ['Automatic'] },
        { name: 'Gloster', variants: ['Sharp 4x2', 'Savvy 4x4', 'Desertstorm'], fuelTypes: ['Diesel'], transmissions: ['Automatic'] }
    ],
    'Jeep': [
        { name: 'Compass', variants: ['Sport', 'Longitude', 'Night Eagle', 'Limited', 'Model S'], fuelTypes: ['Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Meridian', variants: ['Longitude', 'Limited Opt', 'Overland'], fuelTypes: ['Diesel'], transmissions: ['Automatic', 'Manual'] },
        { name: 'Wrangler', variants: ['Unlimited', 'Rubicon'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] },
        { name: 'Grand Cherokee', variants: ['Limited (O)'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] }
    ],
    'Nissan': [
        { name: 'Magnite', variants: ['Visia', 'Acenta', 'N-Connecta', 'Tekna', 'Tekna+'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Kicks', variants: ['XL', 'XV', 'XV Premium'], fuelTypes: ['Petrol'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Micra', variants: ['XL', 'XV'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'Sunny', variants: ['XE', 'XL', 'XV'], fuelTypes: ['Petrol', 'Diesel'], transmissions: ['Manual', 'Automatic'] },
        { name: 'X-Trail', variants: ['Turbo Hybrid'], fuelTypes: ['Petrol', 'Hybrid'], transmissions: ['Automatic'] }
    ],
    'Bentley': [
        { name: 'Bentayga', variants: ['V8', 'Azure', 'S', 'Speed'], fuelTypes: ['Petrol', 'Hybrid'], transmissions: ['Automatic'] },
        { name: 'Continental GT', variants: ['V8', 'Mulliner', 'Speed'], fuelTypes: ['Petrol'], transmissions: ['Automatic'] },
        { name: 'Flying Spur', variants: ['V8', 'Azure', 'Mulliner'], fuelTypes: ['Petrol', 'Hybrid'], transmissions: ['Automatic'] }
    ]
};

export const INDIAN_STATES_RTO = {
    'AN': 'Andaman and Nicobar',
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

export const KM_OPTIONS = [
    { label: '< 20,000 km', value: 15000, desc: 'Barely driven / Like new' },
    { label: '20,000 – 40,000 km', value: 30000, desc: 'Moderate city driving' },
    { label: '40,000 – 70,000 km', value: 55000, desc: 'Regular highway & daily usage' },
    { label: '70,000 – 1,00,000 km', value: 85000, desc: 'Well traveled' },
    { label: '1,00,000+ km', value: 120000, desc: 'High mileage' }
];

export const CONDITION_OPTIONS = [
    { 
        value: 'Excellent', 
        badge: '🌟 Excellent', 
        title: 'Like New Condition', 
        desc: 'Scratch-free original paint, spotless interior, complete service records & no accident history.' 
    },
    { 
        value: 'Good', 
        badge: '✅ Good', 
        title: 'Well Maintained', 
        desc: 'Regularly serviced, minor normal cosmetic wear, sound engine & clean mechanical condition.' 
    },
    { 
        value: 'Fair', 
        badge: '⚠️ Fair', 
        title: 'Needs Minor TLC', 
        desc: 'Visible scratches or minor dents, tyres/brakes may need service soon, drives reliably.' 
    },
    { 
        value: 'Needs Work', 
        badge: '🔧 Needs Work', 
        title: 'Requires Repairs', 
        desc: 'Significant body dents, mechanical repairs needed or missing service history.' 
    }
];

export const POPULAR_CITIES = [
    'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Mangalore', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Chandigarh', 'Kochi'
];
