const express = require('express');
const router = express.Router();
const publishTasksController = require('../controllers/publishTasksController');

router.get('/', publishTasksController.getPublishTasks);

router.post('/', publishTasksController.createPublishTask);

router.delete('/:id', publishTasksController.deletePublishTask);

router.put('/:id', publishTasksController.updatePublishTask);

module.exports = router;
