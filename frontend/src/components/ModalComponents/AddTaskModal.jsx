import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const AddTaskModal = ({ data, onClose, onAddTask, setShowAddTaskModal }) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const teamMembers = data?.teamMembers || [];

  const addTaskToProject = async (projectId, taskData, column) => {
    try {
      const response = await fetch(`http://localhost:8000/projects/${projectId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskData, column }),
      });

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!response.ok) {
        const errorBody = isJson ? await response.json() : null;
        console.error("Server responded with error:", errorBody);
        throw new Error(errorBody?.error || "Something went wrong");
      }

      return isJson ? await response.json() : {};
    } catch (error) {
      console.error("Fetch Error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskName || !description || !dueDate || !assignedTo) {
      toast.info("Please fill in all fields");
      return;
    }

    const today = new Date();
    const selectedDate = new Date(dueDate);
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      toast.info("Due date can't be in the past!");
      return;
    }

    const selectedMember = teamMembers.find((m) => m.name === assignedTo);
    if (!selectedMember) {
      console.error("Team member not found:", assignedTo);
      toast.error("Invalid team member selected");
      return;
    }

    const newTask = {
      taskName,
      taskDesc: description,
      enddate: dueDate,
      teammemberName: assignedTo,
      teamMemberID: selectedMember.userid,
    };

    try {
      const res = await addTaskToProject(data._id, newTask, 'todo');
      toast.success('Task added successfully!');
      setShowAddTaskModal(false);
      onAddTask?.(newTask);
      onClose?.();
    } catch (error) {
      console.error("Add Task Failed:", error);
      toast.error(error.message || 'Failed to add task');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className='fixed top-0 left-0 w-full h-full bg-[#00000090] z-50 flex items-center justify-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className='w-[90%] max-w-[400px] bg-white p-6 rounded-lg shadow-lg'
          initial={{ scale: 0.8, y: -30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <h2 className="text-xl font-bold text-center mb-4">Add Task</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <motion.input
              type="text"
              placeholder="Task Name"
              maxLength={50}
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="border p-2 rounded"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 rounded resize-none h-24"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border p-2 rounded"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="border p-2 rounded"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="">Select Team Member</option>
              {teamMembers.map((member) => (
                <option key={member.userid} value={member.name}>
                  {member.name}
                </option>
              ))}
            </motion.select>

            <div className="flex justify-between mt-4">
              <motion.button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add Task
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddTaskModal;
