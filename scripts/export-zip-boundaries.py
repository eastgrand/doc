#!/usr/bin/env python3
"""
Export ZIP Code Boundaries Script

Exports ZIP Code polygon boundaries from ArcGIS service to local cache file
to eliminate runtime ArcGIS service dependencies and timeouts.

Usage:
    python scripts/export-zip-boundaries.py
"""

import json
import requests
import time
from pathlib import Path

# ZIP Code boundaries service URL (from AITab.tsx)
ZIP_BOUNDARIES_SERVICE = "https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/39"

def export_zip_boundaries():
    """Export ZIP Code polygon boundaries to local cache file"""
    
    print("🌍 Starting ZIP Code boundaries export...")
    print(f"📡 Service URL: {ZIP_BOUNDARIES_SERVICE}")
    
    try:
        # Build query URL for all features with geometry
        query_url = f"{ZIP_BOUNDARIES_SERVICE}/query"
        
        params = {
            'where': '1=1',  # Get all features
            'outFields': '*',  # Get all attributes
            'returnGeometry': 'true',  # Include polygon geometry
            'geometryType': 'esriGeometryPolygon',
            'outSR': '4326',  # WGS84 spatial reference
            'f': 'json',  # JSON format
            'resultRecordCount': 2000,  # Maximum per request
            'resultOffset': 0
        }
        
        all_features = []
        offset = 0
        batch_size = 2000
        
        print("📦 Fetching ZIP Code boundaries in batches...")
        
        while True:
            params['resultOffset'] = offset
            
            print(f"   Batch {offset // batch_size + 1}: Records {offset} - {offset + batch_size}")
            
            response = requests.get(query_url, params=params, timeout=60)
            response.raise_for_status()
            
            data = response.json()
            
            if 'features' not in data:
                print(f"❌ No features in response: {data}")
                break
                
            features = data['features']
            if not features:
                print("✅ No more features - export complete")
                break
                
            all_features.extend(features)
            print(f"   Added {len(features)} features (Total: {len(all_features)})")
            
            # Check if we got fewer features than requested (last batch)
            if len(features) < batch_size:
                print("✅ Last batch received - export complete")
                break
                
            offset += batch_size
            
            # Rate limiting
            time.sleep(0.5)
        
        if not all_features:
            raise Exception("No ZIP Code boundaries found")
            
        print(f"🎯 Successfully fetched {len(all_features)} ZIP Code boundaries")
        
        # Create GeoJSON structure
        geojson_data = {
            "type": "FeatureCollection",
            "features": [],
            "metadata": {
                "source": ZIP_BOUNDARIES_SERVICE,
                "export_date": time.strftime("%Y-%m-%d %H:%M:%S"),
                "total_features": len(all_features),
                "spatial_reference": "EPSG:4326",
                "geometry_type": "Polygon"
            }
        }
        
        # Convert ArcGIS features to GeoJSON format
        print("🔄 Converting to GeoJSON format...")
        
        for feature in all_features:
            try:
                # Extract geometry
                geometry = feature.get('geometry')
                if not geometry or not geometry.get('rings'):
                    continue
                    
                # Convert ArcGIS rings to GeoJSON coordinates
                coordinates = []
                for ring in geometry['rings']:
                    if len(ring) >= 4:  # Valid polygon ring
                        coordinates.append(ring)
                
                if not coordinates:
                    continue
                
                # Extract attributes
                attributes = feature.get('attributes', {})
                
                # Create GeoJSON feature
                geojson_feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": coordinates
                    },
                    "properties": attributes
                }
                
                geojson_data["features"].append(geojson_feature)
                
            except Exception as e:
                print(f"⚠️  Error processing feature: {e}")
                continue
        
        print(f"✅ Converted {len(geojson_data['features'])} valid ZIP Code polygons")
        
        # Save to cache file
        output_path = Path("public/data/boundaries/zip_boundaries.json")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        print(f"💾 Saving to: {output_path}")
        
        with open(output_path, 'w') as f:
            json.dump(geojson_data, f, separators=(',', ':'))  # Compact format
        
        # Calculate file size
        file_size = output_path.stat().st_size
        size_mb = file_size / (1024 * 1024)
        
        print(f"🎉 ZIP Code boundaries export complete!")
        print(f"📄 File: {output_path}")
        print(f"📊 Size: {size_mb:.1f} MB")
        print(f"🗺️  Features: {len(geojson_data['features'])} ZIP Code polygons")
        
        # Create summary
        summary = {
            "export_date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "source_service": ZIP_BOUNDARIES_SERVICE,
            "output_file": str(output_path),
            "file_size_mb": round(size_mb, 1),
            "total_features": len(geojson_data['features']),
            "geometry_type": "Polygon",
            "spatial_reference": "EPSG:4326"
        }
        
        summary_path = Path("public/data/boundaries/export_summary.json")
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"📋 Summary saved to: {summary_path}")
        
        return True
        
    except requests.exceptions.Timeout:
        print("❌ Request timeout - ArcGIS service is slow")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False
    except Exception as e:
        print(f"❌ Export failed: {e}")
        return False

if __name__ == "__main__":
    success = export_zip_boundaries()
    exit(0 if success else 1) 