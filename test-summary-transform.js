// Test the summary transformation logic
const originalSummary = `This analysis identified the top strategic markets for Nike expansion based on market opportunity scores. The analysis reveals 3,983 ZIP codes across the region, with strategic value scores ranging from 0.1 to 95.2. High-scoring areas demonstrate strong athletic footwear market potential, demographic alignment, and competitive positioning opportunities. The top markets include areas in Brooklyn, Queens, and Manhattan, with ZIP codes like 11234, 11226, and 10001 showing exceptional growth potential.`;

console.log('🔍 ORIGINAL SUMMARY:');
console.log(originalSummary);
console.log('\n');

// Apply the same transformations as the ClusteringService
let territoryFocusedSummary = originalSummary
  .replace(/\bZIP codes?\b/gi, 'territories')
  .replace(/\bzips?\b/gi, 'territories') 
  .replace(/\bareas?\b/gi, 'territories')
  .replace(/\bregions?\b/gi, 'territories')
  .replace(/\bmarkets?\b/gi, 'market territories')
  .replace(/\blocations?\b/gi, 'territory locations')
  .replace(/individual territories/gi, 'strategic territories')
  .replace(/\b(\d+,?\d*) territories\b/gi, (match, num) => {
    // Convert territory count to cluster count when appropriate
    const clusterCount = 5; // Example: 5 clusters
    return `${clusterCount} market territories (comprising ${match.replace(' territories', '')} areas)`;
  });

const clusteringSummary = `The analysis has been organized into 5 distinct market territories for campaign deployment. Each territory averages 797 ZIP codes and serves 2,450,000 people. These 5 territories represent strategic groupings of the original 3,983 ZIP codes, optimized for efficient market penetration and resource allocation.`;

const enhancedSummary = `${territoryFocusedSummary}\n\n**Territory Clustering Applied:** ${clusteringSummary}`;

console.log('🎯 TERRITORY-FOCUSED SUMMARY:');
console.log(enhancedSummary);
console.log('\n');

console.log('✅ KEY TRANSFORMATIONS:');
console.log('- "ZIP codes" → "territories"');
console.log('- "areas" → "territories"');  
console.log('- "markets" → "market territories"');
console.log('- Added clustering explanation');
console.log('- Now talks about strategic territories instead of individual ZIP codes');