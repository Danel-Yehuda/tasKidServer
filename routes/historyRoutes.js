const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.get('/', historyController.getHistory);
router.get('/task/:taskName', historyController.getHistoryByTaskName);
router.post('/', historyController.createHistory);

module.exports = router;
