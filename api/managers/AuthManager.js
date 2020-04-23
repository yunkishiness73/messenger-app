const co = require('co');
const User = require('../models/User');
const BaseManager = require('./BaseManager');
const AuthService = require('../services/AuthService');

class AuthManager extends BaseManager {
    verifyEmail(token, res) {
        return co(function* verifyEmail() {
            try {
                let entity = AuthService.verifyToken(token);

                return yield User.updateOne({ username: entity.username }, { status: 'Enabled' });
            } catch(err) {
                return Promise.reject(err.message);
            }
        })
    }
}

module.exports = AuthManager;