const passport = require('passport');
const express = require('express');
const router = express();

const SearchController = require('../controllers/SearchController');

const requireAuth = passport.authenticate('jwt', { session: false });

router.get('/', requireAuth, SearchController.search);


module.exports = router;