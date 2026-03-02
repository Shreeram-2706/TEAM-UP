// models/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  projectID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  senderID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  }
}, {
  timestamps: true  
});

messageSchema.index({ projectID: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);