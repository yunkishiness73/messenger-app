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

const Conversation = require('./api/models/Conversation');
const User = require('./api/models/User');

// app.get('/', async function (req, res) {
//     let user = await User.findById("5ea2e8ce4227d23070a115d8");
//     console.log(user);
//     // let conversation = new Conversation({
//     //     type: 'single',
//     //         members: [user]
//     // });

  
//     let conversation = await Conversation.findById("5ea2e8ce4227d23070a115d8").limit(1);

//     console.log(conversation);

//     conversation.members.push("5ea2e8ce4227d23070a115d8");
//     conversation.ahihi = "ihaha";

//       conversation.save()
//         .then(result => {
//             return res.status(200).json({ data: result });
//         })
//         .catch(err => {
//             return res.status(500).json({ error: err });
//         })



    
//     // let user = new User({
//     //     username: 'vyte@gmail.com',
//     //     password: 'Th@otran17021997',
//     //     firstName: 'Kiet',
//     //     lastName: 'Nguyen',
//     //     displayName: 'Kiet Nguyen'
//     // });

//     // user.save()
//     //     .then(result => {
//     //         return res.status(200).json({ data: doc });
//     //     })
//     //     .catch(err => {
//     //         return res.status(500).json({ error: err });
//     //     })
//     // return res.render('index', { code: 401, message: 'success' });
// });

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