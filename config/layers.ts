// Layer configuration with preserved structure
// This file maintains compatibility with existing system components

import { LayerConfig } from '../types/layers';

export type LayerType = 'index' | 'point' | 'percentage' | 'amount';
export type AccessLevel = 'read' | 'write' | 'admin';

export const concepts = {
  population: {
    terms: [
      'population', 'people', 'residents', 'inhabitants', 
      'demographics', 'age', 'gender', 'household', 'family',
      'diversity', 'cultural groups'
    ],
    weight: 10,
  },
  income: {
    terms: ['income', 'earnings', 'salary', 'wage', 'affluence', 'wealth', 'disposable'],
    weight: 25
  },
  race: {
    terms: ['race', 'ethnicity', 'diverse', 'diversity', 'racial', 'white', 'black', 'asian', 'american indian', 'pacific islander', 'hispanic'],
    weight: 20
  },
  spending: {
    terms: ['spending', 'purchase', 'bought', 'shopped', 'consumer', 'expense', 'shopping'],
    weight: 25
  },
  sports: {
    terms: ['sports', 'athletic', 'exercise', 'fan', 'participation', 'NBA', 'NFL', 'MLB', 'NHL', 'soccer', 'running', 'jogging', 'yoga', 'weight lifting'],
    weight: 20
  },
  brands: {
    terms: [
      'brand', 'Nike', 'Adidas', 'Jordan', 'Converse', 'Reebok', 'Puma', 
      'New Balance', 'Asics', 'Skechers', 'Alo', 'Lululemon', 'On'
    ],
    weight: 25
  },
  retail: {
    terms: ['retail', 'store', 'shop', 'Dick\'s Sporting Goods', 'Foot Locker', 'outlet', 'mall'],
    weight: 15
  },
  clothing: {
    terms: ['clothing', 'apparel', 'wear', 'workout wear', 'athletic wear', 'shoes', 'footwear', 'sneakers'],
    weight: 20
  },
  household: {
    terms: ['household', 'family', 'home', 'housing', 'residence'],
    weight: 15
  },
  trends: {
    terms: [
      'trends', 'google', 'search', 'interest', 'popularity', 
      'search volume', 'search data', 'search analytics', 'trending', 'search patterns',
      'consumer interest', 'market attention', 'brand awareness', 'search interest',
      'online demand', 'consumer demand', 'brand popularity', 'search frequency',
      'search trends', 'search queries', 'google search', 'search index'
    ],
    weight: 20
  },
  geographic: {
    terms: ['ZIP', 'DMA', 'local', 'regional', 'area', 'location', 'zone', 'region'],
    weight: 15
  }
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

// === GENERATED LAYER CONFIGURATIONS ===
export const baseLayerConfigs: LayerConfig[] = [
  {
    id: 'Synapse54_Vetements_layers_layer_8',
    name: '2024 Total Population Zips',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/8',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Total Population Zips',
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
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "TOTPOP_CY",
            "type": "double",
            "alias": "2024 Total Population (Esri)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_9',
    name: '2024 Median Disposable Income',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/9',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Median Disposable Income',
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
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MEDDI_CY",
            "type": "double",
            "alias": "2024 Median Disposable Income (Esri)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_10',
    name: '2024 Diversity Index',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/10',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 Diversity Index',
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
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "DIVINDX_CY",
            "type": "double",
            "alias": "2024 Diversity Index (Esri)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_11',
    name: '2024 White Population ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/11',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 White Population ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'WHITE_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "WHITE_CY",
            "type": "double",
            "alias": "2024 White Population (Esri)"
      },
      {
            "name": "WHITE_CY_P",
            "type": "double",
            "alias": "2024 White Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_12',
    name: '2024 Black Population ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/12',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 Black Population ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'BLACK_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "BLACK_CY",
            "type": "double",
            "alias": "2024 Black/African American Population (Esri)"
      },
      {
            "name": "BLACK_CY_P",
            "type": "double",
            "alias": "2024 Black/African American Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_13',
    name: '2024 American Indian Population ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/13',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 American Indian Population ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'AMERIND_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "AMERIND_CY",
            "type": "double",
            "alias": "2024 American Indian/Alaska Native Population (Esri)"
      },
      {
            "name": "AMERIND_CY_P",
            "type": "double",
            "alias": "2024 American Indian/Alaska Native Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_14',
    name: '2024 Asian Population ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/14',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 Asian Population ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'ASIAN_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "ASIAN_CY",
            "type": "double",
            "alias": "2024 Asian Population (Esri)"
      },
      {
            "name": "ASIAN_CY_P",
            "type": "double",
            "alias": "2024 Asian Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_15',
    name: '2024 Pacific Islander Population ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/15',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 Pacific Islander Population ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'PACIFIC_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "PACIFIC_CY",
            "type": "double",
            "alias": "2024 Pacific Islander Population (Esri)"
      },
      {
            "name": "PACIFIC_CY_P",
            "type": "double",
            "alias": "2024 Pacific Islander Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_16',
    name: '2024 Other Race Population ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/16',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 Other Race Population ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'OTHRACE_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "OTHRACE_CY",
            "type": "double",
            "alias": "2024 Other Race Population (Esri)"
      },
      {
            "name": "OTHRACE_CY_P",
            "type": "double",
            "alias": "2024 Other Race Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_17',
    name: '2024 Population of 2+ Races ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/17',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 Population of 2+ Races ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'RACE2UP_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "RACE2UP_CY",
            "type": "double",
            "alias": "2024 Population of Two or More Races (Esri)"
      },
      {
            "name": "RACE2UP_CY_P",
            "type": "double",
            "alias": "2024 Population of Two or More Races (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_18',
    name: '2024 Hispanic White Pop ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/18',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 Hispanic White Pop ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'HISPWHT_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "HISPWHT_CY",
            "type": "double",
            "alias": "2024 Hispanic White Population (Esri)"
      },
      {
            "name": "HISPWHT_CY_P",
            "type": "double",
            "alias": "2024 Hispanic White Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_19',
    name: '2024 Hispanic Black Pop ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/19',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 Hispanic Black Pop ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'HISPBLK_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "HISPBLK_CY",
            "type": "double",
            "alias": "2024 Hispanic Black/African American Population (Esri)"
      },
      {
            "name": "HISPBLK_CY_P",
            "type": "double",
            "alias": "2024 Hispanic Black/African American Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_20',
    name: '2024 Hispanic American Indian Pop ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/20',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 Hispanic American Indian Pop ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'HISPAI_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "HISPAI_CY",
            "type": "double",
            "alias": "2024 Hispanic American Indian/Alaska Native Population (Esri)"
      },
      {
            "name": "HISPAI_CY_P",
            "type": "double",
            "alias": "2024 Hispanic American Indian/Alaska Native Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_21',
    name: '2024 Hispanic Pacific Islander Pop ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/21',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 Hispanic Pacific Islander Pop ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'HISPPI_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "HISPPI_CY",
            "type": "double",
            "alias": "2024 Hispanic Pacific Islander Population (Esri)"
      },
      {
            "name": "HISPPI_CY_P",
            "type": "double",
            "alias": "2024 Hispanic Pacific Islander Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_22',
    name: '2024 Hispanic Other Race Pop ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/22',
    group: 'group_1750248468343',
    description: 'Business Analyst Layer: 2024 Hispanic Other Race Pop ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'HISPOTH_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "HISPOTH_CY",
            "type": "double",
            "alias": "2024 Hispanic Other Race Population (Esri)"
      },
      {
            "name": "HISPOTH_CY_P",
            "type": "double",
            "alias": "2024 Hispanic Other Race Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_23',
    name: '2024 Wealth Index',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/23',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Wealth Index',
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
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "WLTHINDXCY",
            "type": "double",
            "alias": "2024 Wealth Index (Esri)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_24',
    name: '2024 Household Population ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/24',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Household Population ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'HHPOP_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "HHPOP_CY",
            "type": "double",
            "alias": "2024 Household Population (Esri)"
      },
      {
            "name": "HHPOP_CY_P",
            "type": "double",
            "alias": "2024 Household Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_25',
    name: '2024 Family Population ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/25',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Family Population ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'FAMPOP_CY_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "FAMPOP_CY",
            "type": "double",
            "alias": "2024 Family Population (Esri)"
      },
      {
            "name": "FAMPOP_CY_P",
            "type": "double",
            "alias": "2024 Family Population (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_26',
    name: '2024 Sports Rec Exercise Equipment (Avg)',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/26',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Sports Rec Exercise Equipment (Avg)',
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
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "X9051_X",
            "type": "double",
            "alias": "2024 Sports/Rec/Exercise Equipment"
      },
      {
            "name": "X9051_X_A",
            "type": "double",
            "alias": "2024 Sports/Rec/Exercise Equipment (Avg)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_27',
    name: '2024 Spent $300+ on Sports Clothing 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/27',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Spent $300+ on Sports Clothing 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP07109A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP07109A_B",
            "type": "double",
            "alias": "2024 Spent $300+ on Sports Clothing Last 12 Mo"
      },
      {
            "name": "MP07109A_B_P",
            "type": "double",
            "alias": "2024 Spent $300+ on Sports Clothing Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_28',
    name: '2024 Spent $100+ on Athletic Workout Wear',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/28',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Spent $100+ on Athletic Workout Wear',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP07111A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP07111A_B",
            "type": "double",
            "alias": "2024 Spent $100+ on Athletic/Workout Wear Last 12 Mo"
      },
      {
            "name": "MP07111A_B_P",
            "type": "double",
            "alias": "2024 Spent $100+ on Athletic/Workout Wear Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_29',
    name: 'Spent 200 On Shoes',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/29',
    group: 'service-layers',
    description: 'Business Analyst Layer: Spent 200 On Shoes',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'PSIV7UMKVALM',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "PSIV7UMKVALM",
            "type": "double",
            "alias": "Spent 200+ On Shoes"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_30',
    name: '2024 Bought Athletic Shoes 12 Mo ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/30',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Athletic Shoes 12 Mo ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30016A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30016A_B",
            "type": "double",
            "alias": "2024 Bought Athletic Shoes Last 12 Mo"
      },
      {
            "name": "MP30016A_B_P",
            "type": "double",
            "alias": "2024 Bought Athletic Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_31',
    name: '2024 Bought Basketball Shoes 12 Mo ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/31',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Basketball Shoes 12 Mo ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30018A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30018A_B",
            "type": "double",
            "alias": "2024 Bought Basketball Shoes Last 12 Mo"
      },
      {
            "name": "MP30018A_B_P",
            "type": "double",
            "alias": "2024 Bought Basketball Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_32',
    name: '2024 Bought Cross-Training Shoes 12 Mo ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/32',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Cross-Training Shoes 12 Mo ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30019A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30019A_B",
            "type": "double",
            "alias": "2024 Bought Cross-Training Shoes Last 12 Mo"
      },
      {
            "name": "MP30019A_B_P",
            "type": "double",
            "alias": "2024 Bought Cross-Training Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_33',
    name: '2024 Bought Running or Jogging Shoes 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/33',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Running or Jogging Shoes 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30021A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30021A_B",
            "type": "double",
            "alias": "2024 Bought Running or Jogging Shoes Last 12 Mo"
      },
      {
            "name": "MP30021A_B_P",
            "type": "double",
            "alias": "2024 Bought Running or Jogging Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_34',
    name: '2024 Bought Adidas Athletic Shoes 12 Mo ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/34',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Adidas Athletic Shoes 12 Mo ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30029A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30029A_B",
            "type": "double",
            "alias": "2024 Bought Adidas Athletic Shoes Last 12 Mo"
      },
      {
            "name": "MP30029A_B_P",
            "type": "double",
            "alias": "2024 Bought Adidas Athletic Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_35',
    name: '2024 Bought Asics Athletic Shoes 12 Mo ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/35',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Asics Athletic Shoes 12 Mo ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30030A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30030A_B",
            "type": "double",
            "alias": "2024 Bought Asics Athletic Shoes Last 12 Mo"
      },
      {
            "name": "MP30030A_B_P",
            "type": "double",
            "alias": "2024 Bought Asics Athletic Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_36',
    name: '2024 Bought Converse Athletic Shoes 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/36',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Converse Athletic Shoes 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30031A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30031A_B",
            "type": "double",
            "alias": "2024 Bought Converse Athletic Shoes Last 12 Mo"
      },
      {
            "name": "MP30031A_B_P",
            "type": "double",
            "alias": "2024 Bought Converse Athletic Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_37',
    name: '2024 Bought Jordan Athletic Shoes 12 Mo ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/37',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Jordan Athletic Shoes 12 Mo ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30032A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30032A_B",
            "type": "double",
            "alias": "2024 Bought Jordan Athletic Shoes Last 12 Mo"
      },
      {
            "name": "MP30032A_B_P",
            "type": "double",
            "alias": "2024 Bought Jordan Athletic Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_38',
    name: '2024 Bought New Balance Athletic Shoes 12 M',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/38',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought New Balance Athletic Shoes 12 M',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30033A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30033A_B",
            "type": "double",
            "alias": "2024 Bought New Balance Athletic Shoes Last 12 Mo"
      },
      {
            "name": "MP30033A_B_P",
            "type": "double",
            "alias": "2024 Bought New Balance Athletic Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_39',
    name: '2024 Bought Nike Athletic Shoes 12 Mo ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/39',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Nike Athletic Shoes 12 Mo ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30034A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30034A_B",
            "type": "double",
            "alias": "2024 Bought Nike Athletic Shoes Last 12 Mo"
      },
      {
            "name": "MP30034A_B_P",
            "type": "double",
            "alias": "2024 Bought Nike Athletic Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_40',
    name: '2024 Bought Puma Athletic Shoes 12 Mo ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/40',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Puma Athletic Shoes 12 Mo ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30035A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30035A_B",
            "type": "double",
            "alias": "2024 Bought Puma Athletic Shoes Last 12 Mo"
      },
      {
            "name": "MP30035A_B_P",
            "type": "double",
            "alias": "2024 Bought Puma Athletic Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_41',
    name: '2024 Bought Reebok Athletic Shoes 12 Mo ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/41',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Reebok Athletic Shoes 12 Mo ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30036A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30036A_B",
            "type": "double",
            "alias": "2024 Bought Reebok Athletic Shoes Last 12 Mo"
      },
      {
            "name": "MP30036A_B_P",
            "type": "double",
            "alias": "2024 Bought Reebok Athletic Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_42',
    name: '2024 Bought Skechers Athletic Shoes 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/42',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Bought Skechers Athletic Shoes 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP30037A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP30037A_B",
            "type": "double",
            "alias": "2024 Bought Skechers Athletic Shoes Last 12 Mo"
      },
      {
            "name": "MP30037A_B_P",
            "type": "double",
            "alias": "2024 Bought Skechers Athletic Shoes Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_43',
    name: '2024 Shopped at Dick`s Sporting Goods Store',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/43',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Shopped at Dick`s Sporting Goods Store',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP31035A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP31035A_B",
            "type": "double",
            "alias": "2024 Shopped at Dick`s Sporting Goods Store Last 3 Mo"
      },
      {
            "name": "MP31035A_B_P",
            "type": "double",
            "alias": "2024 Shopped at Dick`s Sporting Goods Store Last 3 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_44',
    name: '2024 Shopped at Foot Locker Store 3 Mo ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/44',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Shopped at Foot Locker Store 3 Mo ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP31042A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP31042A_B",
            "type": "double",
            "alias": "2024 Shopped at Foot Locker Store Last 3 Mo"
      },
      {
            "name": "MP31042A_B_P",
            "type": "double",
            "alias": "2024 Shopped at Foot Locker Store Last 3 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_45',
    name: '2024 Participated in Jogging or Running 12',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/45',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Participated in Jogging or Running 12',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP33020A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP33020A_B",
            "type": "double",
            "alias": "2024 Participated in Jogging or Running Last 12 Mo"
      },
      {
            "name": "MP33020A_B_P",
            "type": "double",
            "alias": "2024 Participated in Jogging or Running Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_46',
    name: '2024 Participated in Yoga 12 Mo ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/46',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Participated in Yoga 12 Mo ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP33032A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP33032A_B",
            "type": "double",
            "alias": "2024 Participated in Yoga Last 12 Mo"
      },
      {
            "name": "MP33032A_B_P",
            "type": "double",
            "alias": "2024 Participated in Yoga Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_47',
    name: '2024 Participated in Weight Lifting 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/47',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Participated in Weight Lifting 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP33031A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP33031A_B",
            "type": "double",
            "alias": "2024 Participated in Weight Lifting Last 12 Mo"
      },
      {
            "name": "MP33031A_B_P",
            "type": "double",
            "alias": "2024 Participated in Weight Lifting Last 12 Mo (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_48',
    name: '2024 MLB Super Fan (10-10 on 10 Scale) ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/48',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 MLB Super Fan (10-10 on 10 Scale) ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP33104A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP33104A_B",
            "type": "double",
            "alias": "2024 MLB Super Fan (10-10 on 10 Scale)"
      },
      {
            "name": "MP33104A_B_P",
            "type": "double",
            "alias": "2024 MLB Super Fan (10-10 on 10 Scale) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_49',
    name: '2024 NASCAR Super Fan (10-10 on 10 Scale)',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/49',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 NASCAR Super Fan (10-10 on 10 Scale)',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP33105A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP33105A_B",
            "type": "double",
            "alias": "2024 NASCAR Super Fan (10-10 on 10 Scale)"
      },
      {
            "name": "MP33105A_B_P",
            "type": "double",
            "alias": "2024 NASCAR Super Fan (10-10 on 10 Scale) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_50',
    name: '2024 NBA Super Fan (10-10 on 10 Scale) ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/50',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 NBA Super Fan (10-10 on 10 Scale) ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP33106A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP33106A_B",
            "type": "double",
            "alias": "2024 NBA Super Fan (10-10 on 10 Scale)"
      },
      {
            "name": "MP33106A_B_P",
            "type": "double",
            "alias": "2024 NBA Super Fan (10-10 on 10 Scale) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_51',
    name: '2024 NFL Super Fan (10-10 on 10 Scale) ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/51',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 NFL Super Fan (10-10 on 10 Scale) ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP33107A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP33107A_B",
            "type": "double",
            "alias": "2024 NFL Super Fan (10-10 on 10 Scale)"
      },
      {
            "name": "MP33107A_B_P",
            "type": "double",
            "alias": "2024 NFL Super Fan (10-10 on 10 Scale) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_52',
    name: '2024 NHL Super Fan (10-10 on 10 Scale) ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/52',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 NHL Super Fan (10-10 on 10 Scale) ( )',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP33108A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP33108A_B",
            "type": "double",
            "alias": "2024 NHL Super Fan (10-10 on 10 Scale)"
      },
      {
            "name": "MP33108A_B_P",
            "type": "double",
            "alias": "2024 NHL Super Fan (10-10 on 10 Scale) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_53',
    name: '2024 Intl Soccer Super Fan',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/53',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 Intl Soccer Super Fan',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP33119A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP33119A_B",
            "type": "double",
            "alias": "2024 International Soccer Super Fan (10-10 on 10 Scale)"
      },
      {
            "name": "MP33119A_B_P",
            "type": "double",
            "alias": "2024 International Soccer Super Fan (10-10 on 10 Scale) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_54',
    name: '2024 MLS Soccer Super Fan',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/54',
    group: 'service-layers',
    description: 'Business Analyst Layer: 2024 MLS Soccer Super Fan',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP33120A_B_P',
    status: 'active',
    geographicType: 'postal',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MP33120A_B",
            "type": "double",
            "alias": "2024 MLS Soccer Super Fan (10-10 on 10 Scale)"
      },
      {
            "name": "MP33120A_B_P",
            "type": "double",
            "alias": "2024 MLS Soccer Super Fan (10-10 on 10 Scale) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_55',
    name: 'Generation Z Pop ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/55',
    group: 'service-layers',
    description: 'Business Analyst Layer: Generation Z Pop ( )',
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
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "GENZ_CY",
            "type": "double",
            "alias": "2024 Generation Z Population (Born 1999 to 2016) (Esri)"
      },
      {
            "name": "GENZ_CY_P",
            "type": "double",
            "alias": "2024 Generation Z Population (Born 1999 to 2016) (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_56',
    name: 'Generation Alpha Pop ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/56',
    group: 'service-layers',
    description: 'Business Analyst Layer: Generation Alpha Pop ( )',
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
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "GENALPHACY",
            "type": "double",
            "alias": "2024 Generation Alpha Population (Born 2017 or Later) (Esri)"
      },
      {
            "name": "GENALPHACY_P",
            "type": "double",
            "alias": "2024 Generation Alpha Population (Born 2017 or Later) (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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
    id: 'Synapse54_Vetements_layers_layer_57',
    name: 'Millennial Pop ( )',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/57',
    group: 'service-layers',
    description: 'Business Analyst Layer: Millennial Pop ( )',
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
      },
      {
            "name": "DESCRIPTION",
            "type": "string",
            "alias": "ZIP Code"
      },
      {
            "name": "ID",
            "type": "string",
            "alias": "ID"
      },
      {
            "name": "MILLENN_CY",
            "type": "double",
            "alias": "2024 Millennial Population (Born 1981 to 1998) (Esri)"
      },
      {
            "name": "MILLENN_CY_P",
            "type": "double",
            "alias": "2024 Millennial Population (Born 1981 to 1998) (Esri) (%)"
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
      }
],
    metadata: {
      "provider": "ArcGIS",
      "updateFrequency": "monthly",
      "geographicType": "postal",
      "geographicLevel": "local",
      "geometryType": "polygon"
},
    processing: {
      "strategy": "traditional"
},
    caching: {
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

// Create layers object from base configs
export const layers: { [key: string]: LayerConfig } = Object.fromEntries(
  baseLayerConfigs.map(config => [config.id, ensureLayerHasDescriptionField(updateRendererFieldForPercentage(config))])
);

// === PRESERVED TYPE DEFINITIONS ===
export interface LayerMatch {
  layerId: string;
  relevance: number;
  reasons: string[];
  field?: string;
  matchMethod?: 'ai' | 'rules';
  confidence?: number;
  visualizationMode?: string;
  threshold?: string;
  pointLayerId?: string;
  polygonLayerId?: string;
}

export interface VirtualLayer {
  field: string;
  name: string;
}

// === PRESERVED UTILITY FUNCTIONS ===
export const validateLayerOperation = (layerId: string, operation: string): boolean => {
  const layer = layers[layerId];
  return layer?.analysis?.availableOperations?.includes(operation) ?? false;
};

export const getLayerConstraints = (layerId: string) => {
  const layer = layers[layerId];
  return { geographic: layer?.geographicLevel || "local", dataType: layer?.type || "unknown" };
};

export const canAccessLayer = (layerId: string, accessLevel: AccessLevel = 'read'): boolean => {
  const layer = layers[layerId];
  return layer?.security?.accessLevels?.includes(accessLevel) ?? false;
};

export const getLayerMetadata = (layerId: string) => {
  return layers[layerId]?.metadata;
};

export const exportLayerConfig = (layerId: string) => {
  const layer = layers[layerId];
  if (!layer) {
    throw new Error(`Layer ${layerId} not found`);
  }
  
  return {
    id: layer.id,
    name: layer.name,
    type: layer.type,
    url: layer.url,
    group: layer.group,
    description: layer.description
  };
};

export const getLayerConfigById = (id: string): LayerConfig | undefined => {
  return layers[id];
};

// === PRESERVED EXPORTS FOR COMPATIBILITY ===
export type { LayerConfig };
export { ensureLayerHasDescriptionField };