const passport = require('passport');
const express = require('express');
const router = express();

const MessageController = require('../controllers/MessageController');

const Upload = require('../services/UploadService');

const requireAuth = passport.authenticate('jwt', { session: false });

/* Routes for Message */
router.post('/send', requireAuth, Upload.single('attachment'), MessageController.create);
router.put('/:id/markSeen', requireAuth, MessageController.markSeen);




module.exports = router;