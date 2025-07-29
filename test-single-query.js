const { EnhancedQueryAnalyzer } = require("./lib/analysis/EnhancedQueryAnalyzer.ts");

const analyzer = new EnhancedQueryAnalyzer();
const query = "relationship between demographics and brand preference";

console.log("Query:", query);
console.log("");

const scores = analyzer.analyzeQuery(query);
const best = analyzer.getBestEndpoint(query);

console.log("SELECTED:", best);
console.log("");

scores.forEach(s => {
  console.log(s.endpoint + ":", s.score);
  if (s.reasons.length > 0) {
    console.log("  " + s.reasons.join("; "));
  }
});

console.log("");
console.log("ANALYSIS:");
console.log("The word between is triggering comparative analysis");
console.log("But this query is really asking about demographic insights");
