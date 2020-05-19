const passport = require('passport');
const express = require('express');
const router = express();

const MessageController = require('../controllers/MessageController');

const requireAuth = passport.authenticate('jwt', { session: false });

router.get('/', requireAuth, MessageController.search);

/* Routes for Message */
router.post('/messages/send', requireAuth, MessageController.sendMessage);



module.exports = router;