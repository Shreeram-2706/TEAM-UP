const User = require('../Models/User');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateEmailParams = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format')
];

const validateSendEmail = [
  body('from').isEmail().normalizeEmail(),
  body('to').isEmail().normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
];

const validateMarkAsRead = [
  body('email').isEmail().normalizeEmail(),
  body('id').isMongoId().withMessage('Invalid email ID format')
];

const validateDeleteEmail = [
  body('email').isEmail().normalizeEmail(),
  body('emailId').isMongoId().withMessage('Invalid email ID format'),
  body('view').isIn(['inbox', 'outbox']).withMessage('View must be either "inbox" or "outbox"')
];

const sendEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { from, to, subject, message } = req.body;
    const fromUser = await User.findOne({ email: from });
    const toUser = await User.findOne({ email: to });

    if (!fromUser || !toUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newEmail = {
      from,
      to,
      subject,
      message,
      sentAt: new Date(),
      status: false,
    };

    fromUser.outbox.push(newEmail);
    await fromUser.save();

    toUser.inbox.push(newEmail);
    await toUser.save();

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getOutbox = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const outboxSorted = user.outbox.sort((a, b) => b.sentAt - a.sentAt);
    res.status(200).json(outboxSorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInbox = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const inboxSorted = user.inbox.sort((a, b) => b.sentAt - a.sentAt);
    res.status(200).json(inboxSorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markAsRead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id, email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const emailId = new mongoose.Types.ObjectId(id);
    const mail = user.inbox.find((item) => item._id.equals(emailId));
    if (!mail) {
      return res.status(404).json({ success: false, message: 'Mail not found in inbox' });
    }
    mail.status = true;
    await user.save();
    res.status(200).json({ success: true, message: 'Email marked as read' });
  } catch (err) {
    console.error('Error in markAsRead:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { emailId, email, view } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const idToDelete = new mongoose.Types.ObjectId(emailId);
    if (view === 'inbox') {
      user.inbox = user.inbox.filter(mail => !mail._id.equals(idToDelete));
    } else if (view === 'outbox') {
      user.outbox = user.outbox.filter(mail => !mail._id.equals(idToDelete));
    }
    await user.save();
    res.status(200).json({ success: true, message: 'Email deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  sendEmail: [validateSendEmail, sendEmail],
  getOutbox: [validateEmailParams, getOutbox],
  getInbox: [validateEmailParams, getInbox],
  markAsRead: [validateMarkAsRead, markAsRead],
  deleteEmail: [validateDeleteEmail, deleteEmail],
};