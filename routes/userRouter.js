const express = require('express');
const { register, login, followUser, updateUser, deleteUser } = require('../controller/userController');
const Post = require('../models/Post');
const authenticate = require('../middlewares/authenticate');
const User = require('../models/User');

const router = express.Router();


router.get('/profile', authenticate, async (req, res) => {
    const userId = req.user.userId;
    const userDetail = await User.findById(userId);
    const posts = await Post.find({ createdBy: userDetail });
    return res.render('UserProfile', { posts, user: userId, userDetail });
});

router.get('/profile/:id', authenticate, async (req, res) => {
    const userId = req.user.userId;
    const loggedInUser = await User.findById(userId);
    console.log(loggedInUser._id);
    const specificUserId = req.params.id;
    const userDetail = await User.findById(specificUserId);
    const posts = await Post.find({ createdBy: userDetail });

    const isFollowing = loggedInUser.following.some(followedUser => followedUser.toString() === userDetail._id.toString()); 
    console.log(isFollowing);
    const isYourFollower = loggedInUser.followers.some(yourFollower => yourFollower.toString() === userDetail._id.toString());
    console.log(isYourFollower);

    return res.render('GetUserProfile', { posts, userDetail, loggedInUser, isFollowing, isYourFollower });
})

router.get('/suggestion', authenticate, async (req, res) => {
    const loggedInUserId = req.user.userId;
    const loggedInUser = await User.findById(loggedInUserId);
    const allUsers = await User.find({});
    return res.render('UserSuggestion', { user: loggedInUserId, allUsers, loggedInUser });
});

router.route('/follow/:id').post(authenticate, followUser);

router.route('/signup').post(register).get((req, res) => {
    return res.render('SignupPage')
});
router.route('/signin').post(login).get((req, res) => {
    return res.render('LoginPage');
});

router.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/');
});

router.route('/updateuser').put(updateUser).get(authenticate, async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    res.render('UpdateUser', { user });
});


router.delete('/account/delete', deleteUser);


module.exports = router;