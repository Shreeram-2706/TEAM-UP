// Models/Project.js
const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  name: String,
  role: String,
  userid: String,
  joinedAt: { type: Date, default: Date.now }
});

const JoinRequestSchema = new mongoose.Schema({
  name: String,
  role: String,
  userid: String,
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

const RoleRequirementSchema = new mongoose.Schema({
  role: { type: String, required: true },
  requiredCount: { type: Number, required: true, min: 1 },
  filledCount: { type: Number, default: 0 }
});

const TaskSchema = new mongoose.Schema({
  enddate: String,
  teammemberName: String,
  taskName: String,
  taskDesc: String,
  teamMemberID: String,
});

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true }
});

const MessageSchema = new mongoose.Schema({
  name: String,
  message: String,
  time: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectDescription: { type: String, required: true },
  teamName: { type: String, required: true },
  teamLeadName: { type: String, required: true },
  teamLeadId: { type: String, default: "" },
  teamSize: { type: Number },
  roles: [String],
  roleRequirements: { type: [RoleRequirementSchema], default: [] },
  projectType: String,
  projectDuration: String,
  projectStatus: String,
  teamMembers: { type: [TeamMemberSchema], default: [] },
  skills: [String],
  projectLink: { type: String, default: "" },
  prototypeLink: { type: String, default: "" },
  referenceLink: { type: String, default: "" },
  joinrequests: [JoinRequestSchema],
  messages: { type: [MessageSchema], default: [] },
  todo: { type: [TaskSchema], default: [] },
  review: { type: [TaskSchema], default: [] },
  onprogress: { type: [TaskSchema], default: [] },
  done: { type: [TaskSchema], default: [] },
  files: { type: [fileSchema], default: [] },
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);