const passport = require('passport');
const express = require('express');
const router = express();

const ConversationController = require('../controllers/ConversationController');

const requireAuth = passport.authenticate('jwt', { session: false });

/* Routes for Conversation Request */
router.post('/', requireAuth, ConversationController.create);


module.exports = router;