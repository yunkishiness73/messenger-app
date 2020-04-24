
const passport    = require('passport');
const passportJWT = require("passport-jwt");
const LocalStrategy = require('passport-local').Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy   = passportJWT.Strategy;

const EncryptionUtil = require('../api/helpers/EncryptionUtil');

const User = require('../api/models/User');

const localOptions = {
    usernameField: 'username',
    passwordField: 'password'
};

passport.use(new LocalStrategy(localOptions, function(username, password, done){
    User.findOne({ username }, function(err, user) {
        if (err) return done(err, false);

        if (!user) return done(null, false, { message: 'User is not existed'});

        if (EncryptionUtil.compareSync(password, user.password)) {
            return done(null, user);
        }

        return done(null, false, { message: 'Password is not correct' });
    })
}));

const jwtOptions = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY
};

passport.use(new JWTStrategy(jwtOptions, function(payload, done) {
    User.findById(payload.id, function(err, user) {
        if (err) return done(err, false);

        if (user) {
            return done(null, user);
        }

        return done(null, false, { message: 'Invalid token' });
    })
}));

