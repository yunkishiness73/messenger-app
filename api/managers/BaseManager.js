const co = require('co');
const _ = require('lodash');
const Validator = require('../helpers/ValidatorUtil');
const EmailService = require('../services/EmailService');
const AuthService = require('../services/AuthService');
const DateUtil = require('../helpers/DateUtil');


class BaseManager {

    getById(id) {
        const self = this;

        return co(function* getById() {
            const Model = self.getModel();

            let entity = yield Model.findById(id, '-password');

            if (entity) return entity;

            return Promise.reject();
        });
    }

    beforeSave(originalEntity) {
        return Promise.resolve(originalEntity);
    }

    save(originalEntity) {
        const self = this;
        let entity;
        
        return co(function* save() {
            const Model = self.getModel();
            const schema = self.getSchema();
        
            const validateResults = Validator.validateWithSchema(originalEntity, schema);

            if (!validateResults) {
                originalEntity = yield self.beforeSave(originalEntity);

                entity = Model(originalEntity);

                let savedEntity = yield entity.save();

                if (!savedEntity) return Promise.reject({ message: 'Save entity failed' });

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

            if (token) {
                EmailService.sendConfirmationEmail({ to: entity.username, token });
            }
        });
    }
}

module.exports = BaseManager;