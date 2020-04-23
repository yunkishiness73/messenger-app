const User = require('../models/User');
const Schema = require('../schemas/UserSchema');
const BaseManager = require('./BaseManager');
const EncryptionUtil = require('../helpers/EncryptionUtil');

class UserManager extends BaseManager {
    getModel() {
        return User;
    }

    getSchema() {
        return Schema;
    }

    beforeSave(originalEntity) {
        originalEntity.password = EncryptionUtil.hashSync(originalEntity.password);

        return Promise.resolve(originalEntity);
    }
}

module.exports = UserManager;