import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../Context/UserContext';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const ProjectsList = ({ showAddProjectModal }) => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useContext(UserContext);
  const Id = user?.id || '';
  const navigate = useNavigate();

  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 85%)`;
  }

  useEffect(() => {
    fetch('http://localhost:8000/projects/my-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: Id }),
    })
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error('Error fetching projects:', err));
  }, [showAddProjectModal, Id]);

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

  return (
    <div className="p-6">
      {projects.length === 0 ? (
        <div className="flex items-center justify-center h-[60vh] text-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">You're not engaged with any projects</h2>
            <p className="text-sm text-gray-500">
              Looks like you're not part of any active projects yet. Start exploring or create one to get going!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-gray-200 cursor-pointer"
              onClick={() => handleProjectClick(project._id)}
            >
              {/* Delete button (only for team lead) */}
              {project.teamLeadId === Id && (
                <button
                  onClick={(e) => openModal(e, project._id)}
                  className="absolute top-3 right-3 z-10 p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors"
                  title="Delete project"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div className="relative px-5 pt-5 pb-3 border-b border-gray-100">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {project.projectName}
                  </h3>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    project.projectType === 'Internal' 
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' 
                      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                  }`}>
                    {project.projectType}
                  </span>
                </div>
              </div>

              <div className="relative px-5 py-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Team Lead</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                      {project.teamLeadName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {project.teamLeadName}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-2">Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          i % 3 === 0 ? 'bg-blue-50 text-blue-700' :
                          i % 3 === 1 ? 'bg-purple-50 text-purple-700' :
                          'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs">
                        +{project.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Duration</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {project.projectDuration} months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        project.projectStatus === 'Active' ? 'bg-green-500' :
                        project.projectStatus === 'On Hold' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></span>
                      <p className="text-sm font-semibold text-gray-700">
                        {project.projectStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer - Team Members */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    {project.teamMembers.length} team member{project.teamMembers.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 3).map((member, i) => (
                      <div 
                        key={i} 
                        className="w-7 h-7 rounded-full bg-white border-2 border-white flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm"
                        style={{ backgroundColor: stringToColor(member.name), zIndex: 3 - i }}
                      >
                        {member.name.charAt(0)}
                      </div>
                    ))}
                    {project.teamMembers.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500 shadow-sm">
                        +{project.teamMembers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
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
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;