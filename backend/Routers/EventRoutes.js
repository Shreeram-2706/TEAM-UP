const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllEvents,
  getEventById,
  createEvent,
  validateCreateEvent,
  deleteEvent,
  upload
} = require('../Controller/EventController');

// GET routes
router.get('/get', getAllEvents);             
router.get('/get/:id', getEventById);          

// POST route with multer and validation
router.post(
  '/create',
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Multer error in /events/create:', err);
        
        // Handle different multer errors
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              error: 'File too large. Maximum size is 5MB.' 
            });
          }
          return res.status(400).json({ 
            error: err.message 
          });
        }
        
        // Handle other errors
        return res.status(400).json({ 
          error: err.message || 'File upload failed' 
        });
      }
      next();
    });
  },
  validateCreateEvent,
  createEvent
);

// DELETE route
router.delete('/delete/:id', deleteEvent);

module.exports = router;