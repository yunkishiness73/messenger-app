const UserManager = require('../managers/UserManager');
const ConversationManager = require('../managers/ConversationManager');

let UserController = function UserController() {};

UserController.prototype.create = (req, res) => {
    let data = req.body;

    return new UserManager().save(data)
                            .then(entity => {
                                res.status(201).json({ data: entity });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            })
}

UserController.prototype.update = (req, res) => {
    let id = req.params.id;
    let data = req.body;
    
    if (!id) {
        return res.status(400).json({ error: { message: 'Missing Id' } });
    }

    return new UserManager().update(data)
                            .then(entity => {
                                res.status(201).json({ data: entity });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
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




module.exports = UserController.prototype;