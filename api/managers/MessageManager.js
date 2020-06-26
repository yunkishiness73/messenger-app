const co = require('co');
const Message = require('../models/Message');
const BaseManager = require('./BaseManager');
const Conversation = require('../models/Conversation');
const DateUtil = require('../helpers/DateUtil');

class MessageManager extends BaseManager {
    save(payload) {
        return co(function* save() {
            try {
                let { currentUser, conversationID, type, senderID, message, attachment } = payload;

                let messageEntity = new Message({
                    conversation: conversationID,
                    type,
                    senderID,
                    message,
                    attachment
                });
    
                let savedEntity = yield messageEntity.save();

                if (!savedEntity) {
                    return Promise.reject({ message: 'Save entity failed' });
                }

                let updatedConversation = yield Conversation.updateOne({ _id: conversationID }, { 
                    updatedAt: DateUtil.getNow(),
                    seenBy: [currentUser._id],
                    lastMessage: savedEntity._id 
                });

                if (!updatedConversation.nModified) {
                    return Promise.reject({ message: 'Update conversation failed' });
                }

                let savedEntityCopy = {
                    ...savedEntity._doc,
                    senderID: {
                        _id: currentUser._id, 
                        photo: currentUser.photo || '',
                        firstName: currentUser.firstName,
                        lastName: currentUser.lastName,
                        displayName: currentUser.displayName,
                        createdAt: currentUser.createdAt,
                        updatedAt: currentUser.updatedAt,
                        lastLoggedDate: currentUser.lastLoggedDate,
                    }
                };

                return savedEntityCopy;
            } catch(err) {
                return Promise.reject(err);
            }
        });
    }

    getMessagesByConversationID(conversationID, options) {
        return co(function* getMessageByConversationID() {
            const { pageIndex, pageSize } = options;

            const offset = (pageIndex - 1) * pageSize;

            let messages = yield Message.find({ conversation: conversationID }, '-isDeleted', { 
                                    sort: {
                                        createdAt: -1
                                    },
                                    limit: pageSize,
                                    skip: offset
                                })
                                .populate({
                                    path: 'senderID',
                                    select: '-isDeleted -isBlocked -status -password -isActive'
                                });

            let reversedMessage = messages.reverse();
                                
            return reversedMessage;
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