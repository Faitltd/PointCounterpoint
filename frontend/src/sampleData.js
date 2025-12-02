// Sample data for the PointCounterpoint application
// This file contains embedded sample data to use when the API is unavailable

// Sample articles by category
export const sampleArticles = {
  general: [
    {
      id: "sample-general-1",
      title: "New Climate Change Policy Announced",
      source: { name: "Climate News" },
      published_at: new Date().toISOString(),
      content: "The government announced a new climate change policy today that aims to reduce carbon emissions by 50% by 2030.",
      perspectives: [
        {
          viewpoint: "point",
          summary: "The new climate policy represents a crucial step forward in addressing the urgent climate crisis. By setting ambitious targets, the government is showing leadership on an issue that requires immediate action."
        },
        {
          viewpoint: "counterpoint",
          summary: "While climate change is a concern, this policy may place undue burden on businesses and could lead to job losses in key industries. The rapid timeline for implementation doesn't allow sufficient transition periods for affected sectors."
        },
        {
          viewpoint: "neutral",
          summary: "The new policy sets a 50% emissions reduction target by 2030, implementing both renewable energy incentives and carbon taxes."
        }
      ]
    },
    {
      id: "sample-general-2",
      title: "Global Economic Summit Concludes with New Agreements",
      source: { name: "Business Daily" },
      published_at: new Date().toISOString(),
      content: "World leaders reached several key agreements at the conclusion of the Global Economic Summit yesterday.",
      perspectives: [
        {
          viewpoint: "point",
          summary: "The summit represents a diplomatic triumph that will strengthen international cooperation and economic stability."
        },
        {
          viewpoint: "counterpoint",
          summary: "While the summit produced agreements, it failed to address several critical issues facing the global economy."
        },
        {
          viewpoint: "neutral",
          summary: "The summit concluded with agreements on international trade, climate finance, and digital economy regulations."
        }
      ]
    }
  ],
  technology: [
    {
      id: "sample-tech-1",
      title: "Tech Company Launches Revolutionary Product",
      source: { name: "Tech Today" },
      published_at: new Date().toISOString(),
      content: "A leading tech company has unveiled a groundbreaking new product that promises to transform the industry.",
      perspectives: [
        {
          viewpoint: "point",
          summary: "This product represents a significant leap forward in technology that could benefit millions of users worldwide."
        },
        {
          viewpoint: "counterpoint",
          summary: "Despite the excitement, there are legitimate concerns about this new technology."
        },
        {
          viewpoint: "neutral",
          summary: "The new product integrates artificial intelligence with custom hardware, featuring a neural processing unit."
        }
      ]
    },
    {
      id: "sample-tech-2",
      title: "New AI Research Breakthrough Announced",
      source: { name: "Science Daily" },
      published_at: new Date().toISOString(),
      content: "Researchers have announced a major breakthrough in artificial intelligence that could revolutionize multiple industries.",
      perspectives: [
        {
          viewpoint: "point",
          summary: "This breakthrough represents years of dedicated research and opens up new possibilities for AI applications."
        },
        {
          viewpoint: "counterpoint",
          summary: "The rapid advancement of AI technology raises important ethical questions that need to be addressed."
        },
        {
          viewpoint: "neutral",
          summary: "The research team has developed a new algorithm that significantly improves machine learning efficiency."
        }
      ]
    }
  ],
  business: [
    {
      id: "sample-business-1",
      title: "Major Merger Announced Between Industry Leaders",
      source: { name: "Financial Times" },
      published_at: new Date().toISOString(),
      content: "Two industry giants have announced plans to merge in a deal valued at billions of dollars.",
      perspectives: [
        {
          viewpoint: "point",
          summary: "This merger creates a stronger company that can better compete in the global marketplace."
        },
        {
          viewpoint: "counterpoint",
          summary: "The consolidation raises concerns about reduced competition and potential impacts on consumers."
        },
        {
          viewpoint: "neutral",
          summary: "The merger, valued at $45 billion, is expected to be completed within six months pending regulatory approval."
        }
      ]
    }
  ]
};

// Sample article details by ID
export const sampleArticleDetails = {
  "sample-general-1": {
    id: "sample-general-1",
    title: "New Climate Change Policy Announced",
    source: { name: "Climate News" },
    published_at: new Date().toISOString(),
    content: "The government announced a new climate change policy today that aims to reduce carbon emissions by 50% by 2030. The comprehensive plan includes investments in renewable energy, carbon taxes, and new regulations for industries.",
    perspectives: [
      {
        viewpoint: "point",
        summary: "The new climate policy represents a crucial step forward in addressing the urgent climate crisis. By setting ambitious targets, the government is showing leadership on an issue that requires immediate action. According to the International Climate Institute, policies with similar emission reduction targets have been effective in other countries without significant economic disruption. The combination of incentives and regulations creates a balanced approach that can drive innovation while ensuring accountability."
      },
      {
        viewpoint: "counterpoint",
        summary: "While climate change is a concern, this policy may place undue burden on businesses and could lead to job losses in key industries. The rapid timeline for implementation doesn't allow sufficient transition periods for affected sectors. Research from the Economic Policy Center suggests that more gradual approaches to emissions reduction can achieve similar environmental outcomes while better protecting economic stability. A more balanced policy might include longer implementation timelines and additional support for affected industries."
      },
      {
        viewpoint: "neutral",
        summary: "The new policy sets a 50% emissions reduction target by 2030, implementing both renewable energy incentives and carbon taxes. The plan includes specific measures for different sectors of the economy, with particular focus on energy production, transportation, and industrial manufacturing."
      }
    ]
  },
  "sample-general-2": {
    id: "sample-general-2",
    title: "Global Economic Summit Concludes with New Agreements",
    source: { name: "Business Daily" },
    published_at: new Date().toISOString(),
    content: "World leaders reached several key agreements at the conclusion of the Global Economic Summit yesterday. The agreements focus on trade relations, climate finance, and digital economy regulations that will shape international commerce for years to come.",
    perspectives: [
      {
        viewpoint: "point",
        summary: "The summit represents a diplomatic triumph that will strengthen international cooperation and economic stability. The trade agreements reduce barriers that have hindered global commerce, while the climate finance provisions ensure that developing nations receive support for sustainable growth. Economic analysts project that these agreements could boost global GDP by 0.5% over the next five years."
      },
      {
        viewpoint: "counterpoint",
        summary: "While the summit produced agreements, it failed to address several critical issues facing the global economy. The trade provisions favor larger economies while offering limited benefits to smaller nations. Labor representatives note that worker protections were largely absent from the discussions. Additionally, the climate finance commitments fall short of what experts say is needed to meet global environmental goals."
      },
      {
        viewpoint: "neutral",
        summary: "The summit concluded with agreements on international trade, climate finance, and digital economy regulations. Leaders from 20 countries participated in the week-long negotiations, resulting in a 30-page joint statement outlining implementation timelines and enforcement mechanisms."
      }
    ]
  },
  "sample-tech-1": {
    id: "sample-tech-1",
    title: "Tech Company Launches Revolutionary Product",
    source: { name: "Tech Today" },
    published_at: new Date().toISOString(),
    content: "A leading tech company has unveiled a groundbreaking new product that promises to transform the industry. The device combines artificial intelligence with advanced hardware to create new possibilities for consumers and businesses alike.",
    perspectives: [
      {
        viewpoint: "point",
        summary: "This product represents a significant leap forward in technology that could benefit millions of users worldwide. The integration of cutting-edge AI with accessible hardware democratizes advanced technology. Industry experts note that similar innovations have historically created more jobs than they've displaced. The company's commitment to privacy features also addresses many concerns about data security."
      },
      {
        viewpoint: "counterpoint",
        summary: "Despite the excitement, there are legitimate concerns about this new technology. The rapid advancement of AI raises questions about job displacement in certain sectors. Privacy advocates have identified potential vulnerabilities in similar systems that could compromise user data. Additionally, the high price point may exacerbate digital inequality, creating a technology gap between those who can afford the latest innovations and those who cannot."
      },
      {
        viewpoint: "neutral",
        summary: "The new product integrates artificial intelligence with custom hardware, featuring a neural processing unit capable of 15 trillion operations per second. It will be available in three configurations at different price points, with the base model starting at $999."
      }
    ]
  }
};

