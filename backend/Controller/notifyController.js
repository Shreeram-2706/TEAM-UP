const Project = require('../Models/Project');
const User = require('../Models/User');
const mongoose = require('mongoose');

    const requestNotify = async (req, res) => {
        const { projectId, userId, username, teamLeadId, projectName, role } = req.body;
    
        try {
        const teamLead = await User.findById(teamLeadId);
        if (!teamLead) {
            return res.status(404).json({ message: "Team Lead not found" });
        }
        const notification = {
            type: "join-request",
            projectName,
            projectId,
            userId,
            username,
            role,
            timestamp: new Date()
        };
        if (!teamLead.notifications) {
            teamLead.notifications = [];
        }
        teamLead.notifications.push(notification);
        await teamLead.save();
        res.status(200).json({ message: "Notification sent successfully" });
        } catch (err) {
        console.error("Error in requestNotify:", err);
        res.status(500).json({ message: "Internal Server Error" });
        }
    };

    const fetchNotifications = async (req, res) => {
        const userId = req.params.userId;
        try {
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
      
          const sortedNotifications = [...user.notifications].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
      
          res.status(200).json(sortedNotifications);
        } catch (err) {
          console.error("Error in getNotifications:", err);
          res.status(500).json({ message: "Internal Server Error" });
        }
      };      

      const acceptNotify = async (req, res) => {
        const {Id, userId, notificationId, userName, projectId, role } = req.body;
        try {
          const project = await Project.findById(projectId);
          if (!project) {
            return res.status(404).json({ message: 'Project not found' });
          }
          const isAlreadyTeamMember = project.teamMembers.some(
            (member) => member.userid === userId
          );
          if (isAlreadyTeamMember) {
          const user = await User.findById(Id);
          if (user) {
            user.notifications = user.notifications.filter(
              (notification) => notification._id.toString() !== notificationId
            );
            await user.save();
          }
            return res.status(400).json({ message: 'User is already a team member' });
          }
          const teamMember = { name: userName, role: role, userid: userId };
          project.teamMembers.push(teamMember);
          project.joinrequests = project.joinrequests.filter(
            (request) => request.userid !== userId 
          );
          await project.save();
          const user = await User.findById(Id);
          if (user) {
            user.notifications = user.notifications.filter(
              (notification) => notification._id.toString() !== notificationId
            );
            await user.save();
          }
          return res.status(200).json({
            message: `${userName} has been added to the project as ${role}`,
          });
        } catch (err) {
          console.error('Error accepting notification:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
      };
      
 
      const RejectNotify = async (req, res) => {
        const { userId, notificationId } = req.body;
      
        if (!userId || !notificationId) {
          return res.status(400).json({ message: "User ID and Notification ID are required" });
        }
      
        try {
          const user = await User.findById(userId);
          
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          user.notifications = user.notifications.filter(
            (notification) => notification._id.toString() !== notificationId
          );
          await user.save();
          return res.status(200).json({
            message: "Notification rejected successfully",
          });
        } catch (err) {
          console.error("Error rejecting notification:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }
      };
      

module.exports = { requestNotify, acceptNotify, RejectNotify, fetchNotifications };