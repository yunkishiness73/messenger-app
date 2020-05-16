const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema({
    senderID: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    receiverID: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { versionKey: false });

const FriendRequest = mongoose.model('FriendRequest', FriendRequestSchema, 'friend-requests');

module.exports = FriendRequest;