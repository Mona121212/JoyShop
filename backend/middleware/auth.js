const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Assuming you have a db config file

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '') || req.query.token;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }

        // Save user ID from token to request object for use in routes
        req.userId = decoded.id;
        next();
    });
}

// role check middleware
const roleCheck = (roles) => {
    return (req, res, next) => {
        const userId = req.userId;

        db.query('SELECT role FROM users WHERE id = ?', [userId], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length === 0 || !roles.includes(results[0].role)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
        });
    }
}

module.exports = {
    authMiddleware, roleCheck
};