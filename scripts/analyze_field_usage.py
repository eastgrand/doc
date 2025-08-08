#!/usr/bin/env python3
"""
Field Usage Analyzer - Analyze which fields are actually used in the codebase
Part of the ArcGIS to Microservice Automation Pipeline
"""

import os
import re
import json
from datetime import datetime
from typing import Dict, List, Set, Any, Tuple
from pathlib import Path
from collections import defaultdict, Counter

class FieldUsageAnalyzer:
    """
    Analyzes the codebase to determine which fields are actually used
    in processing, visualization, and UI components
    """
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.field_usage = defaultdict(set)
        self.field_patterns = defaultdict(list)
        self.component_usage = defaultdict(list)
        
    def analyze_complete_usage(self) -> Dict[str, Any]:
        """
        Perform comprehensive field usage analysis across the entire codebase
        """
        print("🔍 Starting comprehensive field usage analysis...")
        
        results = {
            'analysis_timestamp': datetime.now().isoformat(),
            'field_usage_summary': {},
            'usage_by_component': {},
            'essential_fields': [],
            'removable_fields': [],
            'field_patterns': {},
            'recommendations': []
        }
        
        # 1. Analyze processors
        print("📊 Analyzing data processors...")
        processor_usage = self._analyze_processors()
        
        # 2. Analyze visualization components
        print("🎨 Analyzing visualization components...")
        viz_usage = self._analyze_visualizations()
        
        # 3. Analyze UI components
        print("🖥️ Analyzing UI components...")
        ui_usage = self._analyze_ui_components()
        
        # 4. Analyze scoring scripts
        print("📈 Analyzing scoring scripts...")
        scoring_usage = self._analyze_scoring_scripts()
        
        # 5. Combine and classify fields
        print("🔄 Combining and classifying field usage...")
        classification = self._classify_field_usage(
            processor_usage, viz_usage, ui_usage, scoring_usage
        )
        
        # 6. Analyze actual endpoint data
        print("📂 Analyzing current endpoint data...")
        endpoint_analysis = self._analyze_endpoint_data()
        
        # 7. Generate recommendations
        print("💡 Generating optimization recommendations...")
        recommendations = self._generate_recommendations(classification, endpoint_analysis)
        
        # Compile results
        results.update({
            'processor_usage': processor_usage,
            'visualization_usage': viz_usage,
            'ui_usage': ui_usage,
            'scoring_usage': scoring_usage,
            'field_classification': classification,
            'endpoint_analysis': endpoint_analysis,
            'recommendations': recommendations
        })
        
        return results
    
    def _analyze_processors(self) -> Dict[str, List[str]]:
        """Analyze field usage in data processors"""
        
        processors_dir = self.project_root / "lib" / "analysis" / "strategies" / "processors"
        processor_usage = {}
        
        if not processors_dir.exists():
            return processor_usage
        
        for processor_file in processors_dir.glob("*.ts"):
            print(f"  📝 Analyzing {processor_file.name}...")
            
            try:
                with open(processor_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find field access patterns
                fields = self._extract_field_references(content, 'processor')
                processor_usage[processor_file.name] = fields
                
            except Exception as e:
                print(f"    ⚠️ Error reading {processor_file.name}: {e}")
        
        return processor_usage
    
    def _analyze_visualizations(self) -> Dict[str, List[str]]:
        """Analyze field usage in visualization components"""
        
        viz_dirs = [
            self.project_root / "utils" / "visualizations",
            self.project_root / "lib" / "analysis"
        ]
        
        viz_usage = {}
        
        for viz_dir in viz_dirs:
            if not viz_dir.exists():
                continue
                
            for viz_file in viz_dir.glob("**/*.ts"):
                if "test" in viz_file.name.lower():
                    continue
                    
                print(f"  🎨 Analyzing {viz_file.name}...")
                
                try:
                    with open(viz_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    fields = self._extract_field_references(content, 'visualization')
                    if fields:
                        viz_usage[viz_file.name] = fields
                        
                except Exception as e:
                    print(f"    ⚠️ Error reading {viz_file.name}: {e}")
        
        return viz_usage
    
    def _analyze_ui_components(self) -> Dict[str, List[str]]:
        """Analyze field usage in UI components"""
        
        components_dir = self.project_root / "components"
        ui_usage = {}
        
        if not components_dir.exists():
            return ui_usage
        
        for component_file in components_dir.glob("**/*.tsx"):
            if "test" in component_file.name.lower():
                continue
                
            print(f"  🖥️ Analyzing {component_file.name}...")
            
            try:
                with open(component_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                fields = self._extract_field_references(content, 'ui')
                if fields:
                    ui_usage[component_file.name] = fields
                    
            except Exception as e:
                print(f"    ⚠️ Error reading {component_file.name}: {e}")
        
        return ui_usage
    
    def _analyze_scoring_scripts(self) -> Dict[str, List[str]]:
        """Analyze field usage in Node.js scoring scripts"""
        
        scoring_dir = self.project_root / "scripts" / "scoring"
        scoring_usage = {}
        
        if not scoring_dir.exists():
            return scoring_usage
        
        for script_file in scoring_dir.glob("*.js"):
            print(f"  📈 Analyzing {script_file.name}...")
            
            try:
                with open(script_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                fields = self._extract_field_references(content, 'scoring')
                if fields:
                    scoring_usage[script_file.name] = fields
                    
            except Exception as e:
                print(f"    ⚠️ Error reading {script_file.name}: {e}")
        
        return scoring_usage
    
    def _extract_field_references(self, content: str, component_type: str) -> List[str]:
        """Extract field references from code content"""
        
        fields = set()
        
        # Different patterns for different languages/contexts
        patterns = {
            'processor': [
                # TypeScript patterns
                r'record\.([a-zA-Z_][a-zA-Z0-9_]*)',
                r'record\[[\'""]([a-zA-Z_][a-zA-Z0-9_]*)[\'""]',
                r'record\[[\'""]([A-Z_][A-Z0-9_]*)[\'""]',  # Uppercase fields
                r'Number\(record\.([a-zA-Z_][a-zA-Z0-9_]*)',
                r'Number\(record\[[\'""]([a-zA-Z_][a-zA-Z0-9_]*)[\'""]',
            ],
            'visualization': [
                r'properties\[[\'""]([a-zA-Z_][a-zA-Z0-9_]*)[\'""]',
                r'attributes\[[\'""]([a-zA-Z_][a-zA-Z0-9_]*)[\'""]',
                r'data\.([a-zA-Z_][a-zA-Z0-9_]*)',
                r'item\.([a-zA-Z_][a-zA-Z0-9_]*)',
                r'feature\.attributes\.([a-zA-Z_][a-zA-Z0-9_]*)',
            ],
            'ui': [
                r'data\.([a-zA-Z_][a-zA-Z0-9_]*)',
                r'item\.([a-zA-Z_][a-zA-Z0-9_]*)',
                r'record\.([a-zA-Z_][a-zA-Z0-9_]*)',
                r'properties\.([a-zA-Z_][a-zA-Z0-9_]*)',
            ],
            'scoring': [
                # JavaScript patterns
                r'record\.([a-zA-Z_][a-zA-Z0-9_]*)',
                r'record\[[\'""]([a-zA-Z_][a-zA-Z0-9_]*)[\'""]',
                r'Number\(record\.([a-zA-Z_][a-zA-Z0-9_]*)',
                r'record\[[\'""]([A-Z_][A-Z0-9_]*)[\'""]',  # Nike field patterns
            ]
        }
        
        # Apply patterns based on component type
        for pattern in patterns.get(component_type, patterns['processor']):
            matches = re.findall(pattern, content, re.IGNORECASE)
            fields.update(matches)
        
        # Filter out common non-field names
        exclude_terms = {
            'length', 'prototype', 'constructor', 'toString', 'valueOf', 
            'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
            'undefined', 'null', 'true', 'false', 'error', 'success',
            'map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every',
            'push', 'pop', 'shift', 'unshift', 'slice', 'splice',
            'type', 'name', 'value', 'key', 'index', 'item', 'data'
        }
        
        filtered_fields = [f for f in fields if f.lower() not in exclude_terms and len(f) > 1]
        
        return sorted(list(set(filtered_fields)))
    
    def _classify_field_usage(self, processor_usage: Dict, viz_usage: Dict, 
                             ui_usage: Dict, scoring_usage: Dict) -> Dict[str, Any]:
        """Classify fields by usage patterns"""
        
        all_fields = set()
        field_usage_count = Counter()
        field_components = defaultdict(set)
        
        # Combine all field references
        for component_type, usage_dict in [
            ('processor', processor_usage),
            ('visualization', viz_usage), 
            ('ui', ui_usage),
            ('scoring', scoring_usage)
        ]:
            for component, fields in usage_dict.items():
                for field in fields:
                    all_fields.add(field)
                    field_usage_count[field] += 1
                    field_components[field].add(f"{component_type}:{component}")
        
        # Classify fields by importance
        critical_fields = []  # Used in 3+ component types
        important_fields = []  # Used in 2 component types
        optional_fields = []  # Used in 1 component type
        
        for field in all_fields:
            component_types = {comp.split(':')[0] for comp in field_components[field]}
            usage_count = field_usage_count[field]
            
            if len(component_types) >= 3 or usage_count >= 10:
                critical_fields.append({
                    'field': field,
                    'usage_count': usage_count,
                    'component_types': list(component_types),
                    'components': list(field_components[field])
                })
            elif len(component_types) >= 2 or usage_count >= 5:
                important_fields.append({
                    'field': field,
                    'usage_count': usage_count,
                    'component_types': list(component_types),
                    'components': list(field_components[field])
                })
            else:
                optional_fields.append({
                    'field': field,
                    'usage_count': usage_count,
                    'component_types': list(component_types),
                    'components': list(field_components[field])
                })
        
        # Sort by usage count
        critical_fields.sort(key=lambda x: x['usage_count'], reverse=True)
        important_fields.sort(key=lambda x: x['usage_count'], reverse=True)
        optional_fields.sort(key=lambda x: x['usage_count'], reverse=True)
        
        return {
            'critical_fields': critical_fields,
            'important_fields': important_fields,
            'optional_fields': optional_fields,
            'total_unique_fields': len(all_fields),
            'field_usage_distribution': dict(field_usage_count.most_common(50))
        }
    
    def _analyze_endpoint_data(self) -> Dict[str, Any]:
        """Analyze actual endpoint data to see what fields exist"""
        
        endpoints_dir = self.project_root / "public" / "data" / "endpoints"
        endpoint_analysis = {}
        
        if not endpoints_dir.exists():
            return {'error': 'Endpoints directory not found'}
        
        total_size = 0
        total_records = 0
        field_frequency = Counter()
        endpoint_sizes = {}
        
        for endpoint_file in endpoints_dir.glob("*.json"):
            if endpoint_file.name in ['all_endpoints.json', 'blob-urls.json']:
                continue
                
            print(f"  📂 Analyzing {endpoint_file.name}...")
            
            try:
                file_size = endpoint_file.stat().st_size
                total_size += file_size
                
                with open(endpoint_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if isinstance(data, dict) and 'results' in data:
                    records = data['results']
                    record_count = len(records)
                    total_records += record_count
                    
                    if records:
                        # Analyze first record to get field structure
                        first_record = records[0]
                        fields = list(first_record.keys()) if isinstance(first_record, dict) else []
                        
                        # Count field frequency
                        for field in fields:
                            field_frequency[field] += 1
                        
                        endpoint_analysis[endpoint_file.name] = {
                            'file_size_mb': file_size / (1024 * 1024),
                            'record_count': record_count,
                            'field_count': len(fields),
                            'fields': fields,
                            'avg_fields_per_record': len(fields)
                        }
                        
                        endpoint_sizes[endpoint_file.name] = file_size / (1024 * 1024)
                
            except Exception as e:
                print(f"    ⚠️ Error analyzing {endpoint_file.name}: {e}")
        
        return {
            'total_size_mb': total_size / (1024 * 1024),
            'total_records': total_records,
            'avg_fields_per_endpoint': sum(len(ep.get('fields', [])) for ep in endpoint_analysis.values()) / len(endpoint_analysis) if endpoint_analysis else 0,
            'endpoint_details': endpoint_analysis,
            'endpoint_sizes': endpoint_sizes,
            'most_common_fields': dict(field_frequency.most_common(30)),
            'field_frequency_distribution': dict(field_frequency)
        }
    
    def _generate_recommendations(self, classification: Dict, endpoint_analysis: Dict) -> Dict[str, Any]:
        """Generate field optimization recommendations"""
        
        critical_field_names = {f['field'] for f in classification['critical_fields']}
        important_field_names = {f['field'] for f in classification['important_fields']}
        
        # Analyze endpoint fields vs used fields
        endpoint_fields = set()
        for endpoint_data in endpoint_analysis.get('endpoint_details', {}).values():
            endpoint_fields.update(endpoint_data.get('fields', []))
        
        # Find unused fields (in endpoints but not in code)
        used_fields = critical_field_names | important_field_names
        unused_fields = endpoint_fields - used_fields
        
        # Calculate potential savings
        total_size = endpoint_analysis.get('total_size_mb', 0)
        total_fields = len(endpoint_fields)
        unused_field_count = len(unused_fields)
        
        if total_fields > 0:
            potential_savings_pct = (unused_field_count / total_fields) * 100
            estimated_size_reduction = total_size * (potential_savings_pct / 100)
        else:
            potential_savings_pct = 0
            estimated_size_reduction = 0
        
        # Field optimization strategy
        keep_fields = list(critical_field_names | important_field_names)
        
        # Add essential fields that might not be detected by usage analysis
        essential_system_fields = {
            'ID', 'id', 'area_id', 'GEOID', 'ZIP_CODE', 'FSA_ID',
            'DESCRIPTION', 'area_name', 'name', 'NAME',
            'coordinates', 'geometry', 'properties'
        }
        
        keep_fields.extend([f for f in essential_system_fields if f in endpoint_fields])
        keep_fields = list(set(keep_fields))  # Remove duplicates
        
        return {
            'optimization_summary': {
                'total_endpoint_fields': len(endpoint_fields),
                'used_in_code': len(used_fields),
                'unused_fields': len(unused_fields),
                'potential_savings_percent': round(potential_savings_pct, 1),
                'estimated_size_reduction_mb': round(estimated_size_reduction, 1)
            },
            'field_recommendations': {
                'keep_fields': sorted(keep_fields),
                'remove_fields': sorted(list(unused_fields)),
                'critical_fields': sorted(list(critical_field_names)),
                'important_fields': sorted(list(important_field_names))
            },
            'optimization_strategy': {
                'priority_1_remove': sorted([f for f in unused_fields if f.startswith(('temp_', 'debug_', '_internal', 'raw_'))]),
                'priority_2_remove': sorted([f for f in unused_fields if 'shap_' in f.lower() and f not in used_fields]),
                'priority_3_remove': sorted([f for f in unused_fields if f not in used_fields and len(f) > 20])  # Very long field names
            },
            'size_optimization_per_endpoint': {
                name: {
                    'current_size_mb': size,
                    'estimated_optimized_mb': size * (1 - potential_savings_pct / 100),
                    'savings_mb': size * (potential_savings_pct / 100)
                }
                for name, size in endpoint_analysis.get('endpoint_sizes', {}).items()
            }
        }
    
    def save_analysis_results(self, results: Dict[str, Any], output_file: str):
        """Save analysis results to JSON file"""
        
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"💾 Analysis results saved to: {output_file}")
        
        # Print summary
        print(f"\n📊 FIELD USAGE ANALYSIS SUMMARY")
        print(f"================================")
        
        classification = results['field_classification']
        endpoint_analysis = results['endpoint_analysis']
        recommendations = results['recommendations']
        
        print(f"🔍 Fields found in code:")
        print(f"   Critical (keep): {len(classification['critical_fields'])}")
        print(f"   Important (keep): {len(classification['important_fields'])}")
        print(f"   Optional (review): {len(classification['optional_fields'])}")
        
        print(f"\n📂 Current endpoint status:")
        print(f"   Total size: {endpoint_analysis.get('total_size_mb', 0):.1f} MB")
        print(f"   Total fields: {recommendations['optimization_summary']['total_endpoint_fields']}")
        print(f"   Unused fields: {recommendations['optimization_summary']['unused_fields']}")
        
        print(f"\n💡 Optimization potential:")
        print(f"   Size reduction: {recommendations['optimization_summary']['estimated_size_reduction_mb']:.1f} MB")
        print(f"   Percentage savings: {recommendations['optimization_summary']['potential_savings_percent']:.1f}%")


def main():
    """Main function for command-line usage"""
    import sys
    
    project_root = sys.argv[1] if len(sys.argv) > 1 else "/Users/voldeck/code/mpiq-ai-chat"
    output_file = sys.argv[2] if len(sys.argv) > 2 else "field_usage_analysis.json"
    
    print(f"🔍 Analyzing field usage in project: {project_root}")
    print(f"📄 Output will be saved to: {output_file}")
    print("=" * 60)
    
    analyzer = FieldUsageAnalyzer(project_root)
    results = analyzer.analyze_complete_usage()
    analyzer.save_analysis_results(results, output_file)
    
    print(f"\n✅ Analysis complete!")
    print(f"📋 Review {output_file} for detailed field usage analysis")
    print(f"💡 Use the recommendations to optimize endpoint JSON files")


if __name__ == "__main__":
    main()