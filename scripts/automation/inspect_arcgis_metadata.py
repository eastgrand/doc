#!/usr/bin/env python3
"""
ArcGIS Metadata Inspector
Show all available metadata from ArcGIS Feature Services for grouping decisions
"""

import json
import requests
from typing import Dict, Any
import sys


def inspect_service_metadata(service_url: str) -> Dict[str, Any]:
    """Inspect what metadata is available from an ArcGIS service"""
    
    print(f"🔍 INSPECTING ARCGIS SERVICE METADATA")
    print(f"📍 Service URL: {service_url}")
    print("=" * 80)
    
    try:
        # Get service-level metadata
        print("\n🏢 SERVICE-LEVEL METADATA:")
        print("-" * 40)
        
        response = requests.get(f"{service_url}?f=json", timeout=30)
        response.raise_for_status()
        service_info = response.json()
        
        # Show key service metadata
        service_metadata = {
            'name': service_info.get('name', 'Unknown'),
            'description': service_info.get('description', ''),
            'serviceDescription': service_info.get('serviceDescription', ''),
            'tags': service_info.get('tags', ''),
            'categories': service_info.get('categories', []),
            'typeKeywords': service_info.get('typeKeywords', []),
            'copyrightText': service_info.get('copyrightText', ''),
            'layers_count': len(service_info.get('layers', []))
        }
        
        for key, value in service_metadata.items():
            print(f"  • {key}: {value}")
        
        # Inspect each layer
        layers_metadata = []
        for layer_info in service_info.get('layers', []):
            layer_id = layer_info['id']
            layer_name = layer_info['name']
            
            print(f"\n📊 LAYER {layer_id}: {layer_name}")
            print("-" * 40)
            
            # Get detailed layer information
            layer_url = f"{service_url}/{layer_id}"
            layer_response = requests.get(f"{layer_url}?f=json", timeout=30)
            
            if layer_response.status_code == 200:
                layer_details = layer_response.json()
                
                # Extract all available metadata
                metadata = {
                    'id': layer_id,
                    'name': layer_name,
                    'description': layer_details.get('description', ''),
                    'type': layer_details.get('type', ''),
                    'geometryType': layer_details.get('geometryType', ''),
                    'displayField': layer_details.get('displayField', ''),
                    'tags': layer_details.get('tags', ''),
                    'categories': layer_details.get('categories', ''),
                    'typeKeywords': layer_details.get('typeKeywords', []),
                    'copyrightText': layer_details.get('copyrightText', ''),
                    'extent': layer_details.get('extent', {}),
                    'spatialReference': layer_details.get('spatialReference', {}),
                    'drawingInfo': layer_details.get('drawingInfo', {}),
                    'fields_count': len(layer_details.get('fields', [])),
                    'fields_sample': [f.get('name', '') for f in layer_details.get('fields', [])[:10]],  # First 10 field names
                    'hasAttachments': layer_details.get('hasAttachments', False),
                    'capabilities': layer_details.get('capabilities', ''),
                    'maxRecordCount': layer_details.get('maxRecordCount', 0),
                    'standardMaxRecordCount': layer_details.get('standardMaxRecordCount', 0),
                }
                
                # Show what's available
                print("📋 AVAILABLE METADATA:")
                for key, value in metadata.items():
                    if value:  # Only show non-empty values
                        print(f"  • {key}: {value}")
                
                # Show field details
                fields = layer_details.get('fields', [])
                if fields:
                    print(f"\n🔢 FIELD DETAILS (Total: {len(fields)}):")
                    print("  Field Name | Type | Alias")
                    print("  " + "-" * 50)
                    for field in fields[:15]:  # Show first 15 fields
                        name = field.get('name', '')
                        field_type = field.get('type', '')
                        alias = field.get('alias', '')
                        print(f"  {name:<15} | {field_type:<12} | {alias}")
                    
                    if len(fields) > 15:
                        print(f"  ... and {len(fields) - 15} more fields")
                
                # Show renderer information if available
                drawing_info = layer_details.get('drawingInfo', {})
                renderer = drawing_info.get('renderer', {})
                if renderer:
                    print(f"\n🎨 RENDERER INFO:")
                    print(f"  • Type: {renderer.get('type', '')}")
                    print(f"  • Field: {renderer.get('field', '')}")
                    print(f"  • Label: {renderer.get('label', '')}")
                
                layers_metadata.append(metadata)
            else:
                print(f"  ❌ Failed to get details for layer {layer_id}")
        
        print(f"\n\n📈 SUMMARY FOR GROUPING DECISIONS:")
        print("=" * 50)
        print("Available data points for each layer:")
        print("• Layer name (human readable)")
        print("• Description (if provided)")  
        print("• Field names and aliases")
        print("• Field types (string, double, integer, etc.)")
        print("• Tags (if provided)")
        print("• Categories (if provided)")
        print("• Type keywords (if provided)")
        print("• Display field")
        print("• Geometry type")
        print("• Copyright text")
        
        print(f"\n🎯 GROUPING STRATEGY OPTIONS:")
        print("1. **Field Name Analysis**: Group by common field prefixes (MP, X, etc.)")
        print("2. **Semantic Analysis**: Match layer names/descriptions to concept terms")
        print("3. **Field Pattern Analysis**: Group by field suffixes (_P for percentages, _CY for amounts)")
        print("4. **Hybrid Approach**: Combine multiple strategies with confidence scoring")
        
        return {
            'service': service_metadata,
            'layers': layers_metadata
        }
        
    except Exception as e:
        print(f"❌ Error inspecting service: {e}")
        return {}


def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python inspect_arcgis_metadata.py <service_url>")
        print("Example: python inspect_arcgis_metadata.py 'https://services8.arcgis.com/.../FeatureServer'")
        return
    
    service_url = sys.argv[1].strip("'\"")  # Remove quotes if present
    metadata = inspect_service_metadata(service_url)
    
    # Optionally save to file
    if metadata:
        output_file = "arcgis_metadata_inspection.json"
        with open(output_file, 'w') as f:
            json.dump(metadata, f, indent=2, default=str)
        print(f"\n💾 Detailed metadata saved to: {output_file}")


if __name__ == "__main__":
    main()