const validator = require('is-my-json-valid');

class ValidatorUtil {

    validateWithSchema(data, schema) {
        let validate = validator(schema, {
            greedy: true
        });

        // Validate data from client
        validate(data);

        return validate.errors;
    }
}

module.exports = new ValidatorUtil();