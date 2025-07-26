/**
 * Sample Data Generator
 * 
 * This utility creates sample data for testing visualizations
 */

/**
 * Generate a sample polygon feature
 * @param {number} id - The feature ID
 * @param {object} attributes - The feature attributes
 * @returns {object} A polygon feature
 */
function generatePolygon(id, attributes = {}) {
  // Create a simple rectangle with random coordinates
  const centerX = Math.random() * 360 - 180; // -180 to 180
  const centerY = Math.random() * 170 - 85;  // -85 to 85 (avoid poles)
  const width = Math.random() * 2 + 0.1;     // 0.1 to 2.1 degrees
  const height = Math.random() * 2 + 0.1;    // 0.1 to 2.1 degrees
  
  const left = centerX - width / 2;
  const right = centerX + width / 2;
  const top = centerY + height / 2;
  const bottom = centerY - height / 2;
  
  return {
    geometry: {
      type: "Polygon",
      rings: [
        [
          [left, bottom],
          [left, top],
          [right, top],
          [right, bottom],
          [left, bottom]
        ]
      ],
      spatialReference: { wkid: 4326 }
    },
    attributes: {
      OBJECTID: id,
      ...attributes
    }
  };
}

/**
 * Generate a sample point feature
 * @param {number} id - The feature ID
 * @param {object} attributes - The feature attributes
 * @returns {object} A point feature
 */
function generatePoint(id, attributes = {}) {
  // Create a point with random coordinates
  const x = Math.random() * 360 - 180; // -180 to 180
  const y = Math.random() * 170 - 85;  // -85 to 85 (avoid poles)
  
  return {
    geometry: {
      type: "Point",
      x,
      y,
      spatialReference: { wkid: 4326 }
    },
    attributes: {
      OBJECTID: id,
      ...attributes
    }
  };
}

/**
 * Generate random sample data for polygon features
 * @param {number} count - Number of features to generate
 * @returns {object} Sample data object
 */
export function generatePolygonSampleData(count = 50) {
  const features = [];
  
  // Categories for categorical variables
  const categories = ["Residential", "Commercial", "Industrial", "Agricultural", "Recreational"];
  
  for (let i = 0; i < count; i++) {
    // Generate correlated random values
    const baseValue = Math.random();
    const population = Math.floor(baseValue * 100000 + 1000);
    const income = Math.floor((baseValue * 0.7 + Math.random() * 0.3) * 150000 + 20000);
    const education = (baseValue * 0.8 + Math.random() * 0.2) * 100;
    const housing = Math.floor((baseValue * 0.6 + Math.random() * 0.4) * 1000000 + 100000);
    const poverty = (1 - baseValue) * 0.7 + Math.random() * 0.3 * 30;
    const growth = (Math.random() * 2 - 1) * 15; // -15% to +15% growth
    
    features.push(generatePolygon(i + 1, {
      population,
      income,
      education,
      housing,
      poverty,
      growth,
      category: categories[Math.floor(Math.random() * categories.length)],
      name: `Region ${i + 1}`
    }));
  }
  
  return {
    features,
    layerName: "Test Regions",
    rendererField: "population",
    layerConfig: {
      fields: [
        { name: "population", label: "Population", type: "double" },
        { name: "income", label: "Median Income", type: "double" },
        { name: "education", label: "Education Level", type: "double" },
        { name: "housing", label: "Housing Price", type: "double" },
        { name: "poverty", label: "Poverty Rate", type: "double" },
        { name: "growth", label: "Growth Rate", type: "double" },
        { name: "category", label: "Land Use", type: "string" },
        { name: "name", label: "Region Name", type: "string" }
      ]
    }
  };
}

/**
 * Generate random sample data for point features
 * @param {number} count - Number of features to generate
 * @returns {object} Sample data object
 */
