const AuthManager = require('../managers/AuthManager');

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

module.exports = AuthController.prototype;