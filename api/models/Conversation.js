const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false
    },
    photo: {
        type: String,
        required: false
    },
    type: {
        type: String,
        enum: ['Single', 'Group'],
        default: 'Single',
        required: true
    },
    members: [{ 
        type: mongoose.Schema.Types.ObjectId,
         ref: "User" 
    }],
    lastMessage: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message" 
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

const Conversation = mongoose.model('Conversation', ConversationSchema, 'conversations');

module.exports = Conversation;