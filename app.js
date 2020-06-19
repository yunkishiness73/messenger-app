require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const socketio = require('socket.io');
const expressEJSExtend = require('express-ejs-extend');

const userRoute = require('./api/routes/user');
const authRoute = require('./api/routes/auth');
const friendRoute = require('./api/routes/friend');
const conversationRoute = require('./api/routes/conversation');
const messageRoute = require('./api/routes/message');
const searchRoute = require('./api/routes/search');
const mainRoute = require('./api/routes/main');

const socketEvent = require('./config/socketEvent');


mongoose.connect(process.env.MONGO_LOCAL, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, retryWrites: false }, (err) => {
    if (err)
        console.log('Mongo connected failed ' + err);
    else
        console.log('Mongo connected successfully');
});

mongoose.set('debug', true);


const app = express();

app.engine('ejs', expressEJSExtend);
app.set("views", path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/uploads')));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routers
app.use('/', mainRoute)
app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/friends', friendRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/messages', messageRoute);
app.use('/api/search', searchRoute);


const passport = require('passport');

require('./config/passport');

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


const server = app.listen(process.env.PORT, () => console.log('Server is running'));

const io = socketio(server);

//initialize socketIO to handle events
socketEvent(io);