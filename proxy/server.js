const express = require('express');
const axios = require('axios');

const app = express();

// Enable CORS for all routes - simplified version
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Debug logging to confirm requests are reaching the server
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

// Detailed logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Query params:', req.query);
    next();
});

const fetchData = async (req, res) => {
    try {
        const baseUrl = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
        const response = await axios.get(baseUrl, {
            params: req.query
        });
        
        console.log('NOAA API Response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Error fetching data',
            details: error.message
        });
    }
};

// Define the route for /api
app.get('/api', fetchData);

// Define the route for /api/datagetter
app.get('/api/datagetter', fetchData);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});