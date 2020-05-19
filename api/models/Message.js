const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Text', 'Image', 'File'],
        default: 'Text',
        required: true
    },
    conversation: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true 
    },
    senderID: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    attachment: {
        fileName: {
            type: String,
            required: true
        },
        fileURL: {
            type: String,
            required: true
        }
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

const Message = mongoose.model('Message', MessageSchema, 'messages');

module.exports = Message;