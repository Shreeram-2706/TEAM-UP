import React from 'react';
import { motion } from 'framer-motion';

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

const StatsCardGrid = ({ stats, notificationsCount }) => {
  const statItems = [
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
      bgLight: '#dbeafe',
      bgDark: '#60a5fa',
      value: notificationsCount || 0,
      label: 'Notifications',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={index}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={statCardVariants}
          style={{ backgroundColor: item.bgLight }}
          className="p-2 flex items-center h-15 rounded-lg m-1"
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
  );
};

export default StatsCardGrid;
