const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

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

// Detailed logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Configure proxy middleware
const proxyOptions = {
    target: 'https://api.tidesandcurrents.noaa.gov',
    changeOrigin: true,
    secure: true,
    pathRewrite: {
        '^/api': '', // remove /api prefix when forwarding to target
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${proxyOptions.target}${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`Received response from NOAA API: ${proxyRes.statusCode}`);
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({
            message: 'Proxy error',
            error: err.message
        });
    }
};

// Mount the proxy middleware
app.use('/api', createProxyMiddleware(proxyOptions));

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
    console.log(`Proxy server running on http://localhost:${PORT}`);
});