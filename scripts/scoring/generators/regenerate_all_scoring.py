#!/usr/bin/env python3
"""
ScoringRegenerator - Orchestrate complete scoring algorithm regeneration

This module orchestrates the complete data-driven scoring algorithm regeneration process,
from SHAP importance extraction to JavaScript scoring script generation.
"""

import argparse
import json
import time
from pathlib import Path
from typing import Dict, List, Any, Optional

from shap_extractor import LocalSHAPExtractor
from importance_analyzer import ImportanceAnalyzer
from formula_generator import DataDrivenFormulaGenerator
from js_generator import JavaScriptScoringGenerator

class ScoringRegenerator:
    """Orchestrate complete scoring algorithm regeneration"""
    
    def __init__(self, project_root: str = None):
        """Initialize scoring regenerator"""
        self.project_root = Path(project_root) if project_root else Path.cwd()
        
        # Initialize components
        self.extractor = LocalSHAPExtractor(project_root)
        self.analyzer = ImportanceAnalyzer(project_root)
        self.formula_generator = DataDrivenFormulaGenerator(project_root)
        self.js_generator = JavaScriptScoringGenerator(project_root)
        
    def regenerate_for_project(self, endpoints_dir: str, project_name: str, 
                              analysis_types: List[str] = None) -> Dict[str, Any]:
        """Complete regeneration workflow using local endpoint data"""
        
        print(f"🔄 Regenerating scoring algorithms for {project_name}...")
        start_time = time.time()
        
        # Step 1: Extract SHAP importance from local endpoint files
        print(f"\n📊 Step 1: Extracting SHAP importance from {endpoints_dir}...")
        shap_data = self.extractor.extract_from_endpoints(endpoints_dir)
        
        if not shap_data:
            print("❌ Failed to extract SHAP data from endpoints")
            return {}
            
        print(f"✅ Extracted importance data for {shap_data.get('total_features', 0)} features")
        
        # Step 2: Analyze and rank feature importance from local data
        print(f"\\n🔍 Step 2: Analyzing feature importance patterns...")
        importance_matrix = self.analyzer.analyze_local_shap_importance(shap_data)
        
        if not importance_matrix:
            print("❌ Failed to generate importance matrix")
            return {}
            
        print(f"✅ Generated importance matrix for {len(importance_matrix)} analysis types")
        
        # Step 3: Generate mathematical formulas for project's data
        print(f"\\n🔧 Step 3: Generating mathematical formulas...")
        all_formulas = self.formula_generator.generate_all_formulas(importance_matrix)
        
        if not all_formulas:
            print("❌ Failed to generate formulas")
            return {}
            
        print(f"✅ Generated {len(all_formulas)} mathematical formulas")
        
        # Step 4: Create JavaScript scoring scripts
        print(f"\\n💻 Step 4: Generating JavaScript scoring scripts...")
        generated_scripts = self.js_generator.generate_all_scripts(all_formulas)
        
        if not generated_scripts:
            print("❌ Failed to generate JavaScript scripts")
            return {}
            
        print(f"✅ Generated {len(generated_scripts)} JavaScript scripts")
        
        # Step 5: Save scripts to scoring directory
        print(f"\\n💾 Step 5: Saving scoring scripts...")
        output_dir = self.project_root / "scripts" / "scoring"
        saved_files = self.js_generator.save_scripts(generated_scripts, output_dir)
        
        # Step 6: Export configuration and metadata
        print(f"\\n📄 Step 6: Exporting regeneration metadata...")
        metadata = self._create_regeneration_metadata(
            project_name, shap_data, importance_matrix, all_formulas, saved_files
        )
        
        metadata_path = self._save_metadata(metadata, project_name)
        
        elapsed_time = time.time() - start_time
        print(f"\\n✅ Scoring algorithm regeneration complete!")
        print(f"⏱️  Total time: {elapsed_time:.1f} seconds")
        print(f"📊 Generated {len(saved_files)} scoring scripts for {project_name}")
        print(f"📄 Metadata saved to: {metadata_path}")
        
        return {
            'success': True,
            'project_name': project_name,
            'generated_scripts': len(saved_files),
            'analysis_types': list(generated_scripts.keys()),
            'saved_files': saved_files,
            'metadata_path': str(metadata_path),
            'elapsed_time': elapsed_time
        }
    
    def _create_regeneration_metadata(self, project_name: str, shap_data: Dict[str, Any],
                                    importance_matrix: Dict[str, Any], 
                                    all_formulas: Dict[str, Any],
                                    saved_files: List[str]) -> Dict[str, Any]:
        """Create comprehensive metadata for the regeneration process"""
        
        return {
            'regeneration_info': {
                'project_name': project_name,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'method': 'data_driven_shap_importance',
                'version': '1.0',
                'total_scripts_generated': len(saved_files)
            },
            'data_source': {
                'extraction_source': shap_data.get('extraction_source', 'local_endpoints'),
                'total_features': shap_data.get('total_features', 0),
                'feature_distribution': shap_data.get('feature_distribution', {}),
                'top_features_sample': shap_data.get('top_features', [])[:10]  # Top 10 only
            },
            'importance_analysis': {
                'analysis_types_generated': len(importance_matrix),
                'analysis_types': list(importance_matrix.keys()),
                'average_features_per_analysis': self._calculate_average_features(importance_matrix)
            },
            'formula_generation': {
                'formulas_generated': len(all_formulas),
                'formula_types': list(all_formulas.keys()),
                'average_components_per_formula': self._calculate_average_components(all_formulas)
            },
            'script_generation': {
                'scripts_saved': saved_files,
                'output_directory': str(self.project_root / "scripts" / "scoring"),
                'script_format': 'javascript_nodejs'
            },
            'usage_instructions': {
                'execution_order': 'Use run_all_scoring.sh or execute individual scripts',
                'dependencies': ['Node.js', 'microservice-export.json data'],
                'validation': 'Run validator.py after generation',
                'deployment': 'Execute scoring then upload to blob storage'
            }
        }
    
    def _calculate_average_features(self, importance_matrix: Dict[str, Any]) -> float:
        """Calculate average number of features per analysis"""
        
        if not importance_matrix:
            return 0.0
            
        total_features = 0
        for analysis_data in importance_matrix.values():
            feature_count = analysis_data.get('feature_count', 0)
            total_features += feature_count
            
        return total_features / len(importance_matrix) if importance_matrix else 0.0
    
    def _calculate_average_components(self, all_formulas: Dict[str, Any]) -> float:
        """Calculate average number of components per formula"""
        
        if not all_formulas:
            return 0.0
            
        total_components = 0
        for formula_config in all_formulas.values():
            component_count = formula_config.get('total_components', 0)
            total_components += component_count
            
        return total_components / len(all_formulas) if all_formulas else 0.0
    
    def _save_metadata(self, metadata: Dict[str, Any], project_name: str) -> Path:
        """Save regeneration metadata to file"""
        
        metadata_dir = self.project_root / "scripts" / "scoring" / "generators" / "metadata"
        metadata_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = time.strftime('%Y%m%d_%H%M%S')
        filename = f"regeneration_{project_name}_{timestamp}.json"
        metadata_path = metadata_dir / filename
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
            
        return metadata_path
    
    def get_analysis_types(self) -> List[str]:
        """Get list of supported analysis types"""
        
        return [
            'strategic',
            'competitive', 
            'demographic',
            'correlation',
            'brand_analysis',
            'market_sizing',
            'trend_analysis',
            'anomaly_detection',
            'feature_importance',
            'spatial_clustering',
            'segment_profiling',
            'scenario_analysis',
            'predictive_modeling',
            'outlier_detection',
            'feature_interaction'
        ]
    
    def validate_requirements(self, endpoints_dir: str) -> Dict[str, bool]:
        """Validate that all requirements are met for regeneration"""
        
        requirements = {}
        
        # Check endpoints directory
        endpoints_path = Path(endpoints_dir)
        requirements['endpoints_directory_exists'] = endpoints_path.exists()
        
        # Check for feature importance file
        feature_file = endpoints_path / "feature-importance-ranking.json"
        requirements['feature_importance_file_exists'] = feature_file.exists()
        
        if feature_file.exists():
            try:
                with open(feature_file, 'r') as f:
                    data = json.load(f)
                requirements['feature_file_valid_json'] = True
                requirements['feature_file_has_results'] = 'results' in data and len(data.get('results', [])) > 0
            except Exception:
                requirements['feature_file_valid_json'] = False
                requirements['feature_file_has_results'] = False
        
        # Check microservice export
        export_file = self.project_root / "public" / "data" / "microservice-export.json"
        requirements['microservice_export_exists'] = export_file.exists()
        
        # Check output directory
        output_dir = self.project_root / "scripts" / "scoring"
        requirements['output_directory_writable'] = output_dir.exists() or output_dir.parent.exists()
        
        return requirements

