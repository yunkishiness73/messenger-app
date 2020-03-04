const express = require('express');
const router = express();

const AuthController = require('../controllers/AuthController');

router.get('/confirmation/:token', AuthController.verifyEmail);

module.exports = router;