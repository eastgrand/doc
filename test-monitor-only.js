// Just monitor console logs for strategic analysis activity
const puppeteer = require('puppeteer');

async function monitorStrategicAnalysis() {
  console.log('=== Monitoring Strategic Analysis Activity ===\n');
  
  let browser;
  try {
    console.log('1. Launching browser (with DevTools open)...');
    browser = await puppeteer.launch({ 
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: null
    });
    
    const page = await browser.newPage();
    
    // Capture ALL console logs with timestamps
    const allLogs = [];
    page.on('console', msg => {
      const timestamp = new Date().toISOString();
      const text = msg.text();
      const type = msg.type();
      
      allLogs.push({ timestamp, type, text });
      
      // Show important logs immediately
      if (text.includes('🚨🚨🚨') || 
          text.includes('STRATEGIC') || 
          text.includes('executeAnalysis') ||
          text.includes('target_value') ||
          text.includes('79.3') ||
          text.includes('79.34')) {
        console.log(`[${timestamp}] [${type.toUpperCase()}] ${text}`);
      }
    });
    
    console.log('2. Navigating to map page...');
    await page.goto('http://localhost:3000/map', { 
      waitUntil: 'networkidle2',
      timeout: 120000
    });
    
    console.log('3. Page loaded. Now monitoring for strategic analysis...');
    console.log('   Please manually test the strategic query:');
    console.log('   "Show me the top strategic markets for Nike expansion"');
    console.log('   ');
    console.log('   I will monitor console logs for 60 seconds...\n');
    
    // Monitor for 60 seconds
    let monitorTime = 0;
    const monitorInterval = setInterval(() => {
      monitorTime += 5;
      console.log(`[Monitor] ${monitorTime}s elapsed... (watching for strategic analysis)`);
      
      if (monitorTime >= 60) {
        clearInterval(monitorInterval);
      }
    }, 5000);
    
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    console.log('\n4. Monitoring complete. Analysis summary:');
    console.log('==========================================');
    
    // Filter and analyze strategic logs
    const strategicLogs = allLogs.filter(log => 
      log.text.includes('🚨🚨🚨') || 
      log.text.includes('STRATEGIC') ||
      log.text.includes('executeAnalysis') ||
      log.text.includes('target_value') ||
      log.text.includes('Claude will receive') ||
      log.text.includes('AnalysisEngine returned') ||
      log.text.includes('79.3') ||
      log.text.includes('79.34') ||
      log.text.includes('identical') ||
      log.text.includes('distinct')
    );
    
    if (strategicLogs.length > 0) {
      console.log(`Found ${strategicLogs.length} strategic analysis logs:`);
      strategicLogs.forEach((log, i) => {
        console.log(`${i+1}. [${log.timestamp.substr(11, 8)}] [${log.type}] ${log.text}`);
      });
      
      // Check for specific evidence
      const evidenceOfBug = strategicLogs.filter(log => 
        log.text.includes('All values are identical') ||
        log.text.includes('Claude receives identical') ||
        (log.text.includes('79.3') && !log.text.includes('79.34'))
      );
      
      const evidenceOfFix = strategicLogs.filter(log => 
        log.text.includes('distinct') ||
        log.text.includes('79.34') ||
        log.text.includes('79.17')
      );
      
      console.log('\n--- DIAGNOSIS ---');
      if (evidenceOfBug.length > 0) {
        console.log('🚨 BUG CONFIRMED: Found evidence of identical 79.3 values');
        console.log('Bug evidence:');
        evidenceOfBug.forEach((log, i) => {
          console.log(`  ${i+1}. ${log.text}`);
        });
      } else if (evidenceOfFix.length > 0) {
        console.log('✅ BUG FIXED: Found evidence of distinct values');
        console.log('Fix evidence:');
        evidenceOfFix.forEach((log, i) => {
          console.log(`  ${i+1}. ${log.text}`);
        });
      } else {
        console.log('❓ INCONCLUSIVE: Analysis ran but no clear evidence about the bug');
      }
      
    } else {
      console.log('❌ No strategic analysis activity detected');
      console.log('This means either:');
      console.log('  1. No strategic query was submitted');
      console.log('  2. The debug logs are not working');
      console.log('  3. There is an error preventing analysis');
      
      // Show general error/warning logs
      const errorLogs = allLogs.filter(log => 
        log.type === 'error' || 
        log.type === 'warn' ||
        log.text.toLowerCase().includes('error') ||
        log.text.toLowerCase().includes('failed')
      );
      
      if (errorLogs.length > 0) {
        console.log('\nRecent errors/warnings:');
        errorLogs.slice(-5).forEach((log, i) => {
          console.log(`${i+1}. [${log.type}] ${log.text}`);
        });
      }
    }
    
    console.log('\n5. Browser will close in 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('Monitor failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

monitorStrategicAnalysis();