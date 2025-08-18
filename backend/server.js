const express = require('express'); // Import Express to create web service
const mysql = require('mysql2'); // Import MySQL client for database connection
const cors = require('cors'); // Middleware to allow frontend access to APIs
require('dotenv').config(); // Load environment variables from .env file (e.g., DB credentials, port)

// Create Express application and define port
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors());  // Enable CORS so frontend can call the API
app.use(express.json()); // Automatically parse incoming JSON requests
app.use(express.urlencoded({extended: true})); // Parse URL-encoded form data

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'joy_shop'
};

// Create database connection
const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if(err) {
        console.error(' Failed to connect to database:', err);
        return;
    }
    console.log(' Successfully connected to database!');
});

// Root route - check if server is running
app.get('/', (req, res) => {
    res.json({
        message: 'Shopping website backend is running',
        timestamp: new Date().toISOString()
    });
});

// API test route - check frontend can access API & DB
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    database: 'connected'
  });
});

// Health check route - monitor service status
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    uptime: process.uptime(), // Server uptime
    timestamp: Date.now()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {} // Show detailed error only in development
  });
});

// Handle 404 (undefined routes)
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'API route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(` Server is running at http://localhost:${PORT}`);
  console.log(` API Test: http://localhost:${PORT}/api/test`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
});
