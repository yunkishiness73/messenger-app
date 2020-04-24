const mongoose = require('mongoose');
const User = require('./User');

const ConversationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false
    },
    type: {
        type: String,
        enum: ['single', 'group'],
        default: 'single',
        required: true
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
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

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;