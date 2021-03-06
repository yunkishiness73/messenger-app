const passport = require('passport');
const express = require('express');
const router = express();

const FriendController = require('../controllers/FriendController');

const requireAuth = passport.authenticate('jwt', { session: false });

router.get('/', requireAuth, FriendController.search);
router.delete('/:id/unfriend', requireAuth, FriendController.unfriend);

/* Routes for Friend Request */
router.get('/requests', requireAuth, FriendController.getFriendsRequest);
router.get('/requests/incomming', requireAuth, FriendController.getIncommingFriendsRequest);
router.post('/requests', requireAuth, FriendController.sendFriendRequest);
router.post('/requests/accept', requireAuth, FriendController.accept);
router.post('/requests/reject', requireAuth, FriendController.reject);
router.post('/requests/cancel', requireAuth, FriendController.cancel);


module.exports = router;