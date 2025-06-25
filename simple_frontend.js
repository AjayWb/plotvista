const express = require('express');
const path = require('path');

const app = express();
const PORT = 8001;

// Serve static files from frontend/dist
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// For SPA - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'frontend/dist')}`);
});