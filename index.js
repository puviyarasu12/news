const express = require('express');
const http = require('http'); // Still useful, but Express handles the server loop
const fs = require('fs');
const path = require('path');

// --- EXPRESS INITIALIZATION ---
const app = express();
const PORT = 3000;

// --- LOGGING SETUP ---
const logFile = path.join(__dirname, 'logs', 'changes.log');

/**
 * Appends a timestamped message to the changes.log file.
 * NOTE: This logging is basic and non-blocking for simplicity.
 * @param {string} message - The message to log.
 */
function logChange(message) {
  const log = `${new Date().toISOString()} - ${message}\n`;
  try {
    fs.appendFileSync(logFile, log);
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

// --- API DATA SETUP ---
const articlesPath = path.join(__dirname, 'articles.json');

// --- MIDDLEWARE ---
// Serve static files from the 'client' directory (where your index.html is)
app.use(express.static('client')); 
logChange('Express static middleware configured for /client');


// --- API ROUTE: /api/articles ---
app.get('/api/articles', (req, res) => {
  logChange(`API Request: ${req.method} ${req.url}`);
  try {
    const articlesData = fs.readFileSync(articlesPath, 'utf8');
    const articles = JSON.parse(articlesData);
    res.json(articles); // Send the JSON array
  } catch (error) {
    console.error('Error reading or parsing articles.json:', error);
    res.status(500).json({ error: 'Failed to retrieve articles.' });
  }
});

// --- ROOT ROUTE: / ---
// This serves your index.html file for the main URL
app.get('/', (req, res) => {
    logChange(`Frontend Request: ${req.method} ${req.url}`);
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// --- SERVER LISTEN ---
// Use the Express app to start the HTTP server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Use the log function to record the server startup
    logChange(`Server started successfully on port ${PORT}`);
});
