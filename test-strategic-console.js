// Test strategic analysis by directly executing code in browser console
const puppeteer = require('puppeteer');

async function testStrategicConsole() {
  console.log('=== Testing Strategic Analysis via Console ===\n');
  
  let browser;
  try {
    console.log('1. Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Collect console logs
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      
      // Show debug messages immediately
      if (text.includes('🚨🚨🚨') || text.includes('STRATEGIC') || text.includes('ANALYSIS ENGINE')) {
        console.log(`[BROWSER] ${text}`);
      }
    });
    
    console.log('2. Navigating to map page...');
    await page.goto('http://localhost:3000/map', { 
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });
    
    console.log('3. Waiting for React components to load...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('4. Trying to trigger strategic analysis via console...');
    
    // Try to find the handleSubmit function and call it directly
    const result = await page.evaluate(() => {
      try {
        // Look for the handleSubmit function in the global scope or React fiber
        const query = "Show me the top strategic markets for Nike expansion";
        
        // Try to find React components with handleSubmit
        const reactFiber = document.querySelector('*[data-reactroot]')?._reactInternalFiber ||
                          document.querySelector('#__next')?._reactInternalFiber ||
                          document.querySelector('main')?._reactInternalFiber;
        
        if (reactFiber) {
          console.log('Found React fiber, trying to trigger analysis...');
          // This is a hack to trigger the analysis - in a real app you'd have a proper API
          // Instead, let's just verify the debugging logs are present
          return { success: true, method: 'react_fiber_found' };
        }
        
        // Fallback: try to find input and submit button
        const textarea = document.querySelector('textarea');
        const input = document.querySelector('input[type="text"]');
        const submitButton = document.querySelector('button[type="submit"]');
        
        if (textarea || input) {
          const inputElement = textarea || input;
          inputElement.value = query;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          
          if (submitButton) {
            submitButton.click();
          } else {
            // Try form submission
            const form = inputElement.closest('form');
            if (form) {
              form.dispatchEvent(new Event('submit', { bubbles: true }));
            } else {
              // Try Enter key
              inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            }
          }
          
          return { success: true, method: 'input_found', hasSubmitButton: !!submitButton };
        }
        
        return { success: false, error: 'No input elements found' };
        
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('5. Console execution result:', result);
    
    if (result.success) {
      console.log('6. Waiting for analysis to complete...');
      
      // Wait for strategic debug logs
      let foundStrategicLogs = false;
      let timeout = 0;
      
      while (timeout < 30000 && !foundStrategicLogs) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        timeout += 1000;
        
        const strategicLogs = consoleLogs.filter(log => 
          log.includes('🚨🚨🚨') && log.includes('STRATEGIC')
        );
        
        if (strategicLogs.length > 0) {
          foundStrategicLogs = true;
          console.log('   ✅ Found strategic debug logs');
          break;
        }
        
        console.log(`   Waiting for debug logs... (${timeout/1000}s)`);
      }
    }
    
    console.log('\n7. Strategic Analysis Debug Summary:');
    console.log('=====================================');
    
    const strategicLogs = consoleLogs.filter(log => 
      log.includes('🚨🚨🚨') || 
      log.includes('STRATEGIC') ||
      log.includes('target_value') ||
      log.includes('AnalysisEngine')
    );
    
    if (strategicLogs.length > 0) {
      console.log('Found strategic debug logs:');
      strategicLogs.forEach((log, i) => {
        console.log(`${i+1}. ${log}`);
      });
      
      // Look for the specific issue
      const hasIdenticalValues = strategicLogs.some(log => 
        log.includes('All values are identical') || 
        log.includes('Claude receives identical')
      );
      
      if (hasIdenticalValues) {
        console.log('\n🚨 CONFIRMED: Strategic analysis shows identical values bug');
      } else {
        console.log('\n✅ Strategic analysis appears to work correctly');
      }
      
    } else {
      console.log('❌ No strategic debug logs found');
      console.log('This means either:');
      console.log('  1. The analysis was not triggered');
      console.log('  2. The debug logs are not working');
      console.log('  3. The page is not fully loaded');
      
      console.log('\nAll console logs:');
      consoleLogs.slice(-20).forEach((log, i) => {
        console.log(`${i+1}. ${log}`);
      });
    }
    
    console.log('\n8. Keeping browser open for manual inspection...');
    console.log('   You can manually test the strategic query now');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testStrategicConsole();