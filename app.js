require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');

const userRoute = require('./api/routes/user');
const authRoute = require('./api/routes/auth');
const friendRoute = require('./api/routes/friend');
const conversationRoute = require('./api/routes/conversation');
const messageRoute = require('./api/routes/message');
const searchRoute = require('./api/routes/search');


mongoose.connect(process.env.MONGO_LOCAL, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, retryWrites: false }, (err) => {
    if (err)
        console.log('Mongo connected failed ' + err);
    else
        console.log('Mongo connected successfully');
});

mongoose.set('debug', true);


const app = express();

app.set("views", path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/uploads')));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routers
app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/friends', friendRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/messages', messageRoute);
app.use('/api/search', searchRoute);


const passport = require('passport');

require('./config/passport');

const Conversation = require('./api/models/Conversation');
const User = require('./api/models/User');
const FriendRequest = require('./api/models/FriendRequest');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  

// error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);
    next(err);
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});


app.listen(process.env.PORT, () => console.log('Server is running'));