const ConversationManager = require('../managers/ConversationManager');
const MessageManager = require('../managers/MessageManager');

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

ConversationController.prototype.getMessages = (req, res) => {
    let conversationID = req.params.id;
    let currentUser = req.user;

    console.log(conversationID);

    if (!conversationID) {
        return res.status(400).json({
            error: {
                message: 'Missing Conversation ID'
            }
        })
    }

    return new ConversationManager()
                   .getById(conversationID)
                   .then(conversationEntity => {
                       if (!conversationEntity) {
                           return res.status(404).json({ error: {
                               message: 'Conversation not found'
                           } });
                       }

                       if (!conversationEntity.members.includes(currentUser._id)) {
                            return res.status(403).json({ error: {
                                message: 'Not allowed to get message from this conversation'
                            } });
                       }

                        return new MessageManager().getMessagesByConversationID(conversationID);
                    })
                    .then(messages => {
                        return res.status(200).json({ data: messages });
                    })
                    .catch(err => {
                        res.status(500).json({ error: err });
                    });
}

module.exports = ConversationController.prototype;