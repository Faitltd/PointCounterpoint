/**
 * Utility functions for URL handling
 */

/**
 * Converts a string to a URL-friendly slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The slugified text
 */
export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
};

/**
 * Creates a clean article URL with slug
 * @param {string} id - The article ID
 * @param {string} title - The article title
 * @param {string} category - The article category (optional)
 * @returns {string} - The clean URL
 */
export const createArticleUrl = (id, title, category = null) => {
  if (!id || !title) return '/';
  
  const slug = slugify(title);
  return `/article/${id}/${slug}`;
};

/**
 * Creates a clean category URL
 * @param {string} category - The category name
 * @returns {string} - The clean URL
 */
export const createCategoryUrl = (category) => {
  if (!category || category === 'general') return '/';
  
  return `/category/${category}`;
};

/**
 * Extracts the article ID from the URL
 * @param {string} url - The URL to parse
 * @returns {string|null} - The article ID or null if not found
 */
export const extractArticleId = (url) => {
  if (!url) return null;
  
  // Match /article/id or /article/id/slug
  const match = url.match(/\/article\/([^\/]+)/);
  return match ? match[1] : null;
};
