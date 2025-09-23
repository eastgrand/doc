import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint will help us debug by returning the federated layer service status
  
  try {
    const { FederatedLayerService } = await import('@/lib/services/FederatedLayerService');
    const federatedService = new FederatedLayerService();
    
    // Initialize the service
    await federatedService.initializeWithSingleService();
    
    // Try to create a test federated layer
    const testConfig = {
      layerName: 'Test Debug Layer',
      services: [
        {
          url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer',
          identifier: 'IL',
          layerId: 112
        },
        {
          url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer',
          identifier: 'IN',
          layerId: 111
        },
        {
          url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer',
          identifier: 'WI',
          layerId: 110
        }
      ],
      parallelFetch: false // Sequential for debugging
    };
    
    console.log('Creating federated layer with config:', testConfig);
    
    const layer = await federatedService.createFederatedLayer(testConfig);
    
    res.status(200).json({
      success: true,
      layerInfo: {
        title: layer.title,
        objectIdField: layer.objectIdField,
        fields: layer.fields?.map(f => ({ name: f.name, type: f.type })),
        // Try to get feature count
        sourceCount: (layer.source as any)?.length || 0
      }
    });
  } catch (error: any) {
    console.error('Debug API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}