const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { generateSummaries } = require('../services/summaryService');

// Sample articles data for testing
const sampleArticles = [
  {
    _id: '60d21b4667d0d8992e610c85',
    title: 'New Climate Change Policy Announced',
    source: {
      name: 'Climate News',
      url: 'https://example.com/climate'
    },
    url: 'https://example.com/climate/policy',
    publishedAt: new Date(),
    content: 'The government announced a new climate change policy today that aims to reduce carbon emissions by 50% by 2030.',
    category: 'general',
    perspectives: [
      {
        viewpoint: 'liberal',
        summary: 'The new climate policy represents a crucial step forward in addressing the urgent climate crisis.'
      },
      {
        viewpoint: 'conservative',
        summary: 'While climate change is a concern, this policy may place undue burden on businesses and could lead to job losses.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The new policy sets a 50% emissions reduction target by 2030, implementing both renewable energy incentives and carbon taxes.'
      }
    ]
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    title: 'Tech Company Announces New AI Product',
    source: {
      name: 'Tech Today',
      url: 'https://example.com/tech'
    },
    url: 'https://example.com/tech/ai-product',
    publishedAt: new Date(),
    content: 'A major tech company unveiled its latest artificial intelligence product today, claiming it will revolutionize how businesses operate.',
    category: 'technology',
    perspectives: [
      {
        viewpoint: 'liberal',
        summary: 'While technological advancement is important, we must ensure AI development includes strong privacy protections.'
      },
      {
        viewpoint: 'conservative',
        summary: 'This innovation demonstrates the power of free market competition to drive technological progress.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The new AI product offers automation capabilities for complex business tasks and data analysis.'
      }
    ]
  },
  {
    _id: '60d21b4667d0d8992e610c87',
    title: 'Healthcare Reform Bill Passes Senate',
    source: {
      name: 'Politics Daily',
      url: 'https://example.com/politics'
    },
    url: 'https://example.com/politics/healthcare-bill',
    publishedAt: new Date(),
    content: 'The Senate passed a major healthcare reform bill today with a vote of 52-48.',
    category: 'politics',
    perspectives: [
      {
        viewpoint: 'liberal',
        summary: 'This historic healthcare reform will finally ensure that healthcare is treated as a right, not a privilege.'
      },
      {
        viewpoint: 'conservative',
        summary: 'The bill represents government overreach into healthcare that will increase the national debt.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The healthcare bill passed with a 52-48 vote and includes provisions for expanded coverage and lower prescription drug prices.'
      }
    ]
  },
  {
    _id: '60d21b4667d0d8992e610c88',
    title: 'Stock Market Reaches Record High',
    source: {
      name: 'Financial Times',
      url: 'https://example.com/finance'
    },
    url: 'https://example.com/finance/stock-record',
    publishedAt: new Date(),
    content: 'The stock market reached an all-time high today, with the main index closing up 2.3%.',
    category: 'business',
    perspectives: [
      {
        viewpoint: 'liberal',
        summary: 'While the market is performing well, we must remember that stock gains primarily benefit the wealthy.'
      },
      {
        viewpoint: 'conservative',
        summary: 'The record market performance demonstrates the strength of the economy under pro-business policies.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The stock market index rose 2.3% to a record high, driven by strong earnings reports and economic optimism.'
      }
    ]
  },
  {
    _id: '60d21b4667d0d8992e610c89',
    title: 'New Study on Mental Health Benefits of Exercise',
    source: {
      name: 'Health Journal',
      url: 'https://example.com/health'
    },
    url: 'https://example.com/health/exercise-mental-health',
    publishedAt: new Date(),
    content: 'A new study published today found that regular exercise can significantly reduce symptoms of anxiety and depression.',
    category: 'health',
    perspectives: [
      {
        viewpoint: 'liberal',
        summary: 'This research highlights the need for community-based exercise programs and public spaces that are accessible to all.'
      },
      {
        viewpoint: 'conservative',
        summary: 'The study shows that individuals can take personal responsibility for their mental health through lifestyle choices like exercise.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The study found that regular exercise correlated with improved mental health outcomes, particularly for anxiety and depression symptoms.'
      }
    ]
  }
];

// Get headlines by category
router.get('/headlines', async (req, res) => {
  try {
    const { category = 'general' } = req.query;
    
    // For testing, return sample data instead of querying the database
    const filteredArticles = category === 'all' 
      ? sampleArticles 
      : sampleArticles.filter(article => article.category === category);
    
    res.json(filteredArticles);
  } catch (error) {
    console.error('Error fetching headlines:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get article by ID
router.get('/article/:id', async (req, res) => {
  try {
    // For testing, return sample data instead of querying the database
    const article = sampleArticles.find(article => article._id === req.params.id);
    
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
