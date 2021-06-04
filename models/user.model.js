'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String, 
        required: true,
        trim: true, 
    },
    password: {
        type: String,
    },
    // User address
    address: {
        type: String,
        trim: true, 
    },
    // phone number
    phone: {
        type: String,
        trim: true, 
    },
    resetLink: {
        data: String,
        default: ''
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
    }],
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }], 
    link: {
        type: String
    }   
}, {
    timestamps: true, toJSON: { virtuals: true }
});

userSchema.virtual("posts", {
    ref: "Post",
    foreignField: "postedBy", 
    localField: "_id",
});

module.exports = mongoose.model('User', userSchema);