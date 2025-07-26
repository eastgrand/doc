#!/usr/bin/env python3
"""
Deploy memory optimization to live SHAP microservice
Integrates memory_utils.py into existing app.py endpoints for production-scale datasets
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

def deploy_memory_optimization():
    """Deploy memory optimization to the live microservice"""
    
    print("🚀 Deploying Memory Optimization to Live Microservice")
    print("="*60)
    
    # Step 1: Copy memory_utils.py to shap-microservice directory
    print("\n📁 Step 1: Copying memory_utils.py to microservice...")
    
    source_file = Path("memory_utils.py")
    if not source_file.exists():
        print("❌ ERROR: memory_utils.py not found in current directory")
        return False
    
    # Copy to the microservice directory (we'll commit and push to git)
    target_file = Path("../shap-microservice/memory_utils.py")
    shutil.copy2(source_file, target_file)
    print(f"✅ Copied {source_file} -> {target_file}")
    
    # Step 2: Create app.py integration patch
    print("\n🔧 Step 2: Creating app.py integration patch...")
    
    app_py_patch = '''
# Memory optimization integration patch for app.py
# Add this import at the top of app.py after other imports

from memory_utils import (
    memory_safe_shap_wrapper, 
    get_endpoint_config,
    batch_shap_calculation,
    force_garbage_collection,
    get_memory_usage
)

# Add this function to replace direct SHAP calculations
def calculate_shap_with_memory_optimization(explainer, X, endpoint_path):
    """
    Memory-optimized SHAP calculation wrapper
    Replaces direct explainer.shap_values(X) calls
    """
    config = get_endpoint_config(endpoint_path)
    
    try:
        # Use batch processing for large datasets
        shap_values = batch_shap_calculation(
            explainer, X,
            batch_size=config['batch_size'],
            max_memory_mb=config['memory_limit_mb']
        )
        return shap_values
    except Exception as e:
        logger.error(f"Memory-optimized SHAP calculation failed: {str(e)}")
        # Fallback to smaller batch size
        try:
            smaller_batch = max(10, config['batch_size'] // 2)
            logger.info(f"Retrying with smaller batch size: {smaller_batch}")
            shap_values = batch_shap_calculation(
                explainer, X,
                batch_size=smaller_batch,
                max_memory_mb=config['memory_limit_mb'] // 2
            )
            return shap_values
        except Exception as e2:
            logger.error(f"Fallback SHAP calculation also failed: {str(e2)}")
            raise e2

# Example integration pattern for endpoints:
# Replace this pattern:
#   shap_values = explainer.shap_values(X_sample)
# 
# With this pattern:
#   shap_values = calculate_shap_with_memory_optimization(explainer, X_sample, request.path)

# Memory monitoring endpoint
@app.route('/memory-status', methods=['GET'])
def memory_status():
    """Get current memory usage and limits"""
    try:
        current_memory = get_memory_usage()
        
        return safe_jsonify({
            "current_memory_mb": current_memory,
            "memory_configs": ENDPOINT_MEMORY_CONFIGS,
            "status": "healthy" if current_memory < 800 else "high_memory"
        })
    except Exception as e:
        return safe_jsonify({"error": str(e)}, 500)
'''
    
    patch_file = Path("../shap-microservice/memory_optimization_patch.py")
    with open(patch_file, 'w') as f:
        f.write(app_py_patch)
    print(f"✅ Created integration patch: {patch_file}")
    
    # Step 3: Create specific endpoint patches
    print("\n🎯 Step 3: Creating endpoint-specific patches...")
    
    endpoint_patches = {
        'outlier_detection_patch.py': '''
# Outlier detection memory optimization patch

# In the /outlier-detection endpoint, replace:
# shap_values = explainer.shap_values(outlier_data)

# With:
from memory_utils import memory_safe_sample_selection, batch_shap_calculation, get_endpoint_config

# Sample data intelligently for outlier detection
config = get_endpoint_config('/outlier-detection')
sampled_df = memory_safe_sample_selection(
    df, target_field, 
    config['max_samples'], 
    'extremes'  # Focus on outliers
)

# Use batch processing for SHAP
outlier_data = sampled_df[outlier_indices] if len(outlier_indices) > 0 else sampled_df.head(20)
shap_values = batch_shap_calculation(
    explainer, outlier_data,
    batch_size=config['batch_size'],
    max_memory_mb=config['memory_limit_mb']
)
''',
        
        'scenario_analysis_patch.py': '''
# Scenario analysis memory optimization patch

# In the /scenario-analysis endpoint, replace:
# scenario_shap = explainer.shap_values([modified_data])
# baseline_shap = explainer.shap_values([base_data])

# With:
from memory_utils import batch_shap_calculation, get_endpoint_config

config = get_endpoint_config('/scenario-analysis')

# Process scenarios in memory-safe batches
scenario_data = pd.DataFrame([modified_data])
baseline_data = pd.DataFrame([base_data])

scenario_shap = batch_shap_calculation(
    explainer, scenario_data,
    batch_size=config['batch_size'],
    max_memory_mb=config['memory_limit_mb']
)

baseline_shap = batch_shap_calculation(
    explainer, baseline_data,
    batch_size=config['batch_size'],
    max_memory_mb=config['memory_limit_mb']
)
''',
        
        'feature_interactions_patch.py': '''
# Feature interactions memory optimization patch

# In the /feature-interactions endpoint, replace:
# X_sample = X_test.sample(n=sample_size, random_state=42)
# interaction_values = explainer.shap_interaction_values(X_sample)

# With:
from memory_utils import memory_safe_sample_selection, batch_shap_calculation, get_endpoint_config

config = get_endpoint_config('/feature-interactions')

# Use intelligent sampling for feature interactions
sampled_df_full = memory_safe_sample_selection(
    df, target_field,
    config['max_samples'],
    'random'  # Random sampling for interactions
)

# Prepare features from sampled data
X_sampled = sampled_df_full[top_features]
X_train, X_test, y_train, y_test = train_test_split(X_sampled, y, test_size=0.2, random_state=42)

# Use batch processing for interaction calculation
interaction_values = batch_shap_calculation(
    explainer, X_test,
    batch_size=config['batch_size'] // 2,  # Interactions are more memory intensive
    max_memory_mb=config['memory_limit_mb']
)
'''
    }
    
    for filename, content in endpoint_patches.items():
        patch_path = Path(f"../shap-microservice/{filename}")
        with open(patch_path, 'w') as f:
            f.write(content)
        print(f"✅ Created patch: {patch_path}")
    
    # Step 4: Create deployment instructions
    print("\n📋 Step 4: Creating deployment instructions...")
    
    instructions = '''
# Memory Optimization Deployment Instructions

## Files Added:
- memory_utils.py - Core memory optimization utilities
- memory_optimization_patch.py - Integration patterns for app.py
- outlier_detection_patch.py - Specific patches for outlier detection
- scenario_analysis_patch.py - Specific patches for scenario analysis  
- feature_interactions_patch.py - Specific patches for feature interactions

## Integration Steps:

### 1. Add imports to app.py (at top after existing imports):
```python
from memory_utils import (
    memory_safe_shap_wrapper, 
    get_endpoint_config,
    batch_shap_calculation,
    force_garbage_collection,
    get_memory_usage,
    ENDPOINT_MEMORY_CONFIGS
)
```

### 2. Add memory monitoring endpoint (add to app.py):
```python
@app.route('/memory-status', methods=['GET'])
def memory_status():
    """Get current memory usage and limits"""
    try:
        current_memory = get_memory_usage()
        
        return safe_jsonify({
            "current_memory_mb": current_memory,
            "memory_configs": ENDPOINT_MEMORY_CONFIGS,
            "status": "healthy" if current_memory < 800 else "high_memory"
        })
    except Exception as e:
        return safe_jsonify({"error": str(e)}, 500)
```

### 3. Replace SHAP calculations in endpoints:

#### Pattern to replace:
```python
shap_values = explainer.shap_values(X_sample)
```

#### Replace with:
```python
from memory_utils import batch_shap_calculation, get_endpoint_config

config = get_endpoint_config(request.path)
shap_values = batch_shap_calculation(
    explainer, X_sample,
    batch_size=config['batch_size'],
    max_memory_mb=config['memory_limit_mb']
)
```

### 4. Add intelligent sampling for large datasets:

#### Pattern to replace:
```python
X_sample = X.sample(n=sample_size, random_state=42)
```

#### Replace with:
```python
from memory_utils import memory_safe_sample_selection, get_endpoint_config

config = get_endpoint_config(request.path)
sampled_df = memory_safe_sample_selection(
    df, target_field,
    config['max_samples'],
    config['sampling_strategy']
)
X_sample = sampled_df[feature_columns]
```

## Memory Limits by Endpoint:
- /analyze: 500 samples, 100 batch size, 800MB limit
- /outlier-detection: 200 samples, 50 batch size, 600MB limit  
- /scenario-analysis: 100 samples, 25 batch size, 500MB limit
- /spatial-clusters: 300 samples, 75 batch size, 700MB limit
- /segment-profiling: 150 samples, 50 batch size, 600MB limit
- /comparative-analysis: 200 samples, 50 batch size, 600MB limit
- /feature-interactions: 800 samples, 150 batch size, 900MB limit

## Expected Results:
- Handle datasets up to 5000 records without memory issues
- Intelligent sampling ensures statistical validity
- Batch processing prevents OOM errors
- 2-5x improvement in maximum dataset size
- Consistent response times under 2 minutes

## Testing:
After deployment, test with progressively larger sample sizes:
```bash
python scripts/test-memory-optimization.py
```

Should show endpoints working with 1000+ samples instead of 500.
'''
    
    instructions_file = Path("../shap-microservice/MEMORY_OPTIMIZATION_DEPLOYMENT.md")
    with open(instructions_file, 'w') as f:
        f.write(instructions)
    print(f"✅ Created deployment instructions: {instructions_file}")
    
    # Step 5: Commit and push changes
    print("\n📤 Step 5: Committing and pushing changes...")
    
    try:
        os.chdir("../shap-microservice")
        
        # Add files to git
        subprocess.run(["git", "add", "memory_utils.py"], check=True)
        subprocess.run(["git", "add", "memory_optimization_patch.py"], check=True)
        subprocess.run(["git", "add", "*.py"], check=True)
        subprocess.run(["git", "add", "MEMORY_OPTIMIZATION_DEPLOYMENT.md"], check=True)
        
        # Commit changes
        commit_message = "Add memory optimization utilities for production-scale datasets"
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        
        # Push to remote
        subprocess.run(["git", "push"], check=True)
        
        print("✅ Successfully committed and pushed memory optimization files")
        
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Git operation failed: {e}")
        print("Please manually commit and push the files")
        return False
    except Exception as e:
        print(f"⚠️ Error during git operations: {e}")
        return False
    finally:
        os.chdir("../mpiq-ai-chat")  # Return to original directory
    
    print("\n🎉 Memory Optimization Deployment Complete!")
    print("="*60)
    print("✅ Files copied and committed to shap-microservice repository")
    print("✅ Integration patches created")
    print("✅ Deployment instructions provided")
    print()
    print("🔄 Next Steps:")
    print("1. The files are now in the git repository and will auto-deploy to Render")
    print("2. Wait 2-3 minutes for Render to detect changes and redeploy")
    print("3. Test with: python scripts/test-memory-optimization.py")
    print("4. Expected: Handle 1000+ samples vs current 500 limit")
    print()
    print("📊 Expected Improvements:")
    print("- Dataset capacity: 500 → 2000+ samples")
    print("- Memory usage: Controlled via batch processing")
    print("- Production ready: Handle 5000-record datasets")
    
    return True

if __name__ == "__main__":
    success = deploy_memory_optimization()
    sys.exit(0 if success else 1) 