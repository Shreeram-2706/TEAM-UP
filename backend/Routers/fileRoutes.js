const express = require('express');
const router = express.Router();
const fileController = require('../Controller/fileController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads/files';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// Routes
router.get('/project/:projectId', fileController.getProjectFiles);
router.post('/upload/:projectId', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error in /files/upload:', err);
      return res.status(400).json({ error: err.message });
    }
    fileController.uploadFile(req, res, next);
  });
});
router.get('/download/:fileId', fileController.downloadFile);
router.delete('/delete/:fileId', fileController.deleteFile);

module.exports = router;
