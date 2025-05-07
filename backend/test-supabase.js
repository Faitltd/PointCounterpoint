const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  try {
    // Test connection
    console.log('Testing Supabase connection...');
    const { data: countData, error: countError } = await supabase.from('articles').select('count');
    
    if (countError) {
      console.error('Error getting count:', countError);
    } else {
      console.log('Count data:', countData);
    }
    
    // Insert a test article
    console.log('\nInserting test article...');
    const { data: insertData, error: insertError } = await supabase
      .from('articles')
      .insert({
        title: 'Test Article',
        content: 'This is a test article content',
        source_name: 'Test Source',
        source_url: 'https://example.com',
        url: 'https://example.com/test-article',
        category: 'general'
      })
      .select();
    
    if (insertError) {
      console.error('Error inserting article:', insertError);
    } else {
      console.log('Inserted article:', insertData);
      
      // Get the inserted article
      const articleId = insertData[0].id;
      console.log('\nFetching the inserted article...');
      const { data: getArticleData, error: getArticleError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();
      
      if (getArticleError) {
        console.error('Error getting article:', getArticleError);
      } else {
        console.log('Retrieved article:', getArticleData);
      }
      
      // Insert perspectives for the article
      console.log('\nInserting perspectives...');
      const { data: perspectivesData, error: perspectivesError } = await supabase
        .from('perspectives')
        .insert([
          {
            article_id: articleId,
            viewpoint: 'liberal',
            summary: 'This is a liberal perspective'
          },
          {
            article_id: articleId,
            viewpoint: 'conservative',
            summary: 'This is a conservative perspective'
          },
          {
            article_id: articleId,
            viewpoint: 'neutral',
            summary: 'This is a neutral perspective'
          }
        ])
        .select();
      
      if (perspectivesError) {
        console.error('Error inserting perspectives:', perspectivesError);
      } else {
        console.log('Inserted perspectives:', perspectivesData);
        
        // Get article with perspectives
        console.log('\nFetching article with perspectives...');
        const { data: articleWithPerspectives, error: perspectivesQueryError } = await supabase
          .from('articles')
          .select(`
            *,
            perspectives (*)
          `)
          .eq('id', articleId)
          .single();
        
        if (perspectivesQueryError) {
          console.error('Error getting article with perspectives:', perspectivesQueryError);
        } else {
          console.log('Article with perspectives:', articleWithPerspectives);
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSupabase();
