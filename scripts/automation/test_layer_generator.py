#!/usr/bin/env python3
"""
Test script for Layer Config Generator
Demonstrates the functionality using a sample ArcGIS service
"""

import sys
import os
from pathlib import Path

# Add the automation scripts to path
sys.path.append(str(Path(__file__).parent))

from layer_config_generator import LayerConfigGenerator

def test_layer_config_generation():
    """Test the layer config generator with a sample service"""
    
    print("🧪 Testing Layer Config Generator")
    print("=" * 50)
    
    # Sample service URL (Nike project service)
    service_url = "https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer"
    
    # Initialize generator
    generator = LayerConfigGenerator()
    
    # Test service analysis
    print("📊 Step 1: Analyzing ArcGIS service...")
    layers = generator.analyze_arcgis_service(service_url)
    
    if not layers:
        print("❌ No layers found")
        return False
    
    print(f"✅ Found {len(layers)} layers")
    
    # Display sample layer info
    print("\n📋 Sample layer information:")
    for i, layer in enumerate(layers[:3]):  # Show first 3 layers
        print(f"  {i+1}. {layer.name}")
        print(f"     ID: {layer.id}")
        print(f"     Fields: {len(layer.fields)}")
        print(f"     Records: {layer.record_count:,}")
        print(f"     Group: {layer.group}")
        print(f"     Renderer: {layer.renderer_field}")
        print()
    
    # Test TypeScript generation
    print("🔧 Step 2: Generating TypeScript configuration...")
    ts_config = generator.generate_typescript_config(layers)
    
    print(f"✅ Generated {len(ts_config)} characters of TypeScript code")
    
    # Show sample of generated code
    print("\n📝 Sample generated TypeScript (first 500 chars):")
    print("-" * 50)
    print(ts_config[:500] + "...")
    print("-" * 50)
    
    # Test saving configuration
    print("\n💾 Step 3: Saving configuration...")
    success = generator.save_layer_configuration(layers, "layers_test_generated.ts")
    
    if success:
        print("✅ Configuration saved successfully")
        
        # Check if files were created
        config_file = Path("config/layers_test_generated.ts")
        report_file = Path("config/layer_generation_report.md")
        
        if config_file.exists():
            print(f"📄 Config file: {config_file} ({config_file.stat().st_size:,} bytes)")
        if report_file.exists():
            print(f"📋 Report file: {report_file} ({report_file.stat().st_size:,} bytes)")
    else:
        print("❌ Failed to save configuration")
        return False
    
    # Test concepts generation
    print("\n🏷️ Step 4: Testing concepts mapping...")
    concepts_ts = generator._generate_concepts_typescript()
    print(f"✅ Generated concepts mapping ({len(concepts_ts)} characters)")
    
    print(f"\n📊 Concept categories: {list(generator.concepts_mapping.keys())}")
    
    # Summary
    print("\n" + "=" * 50)
    print("🎉 Layer Config Generator Test Complete!")
    print(f"✅ Analyzed {len(layers)} layers")
    print(f"✅ Generated complete TypeScript configuration")
    print(f"✅ Created automation-ready layer configs")
    print(f"✅ Categorized layers into {len(set(l.group for l in layers))} groups")
    
    return True

if __name__ == "__main__":
    success = test_layer_config_generation()
    if success:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Tests failed!")
    
    sys.exit(0 if success else 1)