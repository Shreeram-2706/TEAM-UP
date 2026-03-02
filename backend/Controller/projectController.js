const Project = require('../Models/Project');
const mongoose = require('mongoose');

// Helper function to sanitize strings
const sanitizeString = (input) => {
  if (typeof input === 'string') {
    return input.trim();
  }
  return input;
};

// Helper function to sanitize object
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      sanitized[key] = obj[key].map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' ? sanitizeObject(item) : item
      );
    } else if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

const createProject = async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body);
    const newProject = new Project(sanitizedBody);
    const savedProject = await newProject.save();
    res.status(201).json({ message: "Project created successfully", project: savedProject });
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Project.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully", deleted });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const user_Id = req.body.user;
    const projects = await Project.find({"teamMembers.userid": user_Id});
    res.status(200).json(projects);
  } catch (error) {
    console.error("Get My Projects Error:", error);
    res.status(500).json({ error: "Something went wrong", message: error.message });
  }
};

const fetchProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error("Fetch Project Error:", error);
    res.status(500).json({ error: "Something went wrong", message: error.message });
  }
};

const updateProjectTasks = async (req, res) => {
  try {
    const projectId = req.params.id;
    const sanitizedBody = sanitizeObject(req.body);
    const { todo, onprogress, review, done } = sanitizedBody;
    
    const updated = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: {
          todo,
          onprogress,
          review,
          done,
        },
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({ error: 'Failed to update project tasks' });
  }
};

const addTasks = async (req, res) => {
  try {
    const projectId = req.params.id;
    const sanitizedBody = sanitizeObject(req.body);
    const { task, column } = sanitizedBody;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    const validColumns = ['todo', 'onprogress', 'review', 'done'];
    if (!validColumns.includes(column)) {
      return res.status(400).json({ error: `Invalid task column: ${column}` });
    }
    const requiredFields = ['taskName', 'taskDesc', 'enddate', 'teammemberName', 'teamMemberID'];
    for (const field of requiredFields) {
      if (!task[field]) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $push: { [column]: task } },
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    return res.status(200).json({
      message: "Task added successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Add Task Error:", error);
    return res.status(500).json({ error: "Failed to add task" });
  }
};

const ListProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    if (!projects || projects.length === 0) {
      return res.status(404).json({ message: "No projects found" });
    }
    const filtered = projects.filter(
      (project) => project.teamMembers.length <= project.teamSize
    );
    if (filtered.length === 0) {
      return res.status(404).json({ message: "No open projects with available roles" });
    }
    res.status(200).json(filtered);
  } catch (error) {
    console.error("List Projects Error:", error);
    res.status(500).json({ error: "Something went wrong", message: error.message });
  }
};

const updateProjectInfo = async (req, res) => {
  try {
    const projectId = req.params.id;
    const sanitizedBody = sanitizeObject(req.body);
    const {
      projectStatus,
      projectLink,
      prototypeLink,
      referenceLink,
      skillsRequired,
      rolesRequired
    } = sanitizedBody;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const updateData = {};
    if (projectStatus) updateData.projectStatus = projectStatus;
    if (projectLink) updateData.projectLink = projectLink;
    if (prototypeLink) updateData.prototypeLink = prototypeLink;
    if (referenceLink) updateData.referenceLink = referenceLink;
    if (skillsRequired) updateData.skills = skillsRequired;
    if (rolesRequired) updateData.roles = rolesRequired;

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({ message: "Project updated successfully", project: updatedProject });
  } catch (error) {
    console.error("Update Project Info Error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { 
  createProject, 
  getMyProjects, 
  fetchProject, 
  updateProjectTasks, 
  addTasks, 
  ListProjects, 
  updateProjectInfo, 
  deleteProject 
};