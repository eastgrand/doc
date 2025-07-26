// Test to simulate a strategic analysis query and see actual debug output
const puppeteer = require('puppeteer');

async function testStrategicAnalysisLive() {
  console.log('=== Testing Live Strategic Analysis ===\n');
  
  let browser;
  try {
    // Launch browser in visible mode to see what happens
    browser = await puppeteer.launch({ 
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🚨') || text.includes('ANALYSIS ENGINE') || text.includes('strategic')) {
        console.log(`[BROWSER CONSOLE] ${text}`);
      }
    });
    
    // Navigate to the map page
    console.log('1. Navigating to map page...');
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle0' });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Look for chat input
    console.log('2. Looking for chat input...');
    const chatInput = await page.$('input[placeholder*="chat"], textarea[placeholder*="chat"], input[type="text"]');
    
    if (chatInput) {
      console.log('3. Found chat input, typing strategic query...');
      
      // Type strategic analysis query
      await chatInput.click();
      await chatInput.type('Show me the top strategic markets for Nike expansion');
      
      // Look for submit button
      const submitButton = await page.$('button[type="submit"], button:has-text("Send")');
      if (submitButton) {
        console.log('4. Clicking submit button...');
        await submitButton.click();
        
        // Wait for response and collect console logs
        console.log('5. Waiting for analysis to complete...');
        await page.waitForTimeout(10000);
        
        console.log('6. Analysis should be complete - check browser console above');
        
      } else {
        console.log('4. ❌ Could not find submit button');
      }
      
    } else {
      console.log('3. ❌ Could not find chat input');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  testStrategicAnalysisLive();
} catch (error) {
  console.log('Puppeteer not available, skipping live test');
  console.log('Please test manually by visiting http://localhost:3000/map');
  console.log('And submitting the query: "Show me the top strategic markets for Nike expansion"');
}