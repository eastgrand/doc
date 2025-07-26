// Directly trigger strategic analysis and capture debug logs
const puppeteer = require('puppeteer');

async function testDirectTrigger() {
  console.log('=== Testing Direct Strategic Analysis Trigger ===\n');
  
  let browser;
  try {
    console.log('1. Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capture ALL console messages
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push({ 
        type: msg.type(), 
        text: text,
        timestamp: Date.now()
      });
      
      // Show debug messages immediately 
      if (text.includes('🚨🚨🚨') || text.includes('STRATEGIC') || text.includes('executeAnalysis')) {
        console.log(`[BROWSER ${msg.type().toUpperCase()}] ${text}`);
      }
    });
    
    console.log('2. Navigating to map page...');
    await page.goto('http://localhost:3000/map', { 
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });
    
    console.log('3. Waiting for full React load...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('4. Trying to trigger analysis via multiple methods...');
    
    // Method 1: Try to call the React handler directly
    const directCallResult = await page.evaluate(() => {
      console.log('🚨🚨🚨 [TEST] Attempting to find and call handleSubmit directly...');
      
      // Look for React fiber tree to find handleSubmit
      function findReactComponent(element) {
        if (element._reactInternalFiber) return element._reactInternalFiber;
        if (element.__reactInternalInstance) return element.__reactInternalInstance;
        
        // Look for React keys
        for (const key in element) {
          if (key.startsWith('__reactInternalInstance') || key.startsWith('_reactInternalFiber')) {
            return element[key];
          }
        }
        return null;
      }
      
      // Try to find the main app container
      const appElement = document.querySelector('#__next') || 
                        document.querySelector('[data-reactroot]') ||
                        document.querySelector('main') ||
                        document.querySelector('body > div');
      
      if (appElement) {
        console.log('🚨🚨🚨 [TEST] Found app element, looking for React fiber...');
        const fiber = findReactComponent(appElement);
        if (fiber) {
          console.log('🚨🚨🚨 [TEST] Found React fiber, but cannot easily access handleSubmit from here');
        }
      }
      
      return { method: 'direct_call', success: false, reason: 'Cannot access React internals safely' };
    });
    
    console.log('   Direct call result:', directCallResult);
    
    // Method 2: Simulate user interaction more realistically
    console.log('5. Trying realistic user interaction...');
    
    const interactionResult = await page.evaluate(() => {
      console.log('🚨🚨🚨 [TEST] Looking for input elements...');
      
      const textarea = document.querySelector('textarea');
      const textInput = document.querySelector('input[type="text"]');
      const anyInput = document.querySelector('input');
      
      const targetInput = textarea || textInput || anyInput;
      
      if (targetInput) {
        console.log('🚨🚨🚨 [TEST] Found input element:', targetInput.tagName, targetInput.type);
        
        // Focus and clear
        targetInput.focus();
        targetInput.value = '';
        
        // Type the query character by character to trigger React events
        const query = 'Show me the top strategic markets for Nike expansion';
        targetInput.value = query;
        
        // Trigger input events
        targetInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        
        console.log('🚨🚨🚨 [TEST] Set input value to:', targetInput.value);
        
        // Look for submit button
        const submitBtn = document.querySelector('button[type="submit"]') ||
                         document.querySelector('button:contains("Send")') ||
                         document.querySelector('[aria-label*="send"]') ||
                         document.querySelector('[aria-label*="submit"]');
        
        if (submitBtn) {
          console.log('🚨🚨🚨 [TEST] Found submit button, clicking...');
          submitBtn.click();
          return { method: 'button_click', success: true };
        } else {
          console.log('🚨🚨🚨 [TEST] No submit button found, trying Enter key...');
          targetInput.dispatchEvent(new KeyboardEvent('keydown', { 
            key: 'Enter', 
            keyCode: 13, 
            bubbles: true, 
            cancelable: true 
          }));
          
          targetInput.dispatchEvent(new KeyboardEvent('keypress', { 
            key: 'Enter', 
            keyCode: 13, 
            bubbles: true, 
            cancelable: true 
          }));
          
          return { method: 'enter_key', success: true };
        }
      } else {
        console.log('🚨🚨🚨 [TEST] No input elements found');
        
        // List all available inputs for debugging
        const allElements = Array.from(document.querySelectorAll('input, textarea, button'));
        console.log('🚨🚨🚨 [TEST] Available elements:', allElements.map(el => ({
          tag: el.tagName,
          type: el.type,
          placeholder: el.placeholder,
          className: el.className,
          id: el.id
        })));
        
        return { method: 'no_input', success: false };
      }
    });
    
    console.log('   Interaction result:', interactionResult);
    
    if (interactionResult.success) {
      console.log('6. Waiting for analysis to trigger...');
      
      let foundAnalysis = false;
      let timeout = 0;
      
      while (timeout < 45000 && !foundAnalysis) { // Wait up to 45 seconds
        await new Promise(resolve => setTimeout(resolve, 1000));
        timeout += 1000;
        
        // Check for strategic analysis debug logs
        const recentLogs = consoleLogs.slice(-20);
        const hasStrategicAnalysis = recentLogs.some(log => 
          log.text.includes('🚨🚨🚨') && 
          (log.text.includes('STRATEGIC DEBUG') || 
           log.text.includes('executeAnalysis') ||
           log.text.includes('target_value'))
        );
        
        if (hasStrategicAnalysis) {
          foundAnalysis = true;
          console.log('   ✅ Found strategic analysis debug logs!');
          break;
        }
        
        // Show progress and recent logs
        if (timeout % 5000 === 0) {
          console.log(`   Waiting... (${timeout/1000}s)`);
          const recentLogTexts = recentLogs.map(log => log.text);
          if (recentLogTexts.length > 0) {
            console.log('   Recent logs:', recentLogTexts.slice(-3));
          }
        }
      }
      
      if (!foundAnalysis) {
        console.log('   ⚠️ No strategic analysis logs found after 45s');
      }
    }
    
    console.log('\n7. Final Debug Summary:');
    console.log('========================');
    
    // Filter strategic logs
    const strategicLogs = consoleLogs.filter(log => 
      log.text.includes('🚨🚨🚨') || 
      log.text.includes('STRATEGIC') ||
      log.text.includes('executeAnalysis') ||
      log.text.includes('target_value') ||
      log.text.includes('Claude will receive')
    );
    
    if (strategicLogs.length > 0) {
      console.log(`Found ${strategicLogs.length} strategic-related logs:`);
      strategicLogs.forEach((log, i) => {
        console.log(`${i+1}. [${log.type}] ${log.text}`);
      });
      
      // Check for the 79.3 issue specifically
      const hasIdenticalIssue = strategicLogs.some(log => 
        log.text.includes('All values are identical') ||
        log.text.includes('Claude receives identical') ||
        log.text.includes('79.3')
      );
      
      const hasDistinctValues = strategicLogs.some(log => 
        log.text.includes('distinct') || 
        log.text.includes('79.34') ||
        log.text.includes('79.17')
      );
      
      if (hasIdenticalIssue) {
        console.log('\n🚨 CONFIRMED: Found evidence of the 79.3 identical values bug');
      } else if (hasDistinctValues) {
        console.log('\n✅ GOOD: Found evidence of distinct values (bug may be fixed)');
      } else {
        console.log('\n❓ UNCLEAR: Analysis ran but no clear evidence of values issue');
      }
      
    } else {
      console.log('❌ No strategic analysis logs found');
      console.log('\nThis suggests the analysis was not triggered. Recent logs:');
      const recentLogs = consoleLogs.slice(-10);
      recentLogs.forEach((log, i) => {
        console.log(`${i+1}. [${log.type}] ${log.text}`);
      });
    }
    
    console.log('\n8. Browser will stay open for 30s for manual testing...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testDirectTrigger();