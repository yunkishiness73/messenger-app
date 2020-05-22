const passport = require('passport');
const express = require('express');
const router = express();

const UserController = require('../controllers/UserController');

const requireAuth = passport.authenticate('jwt', { session: false });

router.post('/', UserController.create);
router.post('/forgotPassword', UserController.forgotPassword);
router.get('/:id', requireAuth, UserController.getById);
router.get('/me/conversations', requireAuth, UserController.getConversations);




module.exports = router;