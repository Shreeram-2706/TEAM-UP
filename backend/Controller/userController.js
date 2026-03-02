const User = require('../Models/User');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const fetchUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: `Error fetching user: ${error.message}` });
    }
}

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const updates = req.body;
        
        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.password;
        delete updates.role;
        delete updates.createdAt;
        delete updates.updatedAt;
        delete updates.notifications;
        delete updates.inbox;
        delete updates.outbox;
        delete updates.tasks;

        // Validate URLs if provided
        if (updates.linkedinUrl && updates.linkedinUrl.trim() !== '') {
            if (!updates.linkedinUrl.match(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)) {
                return res.status(400).json({ message: 'Invalid LinkedIn URL format' });
            }
        }
        if (updates.githubUrl && updates.githubUrl.trim() !== '') {
            if (!updates.githubUrl.match(/^https?:\/\/(www\.)?github\.com\/.*$/)) {
                return res.status(400).json({ message: 'Invalid GitHub URL format' });
            }
        }
        if (updates.portfolioUrl && updates.portfolioUrl.trim() !== '') {
            if (!updates.portfolioUrl.match(/^https?:\/\/.+/)) {
                return res.status(400).json({ message: 'Invalid portfolio URL format' });
            }
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: `Error updating user: ${error.message}` });
    }
}

const fetchTasks = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await User.findById(userId).select('tasks');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.tasks);
    } catch (error) {
        res.status(500).json({ message: `Error fetching tasks: ${error.message}` });
    }
}

const patchTasks = async (req, res) => {
    try {
        const userId = req.params.id;
        const { taskId, completed } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const update = {
            $set: {
                'tasks.$[elem].isCompleted': completed,
                'tasks.$[elem].completedAt': completed ? new Date() : null
            }
        };

        const options = {
            arrayFilters: [{ 'elem._id': new mongoose.Types.ObjectId(taskId) }],
            new: true
        };

        const user = await User.findByIdAndUpdate(
            userId,
            update,
            options
        ).select('tasks');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.tasks);
    } catch (error) {
        res.status(500).json({ message: `Error updating task: ${error.message}` });
    }
}

const addTask = async (req, res) => {
    try {
        const userId = req.params.id;
        const { description } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        if (!description || description.trim() === '') {
            return res.status(400).json({ message: 'Task description is required' });
        }

        const newTask = {
            description: description.trim(),
            isCompleted: false
        };

        const user = await User.findByIdAndUpdate(
            userId,
            { $push: { tasks: newTask } },
            { new: true }
        ).select('tasks');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addedTask = user.tasks[user.tasks.length - 1];
        res.status(201).json(addedTask);
    } catch (error) {
        res.status(500).json({ message: `Error adding task: ${error.message}` });
    }
}

const deleteTask = async (req, res) => {
    try {
        const userId = req.params.id;
        const { taskId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { tasks: { _id: taskId } } },
            { new: true }
        ).select('tasks');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ taskId, tasks: user.tasks });
    } catch (error) {
        res.status(500).json({ message: `Error deleting task: ${error.message}` });
    }
}

const uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create URL for the uploaded file - IMPORTANT: Use relative path for database
        const profilePictureUrl = `/uploads/${req.file.filename}`;

        // Update user with new profile picture URL
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { profilePicture: profilePictureUrl } },
            { new: true }
        );

        if (!user) {
            // If user not found, delete the uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the full URL for immediate use
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fullUrl = `${baseUrl}${profilePictureUrl}`;

        res.status(200).json({ 
            message: 'Profile picture uploaded successfully',
            profilePicture: fullUrl // Send full URL to frontend
        });
    } catch (error) {
        // If there's an error, delete the uploaded file
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        res.status(500).json({ message: `Error uploading profile picture: ${error.message}` });
    }
}

module.exports = {
    fetchUser,
    updateUser,
    fetchTasks,
    patchTasks,
    addTask,
    deleteTask,
    uploadProfilePicture
};