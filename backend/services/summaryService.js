const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate summaries from different perspectives for an article
 * @param {string} articleContent - The content of the article
 * @returns {Array} - Array of perspective summaries
 */
const generateSummaries = async (articleContent) => {
  try {
    const perspectives = [
      { viewpoint: 'liberal', prompt: 'Summarize this article from a liberal perspective:' },
      { viewpoint: 'conservative', prompt: 'Summarize this article from a conservative perspective:' },
      { viewpoint: 'neutral', prompt: 'Summarize this article from a neutral, fact-based perspective:' }
    ];

    const summaries = [];

    for (const perspective of perspectives) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `You are an assistant that summarizes news articles from a ${perspective.viewpoint} perspective. Keep summaries concise (3-4 sentences).` },
          { role: "user", content: `${perspective.prompt} ${articleContent}` }
        ],
        max_tokens: 150
      });

      summaries.push({
        viewpoint: perspective.viewpoint,
        summary: response.choices[0].message.content.trim()
      });
    }

    return summaries;
  } catch (error) {
    console.error('Error generating summaries:', error);
    throw error;
  }
};

/**
 * Generate detailed perspectives for a news article using the impartial news analyst prompt
 * @param {string} headline - The headline of the article
 * @param {string} content - The content/summary of the article
 * @returns {Array} - Array of detailed perspective analyses
 */
const generateDetailedPerspectives = async (headline, content) => {
  try {
    const systemPrompt = `You are an impartial news analyst. For each input, you'll receive:
• A news headline
• A brief summary of the article

Produce three sections, each as a single concise paragraph (3-4 sentences):

1. Liberal Perspective
   • Provide a single concise perspective from a liberal viewpoint.
2. Conservative Perspective
   • Provide a single concise perspective from a conservative viewpoint.
3. Neutral Summary
   • Provide a factual, objective summary of the news without any political bias.
   • Do NOT reference liberal or conservative viewpoints in this section.
   • Focus only on the key facts and context of the story.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Headline: ${headline}\nSummary: ${content}` }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const fullAnalysis = response.choices[0].message.content.trim();

    // Parse the response to extract the three perspectives
    const sections = parseAnalysisResponse(fullAnalysis);

    return sections;
  } catch (error) {
    console.error('Error generating detailed perspectives:', error);
    throw error;
  }
};

/**
 * Parse the LLM response to extract the three perspective sections
 * @param {string} response - The full text response from the LLM
 * @returns {Object} - Object containing the three perspective sections
 */
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
  const conservativeMatch = response.match(/(?:2\.\s*)?Conservative Perspective:?([\s\S]*?)(?=(?:3\.\s*)?Neutral (Analysis|Summary)|$)/i);
  if (conservativeMatch && conservativeMatch[1]) {
    result.conservative = conservativeMatch[1].trim();
  }

  // Try to extract Neutral Summary
  const neutralMatch = response.match(/(?:3\.\s*)?Neutral (Analysis|Summary):?([\s\S]*?)$/i);
  if (neutralMatch && neutralMatch[2]) {
    result.neutral = neutralMatch[2].trim();
  }

  return result;
};

module.exports = { generateSummaries, generateDetailedPerspectives };
