// Layer configuration with preserved structure
// Auto-generated on 2025-08-07T21:26:56.439808
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
      'Dick\'s'
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
    name: 'Generation Alpha Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/0',
    group: 'general',
    description: 'Business Analyst Layer: Generation Alpha Pop',
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
    name: 'Generation Z Pop',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/1',
    group: 'general',
    description: 'Business Analyst Layer: Generation Z Pop',
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
    name: 'Used Google Pay Digital Payment Svc',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/2',
    group: 'general',
    description: 'Business Analyst Layer: Used Google Pay Digital Payment Svc',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP10120A_B_P',
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
            "name": "MP10120A_B",
            "type": "double",
            "alias": "2025 Used Google Pay Digital Payment Service Last 30 Days"
      },
      {
            "name": "MP10120A_B_P",
            "type": "double",
            "alias": "2025 Used Google Pay Digital Payment Service Last 30 Days (%)"
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
    name: 'Used Apple Pay Digital Payment Svc',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/3',
    group: 'general',
    description: 'Business Analyst Layer: Used Apple Pay Digital Payment Svc',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP10110A_B_P',
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
            "name": "MP10110A_B",
            "type": "double",
            "alias": "2025 Used Apple Pay Digital Payment Service Last 30 Days"
      },
      {
            "name": "MP10110A_B_P",
            "type": "double",
            "alias": "2025 Used Apple Pay Digital Payment Service Last 30 Days (%)"
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
    name: 'Used Bank of America Bank 12 Mo',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/4',
    group: 'general',
    description: 'Business Analyst Layer: Used Bank of America Bank 12 Mo',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP10002A_B_P',
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
            "name": "MP10002A_B",
            "type": "double",
            "alias": "2025 Used Bank of America Bank Last 12 Mo"
      },
      {
            "name": "MP10002A_B_P",
            "type": "double",
            "alias": "2025 Used Bank of America Bank Last 12 Mo (%)"
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
    name: 'Own Cryptocurrency Investment',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/5',
    group: 'general',
    description: 'Business Analyst Layer: Own Cryptocurrency Investment',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP10138A_B_P',
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
            "name": "MP10138A_B",
            "type": "double",
            "alias": "2025 Own Cryptocurrency Investment"
      },
      {
            "name": "MP10138A_B_P",
            "type": "double",
            "alias": "2025 Own Cryptocurrency Investment (%)"
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
    name: 'Have Personal Line of Credit',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/6',
    group: 'general',
    description: 'Business Analyst Layer: Have Personal Line of Credit',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP10028A_B_P',
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
            "name": "MP10028A_B",
            "type": "double",
            "alias": "2025 Have Personal Line of Credit"
      },
      {
            "name": "MP10028A_B_P",
            "type": "double",
            "alias": "2025 Have Personal Line of Credit (%)"
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
    name: 'Have Savings Account',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/7',
    group: 'general',
    description: 'Business Analyst Layer: Have Savings Account',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP10020A_B_P',
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
            "name": "MP10020A_B",
            "type": "double",
            "alias": "2025 Have Savings Account"
      },
      {
            "name": "MP10020A_B_P",
            "type": "double",
            "alias": "2025 Have Savings Account (%)"
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
    name: 'Carry Credit Card Balance 3-Usually Always',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/8',
    group: 'general',
    description: 'Business Analyst Layer: Carry Credit Card Balance 3-Usually Always',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP10116A_B_P',
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
            "name": "MP10116A_B",
            "type": "double",
            "alias": "2025 Carry Credit Card Balance: 3-Usually or Always"
      },
      {
            "name": "MP10116A_B_P",
            "type": "double",
            "alias": "2025 Carry Credit Card Balance: 3-Usually or Always (%)"
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
    name: 'Used TurboTax Online to Prepare Taxes',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/9',
    group: 'general',
    description: 'Business Analyst Layer: Used TurboTax Online to Prepare Taxes',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP10104A_B_P',
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
            "name": "MP10104A_B",
            "type": "double",
            "alias": "2025 Used TurboTax Online to Prepare Taxes"
      },
      {
            "name": "MP10104A_B_P",
            "type": "double",
            "alias": "2025 Used TurboTax Online to Prepare Taxes (%)"
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
    name: 'Used H&R Block Online to Prepare Taxes',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/10',
    group: 'general',
    description: 'Business Analyst Layer: Used H&R Block Online to Prepare Taxes',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'MP10128A_B_P',
    status: 'active',
    geographicType: 'block',
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
            "name": "MP10128A_B",
            "type": "double",
            "alias": "2025 Used H&R Block Online to Prepare Taxes"
      },
      {
            "name": "MP10128A_B_P",
            "type": "double",
            "alias": "2025 Used H&R Block Online to Prepare Taxes (%)"
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
    name: 'Value of Credit Card Debt',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/11',
    group: 'general',
    description: 'Business Analyst Layer: Value of Credit Card Debt',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X14068_X',
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
            "name": "X14068_X",
            "type": "double",
            "alias": "2025 Value of Credit Card Debt"
      },
      {
            "name": "X14068_X_A",
            "type": "double",
            "alias": "2025 Value of Credit Card Debt (Avg)"
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
    name: 'Value of Checking Savings Money Mkt CD',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/12',
    group: 'general',
    description: 'Business Analyst Layer: Value of Checking Savings Money Mkt CD',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X14060_X',
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
            "name": "X14060_X",
            "type": "double",
            "alias": "2025 Value of Checking/Savings/Money Mkt/CDs"
      },
      {
            "name": "X14060_X_A",
            "type": "double",
            "alias": "2025 Value of Checking/Savings/Money Mkt/CDs (Avg)"
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
    name: 'Value of Stocks Bonds Mutual Funds',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/13',
    group: 'general',
    description: 'Business Analyst Layer: Value of Stocks Bonds Mutual Funds',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'X14058_X',
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
            "name": "X14058_X",
            "type": "double",
            "alias": "2025 Value of Stocks/Bonds/Mutual Funds"
      },
      {
            "name": "X14058_X_A",
            "type": "double",
            "alias": "2025 Value of Stocks/Bonds/Mutual Funds (Avg)"
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
    name: 'H&R Block by ZIP',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/14',
    group: 'general',
    description: 'Business Analyst Layer: H&R Block by ZIP',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'pointCount',
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
            "name": "pointCount",
            "type": "double",
            "alias": "pointCount"
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
    name: 'H&R Block points',
    type: 'feature-service',
    url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__ca07eefffe5b4914/FeatureServer/15',
    group: 'general',
    description: 'Business Analyst Layer: H&R Block points',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: 'esri_pid',
    status: 'active',
    geographicType: 'block',
    geographicLevel: 'local',
    fields: [
      {
            "name": "OBJECTID",
            "type": "oid",
            "alias": "Object ID"
      },
      {
            "name": "name",
            "type": "string",
            "alias": "POI Name"
      },
      {
            "name": "address",
            "type": "string",
            "alias": "Address"
      },
      {
            "name": "locality",
            "type": "string",
            "alias": "Locality"
      },
      {
            "name": "region",
            "type": "string",
            "alias": "Region"
      },
      {
            "name": "postcode",
            "type": "string",
            "alias": "Postcode"
      },
      {
            "name": "country",
            "type": "string",
            "alias": "Country Abbreviation"
      },
      {
            "name": "fsq_category",
            "type": "string",
            "alias": "Foursquare Categories"
      },
      {
            "name": "fsq_category_all",
            "type": "string",
            "alias": "All Foursquare Categories"
      },
      {
            "name": "INDUSTRY_DESC",
            "type": "string",
            "alias": "Industry Description"
      },
      {
            "name": "source",
            "type": "string",
            "alias": "Source"
      },
      {
            "name": "esri_pid",
            "type": "string",
            "alias": "Esri ID"
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
  'general': [
    'Unknown_Service_layer_0',
    'Unknown_Service_layer_1',
    'Unknown_Service_layer_2',
    'Unknown_Service_layer_3',
    'Unknown_Service_layer_4',
    'Unknown_Service_layer_5',
    'Unknown_Service_layer_6',
    'Unknown_Service_layer_7',
    'Unknown_Service_layer_8',
    'Unknown_Service_layer_9',
    'Unknown_Service_layer_10',
    'Unknown_Service_layer_11',
    'Unknown_Service_layer_12',
    'Unknown_Service_layer_13',
    'Unknown_Service_layer_14',
    'Unknown_Service_layer_15'
  ],

};

// Export individual layers for direct access
export const layers: { [key: string]: LayerConfig } = layerConfigs.reduce((acc, layer) => {
  acc[layer.id] = layer;
  return acc;
}, {} as { [key: string]: LayerConfig });

// Export layer count for monitoring
export const layerCount = layerConfigs.length;

// Spatial filtering configuration
export const SPATIAL_REFERENCE_LAYER_ID = 'Unknown_Service_layer_0';

// Export generation metadata
export const generationMetadata = {
  generatedAt: '2025-08-07T21:26:56.439808',
  layerCount: 16,
  groupCount: 1,
  automationVersion: '1.0.0'
};
