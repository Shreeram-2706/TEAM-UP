import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import MessageArea from '../../components/ProjectDiscussionComponents/MessageArea.jsx';
import Header from '../../components/Header.jsx';
import DiscussStatistics from '../../components/ProjectDiscussionComponents/DiscussStatistics.jsx';
import FileStack from '../../components/ProjectDiscussionComponents/FileStack.jsx';
import UserContext from '../../Context/UserContext';
import Error403 from '../../pages/AuthPages/Error403Page';
import { toast } from 'react-toastify';

const socket = io('http://localhost:8000');

const ProjectDiscussion = () => {
  const { id: projectID } = useParams();
  const { user } = useContext(UserContext); 
  const [messages, setMessages] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/projects/${projectID}`);
      if (!res.ok) {
        toast.error('Failed to fetch project data');
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProjectData(data);

      // Check if user is in teamMembers array or is the team lead
      const isTeamMember = data.teamMembers?.some(
        (member) => member.userid === user?.id
      ) || user?.id === data.teamLeadId;

      setHasAccess(isTeamMember);
    } catch (err) {
      toast.error('Error checking access: ' + err.message);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && projectID) {
      fetchProjectData();
    }
  }, [projectID, user?.id, refreshKey]);

  useEffect(() => {
    if (!hasAccess) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:8000/messages/${projectID}`);
        const data = await res.json();
        setMessages(data.data || []);
      } catch (err) {
        toast.error('Error fetching messages');
      }
    };

    fetchMessages();

    socket.emit('joinProject', projectID);
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.emit('leaveProject', projectID);
    };
  }, [projectID, hasAccess]);

  const handleNewMessage = useCallback((newMessage) => {
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim()) return;

    if (!user?.id || !user?.username) {
      toast.error('User not found');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: projectID,
          projectID: projectID,
          senderID: user.id,
          name: user.username,
          message: messageContent,
          teamLeadId: projectData?.teamLeadId // Added teamLeadId
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (err) {
      toast.error('Failed to send message: ' + err.message);
    }
  };

  const handleMemberRemoved = (updatedProject) => {
    if (updatedProject) {
      setProjectData(prev => ({
        ...prev,
        teamMembers: updatedProject.teamMembers,
        roleRequirements: updatedProject.roleRequirements
      }));
      toast.success("Team member removed successfully");
    } else {
      // Refresh the project data
      setRefreshKey(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Error403/>;
  }

  if (!projectData) {
    return (
      <div>
        <Header />
        <div className="text-center mt-10">
          <p className="text-red-500">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className='grid grid-cols-8 mt-3 mx-2 gap-4'>
        <div className="col-span-2">
          <DiscussStatistics 
            teamMembers={projectData?.teamMembers || []} 
            projectName={projectData?.projectName || ''}
            projectId={projectData?._id}
            currentUserId={user?.id}
            teamLeadId={projectData?.teamLeadId}
            onMemberRemoved={handleMemberRemoved}
          />
        </div>
        <div className="col-span-4">
          <MessageArea 
            messages={messages}
            currentUserId={user?.id}
            onSendMessage={handleSendMessage}
          />
        </div>
        <div className="col-span-2">
          <FileStack projectID={projectID} />
        </div>
      </div>
    </>
  );
};

export default ProjectDiscussion;