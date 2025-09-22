// Layer configuration with preserved structure
// Auto-generated on 2025-09-22T10:56:15.792953
// This file maintains compatibility with existing system components

import { LayerConfig } from '../types/layers';

export type LayerType = 'index' | 'point' | 'percentage' | 'amount';
export type AccessLevel = 'read' | 'write' | 'admin';

export const concepts = {
  population: {
    terms: [
      'population',
      'people',
      'residents',
      'inhabitants',
      'demographics',
      'age',
      'gender',
      'household',
      'family',
      'diversity',
      'cultural groups'
    ],
    weight: 10,
  },
  income: {
    terms: [
      'income',
      'earnings',
      'salary',
      'wage',
      'affluence',
      'wealth',
      'disposable'
    ],
    weight: 25,
  },
  race: {
    terms: [
      'race',
      'ethnicity',
      'diverse',
      'diversity',
      'racial',
      'white',
      'black',
      'asian',
      'american indian',
      'pacific islander',
      'hispanic'
    ],
    weight: 20,
  },
  spending: {
    terms: [
      'spending',
      'purchase',
      'bought',
      'shopped',
      'consumer',
      'expense',
      'shopping'
    ],
    weight: 25,
  },
  sports: {
    terms: [
      'sports',
      'athletic',
      'exercise',
      'fan',
      'participation',
      'NBA',
      'NFL',
      'MLB',
      'NHL',
      'soccer',
      'running',
      'jogging',
      'yoga',
      'weight lifting'
    ],
    weight: 20,
  },
  brands: {
    terms: [
      'brand',
      'Nike',
      'Adidas',
      'Jordan',
      'Converse',
      'Reebok',
      'Puma',
      'New Balance',
      'Asics',
      'Skechers',
      'Alo',
      'Lululemon',
      'On'
    ],
    weight: 25,
  },
  retail: {
    terms: [
      'retail',
      'store',
      'shop',
      'Dick\'s Sporting Goods',
      'retail store'
    ],
    weight: 15,
  },
  clothing: {
    terms: [
      'clothing',
      'apparel',
      'wear',
      'workout wear',
      'athletic wear',
      'shoes',
      'footwear',
      'sneakers'
    ],
    weight: 20,
  },
  household: {
    terms: [
      'household',
      'family',
      'home',
      'housing',
      'residence'
    ],
    weight: 15,
  },
  trends: {
    terms: [
      'trends',
      'google',
      'search',
      'interest',
      'popularity',
      'search volume',
      'search data',
      'search analytics',
      'trending',
      'search patterns',
      'consumer interest',
      'market attention',
      'brand awareness',
      'search interest',
      'online demand',
      'consumer demand',
      'brand popularity',
      'search frequency',
      'search trends',
      'search queries',
      'google search',
      'search index'
    ],
    weight: 20,
  },
  geographic: {
    terms: [
      'ZIP',
      'DMA',
      'local',
      'regional',
      'area',
      'location',
      'zone',
      'region'
    ],
    weight: 15,
  },
};

// Helper function to ensure each layer has a DESCRIPTION field
const ensureLayerHasDescriptionField = (layerConfig: LayerConfig): LayerConfig => {
  // Clone the layer config
  const updatedConfig = { ...layerConfig };
  
  // Check if fields array exists
  if (!updatedConfig.fields) {
    updatedConfig.fields = [];
  }
  
  // Check if DESCRIPTION field already exists
  const hasDescription = updatedConfig.fields.some(field => field.name === 'DESCRIPTION');
  
  // If DESCRIPTION field doesn't exist, add it
  if (!hasDescription) {
    updatedConfig.fields.push({
      name: 'DESCRIPTION',
      type: 'string',
      alias: 'ZIP Code',
      label: 'ZIP Code'
    });
  }
  
  return updatedConfig;
};

// Helper function to update renderer field to use percentage field when available
const updateRendererFieldForPercentage = (layerConfig: LayerConfig): LayerConfig => {
  const updatedConfig = { ...layerConfig };
  
  // Check if this layer has percentage fields
  const percentageField = updatedConfig.fields?.find(field => 
    field.name.endsWith('_P') && field.type === 'double'
  );
  
  // If a percentage field exists, use it as the renderer field
  if (percentageField) {
    updatedConfig.rendererField = percentageField.name;
  }
  
  return updatedConfig;
};

