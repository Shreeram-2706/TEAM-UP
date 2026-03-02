const express = require('express');
const router = express.Router();
const {requestNotify, acceptNotify, RejectNotify, fetchNotifications} = require('../Controller/notifyController');

router.post('/request', requestNotify);
router.post('/accept', acceptNotify);
router.post('/reject', RejectNotify);
router.get('/:userId', fetchNotifications);

module.exports = router;