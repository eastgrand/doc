#!/usr/bin/env python3
"""
ArcGIS Service Inspector - Automated service discovery and analysis
Part of the ArcGIS to Microservice Automation Pipeline
"""

import requests
import json
from typing import Dict, List, Any
import pandas as pd
from datetime import datetime
import logging
import time

class ArcGISServiceInspector:
    """
    Automatically discovers and analyzes ArcGIS Feature Service structure
    """
    
    def __init__(self, service_url: str, api_key: str = None):
        """
        Initialize with service URL like:
        https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer
        
        Args:
            service_url: The ArcGIS Feature Service URL
            api_key: Optional API key for authentication
        """
        self.base_url = service_url.rstrip('/')
        self.api_key = api_key
        self.metadata = {}
        self.layers = []
        self.field_mappings = {}
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
    def discover_layers(self) -> List[Dict]:
        """Discover all layers in the feature service"""
        
        self.logger.info(f"🔍 Discovering layers in service: {self.base_url}")
        
        try:
            # Get service metadata
            params = {'f': 'json'}
            if self.api_key:
                params['token'] = self.api_key
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            service_info = response.json()
            
            self.metadata = {
                'service_name': service_info.get('name'),
                'description': service_info.get('description'),
                'layer_count': len(service_info.get('layers', [])),
                'discovered_at': datetime.now().isoformat(),
                'service_url': self.base_url
            }
            
            self.logger.info(f"📊 Service: {self.metadata['service_name']}")
            self.logger.info(f"📊 Found {self.metadata['layer_count']} layers to analyze")
            
            # Discover each layer
            for layer_info in service_info.get('layers', []):
                layer_id = layer_info['id']
                self.logger.info(f"   Analyzing layer {layer_id}: {layer_info.get('name', 'Unnamed')}")
                
                try:
                    layer_details = self.inspect_layer(layer_id)
                    self.layers.append(layer_details)
                    time.sleep(0.5)  # Be respectful to the service
                except Exception as e:
                    self.logger.warning(f"   ⚠️ Failed to analyze layer {layer_id}: {str(e)}")
                    continue
            
            self.logger.info(f"✅ Successfully analyzed {len(self.layers)} layers")
            return self.layers
            
        except requests.RequestException as e:
            self.logger.error(f"❌ Failed to connect to service: {str(e)}")
            raise
        except Exception as e:
            self.logger.error(f"❌ Error discovering layers: {str(e)}")
            raise
    
    def inspect_layer(self, layer_id: int) -> Dict:
        """Inspect individual layer structure and data"""
        
        # Get layer metadata
        layer_url = f"{self.base_url}/{layer_id}"
        
        try:
            params = {'f': 'json'}
            if self.api_key:
                params['token'] = self.api_key
            response = requests.get(layer_url, params=params, timeout=15)
            response.raise_for_status()
            layer_info = response.json()
            
            # Analyze fields
            fields = []
            for field in layer_info.get('fields', []):
                fields.append({
                    'name': field['name'],
                    'type': field['type'],
                    'alias': field.get('alias', field['name']),
                    'nullable': field.get('nullable', True),
                    'domain': field.get('domain'),
                    'sample_values': [],  # Will populate with sample data
                    'has_data': False
                })
            
            # Get sample records to understand data
            try:
                sample_response = requests.get(f"{layer_url}/query", params={
                    'where': '1=1',
                    'outFields': '*',
                    'resultRecordCount': 5,
                    'f': 'json'
                }, timeout=15)
                
                sample_response.raise_for_status()
                sample_data = sample_response.json()
                
                # Analyze sample values
                if sample_data.get('features'):
                    for field in fields:
                        field_name = field['name']
                        values = [f['attributes'].get(field_name) for f in sample_data['features']]
                        field['sample_values'] = [v for v in values if v is not None][:3]
                        field['has_data'] = any(v is not None for v in values)
                        
            except Exception as e:
                self.logger.warning(f"      Could not get sample data: {str(e)}")
            
            # Get record count
            try:
                count_response = requests.get(f"{layer_url}/query", params={
                    'where': '1=1',
                    'returnCountOnly': 'true',
                    'f': 'json'
                }, timeout=15)
                
                count_response.raise_for_status()
                record_count = count_response.json().get('count', 0)
            except:
                record_count = 0
                
            layer_result = {
                'layer_id': layer_id,
                'name': layer_info.get('name'),
                'description': layer_info.get('description'),
                'geometry_type': layer_info.get('geometryType'),
                'record_count': record_count,
                'fields': fields,
                'url': layer_url,
                'priority': 0  # Will be calculated later
            }
            
            # Calculate priority
            layer_result['priority'] = self.calculate_layer_priority(layer_result)
            
            return layer_result
            
        except requests.RequestException as e:
            self.logger.error(f"Failed to inspect layer {layer_id}: {str(e)}")
            raise
    
    def suggest_field_mappings(self) -> Dict[str, str]:
        """Intelligently suggest field mappings based on field names and data"""
        
        self.logger.info("🤖 Generating intelligent field mappings...")
        
        # Common patterns for field detection
        patterns = {
            'nike': ['nike', 'nke', 'swoosh', 'jordan'],
            'adidas': ['adidas', 'adi', 'three_stripes'],
            'puma': ['puma'],
            'new_balance': ['new_balance', 'nb', 'newbalance'],
            'population': ['pop', 'population', 'total_pop', 'totpop'],
            'income': ['income', 'median_inc', 'hh_income', 'household_income'],
            'age': ['age', 'age_', 'median_age'],
            'education': ['edu', 'education', 'bachelor', 'degree', 'college'],
            'geographic_id': ['geoid', 'id', 'zip', 'fsa', 'postal', 'area_id', 'objectid']
        }
        
        mappings = {}
        confidence_scores = {}
        
        for layer in self.layers:
            for field in layer['fields']:
                if not field['has_data']:
                    continue
                    
                field_name_lower = field['name'].lower()
                field_alias_lower = field['alias'].lower()
                
                best_match = None
                best_score = 0
                
                # Try to categorize field
                for category, keywords in patterns.items():
                    score = 0
                    for keyword in keywords:
                        if keyword in field_name_lower:
                            score = 1.0  # Exact match in name
                            break
                        elif keyword in field_alias_lower:
                            score = 0.8  # Match in alias
                        elif keyword in field_name_lower.replace('_', '').replace(' ', ''):
                            score = 0.6  # Partial match
                    
                    if score > best_score:
                        best_score = score
                        best_match = category
                
                # Only accept mappings with decent confidence
                if best_match and best_score > 0.5:
                    # Create standardized field name
                    if best_match == 'nike':
                        standard_name = 'Nike_Sales_Pct'
                    elif best_match == 'adidas':
                        standard_name = 'Adidas_Sales_Pct'
                    elif best_match == 'puma':
                        standard_name = 'Puma_Sales_Pct'
                    elif best_match == 'new_balance':
                        standard_name = 'New_Balance_Sales_Pct'
                    elif best_match == 'population':
                        standard_name = 'Total_Population'
                    elif best_match == 'income':
                        standard_name = 'Median_Income'
                    elif best_match == 'geographic_id':
                        standard_name = 'GEO_ID'
                    else:
                        # Keep original but standardize format
                        standard_name = field['name'].replace(' ', '_').replace('-', '_')
                    
                    mappings[field['name']] = standard_name
                    confidence_scores[field['name']] = best_score
        
        self.field_mappings = mappings
        
        # Log mappings with confidence
        self.logger.info("📋 Field mapping suggestions:")
        for field_name in sorted(mappings.keys()):
            standard_name = mappings[field_name]
            confidence = confidence_scores[field_name]
            self.logger.info(f"   {field_name} → {standard_name} ({confidence:.1%} confidence)")
        
        return mappings
    
    def generate_extraction_config(self) -> Dict:
        """Generate configuration for automated extraction"""
        
        self.logger.info("⚙️ Generating extraction configuration...")
        
        # Generate field mappings first
        self.suggest_field_mappings()
        
        # Identify primary data layers (skip metadata/boundary-only layers)
        data_layers = []
        
        for layer in self.layers:
            # Check if layer has meaningful data fields
            has_numeric_data = any(
                field['type'] in ['esriFieldTypeDouble', 'esriFieldTypeInteger'] 
                and field['has_data']
                for field in layer['fields']
            )
            
            if has_numeric_data and layer['record_count'] > 0:
                data_layers.append({
                    'layer_id': layer['layer_id'],
                    'name': layer['name'],
                    'record_count': layer['record_count'],
                    'priority': layer['priority'],
                    'fields_to_extract': [f['name'] for f in layer['fields'] if f['has_data']]
                })
        
        # Sort by priority
        data_layers.sort(key=lambda x: x['priority'], reverse=True)
        
        config = {
            'service_url': self.base_url,
            'extraction_timestamp': datetime.now().isoformat(),
            'total_layers': len(self.layers),
            'data_layers': data_layers,
            'field_mappings': self.field_mappings,
            'metadata': self.metadata
        }
        
        self.logger.info(f"✅ Configuration generated:")
        self.logger.info(f"   📊 {len(data_layers)} data layers identified")
        self.logger.info(f"   🏷️ {len(self.field_mappings)} field mappings suggested")
        self.logger.info(f"   📈 Top priority layers:")
        
        for layer in data_layers[:5]:
            self.logger.info(f"      {layer['name']} (Priority: {layer['priority']}, Records: {layer['record_count']})")
        
        return config
    
    def calculate_layer_priority(self, layer: Dict) -> int:
        """Calculate extraction priority based on layer characteristics"""
        priority = 0
        layer_name = layer['name'].lower()
        
        # Higher priority for layers with brand data
        brand_keywords = ['nike', 'adidas', 'puma', 'reebok', 'jordan', 'new_balance']
        if any(keyword in layer_name for keyword in brand_keywords):
            priority += 100
        
        # Higher priority for demographic data
        demo_keywords = ['population', 'income', 'age', 'demographic', 'household']
        if any(keyword in layer_name for keyword in demo_keywords):
            priority += 50
        
        # Higher priority for layers with more records
        if layer['record_count'] > 1000:
            priority += 25
        elif layer['record_count'] > 500:
            priority += 15
        elif layer['record_count'] > 100:
            priority += 10
        
        # Higher priority for layers with geographic identifiers
        has_geo = any(field['name'].lower() in ['geoid', 'zip', 'fsa', 'id', 'objectid'] 
                     for field in layer['fields'])
        if has_geo:
            priority += 30
        
        # Lower priority for obvious metadata layers
        meta_keywords = ['boundary', 'border', 'outline', 'reference']
        if any(keyword in layer_name for keyword in meta_keywords):
            priority -= 20
        
        return priority


if __name__ == "__main__":
    # Test with sample service
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python arcgis_service_inspector.py <service_url>")
        sys.exit(1)
    
    service_url = sys.argv[1]
    
    inspector = ArcGISServiceInspector(service_url)
    layers = inspector.discover_layers()
    config = inspector.generate_extraction_config()
    
    # Save configuration
    with open('extraction_config.json', 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"\n✅ Analysis complete! Configuration saved to extraction_config.json")
    print(f"📊 Discovered {len(layers)} layers")
    print(f"🎯 Identified {len(config['data_layers'])} data layers for extraction")
    print(f"🏷️ Generated {len(config['field_mappings'])} field mappings")