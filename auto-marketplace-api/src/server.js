const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { verifyToken } = require('./middlewares/auth'); // Assuming you have auth middleware in a separate file

const app = express();

// CORS validation
app.use(cors());

// Body parser middleware to handle request size limits
app.use(bodyParser.json({ limit: '1mb' })); // Set your desired limit

// Authentication middleware for protected routes
app.use('/protected', verifyToken);

// Example protected route
app.get('/protected/resource', (req, res) => {
    res.send('This is a protected resource!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
