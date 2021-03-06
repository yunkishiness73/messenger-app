const MessageManager = require('../managers/MessageManager');
const ConversationManager = require('../managers/ConversationManager');
const Constants = require('../constants/Constants');

let MessageController = function MessageController() {};

MessageController.prototype.create = (req, res) => {
    let attachment;
    let currentUser = req.user;
    let { receiverID, conversationType, message, conversationID } = req.body;
    let file = req.file;
    let messageType = 'Text';

    if (file) {
        attachment = {
            fileName: file.filename,
            fileURL: file.path.replace(/\\/g, "/"),
            fileSize: file.size,
            fileType: file.mimetype
        }

        let fileType = file.mimetype.split('/')[0];

        message = `${currentUser.displayName} sent an attachment`;

        switch (fileType) {
            case Constants.MESSAGE_TYPE.Image.toLowerCase():
                messageType = Constants.MESSAGE_TYPE.Image;
                break;
            case Constants.MESSAGE_TYPE.Video.toLowerCase():
                messageType = Constants.MESSAGE_TYPE.Video;
                break;
            default:
                messageType = Constants.MESSAGE_TYPE.Others;
                break;
        }
    }               
    
    if (!conversationID) {
        return new ConversationManager()
                   .save({ senderID: currentUser._id, receiverID, type: conversationType })
                   .then(conversationEntity => {
                        let payload = {
                            conversationID: conversationEntity._id,
                            message,
                            senderID: currentUser._id,
                            type: messageType,
                            attachment,
                            currentUser
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

                        return new MessageManager().save({ currentUser, conversationID, type: messageType, senderID: currentUser._id, message, attachment })
                    })
                    .then(messageEntity => {
                        res.status(201).json({ data: messageEntity });
                    })
                    .catch(err => {
                        res.status(500).json({ error: err });
                    });
}

module.exports = MessageController.prototype;