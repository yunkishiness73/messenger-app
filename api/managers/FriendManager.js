const co = require('co');
const FriendRequest = require('../models/FriendRequest');
const Friend = require('../models/Friend');
const User = require('../models/User');
const BaseManager = require('./BaseManager');
const Constants = require('../constants/Constants');
const ObjectID = require('mongodb').ObjectID;

class FriendManager extends BaseManager {

    getModel() {
        return Friend;
    }

    sendFriendRequest(payload) {
        return co(function* sendFriendRequest() {
            const { senderID, receiverID } = payload;

            let entity = yield FriendRequest.find({
                $or: [
                    { 
                        senderID: senderID,
                        receiverID: receiverID
                    },
                    { 
                        senderID: receiverID,
                        receiverID: senderID,
                    } 
                ]
            });

            console.log('--------+---------');
            console.log(entity);

            if (Array.isArray(entity) && entity.length === 0) {
                const friendRequest = new FriendRequest({
                    senderID,
                    receiverID
                });

                let savedEntity = yield friendRequest.save();

                if (!savedEntity) {
                    return Promise.reject({
                        message: 'The both of you are friend already'
                    });
                }
    
                return savedEntity.populate([
                    {
                        path: 'senderID',
                        select: 'username firstName lastName photo',
                    },
                    {
                        path: 'receiverID',
                        select: 'username firstName lastName photo',
                    }
                ]);                       
            } else {
                let friendRequest = entity[0];

                if (friendRequest.status === Constants.FRIEND_REQUEST_STATUS.Rejected) {
                    friendRequest.status = Constants.FRIEND_REQUEST_STATUS.Pending;
                    friendRequest.senderID = senderID;
                    friendRequest.receiverID = receiverID;

                    return yield friendRequest.save();
                } else if (friendRequest.status === Constants.FRIEND_REQUEST_STATUS.Accepted) {
                    return Promise.reject({
                        message: 'The both of you are friend already'
                    });
                } else if (friendRequest.status === Constants.FRIEND_REQUEST_STATUS.Pending) {
                    return Promise.reject({
                        message: 'You sent friend requests to this person'
                    });
                }
            }
        });
    }

    getIncommingFriendsRequest(currentUser) {
        return co(function* getIncommingFriendsRequest() {
            return yield FriendRequest.find({ receiverID: currentUser._id, status: 'Pending' }, '-isDeleted')
                .populate([
                    {
                        path: 'senderID',
                        select: 'username firstName lastName displayName photo',
                    },
                    {
                        path: 'receiverID',
                        select: 'username firstName lastName displayName photo',
                    }
                ]);
        })
    }

    getFriendsRequest(currentUser) {
        return co(function* getFriendsRequest() {
            return yield FriendRequest.find({ senderID: currentUser._id, status: 'Pending' }, '-isDeleted')
                .populate([
                    {
                        path: 'senderID',
                        select: 'username firstName lastName displayName photo',
                    },
                    {
                        path: 'receiverID',
                        select: 'username firstName lastName displayName photo',
                    }
                ]);
        })
    }

    acceptFriendRequest(friendRequest) {
        return co(function* getFriendsRequest() {
            try {
                let updatedEntity = yield FriendRequest.updateOne({ _id: friendRequest._id }, { status: 'Accepted' });

                if (!updatedEntity.ok) {
                    return Promise.reject({ message: 'Update resource failed' });
                }

                let user = new Friend({
                    userID: friendRequest.senderID,
                    friendID: friendRequest.receiverID
                });
                let friend = new Friend({
                    userID: friendRequest.receiverID,
                    friendID: friendRequest.senderID,
                });

                return yield Promise.all([friend.save(), user.save()]);

            } catch (err) {
                return Promise.reject(err);
            }
        })
    }

    rejectFriendRequest(friendRequestID) {
        return co(function* getFriendsRequest() {
            try {
                let updatedEntity = yield FriendRequest.findOneAndUpdate({ _id: friendRequestID }, { status: 'Rejected' }, {
                    new: true
                });

                if (!updatedEntity) {
                    return Promise.reject({ message: 'Rejected friend request failed' });
                }

                return updatedEntity;
            } catch (err) {
                return Promise.reject(err);
            }

        })
    }

    getFriendRequestByID(friendRequestID) {
        return co(function* getFriendRequestByID() {
            let entity = yield FriendRequest.findById(friendRequestID);

            if (entity) return entity;

            return Promise.reject();
        });
    }

    search(options) {
        return co(function* search() {
            try {
                let { userID, q, searchType, isActive } = options;
                
                if (searchType === Constants.SEARCH_TYPE.Contact) {
                    return yield User.aggregate([
                        { $match: { 
                            $or: [ 
                                { username: new RegExp(q, "gmi") },
                                { displayName: new RegExp(q, "gmi") }
                            ],
                            'status': Constants.USER_STATUS.Enabled
                        }},
                        { $project: { username: 1, firstName: 1, lastName: 1, displayName: 1 } }
                    ]);
                }

                if (searchType === Constants.SEARCH_TYPE.Friend) {
                    return yield Friend.aggregate([
                        { $match: { userID } },
                        { $lookup: { from: 'users', localField: 'friendID', foreignField: '_id', as: 'friendID' } },
                        { $unwind: { path: '$friendID' } },
                        { $project: { 
                            "isDeleted": 0, "isBlocked": 0, "friendID.password": 0,
                            "friendID.isDeleted": 0, "friendID.createdAt": 0, "friendID.updatedAt": 0 
                        }},
                        { $match:  {
                            $or: [ 
                                { 'friendID.username': new RegExp(q, "gmi") },
                                { 'friendID.displayName': new RegExp(q, "gmi") }
                            ],
                            'friendID.status': Constants.USER_STATUS.Enabled
                        }},
                        { $sort: { 'friendID.displayName': 1 } }
                    ]);
                }

                let subCriteria = {};

                if (isActive == 1) {
                    subCriteria['friendID.isActive'] = true;
                }
                
                return yield Friend.aggregate([
                    { $match: { userID } },
                    { $lookup: { from: 'users', localField: 'friendID', foreignField: '_id', as: 'friendID' } },
                    { $unwind: { path: '$friendID' } },
                    { $project: { 
                        "isDeleted": 0, "isBlocked": 0, "friendID.status": 0, "friendID.password": 0,
                        "friendID.isDeleted": 0, "friendID.createdAt": 0, "friendID.updatedAt": 0 
                    }},
                    { $match: subCriteria },
                    { $sort: { 'friendID.displayName': 1 } }
                ]);
            } catch(err) {
                return Promise.reject(err);
            }
            
        }); 
    }

    unfriend(payload) {
        const self = this;

        return co(function* unfriend() {
            const Model = self.getModel();
            const { userID, friendID } = payload;
          
            return yield Model.deleteMany({
                $or: [
                    { userID: userID, friendID: friendID },
                    { userID: friendID, friendID: userID }
                ]
            });
        })
        .catch(err => {
            Promise.reject({ err });
        });
    }

}

module.exports = FriendManager;