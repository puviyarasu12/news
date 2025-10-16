const express = require('express');
const http = require('http'); 
const fs = require('fs');
const path = require('path');

// --- EXPRESS INITIALIZATION ---
const app = express();
const PORT = 3000;

// --- LOGGING SETUP ---
const logFile = path.join(__dirname, 'logs', 'changes.log');
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
// 1. CRITICAL: Middleware to parse incoming JSON data from POST requests
app.use(express.json()); 

// 2. Serve static files (HTML, CSS, JS) from the 'client' directory
app.use(express.static('client')); 
logChange('Express static middleware configured for /client');


// --- API ROUTE: GET /api/articles (READ) ---
app.get('/api/articles', (req, res) => {
  logChange(`API Request: ${req.method} ${req.url}`);
  try {
    const articlesData = fs.readFileSync(articlesPath, 'utf8');
    const articles = JSON.parse(articlesData);
    res.json(articles);
  } catch (error) {
    console.error('Error reading or parsing articles.json:', error);
    // Respond with 200 and empty array if the file is just missing/empty
    if (error.code === 'ENOENT') {
         return res.json([]);
    }
    res.status(500).json({ error: 'Failed to retrieve articles.', details: error.message });
  }
});

// --- API ROUTE: POST /api/articles/new (CREATE) ---
app.post('/api/articles/new', (req, res) => {
    logChange(`POST Request: ${req.method} ${req.url}`);
    
    // Get the new article data from the request body
    const newArticle = req.body;

    if (!newArticle || !newArticle.title || !newArticle.content) {
        return res.status(400).json({ error: 'Missing title or content.' });
    }

    try {
        // 1. Read existing articles
        let articles = [];
        if (fs.existsSync(articlesPath)) {
            const articlesData = fs.readFileSync(articlesPath, 'utf8');
            articles = JSON.parse(articlesData);
        }

        // 2. Assign ID and Add new article
        newArticle.id = articles.length ? Math.max(...articles.map(a => a.id)) + 1 : 1;
        newArticle.timestamp = new Date().toISOString();
        articles.push(newArticle);

        // 3. Write all articles back to the file (Synchronous write for simplicity)
        fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
        
        logChange(`Article created: ID ${newArticle.id}`);
        res.status(201).json({ message: 'Article created', article: newArticle });

    } catch (error) {
        console.error('Error handling POST request:', error);
        res.status(500).json({ error: 'Failed to save article.', details: error.message });
    }
});


// --- ROOT ROUTE: / ---
app.get('/', (req, res) => {
    logChange(`Frontend Request: ${req.method} ${req.url}`);
    // This serves your index.html file for the main URL
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});


// --- SERVER LISTEN ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logChange(`Server started successfully on port ${PORT}`);
});
