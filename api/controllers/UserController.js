const UserManager = require('../managers/UserManager');
const ConversationManager = require('../managers/ConversationManager');
const EncryptUtil = require('../helpers/EncryptionUtil');

let UserController = function UserController() {};

UserController.prototype.create = (req, res, next) => {
    let data = req.body;
    
    return new UserManager().save(data)
                            .then(entity => {
                                res.status(201).json({ data: entity });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            })
}

UserController.prototype.update = (req, res, next) => {
    let id = req.params.id;
    let data = req.body;
    let file = req.file;
    let photo;

    if (file) {
        if (file.mimetype.split("/")[0] !== "image") {
            return res.status(400).json({ error: { message: 'Photo field must be image type (jpeg,png,jpg,...)' } });
        } else {
            photo = file.path.replace(/\\/g, "/");
            data['photo'] = photo;
        }
    }
   
    if (!id) {
        return res.status(400).json({ error: { message: 'Missing User ID' } });
    }

    return new UserManager().getById(id)
                            .then(user => {
                                if (!user) {
                                    return Promise.reject({
                                        message: 'User not found',
                                        status: 404
                                    });
                                }

                                if (data['password']) {
                                    let password = data['password'];
                                    let hashedPassword = req.user['password'];

                                    if (!EncryptUtil.compareSync(password, hashedPassword)) {
                                        return Promise.reject({
                                            message: 'Wrong password',
                                            status: 400
                                        });
                                    }

                                    let _doc = {
                                        password: EncryptUtil.hashSync(data['newPassword'])
                                    };

                                    console.log(_doc);

                                    return new UserManager().update({ originalEntity: user, doc: _doc });
                                }

                                return new UserManager().update({ originalEntity: user, doc: data });
                            })
                            .then(entity => {
                                let data = {
                                    _id: entity['id'],
                                    username: entity['username'], 
                                    firstName: entity['firstName'], 
                                    lastName: entity['lastName'],
                                    displayName: entity['displayName'],
                                    photo: entity['photo'],
                                };

                                return res.status(200).json({ data });
                            })
                            .catch(err => {
                                next(err);
                            });
}

UserController.prototype.getById = (req, res) => {
    let id = req.params.id;

    if (!id) {
        return res.status(400).json({ error: { message: 'Missing Id' } });
    }

    return new UserManager().getById(id)
                            .then(entity => {
                                if (entity == null) {
                                    return res.status(404).json({ message: 'Resource not found' });
                                }
                                
                                return res.status(200).json({ data: entity });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            });
}

UserController.prototype.forgotPassword = (req, res) => {
    let { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: { message: 'Missing email' } });
    }

    return new UserManager().forgotPassword(username)
                            .then(result => {
                                return res.status(200).json({ data: result });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            });
}

UserController.prototype.getConversations = (req, res) => {
   let currentUser = req.user;

   return new ConversationManager()
                .getUserConversations({ userID: currentUser._id })
                .then(conversations => {
                    return res.status(200).json({ data: conversations });
                })
                .catch(err => {
                    return res.status(500).json({ error: err });
                });
}

UserController.prototype.search = (req, res) => {
    let currentUser = req.user;
    let q = req.query['q'];
 
    return new UserManager()
                 .findUsersAreNotFriend({ userID: currentUser._id, q })
                 .then(users => {
                     return res.status(200).json({ data: users });
                 })
                 .catch(err => {
                     return res.status(500).json({ error: err });
                 });
 }




module.exports = UserController.prototype;