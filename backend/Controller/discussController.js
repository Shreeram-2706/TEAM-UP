const { text } = require('express');
const Project = require('../Models/Project');
const { getIo } = require('../socket'); 


const getDiscuss = async (req, res) => {
  const { projectId } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      messages: project.messages,
      files: project.files,
      teamMembers: project.teamMembers,
      projectName: project.projectName,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addMessage = async (req, res) => {
  const { projectId, name, message } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newMessage = { name, message, time: new Date() };

    project.messages.push(newMessage);
    await project.save();

    getIo().to(projectId).emit('receiveMessage', newMessage);

    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addFile = async (req, res) => {
  const { projectId, name, url } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newFile = { name, url };

    project.files.push(newFile);
    await project.save();

    getIo().to(projectId).emit('receiveFile', newFile);

    res.json(newFile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMessage = async (req, res) => {
  const { projectId, messageId } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.messages = project.messages.filter(
      (msg) => msg._id.toString() !== messageId
    );
    await project.save();

    getIo().to(projectId).emit('deleteMessage', messageId);

    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteFile = async (req, res) => {
  const { projectId, fileId } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.files = project.files.filter(
      (file) => file._id.toString() !== fileId
    );
    await project.save();

    getIo().to(projectId).emit('deleteFile', fileId);

    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDiscuss,
  addMessage,
  addFile,
  deleteMessage,
  deleteFile
};
