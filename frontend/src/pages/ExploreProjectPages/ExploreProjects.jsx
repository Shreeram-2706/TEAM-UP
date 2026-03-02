import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import ProjectDetailModal from '../../components/ModalComponents/ProjectDetailModal';
import UserContext from '../../Context/UserContext';

const ExploreProjects = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const { user } = useContext(UserContext);
  const userId = user?.id || '';

  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 85%)`;
  }

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/projects/explore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) throw new Error('Failed to fetch projects');

        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  const filteredProjects = projects.filter((project) => {
    const matchType = selectedType ? project.projectType === selectedType : true;
    const matchSkill = selectedSkill
      ? project.skills.some((skill) =>
          skill.toLowerCase().includes(selectedSkill.toLowerCase())
        )
      : true;
    const matchRole = selectedRole
      ? project.roles.some((role) =>
          role.toLowerCase().includes(selectedRole.toLowerCase())
        )
      : true;

    const notJoined = !project.teamMembers.some(
      (member) => member.userid === userId
    );

    return (
      matchType &&
      matchSkill &&
      matchRole &&
      notJoined &&
      project.teamMembers.length < project.teamSize
    );
  });

  return (
    <div>
      <Header />

      <div className="p-4 flex justify-center flex-wrap gap-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border px-4 py-2 rounded-md text-sm w-1/5"
        >
          <option value="">All Project Types</option>
          <option value="Hackathon">Hackathon</option>
          <option value="College Project">College Project</option>
          <option value="Personal Project">Personal Project</option>
          <option value="Paper Publication">Paper Publication</option>
          <option value="Open Innovation">Open Innovation</option>
        </select>

        <input
          type="text"
          placeholder="Search by Skill"
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          className="border px-4 py-2 rounded-md text-sm w-1/5"
        />

        <input
          type="text"
          placeholder="Search by Role"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border px-4 py-2 rounded-md text-sm w-1/5"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading projects...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex items-center justify-center h-[60vh] text-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No projects found matching your filters or availability.</h2>
            <p className="text-sm text-gray-500">
              Try adjusting the filters or come back later to explore new public projects.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
  {filteredProjects.map((project, index) => {
    const filledCount = project.teamMembers.length;
    const totalCount = project.teamSize;
    const emptyCount = totalCount - filledCount;
    const capacityPercentage = Math.round((filledCount / totalCount) * 100);
    
    return (
      <div
        key={index}
        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-gray-200 cursor-pointer"
        onClick={() => handleProjectClick(project)}
      >
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
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">Team Capacity</span>
              <span className="text-sm font-medium text-gray-700">
                {filledCount}/{totalCount} ({capacityPercentage}%)
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: filledCount }).map((_, i) => (
                <div 
                  key={`filled-${i}`} 
                  className={`h-4 w-4 rounded-md ${
                    capacityPercentage >= 100 ? 'bg-sky-200' :
                    capacityPercentage >= 70 ? 'bg-sky-400' :
                    'bg-sky-500'
                  }`}
                />
              ))}
              
              {Array.from({ length: emptyCount > 0 ? emptyCount : 0 }).map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  className="h-4 w-4 rounded-md bg-gray-200 border border-gray-300"
                />
              ))}
            </div>
          </div>

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

        {/* Card Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-end items-center">
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
    );
  })}
</div>
      )}

      {showProjectDetail && selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setShowProjectDetail(false)}
        />
      )}
    </div>
  );
};

export default ExploreProjects;
