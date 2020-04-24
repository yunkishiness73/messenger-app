const AuthManager = require('../managers/AuthManager');
const AuthService =  require('../services/AuthService');

let AuthController = function AuthController() {};


AuthController.prototype.verifyEmail = (req, res) => {
    const token = req.params.token;

    if (!token) return res.end();
        
    return new AuthManager().verifyEmail(token, res)
                            .then(data => {
                                if (data && data.ok === 1)
                                return res.render('index', { code: 200, message: 'Your account have been activated.' });
                            })
                            .catch(() => {
                                return res.render('index', { code: 401, message: 'Sorry. Your account have been failed to activate.' });
                            });
}

AuthController.prototype.login = (req, res, next) => {
    let user = req.user;

    if (user) {
        const token = AuthService.generateToken(user, 3600);
    
        return res.status(200).json({ token });
    }
}

module.exports = AuthController.prototype;