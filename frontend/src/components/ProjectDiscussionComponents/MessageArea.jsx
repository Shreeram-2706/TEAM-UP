import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

const MessageArea = ({ messages = [], currentUserId, onSendMessage }) => {
  const messageEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) return 'Today';
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString();
  };

  const groupedMessages = messages.reduce((acc, message) => {
    const date = formatDate(message.timestamp || message.time);
    if (!acc[date]) acc[date] = [];
    acc[date].push({
      ...message,
      isCurrentUser: message.senderID === currentUserId
    });
    return acc;
  }, {});

  return (
    <div className='flex flex-col h-[85vh] col-span-4 mx-3 bg-white rounded-xl shadow-lg overflow-hidden'>
      <div className='flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar'>
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date} className='space-y-4'>
            <div className='flex justify-center'>
              <span className='px-3 py-1 bg-gray-100 text-xs text-gray-500 rounded-full'>
                {date}
              </span>
            </div>
            {messages.map((msg, index) => (
              <div 
                key={msg._id || index} 
                className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-xs md:max-w-sm lg:max-w-md ${msg.isCurrentUser ? 'items-end' : 'items-start'}`}>
                  {msg.isCurrentUser ? (
                    <>
                      <span className='text-[10px] mt-1 self-end text-gray-400'>
                        {formatTime(msg.timestamp || msg.time)}
                      </span>
                      <div className='p-2 rounded-2xl bg-sky-500 text-white'>
                        <p className='text-sm'>{msg.message}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='p-2 rounded-2xl bg-gray-100'>
                        <span className='font-medium text-xs text-gray-700'>
                          {msg.name}
                        </span>
                        <p className='text-sm text-gray-800'>{msg.message}</p>
                      </div>
                      <span className='text-[10px] mt-1 self-end text-gray-500'>
                        {formatTime(msg.timestamp || msg.time)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      
      <div className='p-3 border-t bg-gray-50'>
        <div className='flex items-center bg-white rounded-full px-4 py-2 shadow-sm'>
          <button className='p-1 text-gray-400 hover:text-gray-600'>
            <Paperclip size={20} />
          </button>
          <button className='p-1 text-gray-400 hover:text-gray-600 ml-2'>
            <Smile size={20} />
          </button>
          <input
            type='text'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder='Type a message...'
            className='flex-1 border-none outline-none px-3 py-1 text-sm'
          />
          <button 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`p-1 rounded-full ${newMessage.trim() ? 'text-blue-500 hover:text-blue-600' : 'text-gray-300'}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageArea;