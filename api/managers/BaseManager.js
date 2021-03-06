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

            return yield Model.findById(id);
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

    update(payload) {
        const self = this;

        return co(function* update() {
            const Model = self.getModel();
            const { originalEntity, criteria, doc } = payload;

            let condition = {};

            if (originalEntity) {
                condition = { _id: originalEntity._id };
            } else if (criteria) {
                condition = _.cloneDeep(criteria);
            }

            let updatedEntity = yield Model.findOneAndUpdate(condition, doc, {
                new: true
            });

            if (!updatedEntity) {
                return Promise.reject({ message: 'Updated user \'s information failed' });
            }

            return updatedEntity;
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

    delete(id, options) {
        const self = this;

        return co(function* update() {
            try {
                const Model = self.getModel();

                return yield Model.deleteOne({ _id: id });
            } catch (err) {
                return Promise.reject(err);
            }
        });
    }
}

module.exports = BaseManager;