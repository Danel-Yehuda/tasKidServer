const express = require('express');
const router = express.Router();
const giftController = require('../controllers/giftController');

router.get('/', giftController.getGifts);
router.post('/', giftController.createGift);
router.delete('/:id', giftController.deleteGift);
router.put('/:id', giftController.editGift);
router.put('/buy/:id', giftController.buyGift);

module.exports = router;
