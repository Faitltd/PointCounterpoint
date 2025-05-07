/**
 * Test script to verify the prompt format for OpenAI API
 */

// Define the system prompt with the new format
const systemPrompt = `You are an impartial news analyst. For each input, you'll receive:
• A news headline  
• A brief summary of the article  

Produce three sections, each no more than three short paragraphs:

1. Liberal Perspective  
   • Offer 3 concise, evidence-based arguments from a liberal viewpoint.  
2. Conservative Perspective  
   • Offer 3 concise, evidence-based arguments from a conservative viewpoint.  
3. Neutral Analysis  
   • Offer 3 concise, balanced points that synthesize both sides and highlight key considerations.`;

// Sample article data
const headline = 'New Climate Change Policy Announced';
const content = 'The government announced a new climate change policy today that aims to reduce carbon emissions by 50% by 2030.';

// Create the messages array that would be sent to OpenAI
const messages = [
  { role: "system", content: systemPrompt },
  { role: "user", content: `Headline: ${headline}\nSummary: ${content}` }
];

// Display the formatted prompt
console.log('System Prompt:');
console.log('=============');
console.log(systemPrompt);
console.log('\nUser Message:');
console.log('=============');
console.log(`Headline: ${headline}\nSummary: ${content}`);
console.log('\nFull Messages Array:');
console.log('===================');
console.log(JSON.stringify(messages, null, 2));
