const authenticate = require('../middlewares/authenticate');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { findByIdAndDelete } = require('../models/User');


exports.postComment = [
    authenticate,
    async (req, res) => {
        try {
            const postId = req.params.id;
            const post = await Post.findById(postId);
            const { comment } = req.body;

            if (!comment) {
                return res.status(400).json({
                    message: "Comment not found"
                })
            }

            const newComment = await Comment.create({
                comment,
                postId: postId,
                createdBy: req.user.userId
            });

            post.comments.push(newComment._id);

            await post.save();

            return res.redirect(`/comment/${postId}`);

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            })
        }
    }
];

exports.deleteComment = [
    authenticate,
    async (req, res) => {
        try {

            const commentId = req.params.id;
            const comment = await Comment.findById(commentId);
            const post = await Post.findById(comment.postId);

            if (!commentId) {
                res.status(404).json({
                    message: "Id Not found"
                })
            }

            await Comment.findByIdAndDelete(commentId);

            const commentIndex = post.comments.indexOf(commentId.toString());
            if (commentIndex > -1) {
                post.comments.splice(commentIndex, 1);
                await post.save();
            }


            return res.redirect(`/comment/${post._id}`);

            // return res.status(200).json({
            //     success: true,
            //     message: "comment Successfully deleted"
            // })



        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            })
        }
    }
];