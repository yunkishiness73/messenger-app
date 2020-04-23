const express = require('express');
const router = express();

const UserController = require('../controllers/UserController');


router.post('/', UserController.create);

router.get('/:id', UserController.getById);

module.exports = router;