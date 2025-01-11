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
    console.log('Begin date:', req.query.begin_date);
    console.log('End date:', req.query.end_date);
    next();
});

const fetchData = async (req, res) => {
    try {
        const baseUrl = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
        
        // Log the full URL that will be requested
        const fullUrl = `${baseUrl}?${new URLSearchParams(req.query).toString()}`;
        console.log('Requesting URL:', fullUrl);
        
        const response = await axios.get(baseUrl, {
            params: req.query
        });
        
        console.log('NOAA API Response status:', response.status);
        console.log('NOAA API Response data:', JSON.stringify(response.data, null, 2));
        
        if (!response.data.predictions || response.data.predictions.length === 0) {
            console.warn('No predictions found in response');
        } else {
            console.log('Number of predictions:', response.data.predictions.length);
            console.log('First prediction:', response.data.predictions[0]);
            console.log('Last prediction:', response.data.predictions[response.data.predictions.length - 1]);
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        console.error('Full error object:', error);
        res.status(500).json({
            error: 'Error fetching data',
            details: error.message,
            response: error.response?.data
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