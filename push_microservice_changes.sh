#!/bin/bash

echo "🚀 Pushing HRB microservice changes to GitHub..."

# Navigate to shap-microservice directory
cd /Users/voldeck/code/shap-microservice

# Check current status
echo "📋 Current git status:"
git status --porcelain

# Add all changes
echo "📦 Adding all changes..."
git add .

# Create commit message
echo "💬 Creating commit..."
git commit -m "Update microservice with HRB models and data

- Added HRB XGBoost model for tax services analysis
- Updated with 44 HRB features from Florida dataset
- Included training data and preprocessing components
- Added scaler and label encoders for HRB model
- Ready for Render deployment with HRB configuration

🎯 Project: H&R Block financial services analysis
📊 Dataset: 984 records across 16 layers
🤖 Model: XGBoost with R² 0.959"

# Push to remote
echo "🚀 Pushing to remote repository..."
git push origin main

echo "✅ Successfully pushed HRB microservice changes!"
echo ""
echo "🚀 Next steps:"
echo "   1. Go to https://render.com/dashboard"
echo "   2. Create new Web Service"
echo "   3. Connect this GitHub repository"
echo "   4. Use deployment settings from /config/deployment_config.json"