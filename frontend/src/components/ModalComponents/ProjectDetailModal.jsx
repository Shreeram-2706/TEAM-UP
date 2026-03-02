import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Users, Clock, Star, Group, UserCheck, AlertCircle } from 'lucide-react';
import UserContext from '../../Context/UserContext';
import { toast } from 'react-toastify';

const ProjectDetailModal = ({ project, onClose, onJoinSuccess }) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [selectedRole, setSelectedRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const username = user?.username || "";
  const id = user?.id || '';

  // Check if user is already a team member
  const isTeamMember = project.teamMembers?.some(member => member.userid === id);
  
  // Check if user has already sent a request
  const hasPendingRequest = project.joinrequests?.some(
    request => request.userid === id && request.status === 'pending'
  );

  // Get role availability
  const getRoleAvailability = (role) => {
    const roleReq = project.roleRequirements?.find(r => r.role === role);
    if (roleReq) {
      const filled = roleReq.filledCount || 0;
      const required = roleReq.requiredCount || 1;
      return {
        filled,
        required,
        available: filled < required,
        spotsLeft: required - filled
      };
    }
    // Fallback to old method if roleRequirements doesn't exist
    return { filled: 0, required: 1, available: true, spotsLeft: 1 };
  };

  // Filter available roles
  const availableRoles = project.roles?.filter(role => {
    const availability = getRoleAvailability(role);
    return availability.available;
  }) || [];

  const handleNavigate = () => {
    if (project.referenceLink) {
      window.open(project.referenceLink, '_blank');
    }
  };

  const handleAskToJoin = async () => {
    if (!selectedRole) {
      toast.warn("Please select a role before joining!");
      return;
    }

    const availability = getRoleAvailability(selectedRole);
    if (!availability.available) {
      toast.error("This role is no longer available!");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      projectName: project.projectName,
      projectId: project._id,
      userId: id,
      username: username,
      teamLeadId: project.teamLeadId,
      role: selectedRole,
    };
    
    try {
      const response = await fetch('http://localhost:8000/notify/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) throw new Error("Request failed");
  
      toast.success("Request sent successfully!");
      if (onJoinSuccess) onJoinSuccess();
      onClose();
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex justify-between items-center p-6 pb-0">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                  <Group size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{project.projectName}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Project Description */}
            {project.projectDescription && (
              <div className="px-6 pt-4">
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {project.projectDescription}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="text-gray-500 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Team</p>
                    <p className="font-medium">{project.teamName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserCheck className="text-gray-500 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Team Lead</p>
                    <p className="font-medium">{project.teamLeadName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="text-gray-500 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium">{project.projectDuration} month{project.projectDuration !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Star className="text-gray-500 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.projectStatus === 'Active' ? 'bg-green-100 text-green-800' :
                      project.projectStatus === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.projectStatus}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {project.referenceLink && (
                  <button
                    onClick={handleNavigate}
                    className="flex items-center gap-2 text-sky-500 hover:text-sky-700 text-sm mt-4"
                  >
                    <ExternalLink size={16} />
                    Explore the Event 
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Open Roles</p>
                  <div className="space-y-2">
                    {project.roles.map((role, i) => {
                      const availability = getRoleAvailability(role);
                      const isAvailable = availability.available;
                      
                      return (
                        <div 
                          key={i}
                          className={`flex flex-col p-3 rounded-lg border ${
                            selectedRole === role 
                              ? 'bg-indigo-50 border-indigo-200' 
                              : isAvailable 
                                ? 'bg-gray-50 border-gray-200' 
                                : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{role}</span>
                            {!isAvailable && (
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                                Full
                              </span>
                            )}
                            {isAvailable && (
                              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                {availability.spotsLeft} spot{availability.spotsLeft !== 1 ? 's' : ''} left
                              </span>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2 max-w-[150px]">
                              <div 
                                className="bg-indigo-600 h-1.5 rounded-full" 
                                style={{ width: `${(availability.filled / availability.required) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {availability.filled}/{availability.required}
                            </span>
                          </div>
                          
                          {isAvailable && !isTeamMember && !hasPendingRequest && (
                            <button
                              onClick={() => setSelectedRole(role)}
                              className={`mt-2 text-xs px-2 py-1 rounded ${
                                selectedRole === role 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {selectedRole === role ? 'Selected' : 'Select'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Team Members ({project.teamMembers.length}/{project.teamSize})</p>
                  <div className="flex flex-wrap gap-2">
                    {project.teamMembers.slice(0, 5).map((member, i) => (
                      <div 
                        key={i}
                        onClick={() => navigate(`/profile/${member.userid}`)}
                        className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-100"
                      >
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: stringToColor(member.name) }}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <span>{member.name.split(' ')[0]}</span>
                        {member.role && (
                          <span className="ml-1 px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            {member.role}
                          </span>
                        )}
                      </div>
                    ))}
                    {project.teamMembers.length > 5 && (
                      <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        +{project.teamMembers.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Conditional Footer */}
            {!isTeamMember && !hasPendingRequest && (
              <div className="border-t border-gray-200 p-4 flex justify-between items-center">
                <div className="flex-1">
                  {availableRoles.length > 0 ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full max-w-[200px]"
                    >
                      <option value="">Select a role</option>
                      {availableRoles.map((role, i) => (
                        <option key={i} value={role}>{role}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle size={16} />
                      <span className="text-sm">No roles available at the moment</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAskToJoin}
                  disabled={!selectedRole || isSubmitting || availableRoles.length === 0}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    selectedRole && availableRoles.length > 0
                      ? 'bg-sky-500 text-white hover:bg-sky-600' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Request to Join'}
                </button>
              </div>
            )}

            {hasPendingRequest && (
              <div className="border-t border-gray-200 p-4 text-center text-amber-600 bg-amber-50">
                You have already sent a request to join this project
              </div>
            )}

            {isTeamMember && (
              <div className="border-t border-gray-200 p-4 text-center text-green-600 bg-green-50">
                You are already a member of this project
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

export default ProjectDetailModal;