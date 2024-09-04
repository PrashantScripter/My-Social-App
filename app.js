const express = require('express');
const path = require('path');
const userRouter = require('./routes/userRouter');
const postRouter = require('./routes/postRouter');
const commentRouter = require('./routes/commentRouter');
const connectDB = require('./config/connectDB');
const cookieParser = require('cookie-parser');
const Post = require('./models/Post');
const authenticate = require('./middlewares/authenticate');
const methodOverride = require('method-override');


if(process.env.NODE_ENV !== "production"){
    require("dotenv").config({path:"./config/.env"});
}

connectDB();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve('./public')));
app.use(methodOverride('_method'));


app.get('/',authenticate, async(req, res) => {
    const allPosts = await Post.find({});
    res.render('Home',{
        user: req.user,
        post: allPosts,
    });
});


app.use('/user', userRouter);
app.use('/user/post', postRouter);
app.use('/comment',commentRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server is running at Port ${process.env.PORT}`);
})