# Microservice Deployment Guide for Render.com

This guide provides step-by-step instructions for deploying the SHAP microservice to Render.com for new projects, including configuration optimization and scaling strategies.

## Table of Contents

1. [Prerequisites and Setup](#prerequisites-and-setup)
2. [Render.com Configuration](#rendercom-configuration)
3. [Environment Variables](#environment-variables)
4. [Memory Optimization](#memory-optimization)
5. [Worker Configuration](#worker-configuration)
6. [Deployment Process](#deployment-process)
7. [Verification and Testing](#verification-and-testing)
8. [Scaling and Maintenance](#scaling-and-maintenance)

## Prerequisites and Setup

### 1. Required Accounts and Tools

**Accounts Needed:**
- GitHub account with your microservice repository
- Render.com account (free tier available)
- Redis service (Render provides free Redis)

**Local Requirements:**
- Git configured with your repository
- Python 3.11+ with trained models
- Access to your trained model files

### 2. Repository Preparation

Ensure your microservice repository contains:

```
shap-microservice/
├── app.py                          # Flask application
├── enhanced_analysis_worker.py     # Redis queue worker
├── requirements.txt               # Python dependencies
├── render.yaml                    # Render deployment config
├── Procfile                       # Process definitions
├── models/
│   ├── xgboost_model.pkl         # Trained model
│   ├── feature_names.txt         # Feature list
│   └── shap_explainer.pkl        # SHAP explainer
├── data/
│   └── cleaned_data.csv          # Training data
└── deployment scripts/
    ├── deploy_to_render_final.sh  # Deployment script
    └── verify_render_deployment.sh # Verification script
```

### 3. Pre-Deployment Preparation

Run the automated deployment preparation:

```bash
cd shap-microservice

# Make deployment script executable
chmod +x deploy_to_render_final.sh

# Run deployment preparation
./deploy_to_render_final.sh
```

This script:
- Validates all required files are present
- Creates optimized `render.yaml` configuration
- Sets up environment variables
- Prepares model files for deployment

## Render.com Configuration

### 1. Create New Service

1. **Login to Render Dashboard**
   - Visit [https://dashboard.render.com](https://dashboard.render.com)
   - Sign in with your account

2. **Create Blueprint Service**
   - Click "New" → "Blueprint"
   - Connect your GitHub account
   - Select your microservice repository
   - Render automatically detects `render.yaml`

### 2. Render.yaml Configuration

The optimized `render.yaml` includes:

```yaml
services:
  - type: web
    name: your-project-shap-api
    env: python
    buildCommand: |
      python -m pip install --upgrade pip &&
      pip install -r requirements.txt &&
      python patch_shap.py &&
      python setup_for_render.py
    startCommand: "gunicorn --bind :$PORT --workers 1 --timeout 300 --max-requests 100 --max-requests-jitter 10 app:app"
    plan: starter  # 512MB RAM, 0.5 CPU
    healthCheckPath: /health
    envVars:
      - key: PORT
        value: 10000
      - key: PYTHONUNBUFFERED
        value: 1
      - key: REDIS_URL
        fromService:
          type: redis
          name: your-project-redis
          property: connectionString

  - type: redis
    name: your-project-redis
    plan: starter  # Free tier: 25MB storage
    maxmemoryPolicy: allkeys-lru

  - type: worker
    name: your-project-shap-worker
    env: python
    buildCommand: |
      python -m pip install --upgrade pip &&
      pip install -r requirements.txt &&
      python patch_shap.py
    startCommand: "python simple_worker.py"
    plan: starter
    envVars:
      - key: REDIS_URL
        fromService:
          type: redis
          name: your-project-redis
          property: connectionString
```

### 3. Service Naming Convention

Update service names for your project:

```bash
# Replace "your-project" with your actual project name
sed -i 's/your-project/nike-analytics/g' render.yaml
```

## Environment Variables

### 1. Required Environment Variables

Configure these in Render dashboard under "Environment":

| Variable | Value | Description |
|----------|--------|-------------|
| `PORT` | `10000` | Application port |
| `PYTHONUNBUFFERED` | `1` | Real-time logging |
| `DEBUG` | `false` | Production mode |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

### 2. Authentication Configuration

**For Production:**
```bash
REQUIRE_AUTH=true
API_KEY=your-secure-randomly-generated-key-here
```

**Generate Secure API Key:**
```bash
# Generate a secure API key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Performance Optimization Variables

**Memory Management:**
```bash
MAX_MEMORY_MB=475          # Leave headroom for 512MB limit
AGGRESSIVE_MEMORY_MANAGEMENT=true
SHAP_MAX_BATCH_SIZE=500    # Batch size for SHAP calculations
```

**Redis Configuration:**
```bash
REDIS_TIMEOUT=15           # Connection timeout
REDIS_SOCKET_KEEPALIVE=true # Keep connections alive
REDIS_HEALTH_CHECK_INTERVAL=30
```

**Model Configuration:**
```bash
SKIP_MODEL_TRAINING=false  # Set to true for faster deployments
MODEL_COMPRESSION=true     # Enable model compression
FEATURE_SELECTION_ENABLED=true
```

## Memory Optimization

### 1. Memory Management Strategy

The microservice includes automatic memory optimization:

```python
# Memory thresholds (in MB)
MEMORY_THRESHOLDS = {
    'critical': 475,    # Activate all optimizations
    'high': 400,        # Skip cross-validation
    'moderate': 350     # Reduce model complexity
}
```

### 2. Optimization Features

**Automatic Optimizations:**
- **Data Compression**: Optimize DataFrame memory usage
- **Batch Processing**: Process large requests in chunks
- **Garbage Collection**: Force cleanup after heavy operations
- **Model Caching**: Intelligent model loading and unloading

### 3. Monitor Memory Usage

**Memory Monitoring Endpoints:**
```bash
# Check current memory usage
curl https://your-service.onrender.com/memory-stats

# Monitor system health
curl https://your-service.onrender.com/health
```

## Worker Configuration

### 1. Redis Queue Worker Setup

The worker handles async SHAP calculations:

```python
# enhanced_analysis_worker.py configuration
WORKER_CONFIG = {
    'queue_name': 'shap-jobs',
    'worker_timeout': 300,      # 5 minutes per job
    'job_timeout': 600,         # 10 minutes total
    'max_retries': 3,
    'batch_size': 100
}
```

### 2. Worker Scaling

**Single Worker (Starter Plan):**
- Handles 1 job at a time
- 5-minute timeout per SHAP calculation
- Automatic restart on failures

**Multiple Workers (Paid Plans):**
```yaml
# In render.yaml for scaling
- type: worker
  name: your-project-shap-worker-1
  # ... configuration
- type: worker
  name: your-project-shap-worker-2
  # ... configuration
```

### 3. Job Management

**Monitor Worker Health:**
```bash
# Check worker status
curl https://your-service.onrender.com/worker-status

# View job queue
curl https://your-service.onrender.com/queue-status
```

## Deployment Process

### 1. Initial Deployment

**Deploy via Git Integration:**

```bash
# Commit your optimized configuration
git add .
git commit -m "Configure for Render deployment"
git push origin main

# Render automatically deploys on push
```

**Monitor Deployment:**
1. Watch build logs in Render dashboard
2. Check for successful model loading
3. Verify all services start correctly

### 2. Build Process

The build performs these steps:

```bash
1. Install Python dependencies (2-3 minutes)
2. Apply SHAP compatibility patches (30 seconds)
3. Set up Redis connections (15 seconds)
4. Load and validate models (1-2 minutes)
5. Start web server and worker (30 seconds)

Total: 5-7 minutes
```

### 3. Deployment Options

**Option A: Full Deployment with Model Training**
```bash
# Remove .skip_training flag
rm .skip_training
git add -u && git commit -m "Enable model training" && git push
```

**Option B: Fast Deployment (Skip Training)**
```bash
# Create skip training flag
touch .skip_training
git add .skip_training && git commit -m "Skip model training" && git push
```

## Verification and Testing

### 1. Automated Verification

Use the provided verification script:

```bash
# Test your deployed service
chmod +x verify_render_deployment.sh
./verify_render_deployment.sh https://your-service.onrender.com your-api-key
```

**Verification Checks:**
- Service health and uptime
- Redis connection functionality
- Model loading and accuracy
- SHAP calculation performance
- Memory usage monitoring
- API endpoint responses

### 2. Manual API Testing

**Health Check:**
```bash
curl https://your-service.onrender.com/health
```

**Metadata Request:**
```bash
curl -H "X-API-KEY: your-key" https://your-service.onrender.com/metadata
```

**Analysis Request:**
```bash
curl -X POST https://your-service.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: your-key" \
  -d '{
    "analysis_type": "correlation",
    "target_variable": "Nike_Sales_Pct",
    "limit": 10
  }'
```

### 3. Performance Testing

**Load Testing:**
```bash
# Test concurrent requests
python test_concurrent_requests.py --url https://your-service.onrender.com --concurrent 5
```

**Memory Stress Test:**
```bash
# Test memory usage under load
python test_memory_stress.py --url https://your-service.onrender.com
```

## Scaling and Maintenance

### 1. Vertical Scaling

**Upgrade to Larger Plans:**
- **Standard**: 2GB RAM, 1 CPU ($7/month)
- **Pro**: 4GB RAM, 2 CPU ($20/month)
- **Pro Plus**: 8GB RAM, 4 CPU ($40/month)

**Update Memory Thresholds:**
```bash
# For 2GB plan
MAX_MEMORY_MB=1800

# For 4GB plan  
MAX_MEMORY_MB=3600
```

### 2. Horizontal Scaling

**Multiple Worker Instances:**
```yaml
# Add to render.yaml
- type: worker
  name: project-worker-2
  # ... same config as main worker
```

**Load Balancing:**
- Render automatically load balances web requests
- Redis queue distributes jobs across workers
- Monitor queue length and response times

### 3. Monitoring and Alerts

**Set Up Alerts:**
1. Go to your service in Render dashboard
2. Click "Settings" → "Alerts"  
3. Configure alerts for:
   - Service downtime
   - High memory usage (>400MB)
   - Response time increases
   - Error rate spikes

**Custom Monitoring:**
```bash
# Monitor service health
curl https://your-service.onrender.com/health | jq '.memory_usage'

# Check job processing rate
curl https://your-service.onrender.com/queue-stats
```

### 4. Maintenance Tasks

**Weekly:**
- Review error logs in Render dashboard
- Check memory usage trends
- Monitor job success rates

**Monthly:**
- Update dependencies if needed
- Review performance metrics
- Consider scaling adjustments

**As Needed:**
- Update model with new training data
- Adjust memory thresholds based on usage
- Scale workers based on job volume

## Deployment Checklist

### Pre-Deployment
- [ ] Repository contains all required files
- [ ] Model files are trained and validated locally
- [ ] Field mappings are configured correctly
- [ ] API keys are generated securely
- [ ] Deployment script runs without errors

### Render Configuration
- [ ] Services created in Render dashboard
- [ ] Environment variables configured
- [ ] Redis service connected
- [ ] GitHub integration set up
- [ ] Build commands validated

### Post-Deployment
- [ ] All services show "Live" status
- [ ] Health checks return 200 OK
- [ ] API authentication works
- [ ] SHAP calculations complete successfully
- [ ] Memory usage stays below limits
- [ ] Worker processes jobs correctly

### Integration Testing
- [ ] Client application can connect to API
- [ ] Data export scripts work with deployed service
- [ ] Endpoint generation completes successfully
- [ ] End-to-end analysis pipeline functions

## Troubleshooting

### Common Deployment Issues

**Build Failures:**
```bash
# Check build logs for specific errors
# Common issues:
- Missing dependencies in requirements.txt
- SHAP patch application failures
- Model file corruption
- Memory limits during build
```

**Service Won't Start:**
```bash
# Check runtime logs
# Common causes:
- Port binding issues (ensure PORT=10000)
- Missing environment variables
- Model loading failures
- Redis connection problems
```

**Memory Errors:**
```bash
# Reduce memory usage
MAX_MEMORY_MB=400
SHAP_MAX_BATCH_SIZE=300
AGGRESSIVE_MEMORY_MANAGEMENT=true
```

**Worker Issues:**
```bash
# Check worker logs for:
- Redis connection errors
- Job timeout failures
- Memory exhaustion
- SHAP calculation errors
```

---

**Next Steps**: Once deployment is complete, proceed to [MICROSERVICE_03_ENDPOINT_GENERATION.md](./MICROSERVICE_03_ENDPOINT_GENERATION.md) for endpoint data creation.

**Last Updated**: January 2025  
**Compatibility**: Render.com, Python 3.11+, Redis 6.0+