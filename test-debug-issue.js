// Debug the exact issue - why strategic analysis still shows all 79.3
const fs = require('fs');

async function debugStrategicIssue() {
  console.log('=== Debugging Strategic Analysis Issue ===\n');

  // 1. Test the data source
  console.log('1. Testing raw data source:');
  const data = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
  const first5 = data.results.slice(0, 5);
  
  console.log('Raw strategic_value_scores from data file:');
  first5.forEach((record, i) => {
    console.log(`   ${i+1}. ${record.DESCRIPTION}: ${record.strategic_value_score}`);
  });

  // 2. Test the exact flow from the UI
  console.log('\n2. Testing UI submission flow:');
  
  // Simulate what happens in the UI when user types strategic query
  const query = "Show me the top strategic markets for Nike expansion";
  console.log(`Query: "${query}"`);
  
  // This is what should happen in handleSubmit function
  console.log('\n3. What handleSubmit should do:');
  console.log('   - Call analysisEngine.executeAnalysis(query)');
  console.log('   - Get back distinct values from AnalysisEngine');
  console.log('   - Pass those to Claude API');
  
  // But let's check what happens if sendChatMessage is still being called somewhere
  console.log('\n4. Check for sendChatMessage vs handleSubmit issue:');
  
  // Read the current geospatial-chat-interface.tsx to see what ChatBar is actually calling
  try {
    const uiCode = fs.readFileSync('./components/geospatial-chat-interface.tsx', 'utf8');
    
    // Look for ChatBar usage
    const chatBarMatch = uiCode.match(/<ChatBar[^>]*onSend=\{([^}]+)\}/);
    if (chatBarMatch) {
      console.log(`   ChatBar onSend is currently: ${chatBarMatch[1]}`);
      if (chatBarMatch[1].includes('sendChatMessage')) {
        console.log('   🚨 PROBLEM: ChatBar is still using sendChatMessage instead of handleSubmit!');
      } else if (chatBarMatch[1].includes('handleSubmit')) {
        console.log('   ✅ ChatBar is correctly using handleSubmit');
      }
    } else {
      console.log('   ❌ Could not find ChatBar onSend configuration');
    }
    
    // Also check if there are multiple ChatBar instances
    const allChatBarMatches = uiCode.match(/<ChatBar[^>]*>/g);
    if (allChatBarMatches && allChatBarMatches.length > 1) {
      console.log(`   Found ${allChatBarMatches.length} ChatBar instances:`);
      allChatBarMatches.forEach((match, i) => {
        console.log(`   ${i+1}. ${match}`);
      });
    }
    
  } catch (error) {
    console.log('   ❌ Could not read UI file:', error.message);
  }

  // 5. Test if there's still a fallback path being used
  console.log('\n5. Check for fallback logic:');
  
  // Check if there's still some fallback logic in handleSubmit that might be bypassing AnalysisEngine
  try {
    const uiCode = fs.readFileSync('./components/geospatial-chat-interface.tsx', 'utf8');
    
    // Look for handleSubmit function
    const handleSubmitMatch = uiCode.match(/const handleSubmit[^{]*{([^]*?)(?=\n\s*const|\n\s*})/);
    if (handleSubmitMatch) {
      const handleSubmitCode = handleSubmitMatch[1];
      
      if (handleSubmitCode.includes('sendChatMessage')) {
        console.log('   🚨 PROBLEM: handleSubmit still calls sendChatMessage as fallback!');
        
        // Extract the condition
        const fallbackMatch = handleSubmitCode.match(/if\s*\([^)]+\)\s*{[^}]*sendChatMessage/);
        if (fallbackMatch) {
          console.log(`   Fallback condition: ${fallbackMatch[0]}`);
        }
      } else {
        console.log('   ✅ handleSubmit does not call sendChatMessage');
      }
      
      if (handleSubmitCode.includes('analysisEngine.executeAnalysis')) {
        console.log('   ✅ handleSubmit calls analysisEngine.executeAnalysis');
      } else {
        console.log('   🚨 PROBLEM: handleSubmit does not call analysisEngine.executeAnalysis!');
      }
    } else {
      console.log('   ❌ Could not find handleSubmit function');
    }
    
  } catch (error) {
    console.log('   ❌ Could not analyze handleSubmit:', error.message);
  }
}

debugStrategicIssue();