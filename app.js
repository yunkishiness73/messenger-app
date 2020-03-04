require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');

const userRoute = require('./api/routes/user');
const authRoute = require('./api/routes/auth');

mongoose.connect(process.env.MONGO_LOCAL, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }, (err) => {
    if (err)
        console.log('Mongo connected failed ' + err);
    else
        console.log('Mongo connected successfully');
});


const app = express();

app.set("views", path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public')));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routers
app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);



app.get('/', function (req, res) {
    // let user = new User({
    //     username: 'vyte@gmail.com',
    //     password: 'Th@otran17021997',
    //     firstName: 'Kiet',
    //     lastName: 'Nguyen',
    //     displayName: 'Kiet Nguyen'
    // });

    // user.save()
    //     .then(result => {
    //         return res.status(200).json({ data: doc });
    //     })
    //     .catch(err => {
    //         return res.status(500).json({ error: err });
    //     })
    return res.render('index', { code: 401, message: 'success' });
});

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