// === AUTO-GENERATED LAYER CONFIGURATIONS ===
export const baseLayerConfigs: LayerConfig[] = [
  {
    id: 'Unknown_Service_layer_0',
    name: 'Geographies',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/0',
    group: 'general',
    description: 'Business Analyst Layer: Geographies',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'Shape__Area',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_1',
    name: 'Area of interest',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/1',
    group: 'general',
    description: 'Business Analyst Layer: Area of interest',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'thematic_value',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Geographic"
  },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_2',
    name: 'Areas',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/2',
    group: 'general',
    description: 'Business Analyst Layer: Areas',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPL1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Geographic"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPL1",
            "type": "double",
            "alias": "2025 Savvy Suburbanites (L1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPL1_P",
            "type": "double",
            "alias": "2025 Savvy Suburbanites (L1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "Internal"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_3',
    name: '2025 Total Pop in Tapestry Seg L1 ( ) by Resolution 6',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/3',
    group: 'general',
    description: 'Business Analyst Layer: 2025 Total Pop in Tapestry Seg L1 ( ) by Resolution 6',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPL1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPL1",
            "type": "double",
            "alias": "2025 Savvy Suburbanites (L1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPL1_P",
            "type": "double",
            "alias": "2025 Savvy Suburbanites (L1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_4',
    name: 'WI Total Pop in Tapestry Seg K1',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/4',
    group: 'general',
    description: 'Business Analyst Layer: WI Total Pop in Tapestry Seg K1',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPK1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPK1",
            "type": "double",
            "alias": "2025 Legacy Hills (K1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPK1_P",
            "type": "double",
            "alias": "2025 Legacy Hills (K1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_5',
    name: 'WI Total Pop in Tapestry Seg L1',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/5',
    group: 'general',
    description: 'Business Analyst Layer: WI Total Pop in Tapestry Seg L1',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPL1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPL1",
            "type": "double",
            "alias": "2025 Savvy Suburbanites (L1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPL1_P",
            "type": "double",
            "alias": "2025 Savvy Suburbanites (L1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_6',
    name: 'IN Total Pop in Tapestry Seg J1',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/6',
    group: 'general',
    description: 'Business Analyst Layer: IN Total Pop in Tapestry Seg J1',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPJ1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPJ1",
            "type": "double",
            "alias": "2025 Senior Escapes (J1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPJ1_P",
            "type": "double",
            "alias": "2025 Senior Escapes (J1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_7',
    name: 'WI Total Pop in Tapestry Seg J1',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/7',
    group: 'general',
    description: 'Business Analyst Layer: WI Total Pop in Tapestry Seg J1',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPJ1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPJ1",
            "type": "double",
            "alias": "2025 Senior Escapes (J1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPJ1_P",
            "type": "double",
            "alias": "2025 Senior Escapes (J1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_8',
    name: 'IL Total Pop in Tapestry Seg J1',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/8',
    group: 'general',
    description: 'Business Analyst Layer: IL Total Pop in Tapestry Seg J1',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPJ1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPJ1",
            "type": "double",
            "alias": "2025 Senior Escapes (J1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPJ1_P",
            "type": "double",
            "alias": "2025 Senior Escapes (J1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_9',
    name: 'IL Total Pop in Tapestry Seg I1',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/9',
    group: 'general',
    description: 'Business Analyst Layer: IL Total Pop in Tapestry Seg I1',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPI1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPI1",
            "type": "double",
            "alias": "2025 Small Town Sincerity (I1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPI1_P",
            "type": "double",
            "alias": "2025 Small Town Sincerity (I1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_10',
    name: 'WI Total Pop in Tapestry Seg I1',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/10',
    group: 'general',
    description: 'Business Analyst Layer: WI Total Pop in Tapestry Seg I1',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPI1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPI1",
            "type": "double",
            "alias": "2025 Small Town Sincerity (I1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPI1_P",
            "type": "double",
            "alias": "2025 Small Town Sincerity (I1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_11',
    name: 'WI Total Pop in Tapestry Seg K2',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/11',
    group: 'general',
    description: 'Business Analyst Layer: WI Total Pop in Tapestry Seg K2',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPK2_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPK2",
            "type": "double",
            "alias": "2025 Middle Ground (K2) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPK2_P",
            "type": "double",
            "alias": "2025 Middle Ground (K2) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_12',
    name: 'IN Total Pop in Tapestry Seg I1',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/12',
    group: 'general',
    description: 'Business Analyst Layer: IN Total Pop in Tapestry Seg I1',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPI1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPI1",
            "type": "double",
            "alias": "2025 Small Town Sincerity (I1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPI1_P",
            "type": "double",
            "alias": "2025 Small Town Sincerity (I1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_13',
    name: 'IL Total Pop in Tapestry Seg K2',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/13',
    group: 'general',
    description: 'Business Analyst Layer: IL Total Pop in Tapestry Seg K2',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPK2_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPK2",
            "type": "double",
            "alias": "2025 Middle Ground (K2) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPK2_P",
            "type": "double",
            "alias": "2025 Middle Ground (K2) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_14',
    name: 'IN Total Pop in Tapestry Seg K2',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/14',
    group: 'general',
    description: 'Business Analyst Layer: IN Total Pop in Tapestry Seg K2',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPK2_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPK2",
            "type": "double",
            "alias": "2025 Middle Ground (K2) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPK2_P",
            "type": "double",
            "alias": "2025 Middle Ground (K2) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_15',
    name: 'IN Total Pop in Tapestry Seg K1',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/15',
    group: 'general',
    description: 'Business Analyst Layer: IN Total Pop in Tapestry Seg K1',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPK1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPK1",
            "type": "double",
            "alias": "2025 Legacy Hills (K1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPK1_P",
            "type": "double",
            "alias": "2025 Legacy Hills (K1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_16',
    name: 'IL Total Pop in Tapestry Seg K1',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/16',
    group: 'general',
    description: 'Business Analyst Layer: IL Total Pop in Tapestry Seg K1',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'TPOPK1_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "TPOPK1",
            "type": "double",
            "alias": "2025 Legacy Hills (K1) Tapestry Total Population (Esri)"
      },
      {
            "name": "TPOPK1_P",
            "type": "double",
            "alias": "2025 Legacy Hills (K1) Tapestry Total Population (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_17',
    name: 'IL Attended Movie 6 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/17',
    group: 'general',
    description: 'Business Analyst Layer: IL Attended Movie 6 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20044A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20044A_B",
            "type": "double",
            "alias": "2025 Attended Movie Last 6 Mo"
      },
      {
            "name": "MP20044A_B_P",
            "type": "double",
            "alias": "2025 Attended Movie Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_18',
    name: 'IN Attended Movie 6 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/18',
    group: 'general',
    description: 'Business Analyst Layer: IN Attended Movie 6 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20044A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20044A_B",
            "type": "double",
            "alias": "2025 Attended Movie Last 6 Mo"
      },
      {
            "name": "MP20044A_B_P",
            "type": "double",
            "alias": "2025 Attended Movie Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_19',
    name: 'WI Attended Movie 6 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/19',
    group: 'general',
    description: 'Business Analyst Layer: WI Attended Movie 6 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20044A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20044A_B",
            "type": "double",
            "alias": "2025 Attended Movie Last 6 Mo"
      },
      {
            "name": "MP20044A_B_P",
            "type": "double",
            "alias": "2025 Attended Movie Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_20',
    name: 'WI Viewed Movie (On-Demand) 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/20',
    group: 'general',
    description: 'Business Analyst Layer: WI Viewed Movie (On-Demand) 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP23018A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP23018A_B",
            "type": "double",
            "alias": "2025 Viewed Movie (Video-on-Demand) Last 30 Days"
      },
      {
            "name": "MP23018A_B_P",
            "type": "double",
            "alias": "2025 Viewed Movie (Video-on-Demand) Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_21',
    name: 'IN Viewed Movie (On-Demand) 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/21',
    group: 'general',
    description: 'Business Analyst Layer: IN Viewed Movie (On-Demand) 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP23018A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP23018A_B",
            "type": "double",
            "alias": "2025 Viewed Movie (Video-on-Demand) Last 30 Days"
      },
      {
            "name": "MP23018A_B_P",
            "type": "double",
            "alias": "2025 Viewed Movie (Video-on-Demand) Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_22',
    name: 'IL Viewed Movie (On-Demand) 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/22',
    group: 'general',
    description: 'Business Analyst Layer: IL Viewed Movie (On-Demand) 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP23018A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP23018A_B",
            "type": "double",
            "alias": "2025 Viewed Movie (Video-on-Demand) Last 30 Days"
      },
      {
            "name": "MP23018A_B_P",
            "type": "double",
            "alias": "2025 Viewed Movie (Video-on-Demand) Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_23',
    name: 'IL Spending on Tickets to Movies (Avg)',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/23',
    group: 'general',
    description: 'Business Analyst Layer: IL Spending on Tickets to Movies (Avg)',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9078_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9078_X",
            "type": "double",
            "alias": "2025 Tickets to Movies"
      },
      {
            "name": "X9078_X_A",
            "type": "double",
            "alias": "2025 Tickets to Movies (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_24',
    name: 'IN Spending on Tickets to Movies (Avg)',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/24',
    group: 'general',
    description: 'Business Analyst Layer: IN Spending on Tickets to Movies (Avg)',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9078_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9078_X",
            "type": "double",
            "alias": "2025 Tickets to Movies"
      },
      {
            "name": "X9078_X_A",
            "type": "double",
            "alias": "2025 Tickets to Movies (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_25',
    name: 'WI Spending on Tickets to Movies (Avg)',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/25',
    group: 'general',
    description: 'Business Analyst Layer: WI Spending on Tickets to Movies (Avg)',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9078_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9078_X",
            "type": "double",
            "alias": "2025 Tickets to Movies"
      },
      {
            "name": "X9078_X_A",
            "type": "double",
            "alias": "2025 Tickets to Movies (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_26',
    name: 'WI Purchased Music Through Oth Online Ser',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/26',
    group: 'general',
    description: 'Business Analyst Layer: WI Purchased Music Through Oth Online Ser',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22087A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22087A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through Other Online Service Last 6 Mo"
      },
      {
            "name": "MP22087A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through Other Online Service Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_27',
    name: 'IN Purchased Music Through Oth Online Ser',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/27',
    group: 'general',
    description: 'Business Analyst Layer: IN Purchased Music Through Oth Online Ser',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22087A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22087A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through Other Online Service Last 6 Mo"
      },
      {
            "name": "MP22087A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through Other Online Service Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_28',
    name: 'IL Purchased Music Through Oth Online Ser',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/28',
    group: 'general',
    description: 'Business Analyst Layer: IL Purchased Music Through Oth Online Ser',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22087A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22087A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through Other Online Service Last 6 Mo"
      },
      {
            "name": "MP22087A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through Other Online Service Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_29',
    name: 'IL Purchased Music Through Audible',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/29',
    group: 'general',
    description: 'Business Analyst Layer: IL Purchased Music Through Audible',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22119A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22119A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through Audible Last 6 Mo"
      },
      {
            "name": "MP22119A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through Audible Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_30',
    name: 'IN Purchased Music Through Audible',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/30',
    group: 'general',
    description: 'Business Analyst Layer: IN Purchased Music Through Audible',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22119A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22119A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through Audible Last 6 Mo"
      },
      {
            "name": "MP22119A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through Audible Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_31',
    name: 'WI Purchased Music Through Audible',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/31',
    group: 'general',
    description: 'Business Analyst Layer: WI Purchased Music Through Audible',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22119A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22119A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through Audible Last 6 Mo"
      },
      {
            "name": "MP22119A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through Audible Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_32',
    name: 'WI Purchased Music Through iTunes',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/32',
    group: 'general',
    description: 'Business Analyst Layer: WI Purchased Music Through iTunes',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22086A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22086A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through iTunes Last 6 Mo"
      },
      {
            "name": "MP22086A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through iTunes Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_33',
    name: 'IL Purchased Music Through iTunes',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/33',
    group: 'general',
    description: 'Business Analyst Layer: IL Purchased Music Through iTunes',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22086A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22086A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through iTunes Last 6 Mo"
      },
      {
            "name": "MP22086A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through iTunes Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_34',
    name: 'IN Purchased Music Through iTunes',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/34',
    group: 'general',
    description: 'Business Analyst Layer: IN Purchased Music Through iTunes',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22086A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22086A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through iTunes Last 6 Mo"
      },
      {
            "name": "MP22086A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through iTunes Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_35',
    name: 'IL Purchased Music at Dept Store',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/35',
    group: 'general',
    description: 'Business Analyst Layer: IL Purchased Music at Dept Store',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22082A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22082A_B",
            "type": "double",
            "alias": "2025 Purchased Music at Discount Department Store Last 6 Mo"
      },
      {
            "name": "MP22082A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music at Discount Department Store Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_36',
    name: 'IN Purchased Music at Dept Store',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/36',
    group: 'general',
    description: 'Business Analyst Layer: IN Purchased Music at Dept Store',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22082A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22082A_B",
            "type": "double",
            "alias": "2025 Purchased Music at Discount Department Store Last 6 Mo"
      },
      {
            "name": "MP22082A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music at Discount Department Store Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_37',
    name: 'WI Purchased Music at Dept Store',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/37',
    group: 'general',
    description: 'Business Analyst Layer: WI Purchased Music at Dept Store',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22082A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22082A_B",
            "type": "double",
            "alias": "2025 Purchased Music at Discount Department Store Last 6 Mo"
      },
      {
            "name": "MP22082A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music at Discount Department Store Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_38',
    name: 'WI Purchased Music Through Amazon Music',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/38',
    group: 'general',
    description: 'Business Analyst Layer: WI Purchased Music Through Amazon Music',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22084A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22084A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through Amazon Music Last 6 Mo"
      },
      {
            "name": "MP22084A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through Amazon Music Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_39',
    name: 'IN Purchased Music Through Amazon Music',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/39',
    group: 'general',
    description: 'Business Analyst Layer: IN Purchased Music Through Amazon Music',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22084A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22084A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through Amazon Music Last 6 Mo"
      },
      {
            "name": "MP22084A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through Amazon Music Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_40',
    name: 'IL Purchased Music Through Amazon Music',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/40',
    group: 'general',
    description: 'Business Analyst Layer: IL Purchased Music Through Amazon Music',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22084A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22084A_B",
            "type": "double",
            "alias": "2025 Purchased Music Through Amazon Music Last 6 Mo"
      },
      {
            "name": "MP22084A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music Through Amazon Music Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_41',
    name: 'IL Purchased Biography 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/41',
    group: 'general',
    description: 'Business Analyst Layer: IL Purchased Biography 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP05009A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Consumer"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP05009A_B",
            "type": "double",
            "alias": "2025 Purchased Biography Last 12 Mo"
      },
      {
            "name": "MP05009A_B_P",
            "type": "double",
            "alias": "2025 Purchased Biography Last 12 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_42',
    name: 'IN Purchased Biography 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/42',
    group: 'general',
    description: 'Business Analyst Layer: IN Purchased Biography 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP05009A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Consumer"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP05009A_B",
            "type": "double",
            "alias": "2025 Purchased Biography Last 12 Mo"
      },
      {
            "name": "MP05009A_B_P",
            "type": "double",
            "alias": "2025 Purchased Biography Last 12 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_43',
    name: 'WI Purchased Biography 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/43',
    group: 'general',
    description: 'Business Analyst Layer: WI Purchased Biography 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP05009A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Consumer"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP05009A_B",
            "type": "double",
            "alias": "2025 Purchased Biography Last 12 Mo"
      },
      {
            "name": "MP05009A_B_P",
            "type": "double",
            "alias": "2025 Purchased Biography Last 12 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_44',
    name: 'WI Saw Biography Genre Movie at Theater',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/44',
    group: 'general',
    description: 'Business Analyst Layer: WI Saw Biography Genre Movie at Theater',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20109A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20109A_B",
            "type": "double",
            "alias": "2025 Saw Biography Genre Movie at Theater Last 6 Mo"
      },
      {
            "name": "MP20109A_B_P",
            "type": "double",
            "alias": "2025 Saw Biography Genre Movie at Theater Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_45',
    name: 'IL Saw Biography Genre Movie at Theater',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/45',
    group: 'general',
    description: 'Business Analyst Layer: IL Saw Biography Genre Movie at Theater',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20109A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20109A_B",
            "type": "double",
            "alias": "2025 Saw Biography Genre Movie at Theater Last 6 Mo"
      },
      {
            "name": "MP20109A_B_P",
            "type": "double",
            "alias": "2025 Saw Biography Genre Movie at Theater Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_46',
    name: 'IN Saw Biography Genre Movie at Theater',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/46',
    group: 'general',
    description: 'Business Analyst Layer: IN Saw Biography Genre Movie at Theater',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20109A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20109A_B",
            "type": "double",
            "alias": "2025 Saw Biography Genre Movie at Theater Last 6 Mo"
      },
      {
            "name": "MP20109A_B_P",
            "type": "double",
            "alias": "2025 Saw Biography Genre Movie at Theater Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_47',
    name: 'IL Generation Alpha Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/47',
    group: 'general',
    description: 'Business Analyst Layer: IL Generation Alpha Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'GENALPHACY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "GENALPHACY",
            "type": "double",
            "alias": "2025 Generation Alpha Population (Born 2017 or Later) (Esri)"
      },
      {
            "name": "GENALPHACY_P",
            "type": "double",
            "alias": "2025 Generation Alpha Population (Born 2017 or Later) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_48',
    name: 'IN Generation Alpha Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/48',
    group: 'general',
    description: 'Business Analyst Layer: IN Generation Alpha Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'GENALPHACY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "GENALPHACY",
            "type": "double",
            "alias": "2025 Generation Alpha Population (Born 2017 or Later) (Esri)"
      },
      {
            "name": "GENALPHACY_P",
            "type": "double",
            "alias": "2025 Generation Alpha Population (Born 2017 or Later) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_49',
    name: 'WI Generation Alpha Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/49',
    group: 'general',
    description: 'Business Analyst Layer: WI Generation Alpha Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'GENALPHACY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "GENALPHACY",
            "type": "double",
            "alias": "2025 Generation Alpha Population (Born 2017 or Later) (Esri)"
      },
      {
            "name": "GENALPHACY_P",
            "type": "double",
            "alias": "2025 Generation Alpha Population (Born 2017 or Later) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_50',
    name: 'IL Generation Z Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/50',
    group: 'general',
    description: 'Business Analyst Layer: IL Generation Z Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'GENZ_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "GENZ_CY",
            "type": "double",
            "alias": "2025 Generation Z Population (Born 1999 to 2016) (Esri)"
      },
      {
            "name": "GENZ_CY_P",
            "type": "double",
            "alias": "2025 Generation Z Population (Born 1999 to 2016) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_51',
    name: 'IN Generation Z Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/51',
    group: 'general',
    description: 'Business Analyst Layer: IN Generation Z Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'GENZ_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "GENZ_CY",
            "type": "double",
            "alias": "2025 Generation Z Population (Born 1999 to 2016) (Esri)"
      },
      {
            "name": "GENZ_CY_P",
            "type": "double",
            "alias": "2025 Generation Z Population (Born 1999 to 2016) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_52',
    name: 'WI Generation Z Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/52',
    group: 'general',
    description: 'Business Analyst Layer: WI Generation Z Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'GENZ_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "GENZ_CY",
            "type": "double",
            "alias": "2025 Generation Z Population (Born 1999 to 2016) (Esri)"
      },
      {
            "name": "GENZ_CY_P",
            "type": "double",
            "alias": "2025 Generation Z Population (Born 1999 to 2016) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_53',
    name: 'WI Millennial Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/53',
    group: 'general',
    description: 'Business Analyst Layer: WI Millennial Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MILLENN_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MILLENN_CY",
            "type": "double",
            "alias": "2025 Millennial Population (Born 1981 to 1998) (Esri)"
      },
      {
            "name": "MILLENN_CY_P",
            "type": "double",
            "alias": "2025 Millennial Population (Born 1981 to 1998) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_54',
    name: 'IN Millennial Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/54',
    group: 'general',
    description: 'Business Analyst Layer: IN Millennial Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MILLENN_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MILLENN_CY",
            "type": "double",
            "alias": "2025 Millennial Population (Born 1981 to 1998) (Esri)"
      },
      {
            "name": "MILLENN_CY_P",
            "type": "double",
            "alias": "2025 Millennial Population (Born 1981 to 1998) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_55',
    name: 'IL Millennial Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/55',
    group: 'general',
    description: 'Business Analyst Layer: IL Millennial Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MILLENN_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MILLENN_CY",
            "type": "double",
            "alias": "2025 Millennial Population (Born 1981 to 1998) (Esri)"
      },
      {
            "name": "MILLENN_CY_P",
            "type": "double",
            "alias": "2025 Millennial Population (Born 1981 to 1998) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_56',
    name: 'IL Generation X Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/56',
    group: 'general',
    description: 'Business Analyst Layer: IL Generation X Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'GENX_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "GENX_CY",
            "type": "double",
            "alias": "2025 Generation X Population (Born 1965 to 1980) (Esri)"
      },
      {
            "name": "GENX_CY_P",
            "type": "double",
            "alias": "2025 Generation X Population (Born 1965 to 1980) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_57',
    name: 'IN Generation X Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/57',
    group: 'general',
    description: 'Business Analyst Layer: IN Generation X Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'GENX_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "GENX_CY",
            "type": "double",
            "alias": "2025 Generation X Population (Born 1965 to 1980) (Esri)"
      },
      {
            "name": "GENX_CY_P",
            "type": "double",
            "alias": "2025 Generation X Population (Born 1965 to 1980) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_58',
    name: 'WI Generation X Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/58',
    group: 'general',
    description: 'Business Analyst Layer: WI Generation X Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'GENX_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "GENX_CY",
            "type": "double",
            "alias": "2025 Generation X Population (Born 1965 to 1980) (Esri)"
      },
      {
            "name": "GENX_CY_P",
            "type": "double",
            "alias": "2025 Generation X Population (Born 1965 to 1980) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_59',
    name: 'WI Baby Boomer Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/59',
    group: 'general',
    description: 'Business Analyst Layer: WI Baby Boomer Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'BABYBOOMCY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "BABYBOOMCY",
            "type": "double",
            "alias": "2025 Baby Boomer Population (Born 1946 to 1964) (Esri)"
      },
      {
            "name": "BABYBOOMCY_P",
            "type": "double",
            "alias": "2025 Baby Boomer Population (Born 1946 to 1964) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_60',
    name: 'IN Baby Boomer Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/60',
    group: 'general',
    description: 'Business Analyst Layer: IN Baby Boomer Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'BABYBOOMCY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "BABYBOOMCY",
            "type": "double",
            "alias": "2025 Baby Boomer Population (Born 1946 to 1964) (Esri)"
      },
      {
            "name": "BABYBOOMCY_P",
            "type": "double",
            "alias": "2025 Baby Boomer Population (Born 1946 to 1964) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_61',
    name: 'IL Baby Boomer Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/61',
    group: 'general',
    description: 'Business Analyst Layer: IL Baby Boomer Pop',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'BABYBOOMCY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "BABYBOOMCY",
            "type": "double",
            "alias": "2025 Baby Boomer Population (Born 1946 to 1964) (Esri)"
      },
      {
            "name": "BABYBOOMCY_P",
            "type": "double",
            "alias": "2025 Baby Boomer Population (Born 1946 to 1964) (Esri) (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_62',
    name: 'IL Used Internet for Entmt Celebrity Info',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/62',
    group: 'general',
    description: 'Business Analyst Layer: IL Used Internet for Entmt Celebrity Info',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP19180A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP19180A_B",
            "type": "double",
            "alias": "2025 Used Internet for Entertainment or Celebrity Info Last 30 Days"
      },
      {
            "name": "MP19180A_B_P",
            "type": "double",
            "alias": "2025 Used Internet for Entertainment or Celebrity Info Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_63',
    name: 'IN Used Internet for Entmt Celebrity Info',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/63',
    group: 'general',
    description: 'Business Analyst Layer: IN Used Internet for Entmt Celebrity Info',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP19180A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP19180A_B",
            "type": "double",
            "alias": "2025 Used Internet for Entertainment or Celebrity Info Last 30 Days"
      },
      {
            "name": "MP19180A_B_P",
            "type": "double",
            "alias": "2025 Used Internet for Entertainment or Celebrity Info Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_64',
    name: 'WI Used Internet for Entmt Celebrity Info',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/64',
    group: 'general',
    description: 'Business Analyst Layer: WI Used Internet for Entmt Celebrity Info',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP19180A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP19180A_B",
            "type": "double",
            "alias": "2025 Used Internet for Entertainment or Celebrity Info Last 30 Days"
      },
      {
            "name": "MP19180A_B_P",
            "type": "double",
            "alias": "2025 Used Internet for Entertainment or Celebrity Info Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_65',
    name: 'WI Spending on Tickets to Theatre Operas Concerts',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/65',
    group: 'general',
    description: 'Business Analyst Layer: WI Spending on Tickets to Theatre Operas Concerts',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9073_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9073_X",
            "type": "double",
            "alias": "2025 Tickets to Theatre/Operas/Concerts"
      },
      {
            "name": "X9073_X_A",
            "type": "double",
            "alias": "2025 Tickets to Theatre/Operas/Concerts (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_66',
    name: 'IN Spending on Tickets to Theatre Operas Concerts',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/66',
    group: 'general',
    description: 'Business Analyst Layer: IN Spending on Tickets to Theatre Operas Concerts',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9073_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9073_X",
            "type": "double",
            "alias": "2025 Tickets to Theatre/Operas/Concerts"
      },
      {
            "name": "X9073_X_A",
            "type": "double",
            "alias": "2025 Tickets to Theatre/Operas/Concerts (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_67',
    name: 'IL Spending on Tickets to Theatre Operas Concerts',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/67',
    group: 'general',
    description: 'Business Analyst Layer: IL Spending on Tickets to Theatre Operas Concerts',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9073_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9073_X",
            "type": "double",
            "alias": "2025 Tickets to Theatre/Operas/Concerts"
      },
      {
            "name": "X9073_X_A",
            "type": "double",
            "alias": "2025 Tickets to Theatre/Operas/Concerts (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_68',
    name: 'IL Spending on Entertainment Rec (Avg)',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/68',
    group: 'general',
    description: 'Business Analyst Layer: IL Spending on Entertainment Rec (Avg)',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9001_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9001_X",
            "type": "double",
            "alias": "2025 Entertainment/Recreation"
      },
      {
            "name": "X9001_X_A",
            "type": "double",
            "alias": "2025 Entertainment/Recreation (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_69',
    name: 'IN Spending on Entertainment Rec (Avg)',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/69',
    group: 'general',
    description: 'Business Analyst Layer: IN Spending on Entertainment Rec (Avg)',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9001_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9001_X",
            "type": "double",
            "alias": "2025 Entertainment/Recreation"
      },
      {
            "name": "X9001_X_A",
            "type": "double",
            "alias": "2025 Entertainment/Recreation (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_70',
    name: 'WI Spending on Entertainment Rec (Avg)',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/70',
    group: 'general',
    description: 'Business Analyst Layer: WI Spending on Entertainment Rec (Avg)',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9001_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9001_X",
            "type": "double",
            "alias": "2025 Entertainment/Recreation"
      },
      {
            "name": "X9001_X_A",
            "type": "double",
            "alias": "2025 Entertainment/Recreation (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_71',
    name: 'WI Rented Purchased News Documentary Movie',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/71',
    group: 'general',
    description: 'Business Analyst Layer: WI Rented Purchased News Documentary Movie',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20158A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20158A_B",
            "type": "double",
            "alias": "2025 Rented or Purchased News or Documentary Movie Last 30 Days"
      },
      {
            "name": "MP20158A_B_P",
            "type": "double",
            "alias": "2025 Rented or Purchased News or Documentary Movie Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_72',
    name: 'IN Rented Purchased News Documentary Movie',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/72',
    group: 'general',
    description: 'Business Analyst Layer: IN Rented Purchased News Documentary Movie',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20158A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20158A_B",
            "type": "double",
            "alias": "2025 Rented or Purchased News or Documentary Movie Last 30 Days"
      },
      {
            "name": "MP20158A_B_P",
            "type": "double",
            "alias": "2025 Rented or Purchased News or Documentary Movie Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_73',
    name: 'IL Rented Purchased News Documentary Movie',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/73',
    group: 'general',
    description: 'Business Analyst Layer: IL Rented Purchased News Documentary Movie',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20158A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20158A_B",
            "type": "double",
            "alias": "2025 Rented or Purchased News or Documentary Movie Last 30 Days"
      },
      {
            "name": "MP20158A_B_P",
            "type": "double",
            "alias": "2025 Rented or Purchased News or Documentary Movie Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_74',
    name: 'IL Spending on Records CDs Audio Tapes (Avg)',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/74',
    group: 'general',
    description: 'Business Analyst Layer: IL Spending on Records CDs Audio Tapes (Avg)',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9028_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Consumer"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9028_X",
            "type": "double",
            "alias": "2025 Records/CDs/Audio Tapes"
      },
      {
            "name": "X9028_X_A",
            "type": "double",
            "alias": "2025 Records/CDs/Audio Tapes (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_75',
    name: 'IN Spending on Records CDs Audio Tapes (Avg)',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/75',
    group: 'general',
    description: 'Business Analyst Layer: IN Spending on Records CDs Audio Tapes (Avg)',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9028_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Consumer"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9028_X",
            "type": "double",
            "alias": "2025 Records/CDs/Audio Tapes"
      },
      {
            "name": "X9028_X_A",
            "type": "double",
            "alias": "2025 Records/CDs/Audio Tapes (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_76',
    name: 'WI Spending on Records CDs Audio Tapes (Avg)',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/76',
    group: 'general',
    description: 'Business Analyst Layer: WI Spending on Records CDs Audio Tapes (Avg)',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X9028_X',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Consumer"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "X9028_X",
            "type": "double",
            "alias": "2025 Records/CDs/Audio Tapes"
      },
      {
            "name": "X9028_X_A",
            "type": "double",
            "alias": "2025 Records/CDs/Audio Tapes (Avg)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_77',
    name: 'WI Social Media Follow Music Groups',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/77',
    group: 'general',
    description: 'Business Analyst Layer: WI Social Media Follow Music Groups',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP19165A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP19165A_B",
            "type": "double",
            "alias": "2025 Social Media: Follow Music Groups"
      },
      {
            "name": "MP19165A_B_P",
            "type": "double",
            "alias": "2025 Social Media: Follow Music Groups (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_78',
    name: 'IN Social Media Follow Music Groups',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/78',
    group: 'general',
    description: 'Business Analyst Layer: IN Social Media Follow Music Groups',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP19165A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP19165A_B",
            "type": "double",
            "alias": "2025 Social Media: Follow Music Groups"
      },
      {
            "name": "MP19165A_B_P",
            "type": "double",
            "alias": "2025 Social Media: Follow Music Groups (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_79',
    name: 'IL Social Media Follow Music Groups',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/79',
    group: 'general',
    description: 'Business Analyst Layer: IL Social Media Follow Music Groups',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP19165A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP19165A_B",
            "type": "double",
            "alias": "2025 Social Media: Follow Music Groups"
      },
      {
            "name": "MP19165A_B_P",
            "type": "double",
            "alias": "2025 Social Media: Follow Music Groups (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_80',
    name: 'IL Listened to Apple Music Audio Svc 30',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/80',
    group: 'general',
    description: 'Business Analyst Layer: IL Listened to Apple Music Audio Svc 30',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22088A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22088A_B",
            "type": "double",
            "alias": "2025 Listened to Apple Music Audio Service Last 30 Days"
      },
      {
            "name": "MP22088A_B_P",
            "type": "double",
            "alias": "2025 Listened to Apple Music Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_81',
    name: 'IN Listened to Apple Music Audio Svc 30',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/81',
    group: 'general',
    description: 'Business Analyst Layer: IN Listened to Apple Music Audio Svc 30',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22088A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22088A_B",
            "type": "double",
            "alias": "2025 Listened to Apple Music Audio Service Last 30 Days"
      },
      {
            "name": "MP22088A_B_P",
            "type": "double",
            "alias": "2025 Listened to Apple Music Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_82',
    name: 'WI Listened to Apple Music Audio Svc 30',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/82',
    group: 'general',
    description: 'Business Analyst Layer: WI Listened to Apple Music Audio Svc 30',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22088A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22088A_B",
            "type": "double",
            "alias": "2025 Listened to Apple Music Audio Service Last 30 Days"
      },
      {
            "name": "MP22088A_B_P",
            "type": "double",
            "alias": "2025 Listened to Apple Music Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_83',
    name: 'IL Listened to iHeartRadio Audio Svc 30',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/83',
    group: 'general',
    description: 'Business Analyst Layer: IL Listened to iHeartRadio Audio Svc 30',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22089A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22089A_B",
            "type": "double",
            "alias": "2025 Listened to iHeartRadio Audio Service Last 30 Days"
      },
      {
            "name": "MP22089A_B_P",
            "type": "double",
            "alias": "2025 Listened to iHeartRadio Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_84',
    name: 'IN Listened to iHeartRadio Audio Svc 30',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/84',
    group: 'general',
    description: 'Business Analyst Layer: IN Listened to iHeartRadio Audio Svc 30',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22089A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22089A_B",
            "type": "double",
            "alias": "2025 Listened to iHeartRadio Audio Service Last 30 Days"
      },
      {
            "name": "MP22089A_B_P",
            "type": "double",
            "alias": "2025 Listened to iHeartRadio Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_85',
    name: 'WI Listened to iHeartRadio Audio Svc 30',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/85',
    group: 'general',
    description: 'Business Analyst Layer: WI Listened to iHeartRadio Audio Svc 30',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22089A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22089A_B",
            "type": "double",
            "alias": "2025 Listened to iHeartRadio Audio Service Last 30 Days"
      },
      {
            "name": "MP22089A_B_P",
            "type": "double",
            "alias": "2025 Listened to iHeartRadio Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_86',
    name: 'WI Listened to Amazon Music Audio Svc 30',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/86',
    group: 'general',
    description: 'Business Analyst Layer: WI Listened to Amazon Music Audio Svc 30',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22094A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22094A_B",
            "type": "double",
            "alias": "2025 Listened to Amazon Music Audio Service Last 30 Days"
      },
      {
            "name": "MP22094A_B_P",
            "type": "double",
            "alias": "2025 Listened to Amazon Music Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_87',
    name: 'IN Listened to Amazon Music Audio Svc 30',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/87',
    group: 'general',
    description: 'Business Analyst Layer: IN Listened to Amazon Music Audio Svc 30',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22094A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22094A_B",
            "type": "double",
            "alias": "2025 Listened to Amazon Music Audio Service Last 30 Days"
      },
      {
            "name": "MP22094A_B_P",
            "type": "double",
            "alias": "2025 Listened to Amazon Music Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_88',
    name: 'IL Listened to Amazon Music Audio Svc 30',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/88',
    group: 'general',
    description: 'Business Analyst Layer: IL Listened to Amazon Music Audio Svc 30',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22094A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22094A_B",
            "type": "double",
            "alias": "2025 Listened to Amazon Music Audio Service Last 30 Days"
      },
      {
            "name": "MP22094A_B_P",
            "type": "double",
            "alias": "2025 Listened to Amazon Music Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_89',
    name: 'IL Listened to Pandora Audio Svc 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/89',
    group: 'general',
    description: 'Business Analyst Layer: IL Listened to Pandora Audio Svc 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22090A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22090A_B",
            "type": "double",
            "alias": "2025 Listened to Pandora Audio Service Last 30 Days"
      },
      {
            "name": "MP22090A_B_P",
            "type": "double",
            "alias": "2025 Listened to Pandora Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_90',
    name: 'IN Listened to Pandora Audio Svc 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/90',
    group: 'general',
    description: 'Business Analyst Layer: IN Listened to Pandora Audio Svc 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22090A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22090A_B",
            "type": "double",
            "alias": "2025 Listened to Pandora Audio Service Last 30 Days"
      },
      {
            "name": "MP22090A_B_P",
            "type": "double",
            "alias": "2025 Listened to Pandora Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_91',
    name: 'WI Listened to Pandora Audio Svc 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/91',
    group: 'general',
    description: 'Business Analyst Layer: WI Listened to Pandora Audio Svc 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22090A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22090A_B",
            "type": "double",
            "alias": "2025 Listened to Pandora Audio Service Last 30 Days"
      },
      {
            "name": "MP22090A_B_P",
            "type": "double",
            "alias": "2025 Listened to Pandora Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_92',
    name: 'WI Listened to Spotify Audio Svc 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/92',
    group: 'general',
    description: 'Business Analyst Layer: WI Listened to Spotify Audio Svc 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22091A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22091A_B",
            "type": "double",
            "alias": "2025 Listened to Spotify Audio Service Last 30 Days"
      },
      {
            "name": "MP22091A_B_P",
            "type": "double",
            "alias": "2025 Listened to Spotify Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_93',
    name: 'IN Listened to Spotify Audio Svc 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/93',
    group: 'general',
    description: 'Business Analyst Layer: IN Listened to Spotify Audio Svc 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22091A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22091A_B",
            "type": "double",
            "alias": "2025 Listened to Spotify Audio Service Last 30 Days"
      },
      {
            "name": "MP22091A_B_P",
            "type": "double",
            "alias": "2025 Listened to Spotify Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_94',
    name: 'IL Listened to Spotify Audio Svc 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/94',
    group: 'general',
    description: 'Business Analyst Layer: IL Listened to Spotify Audio Svc 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22091A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22091A_B",
            "type": "double",
            "alias": "2025 Listened to Spotify Audio Service Last 30 Days"
      },
      {
            "name": "MP22091A_B_P",
            "type": "double",
            "alias": "2025 Listened to Spotify Audio Service Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_95',
    name: 'IL Listened to Entrtnmt Culture Podcast',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/95',
    group: 'general',
    description: 'Business Analyst Layer: IL Listened to Entrtnmt Culture Podcast',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22103A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22103A_B",
            "type": "double",
            "alias": "2025 Listened to Entertainment/Culture Podcast Last 30 Days"
      },
      {
            "name": "MP22103A_B_P",
            "type": "double",
            "alias": "2025 Listened to Entertainment/Culture Podcast Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_96',
    name: 'IN Listened to Entrtnmt Culture Podcast',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/96',
    group: 'general',
    description: 'Business Analyst Layer: IN Listened to Entrtnmt Culture Podcast',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22103A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22103A_B",
            "type": "double",
            "alias": "2025 Listened to Entertainment/Culture Podcast Last 30 Days"
      },
      {
            "name": "MP22103A_B_P",
            "type": "double",
            "alias": "2025 Listened to Entertainment/Culture Podcast Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_97',
    name: 'WI Listened to Entrtnmt Culture Podcast',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/97',
    group: 'general',
    description: 'Business Analyst Layer: WI Listened to Entrtnmt Culture Podcast',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22103A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22103A_B",
            "type": "double",
            "alias": "2025 Listened to Entertainment/Culture Podcast Last 30 Days"
      },
      {
            "name": "MP22103A_B_P",
            "type": "double",
            "alias": "2025 Listened to Entertainment/Culture Podcast Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_98',
    name: 'WI Listened to Music Podcast 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/98',
    group: 'general',
    description: 'Business Analyst Layer: WI Listened to Music Podcast 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22106A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22106A_B",
            "type": "double",
            "alias": "2025 Listened to Music Podcast Last 30 Days"
      },
      {
            "name": "MP22106A_B_P",
            "type": "double",
            "alias": "2025 Listened to Music Podcast Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_99',
    name: 'IN Listened to Music Podcast 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/99',
    group: 'general',
    description: 'Business Analyst Layer: IN Listened to Music Podcast 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22106A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22106A_B",
            "type": "double",
            "alias": "2025 Listened to Music Podcast Last 30 Days"
      },
      {
            "name": "MP22106A_B_P",
            "type": "double",
            "alias": "2025 Listened to Music Podcast Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_100',
    name: 'IL Listened to Music Podcast 30 Days',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/100',
    group: 'general',
    description: 'Business Analyst Layer: IL Listened to Music Podcast 30 Days',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22106A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22106A_B",
            "type": "double",
            "alias": "2025 Listened to Music Podcast Last 30 Days"
      },
      {
            "name": "MP22106A_B_P",
            "type": "double",
            "alias": "2025 Listened to Music Podcast Last 30 Days (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_101',
    name: 'IL Purchased Music at Music Store 6 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/101',
    group: 'general',
    description: 'Business Analyst Layer: IL Purchased Music at Music Store 6 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22083A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22083A_B",
            "type": "double",
            "alias": "2025 Purchased Music at Music Store Last 6 Mo"
      },
      {
            "name": "MP22083A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music at Music Store Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_102',
    name: 'IN Purchased Music at Music Store 6 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/102',
    group: 'general',
    description: 'Business Analyst Layer: IN Purchased Music at Music Store 6 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22083A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22083A_B",
            "type": "double",
            "alias": "2025 Purchased Music at Music Store Last 6 Mo"
      },
      {
            "name": "MP22083A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music at Music Store Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_103',
    name: 'WI Purchased Music at Music Store 6 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/103',
    group: 'general',
    description: 'Business Analyst Layer: WI Purchased Music at Music Store 6 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22083A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22083A_B",
            "type": "double",
            "alias": "2025 Purchased Music at Music Store Last 6 Mo"
      },
      {
            "name": "MP22083A_B_P",
            "type": "double",
            "alias": "2025 Purchased Music at Music Store Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_104',
    name: 'WI Listen to Rock Radio Format',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/104',
    group: 'general',
    description: 'Business Analyst Layer: WI Listen to Rock Radio Format',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22024A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22024A_B",
            "type": "double",
            "alias": "2025 Listen to Rock Radio Format"
      },
      {
            "name": "MP22024A_B_P",
            "type": "double",
            "alias": "2025 Listen to Rock Radio Format (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_105',
    name: 'IN Listen to Rock Radio Format',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/105',
    group: 'general',
    description: 'Business Analyst Layer: IN Listen to Rock Radio Format',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22024A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22024A_B",
            "type": "double",
            "alias": "2025 Listen to Rock Radio Format"
      },
      {
            "name": "MP22024A_B_P",
            "type": "double",
            "alias": "2025 Listen to Rock Radio Format (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_106',
    name: 'IL Listen to Rock Radio Format',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/106',
    group: 'general',
    description: 'Business Analyst Layer: IL Listen to Rock Radio Format',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22024A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22024A_B",
            "type": "double",
            "alias": "2025 Listen to Rock Radio Format"
      },
      {
            "name": "MP22024A_B_P",
            "type": "double",
            "alias": "2025 Listen to Rock Radio Format (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_107',
    name: 'IL Attended Rock Music Performance 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/107',
    group: 'general',
    description: 'Business Analyst Layer: IL Attended Rock Music Performance 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20063A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20063A_B",
            "type": "double",
            "alias": "2025 Attended Rock Music Performance Last 12 Mo"
      },
      {
            "name": "MP20063A_B_P",
            "type": "double",
            "alias": "2025 Attended Rock Music Performance Last 12 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_108',
    name: 'IN Attended Rock Music Performance 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/108',
    group: 'general',
    description: 'Business Analyst Layer: IN Attended Rock Music Performance 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20063A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20063A_B",
            "type": "double",
            "alias": "2025 Attended Rock Music Performance Last 12 Mo"
      },
      {
            "name": "MP20063A_B_P",
            "type": "double",
            "alias": "2025 Attended Rock Music Performance Last 12 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_109',
    name: 'WI Attended Rock Music Performance 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/109',
    group: 'general',
    description: 'Business Analyst Layer: WI Attended Rock Music Performance 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP20063A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP20063A_B",
            "type": "double",
            "alias": "2025 Attended Rock Music Performance Last 12 Mo"
      },
      {
            "name": "MP20063A_B_P",
            "type": "double",
            "alias": "2025 Attended Rock Music Performance Last 12 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_110',
    name: 'WI Listened to Classic Rock Music 6 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/110',
    group: 'general',
    description: 'Business Analyst Layer: WI Listened to Classic Rock Music 6 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22055A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22055A_B",
            "type": "double",
            "alias": "2025 Listened to Classic Rock Music Last 6 Mo"
      },
      {
            "name": "MP22055A_B_P",
            "type": "double",
            "alias": "2025 Listened to Classic Rock Music Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_111',
    name: 'IN Listened to Classic Rock Music 6 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/111',
    group: 'general',
    description: 'Business Analyst Layer: IN Listened to Classic Rock Music 6 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22055A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22055A_B",
            "type": "double",
            "alias": "2025 Listened to Classic Rock Music Last 6 Mo"
      },
      {
            "name": "MP22055A_B_P",
            "type": "double",
            "alias": "2025 Listened to Classic Rock Music Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_112',
    name: 'IL Listened to Classic Rock Music 6 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/112',
    group: 'general',
    description: 'Business Analyst Layer: IL Listened to Classic Rock Music 6 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22055A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22055A_B",
            "type": "double",
            "alias": "2025 Listened to Classic Rock Music Last 6 Mo"
      },
      {
            "name": "MP22055A_B_P",
            "type": "double",
            "alias": "2025 Listened to Classic Rock Music Last 6 Mo (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_113',
    name: 'IL Listen to Classic Rock Radio Format',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/113',
    group: 'general',
    description: 'Business Analyst Layer: IL Listen to Classic Rock Radio Format',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22014A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22014A_B",
            "type": "double",
            "alias": "2025 Listen to Classic Rock Radio Format"
      },
      {
            "name": "MP22014A_B_P",
            "type": "double",
            "alias": "2025 Listen to Classic Rock Radio Format (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_114',
    name: 'IN Listen to Classic Rock Radio Format',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/114',
    group: 'general',
    description: 'Business Analyst Layer: IN Listen to Classic Rock Radio Format',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22014A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22014A_B",
            "type": "double",
            "alias": "2025 Listen to Classic Rock Radio Format"
      },
      {
            "name": "MP22014A_B_P",
            "type": "double",
            "alias": "2025 Listen to Classic Rock Radio Format (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_115',
    name: 'WI Listen to Classic Rock Radio Format',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/115',
    group: 'general',
    description: 'Business Analyst Layer: WI Listen to Classic Rock Radio Format',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP22014A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "admin4_name",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "admin3_name",
            "type": "string",
            "alias": "County"
      },
      {
            "name": "admin2_name",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "id",
            "type": "string",
            "alias": "Cell ID"
      },
      {
            "name": "MP22014A_B",
            "type": "double",
            "alias": "2025 Listen to Classic Rock Radio Format"
      },
      {
            "name": "MP22014A_B_P",
            "type": "double",
            "alias": "2025 Listen to Classic Rock Radio Format (%)"
      },
      {
            "name": "thematic_value",
            "type": "double",
            "alias": "thematic_value"
      },
      {
            "name": "Shape__Area",
            "type": "double",
            "alias": "Shape__Area"
      },
      {
            "name": "Shape__Length",
            "type": "double",
            "alias": "Shape__Length"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_116',
    name: 'radio stations - 3 states',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/116',
    group: 'general',
    description: 'Business Analyst Layer: radio stations - 3 states',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: '_',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Uncategorized"
  },
      {
            "name": "_",
            "type": "double",
            "alias": "#"
      },
      {
            "name": "call_sign",
            "type": "string",
            "alias": "Call Sign"
      },
      {
            "name": "frequency",
            "type": "string",
            "alias": "Frequency"
      },
      {
            "name": "city_of_license",
            "type": "string",
            "alias": "City"
      },
      {
            "name": "state",
            "type": "string",
            "alias": "State"
      },
      {
            "name": "licensee_owner",
            "type": "string",
            "alias": "Licensee/Owner"
      },
      {
            "name": "notes",
            "type": "string",
            "alias": "Notes"
      },
      {
            "name": "tower_address",
            "type": "string",
            "alias": "Address or Place"
      },
      {
            "name": "coverage_radius__miles_",
            "type": "double",
            "alias": "Coverage Radius (miles)"
      },
      {
            "name": "SOURCE_ADDR",
            "type": "string",
            "alias": "Original address"
      },
      {
            "name": "Postal",
            "type": "string",
            "alias": "ZIP"
      },
      {
            "name": "DESC_",
            "type": "string",
            "alias": "Description"
      },
      {
            "name": "LATITUDE",
            "type": "double",
            "alias": "Latitude"
      },
      {
            "name": "LONGITUDE",
            "type": "double",
            "alias": "Longitude"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_117',
    name: 'WI Theatres-Movie, Drive-In Motion Picture Theaters',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/117',
    group: 'general',
    description: 'Business Analyst Layer: WI Theatres-Movie, Drive-In Motion Picture Theaters',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'ESRI_PID',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "CONAME",
            "type": "string",
            "alias": "Company/Business Name"
      },
      {
            "name": "ADDR",
            "type": "string",
            "alias": "Address"
      },
      {
            "name": "CITY",
            "type": "string",
            "alias": "City"
      },
      {
            "name": "STATE_NAME",
            "type": "string",
            "alias": "State Name"
      },
      {
            "name": "STATE",
            "type": "string",
            "alias": "State Abbreviation"
      },
      {
            "name": "ZIP",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ZIP4",
            "type": "string",
            "alias": "ZIP+4 Extension"
      },
      {
            "name": "NAICS",
            "type": "string",
            "alias": "Primary NAICS"
      },
      {
            "name": "NAICS_ALL",
            "type": "string",
            "alias": "All NAICS Codes"
      },
      {
            "name": "SIC",
            "type": "string",
            "alias": "Primary SIC"
      },
      {
            "name": "SIC_ALL",
            "type": "string",
            "alias": "All SIC Codes"
      },
      {
            "name": "INDUSTRY_DESC",
            "type": "string",
            "alias": "Industry Description"
      },
      {
            "name": "AFFILIATE",
            "type": "string",
            "alias": "Affiliated Orgs"
      },
      {
            "name": "BRAND",
            "type": "string",
            "alias": "Brands"
      },
      {
            "name": "HQNAME",
            "type": "string",
            "alias": "Headquarters Name"
      },
      {
            "name": "LOC_CONF",
            "type": "string",
            "alias": "Location Confidence"
      },
      {
            "name": "NAICS_SECT",
            "type": "string",
            "alias": "NAICS Industry Sector"
      },
      {
            "name": "PLACETYPE",
            "type": "string",
            "alias": "Business Category"
      },
      {
            "name": "SQFOOTAGE",
            "type": "string",
            "alias": "Square Footage"
      },
      {
            "name": "MIN_SQFT",
            "type": "integer",
            "alias": "Square Foot Minimum"
      },
      {
            "name": "MAX_SQFT",
            "type": "integer",
            "alias": "Square Foot Maximum"
      },
      {
            "name": "EMPNUM",
            "type": "integer",
            "alias": "Employee Count"
      },
      {
            "name": "SALESVOL",
            "type": "double",
            "alias": "Sales Volume"
      },
      {
            "name": "SOURCE",
            "type": "string",
            "alias": "Source"
      },
      {
            "name": "ESRI_PID",
            "type": "string",
            "alias": "Esri PID"
      },
      {
            "name": "DESC_",
            "type": "string",
            "alias": "Description"
      },
      {
            "name": "LATITUDE",
            "type": "double",
            "alias": "Latitude"
      },
      {
            "name": "LONGITUDE",
            "type": "double",
            "alias": "Longitude"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_118',
    name: 'IL Theatres-Movie, Drive-In Motion Picture Theaters',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/118',
    group: 'general',
    description: 'Business Analyst Layer: IL Theatres-Movie, Drive-In Motion Picture Theaters',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'ESRI_PID',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "CONAME",
            "type": "string",
            "alias": "Company/Business Name"
      },
      {
            "name": "ADDR",
            "type": "string",
            "alias": "Address"
      },
      {
            "name": "CITY",
            "type": "string",
            "alias": "City"
      },
      {
            "name": "STATE_NAME",
            "type": "string",
            "alias": "State Name"
      },
      {
            "name": "STATE",
            "type": "string",
            "alias": "State Abbreviation"
      },
      {
            "name": "ZIP",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ZIP4",
            "type": "string",
            "alias": "ZIP+4 Extension"
      },
      {
            "name": "NAICS",
            "type": "string",
            "alias": "Primary NAICS"
      },
      {
            "name": "NAICS_ALL",
            "type": "string",
            "alias": "All NAICS Codes"
      },
      {
            "name": "SIC",
            "type": "string",
            "alias": "Primary SIC"
      },
      {
            "name": "SIC_ALL",
            "type": "string",
            "alias": "All SIC Codes"
      },
      {
            "name": "INDUSTRY_DESC",
            "type": "string",
            "alias": "Industry Description"
      },
      {
            "name": "AFFILIATE",
            "type": "string",
            "alias": "Affiliated Orgs"
      },
      {
            "name": "BRAND",
            "type": "string",
            "alias": "Brands"
      },
      {
            "name": "HQNAME",
            "type": "string",
            "alias": "Headquarters Name"
      },
      {
            "name": "LOC_CONF",
            "type": "string",
            "alias": "Location Confidence"
      },
      {
            "name": "NAICS_SECT",
            "type": "string",
            "alias": "NAICS Industry Sector"
      },
      {
            "name": "PLACETYPE",
            "type": "string",
            "alias": "Business Category"
      },
      {
            "name": "SQFOOTAGE",
            "type": "string",
            "alias": "Square Footage"
      },
      {
            "name": "MIN_SQFT",
            "type": "integer",
            "alias": "Square Foot Minimum"
      },
      {
            "name": "MAX_SQFT",
            "type": "integer",
            "alias": "Square Foot Maximum"
      },
      {
            "name": "EMPNUM",
            "type": "integer",
            "alias": "Employee Count"
      },
      {
            "name": "SALESVOL",
            "type": "double",
            "alias": "Sales Volume"
      },
      {
            "name": "SOURCE",
            "type": "string",
            "alias": "Source"
      },
      {
            "name": "ESRI_PID",
            "type": "string",
            "alias": "Esri PID"
      },
      {
            "name": "DESC_",
            "type": "string",
            "alias": "Description"
      },
      {
            "name": "LATITUDE",
            "type": "double",
            "alias": "Latitude"
      },
      {
            "name": "LONGITUDE",
            "type": "double",
            "alias": "Longitude"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  },
  {
    id: 'Unknown_Service_layer_119',
    name: 'IN Theatres-Movie, Drive-In Motion Picture Theaters',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer/119',
    group: 'general',
    description: 'Business Analyst Layer: IN Theatres-Movie, Drive-In Motion Picture Theaters',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'ESRI_PID',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      ,
    category: "Entertainment"
  },
      {
            "name": "CONAME",
            "type": "string",
            "alias": "Company/Business Name"
      },
      {
            "name": "ADDR",
            "type": "string",
            "alias": "Address"
      },
      {
            "name": "CITY",
            "type": "string",
            "alias": "City"
      },
      {
            "name": "STATE_NAME",
            "type": "string",
            "alias": "State Name"
      },
      {
            "name": "STATE",
            "type": "string",
            "alias": "State Abbreviation"
      },
      {
            "name": "ZIP",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ZIP4",
            "type": "string",
            "alias": "ZIP+4 Extension"
      },
      {
            "name": "NAICS",
            "type": "string",
            "alias": "Primary NAICS"
      },
      {
            "name": "NAICS_ALL",
            "type": "string",
            "alias": "All NAICS Codes"
      },
      {
            "name": "SIC",
            "type": "string",
            "alias": "Primary SIC"
      },
      {
            "name": "SIC_ALL",
            "type": "string",
            "alias": "All SIC Codes"
      },
      {
            "name": "INDUSTRY_DESC",
            "type": "string",
            "alias": "Industry Description"
      },
      {
            "name": "AFFILIATE",
            "type": "string",
            "alias": "Affiliated Orgs"
      },
      {
            "name": "BRAND",
            "type": "string",
            "alias": "Brands"
      },
      {
            "name": "HQNAME",
            "type": "string",
            "alias": "Headquarters Name"
      },
      {
            "name": "LOC_CONF",
            "type": "string",
            "alias": "Location Confidence"
      },
      {
            "name": "NAICS_SECT",
            "type": "string",
            "alias": "NAICS Industry Sector"
      },
      {
            "name": "PLACETYPE",
            "type": "string",
            "alias": "Business Category"
      },
      {
            "name": "SQFOOTAGE",
            "type": "string",
            "alias": "Square Footage"
      },
      {
            "name": "MIN_SQFT",
            "type": "integer",
            "alias": "Square Foot Minimum"
      },
      {
            "name": "MAX_SQFT",
            "type": "integer",
            "alias": "Square Foot Maximum"
      },
      {
            "name": "EMPNUM",
            "type": "integer",
            "alias": "Employee Count"
      },
      {
            "name": "SALESVOL",
            "type": "double",
            "alias": "Sales Volume"
      },
      {
            "name": "SOURCE",
            "type": "string",
            "alias": "Source"
      },
      {
            "name": "ESRI_PID",
            "type": "string",
            "alias": "Esri PID"
      },
      {
            "name": "DESC_",
            "type": "string",
            "alias": "Description"
      },
      {
            "name": "LATITUDE",
            "type": "double",
            "alias": "Latitude"
      },
      {
            "name": "LONGITUDE",
            "type": "double",
            "alias": "Longitude"
      },
      {
            "name": "CreationDate",
            "type": "date",
            "alias": "CreationDate"
      },
      {
            "name": "Creator",
            "type": "string",
            "alias": "Creator"
      },
      {
            "name": "EditDate",
            "type": "date",
            "alias": "EditDate"
      },
      {
            "name": "Editor",
            "type": "string",
            "alias": "Editor"
      },
    ],
    metadata: {
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "postal",
      "geographicLevel": "local"
    },
    processing: {
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    },
    caching: {
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    },
    performance: {
      "timeoutMs": 30000
    },
    security: {
      "accessLevels": [
            "read"
      ]
    },
    analysis: {
      "availableOperations": [
            "query"
      ]
    }
  }
];

