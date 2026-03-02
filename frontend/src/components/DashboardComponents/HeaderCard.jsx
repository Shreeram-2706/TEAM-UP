import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const HeaderCard = ({ username, setShowMail }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="feed-Request flex flex-col justify-between w-[95%] min-h-[30vh] rounded-lg mx-4 bg-white duration-300 p-5 shadow-md"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-md font-bold text-gray-700">Welcome Back,</h1>
            <h1 className="text-3xl font-bold m-2 text-sky-600">{username}</h1>
          </div>
          <div className="flex gap-3">
            <div
              onClick={() => setShowMail(true)}
              className="flex items-center gap-2 bg-sky-100 border border-sky-300 p-3 rounded-full cursor-pointer shadow hover:bg-purple-200 transition"
            >
              <Mail size={18} className="text-sky-600" />
            </div>
            <div
              onClick={() => setShowMail(true)}
              className="flex items-center gap-2 bg-sky-100 border border-sky-300 p-3 rounded-full cursor-pointer shadow hover:bg-purple-200 transition"
            >
              <MessageCircle size={18} className="text-sky-600" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeaderCard;
