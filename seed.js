const mongoose = require('mongoose');
const Article = require('./models/Article');
require('dotenv').config();

// Sample articles data
const sampleArticles = [
  {
    title: 'New Climate Change Policy Announced',
    source: {
      name: 'Climate News',
      url: 'https://example.com/climate'
    },
    url: 'https://example.com/climate/policy',
    publishedAt: new Date(),
    content: 'The government announced a new climate change policy today that aims to reduce carbon emissions by 50% by 2030. The policy includes incentives for renewable energy and taxes on carbon emissions. Environmental groups have praised the move, while some industry leaders have expressed concerns about economic impacts.',
    category: 'general',
    perspectives: [
      {
        viewpoint: 'liberal',
        summary: 'The new climate policy represents a crucial step forward in addressing the urgent climate crisis. This bold action will help protect our planet for future generations while creating new green jobs.'
      },
      {
        viewpoint: 'conservative',
        summary: 'While climate change is a concern, this policy may place undue burden on businesses and could lead to job losses in traditional energy sectors. A more balanced approach considering economic impacts is needed.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The new policy sets a 50% emissions reduction target by 2030, implementing both renewable energy incentives and carbon taxes. Various stakeholders have different views on the potential environmental and economic impacts.'
      }
    ]
  },
  {
    title: 'Tech Company Announces New AI Product',
    source: {
      name: 'Tech Today',
      url: 'https://example.com/tech'
    },
    url: 'https://example.com/tech/ai-product',
    publishedAt: new Date(),
    content: 'A major tech company unveiled its latest artificial intelligence product today, claiming it will revolutionize how businesses operate. The AI system can automate complex tasks and provide insights from large datasets. Privacy advocates have raised concerns about data collection practices.',
    category: 'technology',
    perspectives: [
      {
        viewpoint: 'liberal',
        summary: 'While technological advancement is important, we must ensure AI development includes strong privacy protections and considers potential impacts on workers who may be displaced by automation.'
      },
      {
        viewpoint: 'conservative',
        summary: 'This innovation demonstrates the power of free market competition to drive technological progress. Businesses should be allowed to develop AI with minimal regulatory interference to maintain competitive advantage.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The new AI product offers automation capabilities for complex business tasks and data analysis. The announcement has sparked discussion about balancing innovation with privacy concerns and workforce impacts.'
      }
    ]
  },
  {
    title: 'Healthcare Reform Bill Passes Senate',
    source: {
      name: 'Politics Daily',
      url: 'https://example.com/politics'
    },
    url: 'https://example.com/politics/healthcare-bill',
    publishedAt: new Date(),
    content: 'The Senate passed a major healthcare reform bill today with a vote of 52-48. The bill aims to expand coverage and reduce prescription drug costs. Supporters claim it will help millions of uninsured Americans, while critics argue it will increase government spending and raise taxes.',
    category: 'politics',
    perspectives: [
      {
        viewpoint: 'liberal',
        summary: 'This historic healthcare reform will finally ensure that healthcare is treated as a right, not a privilege. Expanding coverage to vulnerable populations will create a more equitable society.'
      },
      {
        viewpoint: 'conservative',
        summary: 'The bill represents government overreach into healthcare that will increase the national debt and potentially reduce quality of care. Market-based solutions would be more effective and fiscally responsible.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The healthcare bill passed with a 52-48 vote and includes provisions for expanded coverage and lower prescription drug prices. The legislation has generated debate about healthcare access, costs, and the appropriate role of government.'
      }
    ]
  },
  {
    title: 'Stock Market Reaches Record High',
    source: {
      name: 'Financial Times',
      url: 'https://example.com/finance'
    },
    url: 'https://example.com/finance/stock-record',
    publishedAt: new Date(),
    content: 'The stock market reached an all-time high today, with the main index closing up 2.3%. Analysts attribute the gains to strong corporate earnings and optimism about economic growth. However, some economists warn about potential market volatility and inflation concerns.',
    category: 'business',
    perspectives: [
      {
        viewpoint: 'liberal',
        summary: 'While the market is performing well, we must remember that stock gains primarily benefit the wealthy. More focus is needed on ensuring economic growth translates to better wages and conditions for workers.'
      },
      {
        viewpoint: 'conservative',
        summary: 'The record market performance demonstrates the strength of the economy under pro-business policies. Continued deregulation and tax cuts will further stimulate growth and prosperity.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The stock market index rose 2.3% to a record high, driven by strong earnings reports and economic optimism. Some analysts caution about potential inflation and market volatility in the coming months.'
      }
    ]
  },
  {
    title: 'New Study on Mental Health Benefits of Exercise',
    source: {
      name: 'Health Journal',
      url: 'https://example.com/health'
    },
    url: 'https://example.com/health/exercise-mental-health',
    publishedAt: new Date(),
    content: 'A new study published today found that regular exercise can significantly reduce symptoms of anxiety and depression. The research followed 5,000 participants over three years and found that those who exercised at least 150 minutes per week reported better mental health outcomes.',
    category: 'health',
    perspectives: [
      {
        viewpoint: 'liberal',
        summary: 'This research highlights the need for community-based exercise programs and public spaces that are accessible to all. Mental healthcare should be approached holistically and be available regardless of socioeconomic status.'
      },
      {
        viewpoint: 'conservative',
        summary: 'The study shows that individuals can take personal responsibility for their mental health through lifestyle choices like exercise. This approach is preferable to reliance on medication or government programs.'
      },
      {
        viewpoint: 'neutral',
        summary: 'The three-year study of 5,000 participants found that 150 minutes of weekly exercise correlated with improved mental health outcomes, particularly for anxiety and depression symptoms. The research adds to growing evidence about physical activity's psychological benefits.'
      }
    ]
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    try {
      // Clear existing articles
      await Article.deleteMany({});
      console.log('Cleared existing articles');
      
      // Insert sample articles
      const result = await Article.insertMany(sampleArticles);
      console.log(`Added ${result.length} sample articles`);
      
      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
