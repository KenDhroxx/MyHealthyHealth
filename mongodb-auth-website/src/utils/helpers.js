module.exports = {
    hashPassword: async (password) => {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    },

    comparePassword: async (password, hashedPassword) => {
        const bcrypt = require('bcrypt');
        return await bcrypt.compare(password, hashedPassword);
    },

    generateToken: (user) => {
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET, JWT_EXPIRATION } = require('../config/auth');
        return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    }
};