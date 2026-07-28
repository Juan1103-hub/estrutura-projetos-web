const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Get card data
app.get('/api/card', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'card.json'), 'utf-8');
    const card = JSON.parse(data);
    res.json(card);
  } catch (err) {
    console.error('Error reading card data:', err);
    res.status(500).json({ error: 'Failed to load card data' });
  }
});

// Fallback: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Digital Card server running at http://localhost:${PORT}`);
});