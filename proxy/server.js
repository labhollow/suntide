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

const fetchAlphanumericStationData = async (stationId) => {
    const stationUrl = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${stationId}.json`;
    const response = await axios.get(stationUrl);
    const stationData = response.data.stations[0];
    
    if (stationData) {
        const referenceId = stationData.reference_id; // Use the numeric reference ID
        const tidePredOffsetsUrl = stationData.tidepredoffsets.self; // Get the tide prediction offsets URL
        return { referenceId, tidePredOffsetsUrl, lat: stationData.lat, lng: stationData.lng };
    }
    
    throw new Error('Station data not found');
};

const fetchData = async (req, res) => {
    try {
        const stationId = req.query.station;
        
        // Check if the station ID is alphanumeric
        const isAlphanumeric = /^[A-Za-z0-9-()]+$/.test(stationId);
        
        let referenceId, lat, lng, tidePredOffsetsUrl;

        if (isAlphanumeric) {
            // Handle alphanumeric station ID
            const stationDetails = await fetchAlphanumericStationData(stationId);
            referenceId = stationDetails.referenceId;
            lat = stationDetails.lat;
            lng = stationDetails.lng;
            tidePredOffsetsUrl = stationDetails.tidePredOffsetsUrl;
        } else {
            // Handle numeric station ID as before
            referenceId = stationId; // Assuming it's numeric
            // NOAA_STATIONS object is not defined in the original code, so it's commented out
            // lat = NOAA_STATIONS[stationId].lat;
            // lng = NOAA_STATIONS[stationId].lng;
        }

        // Now fetch tide data using referenceId, lat, and lng
        const baseUrl = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
        const response = await axios.get(baseUrl, {
            params: {
                station: referenceId,
                product: 'predictions',
                datum: 'MLLW',
                format: 'json',
                units: 'english',
                time_zone: 'lst_ldt',
                begin_date: req.query.begin_date,
                end_date: req.query.end_date
            }
        });

        // Log and respond with the data as before
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