import { LayerConfig } from '@/config/layers';
import MapView from '@arcgis/core/views/MapView';

export interface TestQuery {
  query: string;
  description: string;
  expectedLayers: string[];
  expectedVisualization: 'point' | 'distribution' | 'correlation' | '3d' | 'outlier' | 'scenario' | 'interaction';
  complexity: 'simple' | 'medium' | 'complex';
}

export interface TestResult {
  query: string;
  layers: string[];
  visualization: string;
  timestamp: string;
  error?: string;
}

export const testQueries: TestQuery[] = [
  // Simple Point Queries
  {
    query: "Show me all Target stores in high energy drink consumption areas",
    description: "Tests basic point layer visualization with filtering",
    expectedLayers: ["target", "energyDrinkConsumers"],
    expectedVisualization: "point",
    complexity: "simple"
  },
  {
    query: "Where are the Target stores located?",
    description: "Tests single point layer visualization",
    expectedLayers: ["target"],
    expectedVisualization: "point",
    complexity: "simple"
  },

  // Distribution Queries
  {
    query: "Show me the distribution of energy drink consumption across areas",
    description: "Tests polygon layer visualization with distribution",
    expectedLayers: ["energyDrinkConsumers"],
    expectedVisualization: "distribution",
    complexity: "simple"
  },
  {
    query: "Display the percentage of energy drink consumers by region",
    description: "Tests percentage-based visualization",
    expectedLayers: ["energyDrinkConsumers"],
    expectedVisualization: "distribution",
    complexity: "medium"
  },

  // Correlation Queries
  {
    query: "Compare energy drink consumption with Target store locations",
    description: "Tests correlation between point and polygon layers",
    expectedLayers: ["target", "energyDrinkConsumers"],
    expectedVisualization: "correlation",
    complexity: "medium"
  },
  {
    query: "Show the relationship between energy drink consumption and store density",
    description: "Tests complex correlation analysis",
    expectedLayers: ["target", "energyDrinkConsumers"],
    expectedVisualization: "correlation",
    complexity: "complex"
  },

  // 3D Visualization Queries
  {
    query: "Show me a 3D view of Target stores in high consumption areas",
    description: "Tests 3D visualization capabilities",
    expectedLayers: ["target", "energyDrinkConsumers"],
    expectedVisualization: "3d",
    complexity: "medium"
  },
  {
    query: "Create a 3D visualization of store locations and consumption patterns",
    description: "Tests complex 3D visualization",
    expectedLayers: ["target", "energyDrinkConsumers"],
    expectedVisualization: "3d",
    complexity: "complex"
  },

  // Advanced Analytics Queries - NEW
  
  // Outlier Detection Queries
  {
    query: "What areas are unusual outliers for energy drink consumption?",
    description: "Tests outlier detection for consumption patterns",
    expectedLayers: ["energyDrinkConsumers"],
    expectedVisualization: "outlier",
    complexity: "complex"
  },
  {
    query: "Show me anomalous regions with strange Target store patterns",
    description: "Tests anomaly detection for store locations",
    expectedLayers: ["target"],
    expectedVisualization: "outlier",
    complexity: "complex"
  },
  {
    query: "Which areas stand out as different in consumption behavior?",
    description: "Tests statistical outlier identification",
    expectedLayers: ["energyDrinkConsumers"],
    expectedVisualization: "outlier",
    complexity: "complex"
  },

  // Scenario Analysis Queries
  {
    query: "What if energy drink consumption increased by 20%?",
    description: "Tests scenario modeling with percentage changes",
    expectedLayers: ["energyDrinkConsumers"],
    expectedVisualization: "scenario",
    complexity: "complex"
  },
  {
    query: "How would Target store performance change if demographics shifted?",
    description: "Tests demographic scenario analysis",
    expectedLayers: ["target", "energyDrinkConsumers"],
    expectedVisualization: "scenario",
    complexity: "complex"
  },
  {
    query: "Simulate a 15% increase in household income across regions",
    description: "Tests income scenario simulation",
    expectedLayers: ["energyDrinkConsumers"],
    expectedVisualization: "scenario",
    complexity: "complex"
  },

  // Feature Interaction Queries
  {
    query: "How do energy drink consumption and Target store density work together?",
    description: "Tests feature interaction analysis",
    expectedLayers: ["target", "energyDrinkConsumers"],
    expectedVisualization: "interaction",
    complexity: "complex"
  },
  {
    query: "What combinations of consumption and store locations amplify sales?",
    description: "Tests synergistic interaction detection",
    expectedLayers: ["target", "energyDrinkConsumers"],
    expectedVisualization: "interaction",
    complexity: "complex"
  },
  {
    query: "Analyze the combined effect of demographics and store accessibility",
    description: "Tests complex interaction modeling",
    expectedLayers: ["target", "energyDrinkConsumers"],
    expectedVisualization: "interaction",
    complexity: "complex"
  },

  // Complex Queries
  {
    query: "Find areas with high energy drink consumption but no Target stores",
    description: "Tests complex spatial analysis",
    expectedLayers: ["target", "energyDrinkConsumers"],
    expectedVisualization: "distribution",
    complexity: "complex"
  },
  {
    query: "Show me the top 10 areas for energy drink consumption and their nearest Target stores",
    description: "Tests multi-layer analysis with ranking",
    expectedLayers: ["target", "energyDrinkConsumers"],
    expectedVisualization: "point",
    complexity: "complex"
  }
];

export async function runTestQuery(
  query: TestQuery,
  mapView: MapView,
  onComplete: (result: TestResult) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    console.log(`Running test query: ${query.query}`);
    console.log(`Expected layers: ${query.expectedLayers.join(', ')}`);
    console.log(`Expected visualization: ${query.expectedVisualization}`);

    // Here you would integrate with your actual query processing pipeline
    // For now, we'll just simulate the process
    const result: TestResult = {
      query: query.query,
      layers: query.expectedLayers,
      visualization: query.expectedVisualization,
      timestamp: new Date().toISOString()
    };

    onComplete(result);
  } catch (error) {
    console.error(`Error running test query: ${error}`);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
} 