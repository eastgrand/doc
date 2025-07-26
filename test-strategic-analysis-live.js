// Test strategic analysis query in the live browser to see debug logs
const puppeteer = require('puppeteer');

async function testStrategicAnalysisLive() {
  console.log('=== Testing Live Strategic Analysis ===\n');
  
  let browser;
  try {
    // Launch browser
    console.log('1. Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      slowMo: 100
    });
    
    const page = await browser.newPage();
    
    // Collect all console logs
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      
      // Show debug messages immediately
      if (text.includes('🚨🚨🚨') || text.includes('STRATEGIC') || text.includes('ANALYSIS ENGINE')) {
        console.log(`[BROWSER] ${text}`);
      }
    });
    
    // Navigate to the map page
    console.log('2. Navigating to map page...');
    await page.goto('http://localhost:3000/map', { 
      waitUntil: 'domcontentloaded',
      timeout: 120000  // 2 minutes timeout
    });
    
    // Wait for page to load
    console.log('3. Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Look for the chat input - try multiple selectors
    console.log('4. Looking for chat input...');
    const chatInput = await page.$('textarea') || 
                      await page.$('input[type="text"]') || 
                      await page.$('[placeholder*="question"]') ||
                      await page.$('[placeholder*="query"]');
    
    if (chatInput) {
      console.log('5. Found chat input, typing strategic query...');
      
      // Clear any existing text and type strategic query
      await chatInput.click();
      await chatInput.evaluate(el => el.value = '');
      await chatInput.type('Show me the top strategic markets for Nike expansion');
      
      // Look for submit button - try multiple approaches
      console.log('6. Looking for submit button...');
      let submitted = false;
      
      // Try form submission
      const form = await page.$('form');
      if (form) {
        console.log('   Found form, submitting...');
        await form.evaluate(form => form.submit());
        submitted = true;
      } else {
        // Try finding button
        const submitButton = await page.$('button[type="submit"]') || 
                            await page.$('button:has-text("Send")') ||
                            await page.$('[aria-label*="Send"]') ||
                            await page.$('[title*="Send"]');
        
        if (submitButton) {
          console.log('   Found submit button, clicking...');
          await submitButton.click();
          submitted = true;
        } else {
          // Try pressing Enter
          console.log('   Trying Enter key...');
          await chatInput.press('Enter');
          submitted = true;
        }
      }
      
      if (submitted) {
        console.log('7. Query submitted, waiting for analysis...');
        
        // Wait for analysis to complete - look for specific debug messages
        let foundAnalysisStart = false;
        let foundAnalysisComplete = false;
        let timeout = 0;
        
        while (timeout < 30000 && (!foundAnalysisStart || !foundAnalysisComplete)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          timeout += 1000;
          
          // Check recent console logs
          const recentLogs = consoleLogs.slice(-10);
          
          if (recentLogs.some(log => log.includes('STRATEGIC DEBUG] Starting AnalysisEngine'))) {
            foundAnalysisStart = true;
            console.log('   ✅ Analysis started');
          }
          
          if (recentLogs.some(log => log.includes('STRATEGIC CLAUDE DEBUG] What Claude will receive'))) {
            foundAnalysisComplete = true;
            console.log('   ✅ Analysis complete, data sent to Claude');
            break;
          }
          
          console.log(`   Waiting... (${timeout/1000}s)`);
        }
        
        console.log('\n8. Analysis Debug Summary:');
        console.log('==============================');
        
        // Filter and display strategic debug logs
        const strategicLogs = consoleLogs.filter(log => 
          log.includes('🚨🚨🚨') || 
          log.includes('STRATEGIC') ||
          log.includes('AnalysisEngine returned') ||
          log.includes('target_value')
        );
        
        if (strategicLogs.length > 0) {
          console.log('Strategic Analysis Debug Logs:');
          strategicLogs.forEach((log, i) => {
            console.log(`${i+1}. ${log}`);
          });
        } else {
          console.log('❌ No strategic debug logs found - analysis may not have run');
        }
        
      } else {
        console.log('6. ❌ Could not submit query');
      }
      
    } else {
      console.log('5. ❌ Could not find chat input');
      
      // Debug: show what elements are available
      const allInputs = await page.$$eval('input, textarea', els => 
        els.map(el => ({
          tag: el.tagName,
          type: el.type,
          placeholder: el.placeholder,
          id: el.id,
          className: el.className
        }))
      );
      console.log('Available inputs:', allInputs);
    }
    
    console.log('\n9. Keeping browser open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testStrategicAnalysisLive();