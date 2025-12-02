/**
 * Standalone script to refresh articles
 *
 * This script can be run independently as a cron job to fetch fresh articles
 * from NewsAPI and store them in Supabase.
 *
 * Usage: node refresh-articles.js
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const newsApiKey = process.env.NEWS_API_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);
console.log('NewsAPI Key exists:', !!newsApiKey);

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch articles from NewsAPI
async function fetchArticlesFromNewsApi(category = 'general', pageSize = 10) {
  try {
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=${pageSize}&apiKey=${newsApiKey}`;
    console.log(`Fetching articles for category: ${category}`);

    const response = await axios.get(url);

    if (response.data && response.data.articles) {
      console.log(`Retrieved ${response.data.articles.length} articles from NewsAPI for ${category}`);
      return response.data.articles;
    } else {
      console.error('No articles found in NewsAPI response');
      return [];
    }
  } catch (error) {
    console.error('Error fetching articles from NewsAPI:', error.message);
    return [];
  }
}

// Function to save an article to Supabase
async function saveArticleToSupabase(article, category) {
  try {
    // Check if article already exists by URL
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id, title')
      .eq('url', article.url)
      .maybeSingle();

    if (existingArticle) {
      console.log(`Article already exists: ${existingArticle.title}`);
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
      console.log(`Saved new article to Supabase: ${data.title}`);
      return data;
    } catch (insertError) {
      console.error('Error saving article to Supabase:', insertError);
      return null;
    }
  } catch (error) {
    console.error('Error in saveArticleToSupabase:', error.message);
    return null;
  }
}

// Main function to fetch and save articles
async function refreshAllArticles() {
  try {
    console.log('Starting article refresh at', new Date().toISOString());

    // Categories to fetch
    const categories = ['general', 'business', 'technology', 'entertainment', 'sports', 'science', 'health', 'politics'];

    for (const category of categories) {
      console.log(`\nProcessing category: ${category}`);

      // Fetch articles from NewsAPI
      const articles = await fetchArticlesFromNewsApi(category, 10);

      // Save each article to Supabase
      for (const article of articles) {
        await saveArticleToSupabase(article, category);
      }
    }

    console.log('\nArticle refresh completed at', new Date().toISOString());
  } catch (error) {
    console.error('Error in refreshAllArticles:', error.message);
    process.exit(1);
  }
}

// Run the function and exit when done
refreshAllArticles().then(() => {
  console.log('Refresh completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('Refresh failed:', error);
  process.exit(1);
});
