const passport = require('passport');
const express = require('express');
const router = express();

const MessageController = require('../controllers/MessageController');

const requireAuth = passport.authenticate('jwt', { session: false });

/* Routes for Message */
router.post('/send', requireAuth, MessageController.create);



module.exports = router;