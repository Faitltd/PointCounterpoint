/**
 * Test script for the parseAnalysisResponse function
 */

// Define the parseAnalysisResponse function directly
const parseAnalysisResponse = (response) => {
  // Initialize with empty values
  const result = {
    liberal: '',
    conservative: '',
    neutral: ''
  };

  // Try to extract Liberal Perspective
  const liberalMatch = response.match(/Liberal Perspective([\s\S]*?)(?=Conservative Perspective|$)/i);
  if (liberalMatch && liberalMatch[1]) {
    result.liberal = liberalMatch[1].trim();
  }

  // Try to extract Conservative Perspective
  const conservativeMatch = response.match(/Conservative Perspective([\s\S]*?)(?=Neutral Analysis|$)/i);
  if (conservativeMatch && conservativeMatch[1]) {
    result.conservative = conservativeMatch[1].trim();
  }

  // Try to extract Neutral Analysis
  const neutralMatch = response.match(/Neutral Analysis([\s\S]*?)$/i);
  if (neutralMatch && neutralMatch[1]) {
    result.neutral = neutralMatch[1].trim();
  }

  return result;
};

// Mock LLM response with the new prompt format
const mockResponse = `
Liberal Perspective
• The new climate policy represents a crucial step forward in addressing the urgent climate crisis, demonstrating the government's commitment to environmental protection.
• By setting ambitious targets for carbon reduction, this policy aligns with scientific consensus that immediate and substantial action is needed to prevent catastrophic climate change.
• The policy will likely stimulate growth in green technology and renewable energy sectors, creating new jobs while transitioning away from fossil fuel dependence.

Conservative Perspective
• While climate change is a concern, this policy may place undue burden on businesses and could lead to job losses in traditional energy sectors without adequate transition plans.
• The 50% reduction target by 2030 may be unrealistically ambitious and could harm economic competitiveness if other countries don't adopt similar measures.
• A market-based approach with fewer regulations and more incentives for private sector innovation might achieve similar goals with less economic disruption.

Neutral Analysis
• The policy establishes a clear emissions reduction target that is ambitious by international standards but aligns with recommendations from climate scientists.
• Implementation challenges will include balancing economic impacts across different sectors and regions, with both potential job losses and creation.
• Success will largely depend on specific implementation details, international cooperation, and technological advancements in renewable energy and carbon capture.
`;

// Extract the perspectives using the parsing function
const result = parseAnalysisResponse(mockResponse);

// Display the results
console.log('Parsed Perspectives:');
console.log('===================');
console.log('\nLiberal Perspective:');
console.log(result.liberal);
console.log('\nConservative Perspective:');
console.log(result.conservative);
console.log('\nNeutral Analysis:');
console.log(result.neutral);
