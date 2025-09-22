#!/usr/bin/env python3
"""
Simplified Semantic Field Resolver - Auto-maps fields without interactive prompts
Part of the configurable algorithm engine for multi-project scalability
"""

import json
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime
import logging

class SimpleScoringAlgorithmFieldResolver:
    """Resolves semantic field names automatically for scoring algorithms"""
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.logger = logging.getLogger(__name__)
        
        # Load already-mapped field names (from existing field_mappings.json)
        self.available_fields = self._load_available_fields()
        self.raw_field_mappings = self._load_raw_field_mappings()
        
        # Scoring algorithms semantic field requirements
        self.semantic_requirements = {
            'consumer_income': {
                'patterns': ['income', 'earnings', 'median', 'household', 'disposable', 'salary'],
                'importance': 'critical',
                'expected_range': (20000, 300000),
                'description': 'Income measure for consumer spending power analysis'
            },
            'market_size': {
                'patterns': ['population', 'total', 'residents', 'people', 'pop', 'households'],
                'importance': 'critical',
                'expected_range': (100, 10000000),
                'description': 'Population/market size for market opportunity calculations'
            },
            'target_performance': {
                'patterns': ['target', 'value', 'share', 'performance', 'thematic', 'strategic', 'doors_audience_score'],
                'importance': 'critical',
                'expected_range': (0, 100),
                'description': 'Primary performance metric that all algorithms analyze'
            },
            'age_demographics': {
                'patterns': ['age', 'median_age', 'avg_age', 'mean_age'],
                'importance': 'high',
                'expected_range': (18, 85),
                'description': 'Age demographics for target market analysis'
            },
            'geographic_identifier': {
                'patterns': ['geo', 'id', 'region', 'area', 'location', 'zip', 'postal', 'objectid'],
                'importance': 'medium',
                'expected_range': None,
                'description': 'Geographic identifier for location-based analysis'
            },
            'wealth_indicator': {
                'patterns': ['wealth', 'index', 'affluence', 'prosperity', 'net_worth'],
                'importance': 'high', 
                'expected_range': (0, 1000),
                'description': 'Wealth/affluence measure for purchasing power analysis'
            }
        }
    
    def get_field(self, semantic_name: str) -> Union[str, List[str], Dict]:
        """Resolve semantic field name to actual field name(s) for scoring algorithms"""
        config = self._load_semantic_config()
        return config.get(semantic_name, semantic_name)
    
    def _load_available_fields(self) -> List[str]:
        """Load available field names from existing field_mappings.json"""
        mapping_file = self.project_path / "field_mappings.json"
        if mapping_file.exists():
            with open(mapping_file, 'r') as f:
                data = json.load(f)
                mappings = data.get('mappings', {})
                if isinstance(mappings, dict) and 'mappings' in mappings:
                    return list(mappings['mappings'].values())
                return list(mappings.values())
        return []
    
    def _load_raw_field_mappings(self) -> Dict:
        """Load the complete field mappings for reference"""
        mapping_file = self.project_path / "field_mappings.json"
        if mapping_file.exists():
            with open(mapping_file, 'r') as f:
                return json.load(f)
        return {}
    
    def _load_semantic_config(self) -> Dict:
        """Load existing semantic config"""
        config_file = self.project_path / "semantic_field_config.json"
        if config_file.exists():
            with open(config_file, 'r') as f:
                data = json.load(f)
                return data.get('semantic_mappings', {})
        return {}
    
    def auto_resolve_fields(self) -> Dict:
        """Automatically resolve semantic fields without interaction"""
        
        print("🔧 Auto-resolving semantic fields...")
        
        semantic_mappings = {}
        
        for semantic_field, requirements in self.semantic_requirements.items():
            matches = self._find_field_matches(requirements['patterns'])
            
            if matches:
                # Sort by confidence score and take best match
                matches_sorted = sorted(matches, key=lambda x: x['confidence'], reverse=True)
                best_match = matches_sorted[0]
                
                semantic_mappings[semantic_field] = best_match['field']
                print(f"✅ {semantic_field} → {best_match['field']} (confidence: {best_match['confidence']:.2f})")
            else:
                print(f"❌ {semantic_field} → No matches found")
        
        # Save configuration
        final_config = {
            'semantic_mappings': semantic_mappings,
            'validation_status': 'auto_resolved',
            'validation_timestamp': datetime.now().isoformat(),
            'project_path': str(self.project_path),
            'total_fields': len(semantic_mappings)
        }
        
        config_file = self.project_path / "semantic_field_config.json"
        with open(config_file, 'w') as f:
            json.dump(final_config, f, indent=2)
        
        print(f"💾 Saved semantic field config: {config_file}")
        print(f"📊 Configured {len(semantic_mappings)} semantic fields")
        
        return final_config
    
    def _find_field_matches(self, patterns: List[str]) -> List[Dict]:
        """Find field matches based on semantic patterns"""
        matches = []
        
        for field in self.available_fields:
            confidence = self._calculate_field_confidence(field, patterns)
            if confidence > 0.2:  # Minimum threshold
                matches.append({
                    'field': field,
                    'confidence': confidence
                })
        
        return matches
    
    def _calculate_field_confidence(self, field: str, patterns: List[str]) -> float:
        """Calculate confidence score for field match"""
        field_lower = field.lower()
        confidence = 0.0
        
        # Exact matches
        for pattern in patterns:
            if pattern == field_lower:
                confidence += 0.5
            elif pattern in field_lower:
                confidence += 0.3
            elif field_lower in pattern:
                confidence += 0.2
        
        # Partial matches using simple similarity
        for pattern in patterns:
            if self._simple_similarity(field_lower, pattern) > 0.7:
                confidence += 0.2
        
        return min(confidence, 1.0)
    
    def _simple_similarity(self, s1: str, s2: str) -> float:
        """Simple similarity calculation"""
        if not s1 or not s2:
            return 0.0
        
        # Count common characters
        common = len(set(s1) & set(s2))
        total = len(set(s1) | set(s2))
        
        return common / total if total > 0 else 0.0


