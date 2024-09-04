const express = require('express');
const router = express.Router();
const {createPost, deletePost, likePost} = require('../controller/postController');
const authenticate = require('../middlewares/authenticate');
const User = require('../models/User');


router.get('/create',authenticate,async (req, res) => {
    const user = req.user;
    return res.render('CreatePost',{user})
})

router.post('/create',createPost);

router.delete('/delete/:id',deletePost);

router.post('/like/:id', likePost);


module.exports = router;