const mongoose = require('mongoose');
const { Schema } = mongoose;

// Notification Schema
const notificationSchema = new Schema({
  type: String,
  projectId: String,
  userId: String,
  projectName: String,
  username: String,
  role: String,
  timestamp: Date,
});

const emailSchema = new Schema({
  from: { type: String, required: true, trim: true, lowercase: true },
  to: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
});

const taskSchema = new Schema({
  description: { type: String, required: true, trim: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  expireAt: { type: Date, default: null, index: { expireAfterSeconds: 0 } },
}, { timestamps: true });

taskSchema.pre('save', function(next) {
  if (this.isCompleted && this.completedAt) {
    const endOfDay = new Date(this.completedAt);
    endOfDay.setHours(23, 59, 59, 999);
    this.expireAt = endOfDay;
  } else {
    this.expireAt = null;
  }
  next();
});

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    department: {
      type: String,
      enum: ['EEE', 'CSE', 'AIML', 'ECE', 'CSBS', 'AIDS', 'MECH', 'IT'],
      required: true,
    },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    profilePicture: { type: String, default: 'default.jpg' },
    projectsActive: { type: [String], default: [] },
    projectsCompleted: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    notifications: { type: [notificationSchema], default: [] },
    linkedinUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },
    inbox: { type: [emailSchema], default: [] },
    outbox: { type: [emailSchema], default: [] },
    tasks: { type: [taskSchema], default: [] },  
    isAvailable: { type: Boolean, default: true },
    description: { type: String, default: "" },
    isFaculty: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;