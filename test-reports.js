// Test script to fetch and display available reports
const fetch = require('node-fetch');

// Copy the logic from ReportsService.ts
const token = process.env.NEXT_PUBLIC_ARCGIS_API_KEY_2 || 'AAPTxy8BH1VEsoebNVZXo8HurEs9TD-3BH9IvorrjVWQR4uGhbHZOyV9S-QJcwJfNyPyN6IDTc6dX1pscXuVgb4-GEQ70Mrk6FUuIcuO2Si45rlSIepAJkP92iyuw5nBPxpTjI0ga_Aau9Cr6xaQ2DJnJfzaCkTor0cB9UU6pcNyFqxJlYt_26boxHYqnnu7vWlqt7SVFcWKmYq6kh8anIAmEi0hXY1ThVhKIupAS_Mure0.AT1_VqzOv0Y5';

const endpointsToTry = [
  {
    name: 'Synapse54 All Content',
    url: `https://www.arcgis.com/sharing/rest/search?q=owner:Synapse54&f=pjson&token=${token}&num=200&sortField=modified&sortOrder=desc`
  },
  {
    name: 'Synapse54 Report Templates',
    url: `https://www.arcgis.com/sharing/rest/search?q=owner:Synapse54 AND type:"Report Template"&f=pjson&token=${token}&num=200`
  },
  {
    name: 'PRIZM Report Templates',
    url: `https://www.arcgis.com/sharing/rest/search?q=type:"Report Template" AND (PRIZM OR prizm OR "Tapestry" OR "market segmentation")&f=pjson&token=${token}&num=100`
  },
  {
    name: 'Canadian Report Templates',
    url: `https://www.arcgis.com/sharing/rest/search?q=type:"Report Template" AND (canada OR canadian OR quebec OR ontario OR bc)&f=pjson&token=${token}&num=100`
  }
];

async function fetchReports() {
  console.log('🔍 TESTING REPORT DISCOVERY...\n');
  
  const allItems = [];
  
  for (const endpoint of endpointsToTry) {
    console.log(`\n📡 Testing: ${endpoint.name}`);
    console.log(`URL: ${endpoint.url.substring(0, 100)}...`);
    
    try {
      const response = await fetch(endpoint.url);
      
      if (!response.ok) {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      let items = [];
      if (data.results && Array.isArray(data.results)) {
        items = data.results;
      } else if (data.items && Array.isArray(data.items)) {
        items = data.items;
      }
      
      console.log(`✅ Found ${items.length} items`);
      
      if (items.length > 0) {
        console.log('   Sample titles:');
        items.slice(0, 5).forEach(item => {
          console.log(`   - "${item.title}" (owner: ${item.owner}, type: ${item.type})`);
        });
        
        allItems.push(...items);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Remove duplicates
  const uniqueItems = [];
  const seenIds = new Set();
  
  for (const item of allItems) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueItems.push(item);
    }
  }
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`Total items found: ${allItems.length}`);
  console.log(`Unique items: ${uniqueItems.length}`);
  
  // Filter for report templates only
  const reportTemplates = uniqueItems.filter(item => item.type === 'Report Template');
  console.log(`Report Templates: ${reportTemplates.length}`);
  
  // Categorize reports
  console.log(`\n📋 ALL REPORT TEMPLATES FOUND:`);
  
  const synapse54Reports = reportTemplates.filter(item => item.owner === 'Synapse54');
  const prizmReports = reportTemplates.filter(item => 
    item.title?.toLowerCase().includes('prizm') || 
    item.title?.toLowerCase().includes('tapestry') ||
    item.description?.toLowerCase().includes('prizm') ||
    item.description?.toLowerCase().includes('tapestry')
  );
  const canadianReports = reportTemplates.filter(item => {
    const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
    return text.includes('canada') || text.includes('canadian') || text.includes('quebec') || text.includes('ontario');
  });
  
  console.log(`\n🏢 SYNAPSE54 BRANDED REPORTS (${synapse54Reports.length}):`);
  synapse54Reports.forEach((item, index) => {
    console.log(`${index + 1}. "${item.title}"`);
    console.log(`   ID: ${item.id}`);
    console.log(`   Modified: ${item.modified ? new Date(item.modified).toLocaleDateString() : 'Unknown'}`);
    console.log(`   Description: ${(item.snippet || item.description || 'No description').substring(0, 100)}...`);
    console.log('');
  });
  
  console.log(`\n🎯 PRIZM/TAPESTRY REPORTS (${prizmReports.length}):`);
  prizmReports.forEach((item, index) => {
    console.log(`${index + 1}. "${item.title}" (owner: ${item.owner})`);
    console.log(`   ID: ${item.id}`);
    console.log(`   Description: ${(item.snippet || item.description || 'No description').substring(0, 100)}...`);
    console.log('');
  });
  
  console.log(`\n🍁 CANADIAN REPORTS (${canadianReports.length}):`);
  canadianReports.forEach((item, index) => {
    console.log(`${index + 1}. "${item.title}" (owner: ${item.owner})`);
    console.log(`   ID: ${item.id}`);
    console.log(`   Description: ${(item.snippet || item.description || 'No description').substring(0, 100)}...`);
    console.log('');
  });
  
  console.log(`\n📈 OTHER BUSINESS/DEMOGRAPHIC REPORTS:`);
  const otherReports = reportTemplates.filter(item => 
    !synapse54Reports.includes(item) && 
    !prizmReports.includes(item) && 
    !canadianReports.includes(item)
  );
  
  console.log(`Found ${otherReports.length} other reports:`);
  otherReports.slice(0, 10).forEach((item, index) => {
    console.log(`${index + 1}. "${item.title}" (owner: ${item.owner})`);
  });
  
  if (otherReports.length > 10) {
    console.log(`... and ${otherReports.length - 10} more`);
  }
}

fetchReports().catch(console.error);