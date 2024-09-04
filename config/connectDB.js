const mongoose = require('mongoose');

function connectDB(){
    mongoose
    .connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/socialLoop')
    .then(()=>console.log('MongoDB is connected'))
    .catch((err) => console.log(err));
}

module.exports = connectDB;

