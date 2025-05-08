const express = require('express');
const router = express.Router();
const { generateDetailedPerspectives } = require('../services/summaryService');
const {
  getRandomArticles: getRandomNewsApiArticles,
  fetchLocalNews
} = require('../services/newsApiService');
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
        viewpoint: 'perspective1',
        summary: 'TLDR: The new climate policy is a necessary and effective approach to addressing climate change.\n\nThe new climate policy represents a crucial step forward in addressing the urgent climate crisis. By setting ambitious targets, the government is showing leadership on an issue that requires immediate action. According to the International Climate Institute (2024), policies with similar emission reduction targets have been effective in other countries without significant economic disruption. The combination of incentives and regulations creates a balanced approach that can drive innovation while ensuring accountability.'
      },
      {
        viewpoint: 'perspective2',
        summary: 'TLDR: The climate policy may be too aggressive and could harm economic growth.\n\nWhile climate change is a concern, this policy may place undue burden on businesses and could lead to job losses in key industries. The rapid timeline for implementation doesn\'t allow sufficient transition periods for affected sectors. Research from the Economic Policy Center (2023) suggests that more gradual approaches to emissions reduction can achieve similar environmental outcomes while better protecting economic stability. A more balanced policy might include longer implementation timelines and additional support for affected industries.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The new policy sets a 50% emissions reduction target by 2030, implementing both renewable energy incentives and carbon taxes. The plan includes specific measures for different sectors of the economy, with particular focus on energy production, transportation, and industrial manufacturing. The policy was developed following consultation with environmental experts, industry representatives, and economic analysts.'
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
        viewpoint: 'perspective1',
        summary: 'TLDR: The AI product represents significant technological progress but requires careful oversight.\n\nThis new AI technology represents an important advancement that could transform how businesses operate and analyze data. The efficiency gains could lead to significant productivity improvements across multiple sectors. However, as noted in a recent MIT Technology Review article (2024), robust governance frameworks are essential to ensure these systems are deployed responsibly. The potential benefits must be balanced with appropriate safeguards for data privacy and algorithmic transparency.'
      },
      {
        viewpoint: 'perspective2',
        summary: 'TLDR: The AI product raises concerns about job displacement and privacy implications.\n\nWhile technologically impressive, this AI system raises important questions about workforce impacts and data usage. The automation capabilities could potentially eliminate jobs in sectors already facing economic challenges. According to research from the Center for Responsible Technology (2023), similar AI deployments have led to significant workforce disruptions without adequate transition planning. Additionally, the data collection requirements for such systems often create privacy vulnerabilities that may not be immediately apparent.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The new AI product offers automation capabilities for complex business tasks and data analysis. The system uses machine learning algorithms to process large datasets and generate actionable insights. The company claims the technology can reduce processing time by 60% compared to existing solutions and has been tested across multiple industry verticals with consistent results.'
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

// Test endpoint
router.get('/test', (req, res) => {
  console.log('Test endpoint called');
  return res.json({ message: 'Test endpoint working' });
});

// Get article by ID
router.get('/article/:id', async (req, res) => {
  console.log('Article endpoint called with ID:', req.params.id);
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
    console.log('Starting to generate perspectives for article:', article.title);

    // Generate perspectives for the article
    const perspectives = await generateDetailedPerspectives(
      article.title,
      article.content || 'No content available'
    );

    console.log('Perspectives generated successfully:', perspectives ? 'Yes' : 'No');

    // Check if we have the new perspective format or the old one
    if (perspectives.perspective1 !== undefined) {
      // New format with opposing views
      const perspectivesArray = [
        { viewpoint: 'perspective1', summary: perspectives.perspective1 },
        { viewpoint: 'perspective2', summary: perspectives.perspective2 },
        { viewpoint: 'neutral', summary: perspectives.neutral }
      ];

      // Add perspectives to the article object
      article.perspectives = perspectivesArray;
      console.log('Added opposing perspectives to article object:', perspectivesArray.length);

      // Save perspectives to Supabase if the article has an ID
      if (article.id) {
        try {
          console.log('Saving perspectives to Supabase for article ID:', article.id);
          await savePerspectives(article.id, perspectivesArray);
          console.log('Perspectives saved to Supabase successfully');
        } catch (saveError) {
          console.error('Error saving perspectives to Supabase:', saveError);
        }
      } else {
        console.log('No article ID found, skipping Supabase save');
      }

      return perspectivesArray;
    } else {
      // Old format with liberal/conservative views (for backward compatibility)
      const perspectivesArray = [
        { viewpoint: 'perspective1', summary: perspectives.liberal || 'First perspective could not be generated.' },
        { viewpoint: 'perspective2', summary: perspectives.conservative || 'Second perspective could not be generated.' },
        { viewpoint: 'neutral', summary: perspectives.neutral || 'Neutral analysis could not be generated.' }
      ];

      // Add perspectives to the article object
      article.perspectives = perspectivesArray;
      console.log('Added perspectives to article object (converted from old format):', perspectivesArray.length);

      // Save perspectives to Supabase if the article has an ID
      if (article.id) {
        try {
          console.log('Saving perspectives to Supabase for article ID:', article.id);
          await savePerspectives(article.id, perspectivesArray);
          console.log('Perspectives saved to Supabase successfully');
        } catch (saveError) {
          console.error('Error saving perspectives to Supabase:', saveError);
        }
      } else {
        console.log('No article ID found, skipping Supabase save');
      }

      return perspectivesArray;
    }
  } catch (error) {
    console.error('Error generating perspectives:', error);

    // Return default perspectives if generation fails
    return [
      { viewpoint: 'perspective1', summary: 'First perspective could not be generated.' },
      { viewpoint: 'perspective2', summary: 'Second perspective could not be generated.' },
      { viewpoint: 'neutral', summary: 'Neutral analysis could not be generated.' }
    ];
  }
}

// Regenerate perspectives with a specific writing style
router.post('/regenerate/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { writingStyle } = req.body;

    console.log(`Regenerating perspectives for article ID: ${id} with writing style: ${writingStyle}`);

    // Get the article from Supabase
    let article = await getArticleById(id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Generate new perspectives with the specified writing style
    const perspectives = await generateDetailedPerspectives(
      article.title,
      article.content || 'No content available',
      writingStyle
    );

    console.log('Perspectives regenerated successfully:', perspectives ? 'Yes' : 'No');

    // Check if we have the new perspective format
    if (perspectives.point !== undefined) {
      // New format with point/counterpoint
      const perspectivesArray = [
        {
          viewpoint: 'point',
          summary: perspectives.point,
          pointTitle: perspectives.pointTitle || ''
        },
        {
          viewpoint: 'counterpoint',
          summary: perspectives.counterpoint,
          counterpointTitle: perspectives.counterpointTitle || ''
        },
        {
          viewpoint: 'neutral',
          summary: perspectives.neutral
        }
      ];

      // Update the article object
      article.perspectives = perspectivesArray;

      // Save to Supabase
      if (article.id) {
        try {
          await savePerspectives(article.id, perspectivesArray);
          console.log('Regenerated perspectives saved to Supabase');
        } catch (saveError) {
          console.error('Error saving regenerated perspectives:', saveError);
        }
      }
    }

    return res.json(article);
  } catch (error) {
    console.error('Error regenerating perspectives:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

// Get local news by zip code
router.get('/local/:zipCode', async (req, res) => {
  try {
    const { zipCode } = req.params;
    console.log(`Received request for local news with zip code: ${zipCode}`);

    // Validate zip code (basic US zip code validation)
    if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
      return res.status(400).json({ message: 'Invalid zip code format. Please use a 5-digit US zip code.' });
    }

    try {
      // Fetch local news from NewsAPI
      console.log(`Fetching local news for zip code: ${zipCode}`);
      const localArticles = await fetchLocalNews(zipCode, 5);
      console.log(`Retrieved ${localArticles.length} local articles`);

      // Save the local articles to Supabase for future use
      console.log('Saving local articles to Supabase...');
      for (const article of localArticles) {
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
            category: 'local'
          });
          console.log('Saved local article to Supabase:', savedArticle?.id);
        } catch (saveError) {
          console.error('Error saving local article to Supabase:', saveError);
        }
      }

      return res.json(localArticles);
    } catch (apiError) {
      console.error('Error fetching local news:', apiError);

      // Fallback to general news if local news fetch fails
      console.log('Falling back to general news...');
      const fallbackArticles = await getRandomNewsApiArticles(5, 'general');

      return res.json(fallbackArticles);
    }
  } catch (error) {
    console.error('Error fetching local news:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;