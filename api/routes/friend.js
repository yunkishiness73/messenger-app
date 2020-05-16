const passport = require('passport');
const express = require('express');
const router = express();

const FriendController = require('../controllers/FriendController');

const requireAuth = passport.authenticate('jwt', { session: false });

router.get('/', requireAuth, FriendController.search);

/* Routes for Friend Request */
// router.get('/requests', requireAuth, FriendController.getById);
// router.get('/requests/incomming', requireAuth, FriendController.create);
router.post('/requests', requireAuth, FriendController.sendFriendRequest);
// router.post('/requests/accept', requireAuth, FriendController.accept);
// router.post('/requests/reject', requireAuth, FriendController.reject);
// router.post('/requests/cancel', requireAuth, FriendController.cancel);


module.exports = router;