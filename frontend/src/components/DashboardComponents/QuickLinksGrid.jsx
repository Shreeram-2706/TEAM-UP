import React from 'react';
import { Mail, Send, Kanban, MessageSquare, Presentation } from 'lucide-react';
import { motion } from 'framer-motion';

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

const QuickLinksGrid = ({ setShowMail, setShowAddMail, setShowBoard, setShowAddPost, setShowDiscuss }) => {
  const links = [
    { icon: <Mail size={24} className="text-white" />, label: 'Inbox', action: setShowMail, bg: '#d8b4fe' },
    { icon: <Send size={24} className="text-white" />, label: 'Send Mail', action: setShowAddMail, bg: '#86efac' },
    { icon: <Kanban size={24} className="text-white" />, label: 'Board', action: setShowBoard, bg: '#fde68a' },
    { icon: <MessageSquare size={24} className="text-white" />, label: 'Add Post', action: setShowAddPost, bg: '#fca5a5' },
    { icon: <Presentation size={24} className="text-white" />, label: 'Discuss', action: setShowDiscuss, bg: '#7dd3fc' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {links.map((link, index) => (
        <motion.div
          key={index}
          initial="hidden"
          animate="visible"
          variants={quickLinkVariants}
          onClick={() => link.action(true)}
          className="action-item flex flex-col items-center gap-2 p-3 bg-white hover:bg-gray-100 duration-300 rounded-lg cursor-pointer"
        >
          <div className="p-2 rounded-full" style={{ backgroundColor: link.bg }}>
            {link.icon}
          </div>
          <span className="font-semibold text-sm">{link.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickLinksGrid;
