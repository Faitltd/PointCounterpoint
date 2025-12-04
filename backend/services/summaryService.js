const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
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
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 256,
        system: `You are an assistant that summarizes news articles from a ${perspective.viewpoint} perspective. Keep summaries concise (3-4 sentences).`,
        messages: [
          {
            role: 'user',
            content: `${perspective.prompt} ${articleContent}`
          }
        ]
      });

      summaries.push({
        viewpoint: perspective.viewpoint,
        summary: response.content[0].text.trim()
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
 * @param {string} writingStyle - Optional writing style to use (default, thompson, parker, sagan, baldwin, pratchett)
 * @returns {Array} - Array of detailed perspective analyses
 */
const generateDetailedPerspectives = async (headline, content, writingStyle = 'default') => {
  try {
    // Check if Anthropic API key is valid
    console.log('Checking Anthropic API key:', process.env.ANTHROPIC_API_KEY ? 'Key exists' : 'No key');

    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('No Anthropic API key found. Using fallback perspectives.');
      return generateFallbackPerspectives(headline, content);
    }

    // Define the base prompt
    let basePrompt = `You are an impartial news analyst. For each input, you'll receive:
• A news headline
• A brief summary of the article

Produce three sections:

1. Factual Summary
   • Provide a factual, objective summary of the news without any bias.
   • Focus only on the key facts and context of the story.
   • Include concrete specifics from the headline/summary (who, what, when, where, any numbers or names) rather than vague wording.
   • Paraphrase naturally; do not wrap text in quotation marks or repeat the headline verbatim.
   • Do NOT reference any opposing viewpoints in this section.
   • This should be a straightforward summary of what happened.
   • Do NOT use markdown symbols like asterisks (*) or hash symbols (#).
   • Do NOT include the term "TLDR" or "TL;DR" anywhere.
   • Do NOT mention bias or point of view.

2. Point
   • Write a single, natural paragraph (3-5 sentences) supporting the article like a well-read fan, with at least two concrete specifics (names, numbers, locations, timing) before any interpretation.
   • Do not include a standalone title line, do not repeat the headline verbatim, do not use quotation marks anywhere, and avoid stilted templates—make it read like a thoughtful take, not a form letter.
   • Do NOT describe what a supporter “would highlight” or “would argue”—just give the take directly.
   • Emphasize why this perspective is enthusiastic, who would appreciate it, and one practical upside they’d highlight.
   • This should represent one reasonable interpretation or viewpoint on the issue.
   • Do NOT default to political points of view unless the article is explicitly political.
   • Do NOT use markdown symbols like asterisks (*) or hash symbols (#).
   • IMPORTANT: NEVER start your response with "TLDR" or any variation. Do not mention summaries, briefs, or anything similar.
   • Write in a concise, direct style but NEVER label it as a summary or TLDR.
   • Do NOT explicitly reference "liberal" or "conservative" perspectives.

3. Counterpoint
   • Write a single, natural paragraph (3-5 sentences) explaining why an informed reader is not a fan of the article, citing specific details or tradeoffs they dislike, with at least two concrete specifics (names, numbers, locations, timing) before interpretation.
   • Do not include a standalone title line, do not repeat the headline verbatim, do not use quotation marks anywhere, and avoid stilted templates—make it read like a thoughtful take, not a form letter.
   • Do NOT describe what skeptics “would flag” or “would argue”—just state the opposing take directly.
   • Emphasize who would be skeptical, what feels weak or risky, and one practical caution or alternative they’d stress.
   • This should represent an opposing interpretation or viewpoint to the Point section.
   • Do NOT default to political points of view unless the article is explicitly political.
   • Do NOT use markdown symbols like asterisks (*) or hash symbols (#).
   • IMPORTANT: NEVER start your response with "TLDR" or any variation. Do not mention summaries, briefs, or anything similar.
   • Write in a concise, direct style but NEVER label it as a summary or TLDR.
   • Do NOT explicitly reference "liberal" or "conservative" perspectives.`;

    // Add writing style instructions based on the selected style
    let styleInstructions = '';

    if (writingStyle === 'thompson') {
      styleInstructions = `Write in the voice of Hunter S. Thompson. Use his gonzo cadence that makes even dull municipal reports throb with adrenaline, turning the reader into a co-conspirator riding shotgun through a hallucinatory political landscape.`;
    } else if (writingStyle === 'parker') {
      styleInstructions = `Write in the voice of Dorothy Parker. Use her acerbic wit to parcel hard facts in brittle one-liners, with scalpel-sharp observations that strip events to their human absurdity before the reader notices the blade.`;
    } else if (writingStyle === 'sagan') {
      styleInstructions = `Write in the voice of Carl Sagan. Use his cosmic perspective to reframe daily headlines against billions-year backdrops, lending humble data points the awe of starlight and the chill of deep time.`;
    } else if (writingStyle === 'baldwin') {
      styleInstructions = `Write in the voice of James Baldwin. Use his moral clarity to fuse reportage and essay into urgent testimony, prying open policy and power with language that feels both surgical and incandescent.`;
    } else if (writingStyle === 'pratchett') {
      styleInstructions = `Write in the voice of Terry Pratchett. Use his dry, disc-worldly satire to filter current affairs through lamp-posted fantasy, letting readers laugh at the folly of real institutions while seeing their mechanisms more clearly.`;
    } else if (writingStyle === 'eli5') {
      styleInstructions = `Explain everything as if you're truly talking to a five-year-old child who has just asked you about this topic. Use extremely simple words, very short sentences, concrete examples from a child's everyday experience, and helpful analogies involving toys, animals, or family situations. Avoid all complex concepts, technical terms, and abstract ideas. Make the content accessible, engaging, and relatable for a young child with very limited knowledge and vocabulary. Imagine you're sitting with a real five-year-old who is curious but has no background knowledge on this subject.`;
    }

    // Combine the base prompt with style instructions if a style is selected
    const systemPrompt = writingStyle !== 'standard' && writingStyle !== 'default'
      ? `${basePrompt}\n\nIMPORTANT STYLE INSTRUCTION: ${styleInstructions}`
      : basePrompt;

    console.log(`Generating perspectives with writing style: ${writingStyle}`);
    if (writingStyle !== 'standard' && writingStyle !== 'default') {
      console.log('Using style instructions:', styleInstructions);
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.5,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Headline: ${headline}\nSummary: ${content}`
        }
      ]
    });

    const fullAnalysis = response.content[0].text.trim();

    // Parse the response to extract the three perspectives
    const sections = parseOpposingViewsResponse(fullAnalysis);

    return sections;
  } catch (error) {
    console.error('Error generating detailed perspectives:', error);
    // Use fallback perspectives instead of throwing an error
    console.log('Using fallback perspectives due to API error.');
    return generateFallbackPerspectives(headline, content);
  }
};

/**
 * Generate fallback perspectives when OpenAI API is unavailable
 * @param {string} headline - The headline of the article
 * @param {string} content - The content of the article
 * @returns {Object} - Object containing the three perspective sections
 */
const generateFallbackPerspectives = (headline, content) => {
  console.log('Generating fallback perspectives for headline:', headline);

  const cleanHeadline = headline.replace(/["“”]/g, '');
  // Create a simplified content summary
  const contentSummary = content.length > 100
    ? content.substring(0, 100) + '...'
    : content;
  const cleanContentSummary = contentSummary.replace(/["“”]/g, '');

  return {
    point: `${cleanHeadline} reports: ${cleanContentSummary}. A supportive read highlights concrete gains tied to the specifics here (people, place, timing) and explains how those gains continue over the next few steps. It should cite at least one clear upside that flows directly from the details above.`,

    pointTitle: ``,

    counterpoint: `${cleanHeadline} also leaves gaps: ${cleanContentSummary}. A critical read calls out the missing costs, tradeoffs, or excluded parties and links that skepticism to the specifics above. It should name one plausible risk or downside and one practical safeguard rooted in those details.`,

    counterpointTitle: ``,

    neutral: `Key facts: ${cleanContentSummary} Readers should verify timing, scope, sources, and affected stakeholders.`
  };
};

/**
 * Parse the LLM response to extract the three perspective sections for the old format
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

/**
 * Parse the LLM response to extract the three sections for the new opposing views format
 * @param {string} response - The full text response from the LLM
 * @returns {Object} - Object containing the three perspective sections
 */
const parseOpposingViewsResponse = (response) => {
  console.log('Parsing response:', response);

  // Initialize with empty values
  const result = {
    point: '',
    pointTitle: '',
    counterpoint: '',
    counterpointTitle: '',
    neutral: ''
  };

  // Try to extract Factual Summary - look for section headers or numbers
  const factualMatch = response.match(/(?:1\.?\s*)?(?:Factual Summary|Summary):?([\s\S]*?)(?=(?:2\.?\s*)?Point|$)/i);
  if (factualMatch && factualMatch[1]) {
    result.neutral = factualMatch[1].trim();
    console.log('Extracted neutral summary:', result.neutral);
  } else {
    // Try alternative pattern for factual summary
    const altFactualMatch = response.match(/(?:Factual Summary|Summary):([\s\S]*?)(?=Point:|$)/i);
    if (altFactualMatch && altFactualMatch[1]) {
      result.neutral = altFactualMatch[1].trim();
      console.log('Extracted neutral summary (alt):', result.neutral);
    }
  }

  // Try to extract Point - look for section headers or numbers
  const pointMatch = response.match(/(?:2\.?\s*)?Point:?([\s\S]*?)(?=(?:3\.?\s*)?Counterpoint|$)/i);
  if (pointMatch && pointMatch[1]) {
    const pointContent = pointMatch[1].trim();
    console.log('Extracted point content:', pointContent);
    result.point = pointContent;
    result.pointTitle = '';
  } else {
    // Try alternative pattern for point
    const altPointMatch = response.match(/Point:([\s\S]*?)(?=Counterpoint:|$)/i);
    if (altPointMatch && altPointMatch[1]) {
      const pointContent = altPointMatch[1].trim();
      console.log('Extracted point content (alt):', pointContent);
      result.point = pointContent;
      result.pointTitle = '';
    }
  }

  // Try to extract Counterpoint - look for section headers or numbers
  const counterpointMatch = response.match(/(?:3\.?\s*)?Counterpoint:?([\s\S]*?)$/i);
  if (counterpointMatch && counterpointMatch[1]) {
    const counterpointContent = counterpointMatch[1].trim();
    console.log('Extracted counterpoint content:', counterpointContent);
    result.counterpoint = counterpointContent;
    result.counterpointTitle = '';
  } else {
    // Try alternative pattern for counterpoint
    const altCounterpointMatch = response.match(/Counterpoint:([\s\S]*?)$/i);
    if (altCounterpointMatch && altCounterpointMatch[1]) {
      const counterpointContent = altCounterpointMatch[1].trim();
      console.log('Extracted counterpoint content (alt):', counterpointContent);
      result.counterpoint = counterpointContent;
      result.counterpointTitle = '';
    }
  }

  // If we still don't have titles, generate some based on the content
  result.pointTitle = '';
  result.counterpointTitle = '';

  // Ensure we have all required fields
  if (!result.neutral) {
    result.neutral = "The article presents factual information that should be evaluated in context.";
    console.log('Generated default neutral summary');
  }

  if (!result.point) {
    result.point = "This perspective could not be generated. Please try again.";
    console.log('Generated default point content');
  }

  if (!result.counterpoint) {
    result.counterpoint = "This perspective could not be generated. Please try again.";
    console.log('Generated default counterpoint content');
  }

  // Clean up the content - remove markdown symbols and TLDR references
  result.neutral = cleanContent(result.neutral);
  result.point = cleanContent(result.point);
  result.counterpoint = cleanContent(result.counterpoint);
  result.pointTitle = cleanContent(result.pointTitle);
  result.counterpointTitle = cleanContent(result.counterpointTitle);

  console.log('Final parsed result:', result);
  return result;
};

/**
 * Clean content by removing markdown symbols and TLDR references
 * @param {string} content - The content to clean
 * @returns {string} - The cleaned content
 */
const cleanContent = (content) => {
  if (!content) return content;

  // Remove markdown symbols (* and #)
  let cleaned = content.replace(/[*#]/g, '');

  // Remove quotation marks
  cleaned = cleaned.replace(/["“”]/g, '');

  // Remove TLDR references
  cleaned = cleaned.replace(/\bTLDR\b:?/gi, '').replace(/\bTL;DR\b:?/gi, '');

  // Remove any "In summary" or similar phrases that might be used instead of TLDR
  cleaned = cleaned.replace(/^In summary:?\s*/i, '');
  cleaned = cleaned.replace(/^To summarize:?\s*/i, '');
  cleaned = cleaned.replace(/^Summary:?\s*/i, '');
  cleaned = cleaned.replace(/^In brief:?\s*/i, '');

  // Remove any references to liberal or conservative perspectives
  cleaned = cleaned.replace(/\b(liberal|conservative)\s+(perspective|view|viewpoint|opinion|stance)\b/gi, 'perspective');

  // Remove any references to "point of view" or "bias"
  cleaned = cleaned.replace(/\b(point of view|bias|biased)\b/gi, 'perspective');

  // Trim any extra whitespace
  cleaned = cleaned.trim();

  return cleaned;
};

/**
 * Search for real local news articles based on a zip code using ChatGPT
 * @param {string} zipCode - The zip code to search local news for
 * @param {number} count - Number of articles to return (default: 5)
 * @returns {Promise<Array>} - Array of real local news articles
 */
const generateLocalNews = async (zipCode, count = 5) => {
  try {
    console.log(`Searching for local news for zip code: ${zipCode}`);

    // Check if Anthropic API key is valid
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('No Anthropic API key found. Using fallback local news.');
      return [];
    }

    // First, ask Claude to identify the location based on the zip code
    const locationResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      temperature: 0.3,
      system: 'You are a helpful assistant that provides information about geographic locations based on zip codes.',
      messages: [
        {
          role: 'user',
          content: `What city, county, and state is zip code ${zipCode} located in? Respond with just the location information in a simple format like "City, County, State".`
        }
      ]
    });

    const locationInfo = locationResponse.content[0].text.trim();
    console.log(`Zip code ${zipCode} corresponds to: ${locationInfo}`);

    // Now, ask Claude to search for real news articles about this location
    // Get current date for the prompt
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const systemPrompt = `You are a local news researcher with access to current news databases. Today is ${formattedDate}. You will be given a location, and your task is to search for ${count} REAL, CURRENT news articles about this location.

IMPORTANT: These MUST be REAL articles that actually exist from legitimate news sources, NOT fictional or AI-generated content. Use your knowledge of current events to find ACTUAL news stories that have been published about this location WITHIN THE LAST 24 HOURS.

DO NOT make up articles or sources. If you don't know of specific articles from the last 24 hours, use general knowledge to identify what would be the most likely real news stories from that location based on VERY RECENT events.

For each article, include:
1. A headline (the actual headline of the real article)
2. A brief content summary (2-3 sentences describing what the article is about)
3. A source name (the actual news organization that published the article)
4. A URL (the actual or likely URL where this article could be found)

Format your response as a valid JSON array with the following structure for each article:
[
  {
    "title": "Actual headline of the real article",
    "content": "Brief summary of what the article is about",
    "source": {
      "name": "Actual News Source Name",
      "url": "https://actual-news-source.com"
    },
    "url": "https://actual-news-source.com/article/specific-story",
    "publishedAt": "${currentDate.toISOString()}"
  },
  ...
]

Focus on diverse topics (local government, community events, business, education, crime, etc.) that would be relevant to people living in this location. These should be FRESH, RECENT news stories from the last 24 hours that someone could actually find if they searched for news about this location today.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Search for ${count} real, FRESH news articles from the LAST 24 HOURS about ${locationInfo}. Only include the most recent stories from today or yesterday.`
        }
      ]
    });

    let content = response.content[0].text.trim();
    console.log('Found local news content:', content);

    try {
      // Clean up the content if it contains markdown code blocks
      if (content.includes('```')) {
        // Extract content between ```json and ``` markers
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
          content = jsonMatch[1].trim();
        } else {
          // If no match found but there are backticks, try to remove them
          content = content.replace(/```json\s*/g, '').replace(/```/g, '');
        }
      }

      // Parse the JSON response
      const articles = JSON.parse(content);

      // Ensure we have the right format and add any missing fields
      const formattedArticles = articles.map((article, index) => ({
        _id: `local-gpt-${Date.now()}-${index}`,
        title: article.title || `Local News for ${locationInfo}`,
        content: article.content || 'No content available',
        source: {
          name: article.source?.name || `${locationInfo} News`,
          url: article.source?.url || 'https://example.com/local'
        },
        url: article.url || `https://example.com/local/${zipCode}/${index}`,
        publishedAt: new Date(article.publishedAt || Date.now()),
        category: 'local',
        perspectives: []
      }));

      return formattedArticles.slice(0, count);
    } catch (parseError) {
      console.error('Error parsing ChatGPT response:', parseError);
      console.log('Raw response:', content);
      return [];
    }
  } catch (error) {
    console.error('Error searching for local news with ChatGPT:', error);
    return [];
  }
};

module.exports = { generateSummaries, generateDetailedPerspectives, generateLocalNews };
