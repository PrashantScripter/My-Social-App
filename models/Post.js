const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

    description: {
        type: String,
    },

    postImage: {
        type: String,
        required: true,
    },

    comments:[
        {
            type: String,
        },
    ],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],

},
    { timestamps: true },
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;