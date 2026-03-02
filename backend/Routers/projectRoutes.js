const express = require('express');
const router = express.Router();
const Project = require('../Models/Project'); // Import Project model
const {
    getDiscuss,
    addMessage,
    addFile,
    deleteMessage,
    deleteFile
} = require('../Controller/discussController');

// Import project controller functions
const { 
    createProject, 
    getMyProjects, 
    fetchProject, 
    updateProjectTasks, 
    addTasks, 
    ListProjects, 
    updateProjectInfo, 
    deleteProject 
} = require('../Controller/projectController');

// Project CRUD routes
router.post('/project-create', createProject);
router.post('/my-projects', getMyProjects);
router.get('/:id', fetchProject);
router.patch('/:id', updateProjectTasks);
router.patch('/info/:id', updateProjectInfo);
router.post('/:id/add', addTasks);
router.post('/explore', ListProjects);
router.delete('/delete/:id', deleteProject);

// Remove member route
router.post('/:id/remove-member', async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId, role, teamLeadId } = req.body;
    
    // Validate required fields
    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    if (!teamLeadId) {
      return res.status(400).json({ error: "Team Lead ID is required" });
    }

    // Find the project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the requester is the team lead
    if (project.teamLeadId !== teamLeadId) {
      return res.status(403).json({ error: "Only team lead can remove members" });
    }

    // Check if trying to remove team lead
    const memberToRemove = project.teamMembers.find(m => m.userid === memberId);
    if (!memberToRemove) {
      return res.status(404).json({ error: "Member not found in project" });
    }

    if (memberToRemove.role === 'Team Lead') {
      return res.status(400).json({ error: "Cannot remove the team lead" });
    }

    // Remove member from teamMembers
    project.teamMembers = project.teamMembers.filter(
      member => member.userid !== memberId
    );

    // Update role requirement filled count if roleRequirements exists
    if (role && project.roleRequirements && Array.isArray(project.roleRequirements)) {
      const roleReqIndex = project.roleRequirements.findIndex(r => r.role === role);
      if (roleReqIndex !== -1) {
        if (project.roleRequirements[roleReqIndex].filledCount > 0) {
          project.roleRequirements[roleReqIndex].filledCount -= 1;
        }
      }
    }

    await project.save();
    
    res.status(200).json({ 
      message: "Member removed successfully", 
      project: {
        _id: project._id,
        teamMembers: project.teamMembers,
        roleRequirements: project.roleRequirements
      }
    });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Something went wrong: " + error.message });
  }
});

// Discuss routes
router.post('/get', getDiscuss);
router.post('/addMessage', addMessage);
router.post('/addFile', addFile);
router.delete('/deleteMessage', deleteMessage);
router.delete('/deleteFile', deleteFile);

module.exports = router;