const express = require('express');
const router = express.Router();
const {
    getDiscuss,
    addMessage,
    addFile,
    deleteMessage,
    deleteFile
} = require('../Controller/discussController');

router.post('/get', getDiscuss);
router.post('/addMessage', addMessage);
router.post('/addFile', addFile);
router.delete('/deleteMessage', deleteMessage);
router.delete('/deleteFile', deleteFile);

module.exports = router;