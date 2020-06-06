const passport = require('passport');
const express = require('express');
const router = express();

const ConversationController = require('../controllers/ConversationController');

const requireAuth = passport.authenticate('jwt', { session: false });

/* Routes for Conversation Request */
router.post('/', requireAuth, ConversationController.create);
router.post('/:id/members', requireAuth, ConversationController.addMembers);
router.get('/:id', requireAuth, ConversationController.getById);
router.get('/:id/messages', requireAuth, ConversationController.getMessages);
router.post('/:id/leave', requireAuth, ConversationController.leave);
router.delete('/:id', requireAuth, ConversationController.delete);
router.put('/:id', requireAuth, ConversationController.update);


module.exports = router;