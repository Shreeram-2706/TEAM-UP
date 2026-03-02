import React, { useState, useContext, useEffect } from 'react';
import Select from 'react-select';
import UserContext from '../../Context/UserContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const AddProjectModal = ({ setShowAddProjectModal, onProjectAdded }) => {
  const { user } = useContext(UserContext);  
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    teamName: '',
    teamLeadName: '',
    teamLeadId: '',
    roles: [],
    roleRequirements: [],
    projectType: '',
    projectDuration: '',
    projectStatus: '',
    skills: [],
    projectLink: '',
    prototypeLink: '',
    referenceLink: '',
    teamSize: ''
  });

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roleCounts, setRoleCounts] = useState({});

  // Calculate total team size based on role requirements (including team lead)
  const calculateTotalTeamSize = () => {
    const totalRequired = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);
    return totalRequired + 1; // +1 for team lead
  };

  // Update teamSize whenever roleCounts changes
  useEffect(() => {
    const totalSize = calculateTotalTeamSize();
    setFormData(prev => ({
      ...prev,
      teamSize: totalSize.toString()
    }));
  }, [roleCounts]);

  const roleOptions = [
    { value: 'Frontend Developer', label: 'Frontend Developer' },
    { value: 'Backend Developer', label: 'Backend Developer' },
    { value: 'Fullstack Developer', label: 'Fullstack Developer' },
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'Mobile App Developer', label: 'Mobile App Developer' },
    { value: 'Machine Learning Engineer', label: 'Machine Learning Engineer' },
    { value: 'Data Scientist', label: 'Data Scientist' },
    { value: 'AI Developer', label: 'AI Developer' },
    { value: 'Embedded Systems Engineer', label: 'Embedded Systems Engineer' },
    { value: 'IoT Developer', label: 'IoT Developer' },
    { value: 'Cloud Engineer', label: 'Cloud Engineer' },
    { value: 'DevOps Engineer', label: 'DevOps Engineer' },
    { value: 'Cybersecurity Analyst', label: 'Cybersecurity Analyst' },
    { value: 'QA/Testing Engineer', label: 'QA/Testing Engineer' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Technical Writer', label: 'Technical Writer' },
    { value: 'AR/VR Developer', label: 'AR/VR Developer' },
    { value: 'Blockchain Developer', label: 'Blockchain Developer' },
    { value: 'Game Developer', label: 'Game Developer' },
    { value: 'System Designer', label: 'System Designer' },
  ];  

  const skillOptions = [
    { value: 'HTML', label: 'HTML' },
    { value: 'CSS', label: 'CSS' },
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'React', label: 'React' },
    { value: 'Vue.js', label: 'Vue.js' },
    { value: 'Next.js', label: 'Next.js' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'Express.js', label: 'Express.js' },
    { value: 'Python', label: 'Python' },
    { value: 'Django', label: 'Django' },
    { value: 'Flask', label: 'Flask' },
    { value: 'Java', label: 'Java' },
    { value: 'Spring Boot', label: 'Spring Boot' },
    { value: 'C++', label: 'C++' },
    { value: 'MySQL', label: 'MySQL' },
    { value: 'MongoDB', label: 'MongoDB' },
    { value: 'Firebase', label: 'Firebase' },
    { value: 'Git', label: 'Git' },
    { value: 'GitHub', label: 'GitHub' },
    { value: 'Figma', label: 'Figma' },
    { value: 'Canva', label: 'Canva' },
    { value: 'REST API', label: 'REST API' },
    { value: 'GraphQL', label: 'GraphQL' },
    { value: 'Linux', label: 'Linux' },
    { value: 'AWS', label: 'AWS' },
    { value: 'Docker', label: 'Docker' },
    { value: 'Postman', label: 'Postman' },
    { value: 'Machine Learning', label: 'Machine Learning' },
    { value: 'Deep Learning', label: 'Deep Learning' },
    { value: 'NLP', label: 'NLP' },
    { value: 'TensorFlow', label: 'TensorFlow' },
    { value: 'OpenCV', label: 'OpenCV' },
    { value: 'Data Structures', label: 'Data Structures' },
    { value: 'Algorithms', label: 'Algorithms' },
    { value: 'Problem Solving', label: 'Problem Solving' },
  ];
  
  const projectTypeOptions = [
    { value: 'Hackathon', label: 'Hackathon' },
    { value: 'College Project', label: 'College Project' },
    { value: 'Open Innovation', label: 'Open Innovation' },
    { value: 'Paper Publication', label: 'Paper Publication' },
  ];

  const projectStatusOptions = [
    { value: 'On hold', label: 'On hold' },
    { value: 'On progress', label: 'On progress' },
    { value: 'Not Started', label: 'Not Started' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleSelection = (selected) => {
    setSelectedRoles(selected || []);
    
    // Initialize role counts for newly selected roles with default value 1
    const newRoleCounts = {};
    selected?.forEach(role => {
      newRoleCounts[role.value] = roleCounts[role.value] || 1;
    });
    
    setRoleCounts(newRoleCounts);
  };

  const handleRoleCountChange = (role, count) => {
    const newCount = parseInt(count) || 1;
    // Limit between 1 and 10
    const validatedCount = Math.max(1, Math.min(10, newCount));
    
    setRoleCounts(prev => ({
      ...prev,
      [role]: validatedCount
    }));
  };

  const handleClose = () => {
    setShowAddProjectModal(false);
  };

  async function handleAddProject(e) {
    e.preventDefault();

    // Validate required fields
    if (!formData.projectName || !formData.projectDescription || !formData.teamName || 
        !formData.projectType || !formData.projectDuration || !formData.projectStatus || 
        selectedRoles.length === 0 || formData.skills.length === 0) {
      toast.info("Please fill in all required fields");
      return;
    }

    // Validate that all roles have counts
    for (const role of selectedRoles) {
      if (!roleCounts[role.value] || roleCounts[role.value] < 1) {
        toast.error(`Please specify the number of members needed for ${role.label}`);
        return;
      }
    }

    // Calculate total team size (including team lead)
    const totalRequiredMembers = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);
    const finalTeamSize = totalRequiredMembers + 1; // +1 for team lead

    // Create role requirements array
    const roleRequirements = selectedRoles.map(role => ({
      role: role.value,
      requiredCount: roleCounts[role.value],
      filledCount: 0
    }));

    const preparedData = {
      projectName: formData.projectName,
      projectDescription: formData.projectDescription,
      teamName: formData.teamName,
      teamLeadName: user.username,
      teamLeadId: user.id,
      roles: selectedRoles.map((r) => r.value),
      roleRequirements: roleRequirements,
      projectType: formData.projectType,
      projectDuration: formData.projectDuration,
      projectStatus: formData.projectStatus,
      skills: formData.skills.map((s) => s.value),
      projectLink: formData.projectLink || "",
      prototypeLink: formData.prototypeLink || "",
      referenceLink: formData.referenceLink || "",
      teamSize: finalTeamSize,
      teamMembers: [
        {
          name: user.username,
          role: 'Team Lead',
          userid: user.id
        }
      ]
    };    

    try {
      const response = await fetch('http://localhost:8000/projects/project-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Project created successfully");
        if (onProjectAdded) onProjectAdded();
        setShowAddProjectModal(false);
      } else {
        toast.error("Error creating project: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      toast.error("Error creating project: " + error.message);
    }
  }

  // Calculate total members for display
  const totalMembersNeeded = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);
  const totalTeamSize = totalMembersNeeded + 1; // Including team lead

  return (
    <AnimatePresence>
      <motion.div
        className='fixed top-0 left-0 w-full h-full bg-[#00000090] flex items-center justify-center z-50'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className='bg-white w-[50%] min-w-[350px] max-h-[90%] overflow-y-auto no-scrollbar p-6 rounded-lg shadow-lg'
          initial={{ scale: 0.8, opacity: 0, y: -40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className='text-2xl font-bold text-gray-800 mb-4 text-center'>Create New Project</h2>
          <form onSubmit={handleAddProject} className='flex flex-col gap-3'>
            <input 
              type="text" 
              name="projectName" 
              value={formData.projectName} 
              onChange={handleChange} 
              placeholder='Project Name *' 
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500' 
              required
            />
            
            <textarea
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleChange}
              placeholder='Project Description *'
              className='w-full p-2 border border-gray-300 rounded-md min-h-[100px] focus:outline-none focus:ring-2 focus:ring-sky-500'
              required
              rows="4"
            />

            <input 
              type="text" 
              name="teamName" 
              value={formData.teamName} 
              onChange={handleChange} 
              placeholder='Team Name *' 
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500' 
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Roles and Required Count *</label>
              <Select
                isMulti
                name="roles"
                options={roleOptions}
                value={selectedRoles}
                onChange={handleRoleSelection}
                placeholder="Select Roles"
                classNamePrefix="select"
                className="text-sm"
              />
              
              {selectedRoles.length > 0 && (
                <div className="mt-4 space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">Set number of members needed for each role:</p>
                  {selectedRoles.map((role) => (
                    <div key={role.value} className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 w-1/2">{role.label}</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={roleCounts[role.value] || 1}
                        onChange={(e) => handleRoleCountChange(role.value, e.target.value)}
                        className="w-20 p-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <span className="text-xs text-gray-500">member(s)</span>
                    </div>
                  ))}
                  
                  {/* Summary of team size */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Team Lead:</span>
                      <span>1 (You)</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="font-medium">Team Members:</span>
                      <span>{totalMembersNeeded}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1 font-semibold text-sky-600">
                      <span>Total Team Size:</span>
                      <span>{totalTeamSize}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Select
                name="projectType"
                options={projectTypeOptions}
                value={projectTypeOptions.find(option => option.value === formData.projectType)}
                onChange={(selected) => setFormData({ ...formData, projectType: selected.value })}
                placeholder="Select Project Type *"
                classNamePrefix="select"
                className="flex-1 text-sm"
                required
              />
              <Select
                name="projectStatus"
                options={projectStatusOptions}
                value={projectStatusOptions.find(option => option.value === formData.projectStatus)}
                onChange={(selected) => setFormData({ ...formData, projectStatus: selected.value })}
                placeholder="Select Project Status *"
                classNamePrefix="select"
                className="flex-1 text-sm"
                required
              />
            </div>

            <div className="flex gap-4">
              <input 
                type="number" 
                name="projectDuration" 
                value={formData.projectDuration} 
                onChange={handleChange} 
                placeholder="Project Duration (months) *" 
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500" 
                required
                min="1"
              />
            </div>

            <Select
              isMulti
              name="skills"
              options={skillOptions}
              value={formData.skills}
              onChange={(selected) => setFormData({ ...formData, skills: selected })}
              placeholder="Select Skills *"
              classNamePrefix="select"
              className="text-sm"
              required
            />

            <input 
              type="text" 
              name="projectLink" 
              value={formData.projectLink} 
              onChange={handleChange} 
              placeholder='Project Link (optional)' 
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500' 
            />
            
            <input 
              type="text" 
              name="prototypeLink" 
              value={formData.prototypeLink} 
              onChange={handleChange} 
              placeholder='Prototype Link (optional)' 
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500' 
            />
            
            <input 
              type="text" 
              name="referenceLink" 
              value={formData.referenceLink} 
              onChange={handleChange} 
              placeholder='Reference Link (optional)' 
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500' 
            />
            
            <div className='flex justify-between mt-4'>
              <button 
                type='button' 
                onClick={handleClose} 
                className='text-gray-600 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors'
              >
                Cancel
              </button>
              <button 
                type='submit' 
                className='bg-sky-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-sky-600 transition-colors'
              >
                Create Project
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddProjectModal;