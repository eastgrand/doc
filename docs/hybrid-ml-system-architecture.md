# Hybrid ML System Architecture

## Overview

The Hybrid ML System combines rule-based pattern matching with machine learning to provide efficient and powerful geospatial analysis. The system automatically routes simple queries to the faster rule-based processor while sending complex, statistical, or predictive queries to the more powerful but slower ML microservice.

## Architecture Diagram

```
┌─────────────────┐      ┌───────────────────────┐
│                 │      │                       │
│   Client UI     │─────►│  Query Classification │
│                 │      │                       │
└─────────────────┘      └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │                       │
                         │ Complexity Assessment │
                         │                       │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │                       │
                         │    Routing Layer      │
                         │                       │
                         └───┬───────────────┬───┘
                             │               │
                ┌────────────▼─────┐ ┌───────▼──────────┐
                │                  │ │                  │
                │   Rule-Based     │ │  ML-Based        │
                │   Processing     │ │  Processing      │
                │                  │ │                  │
                └────────────┬─────┘ └───────┬──────────┘
                             │               │
                             └───────┬───────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │                       │
                         │  Result Integration   │
                         │                       │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │                       │
                         │   Visualization       │
                         │                       │
                         └───────────────────────┘
```

## Components

### 1. Query Complexity Scorer

The `query-complexity-scorer.ts` module analyzes natural language queries and assigns a complexity score based on multiple factors:

- **Parameter Count**: Number of variables or data attributes requested
- **Statistical Terminology**: Presence of terms like correlation, regression, p-value
- **Temporal Requirements**: Time-series analysis, forecasting, prediction
- **Spatial Complexity**: Advanced spatial relationships (proximity, containment)

The scorer produces a value from 0-10 and determines if ML processing is required.

### 2. ML Service Client

The `ml-service-client.ts` module provides a robust interface to the Python-based ML microservice:

- Handles communication with the ML service
- Implements caching to improve performance
- Provides error handling and retry logic
- Formats requests and responses

### 3. Hybrid Query Processor

The `hybrid-query-processor.ts` module orchestrates the entire workflow:

- Receives user queries
- Routes queries to appropriate processing path based on complexity
- Collects telemetry for system optimization
- Adaptively adjusts routing thresholds based on performance
- Provides fallback mechanisms if ML service is unavailable

### 4. ML Microservice

The Python-based microservice (`ml-service/app.py`) provides advanced analytical capabilities:

- Runs XGBoost models for various analysis types
- Generates SHAP explanations for model outputs
- Specializes in:
  - Predictive analytics
  - Correlation analysis
  - Anomaly detection
  - Statistical significance testing
  - Network analysis

### 5. User Interface Integration

The React-based UI integration:

- Provides context provider for hybrid query processing
- Displays ML processing indicator when advanced analysis is used
- Manages state and error handling
- Integrates with existing visualization components

## Processing Flow

1. User submits a query through the interface
2. Query is classified to determine visualization type
3. Query complexity is evaluated
4. Query is routed to rule-based or ML-based processing
5. Results are integrated and returned to the UI
6. Visualization is generated based on the results
7. ML indicator is displayed if ML processing was used

## Performance Optimization

The system includes several optimization techniques:

- **Caching**: Frequent or similar queries use cached results
- **Adaptive Routing**: Thresholds adjust based on system performance
- **Telemetry**: Usage patterns inform system optimization
- **Fallback Mechanisms**: System degrades gracefully if ML service is unavailable

## Configuration

Feature flags allow customization of the system:

- `mlEnabled`: Enable/disable ML processing entirely
- `useTelemetry`: Enable/disable telemetry collection
- `adaptiveThreshold`: Enable/disable automatic threshold adjustment

## Development and Testing

The system includes comprehensive test coverage:

- Unit tests for the complexity scorer
- Integration tests for the hybrid processor
- End-to-end tests for the entire workflow

## Future Enhancements

1. **Advanced Caching**: Implement distributed caching for multi-server deployments
2. **Model Versioning**: Support multiple model versions for A/B testing
3. **Feedback Loop**: Capture user feedback to improve model accuracy
4. **Streaming Analysis**: Support real-time data streaming for time-sensitive applications 