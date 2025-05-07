const express = require('express');
const router = express.Router();
const { generateDetailedPerspectives } = require('../services/summaryService');
const { getRandomArticles: getRandomNewsApiArticles } = require('../services/newsApiService');
const {
  getRandomArticles,
  getArticleById,
  saveArticle,
  savePerspectives,
  deleteArticle
} = require('../services/supabaseService');

// For debugging
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.SUPABASE_KEY);

// Sample articles data for fallback when database is unavailable
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

// Helper function to handle errors and return fallback data
const handleError = (error, fallbackData) => {
  console.error('Error:', error);
  return fallbackData;
};

// Get headlines by category
router.get('/headlines', async (req, res) => {
  try {
    const { category = 'general' } = req.query;
    console.log(`Received request for headlines in category: ${category}`);

    try {
      // First try to get articles from Supabase
      console.log('Fetching articles from Supabase...');

      // HARD-CODED TEST ARTICLE ID TO EXCLUDE
      const TEST_ARTICLE_ID = 'dfe323d2-e241-4cac-8714-a4d1051e538e';

      // Get articles from Supabase
      let articles = await getRandomArticles(10, category); // Get more articles to account for filtering
      console.log(`Retrieved ${articles?.length || 0} articles from Supabase`);

      // Explicitly filter out the test article by ID
      if (articles && articles.length > 0) {
        articles = articles.filter(article => article.id !== TEST_ARTICLE_ID);
        console.log(`After filtering test article by ID, ${articles.length} articles remain`);
      }

      // Also filter by title and source as a backup
      if (articles && articles.length > 0) {
        articles = articles.filter(article =>
          !(article.title === 'Test Article' && article.source_name === 'Test Source')
        );
        console.log(`After filtering by title/source, ${articles.length} articles remain`);
      }

      if (articles && articles.length > 0) {
        // Limit to 5 articles
        const limitedArticles = articles.slice(0, 5);
        console.log(`Returning ${limitedArticles.length} articles`);
        return res.json(limitedArticles);
      }

      // If no articles in Supabase, try NewsAPI
      console.log('No articles found in Supabase, trying NewsAPI...');
      const newsApiArticles = await getRandomNewsApiArticles(5, category);
      console.log(`Retrieved ${newsApiArticles.length} articles from NewsAPI`);

      // Save the NewsAPI articles to Supabase for future use
      console.log('Saving NewsAPI articles to Supabase...');
      for (const article of newsApiArticles) {
        try {
          const savedArticle = await saveArticle({
            title: article.title,
            content: article.content,
            source: {
              name: article.source.name,
              url: article.source.url
            },
            url: article.url,
            publishedAt: article.publishedAt,
            category: article.category
          });
          console.log('Saved article to Supabase:', savedArticle?.id);
        } catch (saveError) {
          console.error('Error saving article to Supabase:', saveError);
        }
      }

      return res.json(newsApiArticles);
    } catch (apiError) {
      console.error('Error fetching articles:', apiError);

      // Last resort: use sample data
      console.log('Using sample data as fallback');
      const filteredArticles = category === 'all'
        ? sampleArticles
        : sampleArticles.filter(article => article.category === category);

      // Shuffle and limit to 5 random articles
      const shuffled = [...filteredArticles].sort(() => 0.5 - Math.random());
      return res.json(shuffled.slice(0, 5));
    }
  } catch (error) {
    console.error('Error fetching headlines:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get article by ID
router.get('/article/:id', async (req, res) => {
  try {
    let article;
    const id = req.params.id;

    // HARD-CODED TEST ARTICLE ID TO EXCLUDE
    const TEST_ARTICLE_ID = 'dfe323d2-e241-4cac-8714-a4d1051e538e';

    // If the requested ID is the test article, return 404
    if (id === TEST_ARTICLE_ID) {
      console.log('Test article requested, returning 404');
      return res.status(404).json({ message: 'Article not found' });
    }

    try {
      // Try to get the article from Supabase
      console.log(`Fetching article with ID: ${id} from Supabase`);
      article = await getArticleById(id);

      // If article found in Supabase and it's not a test article
      if (article && article.id !== TEST_ARTICLE_ID &&
          !(article.title === 'Test Article' && article.source_name === 'Test Source')) {
        console.log('Article found in Supabase');

        // Check if the article has perspectives
        if (!article.perspectives || article.perspectives.length === 0) {
          console.log('Generating perspectives for article...');
          await generateAndSavePerspectives(article);
        }

        return res.json(article);
      }
    } catch (dbError) {
      console.error('Error fetching from Supabase:', dbError);
    }

    // If article not found in Supabase, check if it's a news API article
    if (id.startsWith('news-api')) {
      console.log('Article is from NewsAPI, trying to fetch from NewsAPI...');

      try {
        // For NewsAPI articles, we need to parse the ID to get the original data
        // Format: news-api-{timestamp}-{index}
        const parts = id.split('-');
        const index = parseInt(parts[parts.length - 1]);

        // Try to fetch from NewsAPI again (this is just a fallback, not ideal)
        const newsApiArticles = await getRandomNewsApiArticles(10, 'general');

        if (newsApiArticles && newsApiArticles.length > index) {
          article = newsApiArticles[index];

          // Save to Supabase for future use
          const savedArticle = await saveArticle({
            title: article.title,
            content: article.content,
            source: article.source,
            url: article.url,
            publishedAt: article.publishedAt,
            category: article.category
          });

          // Generate perspectives
          if (savedArticle) {
            await generateAndSavePerspectives(savedArticle);
            return res.json(savedArticle);
          }
        }
      } catch (newsApiError) {
        console.error('Error fetching from NewsAPI:', newsApiError);
      }
    }

    // Last resort: use sample data
    console.log('Using sample data as fallback');
    article = sampleArticles.find(a => a._id === id);

    // If still not found, return 404
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if the sample article has perspectives
    if (!article.perspectives || article.perspectives.length === 0) {
      await generateAndSavePerspectives(article);
    }

    return res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate and save perspectives
async function generateAndSavePerspectives(article) {
  try {
    // Generate perspectives for the article
    const perspectives = await generateDetailedPerspectives(
      article.title,
      article.content || 'No content available'
    );

    // Create perspectives array
    const perspectivesArray = [
      { viewpoint: 'liberal', summary: perspectives.liberal },
      { viewpoint: 'conservative', summary: perspectives.conservative },
      { viewpoint: 'neutral', summary: perspectives.neutral }
    ];

    // Add perspectives to the article object
    article.perspectives = perspectivesArray;

    // Save perspectives to Supabase if the article has an ID
    if (article.id) {
      try {
        await savePerspectives(article.id, perspectivesArray);
      } catch (saveError) {
        console.error('Error saving perspectives to Supabase:', saveError);
      }
    }

    return perspectivesArray;
  } catch (error) {
    console.error('Error generating perspectives:', error);

    // Return default perspectives if generation fails
    return [
      { viewpoint: 'liberal', summary: 'Liberal perspective could not be generated.' },
      { viewpoint: 'conservative', summary: 'Conservative perspective could not be generated.' },
      { viewpoint: 'neutral', summary: 'Neutral analysis could not be generated.' }
    ];
  }
}

// Delete article by ID
router.delete('/article/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Deleting article with ID: ${id}`);

    const result = await deleteArticle(id);
    console.log('Delete result:', result);

    return res.json({ message: 'Article deleted successfully', id });
  } catch (error) {
    console.error('Error deleting article:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;