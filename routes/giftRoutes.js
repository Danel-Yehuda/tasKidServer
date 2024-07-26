const express = require('express');
const router = express.Router();
const publishTasksController = require('../controllers/giftController');

router.get('/', giftController.get);

router.post('/', giftController.create);

router.delete('/:id', giftController.delete);

router.put('/:id', giftController.edit);

module.exports = router;
