const co = require('co');
const FriendRequest = require('../models/FriendRequest');
const BaseManager = require('./BaseManager');
const mongoose = require('mongoose');

class FriendManager extends BaseManager {
   sendFriendRequest(payload) {
       return co(function* sendFriendRequest() {
           const { senderID, receiverID  } = payload;

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
            return yield FriendRequest.find({ receiverID: currentUser._id, status: 'Pending'}, '-isDeleted')
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
            return yield FriendRequest.find({ senderID: currentUser._id, status: 'Pending'}, '-isDeleted')
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

    acceptFriendRequest(friendRequestID) {
        return co(function* getFriendsRequest() {
            const session = yield mongoose.startSession();

            session.startTransaction();

            try {
                const opts = { session };
                
                let updatedEntity = yield FriendRequest.updateOne({ _id: friendRequestID }, { status: 'Accepted' }).session(session);

                console.log(updatedEntity);


            } catch(err) {
                yield session.abortTransaction();

                return Promise.reject(err);
            }

            return yield FriendRequest.updateOne({ _id: friendRequestID }, { status: 'Accepted' });
        })
    }

    rejectFriendRequest(friendRequestID) {
        return co(function* getFriendsRequest() {
            return yield FriendRequest.updateOne({ _id: friendRequestID }, { status: 'Rejected' });
        })
    }

    getFriendRequestByID(friendRequestID) {
        return co(function* getFriendRequestByID() {
            let entity = yield FriendRequest.findById(friendRequestID);

            if (entity) return entity;

            return Promise.reject();
        });
    }

}

module.exports = FriendManager;