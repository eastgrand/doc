import { useEffect, useState } from 'react';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';

export default function TestFederated() {
  const [result, setResult] = useState<string>('Testing...');
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    async function testFederatedLayer() {
      console.log('Testing federated layer creation...');
      
      // Create test features with unique OBJECTIDs
      const features = [];
      
      // Create 10809 features to match our actual scenario
      let objectId = 1;
      
      // IL: 4000 features
      for (let i = 0; i < 4000; i++) {
        const graphic = new Graphic({
          geometry: new Polygon({
            rings: [[
              [-89 + (i % 40) * 0.1, 41 + Math.floor(i / 40) * 0.1],
              [-89 + (i % 40) * 0.1, 41.1 + Math.floor(i / 40) * 0.1],
              [-88.9 + (i % 40) * 0.1, 41.1 + Math.floor(i / 40) * 0.1],
              [-88.9 + (i % 40) * 0.1, 41 + Math.floor(i / 40) * 0.1],
              [-89 + (i % 40) * 0.1, 41 + Math.floor(i / 40) * 0.1]
            ]],
            spatialReference: { wkid: 4326 }
          }),
          attributes: {
            OBJECTID: objectId++,
            HEXAGON_ID: `il_hex_${i}`,
            SOURCE_STATE: 'IL',
            id: `il_hex_${i}`, // Original hexagon ID field
            thematic_value: Math.random() * 100
          }
        });
        features.push(graphic);
      }
      
      // IN: 2809 features
      for (let i = 0; i < 2809; i++) {
        const graphic = new Graphic({
          geometry: new Polygon({
            rings: [[
              [-86 + (i % 40) * 0.1, 40 + Math.floor(i / 40) * 0.1],
              [-86 + (i % 40) * 0.1, 40.1 + Math.floor(i / 40) * 0.1],
              [-85.9 + (i % 40) * 0.1, 40.1 + Math.floor(i / 40) * 0.1],
              [-85.9 + (i % 40) * 0.1, 40 + Math.floor(i / 40) * 0.1],
              [-86 + (i % 40) * 0.1, 40 + Math.floor(i / 40) * 0.1]
            ]],
            spatialReference: { wkid: 4326 }
          }),
          attributes: {
            OBJECTID: objectId++,
            HEXAGON_ID: `in_hex_${i}`,
            SOURCE_STATE: 'IN',
            id: `in_hex_${i}`,
            thematic_value: Math.random() * 100
          }
        });
        features.push(graphic);
      }
      
      // WI: 4000 features
      for (let i = 0; i < 4000; i++) {
        const graphic = new Graphic({
          geometry: new Polygon({
            rings: [[
              [-90 + (i % 40) * 0.1, 43 + Math.floor(i / 40) * 0.1],
              [-90 + (i % 40) * 0.1, 43.1 + Math.floor(i / 40) * 0.1],
              [-89.9 + (i % 40) * 0.1, 43.1 + Math.floor(i / 40) * 0.1],
              [-89.9 + (i % 40) * 0.1, 43 + Math.floor(i / 40) * 0.1],
              [-90 + (i % 40) * 0.1, 43 + Math.floor(i / 40) * 0.1]
            ]],
            spatialReference: { wkid: 4326 }
          }),
          attributes: {
            OBJECTID: objectId++,
            HEXAGON_ID: `wi_hex_${i}`,
            SOURCE_STATE: 'WI',
            id: `wi_hex_${i}`,
            thematic_value: Math.random() * 100
          }
        });
        features.push(graphic);
      }
      
      console.log(`Created ${features.length} test features`);
      console.log('First feature OBJECTID:', features[0].attributes.OBJECTID);
      console.log('Last feature OBJECTID:', features[features.length - 1].attributes.OBJECTID);
      
      // Check for duplicate OBJECTIDs
      const objectIds = features.map(f => f.attributes.OBJECTID);
      const uniqueObjectIds = new Set(objectIds);
      console.log('Total OBJECTIDs:', objectIds.length);
      console.log('Unique OBJECTIDs:', uniqueObjectIds.size);
      
      // Define fields
      const fields = [
        { name: "OBJECTID", type: "oid", alias: "Object ID" },
        { name: "HEXAGON_ID", type: "string", alias: "Hexagon ID" },
        { name: "SOURCE_STATE", type: "string", alias: "Source State" },
        { name: "id", type: "string", alias: "Original ID" },
        { name: "thematic_value", type: "double", alias: "Thematic Value" }
      ];
      
      try {
        // Create federated layer
        const federatedLayer = new FeatureLayer({
          title: "Test Federated Layer (IL, IN, WI)",
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
        
        // Watch for validation errors
        (federatedLayer as any).on('error', (event: any) => {
          console.error('Layer error event:', event);
          setErrors(prev => [...prev, event]);
        });
        
        // Try to load the layer
        await federatedLayer.load();
        console.log('Layer loaded successfully');
        
        setResult(`SUCCESS: Layer loaded with ${features.length} features and ${uniqueObjectIds.size} unique OBJECTIDs`);
        
      } catch (error: any) {
        console.error('Error creating federated layer:', error);
        setResult(`ERROR: ${error.message}`);
        setErrors([error]);
      }
    }

    testFederatedLayer();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Testing Federated Layer Creation</h1>
      <h2>Result:</h2>
      <pre>{result}</pre>
      
      {errors.length > 0 && (
        <>
          <h2>Errors:</h2>
          <pre style={{ color: 'red' }}>
            {errors.map((e, i) => (
              <div key={i}>{JSON.stringify(e, null, 2)}</div>
            ))}
          </pre>
        </>
      )}
      
      <p>Check browser console for detailed logs</p>
    </div>
  );
}