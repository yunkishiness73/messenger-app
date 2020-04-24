const express = require('express');
const router = express();

const AuthController = require('../controllers/AuthController');

const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

router.get('/confirmation/:token', AuthController.verifyEmail);

router.post('/', requireLogin, AuthController.login);

module.exports = router;