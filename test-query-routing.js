// Test how specific queries are routed
const { EnhancedQueryAnalyzer } = require("./lib/analysis/EnhancedQueryAnalyzer.ts");

const problematicQueries = [
  "what factors influence Nike success",
  "how does income relate to Nike purchases",
  "relationship between demographics and brand preference"
];

const analyzer = new EnhancedQueryAnalyzer();

console.log("Query Routing Analysis\n" + "=".repeat(50));

problematicQueries.forEach(query => {
  console.log(`\nQuery: "${query}"`);
  const scores = analyzer.analyzeQuery(query);
  const best = analyzer.getBestEndpoint(query);
  
  console.log(`\nSELECTED ENDPOINT: ${best}\n`);
  
  console.log("All endpoint scores:");
  scores.forEach((s) => {
    console.log(`  ${s.endpoint}: ${s.score.toFixed(1)}`);
    if (s.reasons.length > 0) {
      console.log(`    Reasons: ${s.reasons.join("; ")}`);
    }
  });
});
