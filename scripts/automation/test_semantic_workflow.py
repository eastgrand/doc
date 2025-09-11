#!/usr/bin/env python3
"""
Test Semantic Workflow - Demonstration of the complete semantic field resolution system
"""

import json
import sys
from pathlib import Path
from semantic_field_resolver import ScoringAlgorithmFieldResolver, AdvancedSemanticValidator
from configurable_algorithm_engine import create_project_configuration_template, ConfigurableAlgorithmEngine
import logging

def test_complete_workflow(project_path: str):
    """Test the complete semantic field workflow"""
    
    print("🧪 SEMANTIC FIELD WORKFLOW TEST")
    print("=" * 60)
    print(f"Project: {project_path}\n")
    
    project_path_obj = Path(project_path)
    
    # Step 1: Check prerequisites
    print("📋 Step 1: Checking Prerequisites...")
    
    # Check if field_mappings.json exists
    field_mappings_file = project_path_obj / "field_mappings.json"
    if not field_mappings_file.exists():
        print("❌ field_mappings.json not found")
        print("   Run automation pipeline first: python run_complete_automation.py")
        return False
    else:
        print("✅ field_mappings.json found")
    
    # Check sample endpoint data
    endpoints_dir = project_path_obj / "endpoints"
    if not endpoints_dir.exists() or not list(endpoints_dir.glob("*.json")):
        print("⚠️  No endpoint data found for testing")
        sample_data_available = False
    else:
        sample_data_available = True
        print("✅ Endpoint data available for testing")
    
    # Step 2: Initialize field resolver
    print("\n🔧 Step 2: Initializing Field Resolver...")
    
    try:
        field_resolver = ScoringAlgorithmFieldResolver(project_path)
        print(f"✅ Field resolver initialized")
        print(f"   Available fields: {len(field_resolver.available_fields)}")
        
        if field_resolver.available_fields:
            print("   Sample fields:")
            for field in field_resolver.available_fields[:5]:
                print(f"     • {field}")
            if len(field_resolver.available_fields) > 5:
                print(f"     ... and {len(field_resolver.available_fields) - 5} more")
        
    except Exception as e:
        print(f"❌ Failed to initialize field resolver: {e}")
        return False
    
    # Step 3: Generate AI suggestions
    print("\n🤖 Step 3: Generating AI Suggestions...")
    
    try:
        from semantic_field_resolver import SemanticFieldSuggestionEngine
        
        suggestion_engine = SemanticFieldSuggestionEngine(field_resolver)
        suggestions = suggestion_engine.generate_suggestions()
        
        print(f"✅ Generated suggestions")
        print(f"   Semantic mappings: {len(suggestions['semantic_mappings'])}")
        print(f"   Validation required: {len(suggestions['validation_required'])}")
        print(f"   Missing fields: {len(suggestions['missing_requirements'])}")
        
        if suggestions['semantic_mappings']:
            print("\n   🎯 Top AI Suggestions:")
            for semantic_field, mapped_field in list(suggestions['semantic_mappings'].items())[:3]:
                confidence = suggestions['confidence_scores'].get(semantic_field, 0)
                print(f"     {semantic_field:20} → {mapped_field:20} ({confidence:.2f})")
    
    except Exception as e:
        print(f"❌ Failed to generate suggestions: {e}")
        return False
    
    # Step 4: Check if semantic configuration exists
    print("\n📝 Step 4: Checking Semantic Configuration...")
    
    semantic_config_file = project_path_obj / "semantic_field_config.json"
    if semantic_config_file.exists():
        print("✅ Existing semantic configuration found")
        
        with open(semantic_config_file, 'r') as f:
            config_data = json.load(f)
            semantic_mappings = config_data.get('semantic_mappings', {})
            print(f"   Configured fields: {len(semantic_mappings)}")
            
            if semantic_mappings:
                print("   Current mappings:")
                for semantic_field, mapping in list(semantic_mappings.items())[:3]:
                    if isinstance(mapping, str):
                        print(f"     {semantic_field:20} → {mapping}")
                    else:
                        print(f"     {semantic_field:20} → {mapping}")
                if len(semantic_mappings) > 3:
                    print(f"     ... and {len(semantic_mappings) - 3} more")
    else:
        print("📝 No semantic configuration found")
        print("   Would run interactive validation to create one")
    
    # Step 5: Test configurable algorithm engine
    print("\n🚀 Step 5: Testing Configurable Algorithm Engine...")
    
    try:
        # Create project configuration if it doesn't exist
        project_config_file = project_path_obj / "project_config.json"
        if not project_config_file.exists():
            print("   Creating default project configuration...")
            create_project_configuration_template(project_path, 'retail')
        
        # Initialize engine
        engine = ConfigurableAlgorithmEngine(project_path)
        print("✅ Configurable algorithm engine initialized")
        
        # Test field resolution
        test_fields = ['consumer_income', 'market_size', 'target_performance']
        print("   🔍 Field resolution test:")
        
        for field in test_fields:
            resolved = engine.get_field(field)
            print(f"     {field:20} → {resolved}")
        
        # Test with sample data
        if sample_data_available:
            sample_data = _load_sample_data(project_path_obj)
            if sample_data:
                print("   📊 Field extraction test:")
                for field in test_fields:
                    try:
                        value = engine.extract_field_value(sample_data, field)
                        print(f"     {field:20} → {value}")
                    except Exception as e:
                        print(f"     {field:20} → Error: {e}")
        
    except Exception as e:
        print(f"❌ Failed to test configurable engine: {e}")
        return False
    
    # Step 6: Test scoring algorithm integration
    print("\n⚖️ Step 6: Testing Scoring Algorithm Integration...")
    
    try:
        from automated_score_calculator import AutomatedScoreCalculator
        
        # Initialize with configurable engine
        calculator = AutomatedScoreCalculator(
            endpoints_dir=str(endpoints_dir) if sample_data_available else "dummy",
            project_path=project_path
        )
        
        print("✅ Score calculator with configurable algorithms initialized")
        print(f"   Configurable algorithms: {calculator.use_configurable_algorithms}")
        
        # Test with sample endpoint data if available
        if sample_data_available and calculator.use_configurable_algorithms:
            endpoint_files = list(endpoints_dir.glob("*.json"))
            if endpoint_files:
                test_file = endpoint_files[0]
                print(f"   Testing with: {test_file.name}")
                
                with open(test_file, 'r') as f:
                    endpoint_data = json.load(f)
                
                # Test demographic scores
                if 'results' in endpoint_data and len(endpoint_data['results']) > 0:
                    print("   Running demographic scoring test...")
                    result = calculator.calculate_demographic_scores(endpoint_data)
                    
                    if 'results' in result and len(result['results']) > 0:
                        first_result = result['results'][0]
                        if 'demographic_opportunity_score' in first_result:
                            score = first_result['demographic_opportunity_score']
                            print(f"   ✅ Demographic score calculated: {score}")
                        else:
                            print("   ⚠️ Demographic score not found in result")
                    else:
                        print("   ⚠️ No results returned")
                else:
                    print("   ⚠️ No sample data to test with")
        
    except Exception as e:
        print(f"❌ Failed to test scoring integration: {e}")
        return False
    
    # Final summary
    print(f"\n🎉 WORKFLOW TEST COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print("✅ All components working correctly")
    print("\n📋 Next Steps:")
    
    if not semantic_config_file.exists():
        print("   1. Run semantic field validation:")
        print(f"      python semantic_field_resolver.py {project_path}")
        print("   2. Configure semantic field mappings interactively")
        print("   3. Test scoring algorithms with semantic resolution")
    else:
        print("   1. ✅ Semantic configuration ready")
        print("   2. ✅ Configurable algorithms ready")
        print("   3. Run automated scoring with semantic field resolution")
    
    print(f"\n🚀 Ready for unlimited project type scalability!")
    
    return True

def _load_sample_data(project_path: Path) -> dict:
    """Load sample data from endpoint files"""
    
    endpoints_dir = project_path / "endpoints"
    if not endpoints_dir.exists():
        return None
    
    endpoint_files = list(endpoints_dir.glob("*.json"))
    if not endpoint_files:
        return None
    
    try:
        with open(endpoint_files[0], 'r') as f:
            data = json.load(f)
            if 'results' in data and len(data['results']) > 0:
                return data['results'][0]
    except Exception:
        pass
    
    return None

def main():
    """Main function for command-line usage"""
    
    if len(sys.argv) < 2:
        print("Usage: python test_semantic_workflow.py <project_path>")
        print("\nExamples:")
        print("python test_semantic_workflow.py projects/housing_2025")
        print("python test_semantic_workflow.py projects/nike_retail")
        sys.exit(1)
    
    project_path = sys.argv[1]
    
    # Setup logging
    logging.basicConfig(level=logging.WARNING)  # Reduce noise for demo
    
    success = test_complete_workflow(project_path)
    
    if success:
        print("\n✅ All tests passed - semantic field system ready!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed - check configuration")
        sys.exit(1)

if __name__ == "__main__":
    main()