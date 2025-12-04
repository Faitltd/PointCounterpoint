const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Debug environment variables
console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY exists:', !!process.env.SUPABASE_KEY);
console.log('NEWS_API_KEY exists:', !!process.env.NEWS_API_KEY);
console.log('ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);

// Only import the article refresh service if environment variables are properly loaded
let articleRefreshService = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  try {
    articleRefreshService = require('./services/articleRefreshService');
    console.log('Article refresh service loaded successfully');
  } catch (error) {
    console.error('Error loading article refresh service:', error.message);
  }
} else {
  console.warn('Skipping article refresh service due to missing environment variables');
}

const app = express();

// Configure CORS with options for both development and production
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Root route handler
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'PointCounterpoint API is running',
    documentation: 'Access /api endpoints for functionality'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      news: !!process.env.NEWS_API_KEY,
      supabase: !!process.env.SUPABASE_KEY
    }
  });
});

// Routes
app.use('/api/news', require('./routes/news'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Server startup
const port = process.env.PORT || 5001;

// Add startup logging
console.log('Starting server...');
console.log('Environment check:');
console.log('PORT:', port);
console.log('ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
console.log('NEWS_API_KEY present:', !!process.env.NEWS_API_KEY);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY present:', !!process.env.SUPABASE_KEY);

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at: http://localhost:${port}/api/health`);

  // Initialize article refresh scheduler if available
  if (articleRefreshService && articleRefreshService.initializeArticleRefreshScheduler) {
    try {
      articleRefreshService.initializeArticleRefreshScheduler('0 */3 * * *');
      console.log('Article refresh scheduler initialized');
    } catch (error) {
      console.error('Error initializing article refresh scheduler:', error.message);
    }
  } else {
    console.log('Article refresh scheduler not available');
  }
});
