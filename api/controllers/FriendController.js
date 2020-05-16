const FriendManager = require('../managers/FriendManager');
const UserManager = require('../managers/UserManager');

let FriendController = function FriendController() {};

FriendController.prototype.sendFriendRequest = (req, res) => {
    let { receiverID } = req.body;
    let user = req.user;

    if (!receiverID) {
        return res.status(400).json({ message: 'Missing receiver ID' });
    }

    return new UserManager().getById(receiverID)
                            .then(receiver => {
                                if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

                                return new FriendManager().sendFriendRequest({ senderID: user.id, receiverID });               
                            })
                            .then(entity => {
                                res.status(201).json({ data: entity });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            });
}

FriendController.prototype.getIncommingFriendsRequest = (req, res) => {
    return new FriendManager()
                .getIncommingFriendsRequest(req.user)
                .then(incommingRequests => {
                    if (!incommingRequests) {
                        return res.status(404).json({ message: 'Resource not found' });
                    }

                    return res.status(200).json({ data: incommingRequests });
                })
                .catch(err => {
                    res.status(500).json({ error: err });
                });      
}

FriendController.prototype.search = (req, res) => {

   
}




module.exports = FriendController.prototype;