def main():
    """Command line interface for scoring regeneration"""
    
    parser = argparse.ArgumentParser(description='Regenerate scoring algorithms from SHAP importance data')
    parser.add_argument('--endpoints', type=str, default='public/data/endpoints',
                       help='Path to endpoints directory containing feature importance data')
    parser.add_argument('--project', type=str, default='current_project',
                       help='Project name for metadata and identification')
    parser.add_argument('--validate-only', action='store_true',
                       help='Only validate requirements without regenerating')
    parser.add_argument('--analysis-types', nargs='+', 
                       help='Specific analysis types to regenerate (default: all)')
    
    args = parser.parse_args()
    
    print("🚀 Data-Driven Scoring Algorithm Regenerator")
    print("=" * 50)
    
    # Initialize regenerator
    regenerator = ScoringRegenerator()
    
    # Validate requirements
    print("\\n🔍 Validating requirements...")
    requirements = regenerator.validate_requirements(args.endpoints)
    
    all_requirements_met = all(requirements.values())
    
    for requirement, met in requirements.items():
        status = "✅" if met else "❌"
        print(f"   {status} {requirement.replace('_', ' ').title()}")
    
    if not all_requirements_met:
        print("\\n❌ Requirements not met. Please fix the above issues.")
        return 1
        
    print("\\n✅ All requirements validated!")
    
    if args.validate_only:
        print("\\n🏁 Validation complete (--validate-only specified)")
        return 0
    
    # Run regeneration
    try:
        result = regenerator.regenerate_for_project(
            endpoints_dir=args.endpoints,
            project_name=args.project,
            analysis_types=args.analysis_types
        )
        
        if result.get('success', False):
            print("\\n🎉 Regeneration completed successfully!")
            print("\\n📋 Next steps:")
            print("   1. Review generated scripts in scripts/scoring/")
            print("   2. Run validation: python scripts/scoring/generators/validator.py")
            print("   3. Execute scoring: bash scripts/scoring/run_all_scoring.sh")
            print("   4. Upload to blob storage: python scripts/automation/upload_comprehensive_endpoints.py")
            return 0
        else:
            print("\\n❌ Regeneration failed")
            return 1
            
    except Exception as e:
        print(f"\\n❌ Error during regeneration: {e}")
        return 1

if __name__ == "__main__":
    exit(main())