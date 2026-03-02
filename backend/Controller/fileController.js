const fs = require('fs');
const path = require('path');
const File = require('../Models/File');
const mongoose = require('mongoose');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { projectId } = req.params;
    const { userId, userName } = req.body;

    const newFile = new File({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      path: req.file.path.replace('public', ''),
      project: projectId,
      uploader: {
        id: userId,
        name: userName
      }
    });

    await newFile.save();

    const io = req.app.get('io');
    io.to(projectId).emit('fileUploaded', newFile);

    return res.status(201).json({
      message: 'File uploaded successfully',
      file: newFile
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const files = await File.find({ project: projectId }).sort({ uploadedAt: -1 });
    return res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    return res.status(500).json({
      message: 'Failed to fetch files',
      error: error.message
    });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '../public', file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, file.name);

  } catch (error) {
    console.error('Error downloading file:', error);
    return res.status(500).json({
      message: 'Failed to download file',
      error: error.message
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findByIdAndDelete(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '../public', file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const io = req.app.get('io');
    io.to(file.project.toString()).emit('fileDeleted', fileId);

    return res.status(200).json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

module.exports = {
  getProjectFiles,
  uploadFile,
  downloadFile,
  deleteFile
};
