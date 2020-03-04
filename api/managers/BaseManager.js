const co = require('co');
const _ = require('lodash');
const Validator = require('../helpers/ValidatorUtil');
const EmailService = require('../services/EmailService');
const AuthService = require('../services/AuthService');

class BaseManager {
    save(originalEntity) {
        const self = this;
        let entity;
        
        return co(function* save() {
            const Model = self.getModel();
            const schema = self.getSchema();
        
            const validateResults = Validator.validateWithSchema(originalEntity, schema);

            if (!validateResults) {
                entity = Model(originalEntity);

                let savedEntity = yield entity.save();

                if (!savedEntity) return Promise.reject();

                yield self.generateTokenAndSendMail(savedEntity);

                return savedEntity;
            }

            return Promise.reject(validateResults);
        });
    }

    update(originalEntity) {
        const self = this;
         
        return co(function* update() {
            const Model = self.getModel();

            let updatedEntity = yield Model.updateOne({ username: originalEntity.username }, { isActive: true });
        });
    }

    generateTokenAndSendMail(entity) {
        return co(function* generateTokenAndSendMail() {
            let token = AuthService.generateToken(entity);
            console.log('token');
            if (token) {
                EmailService.sendConfirmationEmail({ to: entity.username, token });
            }
        });
    }
}

module.exports = BaseManager;