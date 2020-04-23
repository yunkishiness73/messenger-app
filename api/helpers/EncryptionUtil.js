const bcrypt = require('bcrypt');

class EncryptionUtil {
    
    hashSync(plainPassword) {
        const saltRounds = 10;

        return bcrypt.hashSync(plainPassword, saltRounds);
    }

    compareSync(plainPassword, hashedPassword) {
        return bcrypt.compareSync(plainPassword, hashedPassword);
    }
}

module.exports = new EncryptionUtil();