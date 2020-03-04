const express = require('express');
const router = express();

const UserController = require('../controllers/UserController');


router.post('/', UserController.create);

module.exports = router;