import React, { useEffect, useState, useContext } from 'react';
import KanbanBoard from '../../components/ProjectDashboardComponents/KanbanBoard';
import Header from '../../components/Header';
import DashboardHeader from '../../components/ProjectDashboardComponents/DashboardHeader';
import Error403 from '../../pages/AuthPages/Error403Page';
import { useParams } from 'react-router-dom';
import UserContext from '../../Context/UserContext';
import { toast } from 'react-toastify';

const ProjectDashboard = () => {
  const { id } = useParams();
  const [refresh, setRefresh] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const userId = user?.id || '';

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/projects/${id}`);
        
        if (!res.ok) {
          console.error('Failed to fetch project data');
          setHasAccess(false);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProjectData(data);

        // Check if user is in teamMembers array or is the team lead
        const isTeamMember = data.teamMembers?.some(
          (member) => member.userid === userId
        ) || userId === data.teamLeadId;

        setHasAccess(isTeamMember);
      } catch (err) {
        console.error('Error fetching project:', err.message);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, userId, refresh]);

  const updateTaskColumns = async (updatedColumns) => {
    try {
      // Include teamLeadId in the update request
      const response = await fetch(`http://localhost:8000/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          todo: updatedColumns['To Do'],
          onprogress: updatedColumns['Under Progress'],
          review: updatedColumns['Review'],
          done: updatedColumns['Done'],
          teamLeadId: projectData?.teamLeadId, // Added teamLeadId
          updatedBy: userId // Optional: track who updated
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tasks');
      }

      const updatedData = await response.json();
      setProjectData(updatedData); // Update local state with new data
      toast.success('Tasks updated successfully');
      setRefresh(!refresh);
    } catch (err) {
      console.error('Error updating tasks:', err.message);
      toast.error('Failed to update tasks: ' + err.message);
    }
  };

  const handleProjectUpdate = (updatedData) => {
    setProjectData(updatedData);
    setRefresh(!refresh);
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
    return <Error403 />;
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
    <div>
      <Header />
      <DashboardHeader
        data={projectData}
        setRefresh={setRefresh}
        refresh={refresh}
        onProjectUpdate={handleProjectUpdate} // Pass this if DashboardHeader needs it
        currentUserId={userId}
      />
      {projectData && (
        <KanbanBoard
          data={projectData}
          onUpdateColumns={updateTaskColumns}
          currentUserId={userId}
          teamLeadId={projectData.teamLeadId}
        />
      )}
    </div>
  );
};

export default ProjectDashboard;