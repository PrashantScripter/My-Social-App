const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('../middlewares/authenticate');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const Comment = require('../models/Comment');




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



exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                success: false,
                message: 'user already exits',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).redirect('/user/signin');

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exists",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password or email",
            });
        }

        // create a web token using user id
        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '15d' });

        // set a token as a cookie
        res.cookie('token', token, {
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        return res.status(200).redirect('/');

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.followUser = [authenticate, async (req, res) => {

    try {

        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user.userId);

        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (loggedInUser.following.includes(userToFollow._id)) {

            const indexFollowing = loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(indexFollowing, 1);

            const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id);
            userToFollow.followers.splice(indexFollowers, 1);

            await loggedInUser.save();
            await userToFollow.save();

            return res.redirect('/user/suggestion');
            // return res.status(200).json({
            //     success: true,
            //     message: "User Unfollowed",
            // });
        }
        else {

            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);

            await loggedInUser.save();
            await userToFollow.save();

            // return res.status(200).json({
            //     success: true,
            //     message: "User followed",
            // });
            return res.redirect('/user/suggestion');

        }

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}];


exports.updateUser = [
    authenticate,  // Assuming this middleware sets req.user.userId
    upload.single('userProfileImage'),  // Handle single image upload
    async (req, res) => {
        try {
            const userId = req.user.userId;
            const updatedImage = req.file ? req.file.filename : null;
            const { name } = req.body;  // Destructuring name from req.body

            // Find user by ID
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Update user fields
            if (name) {
                user.name = name;  // Update the name if provided
            }

            // If an image is uploaded, update the profile image
            if (updatedImage) {
                user.userProfileImage = `/uploads/${updatedImage}`;  // Save new image path
            }

            // Save updated user
            await user.save();

            // Redirect to user profile after successful update
            res.redirect('/user/profile');  // Adjust this route as per your app

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
];


exports.deleteUser = [
    authenticate,
    async(req, res) => {
        try {

            const userId = req.user.userId;

            const deleteUser = await User.findByIdAndDelete(userId);

            if(!deleteUser){
                return res.status(404).json({ message: 'User not found' });
            }
            
            await Comment.deleteMany({createdBy: userId});
            await Post.deleteMany({createdBy: userId});

            return res.clearCookie('token').redirect('/');
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
];
