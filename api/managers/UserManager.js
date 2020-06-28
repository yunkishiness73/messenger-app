const User = require('../models/User');
const Schema = require('../schemas/UserSchema');
const BaseManager = require('./BaseManager');
const EncryptionUtil = require('../helpers/EncryptionUtil');
const co = require('co');
const DateUtil = require('../helpers/DateUtil');
const EmailService = require('../services/EmailService');
const FriendManager = require('../managers/FriendManager');
const _ = require('lodash');
const Constants = require('../constants/Constants');

class UserManager extends BaseManager {
    getModel() {
        return User;
    }

    getSchema() {
        return Schema;
    }

    beforeSave(originalEntity) {
        const self = this;

        return co(function* beforeSave() {
            const existedUser = yield self.findByUsername(originalEntity.username);

            if (!existedUser) {
                originalEntity.password = EncryptionUtil.hashSync(originalEntity.password);
    
                return Promise.resolve(originalEntity);
            }
        
            if (existedUser.status === Constants.USER_STATUS.Pending) {
                // existedUser.password = originalEntity.password;
                // existedUser.firstName = originalEntity.firstName;
                // existedUser.lastName = originalEntity.lastName;
                // existedUser.displayName = 

                // let saveEntity = yield existedUser.save();

                self.generateTokenAndSendMail(originalEntity);

                return Promise.reject({ 
                    message: `This account was created but has not been activated. Check email ${existedUser.username} to activate!`
                });
            }

            return Promise.reject({ 
                message: 'Email already taken'
            });
        });
    }

    getById(id) {
        const self = this;

        return co(function* getById() {
            const Model = self.getModel();

            return yield Model.findById(id, '-password');
        });
    }

    findByUsername(username, options) {
        const self = this;

        return co(function* getById() {
            const Model = self.getModel();

            return yield Model.findOne({ username });
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

    findUsersAreNotFriend(options) {
        let self = this;

        return co(function* forgotPassword() { 
            let { userID, q } = options;
            let Model = self.getModel();

            let friends = yield new FriendManager().search({ userID });
            let friendIDs = _.map(friends, 'friendID._id');

            friendIDs.push(userID);

            let criteria = {
                _id: { $nin: friendIDs },
                status: Constants.USER_STATUS.Enabled
            }

            if (q) {
                criteria = {
                    ...criteria,
                    $or: [ 
                        { username : new RegExp(q, "gmi") },
                        { displayName: new RegExp(q, "gmi") }
                    ]
                }
            }

            let entity = yield Model.find(criteria, '-isDeleted -password -createdAt -updatedAt -lastLoggedDate');

            console.log(friendIDs);
            console.log(friends);
            console.log('======+========');
            console.log(entity);

            return entity;
        });
    }

    forgotPassword(username) {
        let self = this;

        return co(function* forgotPassword() {
           let entity = yield self.getModel().findOne({ username });

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