export function generatePointSampleData(count = 200) {
  const features = [];
  
  // Categories for categorical variables
  const categories = ["Restaurant", "Retail", "Service", "Healthcare", "Entertainment"];
  const types = ["A", "B", "C"];
  
  for (let i = 0; i < count; i++) {
    // Generate random values
    const value = Math.floor(Math.random() * 1000) + 100;
    const size = Math.floor(Math.random() * 5000) + 500;
    const rating = Math.random() * 5;
    const age = Math.floor(Math.random() * 20) + 1;
    
    features.push(generatePoint(i + 1, {
      value,
      size,
      rating,
      age,
      category: categories[Math.floor(Math.random() * categories.length)],
      type: types[Math.floor(Math.random() * types.length)],
      name: `Location ${i + 1}`
    }));
  }
  
  return {
    features,
    layerName: "Test Locations",
    rendererField: "value",
    layerConfig: {
      fields: [
        { name: "value", label: "Value", type: "double" },
        { name: "size", label: "Size", type: "double" },
        { name: "rating", label: "Rating", type: "double" },
        { name: "age", label: "Age", type: "double" },
        { name: "category", label: "Category", type: "string" },
        { name: "type", label: "Type", type: "string" },
        { name: "name", label: "Name", type: "string" }
      ]
    }
  };
}

/**
 * Generate network data (points with connections)
 * @param {number} nodeCount - Number of nodes
 * @param {number} connectionCount - Number of connections
 * @returns {object} Sample network data
 */
export function generateNetworkData(nodeCount = 25, connectionCount = 40) {
  // Generate points
  const points = [];
  for (let i = 0; i < nodeCount; i++) {
    const x = Math.random() * 360 - 180;
    const y = Math.random() * 170 - 85;
    points.push({
      id: i + 1,
      x,
      y,
      value: Math.floor(Math.random() * 100) + 10,
      name: `Node ${i + 1}`
    });
  }
  
  // Generate connections
  const connections = [];
  for (let i = 0; i < connectionCount; i++) {
    const sourceIndex = Math.floor(Math.random() * nodeCount);
    let targetIndex;
    do {
      targetIndex = Math.floor(Math.random() * nodeCount);
    } while (targetIndex === sourceIndex);
    
    const source = points[sourceIndex];
    const target = points[targetIndex];
    
    connections.push({
      id: i + 1,
      sourceId: source.id,
      targetId: target.id,
      value: Math.floor(Math.random() * 50) + 5,
      geometry: {
        type: "LineString",
        paths: [
          [source.x, source.y],
          [target.x, target.y]
        ],
        spatialReference: { wkid: 4326 }
      },
      attributes: {
        OBJECTID: i + 1,
        sourceId: source.id,
        targetId: target.id,
        value: Math.floor(Math.random() * 50) + 5,
        name: `Connection ${i + 1}`
      }
    });
  }
  
  // Convert points to features
  const nodeFeatures = points.map(point => ({
    geometry: {
      type: "Point",
      x: point.x,
      y: point.y,
      spatialReference: { wkid: 4326 }
    },
    attributes: {
      OBJECTID: point.id,
      nodeId: point.id,
      value: point.value,
      name: point.name,
      connections: connections.filter(c => c.sourceId === point.id || c.targetId === point.id).length
    }
  }));
  
  return {
    nodes: {
      features: nodeFeatures,
      layerName: "Network Nodes",
      layerConfig: {
        fields: [
          { name: "nodeId", label: "Node ID", type: "integer" },
          { name: "value", label: "Value", type: "double" },
          { name: "name", label: "Name", type: "string" },
          { name: "connections", label: "Connection Count", type: "integer" }
        ]
      }
    },
    connections: {
      features: connections,
      layerName: "Network Connections",
      layerConfig: {
        fields: [
          { name: "sourceId", label: "Source ID", type: "integer" },
          { name: "targetId", label: "Target ID", type: "integer" },
          { name: "value", label: "Value", type: "double" },
          { name: "name", label: "Name", type: "string" }
        ]
      }
    }
  };
}

/**
 * Generate sample data for all types of visualizations
 * @returns {object} Object containing all sample datasets
 */
export function generateAllSampleData() {
  return {
    polygons: generatePolygonSampleData(100),
    points: generatePointSampleData(300),
    network: generateNetworkData(30, 60)
  };
} 