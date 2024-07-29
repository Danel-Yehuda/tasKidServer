const express = require('express');
const router = express.Router();
const publishTasksController = require('../controllers/publishTasksController');

router.get('/', publishTasksController.getPublishTasks);

router.post('/', publishTasksController.createPublishTask);

router.delete('/:id', publishTasksController.deletePublishTask);

router.put('/:id', publishTasksController.updatePublishTask);

router.put('/status/:id', publishTasksController.updatePublishTaskStatus);

router.put('/approve/:id', publishTasksController.approveTask);

module.exports = router;
