const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid conflict

// Configure CORS with more permissive options
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Routes
app.use('/api/news', require('./routes/news'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});