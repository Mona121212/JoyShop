const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Assuming you have a db config file
const router = express.Router();

// User registration route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 10));

        // Insert new user into the database
        await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// User login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (user.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// logout route
router.post('/logout', (req, res) => {
    // Invalidate the token on the client side, no server-side action needed
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;