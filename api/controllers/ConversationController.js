const ConversationManager = require('../managers/ConversationManager');

let ConversationController = function ConversationController() {};

ConversationController.prototype.create = (req, res) => {
    let { senderID, receiverID, type } = req.body;

    return new ConversationManager().save({ senderID, receiverID, type })
                            .then(entity => {
                                res.status(201).json({ data: entity });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            })
}

ConversationController.prototype.update = (req, res) => {
    let id = req.params.id;
    let data = req.body;
    
    if (!id) {
        return res.status(400).json({ error: { message: 'Missing Id' } });
    }

    return new ConversationManager().update(data)
                            .then(entity => {
                                res.status(201).json({ data: entity });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            });
}

ConversationController.prototype.getById = (req, res) => {
    let id = req.params.id;

    if (!id) {
        return res.status(400).json({ error: { message: 'Missing Id' } });
    }

    return new ConversationManager().getById(id)
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

ConversationController.prototype.forgotPassword = (req, res) => {
    let { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: { message: 'Missing email' } });
    }

    return new ConversationManager().forgotPassword(username)
                            .then(result => {
                                return res.status(200).json({ data: result });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            });
}

module.exports = ConversationController.prototype;