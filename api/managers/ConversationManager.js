const co = require('co');
const Conversation = require('../models/Conversation');
const BaseManager = require('./BaseManager');
const Constants = require('../constants/Constants');

class ConversationManager extends BaseManager {

    getModel() {
        return Conversation;
    }

    save(payload) {
        const self = this;

        return co(function* save() {
            let Model = self.getModel();

            try {
                let { senderID, receiverID, type, title, members } = payload;
                let conversation;
                /*
                * Populate whether conversation already existed
                * If not, create new one
                * Othewise, send error message to client
                */
               console.log(members);
               switch(type) {
                   case Constants.CONVERSATION_TYPE.Group:
                        conversation = new Conversation({
                            members: [senderID, ...members],
                            type, 
                            title
                        });

                        break;
                    default:
                        let entity = yield Model.find({ 
                                                        members: { 
                                                            $all: [senderID, receiverID]
                                                        }
                                                      })
                                                        .populate({
                                                            path: 'members',
                                                            select: 'username displayName firstName lastName'
                                                        });

                            if (Array.isArray(entity) && entity.length === 0) {
                                conversation = new Conversation({
                                    members: [senderID, receiverID],
                                    type
                                });
                            } else {
                                return Promise.reject({
                                    message: 'Conversation already existed'
                                });
                            }
                        break;
               }

                let savedEntity = yield conversation.save();

                if (!savedEntity) {
                    return Promise.reject({ message: 'Save entity failed' });
                }

                return savedEntity;
            } catch(err) {
                return Promise.reject(err);
            }
        });
    }

    getUserConversations(payload) {
        const self = this;

        return co(function* search() {
            let { userID } = payload;
            let Model = self.getModel();

            // return yield Model.find({ 
            //                         members: { 
            //                             $all: ["5ec344ebcfd7e138f8fc40db", "5ec344ebcfd7e138f8fc40db"]
            //                         }
            //                     })
            //                     .populate({
            //                         path: 'members',
            //                         select: 'username displayName firstName lastName'
            //                     });
            return yield Model.find({ 
                                    members: { 
                                        $all: [userID]
                                    }
                                },
                                '-isDeleted',
                                {
                                    sort: { 'updatedAt': -1  }
                                })
                                .populate([
                                    {
                                        path: 'members',
                                        select: 'username displayName firstName lastName'
                                    },
                                    {
                                        path: 'lastMessage',
                                        select: '-isDeleted',
                                        populate: {
                                            path: 'senderID',
                                            select: 'username displayName firstName lastName'
                                        }
                                    }
                                ]);
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

module.exports = ConversationManager;