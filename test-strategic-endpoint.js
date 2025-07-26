const fs = require('fs');
const path = require('path');

console.log('Testing strategic endpoint data loading...\n');

// Check if strategic-analysis.json exists
const filePath = path.join(__dirname, 'public/data/endpoints/strategic-analysis.json');
console.log(`Looking for file: ${filePath}`);

if (fs.existsSync(filePath)) {
  console.log('✅ File exists!');
  
  const stats = fs.statSync(filePath);
  console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  // Load and check the data
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('\n📋 File structure:');
  console.log('Top-level keys:', Object.keys(data));
  console.log('Results length:', data.results?.length || 0);
  
  if (data.results && data.results.length > 0) {
    console.log('\n🔍 First record:');
    const firstRecord = data.results[0];
    console.log('ID:', firstRecord.ID || firstRecord.id);
    console.log('Strategic Value Score:', firstRecord.strategic_value_score);
    console.log('Total fields:', Object.keys(firstRecord).length);
    
    // Check for score field
    const hasStrategicScore = 'strategic_value_score' in firstRecord;
    console.log('\n✅ Has strategic_value_score field:', hasStrategicScore);
  }
} else {
  console.log('❌ File does not exist!');
}