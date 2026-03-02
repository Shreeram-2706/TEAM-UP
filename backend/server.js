// server.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();
const authRoutes = require('./Routers/authRoutes');
const projectRoutes = require('./Routers/projectRoutes');
const notifyRoutes = require('./Routers/notifyRoutes');
const discussRoutes = require('./Routers/discussRoutes');
const mailRoutes = require('./Routers/mailRoutes');
const eventRoutes = require('./Routers/EventRoutes');
const userRoutes = require('./Routers/userRoutes');
const fileRoutes = require('./Routers/fileRoutes');
const messageRoutes = require('./Routers/messageRoutes'); 
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  socket.on('leaveProject', (projectId) => {
    socket.leave(projectId);
    console.log(`User ${socket.id} left project ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors('*'));

app.use(express.static('public'));

// ensure upload directories are in place
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/auth', authRoutes);
app.use('/files', fileRoutes);
app.use('/projects', projectRoutes);
app.use('/notify', notifyRoutes);
app.use('/mail', mailRoutes);
app.use('/discuss', discussRoutes);
app.use('/events', eventRoutes);
app.use('/users', userRoutes);
app.use('/messages', messageRoutes); 
// serve any uploaded assets
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// backwards‑compatible route for misc static files if needed
app.use('/upload', express.static(path.join(__dirname, 'public/uploads')));

// global error handler (including multer/busboy errors)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message, code: err.code });
  }
  if (err.message && err.message.includes('Unexpected end of form')) {
    return res.status(400).json({ message: 'Upload interrupted or malformed form data.' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server running at http://localhost:${process.env.PORT || 8000}`);
    });
  })
  .catch(err => console.log('DB connection error:', err));