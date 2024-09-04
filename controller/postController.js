const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');
const authenticate = require('../middlewares/authenticate');
const User = require('../models/User');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve('./public/uploads'));
    },

    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage: storage });

exports.createPost = [
    authenticate,
    upload.single('postImage'),
    async (req, res) => {
        const { description } = req.body;

        if (!req.user) {
            return res.status(401).redirect('/user/signin').json({ success: false, message: "User not authenticated" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please choose an image first" });
        }

        try {
            const newPost = new Post({
                description,
                createdBy: req.user.userId,
                postImage: `/uploads/${req.file.filename}`,
            });

            const savedPost = await newPost.save();


            const user = await User.findById(req.user.userId);
            user.posts.push(savedPost._id);

            await user.save();

            return res.redirect('/')
            // .status(201)
            // .json({ success: true, message: "Post created successfully" });

        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
];

exports.deletePost = [
    authenticate,
    async (req, res) => {
        try {

            const user = req.user.userId;
            const loggedInUser = await User.findById(user);
            const post = await Post.findById(req.params.id);

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: "Post not found",
                });
            };

            if (post.createdBy.toString() !== req.user.userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to delete this post",
                })
            };

            const imagePath = `./public${post.postImage}`;

            await Post.findByIdAndDelete(req.params.id);

            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error('Error deleting image:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Error deleting image file',
                        });
                    }
                });
            }

            const indexOfpost = loggedInUser.posts.indexOf(post._id.toString());
            if (indexOfpost > -1) {
                loggedInUser.posts.splice(indexOfpost, 1);
                await loggedInUser.save();
            }

            return res.redirect('/');

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
];


exports.likePost = [
    authenticate,
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: "Post not found",
                });
            }

            if (post.likedBy.includes(req.user.userId)) {
                // Unlike the post
                const indexoflikedId = post.likedBy.indexOf(req.user.userId);
                post.likedBy.splice(indexoflikedId, 1);
                await post.save();
                // return res.status(200).json({
                //     success: true,
                //     message: "Post unliked successfully",
                // });

                return res.redirect('/');
            } else {
                // Like the post
                post.likedBy.push(req.user.userId);
                await post.save();
                // return res.status(200).json({
                //     success: true,
                //     message: "Post liked successfully",
                // });
                return res.redirect('/');
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
];
