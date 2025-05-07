const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteTestArticleWithSQL() {
  try {
    // Delete the test article using SQL
    const articleId = 'dfe323d2-e241-4cac-8714-a4d1051e538e';
    
    // First delete any perspectives associated with this article
    console.log('Deleting perspectives for article:', articleId);
    const { data: perspectivesData, error: perspectivesError } = await supabase.rpc('delete_perspectives_for_article', {
      article_id_param: articleId
    });

    if (perspectivesError) {
      console.error('Error deleting perspectives:', perspectivesError);
    } else {
      console.log('Perspectives deleted successfully:', perspectivesData);
    }

    // Then delete the article using SQL
    console.log('Deleting article:', articleId);
    const { data, error } = await supabase.rpc('delete_article_by_id', {
      article_id_param: articleId
    });

    if (error) {
      console.error('Error deleting article:', error);
    } else {
      console.log('Article deleted successfully:', data);
    }

    // As a fallback, try the direct delete method
    console.log('Trying direct delete method as fallback');
    const { error: directError } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (directError) {
      console.error('Error with direct delete:', directError);
    } else {
      console.log('Direct delete successful');
    }

    // Verify the article is gone
    const { data: checkData, error: checkError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId);

    if (checkError) {
      console.error('Error checking if article exists:', checkError);
    } else {
      console.log('Article check result:', checkData);
      if (checkData.length === 0) {
        console.log('Article successfully deleted!');
      } else {
        console.log('Article still exists in the database');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
deleteTestArticleWithSQL();
