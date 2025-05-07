const axios = require('axios');
require('dotenv').config();

// We'll use the NewsAPI.org service with the provided API key
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2';

/**
 * Fetch top headlines from NewsAPI.org
 * @param {string} category - News category (general, business, technology, etc.)
 * @returns {Promise<Array>} - Array of news articles
 */
const fetchTopHeadlines = async (category = 'general') => {
  try {
    console.log(`Fetching news articles for category: ${category}`);

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

    console.log('No articles found in NewsAPI response');
    throw new Error('No articles found');
  } catch (error) {
    console.error('Error fetching news from NewsAPI:', error.message);
    throw error;
  }
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
    throw error;
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

module.exports = {
  fetchTopHeadlines,
  getRandomArticles
};
