// components/ProjectDashboardComponents/TeamMembersList.js
import React, { useState } from 'react';
import { UserMinus, Shield, User } from 'lucide-react';
import { toast } from 'react-toastify';

const TeamMembersList = ({ project, currentUserId, onMemberRemoved }) => {
  const [removingMember, setRemovingMember] = useState(null);
  const isTeamLead = currentUserId === project.teamLeadId;

  const handleRemoveMember = async (member) => {
    if (!isTeamLead) return;
    
    setRemovingMember(member.userid);
    
    try {
      const response = await fetch(`http://localhost:8000/projects/${project._id}/remove-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: member.userid,
          role: member.role
        }),
      });

      if (!response.ok) throw new Error('Failed to remove member');

      toast.success(`${member.name} has been removed from the project`);
      if (onMemberRemoved) onMemberRemoved();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setRemovingMember(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Team Members</h3>
      <div className="space-y-3">
        {project.teamMembers?.map((member) => (
          <div key={member.userid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                {member.role === 'Team Lead' ? (
                  <Shield size={20} className="text-indigo-600" />
                ) : (
                  <User size={20} className="text-gray-600" />
                )}
              </div>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>
            
            {isTeamLead && member.role !== 'Team Lead' && (
              <button
                onClick={() => handleRemoveMember(member)}
                disabled={removingMember === member.userid}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Remove member"
              >
                <UserMinus size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembersList;