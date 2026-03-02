// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const User = require('../Models/User');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/profile-image/:userId', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'profile_pictures',
      width: 500,
      height: 500,
      crop: 'fill',
      gravity: 'face'
    });

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { profilePicture: result.secure_url },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Profile image uploaded successfully',
      profilePicture: result.secure_url 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: `Error uploading image: ${error.message}` });
  }
});

module.exports = router;