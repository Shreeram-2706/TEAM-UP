import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Header from '../../components/Header';
import ProfileHeader from '../../components/ProfilePageComponents/ProfileHeader';
import ProjectsSection from '../../components/ProfilePageComponents/ProjectsSection';
import EditProfileModal from '../../components/ProfilePageComponents/EditProfileModal';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const ProfilePage = () => {
  const { id } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState({
    username: 'Loading...',
    email: '',
    department: '',
    role: '',
    profilePicture: '',
    skills: [],
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    isFaculty: false,
    isAvailable: false,
    description: ''
  });

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({
    todo: 0,
    inProgress: 0,
    overdue: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Get current user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, []);

  const isOwnProfile = currentUser && currentUser.id === id;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const userResponse = await fetch(`http://localhost:8000/users/${id}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userData = await userResponse.json();
        
        // Ensure profile picture URL is properly formatted
        if (userData.profilePicture && !userData.profilePicture.startsWith('http')) {
          userData.profilePicture = `http://localhost:8000${userData.profilePicture}`;
        }
        
        setUser(userData);

        const projectsResponse = await fetch('http://localhost:8000/projects/my-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: id })
        });
        
        if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);

        processTasks(projectsData, id);

      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  const processTasks = (projects, userId) => {
    const today = new Date();
    let todo = 0;
    let inProgress = 0;
    let overdue = 0;
    let completed = 0;

    projects.forEach(project => {
      project.todo?.forEach(task => {
        if (task.teamMemberID === userId) {
          const dueDate = new Date(task.enddate);
          dueDate < today ? overdue++ : todo++;
        }
      });

      project.onprogress?.forEach(task => {
        if (task.teamMemberID === userId) {
          const dueDate = new Date(task.enddate);
          dueDate < today ? overdue++ : inProgress++;
        }
      });

      project.review?.forEach(task => {
        if (task.teamMemberID === userId) {
          const dueDate = new Date(task.enddate);
          dueDate < today ? overdue++ : inProgress++;
        }
      });

      project.done?.forEach(task => {
        if (task.teamMemberID === userId) completed++;
      });
    });

    setTasks({ todo, inProgress, overdue, completed });
  };

  const handleUpdateUser = async (updatedData) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Ensure profile picture URL is properly formatted
      if (updatedUser.profilePicture && !updatedUser.profilePicture.startsWith('http')) {
        updatedUser.profilePicture = `http://localhost:8000${updatedUser.profilePicture}`;
      }
      
      setUser(updatedUser);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update failed:', error);
      alert(error.message);
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch(`http://localhost:8000/users/${id}/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      const data = await response.json();
      
      // Update user state with the new profile picture URL
      setUser(prev => ({ 
        ...prev, 
        profilePicture: data.profilePicture 
      }));
      
      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="text-center text-red-500">
            <p>Error loading profile:</p>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ProfileHeader 
          user={user} 
          isOwnProfile={isOwnProfile}
          onEdit={() => setIsEditModalOpen(true)}
          onImageUpload={handleImageUpload}
        />
        
        <ProjectsSection 
          projects={projects} 
          userId={id}
          tasks={tasks}
        />
      </div>
      
      <span className='text-center text-gray-500 text-sm mb-10 block'>
        A vision of <span className='text-sky-500 font-bold'>FourStacks</span>
      </span>
      
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSave={handleUpdateUser}
        />
      )}
      
      <ReactTooltip id="github-tooltip" />
      <ReactTooltip id="linkedin-tooltip" />
      <ReactTooltip id="portfolio-tooltip" />
      <ReactTooltip id="contact-tooltip" />
    </div>
  );
};

export default ProfilePage;