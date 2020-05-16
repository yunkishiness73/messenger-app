const co = require('co');
const FriendRequest = require('../models/FriendRequest');
const BaseManager = require('./BaseManager');

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
}

module.exports = FriendManager;