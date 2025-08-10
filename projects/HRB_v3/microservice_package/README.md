# Hrb_V3 Microservice Deployment Package

## Quick Deploy to Render

1. **Create New Render Web Service**
   - Go to https://render.com/dashboard
   - Click "New" → "Web Service"
   - Connect your microservice repository
   - Use these settings:
     - Name: `HRB_v3-microservice`
     - Environment: `Python 3`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `python app.py`

2. **Upload This Package**
   - Copy contents of this package to your microservice repository
   - Commit and push to trigger deployment

3. **Get Your Microservice URL**
   - After deployment, copy the Render service URL
   - It will look like: `https://HRB_v3-microservice.onrender.com`

4. **Update Client Configuration**
   - Add the microservice URL to your client application
   - Continue with the automation pipeline

## Package Contents
- `models/` - Trained XGBoost models with SHAP values
- `data/` - Training data and field mappings
- `deployment_config.json` - Deployment configuration
- This README with deployment instructions

## Model Performance
- R² Score: N/A
- RMSE: N/A
- Features: N/A
