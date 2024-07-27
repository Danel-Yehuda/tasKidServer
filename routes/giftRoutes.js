const express = require('express');
const router = express.Router();
const publishTasksController = require('../controllers/giftController');

router.get('/', giftController.getGifts);

router.post('/', giftController.createGift);

router.delete('/:id', giftController.deleteGift);

router.put('/:id', giftController.edit);

module.exports = router;
