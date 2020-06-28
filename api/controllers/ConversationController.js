const ConversationManager = require('../managers/ConversationManager');
const MessageManager = require('../managers/MessageManager');
const Constants = require('../constants/Constants');
const Response = require('../../config/sendResponse');

let ConversationController = function ConversationController() { };

ConversationController.prototype.create = (req, res, next) => {
    let { receiverID, type, title, members } = req.body;
    let currentUser = req.user;

    return new ConversationManager().save({ currentUser, senderID: currentUser._id, receiverID, type, title, members })
        .then(entity => {
            res.status(201).json({ data: entity });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        })
}

ConversationController.prototype.update = (req, res, next) => {
    let id = req.params.id;
    let { title, members } = req.body;
    let currentUser = req.user;

    if (!id) {
        return res.status(400).json({ error: { message: 'Missing Conversation ID' } });
    }

    return new ConversationManager().getById(id)
        .then(entity => {
            if (entity == null) {
                return res.status(404).json({
                    error: {
                        message: 'Conversation not found'
                    }
                });
            }

            if (!entity.members.includes(currentUser._id) || !entity.admins.includes(currentUser._id)) {
                return Promise.reject({ 
                    message: 'Not have permission to perform action on this conversation',
                    status: 403
                });
            }

            return new ConversationManager().update({ currentUser, conversation: entity, title });
        })
        .then(result => {
            return res.status(200).json({ data: result });
        })
        .catch(err => {
            next(err);
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

ConversationController.prototype.addMembers = (req, res, next) => {
    let { members } = req.body;
    let conversationID = req.params['id'];
    let currentUser = req.user;

    if (!conversationID) {
        return res.status(400).json({ error: { message: 'Missing Conversation ID' } });
    }

    return new ConversationManager().getById(conversationID)
        .then(entity => {
            if (entity == null) {
                return res.status(404).json({
                    error: {
                        message: 'Conversation not found'
                    }
                });
            }

            if (!entity.members.includes(currentUser._id)) {
                return res.status(403).json({
                    error: {
                        message: 'Not have permission to perform action on this conversation'
                    }
                });
            }

            if (!entity.admins.includes(currentUser._id) && members) {
                return Promise.reject({  message: 'You must have admin role to add member from this conversation'  });
            }
            
            return new ConversationManager().update({ currentUser, members, conversation: entity });
        })
        .then(result => {
            return res.status(200).json({ data: result });
        })
        .catch(err => {
            return res.status(500).json({ error: err });
        });

}

ConversationController.prototype.delete = (req, res) => {
    let conversationID = req.params.id;
    let currentUser = req.user;

    if (!conversationID) {
        return res.status(400).json({ error: { message: 'Missing Conversation ID' } });
    }

    return new ConversationManager().getById(conversationID)
        .then(entity => {
            if (entity == null) {
                return res.status(404).json({
                    error: {
                        message: 'Conversation not found'
                    }
                });
            }

            if (!entity.members.includes(currentUser._id)) {
                return res.status(403).json({
                    error: {
                        message: 'Not allowed to delete this conversation'
                    }
                });
            }

            return new ConversationManager().delete({ conversation: entity, currentUser });
        })
        .then(result => {
            if (result)
                return res.status(200).json({ message: 'Deleted conversation successfully' });
        })
        .catch(err => {
            return res.status(500).json({ error: err });
        });
}

ConversationController.prototype.getMessages = (req, res, next) => {
    let conversationID = req.params.id;
    let currentUser = req.user;
    let pageIndex = parseInt(req.query['pageIndex']) || 1;
    let pageSize = parseInt(req.query['pageSize']) || parseInt(Constants.pageSize);

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
                return res.status(404).json({
                    error: {
                        message: 'Conversation not found'
                    }
                });
            }

            if (!conversationEntity.members.includes(currentUser._id)) {
                return res.status(403).json({
                    error: {
                        message: 'Not allowed to get message from this conversation'
                    }
                });
            }

            return new MessageManager().getMessagesByConversationID(conversationID, { pageIndex, pageSize });
        })
        .then(messages => {
            return res.status(200).json({
                data: messages
            });
        })
        .catch(err => {
            next(err);
            res.status(500).json({ error: err });
        });
}

ConversationController.prototype.leave = (req, res, next) => {
    let conversationID = req.params.id;
    let currentUser = req.user;
    let { members } = req.body;

    return new ConversationManager()
        .getById(conversationID)
        .then(conversationEntity => {
            if (!conversationEntity) {
                return res.status(404).json({
                    error: {
                        message: 'Conversation not found'
                    }
                });
            }

            if (!conversationEntity.admins.includes(currentUser._id) && members) {
                return res.status(403).json({
                    error: {
                        message: 'You must have admin role to remove member from this conversation'
                    }
                });
            }

            return new ConversationManager().leave({ currentUser, conversation: conversationEntity, members });
        })
        .then(result => {
            return res.status(200).json({ data: result });
        })
        .catch(err => {
            return res.status(500).json({ error: err });
        })
}

ConversationController.prototype.search = (req, res, next) => {
    let { m } = req.query;

    let members = m.split(',');

    if (Array.isArray(members) && members.length > 0) {
        return new ConversationManager().getConversationByMembers({ members })
                                        .then(entity => {
                                            res.status(200).json({ data: entity });
                                        })
                                        .catch(err => {
                                            res.status(500).json({ error: err });
                                        })
    } else {
        return res.status(401).json({ error: { 
            message: 'Missing Members'
        }})
    }
}

ConversationController.prototype.markSeen = (req, res, next) => {
    let conversationID = req.params.id;
    let currentUser = req.user;
    
    if (!conversationID) {
        return res.status(400).json({ 
            error: { 
                message: 'Missing conversation ID' 
            } 
        });
    }

    return new ConversationManager()
                .getById(conversationID)
                .then(conversationEntity => {
                    if (!conversationEntity) {
                        return res.status(404).json({
                            error: {
                                message: 'Conversation not found'
                            }
                        });
                    }

                    if (!conversationEntity.members.includes(currentUser._id)) {
                        return res.status(403).json({
                            error: {
                                message: 'Not allowed to mark seen this conversation'
                            }
                        });
                    }

                    return new ConversationManager().markSeen({ currentUser, conversation: conversationEntity })
                })
                .then(result => {
                    return res.status(200).json({ data: result });
                })
                .catch(err => {
                    return res.status(500).json({ error: err });
                })
}




module.exports = ConversationController.prototype;