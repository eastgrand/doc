#!/usr/bin/env node

// Test script to fetch and analyze ArcGIS reports data structure
const fetch = require('node-fetch');

async function testReportsFetch() {
  try {
    // Use the same token and endpoints as the component
    const token = 'AAPTxy8BH1VEsoebNVZXo8HurEs9TD-3BH9IvorrjVWQR4uGhbHZOyV9S-QJcwJfNyPyN6IDTc6dX1pscXuVgb4-GEQ70Mrk6FUuIcuO2Si45rlSIepAJkP92iyuw5nBPxpTjI0ga_Aau9Cr6xaQ2DJnJfzaCkTor0cB9UU6pcNyFqxJlYt_26boxHYqnnu7vWlqt7SVFcWKmYq6kh8anIAmEi0hXY1ThVhKIupAS_Mure0.AT1_VqzOv0Y5';
    
    const endpointsToTry = [
      {
        name: 'Report Template Search',
        url: `https://www.arcgis.com/sharing/rest/search?q=owner:Synapse54 AND type:"Report Template"&f=pjson&token=${token}&num=100`
      },
      {
        name: 'User Root Content',
        url: `https://www.arcgis.com/sharing/rest/content/users/Synapse54?f=pjson&token=${token}`
      }
    ];

    let allItems = [];

    // Try each endpoint
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`\n=== Testing endpoint: ${endpoint.name} ===`);
        
        const response = await fetch(endpoint.url);
        console.log(`Response Status: ${response.status}`);

        if (!response.ok) {
          console.warn(`Failed with status: ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`Response structure:`, {
          hasResults: !!data.results,
          hasItems: !!data.items,
          resultCount: data.results?.length || 0,
          itemCount: data.items?.length || 0,
          totalCount: data.total || 0
        });

        // Handle different response formats
        let items = [];
        if (data.results && Array.isArray(data.results)) {
          items = data.results;
        } else if (data.items && Array.isArray(data.items)) {
          items = data.items;
        }

        if (items.length > 0) {
          console.log(`Found ${items.length} items`);
          console.log(`Sample titles:`, items.slice(0, 5).map(item => item.title));
          
          // Analyze first few items structure
          console.log('\n--- Analyzing item structure ---');
          items.slice(0, 3).forEach((item, index) => {
            console.log(`\nItem ${index + 1}: "${item.title}"`);
            console.log(`  ID: ${item.id}`);
            console.log(`  Type: ${item.type}`);
            console.log(`  Description: ${item.description?.substring(0, 100)}...`);
            console.log(`  Tags: ${JSON.stringify(item.tags)}`);
            console.log(`  Culture: ${item.culture}`);
            console.log(`  Properties:`, JSON.stringify(item.properties, null, 2));
            console.log(`  Extent:`, JSON.stringify(item.extent, null, 2));
            console.log(`  SpatialReference:`, JSON.stringify(item.spatialReference, null, 2));
            console.log(`  All fields:`, Object.keys(item));
          });
          
          allItems.push(...items);
        }

      } catch (error) {
        console.error(`Error with ${endpoint.name}:`, error.message);
      }
    }

    // Remove duplicates
    const uniqueItems = allItems.reduce((acc, current) => {
      const existing = acc.find(item => item.id === current.id);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total unique items found: ${uniqueItems.length}`);
    console.log('\nAll item titles:');
    uniqueItems.forEach((item, index) => {
      console.log(`${index + 1}. "${item.title}" (ID: ${item.id}, Type: ${item.type})`);
    });

    // Look for country-related fields
    console.log('\n=== COUNTRY FIELD ANALYSIS ===');
    uniqueItems.forEach((item, index) => {
      const countryFields = {};
      
      // Check various possible country field locations
      if (item.properties) {
        Object.keys(item.properties).forEach(key => {
          if (key.toLowerCase().includes('country') || key.toLowerCase().includes('region')) {
            countryFields[`properties.${key}`] = item.properties[key];
          }
        });
      }
      
      ['country', 'countries', 'culture', 'locale', 'region'].forEach(field => {
        if (item[field]) {
          countryFields[field] = item[field];
        }
      });
      
      if (Object.keys(countryFields).length > 0) {
        console.log(`Item ${index + 1} "${item.title}":`, countryFields);
      }
    });

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testReportsFetch();