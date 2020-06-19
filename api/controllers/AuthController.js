const AuthManager = require('../managers/AuthManager');
const UserManager = require('../managers/UserManager');
const AuthService =  require('../services/AuthService');
const DateUtil = require('../helpers/DateUtil');
const Response = require('../../config/sendResponse');

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

    const userInfo = {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName
    };

    if (user) {
        let criteria = {
            _id: user._id,
        };
        
        let doc = { 
            isActive: true,
            lastLoggedDate: DateUtil.getNow()
        }

        return new UserManager()
                    .update({ criteria, doc })
                    .then(result => {
                        if (result.ok === 1) {
                            const token = AuthService.generateToken(user, 7200);
    
                            return res.status(200).json({ token, userInfo });
                        }
 
                        return res.status(401).json({ message: 'Unauthorized' });
                    })
                    .catch(err => {
                        next(err);

                        return res.status(500).json({ err });
                    })
       
    }
}

module.exports = AuthController.prototype;