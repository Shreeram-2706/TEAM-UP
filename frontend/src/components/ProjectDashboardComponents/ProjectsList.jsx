import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../Context/UserContext';
import { toast } from 'react-toastify';
import { Trash2, Users, Clock, AlertCircle, GitMerge, Flag } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const ProjectsList = ({ showAddProjectModal, activeFilter }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useContext(UserContext);
  const Id = user?.id || '';
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/projects/my-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: Id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        filterProjects(data, activeFilter);
      })
      .catch((err) => console.error('Error fetching projects:', err));
  }, [showAddProjectModal, Id]);

  useEffect(() => {
    filterProjects(projects, activeFilter);
  }, [activeFilter, projects]);

  const filterProjects = (projects, filter) => {
    if (filter === 'active') {
      setFilteredProjects(projects.filter(p => p.projectStatus !== 'Completed'));
    } else {
      setFilteredProjects(projects.filter(p => p.projectStatus === 'Completed'));
    }
  };

  const handleProjectClick = (id) => {
    navigate(`/project-dashboard/${id}`);
  };

  const openModal = (e, id) => {
    e.stopPropagation();
    setProjectToDelete(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:8000/projects/delete/${projectToDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== projectToDelete));
        toast.success("Project deleted successfully");
      } else {
        toast.error("Failed to delete project");
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error("Error deleting project");
    } finally {
      setIsDeleting(false);
      setShowModal(false);
      setProjectToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {activeFilter === 'active' 
              ? "You don't have any active projects" 
              : "You don't have any completed projects"}
          </h2>
          <p className="text-sm text-gray-500 max-w-md mb-6">
            {activeFilter === 'active'
              ? "Looks like you're not part of any active projects yet. Start exploring or create one to get going!"
              : "Completed projects will appear here once you finish your active projects."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => {
            const totalIssues =
              (project.todo?.length || 0) +
              (project.onprogress?.length || 0) +
              (project.review?.length || 0);

            return (
              <div
                key={index}
                onClick={() => handleProjectClick(project._id)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-indigo-100 relative overflow-hidden"
              >
                <div className="p-5 pb-3 flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 truncate">
                      {project.projectName}
                    </h2>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.projectType === 'Hackathon' ? 'bg-purple-100 text-purple-800' :
                      project.projectType === 'College Project' ? 'bg-blue-100 text-blue-800' :
                      project.projectType === 'Personal Project' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.projectType}
                    </span>
                  </div>
                  {project.teamLeadId === Id && (
                    <button
                      onClick={(e) => openModal(e, project._id)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors z-10"
                      title="Delete project"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="px-5 pb-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Team</p>
                      <p className="text-sm font-medium">{project.teamName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-lg text-green-600">
                      <Flag size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Team Lead</p>
                      <p className="text-sm font-medium">{project.teamLeadName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium">{project.projectDuration} months</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600">
                        <AlertCircle size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`text-sm font-medium px-2 py-0.5 rounded-full ${getStatusColor(project.projectStatus)}`}>
                          {project.projectStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-lg text-red-600">
                      <GitMerge size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Issues</p>
                      <p className="text-sm font-medium">{totalIssues} issues</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                <AlertCircle size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Confirm Deletion</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone and all associated data will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;