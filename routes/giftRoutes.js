const express = require('express');
const router = express.Router();
const giftController = require('../controllers/giftController'); // Ensure this path is correct

router.get('/', giftController.getGifts);
router.post('/', giftController.createGift);
router.delete('/:id', giftController.deleteGift);
router.put('/:id', giftController.updateGift); // Ensure this function is correctly named in your controller

module.exports = router;
