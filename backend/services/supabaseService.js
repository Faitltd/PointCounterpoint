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
 * Get a random selection of articles with rotation to ensure freshness
 * @param {number} count - Number of articles to return
 * @param {string} category - Category of articles
 * @returns {Promise<Array>} - Array of random articles
 */
const getRandomArticles = async (count = 5, category = 'general') => {
  try {
    // Calculate date for freshness filter (articles from the last 48 hours)
    const freshCutoff = new Date();
    freshCutoff.setHours(freshCutoff.getHours() - 48);

    console.log(`Fetching articles published after: ${freshCutoff.toISOString()}`);

    // Get more articles than needed to allow for filtering and rotation
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq(category !== 'all' ? 'category' : 'id', category !== 'all' ? category : 'id') // If 'all', use a dummy condition
      .gte('published_at', freshCutoff.toISOString()) // Only get fresh articles
      .order('published_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    // Filter out test articles
    const filteredArticles = articles ? articles.filter(article =>
      !(article.title === 'Test Article' && article.source_name === 'Test Source')
    ) : [];

    console.log(`Filtered out ${articles ? articles.length - filteredArticles.length : 0} test articles`);
    console.log(`Found ${filteredArticles.length} fresh articles for category ${category}`);

    // If we don't have enough fresh articles, try getting older ones
    if (filteredArticles.length < count) {
      console.log(`Not enough fresh articles, fetching older ones for category ${category}`);

      // Get older articles as fallback
      const { data: olderArticles, error: olderError } = await supabase
        .from('articles')
        .select('*')
        .eq(category !== 'all' ? 'category' : 'id', category !== 'all' ? category : 'id')
        .lt('published_at', freshCutoff.toISOString())
        .order('published_at', { ascending: false })
        .limit(30);

      if (!olderError && olderArticles) {
        // Filter out test articles from older ones too
        const filteredOlderArticles = olderArticles.filter(article =>
          !(article.title === 'Test Article' && article.source_name === 'Test Source')
        );

        console.log(`Found ${filteredOlderArticles.length} older articles for category ${category}`);

        // Combine fresh and older articles, prioritizing fresh ones
        const combinedArticles = [...filteredArticles, ...filteredOlderArticles];

        // If we have fewer articles than requested, return all of them
        if (combinedArticles.length <= count) return combinedArticles;

        // Otherwise, continue with the combined list
        filteredArticles.push(...filteredOlderArticles);
      }
    }

    // If we still have fewer articles than requested, return all of them
    if (filteredArticles.length <= count) return filteredArticles;

    // Get current timestamp for rotation calculations
    const now = new Date();
    const hourOfDay = now.getHours();

    // Create a weighted list based on recency and rotation
    const weightedArticles = filteredArticles.map(article => {
      // Calculate article age in hours
      const publishedAt = new Date(article.published_at);
      const ageInHours = (now - publishedAt) / (1000 * 60 * 60);

      // Calculate time since last shown (if available)
      let timeSinceLastShown = Infinity;
      if (article.last_shown_at) {
        const lastShown = new Date(article.last_shown_at);
        timeSinceLastShown = (now - lastShown) / (1000 * 60 * 60);
      }

      // Calculate a weight based on recency and time since last shown
      // Higher weight = more likely to be selected
      let weight = 100;

      // Newer articles get higher weight
      weight -= Math.min(ageInHours * 2, 50); // Max penalty of 50 for old articles

      // Articles not shown recently get higher weight
      weight += Math.min(timeSinceLastShown * 5, 50); // Max bonus of 50 for articles not shown recently

      // Add some time-of-day variation to ensure rotation throughout the day
      // This creates a subtle shift in article selection every hour
      weight += (hourOfDay % 4) * (article.id.charCodeAt(0) % 10);

      return { ...article, weight };
    });

    // Sort by weight (highest first) and take the top articles
    const selectedArticles = weightedArticles
      .sort((a, b) => b.weight - a.weight)
      .slice(0, count);

    // Update the last_shown_at timestamp for selected articles if the column exists
    try {
      for (const article of selectedArticles) {
        await supabase
          .from('articles')
          .update({ last_shown_at: now.toISOString() })
          .eq('id', article.id);
      }
    } catch (updateError) {
      // If the column doesn't exist, just log and continue
      console.log('Note: Unable to update last_shown_at timestamp. Column may not exist in the database schema.');
    }

    // Shuffle the final selection to add some randomness to the order
    return shuffleArray(selectedArticles);
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
      const articleData = {
        title: article.title,
        content: article.content,
        source_name: article.source.name,
        source_url: article.source.url,
        url: article.url,
        published_at: article.publishedAt || new Date(),
        category: article.category
      };

      // Try to include last_shown_at if it exists in the schema
      try {
        const { data, error } = await supabase
          .from('articles')
          .insert(articleData)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (insertError) {
        console.error('Error saving article to Supabase:', insertError);
        throw insertError;
      }
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
