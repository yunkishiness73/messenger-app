const co = require('co');
const Message = require('../models/Message');
const BaseManager = require('./BaseManager');

class MessageManager extends BaseManager {
    save(payload) {
        return co(function* save() {
            try {
                let { conversationID, type, senderID, message } = payload;

                let messageEntity = new Message({
                    conversation: conversationID,
                    type,
                    senderID,
                    message
                });
    
                let savedEntity = messageEntity.save();

                if (!savedEntity) {
                    return Promise.reject({ message: 'Save entity failed' });
                }

                return savedEntity;
            } catch(err) {
                return Promise.reject(err);
            }
        });
    }

    getMessagesByConversationID(conversationID, options) {
        return co(function* getMessageByConversationID() {
            return yield Message.find({ conversation: conversationID }, '-isDeleted');
        });
    }
    
    search(options) {
        return co(function* search() {
            try {
                let { userID } = options;
                
                return yield Friend.aggregate([
                    { $match: { userID } },
                    { $lookup: { from: 'users', localField: 'friendID', foreignField: '_id', as: 'friendID' } },
                    { $unwind: { path: '$friendID' } },
                    { $project: { 
                        "isDeleted": 0, "isBlocked": 0, "friendID.status": 0, "friendID.password": 0,
                        "friendID.isActive": 0, "friendID.isDeleted": 0, "friendID.createdAt": 0, "friendID.updatedAt": 0 
                    }},
                    { $sort: { 'friendID.displayName': 1 } }
                ]);
            } catch(err) {
                return Promise.reject(err);
            }
            
        }); 
    }

}

module.exports = MessageManager;