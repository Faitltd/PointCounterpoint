const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeTestArticle() {
  try {
    // First, check if the test article exists
    console.log('Checking for test articles...');
    const { data: testArticles, error: findError } = await supabase
      .from('articles')
      .select('*')
      .eq('title', 'Test Article')
      .eq('source_name', 'Test Source');

    if (findError) {
      console.error('Error finding test articles:', findError);
      return;
    }

    console.log(`Found ${testArticles.length} test articles`);
    
    if (testArticles.length === 0) {
      console.log('No test articles found.');
      return;
    }

    // Delete perspectives for each test article
    for (const article of testArticles) {
      console.log(`Deleting perspectives for article ID: ${article.id}`);
      const { error: perspectivesError } = await supabase
        .from('perspectives')
        .delete()
        .eq('article_id', article.id);

      if (perspectivesError) {
        console.error(`Error deleting perspectives for article ${article.id}:`, perspectivesError);
      } else {
        console.log(`Successfully deleted perspectives for article ${article.id}`);
      }
    }

    // Delete all test articles
    console.log('Deleting all test articles...');
    const { data: deletedArticles, error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('title', 'Test Article')
      .eq('source_name', 'Test Source')
      .select();

    if (deleteError) {
      console.error('Error deleting test articles:', deleteError);
      return;
    }

    console.log(`Successfully deleted ${deletedArticles.length} test articles`);
    
    // Verify deletion
    console.log('Verifying deletion...');
    const { data: remainingArticles, error: verifyError } = await supabase
      .from('articles')
      .select('*')
      .eq('title', 'Test Article')
      .eq('source_name', 'Test Source');

    if (verifyError) {
      console.error('Error verifying deletion:', verifyError);
      return;
    }

    if (remainingArticles.length === 0) {
      console.log('Verification successful: All test articles have been removed.');
    } else {
      console.log(`Warning: ${remainingArticles.length} test articles still remain.`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
removeTestArticle();
