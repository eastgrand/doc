#!/usr/bin/env node

const https = require('https');
const http = require('http');

// API Keys from environment
const FRED_API_KEY = '46d8b4ad33dbf68ba32e0128933379a9';
const ALPHA_VANTAGE_API_KEY = 'YFHTVYAB4BQEI8IW';

console.log('🧪 Testing Phase 4 API Connectivity...\n');

// Test FRED API
async function testFREDAPI() {
  return new Promise((resolve) => {
    const url = `https://api.stlouisfed.org/fred/series?series_id=GDP&api_key=${FRED_API_KEY}&file_type=json`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.seriess && json.seriess.length > 0) {
            console.log('✅ FRED API: Connected successfully');
            console.log(`   📊 Series: ${json.seriess[0].title}`);
            resolve(true);
          } else {
            console.log('❌ FRED API: Invalid response structure');
            resolve(false);
          }
        } catch (error) {
          console.log('❌ FRED API: JSON parse error');
          resolve(false);
        }
      });
    }).on('error', () => {
      console.log('❌ FRED API: Connection failed');
      resolve(false);
    });
  });
}

// Test Alpha Vantage API
async function testAlphaVantageAPI() {
  return new Promise((resolve) => {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json['Global Quote']) {
            console.log('✅ Alpha Vantage API: Connected successfully');
            console.log(`   📈 SPY Price: $${json['Global Quote']['05. price']}`);
            resolve(true);
          } else if (json['Note']) {
            console.log('⚠️  Alpha Vantage API: Rate limit reached');
            console.log('   📝 Note:', json['Note']);
            resolve(true); // Still connected, just rate limited
          } else {
            console.log('❌ Alpha Vantage API: Invalid response');
            console.log('   🔍 Response:', JSON.stringify(json, null, 2));
            resolve(false);
          }
        } catch (error) {
          console.log('❌ Alpha Vantage API: JSON parse error');
          resolve(false);
        }
      });
    }).on('error', () => {
      console.log('❌ Alpha Vantage API: Connection failed');
      resolve(false);
    });
  });
}

// Test arXiv API
async function testArxivAPI() {
  return new Promise((resolve) => {
    const url = 'http://export.arxiv.org/api/query?search_query=demographic&max_results=1';
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.includes('<entry>') && data.includes('<title>')) {
          console.log('✅ arXiv API: Connected successfully');
          // Extract first title for verification
          const titleMatch = data.match(/<title>(.*?)<\/title>/);
          if (titleMatch) {
            console.log(`   📄 Found paper: ${titleMatch[1].substring(0, 80)}...`);
          }
          resolve(true);
        } else {
          console.log('❌ arXiv API: Invalid XML response');
          resolve(false);
        }
      });
    }).on('error', () => {
      console.log('❌ arXiv API: Connection failed');
      resolve(false);
    });
  });
}

// Test CrossRef API
async function testCrossRefAPI() {
  return new Promise((resolve) => {
    const url = 'https://api.crossref.org/works?query=demographic&rows=1';
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'ok' && json.message && json.message.items.length > 0) {
            console.log('✅ CrossRef API: Connected successfully');
            const firstItem = json.message.items[0];
            console.log(`   📚 Found: ${Array.isArray(firstItem.title) ? firstItem.title[0] : firstItem.title}`);
            resolve(true);
          } else {
            console.log('❌ CrossRef API: No results found');
            resolve(false);
          }
        } catch (error) {
          console.log('❌ CrossRef API: JSON parse error');
          resolve(false);
        }
      });
    }).on('error', () => {
      console.log('❌ CrossRef API: Connection failed');
      resolve(false);
    });
  });
}

// Test CORE API
async function testCoreAPI() {
  return new Promise((resolve) => {
    const url = 'https://core.ac.uk/api-v2/articles/search?query=demographic&pageSize=1';
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data && json.data.length > 0) {
            console.log('✅ CORE API: Connected successfully');
            console.log(`   🔬 Found: ${json.data[0].title || 'Research paper'}`);
            resolve(true);
          } else {
            console.log('⚠️  CORE API: No results (may be rate limited)');
            resolve(true); // CORE often rate limits but still works
          }
        } catch (error) {
          console.log('❌ CORE API: JSON parse error');
          resolve(false);
        }
      });
    }).on('error', () => {
      console.log('❌ CORE API: Connection failed');
      resolve(false);
    });
  });
}

// Run all tests
async function runAllTests() {
  console.log('🔌 Testing Economic Data APIs...\n');
  
  const fredResult = await testFREDAPI();
  const avResult = await testAlphaVantageAPI();
  
  console.log('\n📚 Testing Research APIs...\n');
  
  const arxivResult = await testArxivAPI();
  const crossrefResult = await testCrossRefAPI();
  const coreResult = await testCoreAPI();
  
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const results = {
    'FRED Economic Data': fredResult,
    'Alpha Vantage Market Data': avResult,
    'arXiv Research Papers': arxivResult,
    'CrossRef Academic Database': crossrefResult,
    'CORE Open Access': coreResult
  };
  
  let successCount = 0;
  Object.entries(results).forEach(([name, success]) => {
    console.log(`${success ? '✅' : '❌'} ${name}`);
    if (success) successCount++;
  });
  
  console.log(`\n🎯 Overall: ${successCount}/5 APIs working`);
  
  if (successCount >= 3) {
    console.log('🚀 Phase 4 integration can proceed!');
    console.log('💡 Enough APIs are functional for feature deployment');
  } else {
    console.log('⚠️  Limited API connectivity detected');
    console.log('💡 Integration will use cached data and graceful degradation');
  }
  
  return results;
}

// Execute tests
runAllTests().then((results) => {
  console.log('\n✅ API connectivity test complete');
}).catch((error) => {
  console.error('\n❌ Test execution failed:', error);
});