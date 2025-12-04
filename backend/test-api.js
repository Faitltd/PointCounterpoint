/**
 * Test script for the generateDetailedPerspectives function with the new API key
 */

const OpenAI = require('openai');

// Create a direct instance of OpenAI for testing
require('dotenv').config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define the parseAnalysisResponse function directly
const parseAnalysisResponse = (response) => {
  // Initialize with empty values
  const result = {
    liberal: '',
    conservative: '',
    neutral: ''
  };

  // Try to extract Liberal Perspective - handle both formats:
  // 1. "Liberal Perspective: content" format
  // 2. "1. Liberal Perspective: content" format
  const liberalMatch = response.match(/(?:1\.\s*)?Liberal Perspective:?([\s\S]*?)(?=(?:2\.\s*)?Conservative Perspective|$)/i);
  if (liberalMatch && liberalMatch[1]) {
    result.liberal = liberalMatch[1].trim();
  }

  // Try to extract Conservative Perspective
  const conservativeMatch = response.match(/(?:2\.\s*)?Conservative Perspective:?([\s\S]*?)(?=(?:3\.\s*)?Neutral Analysis|$)/i);
  if (conservativeMatch && conservativeMatch[1]) {
    result.conservative = conservativeMatch[1].trim();
  }

  // Try to extract Neutral Analysis
  const neutralMatch = response.match(/(?:3\.\s*)?Neutral Analysis:?([\s\S]*?)$/i);
  if (neutralMatch && neutralMatch[1]) {
    result.neutral = neutralMatch[1].trim();
  }

  return result;
};

async function testAPI() {
  try {
    console.log('Testing OpenAI API with new key...');
    console.log('Headline: New Climate Change Policy Announced');
    console.log('Content: The government announced a new climate change policy today that aims to reduce carbon emissions by 50% by 2030.');

    // Set a timeout for the API call
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('API call timed out after 30 seconds')), 30000)
    );

    const systemPrompt = `You are an impartial news analyst. For each input, you'll receive:
• A news headline
• A brief summary of the article

Produce three sections, each as a single concise paragraph (3-4 sentences):

1. Liberal Perspective
   • Provide a single concise perspective from a liberal viewpoint.
2. Conservative Perspective
   • Provide a single concise perspective from a conservative viewpoint.
3. Neutral Analysis
   • Provide a single balanced analysis that considers key points from both sides.`;

    console.log('Making API call...');

    // Race the API call against the timeout
    const response = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Headline: New Climate Change Policy Announced\nSummary: The government announced a new climate change policy today that aims to reduce carbon emissions by 50% by 2030.`
          }
        ]
      }),
      timeoutPromise
    ]);

    console.log('API response received!');

    const fullAnalysis = response.choices[0].message.content.trim();
    console.log('\nRaw API Response:');
    console.log(fullAnalysis);

    // Parse the response to extract the three perspectives
    const result = parseAnalysisResponse(fullAnalysis);

    console.log('\nParsed Perspectives:');
    console.log('\nLiberal Perspective:');
    console.log(result.liberal);

    console.log('\nConservative Perspective:');
    console.log(result.conservative);

    console.log('\nNeutral Analysis:');
    console.log(result.neutral);
  } catch (error) {
    console.error('Error testing API:', error);
    if (error.response) {
      console.error('API Error Details:', error.response);
    }
  }
}

testAPI();
