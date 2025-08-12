import React from 'react';

interface MetricBadgeProps {
  label: string;
  value: string | number;
  color: 'blue' | 'purple' | 'orange' | 'green' | 'red' | 'gray';
}

const MetricBadge: React.FC<MetricBadgeProps> = ({ label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800', 
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  if (!value && value !== 0) return null;

  return (
    <span className={`${colorClasses[color]} text-xs px-2 py-1 rounded whitespace-nowrap`}>
      {label}: {value}
    </span>
  );
};

interface AnalysisMetadata {
  confidenceScore?: number;
  modelInfo?: {
    accuracy?: number;
    rmse?: number;
    mae?: number;
    silhouette_score?: number;
    n_clusters?: number;
    outlier_ratio?: number;
    contamination?: number;
    model_type?: string;
  };
  isMultiEndpoint?: boolean;
  endpointsUsed?: string[];
  dataPointCount?: number;
  executionTime?: number;
}

interface AnalysisResult {
  endpoint: string;
  metadata?: AnalysisMetadata;
  data?: {
    records?: any[];
  };
}

const createOrderedMetrics = (
  endpoint: string, 
  featuresCount: number,
  analysisType: string,
  modelUsed: string,
  r2Score?: string,
  rmse?: string,
  mae?: string
): React.ReactNode[] => {
  const metrics: React.ReactNode[] = [];

  // Order: features analyzed, Analysis Type, model used, Model R² Score, RMSE, MAE
  
  // 1. Features analyzed
  metrics.push(
    <MetricBadge 
      key="features" 
      label="Features Analyzed" 
      value={featuresCount} 
      color="gray" 
    />
  );

  // 2. Analysis Type
  metrics.push(
    <MetricBadge 
      key="analysisType" 
      label="Analysis Type" 
      value={analysisType} 
      color="blue" 
    />
  );

  // 3. Model Used
  metrics.push(
    <MetricBadge 
      key="model" 
      label="Model Used" 
      value={modelUsed} 
      color="green" 
    />
  );

  // 4. Model R² Score (if available)
  if (r2Score) {
    metrics.push(
      <MetricBadge 
        key="r2" 
        label="Model R² Score" 
        value={r2Score} 
        color="purple" 
      />
    );
  }

  // 5. RMSE (if available)
  if (rmse) {
    metrics.push(
      <MetricBadge 
        key="rmse" 
        label="RMSE" 
        value={rmse} 
        color="orange" 
      />
    );
  }

  // 6. MAE (if available)
  if (mae) {
    metrics.push(
      <MetricBadge 
        key="mae" 
        label="MAE" 
        value={mae} 
        color="red" 
      />
    );
  }

  return metrics;
};

export const renderPerformanceMetrics = (
  analysisResult: AnalysisResult, 
  containerClass: string = "flex flex-wrap gap-2"
): React.ReactNode => {
  const { endpoint, metadata, data } = analysisResult;
  
  if (!metadata) return null;

  const featuresCount = data?.records?.length || 0;

  // Handle multi-endpoint analysis
  if (metadata.isMultiEndpoint && metadata.endpointsUsed) {
    return (
      <div className={containerClass}>
        <MetricBadge 
          label="Features Analyzed" 
          value={featuresCount} 
          color="gray" 
        />
        <MetricBadge 
          label="Analysis Type" 
          value="Multi-Endpoint Analysis" 
          color="blue" 
        />
        <MetricBadge 
          label="Model Used" 
          value={`${metadata.endpointsUsed.length} endpoints`} 
          color="green" 
        />
      </div>
    );
  }

  let metrics: React.ReactNode[] = [];

  // Determine analysis type and render appropriate metrics
  switch (endpoint) {
    case '/predictive-modeling':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Predictive Modeling",
        "Ensemble (8 Algorithms)",
        "87.9%",
        "0.165",
        "0.121"
      );
      break;

    case '/ensemble-analysis':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Ensemble Analysis",
        "8 Algorithms",
        "87.9%",
        "0.165",
        "0.121"
      );
      break;

    case '/model-performance':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Performance Comparison",
        "Ensemble (Best of 11)",
        "87.9%"
      );
      break;

    case '/algorithm-comparison':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Algorithm Comparison",
        "Ensemble (Best of 8)",
        "87.9%"
      );
      break;

    case '/spatial-clusters':
    case '/clustering':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Spatial Clustering",
        "K-Means"
      );
      // Add clustering-specific metrics after the standard ones
      if (metadata.modelInfo?.silhouette_score) {
        metrics.push(
          <MetricBadge 
            key="silhouette" 
            label="Cluster Quality" 
            value={metadata.modelInfo.silhouette_score.toFixed(2)} 
            color="purple" 
          />
        );
      }
      if (metadata.modelInfo?.n_clusters) {
        metrics.push(
          <MetricBadge 
            key="clusters" 
            label="Clusters Found" 
            value={metadata.modelInfo.n_clusters} 
            color="orange" 
          />
        );
      }
      break;

    case '/anomaly-detection':
    case '/outlier-detection':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Anomaly Detection",
        "Isolation Forest"
      );
      // Add anomaly-specific metrics after the standard ones
      if (metadata.modelInfo?.outlier_ratio) {
        metrics.push(
          <MetricBadge 
            key="outliers" 
            label="Anomalies Detected" 
            value={`${(metadata.modelInfo.outlier_ratio * 100).toFixed(1)}%`} 
            color="purple" 
          />
        );
      }
      if (metadata.modelInfo?.contamination) {
        metrics.push(
          <MetricBadge 
            key="contamination" 
            label="Expected Rate" 
            value={`${(metadata.modelInfo.contamination * 100).toFixed(1)}%`} 
            color="orange" 
          />
        );
      }
      break;

    case '/strategic-analysis':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Strategic Analysis",
        "Ensemble (8 Algorithms)",
        "87.9%",
        "0.165",
        "0.121"
      );
      break;

    case '/competitive-analysis':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Competitive Analysis",
        "XGBoost",
        "60.8%",
        "0.300",
        "0.145"
      );
      break;

    case '/demographic-insights':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Demographic Insights",
        "Random Forest",
        "51.3%",
        "0.334",
        "0.166"
      );
      break;

    case '/comparative-analysis':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Comparative Analysis",
        "Support Vector Regression",
        "60.9%",
        "0.300",
        "0.158"
      );
      break;

    case '/correlation-analysis':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Correlation Analysis",
        "Linear Regression",
        "29.7%",
        "0.402",
        "0.161"
      );
      break;

    case '/trend-analysis':
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        "Trend Analysis",
        "Ridge Regression",
        "34.9%",
        "0.386",
        "0.165"
      );
      break;

    default:
      // Fallback for unknown analysis types
      const endpointName = endpoint
        .replace(/^\//, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
      
      metrics = createOrderedMetrics(
        endpoint, 
        featuresCount, 
        endpointName,
        "Unknown Model"
      );
      break;
  }

  return metrics.length > 0 ? <div className={containerClass}>{metrics}</div> : null;
};

export default MetricBadge;