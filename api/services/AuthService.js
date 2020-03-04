const jwt = require('jsonwebtoken');

class AuthService {
    generateToken(entity) {
        console.log(entity);
        let payload = {
            id: entity.id,
            username: entity.username,
            firstName: entity.firstName,
            lastName: entity.lastName,
            displayName: entity.displayName,
        }

       return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 300 });
    }


    verifyToken(token) {
        return jwt.verify(token, process.env.SECRET_KEY);
    }
}

module.exports = new AuthService();