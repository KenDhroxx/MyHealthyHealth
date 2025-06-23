const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = {
    isAuthenticated,
};