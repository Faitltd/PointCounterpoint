/**
 * Article Refresh Service
 *
 * This service is responsible for periodically refreshing news articles
 * to ensure that headlines don't remain at the top all day.
 */

const cron = require('node-cron');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const newsApiKey = process.env.NEWS_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch articles from NewsAPI
 * @param {string} category - News category
 * @param {number} pageSize - Number of articles to fetch
 * @returns {Promise<Array>} - Array of articles
 */
async function fetchArticlesFromNewsApi(category = 'general', pageSize = 10) {
  try {
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=${pageSize}&apiKey=${newsApiKey}`;
    console.log(`[ArticleRefresh] Fetching articles for category: ${category}`);

    const response = await axios.get(url);

    if (response.data && response.data.articles) {
      console.log(`[ArticleRefresh] Retrieved ${response.data.articles.length} articles from NewsAPI for ${category}`);
      return response.data.articles;
    } else {
      console.error('[ArticleRefresh] No articles found in NewsAPI response');
      return [];
    }
  } catch (error) {
    console.error('[ArticleRefresh] Error fetching articles from NewsAPI:', error.message);
    return [];
  }
}

/**
 * Save an article to Supabase
 * @param {Object} article - Article object from NewsAPI
 * @param {string} category - Category of the article
 * @returns {Promise<Object>} - Saved article
 */
async function saveArticleToSupabase(article, category) {
  try {
    // Check if article already exists by URL
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id, title')
      .eq('url', article.url)
      .maybeSingle();

    if (existingArticle) {
      console.log(`[ArticleRefresh] Article already exists: ${existingArticle.title}`);
      return existingArticle;
    }

    // Insert new article - handle case where last_shown_at column might not exist yet
    const articleData = {
      title: article.title,
      content: article.content || article.description,
      source_name: article.source.name,
      source_url: article.source.url || `https://${article.source.name.toLowerCase().replace(/\s+/g, '')}.com`,
      url: article.url,
      published_at: article.publishedAt || new Date(),
      category: category
    };

    // Try to add last_shown_at field, but it might not exist in the schema yet
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert(articleData)
        .select()
        .single();

      if (error) throw error;
      console.log(`[ArticleRefresh] Saved new article to Supabase: ${data.title}`);
      return data;
    } catch (insertError) {
      console.error('[ArticleRefresh] Error saving article to Supabase:', insertError);
      return null;
    }
  } catch (error) {
    console.error('[ArticleRefresh] Error in saveArticleToSupabase:', error.message);
    return null;
  }
}

/**
 * Clean up old articles from the database
 * @param {number} daysOld - Articles older than this many days will be removed
 */
async function cleanupOldArticles(daysOld = 7) {
  try {
    console.log(`[ArticleRefresh] Cleaning up articles older than ${daysOld} days...`);

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Delete old articles
    const { data, error, count } = await supabase
      .from('articles')
      .delete()
      .lt('published_at', cutoffDate.toISOString())
      .select('count');

    if (error) {
      console.error('[ArticleRefresh] Error cleaning up old articles:', error);
    } else {
      console.log(`[ArticleRefresh] Successfully removed ${count || 'unknown number of'} old articles`);
    }
  } catch (error) {
    console.error('[ArticleRefresh] Error in cleanupOldArticles:', error.message);
  }
}

/**
 * Fetch and save articles for all categories
 */
async function refreshAllArticles() {
  try {
    console.log('[ArticleRefresh] Starting article refresh cycle...');

    // First, clean up old articles
    await cleanupOldArticles(7); // Remove articles older than 7 days

    // Categories to fetch
    const categories = ['general', 'business', 'technology', 'entertainment', 'sports', 'science', 'health', 'politics'];

    for (const category of categories) {
      console.log(`[ArticleRefresh] Processing category: ${category}`);

      // Fetch articles from NewsAPI
      const articles = await fetchArticlesFromNewsApi(category, 10);

      // Save each article to Supabase
      for (const article of articles) {
        await saveArticleToSupabase(article, category);
      }
    }

    console.log('[ArticleRefresh] Article refresh cycle completed');
  } catch (error) {
    console.error('[ArticleRefresh] Error in refreshAllArticles:', error.message);
  }
}

/**
 * Initialize the article refresh scheduler
 * @param {string} schedule - Cron schedule expression (default: every 3 hours)
 */
function initializeArticleRefreshScheduler(schedule = '0 */3 * * *') {
  console.log(`[ArticleRefresh] Initializing article refresh scheduler with schedule: ${schedule}`);

  // Schedule the refresh task
  const task = cron.schedule(schedule, () => {
    console.log(`[ArticleRefresh] Running scheduled article refresh at ${new Date().toISOString()}`);
    refreshAllArticles();
  });

  // Start the scheduler
  task.start();

  // Run an initial refresh
  console.log('[ArticleRefresh] Running initial article refresh');
  refreshAllArticles();

  return task;
}

module.exports = {
  initializeArticleRefreshScheduler,
  refreshAllArticles,
  cleanupOldArticles
};
