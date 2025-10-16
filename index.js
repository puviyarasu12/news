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
app.use(express.json());
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
        if (error.code === 'ENOENT') {
            return res.json([]);
        }
        res.status(500).json({ error: 'Failed to retrieve articles.', details: error.message });
    }
});

// --- API ROUTE: POST /api/articles/new (CREATE) ---
app.post('/api/articles/new', (req, res) => {
    logChange(`POST Request: ${req.method} ${req.url}`);
    const newArticle = req.body;
    
    if (!newArticle || !newArticle.title || !newArticle.content) {
        return res.status(400).json({ error: 'Missing title or content.' });
    }

    try {
        let articles = [];
        if (fs.existsSync(articlesPath)) {
            const articlesData = fs.readFileSync(articlesPath, 'utf8');
            articles = JSON.parse(articlesData);
        }

        newArticle.id = articles.length ? Math.max(...articles.map(a => a.id)) + 1 : 1;
        newArticle.timestamp = new Date().toISOString();
        articles.push(newArticle);

        fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
        logChange(`Article created: ID ${newArticle.id}`);
        res.status(201).json({ message: 'Article created', article: newArticle });
    } catch (error) {
        console.error('Error handling POST request:', error);
        res.status(500).json({ error: 'Failed to save article.', details: error.message });
    }
});

// --- API ROUTE: PUT /api/articles/:id (UPDATE) ---
app.put('/api/articles/:id', (req, res) => {
    const articleId = parseInt(req.params.id);
    const updatedData = req.body;
    
    logChange(`PUT Request: ${req.method} ${req.url}`);
    
    if (!updatedData || !updatedData.title || !updatedData.content) {
        return res.status(400).json({ error: 'Missing title or content.' });
    }

    try {
        if (!fs.existsSync(articlesPath)) {
            return res.status(404).json({ error: 'No articles found.' });
        }

        const articlesData = fs.readFileSync(articlesPath, 'utf8');
        let articles = JSON.parse(articlesData);
        
        const articleIndex = articles.findIndex(a => a.id === articleId);
        
        if (articleIndex === -1) {
            return res.status(404).json({ error: 'Article not found.' });
        }

        // Update the article while preserving id and original timestamp
        articles[articleIndex] = {
            ...articles[articleIndex],
            title: updatedData.title,
            content: updatedData.content,
            updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
        logChange(`Article updated: ID ${articleId}`);
        
        res.json({ message: 'Article updated', article: articles[articleIndex] });
    } catch (error) {
        console.error('Error handling PUT request:', error);
        res.status(500).json({ error: 'Failed to update article.', details: error.message });
    }
});

// --- API ROUTE: DELETE /api/articles/:id (DELETE) ---
app.delete('/api/articles/:id', (req, res) => {
    const articleId = parseInt(req.params.id);
    
    logChange(`DELETE Request: ${req.method} ${req.url}`);

    try {
        if (!fs.existsSync(articlesPath)) {
            return res.status(404).json({ error: 'No articles found.' });
        }

        const articlesData = fs.readFileSync(articlesPath, 'utf8');
        let articles = JSON.parse(articlesData);
        
        const articleIndex = articles.findIndex(a => a.id === articleId);
        
        if (articleIndex === -1) {
            return res.status(404).json({ error: 'Article not found.' });
        }

        articles.splice(articleIndex, 1);

        fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
        logChange(`Article deleted: ID ${articleId}`);
        
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error handling DELETE request:', error);
        res.status(500).json({ error: 'Failed to delete article.', details: error.message });
    }
});

// --- ROOT ROUTE: / ---
app.get('/', (req, res) => {
    logChange(`Frontend Request: ${req.method} ${req.url}`);
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// --- SERVER LISTEN ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logChange(`Server started successfully on port ${PORT}`);
});
