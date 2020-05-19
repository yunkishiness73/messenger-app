const MessageManager = require('../managers/MessageManager');
const ConversationManager = require('../managers/ConversationManager');

let MessageController = function MessageController() {};

MessageController.prototype.create = (req, res) => {
    let currentUser = req.user;
    let { receiverID, conversationType, message, conversationID, messageType } = req.body;

    if (!conversationID) {
        return new ConversationManager()
                   .save({ receiverID, type: conversationType, message, conversationID })
                   .then(conversationEntity => {
                        let payload = {
                            conversationID: conversationEntity._id,
                            message,
                            senderID: currentUser._id,
                            type: messageType
                        };

                       return new MessageManager().save(payload);
                    })
                    .then(messageEntity => {
                        return res.status(201).json({ data: messageEntity });
                    })
                    .catch(err => {
                        return res.status(500).json({ error: err });
                    });
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
                                message: 'Not allowed to send message to this conversation'
                            } });
                       }

                        return new MessageManager().save({ conversationID, type: messageType, senderID: currentUser._id, message })
                    })
                    .then(messageEntity => {
                        res.status(201).json({ data: messageEntity });
                    })
                    .catch(err => {
                        res.status(500).json({ error: err });
                    });
    

   
}

module.exports = MessageController.prototype;