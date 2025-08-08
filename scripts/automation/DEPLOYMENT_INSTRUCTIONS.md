# Complete Microservice Deployment Instructions

🚀 **Step-by-step guide for deploying your ArcGIS-generated microservice to Render**

## 📋 Overview

After the automation pipeline creates your microservice package, you need to:
1. **Deploy the microservice to Render** (15-20 minutes)
2. **Update your client code** with the new microservice URL (5 minutes)

## 🎯 Step 1: Deploy Microservice to Render

### 1.1 Prerequisites
- ✅ Render.com account (free tier is fine)
- ✅ GitHub account
- ✅ Microservice package created by automation pipeline

### 1.2 Create Microservice Repository

**Option A: Create New Repository**
```bash
# 1. Create new repository on GitHub
# Name: your-project-microservice (e.g., nike-2025-microservice)

# 2. Clone the repository locally
git clone https://github.com/yourusername/your-project-microservice.git
cd your-project-microservice

# 3. Copy microservice template files
# Get the base microservice from: https://github.com/your-org/shap-microservice
# Or copy from existing microservice directory
```

**Option B: Fork Existing Microservice**
```bash
# 1. Fork the base microservice repository on GitHub
# 2. Clone your fork
git clone https://github.com/yourusername/shap-microservice.git
cd shap-microservice

# 3. Rename and configure for your project
```

### 1.3 Upload Your Trained Models

```bash
# 1. Copy the microservice package contents
# From: projects/your_project_name/microservice_package/
# To: your cloned repository

# Copy models
cp -r projects/your_project_name/microservice_package/models/* ./models/

# Copy training data  
cp -r projects/your_project_name/microservice_package/data/* ./data/

# Copy configuration
cp projects/your_project_name/microservice_package/deployment_config.json ./config/

# 2. Update requirements.txt if needed
# Ensure it includes all required packages:
cat > requirements.txt << EOF
Flask==2.3.3
flask-cors==4.0.0
pandas==2.0.3
numpy==1.24.3
scikit-learn==1.3.0
xgboost==1.7.6
shap==0.42.1
gunicorn==21.2.0
EOF

# 3. Commit and push
git add .
git commit -m "Add trained models and deployment configuration"
git push origin main
```

### 1.4 Deploy to Render

1. **Go to Render Dashboard**
   - Visit: https://render.com/dashboard
   - Sign in to your account

2. **Create New Web Service**
   - Click **"New"** → **"Web Service"**
   - Click **"Build and deploy from a Git repository"**

3. **Connect Your Repository**
   - Click **"Connect"** next to your microservice repository
   - Select **"Connect"** to authorize

4. **Configure Service Settings**
   ```
   Name: your-project-microservice
   Environment: Python 3
   Region: Oregon (US West) or closest to your users
   Branch: main
   Root Directory: (leave blank)
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn -w 4 -b 0.0.0.0:$PORT app:app
   ```

5. **Set Environment Variables** (if needed)
   - Click **"Advanced"** 
   - Add environment variables:
     ```
     MODEL_PATH=/app/models
     DATA_PATH=/app/data
     FLASK_ENV=production
     ```

6. **Deploy**
   - Click **"Create Web Service"**
   - Wait for deployment (5-10 minutes)
   - ✅ **Your microservice URL**: `https://your-project-microservice.onrender.com`

### 1.5 Verify Deployment

Test your deployed microservice:

```bash
# 1. Health check
curl https://your-project-microservice.onrender.com/health

# Expected response:
# {"status": "healthy", "timestamp": "2024-01-15T10:30:00Z"}

# 2. Test prediction endpoint
curl -X POST https://your-project-microservice.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [1, 2, 3, 4, 5]}'

# 3. Test SHAP endpoint  
curl -X POST https://your-project-microservice.onrender.com/shap \
  -H "Content-Type: application/json" \
  -d '{"features": [1, 2, 3, 4, 5]}'
```

✅ **If all tests pass, your microservice is deployed successfully!**

## 🔧 Step 2: Update Client Code

Now update your client application to use the new microservice.

### 2.1 Add Environment Variable

**Method A: .env file (Recommended)**
```bash
# Add to your .env file
echo "MICROSERVICE_URL=https://your-project-microservice.onrender.com" >> .env
```

**Method B: System environment**
```bash
# Add to your shell profile
export MICROSERVICE_URL=https://your-project-microservice.onrender.com
```

