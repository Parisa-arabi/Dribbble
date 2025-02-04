const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for rendering the login page
router.get('/login', (req, res) => {
    res.render('login');
});

// API route for handling login POST request
router.post('/login', authController.login);

module.exports = router;