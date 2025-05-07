const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteTestArticle() {
  try {
    // Delete the test article
    const articleId = 'dfe323d2-e241-4cac-8714-a4d1051e538e';

    // First delete any perspectives associated with this article
    console.log('Deleting perspectives for article:', articleId);
    const { error: perspectivesError } = await supabase
      .from('perspectives')
      .delete()
      .eq('article_id', articleId);

    if (perspectivesError) {
      console.error('Error deleting perspectives:', perspectivesError);
    } else {
      console.log('Perspectives deleted successfully');
    }

    // Then delete the article
    console.log('Deleting article:', articleId);
    const { data, error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      console.error('Error deleting article:', error);
    } else {
      console.log('Article deleted successfully');
    }

    // Verify the article is gone
    console.log('Verifying article deletion...');
    const { data: checkData, error: checkError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId);

    if (checkError) {
      console.error('Error checking article:', checkError);
    } else if (checkData && checkData.length === 0) {
      console.log('Verification successful: Article has been deleted');
    } else {
      console.log('Warning: Article still exists in the database');

      // Try one more time with a different approach
      console.log('Trying alternative deletion method...');
      const { error: altError } = await supabase
        .from('articles')
        .delete()
        .filter('title', 'eq', 'Test Article')
        .filter('source_name', 'eq', 'Test Source');

      if (altError) {
        console.error('Error with alternative deletion:', altError);
      } else {
        console.log('Alternative deletion completed');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
deleteTestArticle();
