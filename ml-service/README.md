# Geospatial Analysis ML Microservice

This microservice provides advanced ML-powered analysis capabilities for complex geospatial queries using XGBoost models with SHAP explanations.

## Features

- Predictive analytics for geospatial data
- Multi-variable correlation analysis
- Anomaly detection
- Network analysis
- SHAP-based explainability
- Redis-based response caching for improved performance

## Getting Started

### Prerequisites

- Docker
- Python 3.9+ (for local development)
- Redis (optional for local development, required for production)

### Running with Docker

Build and run the container:

```bash
docker build -t geospatial-ml-service .
docker run -p 5000:5000 -e API_KEY=your_secret_key -e REDIS_URL=redis://localhost:6379 geospatial-ml-service
```

### Local Development Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
export API_KEY=your_secret_key
export REDIS_URL=redis://localhost:6379  # Optional for local development
export DEBUG=True
```

4. Run the development server:
```bash
python app.py
```

## API Endpoints

### POST /api/predict

Make predictions using the ML models.

**Request Headers:**
- `Content-Type: application/json`
- `x-api-key: your_api_key` (if API key authentication is enabled)

**Request Body:**
```json
{
  "query": "predict crime rates for next month in downtown area",
  "visualizationType": "HOTSPOT",
  "layerData": { /* GeoJSON or layer data */ },
  "spatialConstraints": { /* Bounding box or spatial filters */ },
  "temporalRange": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  }
}
```

**Response:**
```json
{
  "predictions": [0.23, 0.45, 0.67],
  "explanations": {
    "shap_values": [[0.1, 0.2, -0.3]],
    "feature_names": ["feature_1", "feature_2", "feature_3"],
    "base_value": 0.5
  },
  "processing_time": 0.123,
  "model_version": "0.1.0",
  "model_type": "hotspot",
  "cached": false
}
```

### GET /api/health

Check the health of the service.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2023-05-15T12:00:00.123456",
  "models": ["hotspot", "multivariate", "prediction", "anomaly", "network", "correlation"],
  "redis": {
    "status": "ok",
    "cache_enabled": true
  },
  "environment": {
    "debug": false
  }
}
```

### GET /ping

Simple health check that doesn't require authentication.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2023-05-15T12:00:00.123456"
}
```

### POST /api/cache/clear

Clear the Redis cache (requires API key authentication).

**Request Headers:**
- `x-api-key: your_api_key`

**Response:**
```json
{
  "status": "ok",
  "message": "Cleared 42 cache entries",
  "timestamp": "2023-05-15T12:00:00.123456"
}
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Port to run the service on | 5000 | No |
| `API_KEY` | Secret key for API authentication | None | Yes (for production) |
| `DEBUG` | Enable debug mode | False | No |
| `REDIS_URL` | Redis connection URL | None | Yes (for caching) |
| `REDIS_TIMEOUT` | Redis connection timeout in seconds | 5 | No |
| `REDIS_CACHE_TTL` | Cache time-to-live in seconds | 3600 | No |
| `CACHE_ENABLED` | Enable Redis caching | True | No |

## Testing and Troubleshooting

### Comprehensive Testing

Use the included test scripts to verify functionality:

```bash
# Test the API endpoints and Redis connectivity
python ml-service-test.py --url http://your-service-url --api-key your_api_key

# For inline testing directly in the Render shell
# Copy and paste the contents of service_health_check.py into the shell
```

### Redis Connectivity Issues

If experiencing Redis connectivity issues:

1. **Verify environment variables** are correctly set
   ```
   REDIS_URL=redis://username:password@host:port
   REDIS_TIMEOUT=5
   REDIS_SOCKET_KEEPALIVE=true
   REDIS_CONNECTION_POOL_SIZE=10
   ```

2. **Test Redis connectivity** using the diagnostic tools:
   ```python
   # Use service_health_check.py to run a comprehensive test
   python service_health_check.py
   ```

3. **Check Redis service status** in the Upstash dashboard
   - Verify connection limits
   - Check for any service outages

4. **Test direct Redis connection** from your local environment to identify if the issue is specific to the Render environment

### Common Issues and Solutions

| Issue | Possible Solution |
|-------|-------------------|
| Redis connection timeouts | Increase `REDIS_TIMEOUT` value |
| "Connection refused" errors | Check if Redis URL is correct and the service is running |
| Slow response times | Enable caching, check Redis performance |
| Authentication failures | Verify API_KEY is set correctly |
| "No module named redis" | Make sure requirements.txt is up to date and dependencies are installed |

## Performance Considerations

The service uses Redis caching to improve performance for repeated queries. The caching behavior can be configured using the following environment variables:

- `CACHE_ENABLED`: Set to 'True' or 'False' to enable/disable caching
- `REDIS_CACHE_TTL`: Time-to-live for cached responses in seconds

Typical response times:
- First request (no cache): 500-1000ms
- Cached responses: 20-50ms

## Adding Custom Models

To add a new model:

1. Train your XGBoost model and save it to the `models/` directory
2. Update the `load_models()` function in `app.py`
3. Add corresponding feature extraction logic in `get_feature_vector()`
4. Add routing logic in `get_model_for_query()` 