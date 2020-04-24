const express = require('express');
const router = express();

const UserController = require('../controllers/UserController');


router.post('/', UserController.create);

router.post('/forgotPassword', UserController.forgotPassword);

router.get('/:id', UserController.getById);



module.exports = router;