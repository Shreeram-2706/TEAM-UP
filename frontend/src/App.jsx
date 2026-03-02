import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignUp from './pages/AuthPages/SignUpPage.jsx';
import LogIn from './pages/AuthPages/LoginPage.jsx';
import ForgotPwd from './pages/AuthPages/ForgotPasswordPage.jsx';
import ResetPwd from './pages/AuthPages/ResetPasswordPage.jsx';
import VerifyCode from './pages/AuthPages/VerifyOtpPage.jsx';
import Error403 from './pages/AuthPages/Error403Page.jsx';
import FacultyDashboard from './pages/DashboardPages/FacultyDashboard.jsx';
import UserDashboard from './pages/DashboardPages/StudentDashboard.jsx';
import DigestPage from './pages/EventsPages/EventsPage.jsx';
import ExploreProjects from './pages/ExploreProjectPages/ExploreProjects.jsx';
import ProjectsDashboard from './pages/ProjectDashboardPages/ProjectDashboard.jsx'; // Fixed: Added .jsx extension
import ProjectDiscussion from './pages/ProjectDiscussionPages/ProjectDiscussion.jsx'; // Fixed: Added .jsx extension
import Projects from './pages/ProjectDashboardPages/Projects.jsx';
import UserContext from './Context/UserContext';
import TeamMembersList from './components/ProjectDashboardComponents/TeamMembersList.jsx'; // Fixed: Added .jsx extension
import { ToastContainer, Bounce } from 'react-toastify';
import AccountDetailsPage from './pages/ProfilePages/ProfilePage.jsx';

const App = () => {
  const [fPwdStatus, setFPwdStatus] = useState(false);
  const [rPwdStatus, setRPwdStatus] = useState(false);
  const [otpStatus, setOtpStatus] = useState(false);

  const { user } = useContext(UserContext);
  const token = localStorage.getItem("token");

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        toastClassName="text-md !bg-white !text-black !rounded-lg !font-sans"
        progressClassName="!bg-sky-400"
        transition={Bounce}
      />
      <Router>
        <Routes>
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/login' element={token ? <Navigate to='/dashboard' replace /> : <LogIn setFPwdStatus={setFPwdStatus} />} />
          <Route path='/forgot-password' element={fPwdStatus ? <ForgotPwd setOtpStatus={setOtpStatus} /> : <Error403 />} />
          <Route path='/verify-code' element={otpStatus ? <VerifyCode setRPwdStatus={setRPwdStatus} /> : <Error403 />} />
          <Route path='/reset-password' element={rPwdStatus ? <ResetPwd setOtpStatus={setOtpStatus} setFPwdStatus={setFPwdStatus} setRPwdStatus={setRPwdStatus} /> : <Error403 />} />
          <Route path='/dashboard' element={token ? (user?.isFaculty ? <FacultyDashboard /> : <UserDashboard />) : <Navigate to='/login' replace />} />
          <Route path='/events' element={token ? <DigestPage /> : <Navigate to='/login' replace />} />
          <Route path='/events/:id' element={token ? <DigestPage /> : <Navigate to='/login' replace />} />
          <Route path='/explore-projects' element={token ? <ExploreProjects /> : <Navigate to='/login' replace />} />
          <Route path='/projects' element={token ? <Projects /> : <Navigate to='/login' replace />} />
          <Route path='/project-dashboard/:id' element={token ? <ProjectsDashboard /> : <Navigate to='/login' replace />} />
          <Route path='/discussion/:id' element={token ? <ProjectDiscussion /> : <Navigate to='/login' replace />} />
          <Route
            path="/team-members/:projectId"
            element={token ? <TeamMembersList /> : <Navigate to='/login' replace />}
          />
          <Route path="/profile/:id" element={<AccountDetailsPage />} />
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;