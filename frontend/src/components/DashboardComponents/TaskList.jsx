import React, { useState, useEffect, useContext } from 'react';
import { Trash, Plus, X, Check, ListChecks } from 'lucide-react';
import { toast } from 'react-toastify';
import UserContext from '../../Context/UserContext';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState('');
  const { user } = useContext(UserContext);
  const userId = user?.id || '';

  const currentDate = new Date();
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('en-US', options);

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/users/tasks/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data || []);
    } catch (error) {
      toast.error('Error loading tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) {
      toast.error('Task description cannot be empty');
      return;
    }

    if (newTask.length > 70) {
      toast.error('Task description should not exceed 70 characters');
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

      const addedTask = await response.json();
      setTasks([addedTask, ...tasks]);
      setNewTask('');
      setShowAddTask(false);
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

      const updatedTasks = await response.json();
      setTasks(updatedTasks);
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

      const { taskId: deletedTaskId, tasks: updatedTasks } = await response.json();
      setTasks(updatedTasks);
    } catch (error) {
      toast.error('Error deleting task');
      console.error('Error deleting task:', error);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.isCompleted && !b.isCompleted) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (a.isCompleted && !b.isCompleted) {
      return 1;
    } else if (!a.isCompleted && b.isCompleted) {
      return -1;
    } else {
      return new Date(b.completedAt || 0) - new Date(a.completedAt || 0);
    }
  });

  if (loading) {
    return (
      <div className="mt-4">
        <div className="justify-between w-full flex items-center mb-3">
          <div className=''>
            <h2 className="text-md font-bold text-gray-700">📝 Personal Tasks</h2>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="justify-between w-full flex items-center mb-3">
        <div className='justify-between flex items-center gap-10'>
          <h2 className="text-md font-bold text-gray-700">📝 Personal Tasks</h2>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
        <button
          className="flex gap-2 p-1 justify-center bg-sky-400 rounded-full items-center hover:bg-sky-500 transition-colors"
          onClick={() => setShowAddTask(true)}
        >
          <Plus size={20} className="ml-2 text-white" />
          <span className="text-white text-sm font-semibold mr-3">Add Task</span>
        </button>
      </div>

      {showAddTask && (
        <div className="mb-4 px-3 py-2 bg-white rounded-lg shadow">
          <form onSubmit={handleAddTask} className="flex items-center gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What's on your list today?"
              className="flex-1 p-1 text-sm border border-gray-300 rounded focus:outline-none"
              autoFocus
              maxLength={70}
            />
            <button
              type="submit"
              className="p-2 text-sm text-white bg-sky-500 rounded-full hover:bg-sky-600 flex items-center gap-1"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddTask(false);
                setNewTask('');
              }}
              className="p-2 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 flex items-center gap-1"
            >
              <X size={16} />
            </button>
          </form>
        </div>
      )}

      <div className="border no-scrollbar border-gray-200 rounded-lg p-3 h-51 overflow-y-auto space-y-2">
        {sortedTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-6 flex flex-col items-center">
            <ListChecks size={70} className="m-1 text-gray-400" />
            <p className="text-sm mt-3">No tasks available.<br />Add one to get started!</p>
          </div>
        ) : (
          <>
            {sortedTasks.filter(task => !task.isCompleted).length > 0 && (
              <div className="space-y-2">
                {sortedTasks
                  .filter(task => !task.isCompleted)
                  .map((task) => (
                    <div key={task._id} className="bg-white p-2 rounded shadow text-sm flex justify-between items-center">
                      <label className="flex items-center gap-3 w-full">
                        <input 
                          type="checkbox" 
                          className="form-checkbox h-4 w-4 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                          checked={false}
                          onChange={() => handleTaskToggle(task._id, task.isCompleted || false)}
                        />
                        <span 
                          className="flex-1 truncate text-gray-700"
                          title={task.description}
                        >
                          {task.description.length > 70 
                            ? `${task.description.substring(0, 67)}...` 
                            : task.description}
                        </span>
                        <button
                          className="bg-red-400 p-1 rounded-full hover:bg-red-500 transition-colors"
                          onClick={() => handleDeleteTask(task._id)}
                          aria-label={`Delete task ${task.description}`}
                        >
                          <Trash size={14} className="text-white" />
                        </button>
                      </label>
                    </div>
                  ))}
              </div>
            )}

            {sortedTasks.filter(task => task.isCompleted).length > 0 && (
              <>
                {sortedTasks.filter(task => !task.isCompleted).length > 0 && (
                  <div className="border-t border-gray-200 my-2"></div>
                )}
                <div className="space-y-2">
                  {sortedTasks
                    .filter(task => task.isCompleted)
                    .map((task) => (
                      <div key={task._id} className="bg-white p-2 rounded shadow text-sm flex justify-between items-center opacity-90">
                        <label className="flex items-center gap-3 w-full">
                          <input 
                            type="checkbox" 
                            className="form-checkbox h-4 w-4 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                            checked={true}
                            onChange={() => handleTaskToggle(task._id, task.isCompleted || false)}
                          />
                          <span 
                            className="flex-1 truncate line-through text-gray-400"
                            title={task.description}
                          >
                            {task.description.length > 70 
                              ? `${task.description.substring(0, 67)}...` 
                              : task.description}
                          </span>
                          <button
                            className="bg-red-400 p-1 rounded-full hover:bg-red-500 transition-colors"
                            onClick={() => handleDeleteTask(task._id)}
                            aria-label={`Delete task ${task.description}`}
                          >
                            <Trash size={14} className="text-white" />
                          </button>
                        </label>
                      </div>
                    ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskList;