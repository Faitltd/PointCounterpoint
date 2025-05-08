const axios = require('axios');
require('dotenv').config();

// We'll use the NewsAPI.org service with the provided API key
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2';

// Mock data for when the API key is missing or invalid
const MOCK_ARTICLES = {
  general: [
    {
      title: 'Global Economic Summit Concludes with New Trade Agreements',
      source: { name: 'World News Network', url: 'https://example.com/news1' },
      url: 'https://example.com/news1',
      publishedAt: new Date(),
      content: 'Leaders from 20 countries reached consensus on new trade policies aimed at reducing tariffs and promoting sustainable development.',
      category: 'general'
    },
    {
      title: 'Scientists Discover Potential Breakthrough in Renewable Energy',
      source: { name: 'Science Today', url: 'https://example.com/news2' },
      url: 'https://example.com/news2',
      publishedAt: new Date(),
      content: 'A team of researchers has developed a new type of solar panel that can generate electricity even on cloudy days, potentially revolutionizing renewable energy.',
      category: 'general'
    },
    {
      title: 'Tech Giants Announce Collaboration on AI Ethics Standards',
      source: { name: 'Tech Insider', url: 'https://example.com/news3' },
      url: 'https://example.com/news3',
      publishedAt: new Date(),
      content: 'Major technology companies have formed a coalition to establish industry-wide ethical guidelines for artificial intelligence development and deployment.',
      category: 'general'
    },
    {
      title: 'Global Health Organization Reports Decline in Infectious Diseases',
      source: { name: 'Health Report', url: 'https://example.com/news4' },
      url: 'https://example.com/news4',
      publishedAt: new Date(),
      content: 'New data shows a significant reduction in infectious disease rates worldwide, attributed to improved vaccination programs and public health initiatives.',
      category: 'general'
    },
    {
      title: 'Historic Peace Agreement Signed in Middle East',
      source: { name: 'International Herald', url: 'https://example.com/news5' },
      url: 'https://example.com/news5',
      publishedAt: new Date(),
      content: 'After decades of conflict, regional leaders have signed a comprehensive peace agreement that addresses territorial disputes and establishes diplomatic relations.',
      category: 'general'
    }
  ],
  technology: [
    {
      title: 'New Quantum Computing Breakthrough Announced',
      source: { name: 'Tech Review', url: 'https://example.com/tech1' },
      url: 'https://example.com/tech1',
      publishedAt: new Date(),
      content: 'Researchers have achieved quantum supremacy with a new 1000-qubit processor that solves complex problems in seconds.',
      category: 'technology'
    },
    {
      title: 'Major Smartphone Manufacturer Unveils Foldable Device',
      source: { name: 'Gadget News', url: 'https://example.com/tech2' },
      url: 'https://example.com/tech2',
      publishedAt: new Date(),
      content: 'The latest foldable smartphone features a revolutionary display technology and enhanced durability.',
      category: 'technology'
    }
  ],
  business: [
    {
      title: 'Stock Markets Reach Record Highs Amid Economic Recovery',
      source: { name: 'Financial Times', url: 'https://example.com/business1' },
      url: 'https://example.com/business1',
      publishedAt: new Date(),
      content: 'Global markets have surged as economic indicators show strong recovery and consumer confidence reaches pre-pandemic levels.',
      category: 'business'
    },
    {
      title: 'E-commerce Giant Expands into Healthcare Sector',
      source: { name: 'Business Insider', url: 'https://example.com/business2' },
      url: 'https://example.com/business2',
      publishedAt: new Date(),
      content: 'The company announced a major acquisition of a telehealth provider, signaling its strategic move into healthcare services.',
      category: 'business'
    }
  ],
  local: [
    {
      title: 'Local Community Center Renovation Completed',
      source: { name: 'Local News', url: 'https://example.com/local1' },
      url: 'https://example.com/local1',
      publishedAt: new Date(),
      content: 'The newly renovated community center features state-of-the-art facilities and will host various programs for residents of all ages.',
      category: 'local'
    },
    {
      title: 'City Council Approves New Public Transportation Plan',
      source: { name: 'City News', url: 'https://example.com/local2' },
      url: 'https://example.com/local2',
      publishedAt: new Date(),
      content: 'The comprehensive plan includes expanded bus routes, new bike lanes, and infrastructure improvements to reduce traffic congestion.',
      category: 'local'
    }
  ]
};

/**
 * Fetch top headlines from NewsAPI.org
 * @param {string} category - News category (general, business, technology, etc.)
 * @returns {Promise<Array>} - Array of news articles
 */
const fetchTopHeadlines = async (category = 'general') => {
  try {
    // Check if we have a valid API key
    if (!NEWS_API_KEY) {
      console.log('No NewsAPI key found. Using mock data.');
      return getMockArticles(category);
    }

    console.log(`Fetching news articles for category: ${category}`);

    try {
      const response = await axios.get(`${NEWS_API_URL}/top-headlines`, {
        params: {
          country: 'us',
          category,
          apiKey: NEWS_API_KEY,
          pageSize: 20
        }
      });

      if (response.data.status === 'ok' && response.data.articles.length > 0) {
        console.log(`Retrieved ${response.data.articles.length} articles from NewsAPI`);

        // Transform the response to match our Article model
        return response.data.articles.map((article, index) => ({
          _id: `news-api-${Date.now()}-${index}`,
          title: article.title || 'Untitled Article',
          source: {
            name: article.source.name || 'Unknown Source',
            url: article.url
          },
          url: article.url,
          publishedAt: new Date(article.publishedAt || Date.now()),
          content: article.content || article.description || 'No content available',
          category,
          // We'll generate perspectives later when the article is viewed
          perspectives: []
        }));
      }

      console.log('No articles found in NewsAPI response, falling back to mock data');
      return getMockArticles(category);
    } catch (apiError) {
      console.error('Error calling NewsAPI:', apiError.message);
      console.log('Falling back to mock data');
      return getMockArticles(category);
    }
  } catch (error) {
    console.error('Error fetching news:', error.message);
    // Always return some data to prevent the application from breaking
    return getMockArticles(category);
  }
};

/**
 * Get mock articles for a category
 * @param {string} category - News category
 * @returns {Array} - Array of mock articles
 */
const getMockArticles = (category = 'general') => {
  console.log(`Getting mock articles for category: ${category}`);

  // If we have mock articles for this category, use them
  if (MOCK_ARTICLES[category]) {
    return MOCK_ARTICLES[category].map((article, index) => ({
      _id: `mock-${Date.now()}-${index}`,
      title: article.title,
      source: article.source,
      url: article.url,
      publishedAt: article.publishedAt,
      content: article.content,
      category: article.category,
      perspectives: []
    }));
  }

  // Otherwise, fall back to general category
  return MOCK_ARTICLES.general.map((article, index) => ({
    _id: `mock-${Date.now()}-${index}`,
    title: article.title,
    source: article.source,
    url: article.url,
    publishedAt: article.publishedAt,
    content: article.content,
    category: category, // Use the requested category
    perspectives: []
  }));
};

/**
 * Get a random selection of news articles
 * @param {number} count - Number of random articles to return
 * @param {string} category - News category
 * @returns {Promise<Array>} - Array of random news articles
 */
const getRandomArticles = async (count = 5, category = 'general') => {
  try {
    const articles = await fetchTopHeadlines(category);

    // Shuffle the articles and return the requested count
    return shuffleArray(articles).slice(0, count);
  } catch (error) {
    console.error('Error getting random articles:', error.message);
    // Return mock articles instead of throwing an error
    return getMockArticles(category).slice(0, count);
  }
};

/**
 * Shuffle an array using the Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Fetch local news by zip code
 * @param {string} zipCode - US zip code to search for local news
 * @param {number} count - Number of articles to return
 * @returns {Promise<Array>} - Array of local news articles
 */
const fetchLocalNews = async (zipCode, count = 5) => {
  try {
    // Check if we have a valid API key
    if (!NEWS_API_KEY) {
      console.log('No NewsAPI key found. Using mock local data.');
      return getMockLocalArticles(zipCode, count);
    }

    console.log(`Fetching local news for zip code: ${zipCode}`);

    try {
      // For NewsAPI, we need to use the everything endpoint with location-based keywords
      // Since NewsAPI doesn't directly support zip code searches, we'll use the zip code as a keyword
      const response = await axios.get(`${NEWS_API_URL}/everything`, {
        params: {
          q: `${zipCode} OR local`,
          sortBy: 'publishedAt',
          language: 'en',
          apiKey: NEWS_API_KEY,
          pageSize: 20
        }
      });

      if (response.data.status === 'ok' && response.data.articles.length > 0) {
        console.log(`Retrieved ${response.data.articles.length} local articles from NewsAPI`);

        // Transform the response to match our Article model
        const articles = response.data.articles.map((article, index) => ({
          _id: `news-api-local-${Date.now()}-${index}`,
          title: article.title || 'Untitled Article',
          source: {
            name: article.source.name || 'Unknown Source',
            url: article.url
          },
          url: article.url,
          publishedAt: new Date(article.publishedAt || Date.now()),
          content: article.content || article.description || 'No content available',
          category: 'local',
          // We'll generate perspectives later when the article is viewed
          perspectives: []
        }));

        // Return the requested number of articles
        return articles.slice(0, count);
      }

      console.log('No local articles found in NewsAPI response, falling back to mock data');
      return getMockLocalArticles(zipCode, count);
    } catch (apiError) {
      console.error('Error calling NewsAPI for local news:', apiError.message);
      console.log('Falling back to mock local data');
      return getMockLocalArticles(zipCode, count);
    }
  } catch (error) {
    console.error('Error fetching local news:', error.message);
    // Always return some data to prevent the application from breaking
    return getMockLocalArticles(zipCode, count);
  }
};

/**
 * Get mock local articles for a zip code
 * @param {string} zipCode - Zip code to use for local news
 * @param {number} count - Number of articles to return
 * @returns {Array} - Array of mock local articles
 */
const getMockLocalArticles = (zipCode, count = 5) => {
  console.log(`Getting mock local articles for zip code: ${zipCode}`);

  // Create some zip code specific mock articles
  const zipSpecificArticles = [
    {
      title: `New Community Center Opens in ${zipCode} Area`,
      source: { name: 'Local News Network', url: 'https://example.com/local1' },
      url: 'https://example.com/local1',
      publishedAt: new Date(),
      content: `Residents of the ${zipCode} area now have access to a state-of-the-art community center featuring recreational facilities, meeting spaces, and educational programs.`,
      category: 'local'
    },
    {
      title: `${zipCode} School District Announces Curriculum Changes`,
      source: { name: 'Education Today', url: 'https://example.com/local2' },
      url: 'https://example.com/local2',
      publishedAt: new Date(),
      content: `The school district serving ${zipCode} has unveiled a new curriculum that emphasizes STEM education and practical life skills.`,
      category: 'local'
    }
  ];

  // Combine with general local articles
  const allLocalArticles = [...zipSpecificArticles, ...MOCK_ARTICLES.local];

  // Map and return the requested number
  return allLocalArticles.slice(0, count).map((article, index) => ({
    _id: `mock-local-${Date.now()}-${index}`,
    title: article.title,
    source: article.source,
    url: article.url,
    publishedAt: article.publishedAt,
    content: article.content,
    category: 'local',
    perspectives: []
  }));
};

module.exports = {
  fetchTopHeadlines,
  getRandomArticles,
  fetchLocalNews
};
