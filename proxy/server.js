const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Logging middleware
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

app.use('/api', createProxyMiddleware({
    target: 'https://api.tidesandcurrents.noaa.gov',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '', // remove /api from the request path
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(500).json({ message: 'Proxy error', error: err.message });
    },
    onProxyReq: (proxyReq, req, res) => {
        const fullUrl = `https://api.tidesandcurrents.noaa.gov${proxyReq.path}`;
        console.log(`Forwarding request to: ${fullUrl}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`Response from NOAA API: ${proxyRes.statusCode}`);
    }
}));

const PORT = 3000; // Change this if needed
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});