const co = require('co');
const Conversation = require('../models/Conversation');
const BaseManager = require('./BaseManager');
const Constants = require('../constants/Constants');
const Message = require('../models/Message');
const ObjectID = require('mongodb').ObjectID;

class ConversationManager extends BaseManager {

    getModel() {
        return Conversation;
    }

    save(payload) {
        const self = this;

        return co(function* save() {
            let Model = self.getModel();

            try {
                let { currentUser, senderID, receiverID, type, title, members } = payload;
                let conversation;
                /*
                * Populate whether conversation already existed
                * If not, create new one
                * Othewise, send error message to client
                */
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

                if (savedEntity && type === Constants.CONVERSATION_TYPE.Group) {
                    let msgs = [];

                    msgs.push({
                        conversation: savedEntity._id,
                        type: 'Notif',
                        senderID,
                        message: Constants.CONVERSATION_MESSAGE.Joined.replace('$1', currentUser.displayName)
                    });

                    members.forEach((member) => {
                        let msg = Constants.CONVERSATION_MESSAGE.Added.replace('$1', currentUser.displayName);
                        msg = msg.replace(`$2`, member.displayName);

                        msgs.push({
                            conversation: savedEntity._id,
                            type: 'Notif',
                            senderID,
                            message: msg
                        });
                    });
                    
                   return yield Message.insertMany(msgs);
                }

                return Promise.reject({ message: 'Save entity failed' });
            } catch(err) {
                return Promise.reject(err);
            }
        });
    }

    update(payload) {
        return co(function* update() {
            let { currentUser, title, members, conversation } = payload;
            let msgs = [];
            let msg = '';

            if (conversation.type === Constants.CONVERSATION_TYPE.Group) {
                if (members) {
                    members.forEach(member => {
                        if (!conversation.members.includes(ObjectID(member._id))) {
                            conversation.members.push(member);
                           
                            msg = Constants.CONVERSATION_MESSAGE.Added.replace('$1', currentUser.displayName);
                            msg = msg.replace(`$2`, member.displayName);

                            msgs.push({
                                conversation: conversation._id,
                                type: 'Notif',
                                senderID: currentUser._id,
                                message: msg
                            });
                        }
                    });
                } else if (title) {
                    conversation.title = title;

                    msg = Constants.CONVERSATION_MESSAGE.Renamed.replace('$1', currentUser.displayName);
                    msg = msg.replace(`$2`, title);

                    msgs.push({
                        conversation: conversation._id,
                        type: 'Notif',
                        senderID: currentUser._id,
                        message: msg
                    });
                }

                if (msgs.length) {
                    return yield Promise.all([conversation.save(), Message.insertMany(msgs)]);
                }

               return Promise.resolve();
            }
        })
        .catch(err => {
            return Promise.reject(err);
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

    leave(payload) {
        return co(function* search() {
            const { userID, conversation } = payload;

            if (conversation.type === Constants.CONVERSATION_TYPE.Group) {
                conversation.members.splice(conversation.members.indexOf(userID), 1);
                return yield conversation.save();
            }
        })
        .catch(err => {
            Promise.reject(err);
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