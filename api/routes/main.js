const express = require('express');
const router = express();

router.get('/signin', (req, res) => {
    res.render('auth/master');
});

router.get('/home', (req, res) => {
    res.render('main/home/home');
});

module.exports = router;