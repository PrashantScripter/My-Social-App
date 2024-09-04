const express = require('express');
const Post = require('../models/Post');
const authenticate = require('../middlewares/authenticate');
const User = require('../models/User');
const { postComment, deleteComment } = require('../controller/commentController');
const Comment = require('../models/Comment');

const router = express.Router();


router.route('/:id').post(postComment).get(authenticate, async (req, res) => {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    const postOwner = await User.findById(post.createdBy);

    const CommentOnPost = await Promise.all(
        post.comments.map(async (commentId) => {
            const comment = await Comment.findById(commentId);
            const commentAuthor = await User.findById(comment.createdBy);

            return {
                ...comment._doc,
                authorName: commentAuthor.name,
            };
        })
    );

    res.render('CommentOnPost', { post, postOwner, postId, CommentOnPost });
});

router.delete('/delete/:id', deleteComment);

module.exports = router;