def auto_detect_project_path():
    """Auto-detect the most recent project directory"""
    from pathlib import Path
    
    current_dir = Path(__file__).resolve()
    root_dir = current_dir.parent.parent.parent
    projects_dir = root_dir / "projects"
    
    if not projects_dir.exists():
        return None
    
    # Find the most recently modified project directory with required files
    project_candidates = []
    for project_dir in projects_dir.iterdir():
        if project_dir.is_dir():
            field_mappings = project_dir / "field_mappings.json"
            if field_mappings.exists():
                mod_time = field_mappings.stat().st_mtime
                project_candidates.append((project_dir, mod_time))
    
    if not project_candidates:
        return None
    
    # Sort by modification time (most recent first) and return the path
    project_candidates.sort(key=lambda x: x[1], reverse=True)
    return str(project_candidates[0][0])


def main():
    """Main function for command-line usage"""
    import sys
    
    # Auto-detect project path if not provided
    if len(sys.argv) < 2:
        print("🔍 Auto-detecting project directory...")
        project_path = auto_detect_project_path()
        
        if not project_path:
            print("❌ No valid project directory found.")
            sys.exit(1)
        
        print(f"✅ Found project: {project_path}")
    else:
        project_path = sys.argv[1]
    
    # Setup logging
    logging.basicConfig(level=logging.WARNING)  # Reduce log verbosity
    
    try:
        # Initialize resolver
        field_resolver = SimpleScoringAlgorithmFieldResolver(project_path)
        
        if not field_resolver.available_fields:
            print("❌ No field mappings found.")
            sys.exit(1)
        
        print(f"✅ Loaded {len(field_resolver.available_fields)} available fields")
        
        # Auto-resolve fields
        result = field_resolver.auto_resolve_fields()
        
        if result:
            print(f"🎉 Semantic field configuration completed!")
            print(f"✅ {result['total_fields']} fields configured")
        else:
            print("❌ Configuration failed")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        # Clean up any lingering processes to prevent IDE crashes
        try:
            import subprocess
            import os
            current_pid = os.getpid()
            
            # Kill any other semantic_field_resolver processes except this one
            result = subprocess.run([
                'bash', '-c', 
                f'ps aux | grep semantic_field_resolver | grep -v grep | grep -v {current_pid} | awk \'{{print $2}}\' | xargs -r kill'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("🧹 Cleaned up lingering processes")
        except Exception as cleanup_error:
            print(f"⚠️ Process cleanup failed: {cleanup_error}")


if __name__ == "__main__":
    main()