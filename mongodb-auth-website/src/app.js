const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { connectDB } = require('./config/database');
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Serve static files
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
    res.render('index');
});

module.exports = app;