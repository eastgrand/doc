// Debug script to test federated layer creation
const FeatureLayer = require('@arcgis/core/layers/FeatureLayer').default;
const Graphic = require('@arcgis/core/Graphic').default;
const Point = require('@arcgis/core/geometry/Point').default;
const Polygon = require('@arcgis/core/geometry/Polygon').default;

async function testFederatedLayer() {
  console.log('Testing federated layer creation...');
  
  // Create test features with unique OBJECTIDs
  const features = [];
  for (let i = 1; i <= 10; i++) {
    const graphic = new Graphic({
      geometry: new Polygon({
        rings: [[
          [-89 + i * 0.1, 41],
          [-89 + i * 0.1, 41.1],
          [-88.9 + i * 0.1, 41.1],
          [-88.9 + i * 0.1, 41],
          [-89 + i * 0.1, 41]
        ]],
        spatialReference: { wkid: 4326 }
      }),
      attributes: {
        OBJECTID: i,
        HEXAGON_ID: `hex_${i}`,
        SOURCE_STATE: i <= 4 ? 'IL' : i <= 7 ? 'IN' : 'WI',
        thematic_value: Math.random() * 100
      }
    });
    features.push(graphic);
  }
  
  console.log(`Created ${features.length} test features`);
  
  // Define fields
  const fields = [
    { name: "OBJECTID", type: "oid", alias: "Object ID" },
    { name: "HEXAGON_ID", type: "string", alias: "Hexagon ID" },
    { name: "SOURCE_STATE", type: "string", alias: "Source State" },
    { name: "thematic_value", type: "double", alias: "Thematic Value" }
  ];
  
  try {
    // Create federated layer
    const federatedLayer = new FeatureLayer({
      title: "Test Federated Layer",
      source: features,
      fields: fields,
      objectIdField: "OBJECTID",
      geometryType: "polygon",
      spatialReference: { wkid: 4326 }
    });
    
    console.log('Layer created successfully');
    console.log('Layer properties:', {
      title: federatedLayer.title,
      featureCount: features.length,
      objectIdField: federatedLayer.objectIdField,
      fields: federatedLayer.fields?.map(f => ({ name: f.name, type: f.type }))
    });
    
    // Try to load the layer
    await federatedLayer.load();
    console.log('Layer loaded successfully');
    
  } catch (error) {
    console.error('Error creating federated layer:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      details: error.details || 'No details'
    });
  }
}

// Run the test
testFederatedLayer().catch(console.error);