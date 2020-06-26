const co = require('co');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const BaseManager = require('./BaseManager');
const Constants = require('../constants/Constants');
const DateUtil = require('../helpers/DateUtil');
const ObjectID = require('mongodb').ObjectID;

class ConversationManager extends BaseManager {

    getModel() {
        return Conversation;
    }

    getById(id, options) {
        const self = this;

        return co(function* getById() {
            const Model = self.getModel();

            return yield Model.findById(id);
        });
    }

    getConversationByMembers(payload) {
        const self = this;

        return co(function* getConversationByMembers() {
            const Model = self.getModel();
            const { members } = payload;

            let conversation = yield Model.find({ 
                members: { 
                    $all: members
                },
                type: Constants.CONVERSATION_TYPE.Single
              })
                .populate([
                    {
                        path: 'members',
                        select: 'username displayName firstName lastName photo'
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


            return conversation;
        })
        .catch(err => {
            Promise.reject(err);
        });
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
                            admins: [senderID],
                            type, 
                            title
                        });

                        break;
                    default:
                        let entity = yield Model.find({ 
                                                        members: { 
                                                            $all: [senderID, receiverID],
                                                        },
                                                        type: Constants.CONVERSATION_TYPE.Single
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
                                    message: 'Conversation already existed',
                                    data: entity
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

                    let insertedMessage = yield Message.insertMany(msgs);

                    if (insertedMessage.length) {
                        savedEntity.lastMessage = insertedMessage[insertedMessage.length-1];
                        savedEntity.updatedAt = DateUtil.getNow();

                        return yield savedEntity.save();
                    }
                } else if (savedEntity && type === Constants.CONVERSATION_TYPE.Single) return savedEntity;
                

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
                    let insertedMessage = yield Message.insertMany(msgs);
                
                    if (insertedMessage.length) {
                        conversation.lastMessage = insertedMessage[insertedMessage.length-1];
                        conversation.updatedAt = DateUtil.getNow();
                        conversation.seenBy = [currentUser._id];
                    }

                    return yield conversation.save();
                }

               return Promise.resolve();
            }
        })
        .catch(err => {
            return Promise.reject(err);
        });
    }

    markSeen(payload) {
        const self = this;

        return co(function* search() {
            let Model = self.getModel();
            const { currentUser, conversation } = payload;

            if (conversation.seenBy.indexOf(currentUser._id) === -1) {
                conversation.seenBy.push(currentUser._id);
            }

            return yield conversation.save();
        });
    }

    getUserConversations(payload) {
        const self = this;

        return co(function* search() {
            let { userID } = payload;
            let Model = self.getModel();
            
            return yield Model.find({ 
                                    members: { 
                                        $all: [userID]
                                    },
                                    deletedBy: {
                                        $not: {
                                            $elemMatch: { $eq: userID }
                                        }
                                    }
                                },
                                '-isDeleted',
                                {
                                    sort: { 'updatedAt': -1  }
                                })
                                .populate([
                                    {
                                        path: 'members',
                                        select: 'username displayName firstName lastName photo'
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
            const { currentUser, conversation, members } = payload;
            let msg = '';

            if (conversation.type === Constants.CONVERSATION_TYPE.Group) {
                /* 
                * In case, if members exists that means admin removed member from the conversation
                * Otherwise, member leaved the conversation
                */
                if (members) {
                    let msgs = [];

                    members.forEach(member => {
                        if (conversation.members.indexOf(member._id) !== -1) {
                            conversation.members.splice(conversation.members.indexOf(member._id), 1);

                            msg = Constants.CONVERSATION_MESSAGE.Removed.replace('$1', currentUser.displayName);
                            msg = msg.replace('$2', member.displayName);

                            let message = new Message({
                                conversation: conversation._id,
                                type: 'Notif',
                                senderID: currentUser._id,
                                message: msg
                            });

                            msgs.push(message);
                        }
                    });

                    if (msgs.length) {
                        let insertedMessage = yield Message.insertMany(msgs);
                    
                        if (insertedMessage.length) {
                            conversation.lastMessage = insertedMessage[insertedMessage.length-1];
                            conversation.updatedAt = DateUtil.getNow();
                            conversation.seenBy = [currentUser._id];
                        }
                 
                        return yield conversation.save();
                    }
                }

                if (conversation.members.indexOf(currentUser._id) !== -1) {
                    conversation.members.splice(conversation.members.indexOf(currentUser._id), 1);

                    msg = Constants.CONVERSATION_MESSAGE.Leaved.replace('$1', currentUser.displayName);

                    let message = new Message({
                        conversation: conversation._id,
                        type: 'Notif',
                        senderID: currentUser._id,
                        message: msg
                    });

                    let insertedMessage = yield message.save();

                    if (insertedMessage) {
                        conversation.lastMessage = insertedMessage;
                        conversation.updatedAt = DateUtil.getNow();
                        conversation.seenBy = [currentUser._id];
                    }

                    return yield conversation.save();
                }
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

    delete(payload) {
        return co(function* update() {
            let { conversation, currentUser } = payload;
        
            //Delete this conversation with current user
            conversation.deletedBy.push(currentUser._id);

            return yield conversation.save();
        })
        .catch(err => {
            return Promise.reject(err);
        });
    }

}

module.exports = ConversationManager;