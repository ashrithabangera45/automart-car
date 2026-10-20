const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/models3d');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `model-${uniqueSuffix}${ext}`);
    }
});

// File filter to allow only .glb and .gltf
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.glb', '.gltf'];
    
    // Check extension
    if (!allowedExts.includes(ext)) {
        return cb(new Error('Only 3D model files (.glb, .gltf) are allowed!'), false);
    }
    cb(null, true);
};

// Limit 50MB for 3D car models
const uploadModel3d = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

module.exports = uploadModel3d;
