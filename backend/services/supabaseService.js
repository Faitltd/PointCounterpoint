const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key not found in environment variables');
} else {
  console.log('Initializing Supabase client with URL:', supabaseUrl);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
(async () => {
  try {
    const { data, error } = await supabase.from('articles').select('count');
    if (error) {
      console.error('Supabase connection test error:', error);
    } else {
      console.log('Supabase connection successful');
    }
  } catch (err) {
    console.error('Supabase connection test exception:', err);
  }
})();

/**
 * Get articles from Supabase
 * @param {string} category - Category of articles to fetch
 * @param {number} limit - Maximum number of articles to return
 * @returns {Promise<Array>} - Array of articles
 */
const getArticles = async (category = 'general', limit = 10) => {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching articles from Supabase:', error);
    throw error;
  }
};

/**
 * Get a random selection of articles
 * @param {number} count - Number of articles to return
 * @param {string} category - Category of articles
 * @returns {Promise<Array>} - Array of random articles
 */
const getRandomArticles = async (count = 5, category = 'general') => {
  try {
    const articles = await getArticles(category, 20);

    // Filter out test articles
    const filteredArticles = articles.filter(article =>
      !(article.title === 'Test Article' && article.source_name === 'Test Source')
    );

    console.log(`Filtered out ${articles.length - filteredArticles.length} test articles`);

    // If we have fewer articles than requested, return all of them
    if (filteredArticles.length <= count) return filteredArticles;

    // Otherwise, shuffle and return the requested count
    return shuffleArray(filteredArticles).slice(0, count);
  } catch (error) {
    console.error('Error getting random articles:', error);
    throw error;
  }
};

/**
 * Get a single article by ID
 * @param {string} id - Article ID
 * @returns {Promise<Object>} - Article object
 */
const getArticleById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        perspectives (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Filter out test articles
    if (data && data.title === 'Test Article' && data.source_name === 'Test Source') {
      console.log('Filtered out test article with ID:', id);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching article from Supabase:', error);
    throw error;
  }
};

/**
 * Save an article to Supabase
 * @param {Object} article - Article object
 * @returns {Promise<Object>} - Saved article
 */
const saveArticle = async (article) => {
  try {
    // Check if article already exists
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('url', article.url)
      .maybeSingle();

    if (existingArticle) {
      // Update existing article
      const { data, error } = await supabase
        .from('articles')
        .update({
          title: article.title,
          content: article.content,
          category: article.category,
          updated_at: new Date()
        })
        .eq('id', existingArticle.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } else {
      // Insert new article
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          content: article.content,
          source_name: article.source.name,
          source_url: article.source.url,
          url: article.url,
          published_at: article.publishedAt || new Date(),
          category: article.category
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    }
  } catch (error) {
    console.error('Error saving article to Supabase:', error);
    throw error;
  }
};

/**
 * Save perspectives for an article
 * @param {string} articleId - Article ID
 * @param {Array} perspectives - Array of perspective objects
 * @returns {Promise<Array>} - Saved perspectives
 */
const savePerspectives = async (articleId, perspectives) => {
  try {
    // Delete existing perspectives for this article
    const { error: deleteError } = await supabase
      .from('perspectives')
      .delete()
      .eq('article_id', articleId);

    if (deleteError) throw deleteError;

    // Insert new perspectives
    const perspectivesToInsert = perspectives.map(p => ({
      article_id: articleId,
      viewpoint: p.viewpoint,
      summary: p.summary
    }));

    const { data, error } = await supabase
      .from('perspectives')
      .insert(perspectivesToInsert)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error saving perspectives to Supabase:', error);
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

/**
 * Delete an article from Supabase
 * @param {string} id - Article ID to delete
 * @returns {Promise<Object>} - Result of the delete operation
 */
const deleteArticle = async (id) => {
  try {
    // First delete any perspectives associated with this article
    const { error: perspectivesError } = await supabase
      .from('perspectives')
      .delete()
      .eq('article_id', id);

    if (perspectivesError) throw perspectivesError;

    // Then delete the article
    const { data, error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error deleting article from Supabase:', error);
    throw error;
  }
};

module.exports = {
  supabase,
  getArticles,
  getRandomArticles,
  getArticleById,
  saveArticle,
  savePerspectives,
  deleteArticle
};
