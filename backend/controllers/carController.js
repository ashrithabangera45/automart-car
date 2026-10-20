const Car = require('../models/Car');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

// @desc    Fetch all cars (with search & filters)
// @route   GET /api/cars
// @access  Public
const getCars = async (req, res) => {
    try {
        const { search, brand, model, minPrice, maxPrice, fuelType, transmission, modelYear, bodyType, colour, features, seatingCapacity, owners, location, discount, sort, includeFacets, condition } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
                { variant: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (brand) {
            query.brand = { 
                $in: brand.split(',').map(b => {
                    const escaped = b.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    return new RegExp(`^\\s*${escaped}\\s*$`, 'i');
                })
            };
        }
        if (condition) query.condition = { $in: condition.split(',').map(c => new RegExp(`^${c}$`, 'i')) };
        if (model) query.model = { $in: model.split(',') };
        if (fuelType) query.fuelType = { $in: fuelType.split(',') };
        if (transmission) query.transmission = { $in: transmission.split(',') };
        if (bodyType) query.bodyType = { $in: bodyType.split(',') };
        if (colour) query.colour = { $in: colour.split(',') };
        if (seatingCapacity) query.seatingCapacity = { $in: seatingCapacity.split(',').map(Number) };
        if (owners) query.owners = { $in: owners.split(',').map(Number) };
        if (features) query.features = { $in: features.split(',') };
        if (modelYear) query.modelYear = { $in: modelYear.split(',').map(Number) };
        if (location) query['location.city'] = { $in: location.split(',') };

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (discount === 'true') {
            query.discount = { $gt: 0 };
        }

        let sortObj = { createdAt: -1 }; 
        if (sort === 'price_asc') sortObj = { price: 1 };
        if (sort === 'price_desc') sortObj = { price: -1 };
        if (sort === 'newest') sortObj = { createdAt: -1 };
        if (sort === 'oldest') sortObj = { createdAt: 1 };
        if (sort === 'km_asc') sortObj = { kmDriven: 1 };
        if (sort === 'km_desc') sortObj = { kmDriven: -1 };

        const cars = await Car.find(query).sort(sortObj);
        
        if (includeFacets === 'true') {
            const allCars = await Car.find({});
            const facets = {
                brands: {}, models: {}, modelsByBrand: {}, fuelTypes: {}, bodyTypes: {}, transmissions: {},
                colours: {}, features: {}, seatingCapacities: {}, owners: {}, locations: {}, modelYears: {}, conditions: {}
            };
            
            allCars.forEach(c => {
                const trimmedBrand = c.brand ? c.brand.trim() : '';
                if(trimmedBrand) facets.brands[trimmedBrand] = (facets.brands[trimmedBrand] || 0) + 1;
                if(c.model) facets.models[c.model] = (facets.models[c.model] || 0) + 1;
                
                if(trimmedBrand && c.model) {
                    if(!facets.modelsByBrand[trimmedBrand]) facets.modelsByBrand[trimmedBrand] = {};
                    facets.modelsByBrand[trimmedBrand][c.model] = (facets.modelsByBrand[trimmedBrand][c.model] || 0) + 1;
                }
                
                if(c.fuelType) facets.fuelTypes[c.fuelType] = (facets.fuelTypes[c.fuelType] || 0) + 1;
                if(c.bodyType) facets.bodyTypes[c.bodyType] = (facets.bodyTypes[c.bodyType] || 0) + 1;
                if(c.transmission) facets.transmissions[c.transmission] = (facets.transmissions[c.transmission] || 0) + 1;
                if(c.colour) facets.colours[c.colour] = (facets.colours[c.colour] || 0) + 1;
                if(c.seatingCapacity) facets.seatingCapacities[c.seatingCapacity] = (facets.seatingCapacities[c.seatingCapacity] || 0) + 1;
                if(c.owners !== undefined && c.owners !== null) facets.owners[c.owners] = (facets.owners[c.owners] || 0) + 1;
                if(c.location && c.location.city) facets.locations[c.location.city] = (facets.locations[c.location.city] || 0) + 1;
                if(c.modelYear) facets.modelYears[c.modelYear] = (facets.modelYears[c.modelYear] || 0) + 1;
                if(c.condition) {
                    const cond = c.condition.charAt(0).toUpperCase() + c.condition.slice(1).toLowerCase();
                    facets.conditions[cond] = (facets.conditions[cond] || 0) + 1;
                }
                if(c.features && Array.isArray(c.features)) {
                    c.features.forEach(f => {
                        facets.features[f] = (facets.features[f] || 0) + 1;
                    });
                }
            });
            return res.json({ cars, facets });
        }

        res.json(cars);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch single car
// @route   GET /api/cars/:id
// @access  Public
const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (car) res.json(car);
        else res.status(404).json({ message: 'Car not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper to validate and extract YouTube Video ID
const extractYouTubeVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const clean = url.trim();
    if (!clean) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
    const match = clean.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
};

// @desc    Create a car
// @route   POST /api/cars
// @access  Private/Admin
const createCar = async (req, res) => {
    try {
        if (req.body.videoUrl && req.body.videoUrl.trim()) {
            const videoId = extractYouTubeVideoId(req.body.videoUrl);
            if (!videoId) {
                return res.status(400).json({ message: 'Invalid YouTube URL. Please provide a valid YouTube link (e.g. https://www.youtube.com/watch?v=VIDEO_ID)' });
            }
            req.body.videoUrl = req.body.videoUrl.trim();
        } else if (req.body.videoUrl !== undefined) {
            req.body.videoUrl = '';
        }

        const car = new Car(req.body);
        const createdCar = await car.save();
        res.status(201).json(createdCar);
    } catch (error) {
        res.status(400).json({ message: 'Invalid car data', error });
    }
};

// @desc    Update a car
// @route   PUT /api/cars/:id
// @access  Private/Admin
const updateCar = async (req, res) => {
    try {
        if (req.body.videoUrl && req.body.videoUrl.trim()) {
            const videoId = extractYouTubeVideoId(req.body.videoUrl);
            if (!videoId) {
                return res.status(400).json({ message: 'Invalid YouTube URL. Please provide a valid YouTube link (e.g. https://www.youtube.com/watch?v=VIDEO_ID)' });
            }
            req.body.videoUrl = req.body.videoUrl.trim();
        } else if (req.body.videoUrl !== undefined) {
            req.body.videoUrl = '';
        }

        const car = await Car.findById(req.params.id);
        if (car) {
            Object.assign(car, req.body);
            const updatedCar = await car.save();
            res.json(updatedCar);
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
const deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (car) {
            await car.deleteOne();
            await Cart.deleteMany({ carId: req.params.id });
            await Wishlist.deleteMany({ carId: req.params.id });
            res.json({ message: 'Car removed' });
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch other cars
// @route   GET /api/cars/:id/similar
// @access  Public
const getSimilarCars = async (req, res) => {
    try {
        const carId = req.params.id;
        
        // Find all other available cars
        const otherCars = await Car.find({
            _id: { $ne: carId },
            stock: { $gt: 0 }
        }).sort({ createdAt: -1 });

        res.json(otherCars);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload 3D car model file (.glb / .gltf)
// @route   POST /api/cars/upload-model
// @access  Private/Admin
const uploadCarModel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No 3D model file provided or file type not allowed (.glb / .gltf only)' });
        }
        // Normalize file path to web-accessible URL
        const filename = req.file.filename;
        const modelUrl = `/uploads/models3d/${filename}`;
        res.status(200).json({
            message: '3D model uploaded successfully',
            modelUrl,
            filename: req.file.originalname,
            size: req.file.size
        });
    } catch (error) {
        console.error('Error uploading 3D model:', error);
        res.status(500).json({ message: 'Server error uploading 3D model' });
    }
};

module.exports = { getCars, getCarById, createCar, updateCar, deleteCar, getSimilarCars, uploadCarModel };

