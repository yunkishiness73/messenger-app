const co = require('co');
const FriendRequest = require('../models/FriendRequest');
const Friend = require('../models/Friend');
const User = require('../models/User');
const BaseManager = require('./BaseManager');

class FriendManager extends BaseManager {

    getModel() {
        return Friend;
    }

    sendFriendRequest(payload) {
        return co(function* sendFriendRequest() {
            const { senderID, receiverID } = payload;

            const friendRequest = new FriendRequest({
                senderID,
                receiverID
            });

            let savedEntity = yield friendRequest.save();

            console.log(savedEntity);

            if (!savedEntity) return Promise.reject();

            return savedEntity;
        });
    }

    getIncommingFriendsRequest(currentUser) {
        return co(function* getIncommingFriendsRequest() {
            return yield FriendRequest.find({ receiverID: currentUser._id, status: 'Pending' }, '-isDeleted')
                .populate([
                    {
                        path: 'senderID',
                        select: 'username firstName lastName',
                    },
                    {
                        path: 'receiverID',
                        select: 'username firstName lastName',
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
                        select: 'username firstName lastName',
                    },
                    {
                        path: 'receiverID',
                        select: 'username firstName lastName',
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
                let updatedEntity = yield FriendRequest.updateOne({ _id: friendRequestID }, { status: 'Rejected' });

                if (!updatedEntity.ok) {
                    return Promise.reject({ message: 'Rejected friend request failed' });
                }

                return Promise.resolve({ message: 'Rejected friend request successfully' });
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
                let { userID, q, searchType } = options;
                
                if (searchType) {
                    return yield User.aggregate([
                        { $match: { 
                            $or: [ 
                                { username: new RegExp(q, "gmi") },
                                { displayName: new RegExp(q, "gmi") }
                            ]
                        }},
                        { $project: { username: 1, firstName: 1, lastName: 1, displayName: 1 } }
                    ]);
                }

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

    unfriend(payload) {
        const self = this;

        return co(function* unfriend() {
            const Model = self.getModel();
            const { userID, friendID } = payload;
          
            return yield Model.deleteMany({
                $or: [
                    { userID, friendID },
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