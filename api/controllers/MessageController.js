const MessageManager = require('../managers/MessageManager');
const ConversationManager = require('../managers/ConversationManager');

let MessageController = function MessageController() {};

MessageController.prototype.create = (req, res) => {
    let currentUser = req.user;
    let { receiverID, type, message, conversationID } = req.body;

    if (!conversationID) {
        return new ConversationManager()
                   .save({ receiverID, type, message, conversationID })
                   .then(conversationEntity => {
                        let payload = {
                            conversationID: conversationEntity._id
                        };

                       return new MessageManager().save(payload);
                    })
                    .then(messageEntity => {
                        return res.status(201).json({ data: messageEntity });
                    })
                    .catch(err => {
                        return res.status(500).json({ error: err });
                    })
    } else {
        return new MessageManager().save(data)
                                .then(entity => {
                                    res.status(201).json({ data: entity });
                                })
                                .catch(err => {
                                    res.status(500).json({ error: err });
                                })
    }

   
}

module.exports = MessageController.prototype;