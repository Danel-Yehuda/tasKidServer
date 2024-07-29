const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

router.get('/:type/:id', messagesController.getMessages); // Fetch messages for either kid or user
router.post('/', messagesController.createMessage); // Create a new message

module.exports = router;
