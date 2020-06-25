const passport = require('passport');
const express = require('express');
const router = express();

const UserController = require('../controllers/UserController');

const Upload = require('../services/UploadService');

const requireAuth = passport.authenticate('jwt', { session: false });

router.post('/',  Upload.single('photo'), UserController.create);
router.put('/:id', requireAuth, Upload.single('photo'), UserController.update);
router.post('/forgotPassword', UserController.forgotPassword);
router.get('/:id', requireAuth, UserController.getById);
router.get('/me/conversations', requireAuth, UserController.getConversations);
router.get('/', requireAuth, UserController.search);




module.exports = router;