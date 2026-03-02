import React, { useState, useContext, useEffect } from 'react';
import {
  List, Bell, BellRing, X, SquareKanban, SquareMousePointer,
  LayoutDashboard, RefreshCcwDot, CalendarSearch
} from 'lucide-react';
import Logo from '../assets/logo.png';
import userContext from '../Context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Profile from '../assets/default.jpg';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const sidePanelVariants = {
  hidden: (direction) => ({
    x: direction === 'left' ? '-100%' : '100%',
    opacity: 0,
  }),
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: (direction) => ({
    x: direction === 'left' ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.3 }
  }),
};

const Header = () => {
  const { user } = useContext(userContext);
  const navigate = useNavigate();
  const [isListOpen, setListOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profileImageError, setProfileImageError] = useState(false);
  const location = useLocation();
  const userId = user?.id || '';

  const fetchNotifications = () => {
    if (!userId) return;
    fetch(`http://localhost:8000/notify/${userId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch notifications');
        }
        return res.json();
      })
      .then(data => {
        const sorted = (data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(sorted);
      })
      .catch(() => {
        // Silently fail for notifications
      });
  };

  const handleAccept = (note) => {
    fetch(`http://localhost:8000/notify/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Id: userId,
        notificationId: note._id,
        userName: note.username,
        userId: note.userId,
        projectId: note.projectId,
        role: note.role
      }),
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.error || 'Failed to accept request');
        });
      }
      return res.json();
    })
    .then(data => {
      if (data.message === 'User is already a team member') {
        toast.info(`${note.username} is already a member of the project`);
      } else {
        toast.success(`${note.username} has been added to the project as ${note.role}`);
      }
      fetchNotifications();
    })
    .catch(error => {
      toast.error(error.message || 'Failed to accept request');
    });
  };

  const handleReject = (note) => {
    fetch(`http://localhost:8000/notify/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: note._id, userId: userId }),
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.error || 'Failed to reject request');
        });
      }
      return res.json();
    })
    .then(() => {
      toast.info("Request rejected");
      fetchNotifications();
    })
    .catch(error => {
      toast.error(error.message || 'Failed to reject request');
    });
  };

  const handleUsernameClick = (e, username, userid) => {
    e.stopPropagation();
    navigate(`/profile/${userid}`);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  // Reset image error when user changes
  useEffect(() => {
    setProfileImageError(false);
  }, [user?.profilePicture]);

  const navLinks = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/events", icon: <CalendarSearch size={20} />, label: "Events"},
    { to: "/explore-projects", icon: <SquareMousePointer size={20} />, label: "Explore" },
    { to: "/projects", icon: <SquareKanban size={20} />, label: "Projects" },
  ];

  const isDigestRoute = location.pathname.startsWith("/events");

  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileButton = document.querySelector('.profile-button');
      const profileModal = document.querySelector('.profile-modal');
      
      if (isProfileOpen && profileModal && !profileModal.contains(event.target) && 
          profileButton && !profileButton.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (!user?.profilePicture || user.profilePicture === 'default.jpg' || profileImageError) {
      return Profile; // Return default image
    }

    let imageUrl = user.profilePicture;
    
    // If it's a relative path, prepend the API URL
    if (!imageUrl.startsWith('http')) {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      imageUrl = `${baseUrl}${imageUrl}`;
    }

    // Add cache busting
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}v=${Date.now()}`;
  };

  // Get user initials for fallback
  const getUserInitials = () => {
    if (!user?.username) return '?';
    return user.username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='justify-between flex items-center p-4 relative'>
      <img src={Logo} alt='Logo' className='h-11 m-0' />

      <div className='navLinks h-12 center items-center px-3 rounded-xl gap-6 hidden md:flex'>
        {navLinks.map(({ to, icon, label }) => (
          <div key={to}
            className={`flex items-center gap-1 cursor-pointer text-sm duration-300 ${
              (to === "/events" && isDigestRoute)
                ? "text-sky-500"
                : location.pathname === to
                ? "text-sky-500"
                : "text-black hover:text-sky-700"
            }`}
            onClick={() => navigate(to)}>
            {icon}<p>{label}</p>
          </div>
        ))}
      </div>

      <div className='flex w-fit items-center gap-5 mx-5 bg-sky-100 p-1 px-2 rounded-lg'>
        <List size={20} className='md:hidden cursor-pointer' onClick={() => setListOpen(true)} />

        <div className='relative cursor-pointer' onClick={() => setNotificationOpen(true)}>
          {notifications.length > 0 ? <BellRing size={20} /> : <Bell size={20} />}
          {notifications.length > 0 && (
            <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full'>
              {notifications.length}
            </span>
          )}
        </div>

        {/* Profile Icon with User Image */}
        <div 
          className='rounded-full h-7 w-7 bg-sky-600 cursor-pointer overflow-hidden profile-button ring-2 ring-sky-300 hover:ring-sky-500 transition-all' 
          onClick={() => setProfileOpen(true)}
        >
          {user?.profilePicture && !profileImageError ? (
            <img 
              src={getProfileImageUrl()} 
              alt={user?.username || 'Profile'} 
              className='w-full h-full object-cover'
              onError={() => setProfileImageError(true)}
            />
          ) : (
            <div className='w-full h-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white font-semibold text-md'>
              {getUserInitials()}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isListOpen && (
          <>
            <motion.div
              className='fixed inset-0 bg-[#00000090] z-40'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setListOpen(false)}
            />
            <motion.div
              className='w-64 h-full bg-white p-4 shadow-lg fixed left-0 top-0 flex flex-col gap-4 z-50'
              custom='left'
              variants={sidePanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <X size={24} className='cursor-pointer self-end' onClick={() => setListOpen(false)} />
              {navLinks.map(({ to, icon, label }) => (
                <div
                  key={to}
                  className={`flex items-center gap-1 cursor-pointer text-sm duration-300 ${
                    (to === "/events" && isDigestRoute)
                      ? "text-sky-500 animate-pulse"
                      : location.pathname === to
                      ? "text-sky-500"
                      : "text-black hover:text-sky-700"
                  }`}
                  onClick={() => {
                    navigate(to);
                    setListOpen(false);
                  }}
                >
                  {icon}
                  <p>{label}</p>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNotificationOpen && (
          <>
            <motion.div
              className='fixed inset-0 bg-[#00000090] z-40'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotificationOpen(false)}
            />
            <motion.div
              className='min-w-[350px] w-[25%] h-full bg-white p-4 shadow-lg fixed right-0 top-0 flex flex-col gap-4 z-50'
              custom='right'
              variants={sidePanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <X size={24} className='cursor-pointer self-end' onClick={() => setNotificationOpen(false)} />
              <div className='flex justify-between items-center'>
                <h2 className='text-lg font-semibold'>Notifications</h2>
                <motion.button
                  className='text-xs bg-sky-500 mr-4 text-white rounded-full hover:bg-sky-700 duration-300'
                  whileTap={{ rotate: 180 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchNotifications();
                  }}>
                  <RefreshCcwDot size={16} className='inline m-1' />
                </motion.button>
              </div>

              {notifications.length > 0 ? (
                <div className='flex flex-col gap-2 overflow-y-auto'>
                  {notifications.map((note, index) => (
                    <motion.div
                      key={note._id || index}
                      className='p-3 border border-gray-300 shadow-xs rounded bg-white'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <p className='text-sm font-medium text-black mb-2'>
                        <span 
                          className='text-sky-600 font-semibold cursor-pointer hover:text-sky-800 hover:underline'
                          onClick={(e) => handleUsernameClick(e, note.username, note.userId)}
                          title={`View ${note.username}'s profile`}
                        >
                          {note.username}
                        </span>{' '}
                        has requested to join the <span className='text-sky-600 font-semibold'>{note.projectName}</span> project as a <span className='text-sky-600 font-semibold'>{note.role}</span>. Would you like to approve the request?
                      </p>
                      <p className='text-xs text-gray-500 italic'>
                        {new Date(note.timestamp).toLocaleString()}
                      </p>
                      <div className='flex gap-3 mt-2 justify-end'>
                        <motion.button 
                          whileTap={{ scale: 0.95 }} 
                          className='bg-green-300 hover:bg-green-600 duration-400 text-green-900 text-xs font-semibold px-3 py-1 rounded'
                          onClick={() => {handleAccept(note);}}
                        >
                          Accept
                        </motion.button>
                        <motion.button 
                          whileTap={{ scale: 0.95 }} 
                          className='bg-red-300 hover:bg-red-600 duration-200 text-red-900 text-xs font-semibold px-3 py-1 rounded'
                          onClick={() => {handleReject(note);}}
                        >
                          Decline
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className='text-sm text-gray-500'>No new notifications</div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-[#00000020] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
            />
            <motion.div
              className="profile-modal absolute top-16 right-6 bg-white shadow-md rounded-xl z-50 p-3 flex flex-col gap-2 min-w-[100px]"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-800">{user?.username || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
              <button
                className="text-left px-3 py-1.5 text-sm text-gray-800 hover:text-black rounded hover:bg-gray-50 transition-colors"
                onClick={() => {
                  navigate('/profile/'+userId);
                  setProfileOpen(false);
                }}
              >
                View Profile
              </button>
              <button
                className="text-left px-3 py-1.5 text-sm text-red-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                onClick={() => {
                  setProfileOpen(false);
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
              >
                Log Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header;