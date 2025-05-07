const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeTestArticleWithSQL() {
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

    // Get the specific test article ID
    const testArticleId = testArticles[0].id;
    console.log('Test article ID:', testArticleId);

    // Try using a raw SQL query to delete the perspectives
    console.log('Deleting perspectives with SQL...');
    const { data: deletedPerspectives, error: perspectivesError } = await supabase.rpc(
      'delete_test_article_perspectives',
      { article_id_param: testArticleId }
    );

    if (perspectivesError) {
      console.error('Error with SQL delete of perspectives:', perspectivesError);
      
      // Fallback to direct delete
      console.log('Falling back to direct delete of perspectives...');
      const { error: directDeleteError } = await supabase
        .from('perspectives')
        .delete()
        .eq('article_id', testArticleId);
        
      if (directDeleteError) {
        console.error('Error with direct delete of perspectives:', directDeleteError);
      } else {
        console.log('Successfully deleted perspectives with direct method');
      }
    } else {
      console.log('Successfully deleted perspectives with SQL');
    }

    // Try using a raw SQL query to delete the article
    console.log('Deleting test article with SQL...');
    const { data: deletedArticle, error: articleError } = await supabase.rpc(
      'delete_test_article',
      { article_id_param: testArticleId }
    );

    if (articleError) {
      console.error('Error with SQL delete of article:', articleError);
      
      // Try direct delete with specific ID
      console.log('Trying direct delete with specific ID...');
      const { error: directDeleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', testArticleId);
        
      if (directDeleteError) {
        console.error('Error with direct delete by ID:', directDeleteError);
        
        // Last resort: try to delete by title and source
        console.log('Last resort: trying delete by title and source...');
        const { error: lastResortError } = await supabase
          .from('articles')
          .delete()
          .eq('title', 'Test Article')
          .eq('source_name', 'Test Source');
          
        if (lastResortError) {
          console.error('Error with last resort delete:', lastResortError);
        } else {
          console.log('Successfully deleted article with last resort method');
        }
      } else {
        console.log('Successfully deleted article with direct ID method');
      }
    } else {
      console.log('Successfully deleted article with SQL');
    }

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
      console.log('Remaining test articles:', remainingArticles);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
removeTestArticleWithSQL();
