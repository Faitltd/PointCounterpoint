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
    console.log('Fetching articles from NewsAPI...');
    
    const response = await axios.get(url);
    
    if (response.data && response.data.articles) {
      console.log(`Retrieved ${response.data.articles.length} articles from NewsAPI`);
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
    // Check if article already exists
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('url', article.url)
      .maybeSingle();

    if (existingArticle) {
      console.log(`Article already exists: ${article.title}`);
      return existingArticle;
    }

    // Insert new article
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: article.title,
        content: article.content || article.description,
        source_name: article.source.name,
        source_url: article.source.url || `https://${article.source.name.toLowerCase().replace(/\s+/g, '')}.com`,
        url: article.url,
        published_at: article.publishedAt || new Date(),
        category: category
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving article to Supabase:', error);
      return null;
    }

    console.log(`Saved article to Supabase: ${data.title}`);
    return data;
  } catch (error) {
    console.error('Error in saveArticleToSupabase:', error.message);
    return null;
  }
}

// Main function to fetch and save articles
async function fetchAndSaveArticles() {
  try {
    // Categories to fetch
    const categories = ['general', 'business', 'technology', 'entertainment', 'sports', 'science', 'health'];
    
    for (const category of categories) {
      console.log(`\nProcessing category: ${category}`);
      
      // Fetch articles from NewsAPI
      const articles = await fetchArticlesFromNewsApi(category, 5);
      
      // Save each article to Supabase
      for (const article of articles) {
        await saveArticleToSupabase(article, category);
      }
    }
    
    console.log('\nAll articles have been processed');
  } catch (error) {
    console.error('Error in fetchAndSaveArticles:', error.message);
  }
}

// Run the function
fetchAndSaveArticles();
