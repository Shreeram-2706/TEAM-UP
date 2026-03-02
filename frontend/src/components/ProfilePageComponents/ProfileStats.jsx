import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ListChecks } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProfileStats = ({ tasks }) => {
  // Default tasks if not provided
  const taskData = tasks || {
    completed: 0,
    overdue: 0,
    inProgress: 0,
    todo: 0
  };

  const totalTasks = taskData.completed + taskData.overdue + taskData.inProgress + taskData.todo;
  const addressedTasks = taskData.completed + taskData.inProgress;
  const addressedRate = totalTasks > 0 ? Math.round((addressedTasks / totalTasks) * 100) : 0;

  const chartData = {
    labels: ['Completed', 'Overdue', 'In Progress', 'To Do'],
    datasets: [
      {
        data: [taskData.completed, taskData.overdue, taskData.inProgress, taskData.todo],
        backgroundColor: ['#A7F3D0', '#FECACA', '#BFDBFE', '#FEF08A'],
        borderColor: ['#10B981', '#EF4444', '#3B82F6', '#F59E0B'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 20,
          font: { size: 12 },
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 h-full border border-gray-200">
      <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
        <ListChecks className="text-blue-500" size={18} />
        Task Statistics
      </h3>
      
      <div className="relative h-64">
        {totalTasks > 0 ? (
          <>
            <Doughnut 
              data={chartData}
              options={chartOptions}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-700">{addressedRate}%</span>
                <p className="text-xs text-gray-500 mt-1">Tasks Addressed</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">No tasks assigned yet</p>
          </div>
        )}
      </div>
      
      {totalTasks > 0 && (
        <div className="mt-4 text-center space-y-2">
          <div className="flex flex-wrap justify-center gap-2 text-gray-700">
            <span>
              <span className="font-medium">{taskData.inProgress}</span> in progress,
            </span>
            <span>
              <span className="font-medium">{taskData.todo}</span> to do,
            </span>
            <span>
              <span className="font-medium text-green-600">{taskData.completed}</span> completed &
            </span>
            <span>
              <span className="font-medium text-red-600">{taskData.overdue}</span> overdue tasks
            </span>
          </div>
          <p className="text-gray-500 text-sm">{totalTasks} total assigned tasks</p>
        </div>
      )}
    </div>
  );
};

export default ProfileStats;