// Apply helper functions to all configurations
export const layerConfigs: LayerConfig[] = baseLayerConfigs
  .map(ensureLayerHasDescriptionField)
  .map(updateRendererFieldForPercentage);

// Group layers by category for easier management
export const layerGroups = {
  'group_tpopl': {
    displayName: 'Tpopl',
    description: 'Layers with TPOPL prefix pattern',
    layerCount: 3,
    confidence: 1.00,
    layers: [
      'Unknown_Service_layer_2',
    'Unknown_Service_layer_3',
    'Unknown_Service_layer_5'
    ]
  },
  'group_admin': {
    displayName: 'Admin',
    description: 'Layers with ADMIN prefix pattern',
    layerCount: 111,
    confidence: 1.00,
    layers: [
      'Unknown_Service_layer_4',
    'Unknown_Service_layer_6',
    'Unknown_Service_layer_7',
    'Unknown_Service_layer_8',
    'Unknown_Service_layer_9',
    'Unknown_Service_layer_10',
    'Unknown_Service_layer_11',
    'Unknown_Service_layer_12',
    'Unknown_Service_layer_13',
    'Unknown_Service_layer_14',
    'Unknown_Service_layer_15',
    'Unknown_Service_layer_16',
    'Unknown_Service_layer_17',
    'Unknown_Service_layer_18',
    'Unknown_Service_layer_19',
    'Unknown_Service_layer_20',
    'Unknown_Service_layer_21',
    'Unknown_Service_layer_22',
    'Unknown_Service_layer_23',
    'Unknown_Service_layer_24',
    'Unknown_Service_layer_25',
    'Unknown_Service_layer_26',
    'Unknown_Service_layer_27',
    'Unknown_Service_layer_28',
    'Unknown_Service_layer_29',
    'Unknown_Service_layer_30',
    'Unknown_Service_layer_31',
    'Unknown_Service_layer_32',
    'Unknown_Service_layer_33',
    'Unknown_Service_layer_34',
    'Unknown_Service_layer_35',
    'Unknown_Service_layer_36',
    'Unknown_Service_layer_37',
    'Unknown_Service_layer_38',
    'Unknown_Service_layer_39',
    'Unknown_Service_layer_40',
    'Unknown_Service_layer_41',
    'Unknown_Service_layer_42',
    'Unknown_Service_layer_43',
    'Unknown_Service_layer_44',
    'Unknown_Service_layer_45',
    'Unknown_Service_layer_46',
    'Unknown_Service_layer_47',
    'Unknown_Service_layer_48',
    'Unknown_Service_layer_49',
    'Unknown_Service_layer_50',
    'Unknown_Service_layer_51',
    'Unknown_Service_layer_52',
    'Unknown_Service_layer_53',
    'Unknown_Service_layer_54',
    'Unknown_Service_layer_55',
    'Unknown_Service_layer_56',
    'Unknown_Service_layer_57',
    'Unknown_Service_layer_58',
    'Unknown_Service_layer_59',
    'Unknown_Service_layer_60',
    'Unknown_Service_layer_61',
    'Unknown_Service_layer_62',
    'Unknown_Service_layer_63',
    'Unknown_Service_layer_64',
    'Unknown_Service_layer_65',
    'Unknown_Service_layer_66',
    'Unknown_Service_layer_67',
    'Unknown_Service_layer_68',
    'Unknown_Service_layer_69',
    'Unknown_Service_layer_70',
    'Unknown_Service_layer_71',
    'Unknown_Service_layer_72',
    'Unknown_Service_layer_73',
    'Unknown_Service_layer_74',
    'Unknown_Service_layer_75',
    'Unknown_Service_layer_76',
    'Unknown_Service_layer_77',
    'Unknown_Service_layer_78',
    'Unknown_Service_layer_79',
    'Unknown_Service_layer_80',
    'Unknown_Service_layer_81',
    'Unknown_Service_layer_82',
    'Unknown_Service_layer_83',
    'Unknown_Service_layer_84',
    'Unknown_Service_layer_85',
    'Unknown_Service_layer_86',
    'Unknown_Service_layer_87',
    'Unknown_Service_layer_88',
    'Unknown_Service_layer_89',
    'Unknown_Service_layer_90',
    'Unknown_Service_layer_91',
    'Unknown_Service_layer_92',
    'Unknown_Service_layer_93',
    'Unknown_Service_layer_94',
    'Unknown_Service_layer_95',
    'Unknown_Service_layer_96',
    'Unknown_Service_layer_97',
    'Unknown_Service_layer_98',
    'Unknown_Service_layer_99',
    'Unknown_Service_layer_100',
    'Unknown_Service_layer_101',
    'Unknown_Service_layer_102',
    'Unknown_Service_layer_103',
    'Unknown_Service_layer_104',
    'Unknown_Service_layer_105',
    'Unknown_Service_layer_106',
    'Unknown_Service_layer_107',
    'Unknown_Service_layer_108',
    'Unknown_Service_layer_109',
    'Unknown_Service_layer_110',
    'Unknown_Service_layer_111',
    'Unknown_Service_layer_112',
    'Unknown_Service_layer_113',
    'Unknown_Service_layer_114',
    'Unknown_Service_layer_115'
    ]
  },
  'group_zip': {
    displayName: 'Zip',
    description: 'Layers with ZIP prefix pattern',
    layerCount: 3,
    confidence: 1.00,
    layers: [
      'Unknown_Service_layer_117',
    'Unknown_Service_layer_118',
    'Unknown_Service_layer_119'
    ]
  },
  'group_general': {
    displayName: 'General',
    description: 'General data layers',
    layerCount: 3,
    confidence: 0.20,
    layers: [
      'Unknown_Service_layer_0',
    'Unknown_Service_layer_1',
    'Unknown_Service_layer_116'
    ]
  },

};

// Export individual layers for direct access
export const layers: { [key: string]: LayerConfig } = layerConfigs.reduce((acc, layer) => {
  acc[layer.id] = layer;
  return acc;
}, {} as { [key: string]: LayerConfig });

// Export layer count for monitoring
export const layerCount = layerConfigs.length;

// Export generation metadata
export const generationMetadata = {
  generatedAt: '2025-09-22T10:56:15.792953',
  layerCount: 120,
  groupCount: 1,
  automationVersion: '1.0.0'
};
