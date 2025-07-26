# ML-Based Query Classification Implementation Plan

## Overview

This document outlines the implementation plan for enhancing the geospatial query classification system with machine learning while preserving the current pattern-matching approach as a fallback.

## Architecture

```
┌─────────────┐     ┌───────────────┐     ┌─────────────────┐
│ Client App  │────►│ ML Classifier │────►│ Vercel Function │
│             │◄────│ (TensorFlow.js)│◄────│                 │
└─────────────┘     └───────────────┘     └─────────────────┘
       │                                           ▲
       │                                           │
       ▼                                           │
┌─────────────┐                         ┌─────────────────┐
│ Pattern     │                         │ Model Training  │
│ Matcher     │                         │ Pipeline (CI/CD)│
└─────────────┘                         └─────────────────┘
```

## 1. Model Training & Preparation (Python)

### 1.1. Data Collection
- Extract 500-1000 example queries from logs or create synthetic examples
- Label with appropriate visualization types
- Split into training (70%), validation (15%), and test (15%) sets

### 1.2. Model Architecture
- Use DistilBERT base for text embedding (smaller than BERT, better for deployment)
- Add classification head for visualization type prediction
- Output: visualization type + confidence score

### 1.3. Training Script
```python
import tensorflow as tf
from transformers import DistilBertTokenizer, TFDistilBertForSequenceClassification
import pandas as pd
from sklearn.model_selection import train_test_split

# Load and prepare data
data = pd.read_csv('labeled_queries.csv')
train_texts, val_texts, train_labels, val_labels = train_test_split(
    data['query'].tolist(), data['viz_type'].tolist(), test_size=0.15
)

# Initialize tokenizer and model
tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
model = TFDistilBertForSequenceClassification.from_pretrained(
    'distilbert-base-uncased', num_labels=10  # Number of viz types
)

# Train model
# ...training code...

# Save model for TensorFlow.js
model.save('tf_model')
```

### 1.4. Model Conversion
```bash
tensorflowjs_converter \
  --input_format=tf_saved_model \
  --output_format=tfjs_graph_model \
  --signature_name=serving_default \
  --saved_model_tags=serve \
  tf_model \
  web_model
```

## 2. Vercel Function Setup

### 2.1. Function Structure
```
/api
  /classify-query
    index.js      # Main function handler
    model/        # TensorFlow.js model files
    tokenizer.js  # Tokenization logic
    package.json  # Dependencies
```

### 2.2. Function Implementation
```javascript
// api/classify-query/index.js
import * as tf from '@tensorflow/tfjs-node';
import { tokenize } from './tokenizer';

let model;

async function loadModel() {
  if (!model) {
    model = await tf.loadGraphModel(`file://${__dirname}/model/model.json`);
  }
  return model;
}

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Load model if not loaded
    const model = await loadModel();
    
    // Tokenize and process query
    const tokens = tokenize(query);
    const inputTensor = tf.tensor([tokens]);
    
    // Run inference
    const predictions = await model.predict(inputTensor);
    const result = await formatPredictions(predictions);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error processing query:', error);
    return res.status(500).json({ error: 'Error processing query' });
  }
}
```

### 2.3. Vercel Config
```json
{
  "functions": {
    "api/classify-query/index.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

## 3. Client-Side Integration

### 3.1. Update QueryClassifier

```typescript
// lib/query-classifier.ts
import { VisualizationType } from '../config/dynamic-layers';

interface MLPrediction {
  type: VisualizationType;
  confidence: number;
}

export class QueryClassifier {
  // ... existing code ...
  
  private async callMLService(query: string): Promise<MLPrediction | null> {
    try {
      const response = await fetch('/api/classify-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('Error calling ML service:', error);
      return null;
    }
  }
  
  async classifyAnalysisResult(analysisResult: AnalysisResult): Promise<VisualizationType> {
    const query = analysisResult.originalQuery || '';
    
    // Try ML classification first
    if (query) {
      const mlPrediction = await this.callMLService(query);
      
      // Use ML result if confident enough (threshold configurable)
      if (mlPrediction && mlPrediction.confidence > 0.7) {
        console.log('Using ML classification:', mlPrediction.type);
        return mlPrediction.type;
      }
    }
    
    // Fall back to pattern matching
    console.log('Falling back to pattern matching');
    return this.classifyWithPatterns(analysisResult);
  }
  
  // Rename existing method to make the fallback path clear
  private classifyWithPatterns(analysisResult: AnalysisResult): VisualizationType {
    // Move existing pattern-matching logic here
    // This is the current implementation of classifyAnalysisResult
    
    // ... existing pattern matching code ...
  }
}
```

### 3.2. Update the Classification Method in DynamicVisualizationFactory

```typescript
// lib/DynamicVisualizationFactory.ts
import { queryClassifier } from '../lib/query-classifier';

// ... existing code ...

async suggestVisualizationType(
  query: string, 
  layerId: string, 
  geometryType?: string, 
  numFields?: number
): Promise<VisualizationType> {
  // Use the enhanced classifier (which now tries ML first, then fallback)
  const analysisResult: AnalysisResult = {
    intent: '',
    relevantLayers: [layerId],
    queryType: 'unknown',
    confidence: 0,
    explanation: '',
    originalQuery: query
  };
  
  return await queryClassifier.classifyAnalysisResult(analysisResult);
}
```

## 4. Performance Optimization

### 4.1. Client-Side Caching
- Cache ML predictions in localStorage with time expiration
- Reuse predictions for similar queries

### 4.2. Vercel Edge Caching
- Configure cache headers for function responses
- Use edge caching for common queries

## 5. Monitoring & Evaluation

### 5.1. Logging Strategy
- Log classification results with source (ML or pattern)
- Track confidence scores and user interactions

### 5.2. Feedback Loop
- Periodically export logs for model improvement
- Set up continuous training pipeline

## 6. Deployment Strategy

### 6.1. Phased Rollout
1. Deploy ML endpoint with low confidence threshold (more fallbacks)
2. Monitor accuracy for 1-2 weeks
3. Gradually increase confidence threshold as performance proves reliable

### 6.2. CI/CD Pipeline
- Set up automatic model retraining based on new data
- Configure model deployment to Vercel via GitHub Actions

## 7. Implementation Timeline

| Week | Tasks |
|------|-------|
| 1    | Data collection and preparation |
| 2    | Model training and optimization |
| 3    | Vercel function implementation |
| 4    | Client integration and testing |
| 5    | Phased rollout and monitoring |

## 8. Fallback Strategy

If the ML classification service is unavailable:
1. Set a timeout (e.g., 1000ms) for ML service calls
2. Log the failure and silently fall back to pattern matching
3. Set up alerts if failure rate exceeds threshold

## Evaluation Metrics

- Classification accuracy (compared to ground truth)
- Latency (average response time)
- Fallback rate (% of queries using pattern matching)
- User satisfaction (measured through feedback or interaction) 