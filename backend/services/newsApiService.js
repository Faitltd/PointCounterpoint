const axios = require('axios');
require('dotenv').config();

// Shared HTTP client with sane defaults for external APIs
const http = axios.create({
  timeout: 8000,
  headers: {
    'User-Agent': 'PointCounterpoint/1.0'
  }
});

// We'll use the NewsAPI.org service with the provided API key
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2';
const WEBZIO_API_KEY = process.env.WEBZIO_API_KEY;
const WEBZIO_API_URL = 'https://api.webz.io/news-api/v1/search';
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GNEWS_API_URL = 'https://gnews.io/api/v4';
const THE_NEWS_API_KEY = process.env.THE_NEWS_API_KEY;
const THE_NEWS_API_URL = 'https://api.thenewsapi.com/v1/news';

const makeArticle = ({
  provider = 'news',
  title,
  url,
  sourceName,
  sourceUrl,
  publishedAt,
  content,
  category,
  index = 0
}) => {
  const normalizedUrl = url || sourceUrl || '';
  const publishedDate = publishedAt ? new Date(publishedAt) : new Date();
  const safeDate = isNaN(publishedDate.getTime()) ? new Date() : publishedDate;

  return {
    _id: `${provider}-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
    title: title || 'Untitled Article',
    source: {
      name: sourceName || 'Unknown Source',
      url: sourceUrl || normalizedUrl
    },
    url: normalizedUrl,
    publishedAt: safeDate,
    content: content || '',
    category,
    perspectives: [],
    source_name: sourceName || 'Unknown Source',
    source_url: sourceUrl || normalizedUrl
  };
};

const dedupeArticles = (articles = []) => {
  const seen = new Set();
  return articles.filter(article => {
    const title = (article.title || '').toLowerCase();
    const source = (article.source_name || article.source?.name || '').toLowerCase();
    const url = (article.url || '').toLowerCase();
    const key = `${url}|${title}|${source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const mapCategoryToGNewsTopic = (category = 'general') => {
  const map = {
    general: 'general',
    world: 'world',
    politics: 'nation',
    business: 'business',
    technology: 'technology',
    entertainment: 'entertainment',
    sports: 'sports',
    science: 'science',
    health: 'health'
  };
  return map[category] || 'general';
};

const mapCategoryToTheNewsApi = (category = 'general') => {
  const map = {
    general: 'general',
    world: 'world',
    politics: 'politics',
    business: 'business',
    technology: 'tech',
    entertainment: 'entertainment',
    sports: 'sports',
    science: 'science',
    health: 'health'
  };
  return map[category] || 'general';
};

// Mock data for when the API key is missing or invalid
const MOCK_ARTICLES = {
  general: [
    {
      title: 'Global Economic Summit Concludes with New Trade Agreements',
      source: { name: 'World News Network', url: 'https://example.com/news1' },
      url: 'https://example.com/news1',
      publishedAt: new Date(),
      content: 'Leaders from 20 countries reached consensus on new trade policies aimed at reducing tariffs and promoting sustainable development.',
      category: 'general'
    },
    {
      title: 'Scientists Discover Potential Breakthrough in Renewable Energy',
      source: { name: 'Science Today', url: 'https://example.com/news2' },
      url: 'https://example.com/news2',
      publishedAt: new Date(),
      content: 'A team of researchers has developed a new type of solar panel that can generate electricity even on cloudy days, potentially revolutionizing renewable energy.',
      category: 'general'
    },
    {
      title: 'Tech Giants Announce Collaboration on AI Ethics Standards',
      source: { name: 'Tech Insider', url: 'https://example.com/news3' },
      url: 'https://example.com/news3',
      publishedAt: new Date(),
      content: 'Major technology companies have formed a coalition to establish industry-wide ethical guidelines for artificial intelligence development and deployment.',
      category: 'general'
    },
    {
      title: 'Global Health Organization Reports Decline in Infectious Diseases',
      source: { name: 'Health Report', url: 'https://example.com/news4' },
      url: 'https://example.com/news4',
      publishedAt: new Date(),
      content: 'New data shows a significant reduction in infectious disease rates worldwide, attributed to improved vaccination programs and public health initiatives.',
      category: 'general'
    },
    {
      title: 'Historic Peace Agreement Signed in Middle East',
      source: { name: 'International Herald', url: 'https://example.com/news5' },
      url: 'https://example.com/news5',
      publishedAt: new Date(),
      content: 'After decades of conflict, regional leaders have signed a comprehensive peace agreement that addresses territorial disputes and establishes diplomatic relations.',
      category: 'general'
    }
  ],
  technology: [
    {
      title: 'New Quantum Computing Breakthrough Announced',
      source: { name: 'Tech Review', url: 'https://example.com/tech1' },
      url: 'https://example.com/tech1',
      publishedAt: new Date(),
      content: 'Researchers have achieved quantum supremacy with a new 1000-qubit processor that solves complex problems in seconds.',
      category: 'technology'
    },
    {
      title: 'Major Smartphone Manufacturer Unveils Foldable Device',
      source: { name: 'Gadget News', url: 'https://example.com/tech2' },
      url: 'https://example.com/tech2',
      publishedAt: new Date(),
      content: 'The latest foldable smartphone features a revolutionary display technology and enhanced durability.',
      category: 'technology'
    },
    {
      title: 'AI-Powered Autonomous Vehicles Begin Public Road Testing',
      source: { name: 'Future Transport', url: 'https://example.com/tech3' },
      url: 'https://example.com/tech3',
      publishedAt: new Date(),
      content: 'A fleet of fully autonomous vehicles has begun testing on public roads, marking a significant milestone in self-driving technology.',
      category: 'technology'
    },
    {
      title: 'Revolutionary Brain-Computer Interface Receives FDA Approval',
      source: { name: 'Medical Tech Today', url: 'https://example.com/tech4' },
      url: 'https://example.com/tech4',
      publishedAt: new Date(),
      content: 'The new device allows paralyzed patients to control digital devices using only their thoughts, opening new possibilities for accessibility.',
      category: 'technology'
    },
    {
      title: 'Tech Industry Leaders Commit to Carbon-Neutral Operations by 2030',
      source: { name: 'Green Tech News', url: 'https://example.com/tech5' },
      url: 'https://example.com/tech5',
      publishedAt: new Date(),
      content: 'Major technology companies have pledged to eliminate their carbon footprint through renewable energy investments and sustainable practices.',
      category: 'technology'
    }
  ],
  business: [
    {
      title: 'Stock Markets Reach Record Highs Amid Economic Recovery',
      source: { name: 'Financial Times', url: 'https://example.com/business1' },
      url: 'https://example.com/business1',
      publishedAt: new Date(),
      content: 'Global markets have surged as economic indicators show strong recovery and consumer confidence reaches pre-pandemic levels.',
      category: 'business'
    },
    {
      title: 'E-commerce Giant Expands into Healthcare Sector',
      source: { name: 'Business Insider', url: 'https://example.com/business2' },
      url: 'https://example.com/business2',
      publishedAt: new Date(),
      content: 'The company announced a major acquisition of a telehealth provider, signaling its strategic move into healthcare services.',
      category: 'business'
    },
    {
      title: 'Major Merger Creates New Global Banking Leader',
      source: { name: 'Banking Journal', url: 'https://example.com/business3' },
      url: 'https://example.com/business3',
      publishedAt: new Date(),
      content: 'The merger between two banking giants has created one of the world\'s largest financial institutions, with operations in over 50 countries.',
      category: 'business'
    },
    {
      title: 'Startup Raises Record $2 Billion in Series C Funding',
      source: { name: 'Venture Capital News', url: 'https://example.com/business4' },
      url: 'https://example.com/business4',
      publishedAt: new Date(),
      content: 'The AI-focused startup has secured the largest Series C funding round in history, valuing the company at over $15 billion.',
      category: 'business'
    },
    {
      title: 'New Labor Laws to Impact Gig Economy Workers',
      source: { name: 'Employment Today', url: 'https://example.com/business5' },
      url: 'https://example.com/business5',
      publishedAt: new Date(),
      content: 'Legislation set to take effect next month will require companies to provide additional benefits to contract and gig workers.',
      category: 'business'
    }
  ],
  politics: [
    {
      title: 'Senate Passes Landmark Infrastructure Bill',
      source: { name: 'Capitol News', url: 'https://example.com/politics1' },
      url: 'https://example.com/politics1',
      publishedAt: new Date(),
      content: 'The $1.2 trillion infrastructure package includes funding for roads, bridges, public transit, and broadband internet access.',
      category: 'politics'
    },
    {
      title: 'International Climate Summit Reaches New Emissions Agreement',
      source: { name: 'Global Policy', url: 'https://example.com/politics2' },
      url: 'https://example.com/politics2',
      publishedAt: new Date(),
      content: 'World leaders have committed to more aggressive carbon reduction targets, aiming to limit global warming to 1.5 degrees Celsius.',
      category: 'politics'
    },
    {
      title: 'Supreme Court Rules on Landmark Privacy Case',
      source: { name: 'Legal Affairs', url: 'https://example.com/politics3' },
      url: 'https://example.com/politics3',
      publishedAt: new Date(),
      content: 'The ruling establishes new precedents for digital privacy rights and limits on government surveillance programs.',
      category: 'politics'
    },
    {
      title: 'Election Reform Bill Advances to Senate Floor',
      source: { name: 'Democracy Watch', url: 'https://example.com/politics4' },
      url: 'https://example.com/politics4',
      publishedAt: new Date(),
      content: 'The proposed legislation would expand voting access and implement new campaign finance regulations.',
      category: 'politics'
    },
    {
      title: 'New Trade Agreement Signed Between Major Economies',
      source: { name: 'International Trade', url: 'https://example.com/politics5' },
      url: 'https://example.com/politics5',
      publishedAt: new Date(),
      content: 'The comprehensive trade deal eliminates tariffs on thousands of products and establishes new labor and environmental standards.',
      category: 'politics'
    }
  ],
  entertainment: [
    {
      title: 'Blockbuster Film Breaks Opening Weekend Records',
      source: { name: 'Entertainment Weekly', url: 'https://example.com/entertainment1' },
      url: 'https://example.com/entertainment1',
      publishedAt: new Date(),
      content: 'The highly anticipated sequel has shattered box office records, grossing over $300 million in its opening weekend.',
      category: 'entertainment'
    },
    {
      title: 'Streaming Service Announces New Original Series',
      source: { name: 'TV Guide', url: 'https://example.com/entertainment2' },
      url: 'https://example.com/entertainment2',
      publishedAt: new Date(),
      content: 'The sci-fi drama series will feature an all-star cast and is set to premiere next month.',
      category: 'entertainment'
    },
    {
      title: 'Music Festival Announces Lineup for Next Year',
      source: { name: 'Music News', url: 'https://example.com/entertainment3' },
      url: 'https://example.com/entertainment3',
      publishedAt: new Date(),
      content: 'The three-day festival will feature performances from over 100 artists across multiple genres.',
      category: 'entertainment'
    },
    {
      title: 'Acclaimed Author Releases Long-Awaited Novel',
      source: { name: 'Literary Review', url: 'https://example.com/entertainment4' },
      url: 'https://example.com/entertainment4',
      publishedAt: new Date(),
      content: 'The novel, which comes 10 years after the author\'s last publication, has already received critical acclaim.',
      category: 'entertainment'
    },
    {
      title: 'Virtual Reality Art Exhibition Opens to Global Audience',
      source: { name: 'Arts Today', url: 'https://example.com/entertainment5' },
      url: 'https://example.com/entertainment5',
      publishedAt: new Date(),
      content: 'The innovative exhibition allows visitors from around the world to experience immersive art installations in a virtual space.',
      category: 'entertainment'
    }
  ],
  sports: [
    {
      title: 'Underdog Team Wins Championship in Stunning Upset',
      source: { name: 'Sports Center', url: 'https://example.com/sports1' },
      url: 'https://example.com/sports1',
      publishedAt: new Date(),
      content: 'The team overcame a 20-point deficit in the final quarter to secure their first championship title in franchise history.',
      category: 'sports'
    },
    {
      title: 'Star Athlete Signs Record-Breaking Contract',
      source: { name: 'Sports Business', url: 'https://example.com/sports2' },
      url: 'https://example.com/sports2',
      publishedAt: new Date(),
      content: 'The 10-year, $500 million contract is the largest in the sport\'s history and includes numerous performance incentives.',
      category: 'sports'
    },
    {
      title: 'Olympic Committee Announces New Sports for 2028 Games',
      source: { name: 'Olympic News', url: 'https://example.com/sports3' },
      url: 'https://example.com/sports3',
      publishedAt: new Date(),
      content: 'The committee has added three new sports to the Olympic program, responding to growing global interest.',
      category: 'sports'
    },
    {
      title: 'Legendary Coach Announces Retirement After 30-Year Career',
      source: { name: 'Coaching Digest', url: 'https://example.com/sports4' },
      url: 'https://example.com/sports4',
      publishedAt: new Date(),
      content: 'The Hall of Fame coach leaves behind a legacy of 5 championships and over 800 career victories.',
      category: 'sports'
    },
    {
      title: 'New Technology Revolutionizes Sports Training and Analytics',
      source: { name: 'Sports Tech', url: 'https://example.com/sports5' },
      url: 'https://example.com/sports5',
      publishedAt: new Date(),
      content: 'Teams are adopting AI-powered analytics systems that provide real-time performance data and injury prevention insights.',
      category: 'sports'
    }
  ],
  science: [
    {
      title: 'Astronomers Discover Earth-like Planet in Habitable Zone',
      source: { name: 'Astronomy Today', url: 'https://example.com/science1' },
      url: 'https://example.com/science1',
      publishedAt: new Date(),
      content: 'The newly discovered exoplanet orbits a sun-like star and shows signs of having an atmosphere and liquid water.',
      category: 'science'
    },
    {
      title: 'Breakthrough in Gene Editing Shows Promise for Treating Genetic Diseases',
      source: { name: 'Medical Science', url: 'https://example.com/science2' },
      url: 'https://example.com/science2',
      publishedAt: new Date(),
      content: 'Researchers have developed a more precise CRISPR technique that could lead to treatments for previously incurable genetic disorders.',
      category: 'science'
    },
    {
      title: 'New Particle Discovered at Large Hadron Collider',
      source: { name: 'Physics Journal', url: 'https://example.com/science3' },
      url: 'https://example.com/science3',
      publishedAt: new Date(),
      content: 'The discovery challenges aspects of the Standard Model and may provide insights into dark matter.',
      category: 'science'
    },
    {
      title: 'Marine Biologists Document Previously Unknown Deep-Sea Ecosystem',
      source: { name: 'Ocean Science', url: 'https://example.com/science4' },
      url: 'https://example.com/science4',
      publishedAt: new Date(),
      content: 'The expedition discovered dozens of new species living around deep-sea thermal vents.',
      category: 'science'
    },
    {
      title: 'Climate Scientists Develop More Accurate Prediction Models',
      source: { name: 'Climate Research', url: 'https://example.com/science5' },
      url: 'https://example.com/science5',
      publishedAt: new Date(),
      content: 'The new models incorporate additional variables and have demonstrated 40% greater accuracy in predicting climate patterns.',
      category: 'science'
    }
  ],
  health: [
    {
      title: 'New Treatment Shows Promise for Alzheimer\'s Disease',
      source: { name: 'Medical Journal', url: 'https://example.com/health1' },
      url: 'https://example.com/health1',
      publishedAt: new Date(),
      content: 'Clinical trials of the new drug have shown significant reduction in cognitive decline among early-stage patients.',
      category: 'health'
    },
    {
      title: 'Study Reveals Benefits of Intermittent Fasting',
      source: { name: 'Nutrition Science', url: 'https://example.com/health2' },
      url: 'https://example.com/health2',
      publishedAt: new Date(),
      content: 'The long-term study found improvements in metabolic health and longevity among participants following various intermittent fasting protocols.',
      category: 'health'
    },
    {
      title: 'Mental Health Awareness Campaign Launches Nationwide',
      source: { name: 'Psychology Today', url: 'https://example.com/health3' },
      url: 'https://example.com/health3',
      publishedAt: new Date(),
      content: 'The initiative aims to reduce stigma and improve access to mental health resources across communities.',
      category: 'health'
    },
    {
      title: 'Wearable Technology Advances Remote Patient Monitoring',
      source: { name: 'Digital Health', url: 'https://example.com/health4' },
      url: 'https://example.com/health4',
      publishedAt: new Date(),
      content: 'New devices can track vital signs and alert healthcare providers to potential issues before they become emergencies.',
      category: 'health'
    },
    {
      title: 'Global Vaccination Campaign Reaches Milestone',
      source: { name: 'Public Health News', url: 'https://example.com/health5' },
      url: 'https://example.com/health5',
      publishedAt: new Date(),
      content: 'The international effort has successfully immunized over 80% of the target population against multiple preventable diseases.',
      category: 'health'
    }
  ],
  local: [
    {
      title: 'Local Community Center Renovation Completed',
      source: { name: 'Local News', url: 'https://example.com/local1' },
      url: 'https://example.com/local1',
      publishedAt: new Date(),
      content: 'The newly renovated community center features state-of-the-art facilities and will host various programs for residents of all ages.',
      category: 'local'
    },
    {
      title: 'City Council Approves New Public Transportation Plan',
      source: { name: 'City News', url: 'https://example.com/local2' },
      url: 'https://example.com/local2',
      publishedAt: new Date(),
      content: 'The comprehensive plan includes expanded bus routes, new bike lanes, and infrastructure improvements to reduce traffic congestion.',
      category: 'local'
    },
    {
      title: 'Local School District Implements Innovative STEM Program',
      source: { name: 'Education News', url: 'https://example.com/local3' },
      url: 'https://example.com/local3',
      publishedAt: new Date(),
      content: 'The program provides students with hands-on experience in robotics, coding, and engineering through partnerships with local technology companies.',
      category: 'local'
    },
    {
      title: 'Farmers Market Expands to Year-Round Operation',
      source: { name: 'Community Post', url: 'https://example.com/local4' },
      url: 'https://example.com/local4',
      publishedAt: new Date(),
      content: 'The popular market will now operate indoors during winter months, providing continued access to local produce and artisanal goods.',
      category: 'local'
    },
    {
      title: 'Historic Building Restoration Project Receives Funding',
      source: { name: 'Heritage Times', url: 'https://example.com/local5' },
      url: 'https://example.com/local5',
      publishedAt: new Date(),
      content: 'The $2 million grant will fund the restoration of the 150-year-old landmark, preserving an important piece of local history.',
      category: 'local'
    }
  ]
};

/**
 * Fetch top headlines from NewsAPI.org
 * @param {string} category - News category (general, business, technology, etc.)
 * @returns {Promise<Array>} - Array of news articles
 */
const fetchTopHeadlines = async (category = 'general', count = 10) => {
  try {
    const tasks = [];

    if (WEBZIO_API_KEY) tasks.push(fetchFromWebz(category, count));
    if (NEWS_API_KEY) tasks.push(fetchFromNewsApiOrg(category, count));
    if (GNEWS_API_KEY) tasks.push(fetchFromGNews(category, count));
    if (THE_NEWS_API_KEY) tasks.push(fetchFromTheNewsApi(category, count));

    if (tasks.length === 0) {
      console.warn('No news providers configured.');
      return [];
    }

    const settled = await Promise.allSettled(tasks);
    const results = settled
      .filter(r => r.status === 'fulfilled' && Array.isArray(r.value))
      .flatMap(r => r.value);

    const deduped = dedupeArticles(results).slice(0, count);
    console.log(`Aggregated ${deduped.length} unique articles for category ${category}`);
    return deduped;
  } catch (error) {
    console.error('Error fetching news:', error.message);
    return [];
  }
};

/**
 * Fetch articles from Webz.io
 * @param {string} category - News category
 * @returns {Promise<Array>} - Array of news articles
 */
const fetchFromWebz = async (category = 'general', count = 10) => {
  try {
    const response = await http.get(WEBZIO_API_URL, {
      params: {
        token: WEBZIO_API_KEY,
        q: `site_type:news AND language:english AND category:${category}`,
        sort: 'published',
        size: Math.max(count * 2, 20)
      }
    });

    const posts = response.data?.posts || response.data?.articles || [];

    if (!Array.isArray(posts) || posts.length === 0) {
      console.log('Webz.io returned no posts');
      return [];
    }

    return posts.map((post, index) => makeArticle({
      provider: 'webz',
      title: post.title || 'Untitled Article',
      url: post.url || post.thread?.url || post.canonical_url || post.link,
      sourceName: post.thread?.site_full || post.source?.title || 'Unknown Source',
      sourceUrl: post.thread?.site || post.url,
      publishedAt: post.published,
      content: post.text || post.excerpt || post.summary || '',
      category,
      index
    }));
  } catch (error) {
    console.error('Error calling Webz.io:', error.message);
    return [];
  }
};

/**
 * Fetch articles from NewsAPI.org
 * @param {string} category - News category
 * @param {number} count - Desired number of articles
 * @returns {Promise<Array>} - Array of news articles
 */
const fetchFromNewsApiOrg = async (category = 'general', count = 10) => {
  try {
    const params = {
      apiKey: NEWS_API_KEY,
      country: 'us',
      pageSize: Math.max(count * 2, 20)
    };

    if (category && category !== 'all') {
      params.category = category;
    }

    const response = await http.get(`${NEWS_API_URL}/top-headlines`, { params });
    const articles = response.data?.articles || [];

    if (!Array.isArray(articles) || articles.length === 0) {
      console.log('NewsAPI.org returned no articles');
      return [];
    }

    return articles.map((article, index) => makeArticle({
      provider: 'newsapi',
      title: article.title,
      url: article.url,
      sourceName: article.source?.name || article.author || 'NewsAPI',
      sourceUrl: article.url,
      publishedAt: article.publishedAt || article.published_at || article.date,
      content: article.content || article.description || '',
      category,
      index
    }));
  } catch (error) {
    console.error('Error calling NewsAPI.org:', error.message);
    return [];
  }
};

/**
 * Fetch articles from GNews
 * @param {string} category - News category
 * @param {number} count - Desired number of articles
 * @returns {Promise<Array>} - Array of news articles
 */
const fetchFromGNews = async (category = 'general', count = 10) => {
  try {
    const topic = mapCategoryToGNewsTopic(category);
    const response = await http.get(`${GNEWS_API_URL}/top-headlines`, {
      params: {
        apikey: GNEWS_API_KEY,
        lang: 'en',
        country: 'us',
        topic,
        max: Math.min(Math.max(count * 2, 10), 50)
      }
    });

    const articles = response.data?.articles || [];

    if (!Array.isArray(articles) || articles.length === 0) {
      console.log('GNews returned no articles');
      return [];
    }

    return articles.map((article, index) => makeArticle({
      provider: 'gnews',
      title: article.title,
      url: article.url,
      sourceName: article.source?.name || 'GNews',
      sourceUrl: article.source?.url || article.url,
      publishedAt: article.publishedAt || article.published_at || article.published,
      content: article.description || article.content || article.summary || '',
      category,
      index
    }));
  } catch (error) {
    console.error('Error calling GNews:', error.message);
    return [];
  }
};

/**
 * Fetch articles from TheNewsAPI
 * @param {string} category - News category
 * @param {number} count - Desired number of articles
 * @returns {Promise<Array>} - Array of news articles
 */
const fetchFromTheNewsApi = async (category = 'general', count = 10) => {
  try {
    const categories = mapCategoryToTheNewsApi(category);
    const response = await http.get(`${THE_NEWS_API_URL}/top`, {
      params: {
        locale: 'us',
        language: 'en',
        categories,
        api_token: THE_NEWS_API_KEY,
        limit: Math.max(count * 2, 20)
      }
    });

    const articles = response.data?.data || [];

    if (!Array.isArray(articles) || articles.length === 0) {
      console.log('TheNewsAPI returned no articles');
      return [];
    }

    return articles.map((article, index) => makeArticle({
      provider: 'thenewsapi',
      title: article.title,
      url: article.url,
      sourceName: (article.source && (article.source.title || article.source.name)) || article.source || 'TheNewsAPI',
      sourceUrl: (article.source && article.source.url) || article.url,
      publishedAt: article.published_at || article.date,
      content: article.snippet || article.description || article.content || '',
      category,
      index
    }));
  } catch (error) {
    console.error('Error calling TheNewsAPI:', error.message);
    return [];
  }
};

/**
 * Get mock articles for a category
 * @param {string} category - News category
 * @returns {Array} - Array of mock articles
 */
const getMockArticles = (category = 'general') => {
  console.log(`Getting mock articles for category: ${category}`);

  // If we have mock articles for this category, use them
  if (MOCK_ARTICLES[category]) {
    return MOCK_ARTICLES[category].map((article, index) => ({
      _id: `mock-${Date.now()}-${index}`,
      title: article.title,
      source: article.source,
      url: article.url,
      publishedAt: article.publishedAt,
      content: article.content,
      category: article.category,
      perspectives: []
    }));
  }

  // Otherwise, fall back to general category
  return MOCK_ARTICLES.general.map((article, index) => ({
    _id: `mock-${Date.now()}-${index}`,
    title: article.title,
    source: article.source,
    url: article.url,
    publishedAt: article.publishedAt,
    content: article.content,
    category: category, // Use the requested category
    perspectives: []
  }));
};

/**
 * Get a random selection of news articles
 * @param {number} count - Number of random articles to return
 * @param {string} category - News category
 * @returns {Promise<Array>} - Array of random news articles
 */
const getRandomArticles = async (count = 10, category = 'general') => {
  try {
    const articles = await fetchTopHeadlines(category, count);

    // Shuffle the articles and return the requested count
    return shuffleArray(articles).slice(0, count);
  } catch (error) {
    console.error('Error getting random articles:', error.message);
    // Return empty array instead of mock data for production behavior
    return [];
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
 * Fetch local news by zip code
 * @param {string} zipCode - US zip code to search for local news
 * @param {number} count - Number of articles to return
 * @returns {Promise<Array>} - Array of local news articles
 */
const fetchLocalNews = async (zipCode, count = 5) => {
  try {
    console.log(`Fetching local news for zip code: ${zipCode}`);

    // Import the generateLocalNews function from summaryService
    const { generateLocalNews } = require('./summaryService');

    // Generate local news using ChatGPT with current timestamp
    const chatGptArticles = await generateLocalNews(zipCode, count);

    // If we got articles from ChatGPT, ensure they have fresh timestamps
    if (chatGptArticles && chatGptArticles.length > 0) {
      console.log(`Generated ${chatGptArticles.length} local articles using ChatGPT`);

      // Ensure all articles have current timestamps
      const currentDate = new Date();
      const freshArticles = chatGptArticles.map(article => ({
        ...article,
        publishedAt: currentDate, // Set to current date to ensure freshness
        _id: `local-gpt-${Date.now()}-${Math.floor(Math.random() * 1000)}` // Generate unique ID with current timestamp
      }));

      console.log('Ensured all local articles have fresh timestamps');
      return freshArticles;
    }

    // If ChatGPT failed, fall back to mock data with current timestamps
    console.log('No articles generated by ChatGPT, falling back to mock data with fresh timestamps');
    return getMockLocalArticles(zipCode, count);
  } catch (error) {
    console.error('Error fetching local news:', error.message);
    // Always return some data to prevent the application from breaking
    return getMockLocalArticles(zipCode, count);
  }
};

/**
 * Get mock local articles for a zip code
 * @param {string} zipCode - Zip code to use for local news
 * @param {number} count - Number of articles to return
 * @returns {Array} - Array of mock local articles
 */
const getMockLocalArticles = (zipCode, count = 5) => {
  console.log(`Getting mock local articles for zip code: ${zipCode}`);

  // Create some zip code specific mock articles
  const zipSpecificArticles = [
    {
      title: `New Community Center Opens in ${zipCode} Area`,
      source: { name: 'Local News Network', url: 'https://example.com/local1' },
      url: 'https://example.com/local1',
      publishedAt: new Date(),
      content: `Residents of the ${zipCode} area now have access to a state-of-the-art community center featuring recreational facilities, meeting spaces, and educational programs.`,
      category: 'local'
    },
    {
      title: `${zipCode} School District Announces Curriculum Changes`,
      source: { name: 'Education Today', url: 'https://example.com/local2' },
      url: 'https://example.com/local2',
      publishedAt: new Date(),
      content: `The school district serving ${zipCode} has unveiled a new curriculum that emphasizes STEM education and practical life skills.`,
      category: 'local'
    }
  ];

  // Combine with general local articles
  const allLocalArticles = [...zipSpecificArticles, ...MOCK_ARTICLES.local];

  // Map and return the requested number with fresh timestamps
  const currentDate = new Date();
  return allLocalArticles.slice(0, count).map((article, index) => ({
    _id: `mock-local-${Date.now()}-${Math.floor(Math.random() * 1000)}-${index}`,
    title: article.title,
    source: article.source,
    url: article.url,
    publishedAt: currentDate, // Always use current date for freshness
    content: article.content,
    category: 'local',
    perspectives: []
  }));
};

module.exports = {
  fetchTopHeadlines,
  getRandomArticles,
  fetchLocalNews,
  fetchFromWebz,
  fetchFromNewsApiOrg,
  fetchFromGNews,
  fetchFromTheNewsApi
};
