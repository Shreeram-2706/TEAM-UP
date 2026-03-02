const fs = require('fs');
const path = require('path');
const Event = require('../Models/Event');
const { emitPostEvent } = require('../socket');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// FIXED: Updated validation to handle empty strings properly
const validateCreateEvent = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  // This will skip validation for empty strings, null, undefined
  body('link').optional({ checkFalsy: true }).isURL().withMessage('Invalid URL format')
];

const createEvent = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Clean up uploaded file if validation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, title, description, category, link } = req.body;
    
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Image is required' 
      });
    }

    // Create image path (store relative path)
    const imagePath = `/uploads/${req.file.filename}`;

    const newEvent = new Event({ 
      username,
      title,
      description,
      category,
      // If link is empty string, save as empty string (default in schema)
      link: link || '',
      image: imagePath
    });

    await newEvent.save();
    
    // Emit socket event if needed
    if (typeof emitPostEvent === 'function') {
      emitPostEvent('newEvent', newEvent);
    }

    return res.status(201).json({ 
      message: 'Event created successfully', 
      event: newEvent 
    });

  } catch (error) {
    console.error('Error creating Event:', error);
    // Clean up uploaded file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ 
      message: 'Failed to create Event',
      error: error.message 
    });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching Events:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch Events',
      error: error.message 
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching Event:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Event ID format' });
    }
    return res.status(500).json({ 
      message: 'Failed to fetch Event',
      error: error.message 
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete associated image file
    if (event.image) {
      const imagePath = path.join('public', event.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (typeof emitPostEvent === 'function') {
      emitPostEvent('EventDeleted', req.params.id);
    }
    
    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting Event:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Event ID format' });
    }
    return res.status(500).json({ 
      message: 'Failed to delete Event',
      error: error.message 
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  validateCreateEvent,
  deleteEvent,
  upload
};