const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a Name"],
    },

    email: {
        type: String,
        required: [true, "Please enter a E-mail"],
        unique: [true, "Email already Exists"],
    },

    password: {
        type: String,
        required: [true, "Please enter a Password"],
        minlength: [6, "Password must be at least 6 characters"],
    },

    userProfileImage:{
        type: String,
        default: "/images/user.png",
    },

    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);