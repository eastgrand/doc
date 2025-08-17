#!/usr/bin/env python3
"""
ScoringValidator - Validate generated scoring algorithms

This module validates the generated JavaScript scoring scripts to ensure
they are syntactically correct, mathematically sound, and data compatible.
"""

import argparse
import json
import subprocess
import tempfile
import os
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

class ScoringValidator:
    """Validate generated scoring algorithms"""
    
    def __init__(self, project_root: str = None):
        """Initialize validator"""
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.scoring_dir = self.project_root / "scripts" / "scoring"
        
    def validate_algorithms(self, script_paths: List[str] = None) -> Dict[str, Any]:
        """Test generated scoring scripts"""
        
        print("🔍 Starting scoring algorithm validation...")
        
        if not script_paths:
            # Find all generated scoring scripts
            script_paths = self._find_scoring_scripts()
            
        if not script_paths:
            print("❌ No scoring scripts found for validation")
            return {}
            
        print(f"📊 Validating {len(script_paths)} scoring scripts...")
        
        validation_results = {}
        
        for script_path in script_paths:
            script_name = Path(script_path).stem
            print(f"\\n🔍 Validating {script_name}...")
            
            # Run all validation checks
            result = self._validate_single_script(script_path)
            validation_results[script_name] = result
            
            # Show summary
            if result['overall']:
                print(f"✅ {script_name}: All validations passed")
            else:
                failed_checks = [check for check, passed in result.items() 
                               if check != 'overall' and not passed]
                print(f"❌ {script_name}: Failed checks: {', '.join(failed_checks)}")
        
        # Generate overall summary
        self._print_validation_summary(validation_results)
        
        return validation_results
    
    def _find_scoring_scripts(self) -> List[str]:
        """Find all scoring scripts in the scoring directory"""
        
        script_patterns = [
            "*-scores.js",
            "*-scoring.js", 
            "*_scores.js"
        ]
        
        found_scripts = []
        
        for pattern in script_patterns:
            found_scripts.extend(self.scoring_dir.glob(pattern))
            
        return [str(script) for script in found_scripts]
    
    def _validate_single_script(self, script_path: str) -> Dict[str, Any]:
        """Validate a single scoring script"""
        
        script_path = Path(script_path)
        
        if not script_path.exists():
            return {
                'syntax': False,
                'mathematics': False,
                'data_compatibility': False,
                'score_ranges': False,
                'overall': False,
                'error': f"Script file not found: {script_path}"
            }
        
        # 1. Syntax validation
        syntax_valid, syntax_error = self._validate_javascript_syntax(script_path)
        
        # 2. Mathematical validation
        math_valid, math_error = self._validate_mathematical_logic(script_path)
        
        # 3. Data compatibility validation
        data_valid, data_error = self._test_with_sample_data(script_path)
        
        # 4. Score range validation
        range_valid, range_error = self._validate_score_ranges(script_path)
        
        # Overall validation
        overall_valid = all([syntax_valid, math_valid, data_valid, range_valid])
        
        return {
            'syntax': syntax_valid,
            'syntax_error': syntax_error,
            'mathematics': math_valid,
            'math_error': math_error,
            'data_compatibility': data_valid,
            'data_error': data_error,
            'score_ranges': range_valid,
            'range_error': range_error,
            'overall': overall_valid,
            'script_path': str(script_path)
        }
    
    def _validate_javascript_syntax(self, script_path: Path) -> Tuple[bool, Optional[str]]:
        """Validate JavaScript syntax"""
        
        try:
            # Use Node.js to check syntax
            result = subprocess.run([
                'node', '--check', str(script_path)
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                return True, None
            else:
                return False, result.stderr
                
        except subprocess.TimeoutExpired:
            return False, "Syntax check timed out"
        except FileNotFoundError:
            return False, "Node.js not found (required for syntax validation)"
        except Exception as e:
            return False, f"Syntax validation error: {str(e)}"
    
    def _validate_mathematical_logic(self, script_path: Path) -> Tuple[bool, Optional[str]]:
        """Validate mathematical logic in the script"""
        
        try:
            with open(script_path, 'r') as f:
                script_content = f.read()
            
            # Check for mathematical validity patterns
            math_checks = {
                'has_calculation_function': self._check_has_calculation_function(script_content),
                'weights_sum_reasonable': self._check_weights_sum(script_content),
                'no_division_by_zero': self._check_division_safety(script_content),
                'score_bounds_enforced': self._check_score_bounds(script_content),
                'normalization_present': self._check_normalization(script_content)
            }
            
            failed_checks = [check for check, passed in math_checks.items() if not passed]
            
            if failed_checks:
                return False, f"Mathematical issues: {', '.join(failed_checks)}"
            else:
                return True, None
                
        except Exception as e:
            return False, f"Mathematical validation error: {str(e)}"
    
    def _test_with_sample_data(self, script_path: Path) -> Tuple[bool, Optional[str]]:
        """Test script with sample data"""
        
        try:
            # Create a test data file
            test_data = self._create_test_data()
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                json.dump(test_data, f)
                test_data_path = f.name
            
            try:
                # Create a modified script that uses test data
                modified_script = self._create_test_script(script_path, test_data_path)
                
                with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
                    f.write(modified_script)
                    test_script_path = f.name
                
                try:
                    # Run the test script
                    result = subprocess.run([
                        'node', test_script_path
                    ], capture_output=True, text=True, timeout=60)
                    
                    if result.returncode == 0:
                        return True, None
                    else:
                        return False, f"Script execution failed: {result.stderr}"
                        
                finally:
                    os.unlink(test_script_path)
                    
            finally:
                os.unlink(test_data_path)
                
        except Exception as e:
            return False, f"Data compatibility test error: {str(e)}"
    
    def _validate_score_ranges(self, script_path: Path) -> Tuple[bool, Optional[str]]:
        """Validate that scores fall within expected ranges (0-100)"""
        
        try:
            with open(script_path, 'r') as f:
                script_content = f.read()
            
            # Check for score range validation in the script
            range_checks = {
                'has_min_max_enforcement': 'Math.min(' in script_content and 'Math.max(' in script_content,
                'has_0_100_bounds': '0' in script_content and '100' in script_content,
                'rounds_scores': 'Math.round(' in script_content or '.toFixed(' in script_content
            }
            
            failed_checks = [check for check, passed in range_checks.items() if not passed]
            
            if failed_checks:
                return False, f"Score range issues: {', '.join(failed_checks)}"
            else:
                return True, None
                
        except Exception as e:
            return False, f"Score range validation error: {str(e)}"
    
    def _check_has_calculation_function(self, script_content: str) -> bool:
        """Check if script has a calculation function"""
        return 'function ' in script_content and 'calculate' in script_content.lower()
    
    def _check_weights_sum(self, script_content: str) -> bool:
        """Check if weights sum to reasonable values"""
        # Look for weight patterns
        import re
        weight_patterns = re.findall(r'(\d+\.?\d*)\s*\*', script_content)
        
        if weight_patterns:
            try:
                weights = [float(w) for w in weight_patterns]
                total_weight = sum(weights)
                # Should be around 1.0 (if decimal) or 100 (if percentage)
                return 0.8 <= total_weight <= 1.2 or 80 <= total_weight <= 120
            except ValueError:
                return True  # Can't parse, assume okay
        
        return True  # No clear weights found, assume okay
    
    def _check_division_safety(self, script_content: str) -> bool:
        """Check for division by zero protection"""
        if '/' in script_content:
            # Look for protective patterns
            return any(pattern in script_content for pattern in [
                '|| 1', '|| 0.001', '!== 0', '> 0', 'Math.max('
            ])
        return True
    
    def _check_score_bounds(self, script_content: str) -> bool:
        """Check if score bounds are enforced"""
        return 'Math.min(' in script_content and 'Math.max(' in script_content
    
    def _check_normalization(self, script_content: str) -> bool:
        """Check if normalization is present"""
        normalization_patterns = [
            'normalized', 'Math.min(', 'Math.max(', '/ ', '* 100'
        ]
        return any(pattern in script_content for pattern in normalization_patterns)
    
    def _create_test_data(self) -> Dict[str, Any]:
        """Create sample test data for validation"""
        
        return {
            "datasets": {
                "correlation_analysis": {
                    "results": [
                        {
                            "ID": "test_001",
                            "DESCRIPTION": "Test Location 1",
                            "mp30034a_b_p": 25.5,
                            "total_population": 75000,
                            "median_income": 65000,
                            "demographic_opportunity_score": 78.5,
                            "competitive_advantage_score": 82.3,
                            "correlation_strength_score": 65.7,
                            "cluster_performance_score": 71.2
                        },
                        {
                            "ID": "test_002", 
                            "DESCRIPTION": "Test Location 2",
                            "mp30034a_b_p": 15.8,
                            "total_population": 45000,
                            "median_income": 52000,
                            "demographic_opportunity_score": 65.2,
                            "competitive_advantage_score": 71.8,
                            "correlation_strength_score": 58.3,
                            "cluster_performance_score": 63.9
                        }
                    ]
                }
            }
        }
    
    def _create_test_script(self, original_script_path: Path, test_data_path: str) -> str:
        """Create a modified version of the script for testing"""
        
        with open(original_script_path, 'r') as f:
            original_content = f.read()
        
        # Replace the data path with our test data
        modified_content = original_content.replace(
            "path.join(__dirname, '../../public/data/microservice-export.json')",
            f"'{test_data_path}'"
        )
        
        # Add a simple test validation at the end
        test_validation = """
// Validation check
let validationPassed = true;
let errorMessage = '';

try {
  // Check if scores were generated
  const hasScores = analysisData.results.some(record => {
    const scoreFields = Object.keys(record).filter(key => key.includes('_score'));
    return scoreFields.length > 0;
  });
  
  if (!hasScores) {
    validationPassed = false;
    errorMessage = 'No score fields generated';
  }
  
  // Check score ranges
  for (const record of analysisData.results) {
    for (const [key, value] of Object.entries(record)) {
      if (key.includes('_score') && typeof value === 'number') {
        if (value < 0 || value > 100) {
          validationPassed = false;
          errorMessage = `Score out of range (0-100): ${key} = ${value}`;
          break;
        }
      }
    }
    if (!validationPassed) break;
  }
  
} catch (error) {
  validationPassed = false;
  errorMessage = `Validation error: ${error.message}`;
}

if (validationPassed) {
  console.log('✅ Validation passed');
  process.exit(0);
} else {
  console.error(`❌ Validation failed: ${errorMessage}`);
  process.exit(1);
}
"""
        
        modified_content += test_validation
        
        return modified_content
    
    def _print_validation_summary(self, validation_results: Dict[str, Any]) -> None:
        """Print summary of validation results"""
        
        print("\\n" + "="*60)
        print("📊 VALIDATION SUMMARY")
        print("="*60)
        
        total_scripts = len(validation_results)
        passed_scripts = sum(1 for result in validation_results.values() if result['overall'])
        
        print(f"Total scripts validated: {total_scripts}")
        print(f"Scripts passed: {passed_scripts}")
        print(f"Scripts failed: {total_scripts - passed_scripts}")
        
        if passed_scripts == total_scripts:
            print("\\n🎉 All scripts passed validation!")
        else:
            print("\\n❌ Some scripts failed validation:")
            
            for script_name, result in validation_results.items():
                if not result['overall']:
                    print(f"\\n  {script_name}:")
                    for check in ['syntax', 'mathematics', 'data_compatibility', 'score_ranges']:
                        if not result.get(check, False):
                            error = result.get(f"{check}_error", "Unknown error")
                            print(f"    ❌ {check}: {error}")
        
        print("\\n📋 Validation checks performed:")
        print("  • JavaScript syntax validation")
        print("  • Mathematical logic validation") 
        print("  • Data compatibility testing")
        print("  • Score range validation (0-100)")

def main():
    """Command line interface for validation"""
    
    parser = argparse.ArgumentParser(description='Validate generated scoring algorithms')
    parser.add_argument('--scripts', nargs='+', 
                       help='Specific script paths to validate (default: all in scripts/scoring/)')
    parser.add_argument('--scoring-dir', type=str, default='scripts/scoring',
                       help='Directory containing scoring scripts')
    
    args = parser.parse_args()
    
    print("🔍 Scoring Algorithm Validator")
    print("=" * 40)
    
    # Initialize validator
    validator = ScoringValidator()
    
    # Run validation
    try:
        validation_results = validator.validate_algorithms(args.scripts)
        
        # Return appropriate exit code
        if validation_results:
            all_passed = all(result['overall'] for result in validation_results.values())
            return 0 if all_passed else 1
        else:
            return 1
            
    except Exception as e:
        print(f"\\n❌ Validation error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())