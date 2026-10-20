const express = require('express');
const router = express.Router();
const { getCars, getCarById, createCar, updateCar, deleteCar, getSimilarCars, uploadCarModel } = require('../controllers/carController');
const { protect, admin } = require('../middleware/authMiddleware');
const uploadModel3d = require('../middleware/uploadModelMiddleware');

router.post('/upload-model', protect, admin, (req, res, next) => {
    uploadModel3d.single('modelFile')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'File upload error' });
        }
        next();
    });
}, uploadCarModel);

router.route('/')
    .get(getCars)
    .post(protect, admin, createCar);


router.route('/:id/similar')
    .get(getSimilarCars);

router.route('/:id')
    .get(getCarById)
    .put(protect, admin, updateCar)
    .delete(protect, admin, deleteCar);

module.exports = router;
