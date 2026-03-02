import React from 'react';
import AddProjectModal from '../ModalComponents/AddProjectModal';
import 'react-toastify/dist/ReactToastify.css';

const ProjectsHeader = ({ showAddProjectModal, setShowAddProjectModal, activeFilter, setActiveFilter }) => {
  return (
    <>
      <div className="flex items-center justify-between p-4 mx-10 bg-white shadow-sm">
        <span className="text-2xl font-bold text-gray-800">Your Projects</span>
        <div className="flex items-center gap-4">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${
                activeFilter === 'active' ? 'bg-white shadow-sm text-sky-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Projects
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${
                activeFilter === 'completed' ? 'bg-white shadow-sm text-sky-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Completed Projects
            </button>
          </div>
          <button
            onClick={() => setShowAddProjectModal(true)}
            className="bg-sky-500 text-white px-4 py-1 rounded-lg shadow-md hover:bg-sky-600 transition duration-300"
          >
            Start A New Project
          </button>
        </div>
      </div>

      {showAddProjectModal && (
        <AddProjectModal setShowAddProjectModal={setShowAddProjectModal} />
      )}
    </>
  );
};

export default ProjectsHeader;