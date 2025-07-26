# SHAP Demographic Analytics v2.0 - Render Deployment Guide

## 🎯 **Service Overview**
- **Service Name**: `shap-demographic-analytics-v2`
- **Version**: 2.0.0
- **Data Source**: ArcGIS Synapse54_Vetements_layers (56 layers)
- **Coverage**: 3,983 zip codes with 546 demographic features
- **Capabilities**: Instant SHAP analysis, demographic insights, consumer behavior analysis

## 🚀 **Deployment Steps**

### **Option 1: Deploy via Render Dashboard (Recommended)**

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `https://github.com/eastgrand/xgboost`
   - Branch: `main`

3. **Configure Service**:
   - **Name**: `shap-demographic-analytics-v2`
   - **Environment**: `Python 3`
   - **Plan**: `Starter` (or higher for better performance)
   - **Build Command**: 
     ```bash
     echo "🚀 Building SHAP Demographic Analytics v2.0" && 
     pip cache purge &&
     pip install --no-cache-dir -r requirements.txt &&
     echo "✅ Dependencies installed" &&
     chmod +x ./render_pre_deploy.sh &&
     echo "🔧 Running pre-deployment checks..." &&
     ./render_pre_deploy.sh &&
     echo "⚡ Pre-deployment successful - Model files verified" &&
     chmod +x ./deploy_to_render.sh &&
     export SKIP_MODEL_TRAINING=true &&
     ./deploy_to_render.sh &&
     echo "🎉 Build complete - Ready for demographic analysis!"
     ```
   - **Start Command**:
     ```bash
     echo "🌟 Starting SHAP Demographic Analytics v2.0..." &&
     export PYTHONPATH=$PYTHONPATH:$(pwd) &&
     echo "🧪 Testing app import..." &&
     python3 -c "from app import app; print('✅ App import successful - 3,983 zip codes ready')" &&
     echo "🚀 Starting gunicorn server..." &&
     gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 180 --access-logfile - --error-logfile - --preload
     ```

4. **Environment Variables**:
   ```
   SERVICE_NAME=SHAP Demographic Analytics v2.0
   SERVICE_VERSION=2.0.0
   DATA_SOURCE=ArcGIS_Synapse54_Vetements_56_Layers
   RECORD_COUNT=3983
   FEATURE_COUNT=546
   AGGRESSIVE_MEMORY_MANAGEMENT=true
   SHAP_BATCH_SIZE=100
   SHAP_MAX_BATCH_SIZE=200
   SKIP_MODEL_TRAINING=true
   USE_PRECALCULATED_SHAP=true
   PORT=10000
   ```

5. **Deploy**: Click "Create Web Service"

### **Option 2: Deploy via Render CLI**

```bash
# Install Render CLI (if not already installed)
npm install -g @render/cli

# Login to Render
render login

# Deploy using the v2 configuration
render deploy --file render-v2.yaml
```

## 🔗 **Post-Deployment**

### **1. Verify Deployment**
Once deployed, your service will be available at:
```
https://shap-demographic-analytics-v2.onrender.com
```

### **2. Test Endpoints**
```bash
# Health check
curl https://shap-demographic-analytics-v2.onrender.com/health

# Get SHAP analysis for a zip code
curl https://shap-demographic-analytics-v2.onrender.com/shap?zip_code=10001

# Get available features
curl https://shap-demographic-analytics-v2.onrender.com/features
```

### **3. Expected Response Times**
- **Health check**: < 1 second
- **SHAP analysis**: < 2 seconds (pre-calculated)
- **Feature list**: < 1 second

## 📊 **Service Capabilities**

### **Demographic Analysis**
- Population demographics by zip code
- Income and wealth analysis
- Diversity index calculations
- Household and family statistics

### **Consumer Behavior Insights**
- Athletic brand preferences (Nike, Adidas, Jordan, etc.)
- Sports activity participation
- Shopping patterns (Dick's Sporting Goods, Foot Locker)
- Sports fan preferences (NFL, NBA, MLB, NHL)

### **SHAP Explanations**
- Feature importance for each prediction
- Positive/negative impact analysis
- Demographic factor contributions
- Consumer behavior drivers

## 🎯 **Integration with Project Configuration Manager**

Once deployed, add this service to your Project Configuration Manager:

1. **Service Type**: SHAP Analysis
2. **Service URL**: `https://shap-demographic-analytics-v2.onrender.com`
3. **Endpoints**:
   - Health: `/health`
   - Main: `/shap`
   - Predict: `/predict`
   - Features: `/features`

## 🔧 **Troubleshooting**

### **Common Issues**
1. **Build Timeout**: Increase build timeout in Render settings
2. **Memory Issues**: Reduce SHAP_BATCH_SIZE to 50
3. **Startup Timeout**: Increase timeout to 300 seconds

### **Monitoring**
- Check Render logs for deployment status
- Monitor memory usage (should be < 512MB)
- Verify all 3,983 zip codes are loaded

## 📈 **Performance Optimization**

### **For Heavy Usage**
- Upgrade to **Standard** plan for better performance
- Enable **Auto-Deploy** for seamless updates
- Consider **Redis caching** for frequently accessed zip codes

### **Scaling Options**
- Horizontal scaling: Multiple instances
- Vertical scaling: Upgrade to Professional plan
- Edge caching: CloudFlare integration

---

## 🎉 **Ready for Production!**

Your SHAP Demographic Analytics v2.0 microservice provides:
- ✅ **3,983 zip codes** of demographic data
- ✅ **546 features** from 56 ArcGIS layers
- ✅ **Pre-calculated SHAP values** for instant analysis
- ✅ **Consumer behavior insights** for athletic brands and sports
- ✅ **Production-ready API** for your applications 