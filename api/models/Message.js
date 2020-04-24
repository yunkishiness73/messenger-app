const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Enabled', 'Locked', 'Disabled', 'Pending'],
        default: 'Pending',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    lastLoggedDate: {
        type: Date
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