// Sample writing style perspectives
export const writingStylePerspectives = {
  "hunter_s_thompson": [
    {
      viewpoint: "point",
      summary: "By God, this is the kind of madness that makes perfect sense in our savage journey through the American Dream! Anyone with half a brain cell can see the raw truth here. The facts are clear as crystal meth to those brave enough to face them. Only a fool or a coward would deny the obvious reality staring us in the face like some kind of terrible lizard on the edge of the desert highway."
    },
    {
      viewpoint: "counterpoint",
      summary: "Those spineless bastards in their three-piece suits will tell you otherwise, of course. They'll feed you the same sanitized garbage they always do, wrapped in fancy words and false promises. It's the same old song and dance from the same old swine who've been running this circus since before we were born. Don't buy their snake oil for a second!"
    },
    {
      viewpoint: "neutral",
      summary: "The situation presents multiple angles worth considering, though the facts themselves stand independent of interpretation. When the dust settles, history will make its own judgments beyond our current perspective."
    }
  ],
  "dorothy_parker": [
    {
      viewpoint: "point",
      summary: "One might say this development is precisely what we deserve—a perfect reflection of our collective wisdom, or lack thereof. If we wanted better outcomes, perhaps we should have made better choices. But that would require foresight, and foresight is so terribly unfashionable these days."
    },
    {
      viewpoint: "counterpoint",
      summary: "The opposing view, charming in its naïveté, suggests we should embrace this with open arms. How delightful to witness such unbridled optimism! One almost hates to point out the obvious flaws, but someone must—preferably before we all march cheerfully off the cliff's edge."
    },
    {
      viewpoint: "neutral",
      summary: "The matter presents various considerations that reasonable minds might weigh differently, depending on their values and priorities."
    }
  ],
  "carl_sagan": [
    {
      viewpoint: "point",
      summary: "In the vast cosmic arena, we see a pattern emerging—one that connects to the fundamental principles that govern our universe. The evidence, carefully gathered and scrutinized, points toward a conclusion that aligns with our understanding of how complex systems evolve and interact. We are witnessing not an isolated incident, but part of a grand tapestry of cause and effect that extends far beyond our immediate perception."
    },
    {
      viewpoint: "counterpoint",
      summary: "Yet we must consider alternative explanations with equal rigor. The cosmos teaches us humility—a reminder that our most cherished theories must always remain open to revision in light of new evidence. Some data suggests a different interpretation, one that challenges our assumptions and invites us to expand our conceptual framework. The beauty of science lies in this tension between what we think we know and what we have yet to discover."
    },
    {
      viewpoint: "neutral",
      summary: "The available evidence presents multiple interpretations, each with supporting data points. Further investigation may clarify which model best explains the observed phenomena."
    }
  ],
  "eli5": [
    {
      viewpoint: "point",
      summary: "Imagine you have a toy that everyone wants to play with. Some people think it's good to share the toy with everyone, taking turns. They say this way, everyone gets to have fun, and nobody feels left out. It's like when you share your cookies with friends—everyone gets some and everyone's happy!"
    },
    {
      viewpoint: "counterpoint",
      summary: "But some people think differently. They say if too many kids play with the toy, it might break faster. Or maybe some kids won't be careful with it. It's like when you have a special drawing—sometimes you don't want everyone touching it because they might accidentally mess it up, even if they don't mean to."
    },
    {
      viewpoint: "neutral",
      summary: "This is about people having different ideas about the best way to handle something important. Both sides care about making things good, but they have different thoughts about how to do it."
    }
  ]
};
