
const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../Controller/messageController');


router.post('/send', sendMessage);
router.get('/:projectID', getMessages);

module.exports = router;