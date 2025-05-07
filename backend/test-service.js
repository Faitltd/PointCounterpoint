/**
 * Test script for the generateDetailedPerspectives function
 */

const { generateDetailedPerspectives } = require('./services/summaryService');

async function testService() {
  try {
    console.log('Testing generateDetailedPerspectives function...');
    console.log('Headline: New Climate Change Policy Announced');
    console.log('Content: The government announced a new climate change policy today that aims to reduce carbon emissions by 50% by 2030.');
    
    const result = await generateDetailedPerspectives(
      'New Climate Change Policy Announced',
      'The government announced a new climate change policy today that aims to reduce carbon emissions by 50% by 2030.'
    );
    
    console.log('\nService Call Successful!');
    console.log('\nLiberal Perspective:');
    console.log(result.liberal);
    
    console.log('\nConservative Perspective:');
    console.log(result.conservative);
    
    console.log('\nNeutral Analysis:');
    console.log(result.neutral);
  } catch (error) {
    console.error('Error testing service:', error);
  }
}

testService();
