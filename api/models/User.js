const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['Enabled', 'Locked', 'Disabled', 'Pending'],
        default: 'Pending',
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: false,
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

const User = mongoose.model('User', UserSchema, 'users');

module.exports = User;