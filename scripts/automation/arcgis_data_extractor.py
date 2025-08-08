#!/usr/bin/env python3
"""
ArcGIS Data Extractor - Automated bulk data extraction
Part of the ArcGIS to Microservice Automation Pipeline
"""

import requests
import json
import pandas as pd
from typing import Dict, List, Any, Optional
import asyncio
import aiohttp
from datetime import datetime
import logging
import time
import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import math

class ArcGISDataExtractor:
    """
    Extracts data from ArcGIS Feature Services with parallel processing
    and automatic retry logic for production-scale data extraction
    """
    
    def __init__(self, service_url: str, output_dir: str = "extracted_data"):
        """
        Initialize extractor with service URL and output directory
        
        Args:
            service_url: Base ArcGIS Feature Service URL
            output_dir: Directory to save extracted data
        """
        self.base_url = service_url.rstrip('/')
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True, parents=True)
        
        # Configuration
        self.batch_size = 1000  # Records per request
        self.max_concurrent = 5  # Parallel requests
        self.retry_attempts = 3
        self.retry_delay = 2  # seconds
        
        # Setup logging
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
        
        # Statistics tracking
        self.stats = {
            'layers_processed': 0,
            'total_records': 0,
            'total_fields': 0,
            'extraction_start': None,
            'extraction_end': None,
            'errors': []
        }
        
    async def extract_all_data(self, layer_priorities: Optional[List[int]] = None) -> Dict[str, Any]:
        """
        Extract all data from all layers in the service
        
        Args:
            layer_priorities: Optional list of layer IDs to prioritize
            
        Returns:
            Dictionary with extraction results and metadata
        """
        self.stats['extraction_start'] = datetime.now()
        self.logger.info(f"🚀 Starting bulk data extraction from: {self.base_url}")
        
        try:
            # First discover all layers
            from arcgis_service_inspector import ArcGISServiceInspector
            inspector = ArcGISServiceInspector(self.base_url)
            layers = inspector.discover_layers()
            
            if layer_priorities:
                # Filter and sort by priorities
                priority_layers = [l for l in layers if l['layer_id'] in layer_priorities]
                other_layers = [l for l in layers if l['layer_id'] not in layer_priorities]
                layers = priority_layers + other_layers
                
            self.logger.info(f"📊 Found {len(layers)} layers to extract")
            
            # Extract data from each layer in parallel batches
            extraction_results = {}
            
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=300),  # 5 minute timeout
                connector=aiohttp.TCPConnector(limit=self.max_concurrent)
            ) as session:
                
                # Process layers in batches to avoid overwhelming the service
                batch_size = min(self.max_concurrent, len(layers))
                
                for i in range(0, len(layers), batch_size):
                    batch = layers[i:i + batch_size]
                    self.logger.info(f"🔄 Processing batch {i//batch_size + 1} ({len(batch)} layers)")
                    
                    # Extract data from batch in parallel
                    tasks = [
                        self.extract_layer_data(session, layer)
                        for layer in batch
                    ]
                    
                    batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                    
                    # Process results
                    for layer, result in zip(batch, batch_results):
                        layer_id = layer['layer_id']
                        
                        if isinstance(result, Exception):
                            self.logger.error(f"❌ Failed to extract layer {layer_id}: {str(result)}")
                            self.stats['errors'].append({
                                'layer_id': layer_id,
                                'error': str(result),
                                'timestamp': datetime.now().isoformat()
                            })
                        else:
                            extraction_results[layer_id] = result
                            self.stats['layers_processed'] += 1
                            self.stats['total_records'] += result.get('record_count', 0)
                            self.stats['total_fields'] += result.get('field_count', 0)
                            
                            self.logger.info(f"✅ Layer {layer_id}: {result.get('record_count', 0)} records")
                    
                    # Be respectful to the service
                    if i + batch_size < len(layers):
                        await asyncio.sleep(1)
            
            # Save extraction results
            await self.save_extraction_results(extraction_results)
            
            self.stats['extraction_end'] = datetime.now()
            if self.stats['extraction_start']:
                duration = (self.stats['extraction_end'] - self.stats['extraction_start']).total_seconds()
            else:
                duration = 0
            
            summary = {
                'success': True,
                'layers_extracted': len(extraction_results),
                'total_layers': len(layers),
                'total_records': self.stats['total_records'],
                'duration_seconds': duration,
                'records_per_second': self.stats['total_records'] / duration if duration > 0 else 0,
                'output_directory': str(self.output_dir),
                'extraction_timestamp': self.stats['extraction_start'].isoformat() if self.stats['extraction_start'] else datetime.now().isoformat(),
                'errors': self.stats['errors']
            }
            
            self.logger.info(f"🎉 Extraction completed:")
            self.logger.info(f"   📁 {len(extraction_results)}/{len(layers)} layers extracted")
            self.logger.info(f"   📊 {self.stats['total_records']:,} total records")
            self.logger.info(f"   ⏱️ {duration:.1f} seconds ({summary['records_per_second']:.1f} records/sec)")
            self.logger.info(f"   💾 Data saved to: {self.output_dir}")
            
            return summary
            
        except Exception as e:
            self.logger.error(f"💥 Critical extraction failure: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'layers_extracted': self.stats['layers_processed'],
                'total_records': self.stats['total_records']
            }
    
    async def extract_layer_data(self, session: aiohttp.ClientSession, layer: Dict) -> Dict[str, Any]:
        """
        Extract all data from a single layer with pagination
        
        Args:
            session: HTTP session for requests
            layer: Layer information from service inspector
            
        Returns:
            Dictionary with layer data and metadata
        """
        layer_id = layer['layer_id']
        layer_url = f"{self.base_url}/{layer_id}"
        
        try:
            # First, get accurate record count for pagination
            record_count = await self.get_layer_record_count(session, layer_url)
            
            if record_count == 0:
                self.logger.warning(f"⚠️ Layer {layer_id} has no records, skipping")
                return {
                    'layer_id': layer_id,
                    'record_count': 0,
                    'field_count': 0,
                    'data': [],
                    'status': 'empty'
                }
            
            # Calculate pagination
            total_pages = math.ceil(record_count / self.batch_size)
            self.logger.info(f"   📄 Layer {layer_id}: {record_count:,} records ({total_pages} pages)")
            
            # Extract data in pages
            all_records = []
            page_tasks = []
            
            # Create tasks for all pages
            for page in range(total_pages):
                offset = page * self.batch_size
                task = self.extract_layer_page(session, layer_url, offset, self.batch_size)
                page_tasks.append(task)
            
            # Execute pages in parallel batches
            page_batch_size = min(3, total_pages)  # Limit concurrent page requests
            
            for i in range(0, len(page_tasks), page_batch_size):
                batch_tasks = page_tasks[i:i + page_batch_size]
                page_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                
                for result in page_results:
                    if isinstance(result, Exception):
                        self.logger.warning(f"      ⚠️ Page extraction failed: {str(result)}")
                        continue
                    
                    if result and 'features' in result:
                        # Extract attributes from features
                        for feature in result['features']:
                            if 'attributes' in feature:
                                all_records.append(feature['attributes'])
            
            # Get field information
            layer_fields = layer.get('fields', [])
            field_names = [f['name'] for f in layer_fields]
            
            # Save layer data to CSV file
            layer_filename = f"layer_{layer_id}_{layer['name'].replace(' ', '_')}.csv"
            layer_file_path = self.output_dir / layer_filename
            
            # Convert to DataFrame and save as CSV
            if all_records:
                df = pd.DataFrame(all_records)
                df.to_csv(layer_file_path, index=False)
            
            # Also save metadata as JSON
            metadata_filename = f"layer_{layer_id}_{layer['name'].replace(' ', '_')}_metadata.json"
            metadata_path = self.output_dir / metadata_filename
            
            layer_metadata = {
                'layer_id': layer_id,
                'layer_name': layer['name'],
                'description': layer.get('description', ''),
                'geometry_type': layer.get('geometry_type'),
                'extraction_timestamp': datetime.now().isoformat(),
                'record_count': len(all_records),
                'field_count': len(field_names),
                'fields': layer_fields,
                'csv_file': str(layer_filename)
            }
            
            # Save metadata to file
            with open(metadata_path, 'w') as f:
                json.dump(layer_metadata, f, indent=2, default=str)
            
            return {
                'layer_id': layer_id,
                'layer_name': layer['name'],
                'record_count': len(all_records),
                'field_count': len(field_names),
                'file_path': str(layer_file_path),
                'status': 'success',
                'sample_record': all_records[0] if all_records else None
            }
            
        except Exception as e:
            self.logger.error(f"❌ Layer {layer_id} extraction failed: {str(e)}")
            raise
    
    async def extract_layer_page(self, session: aiohttp.ClientSession, layer_url: str, 
                                offset: int, count: int) -> Optional[Dict]:
        """
        Extract a single page of data from a layer
        
        Args:
            session: HTTP session
            layer_url: Layer endpoint URL
            offset: Record offset for pagination
            count: Number of records to fetch
            
        Returns:
            Page data or None if failed
        """
        params = {
            'where': '1=1',
            'outFields': '*',
            'f': 'json',
            'resultOffset': offset,
            'resultRecordCount': count
        }
        
        for attempt in range(self.retry_attempts):
            try:
                async with session.get(f"{layer_url}/query", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Check for ArcGIS error responses
                        if 'error' in data:
                            raise Exception(f"ArcGIS Error: {data['error']}")
                        
                        return data
                    else:
                        raise Exception(f"HTTP {response.status}: {await response.text()}")
                        
            except Exception as e:
                if attempt < self.retry_attempts - 1:
                    wait_time = self.retry_delay * (2 ** attempt)  # Exponential backoff
                    self.logger.warning(f"      Attempt {attempt + 1} failed, retrying in {wait_time}s: {str(e)}")
                    await asyncio.sleep(wait_time)
                else:
                    raise
        
        return None
    
    async def get_layer_record_count(self, session: aiohttp.ClientSession, layer_url: str) -> int:
        """
        Get accurate record count for a layer
        
        Args:
            session: HTTP session
            layer_url: Layer endpoint URL
            
        Returns:
            Number of records in layer
        """
        params = {
            'where': '1=1',
            'returnCountOnly': 'true',
            'f': 'json'
        }
        
        try:
            async with session.get(f"{layer_url}/query", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('count', 0)
                    
        except Exception as e:
            self.logger.warning(f"Could not get record count, using estimate: {str(e)}")
        
        return 0
    
    async def save_extraction_results(self, extraction_results: Dict[str, Any]) -> None:
        """
        Save extraction results and metadata
        
        Args:
            extraction_results: Dictionary of layer extraction results
        """
        # Create summary file
        summary_file = self.output_dir / "extraction_summary.json"
        
        summary_data = {
            'extraction_timestamp': self.stats['extraction_start'].isoformat() if self.stats['extraction_start'] else datetime.now().isoformat(),
            'service_url': self.base_url,
            'total_layers': len(extraction_results),
            'total_records': self.stats['total_records'],
            'total_fields': self.stats['total_fields'],
            'duration_seconds': (self.stats['extraction_end'] - self.stats['extraction_start']).total_seconds() if (self.stats['extraction_start'] and self.stats['extraction_end']) else 0,
            'layers': extraction_results,
            'errors': self.stats['errors']
        }
        
        with open(summary_file, 'w') as f:
            json.dump(summary_data, f, indent=2, default=str)
        
        # Create combined CSV file for easy analysis
        await self.create_combined_csv(extraction_results)
        
        self.logger.info(f"💾 Extraction summary saved to: {summary_file}")
    
    async def create_combined_csv(self, extraction_results: Dict[str, Any]) -> None:
        """
        Create a combined CSV file from all extracted data
        
        Args:
            extraction_results: Dictionary of layer extraction results
        """
        try:
            all_data = []
            
            # Collect data from all layers
            for layer_id, layer_result in extraction_results.items():
                if layer_result['status'] == 'success':
                    layer_file = Path(layer_result['file_path'])
                    
                    if layer_file.exists():
                        with open(layer_file, 'r') as f:
                            layer_data = json.load(f)
                        
                        # Add layer metadata to each record
                        for record in layer_data['data']:
                            record['_layer_id'] = layer_id
                            record['_layer_name'] = layer_data['layer_name']
                            all_data.append(record)
            
            if all_data:
                # Convert to DataFrame and save as CSV
                df = pd.DataFrame(all_data)
                csv_file = self.output_dir / "combined_data.csv"
                df.to_csv(csv_file, index=False)
                
                self.logger.info(f"📊 Combined CSV created: {csv_file} ({len(all_data):,} records, {len(df.columns)} columns)")
            
        except Exception as e:
            self.logger.warning(f"Could not create combined CSV: {str(e)}")
    
    def generate_field_analysis(self) -> Dict[str, Any]:
        """
        Analyze all extracted fields to understand the data structure
        
        Returns:
            Field analysis results
        """
        try:
            summary_file = self.output_dir / "extraction_summary.json"
            
            if not summary_file.exists():
                return {'error': 'No extraction summary found'}
            
            with open(summary_file, 'r') as f:
                summary = json.load(f)
            
            # Analyze fields across all layers
            all_fields = {}
            field_stats = {}
            
            for layer_id, layer_info in summary['layers'].items():
                if layer_info['status'] == 'success':
                    layer_file = Path(layer_info['file_path'])
                    
                    if layer_file.exists():
                        with open(layer_file, 'r') as f:
                            layer_data = json.load(f)
                        
                        # Analyze fields
                        for field in layer_data['fields']:
                            field_name = field['name']
                            field_type = field['type']
                            
                            if field_name not in all_fields:
                                all_fields[field_name] = {
                                    'type': field_type,
                                    'layers': [],
                                    'sample_values': set()
                                }
                            
                            all_fields[field_name]['layers'].append(layer_id)
                            
                            # Get sample values
                            if layer_data['data']:
                                for record in layer_data['data'][:5]:  # First 5 records
                                    if field_name in record and record[field_name] is not None:
                                        all_fields[field_name]['sample_values'].add(str(record[field_name])[:50])
            
            # Convert sets to lists for JSON serialization
            for field_name, field_info in all_fields.items():
                field_info['sample_values'] = list(field_info['sample_values'])[:10]
                field_info['layer_count'] = len(field_info['layers'])
            
            analysis = {
                'total_unique_fields': len(all_fields),
                'analysis_timestamp': datetime.now().isoformat(),
                'field_details': all_fields,
                'common_fields': [
                    name for name, info in all_fields.items() 
                    if info['layer_count'] > len(summary['layers']) * 0.5
                ],
                'potential_id_fields': [
                    name for name in all_fields.keys()
                    if any(keyword in name.lower() for keyword in ['id', 'geoid', 'objectid', 'zip', 'fsa'])
                ]
            }
            
            # Save field analysis
            analysis_file = self.output_dir / "field_analysis.json"
            with open(analysis_file, 'w') as f:
                json.dump(analysis, f, indent=2, default=str)
            
            self.logger.info(f"🔍 Field analysis saved to: {analysis_file}")
            return analysis
            
        except Exception as e:
            self.logger.error(f"Field analysis failed: {str(e)}")
            return {'error': str(e)}


async def main():
    """
    Main function for command-line usage
    """
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python arcgis_data_extractor.py <service_url> [output_dir] [layer_ids...]")
        print("\nExample:")
        print("python arcgis_data_extractor.py https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer extracted_data 8 10 11")
        sys.exit(1)
    
    service_url = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "extracted_data"
    layer_priorities = [int(x) for x in sys.argv[3:]] if len(sys.argv) > 3 else None
    
    # Create extractor and run
    extractor = ArcGISDataExtractor(service_url, output_dir)
    
    print(f"🚀 Starting data extraction from: {service_url}")
    print(f"📁 Output directory: {output_dir}")
    
    if layer_priorities:
        print(f"🎯 Priority layers: {layer_priorities}")
    
    # Run extraction
    results = await extractor.extract_all_data(layer_priorities)
    
    if results['success']:
        print(f"\n✅ Extraction completed successfully!")
        print(f"📊 {results['layers_extracted']}/{results['total_layers']} layers extracted")
        print(f"📈 {results['total_records']:,} total records")
        print(f"⏱️ {results['duration_seconds']:.1f} seconds")
        print(f"💾 Data saved to: {results['output_directory']}")
        
        # Generate field analysis
        print("\n🔍 Analyzing extracted fields...")
        field_analysis = extractor.generate_field_analysis()
        
        if 'error' not in field_analysis:
            print(f"📋 Found {field_analysis['total_unique_fields']} unique fields")
            print(f"🔗 Common fields: {len(field_analysis['common_fields'])}")
            print(f"🆔 Potential ID fields: {field_analysis['potential_id_fields']}")
        
    else:
        print(f"\n❌ Extraction failed: {results['error']}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())