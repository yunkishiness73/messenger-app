const User = require('../models/User');
const Schema = require('../schemas/UserSchema');
const BaseManager = require('./BaseManager');

class UserManager extends BaseManager {
    getModel() {
        return User;
    }

    getSchema() {
        return Schema;
    }
}

module.exports = UserManager;