const express = require('express');
const router = express.Router();
const kidsController = require('../controllers/kidsController');

router.get('/', kidsController.getKids);
router.get('/byParent/:parentId', kidsController.getKidsByParentId); // New route for fetching kids by parent ID
router.post('/', kidsController.createKid);
router.delete('/:id', kidsController.deleteKid);
router.put('/:id', kidsController.updateKid);
router.post('/signin', kidsController.signIn);

module.exports = router;