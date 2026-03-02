import React, { useState } from 'react'
import Header from '../../components/Header'
import ProjectsHeader from '../../components/ProjectDashboardComponents/ProjectsHeader';
import ProjectsList from '../../components/ProjectDashboardComponents/ProjectsList'

const Projects = () => {
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('active'); // 'active' or 'completed'

  return (
    <>
      <Header/>
      <ProjectsHeader 
        showAddProjectModal={showAddProjectModal} 
        setShowAddProjectModal={setShowAddProjectModal}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      <ProjectsList 
        showAddProjectModal={showAddProjectModal}
        activeFilter={activeFilter}
      />
    </>
  )
}

export default Projects