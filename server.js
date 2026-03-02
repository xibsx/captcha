const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS headers - Allow ANYWHERE to use
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Serve static files with proper headers
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cache-Control', 'public, max-age=3600');
        }
    }
}));

// Special route for xibs.js with CORS
app.get('/xibs.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname, 'xibs.js'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 FREEXIBS CAPTCHA server running on port ${PORT}`);
    console.log(`📍 CORS enabled for all origins`);
});