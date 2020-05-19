const User = require('../models/User');
const Schema = require('../schemas/UserSchema');
const BaseManager = require('./BaseManager');
const EncryptionUtil = require('../helpers/EncryptionUtil');
const co = require('co');
const DateUtil = require('../helpers/DateUtil');
const EmailService = require('../services/EmailService');

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

    getById(id) {
        const self = this;

        return co(function* getById() {
            const Model = self.getModel();

            return yield Model.findById(id, '-password');
        });
    }

    generatePassword() {
        let passwordArray = [];

        // Generate at least 1 digit
        // Random from 0 -> 9
        passwordArray.push(Math.floor(Math.random() * 10));

        // Generate at least 1 lowercase character
        // Random char code from 97 -> 122
        passwordArray.push(String.fromCharCode(Math.floor(Math.random() * 26 + 97)));

        // Generate at least 1 uppercase character
        // Random char code from 65 -> 90
        passwordArray.push(String.fromCharCode(Math.floor(Math.random() * 26 + 65)));

        // Generate at least 1 special character
        // Random char code from 33 -> 47
        passwordArray.push(String.fromCharCode(Math.floor(Math.random() * 15 + 33)));

        // Generate any character for 10 characters remain
        for (let i = 0; i < 10; i++) {
            // Random char code from 97 -> 122
            passwordArray.push(String.fromCharCode(Math.floor(Math.random() * 26 + 97)));
        }

        // Sort random passwordArray
        passwordArray = passwordArray.sort(() => {
            return .5 - Math.random();
        });

        return passwordArray.join('');
    }

    forgotPassword(username) {
        let self = this;

        return co(function* forgotPassword() {
           let entity = yield self.getModel().findOne({ username });

           console.log(entity);

           if (!entity) return Promise.reject({ message: "Resource not found" });

           let newPassword = self.generatePassword();

           entity.password = EncryptionUtil.hashSync(newPassword);
           entity.updatedAt = DateUtil.getNow();

           let updatedEntity = yield entity.save();

           if (!updatedEntity) return Promise.reject();
           
           EmailService.sendResetPassword({ to: updatedEntity.username, password: newPassword });

            return Promise.resolve({ message: "Your new password sent to your email" });
        });
    }
}

module.exports = UserManager;