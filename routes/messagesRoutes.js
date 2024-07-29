const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

router.get('/:kidId', messagesController.getMessages);
router.post('/', messagesController.createMessage);

module.exports = router;
