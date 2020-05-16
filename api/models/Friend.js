const mongoose = require('mongoose');

const FriendSchema = new mongoose.Schema({
    userID: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    friendID: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    isBlocked: {
        type: Boolean,
        default: false
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

const Friend = mongoose.model('Friend', FriendSchema, 'friends');

module.exports = Friend;