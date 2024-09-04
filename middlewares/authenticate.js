const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).redirect('/user/signin').json({ success: false, message: 'Token is missing from cookies' });
    }

    // Verify the token
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }

        req.user = decoded; // Assuming `decoded` contains user info like `_id`
        next();
    });
};

module.exports = authenticate;
