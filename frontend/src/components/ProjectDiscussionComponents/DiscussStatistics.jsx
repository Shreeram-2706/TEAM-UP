import React, { useState } from 'react';
import { Figma, Github, UserMinus } from 'lucide-react';
import GroupDiscussion from './../../assets/GroupDiscussion.png';
import { toast } from 'react-toastify';

const DiscussStatistics = ({ teamMembers, projectName, projectId, currentUserId, teamLeadId, onMemberRemoved }) => {
  const [removingMember, setRemovingMember] = useState(null);
  const isTeamLead = currentUserId === teamLeadId;

  const handleRemoveMember = async (member) => {
    if (!isTeamLead) return;
    
    // Check if projectId exists
    if (!projectId) {
      toast.error('Project ID is missing');
      return;
    }

    // Check if teamLeadId exists
    if (!teamLeadId) {
      toast.error('Team Lead ID is missing');
      return;
    }
    
    setRemovingMember(member.userid);
    
    try {
      const response = await fetch(`http://localhost:8000/projects/${projectId}/remove-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: member.userid,
          role: member.role,
          teamLeadId: teamLeadId, // Add teamLeadId to the request
          currentUserId: currentUserId // Optional: send current user ID for verification
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member');
      }

      toast.success(`${member.name} has been removed from the project`);
      
      // Call onMemberRemoved with the updated project data if available
      if (onMemberRemoved) {
        onMemberRemoved(data.project || data);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.message || 'Failed to remove member');
    } finally {
      setRemovingMember(null);
    }
  };

  return (
    <div className='col-span-2 p-2 h-[100%] border border-gray-300 rounded-lg shadow-md bg-white'>
      <h1 className='text-xl font-semibold text-sky-600 border-b border-sky-600 mt-2'>{projectName}</h1>

      <div className='flex'>
        <img src={GroupDiscussion} alt="Group Discussion" className='w-[80%] m-auto h-[80%] rounded-lg' />
      </div>

      <div className='mt-4 px-2'>
        <div className='flex justify-between items-center mb-2'>
          <h2 className='text-lg font-medium text-gray-700'>Current Team</h2>
          <div className='flex items-center space-x-2'>
            <a
              href='https://github.com'
              target='_blank'
              rel='noopener noreferrer'
              className='bg-gray-200 hover:bg-gray-300 p-2 rounded-full'
            >
              <Github className='w-4 h-4 text-gray-700' />
            </a>
            <a
              href='https://figma.com'
              target='_blank'
              rel='noopener noreferrer'
              className='bg-gray-200 hover:bg-gray-300 p-2 rounded-full'
            >
              <Figma className='w-4 h-4 text-gray-700' />
            </a>
            <button className='text-sm bg-sky-500 text-white px-3 py-1 rounded-md hover:bg-sky-700 transition-all duration-200'>
              Manage
            </button>
          </div>
        </div>

        <ul className='no-scrollbar space-y-2 p-3 bg-gray-100 overflow-y-auto max-h-[200px]'>
          {teamMembers?.map((member, index) => (
            <li
              key={index}
              className='flex justify-between items-center bg-white px-3 py-2 rounded-md group'
            >
              <div className='flex items-center gap-2'>
                <span className='text-gray-800 text-sm font-medium'>{member.name}</span>
                {member.role === 'Team Lead' && (
                  <span className='text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full'>
                    Lead
                  </span>
                )}
              </div>
              
              <div className='flex items-center gap-2'>
                <span className='bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1 rounded-full'>
                  {member.role}
                </span>
                
                {/* Remove member button - only visible to team lead and not for team lead themselves */}
                {isTeamLead && member.role !== 'Team Lead' && (
                  <button
                    onClick={() => handleRemoveMember(member)}
                    disabled={removingMember === member.userid}
                    className='opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-600 hover:bg-red-50 rounded-full disabled:opacity-50'
                    title={`Remove ${member.name} from project`}
                  >
                    {removingMember === member.userid ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <UserMinus size={16} />
                    )}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        
        {/* Show team lead info */}
        {isTeamLead && (
          <div className='mt-3 text-xs text-gray-500 italic'>
            You can remove team members by clicking the <UserMinus size={12} className='inline' /> icon next to their name
          </div>
        )}

        {/* Show project info for debugging (optional - remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className='mt-2 text-xs text-gray-400'>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussStatistics;