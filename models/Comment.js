const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({

    comment:{
        type: String,
        required: true,
    },

    postId:{
        type: mongoose.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },


}, {timestamps: true}
);

module.exports = mongoose.model('Comment', commentSchema);
