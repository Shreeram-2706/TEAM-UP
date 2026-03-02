import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import ProfileStats from './ProfileStats';
import ProjectCard from './ProjectCard';

const ProjectsSection = ({ projects, userId, tasks }) => {
  const [showCompletedProjects, setShowCompletedProjects] = useState(false);

  // Ensure projects is an array
  const projectsArray = Array.isArray(projects) ? projects : [];
  
  const filteredProjects = projectsArray.filter(project => 
    showCompletedProjects 
      ? project?.projectStatus === 'Completed' 
      : project?.projectStatus !== 'Completed'
  );

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="text-blue-500" size={20} />
          Projects & Statistics
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompletedProjects(false)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              !showCompletedProjects 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setShowCompletedProjects(true)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              showCompletedProjects 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[510px] max-h-[510px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectCard 
                  key={project?._id || Math.random()} 
                  project={project} 
                  userId={userId}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-gray-500">
                <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
                <p>No {showCompletedProjects ? 'completed' : 'active'} projects found</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <ProfileStats tasks={tasks} />
        </div>
      </div>

      {/* Move styles to a separate style tag or CSS file */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default ProjectsSection;