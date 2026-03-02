import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Kanban, Mail, MessageSquare, Presentation, Send,
  Trash, User, Plus, X
} from 'lucide-react';
import TaskList from './TaskList';
import UserContext from '../../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const StatisticsColumn = ({
  setShowMail,
  showMail,
  setShowAddMail,
  setShowBoard,
  setShowDiscuss,
  setShowAddPost,
}) => {
  const { user } = useContext(UserContext);
  const userId = user?.id || '';
  const username = user?.username || 'Guest';
  const navigate = useNavigate();

  const [inboxCount, setInboxCount] = useState(0);
  const [stats, setStats] = useState({
    totalProjects: 0,
    currentProjects: 0,
    completedProjects: 0,
    totalIssues: 0,
  });
  
  // Task list state
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    if (!user?.email) return;

    fetch('http://localhost:8000/mail/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    })
      .then((res) => res.json())
      .then((data) => {
        const unread = (data || []).filter((mail) => mail.status === false);
        setInboxCount(unread.length);
      })
      .catch((err) => console.error('Error fetching inbox:', err));
  }, [user?.email, showMail]);

  useEffect(() => {
    if (!userId) return;

    fetch('http://localhost:8000/projects/my-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        const totalProjects = data.length;
        const currentProjects = data.filter((p) => p.projectStatus !== 'completed').length;
        const completedProjects = data.filter((p) => p.projectStatus === 'completed').length;

        let totalIssues = 0;
        data.forEach((project) => {
          ['todo', 'onprogress', 'review'].forEach((section) => {
            if (Array.isArray(project[section])) {
              project[section].forEach((task) => {
                if (task.teamMemberID === userId) {
                  totalIssues += 1;
                }
              });
            }
          });
        });

        setStats({ totalProjects, currentProjects, completedProjects, totalIssues });
      })
      .catch((err) => console.error('Error:', err));
  }, [userId]);

  // Task list functions
  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await fetch(`http://localhost:8000/users/tasks/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      toast.error('Error loading tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) {
      toast.error('Task description cannot be empty');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/users/tasks/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: newTask,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const data = await response.json();
      setTasks(data.tasks);
      setNewTask('');
      setShowAddTask(false);
      toast.success('Task added successfully');
    } catch (error) {
      toast.error('Error adding task');
      console.error('Error adding task:', error);
    }
  };

  const handleTaskToggle = async (taskId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/users/tasks/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          completed: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const data = await response.json();
      setTasks(data.tasks);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Error updating task');
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:8000/users/tasks/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      const data = await response.json();
      setTasks(data.tasks);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Error deleting task');
      console.error('Error deleting task:', error);
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  const quickLinkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="welcome w-full h-full col-span-3">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="feed-Request flex flex-col justify-between gap-3 w-[95%] min-h-fit rounded-lg mx-4 bg-white duration-300 px-5"
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between rounded-lg">
            <div>
              <h1 className="text-md font-bold text-gray-700">Welcome Back,</h1>
              <h1 className="text-3xl font-bold mx-2 text-sky-600 py-3">{username}</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMail(true)}
                className="relative flex items-center gap-2 bg-sky-100 border border-sky-300 p-3 rounded-full cursor-pointer shadow hover:bg-sky-200 transition"
                aria-label="Check mail"
              >
                <Mail size={18} className="text-sky-600" />
                {inboxCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {inboxCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="w-[95%] mx-auto grid gap-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              bgLight: '#fef3c7',
              bgDark: '#f59e0b',
              value: stats.currentProjects,
              label: 'Current Projects',
            },
            {
              bgLight: '#fee2e2',
              bgDark: '#f87171',
              value: stats.totalIssues,
              label: 'Total Issues',
            },
            {
              bgLight: '#d1fae5',
              bgDark: '#34d399',
              value: stats.completedProjects,
              label: 'Completed Projects',
            },
          ].map((item, index) => (
            <motion.div
              key={`stat-card-${item.label}`}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={statCardVariants}
              style={{ backgroundColor: item.bgLight }}
              className="p-2 flex items-center h-15 rounded-lg m-1 shadow-md"
            >
              <div
                style={{ backgroundColor: item.bgDark }}
                className="px-2 py-1 flex items-center justify-center min-w-[32px] text-white text-sm font-bold rounded-full"
              >
                {item.value}
              </div>
              <div className="text-sm ml-3">{item.label}</div>
            </motion.div>
          ))}
        </div>

        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <Send size={24} className="text-white" />,
                label: 'Send Mail',
                onClick: () => setShowAddMail(true),
                bg: 'rgb(134, 239, 172)',
                id: 'send-mail-link'
              },
              {
                icon: <Kanban size={24} className="text-white" />,
                label: 'Board',
                onClick: () => setShowBoard(true),
                bg: '#fde68a',
                id: 'board-link'
              },
              {
                icon: <MessageSquare size={24} className="text-white" />,
                label: 'Add Post',
                onClick: () => setShowAddPost(true),
                bg: '#fca5a5',
                id: 'add-post-link'
              },
              {
                icon: <Presentation size={24} className="text-white" />,
                label: 'Discuss',
                onClick: () => setShowDiscuss(true),
                bg: '#7dd3fc',
                id: 'discuss-link'
              },
            ].map((item) => (
              <motion.button
                key={item.id}
                initial="hidden"
                animate="visible"
                variants={quickLinkVariants}
                onClick={item.onClick}
                className="action-item flex flex-col items-center gap-2 p-3 bg-white hover:bg-gray-100 duration-300 rounded-lg cursor-pointer"
                aria-label={item.label}
              >
                <div className="p-2 rounded-full shadow-md" style={{ backgroundColor: item.bg }}>
                  {item.icon}
                </div>
                <span className="font-semibold text-sm">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
        <TaskList/>
      </div>
    </div>
  );
};

StatisticsColumn.propTypes = {
  setShowMail: PropTypes.func.isRequired,
  showMail: PropTypes.bool.isRequired,
  setShowAddMail: PropTypes.func.isRequired,
  setShowBoard: PropTypes.func.isRequired,
  setShowDiscuss: PropTypes.func.isRequired,
  setShowAddPost: PropTypes.func.isRequired,
};

export default StatisticsColumn;