### 2.2 Update Configuration Files

**Find existing microservice references:**
```bash
# Search for hardcoded URLs
grep -r "microservice" . --include="*.ts" --include="*.js" --include="*.tsx"
grep -r "onrender.com" . --include="*.ts" --include="*.js" --include="*.tsx"
grep -r "shap-microservice" . --include="*.ts" --include="*.js" --include="*.tsx"
```

**Update configuration files:**

**Option A: Create/update config file**
```typescript
// config/microservice.ts
export const MICROSERVICE_CONFIG = {
  baseUrl: process.env.MICROSERVICE_URL || 'https://your-project-microservice.onrender.com',
  timeout: 30000,
  retries: 3
};
```

**Option B: Update existing config**
```typescript
// Find files like utils/constants.ts, config/api.ts, etc.
// Replace old URLs with:
const MICROSERVICE_BASE_URL = process.env.MICROSERVICE_URL || 'https://your-project-microservice.onrender.com';
```

### 2.3 Update API Calls

**Find and update API calls:**
```typescript
// Before:
const response = await fetch('https://old-microservice.onrender.com/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// After:
import { MICROSERVICE_CONFIG } from '../config/microservice';

const response = await fetch(`${MICROSERVICE_CONFIG.baseUrl}/predict`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### 2.4 Test Integration

```bash
# 1. Start your development server
npm run dev

# 2. Test microservice integration
# - Load any analysis page
# - Check browser console for errors
# - Verify data loads correctly
# - Test SHAP visualizations

# 3. Check network tab
# - Verify API calls go to your new microservice URL
# - Confirm successful responses
```

## 📊 Step 3: Final Validation

### 3.1 End-to-End Test

Test the complete flow:

1. **Load Strategic Analysis**
   - Verify data loads correctly
   - Check that scores are calculated
   - Confirm SHAP values display

2. **Load Competitive Analysis**
   - Test brand comparisons
   - Verify competitive scores
   - Check visualization rendering

3. **Load Demographic Analysis**
   - Test demographic insights
   - Verify population data
   - Check demographic scores

### 3.2 Performance Check

Monitor your microservice:

```bash
# 1. Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-project-microservice.onrender.com/predict

# 2. Monitor Render dashboard
# - Check service logs
# - Monitor resource usage
# - Verify no errors
```

### 3.3 Update Documentation

Update your project documentation:

```bash
# Update README or deployment docs with new microservice URL
echo "Microservice URL: https://your-project-microservice.onrender.com" >> README.md
```

## 🚨 Troubleshooting

### Common Issues

**Issue 1: Microservice won't deploy**
```bash
# Check Render build logs
# Common fixes:
# - Verify requirements.txt has correct versions
# - Check that all model files were uploaded
# - Ensure gunicorn command is correct
```

**Issue 2: Client can't connect to microservice**
```bash
# Check CORS settings in microservice
# Verify environment variable is set correctly
# Check browser network tab for blocked requests
```

**Issue 3: SHAP calculations fail**
```bash
# Verify model files are correctly uploaded
# Check microservice logs in Render
# Test with smaller data samples first
```

**Issue 4: Slow response times**
```bash
# Consider upgrading Render plan
# Optimize model loading (cache models in memory)
# Implement request batching if needed
```

### Getting Help

1. **Check Render Logs**: Go to your service dashboard and check logs
2. **Test Endpoints**: Use curl to test individual endpoints
3. **Browser Console**: Check for JavaScript errors in client
4. **Network Tab**: Verify API calls are going to correct URLs

## ✅ Success Checklist

- [ ] Microservice deployed to Render successfully
- [ ] Health endpoint responds correctly
- [ ] Prediction endpoint returns valid results
- [ ] SHAP endpoint calculates feature importance
- [ ] Client code updated with new microservice URL
- [ ] Environment variables configured
- [ ] End-to-end testing completed
- [ ] No console errors in browser
- [ ] All analysis pages load correctly
- [ ] Performance is acceptable

## 🎉 Completion

**Congratulations!** Your microservice is now deployed and integrated.

**Next Steps:**
- Monitor performance and logs
- Set up alerts for service downtime
- Plan for scaling if needed
- Consider setting up CI/CD for future updates

---

**Need Help?** 
- Check the troubleshooting section above
- Review Render documentation: https://render.com/docs
- Check your automation pipeline logs for additional details