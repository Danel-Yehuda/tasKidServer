const express = require('express');
const router = express.Router();
const publishTasksController = require('../controllers/publishTasksController');

router.get('/', publishTasksController.getPublishTasks);

router.post('/', publishTasksController.createPublishTask);

router.delete('/:id', publishTasksController.deletePublishTask);

module.exports = router;
