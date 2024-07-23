const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');

router.post('/', tasksController.createTask);
router.get('/', tasksController.getTasks);
router.delete('/:taskId', tasksController.deleteTask);

module.exports = router;
