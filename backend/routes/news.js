const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { generateSummaries } = require('../services/summaryService');

// Get headlines by category
router.get('/headlines', async (req, res) => {
  try {
    const { category = 'general' } = req.query;
    const articles = await Article.find({ category })
      .sort({ publishedAt: -1 })
      .limit(20);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching headlines:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get article by ID
router.get('/article/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;