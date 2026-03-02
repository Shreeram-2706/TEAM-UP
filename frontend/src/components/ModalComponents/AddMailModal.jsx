import React, { useState, useEffect, useContext } from 'react';
import { Mail, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import UserContext from '../../Context/UserContext';

const AddMailModal = ({ setShowAddMail }) => {
  const [recipient, setRecipient] = useState('');
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [allEmails, setAllEmails] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useContext(UserContext);
  useEffect(() => {
    fetch('http://localhost:8000/auth/emails')
      .then(res => res.json())
      .then(data => setAllEmails(data))
      .catch(err => console.error('Error fetching emails:', err));
  }, []);

  const handleSendMail = (e) => {
    e.preventDefault();
    if (!recipient || !subject || !message) {
      alert('All fields are required!');
      return;
    }

    const from = user?.email;
    const to = recipient;

    setSending(true);
    fetch('http://localhost:8000/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, subject, message }),
      })
      .then(res => res.json())
      .then((data) => {
        setSending(false);
        if (data.success) {
          toast.info('Mail sent successfully!');
          setRecipient('');
          setSubject('');
          setMessage('');
          setShowAddMail(false);
        } else {
        }
      })
      .catch((err) => {
        setSending(false);
        toast.error('Error sending mail.');
        console.error('Error:', err);
      });
    }      


  // Filter suggestions
  useEffect(() => {
    if (recipient.length === 0) {
      setFilteredEmails([]);
      return;
    }
    const matches = allEmails.filter(email =>
        email.toLowerCase().includes(recipient.toLowerCase()) &&
        email !== recipient &&
        email !== user?.email
      );
      
    setFilteredEmails(matches);
  }, [recipient, allEmails]);

  const selectSuggestion = (email) => {
    setRecipient(email);
    setFilteredEmails([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[#00000090] flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-2xl w-[550px] max-w-[90vw] p-6 shadow-lg"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-sky-600 flex items-center gap-2">
            <Mail /> Compose an email
          </h2>
          <X
            size={26}
            className="text-gray-600 hover:text-black cursor-pointer"
            onClick={() => setShowAddMail(false)}
          />
        </div>

        {successMessage && (
          <div className="bg-green-100 text-green-800 p-2 rounded-lg mb-4 text-sm font-semibold">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSendMail} className="space-y-4 relative">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full py-2 px-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Recipient email"
              required
              autoComplete="off"
            />
            {filteredEmails.length > 0 && (
              <ul className="absolute bg-white border border-gray-200 rounded-md mt-1 w-full z-10 shadow">
                {filteredEmails.map((email, idx) => (
                  <li
                    key={idx}
                    onClick={() => selectSuggestion(email)}
                    className="px-3 py-2 hover:bg-sky-100 cursor-pointer text-sm"
                  >
                    {email}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full py-2 px-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Email subject"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full py-2 px-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={5}
              placeholder="Type your message..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddMail(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-all"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddMailModal;
