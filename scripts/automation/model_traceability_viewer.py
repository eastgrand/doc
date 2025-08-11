#!/usr/bin/env python3
"""
Model Traceability Viewer
Display which models were used to generate endpoint data and their performance
"""

import json
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

class ModelTraceabilityViewer:
    """View model attribution and traceability information from endpoint files"""
    
    def __init__(self, endpoints_dir: str = "generated_endpoints"):
        self.endpoints_dir = Path(endpoints_dir)
        
    def show_endpoint_model_info(self, endpoint_name: str) -> Dict[str, Any]:
        """Show detailed model information for a specific endpoint"""
        
        endpoint_file = self.endpoints_dir / f"{endpoint_name}.json"
        
        if not endpoint_file.exists():
            return {"error": f"Endpoint file not found: {endpoint_file}"}
        
        with open(endpoint_file, 'r') as f:
            endpoint_data = json.load(f)
        
        # Extract model attribution
        model_info = {
            "endpoint_name": endpoint_name,
            "endpoint_type": endpoint_data.get("endpoint_type", "unknown"),
            "model_architecture": endpoint_data.get("model_architecture", "unknown"),
            "generated_timestamp": endpoint_data.get("generated_timestamp", "unknown"),
            "total_records": endpoint_data.get("total_records", 0)
        }
        
        # Get model attribution if available
        if "model_attribution" in endpoint_data:
            attribution = endpoint_data["model_attribution"]
            model_info["model_attribution"] = {
                "primary_model": attribution.get("primary_model", {}),
                "generation_method": attribution.get("generation_method", "unknown"),
                "models_used": attribution.get("models_used", []),
                "traceability_note": attribution.get("traceability_note", "No traceability info")
            }
        else:
            model_info["model_attribution"] = "Not available - generated before model attribution was implemented"
        
        # Check for record-level attribution
        results = endpoint_data.get("results", [])
        if results and "_model_attribution" in results[0]:
            model_info["record_level_attribution"] = "Available"
            model_info["sample_record_attribution"] = results[0]["_model_attribution"]
        else:
            model_info["record_level_attribution"] = "Not available"
        
        return model_info
    
    def get_all_endpoint_models(self) -> Dict[str, Any]:
        """Get model information for all endpoints"""
        
        summary = {
            "analysis_timestamp": datetime.now().isoformat(),
            "endpoints_analyzed": 0,
            "endpoints_with_attribution": 0,
            "model_usage_summary": {},
            "endpoint_details": {}
        }
        
        if not self.endpoints_dir.exists():
            return {"error": f"Endpoints directory not found: {self.endpoints_dir}"}
        
        # Analyze all endpoint files
        for endpoint_file in self.endpoints_dir.glob("*.json"):
            if endpoint_file.name in ['all_endpoints.json', 'blob-urls.json']:
                continue
                
            endpoint_name = endpoint_file.stem
            endpoint_info = self.show_endpoint_model_info(endpoint_name)
            
            summary["endpoints_analyzed"] += 1
            summary["endpoint_details"][endpoint_name] = endpoint_info
            
            # Track model usage
            if isinstance(endpoint_info.get("model_attribution"), dict):
                summary["endpoints_with_attribution"] += 1
                
                primary_model = endpoint_info["model_attribution"].get("primary_model", {})
                if isinstance(primary_model, dict):
                    model_name = primary_model.get("name", "unknown")
                    
                    if model_name not in summary["model_usage_summary"]:
                        summary["model_usage_summary"][model_name] = {
                            "endpoints_using": [],
                            "model_type": primary_model.get("type", "unknown"),
                            "performance": primary_model.get("performance", {})
                        }
                    
                    summary["model_usage_summary"][model_name]["endpoints_using"].append(endpoint_name)
        
        return summary
    
    def generate_model_traceability_report(self, output_file: str = "model_traceability_report.html") -> str:
        """Generate an HTML report showing model usage across all endpoints"""
        
        summary = self.get_all_endpoint_models()
        
        if "error" in summary:
            return summary["error"]
        
        # Generate HTML report
        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Model Traceability Report</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 20px;
                    background-color: #f5f7fa;
                }}
                .header {{
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .summary-grid {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }}
                .summary-card {{
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .model-card {{
                    background: white;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    border-left: 4px solid #4299e1;
                }}
                .endpoint-list {{
                    list-style: none;
                    padding: 0;
                }}
                .endpoint-list li {{
                    background: #e2e8f0;
                    margin: 5px 0;
                    padding: 5px 10px;
                    border-radius: 4px;
                }}
                .performance {{
                    background: #f0fff4;
                    padding: 10px;
                    border-radius: 4px;
                    margin-top: 10px;
                }}
                .attribution-available {{ border-left-color: #48bb78; }}
                .attribution-missing {{ border-left-color: #f56565; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔍 Model Traceability Report</h1>
                <p><strong>Generated:</strong> {summary['analysis_timestamp'][:19].replace('T', ' ')}</p>
                <p><strong>Purpose:</strong> Track which AI models were used to generate each endpoint's analysis data</p>
            </div>
            
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>📊 Summary Statistics</h3>
                    <p><strong>Total Endpoints:</strong> {summary['endpoints_analyzed']}</p>
                    <p><strong>With Attribution:</strong> {summary['endpoints_with_attribution']}</p>
                    <p><strong>Attribution Coverage:</strong> {(summary['endpoints_with_attribution'] / max(summary['endpoints_analyzed'], 1) * 100):.1f}%</p>
                </div>
                
                <div class="summary-card">
                    <h3>🤖 Models in Use</h3>
                    <p><strong>Unique Models:</strong> {len(summary['model_usage_summary'])}</p>
                    <p><strong>Most Used Model:</strong> {max(summary['model_usage_summary'].items(), key=lambda x: len(x[1]['endpoints_using']))[0] if summary['model_usage_summary'] else 'None'}</p>
                </div>
            </div>
            
            <h2>🤖 Model Usage Breakdown</h2>
            <div class="models-section">
        """
        
        # Add model usage details
        for model_name, model_info in summary["model_usage_summary"].items():
            endpoints_using = model_info["endpoints_using"]
            performance = model_info.get("performance", {})
            
            html_content += f"""
                <div class="model-card attribution-available">
                    <h3>🎯 {model_name.replace('_', ' ').title()}</h3>
                    <p><strong>Type:</strong> {model_info.get('model_type', 'Unknown')}</p>
                    <p><strong>Used by {len(endpoints_using)} endpoint(s):</strong></p>
                    <ul class="endpoint-list">
            """
            
            for endpoint in endpoints_using:
                html_content += f"<li>{endpoint}</li>"
            
            html_content += "</ul>"
            
            # Add performance info if available
            if performance and performance.get('r2_score'):
                r2_score = performance.get('r2_score', 0)
                performance_level = performance.get('performance_level', 'Unknown')
                
                html_content += f"""
                    <div class="performance">
                        <strong>Model Performance:</strong><br>
                        R² Score: {r2_score:.3f} ({performance_level})<br>
                        Features: {performance.get('feature_count', 'Unknown')}
                    </div>
                """
            
            html_content += "</div>"
        
        # Add endpoints without attribution
        endpoints_without_attribution = []
        for endpoint_name, endpoint_info in summary["endpoint_details"].items():
            if not isinstance(endpoint_info.get("model_attribution"), dict):
                endpoints_without_attribution.append(endpoint_name)
        
        if endpoints_without_attribution:
            html_content += f"""
            <h2>⚠️ Endpoints Without Model Attribution</h2>
            <div class="model-card attribution-missing">
                <p>The following {len(endpoints_without_attribution)} endpoint(s) don't have model attribution data:</p>
                <ul class="endpoint-list">
            """
            
            for endpoint in endpoints_without_attribution:
                html_content += f"<li>{endpoint}</li>"
            
            html_content += """
                </ul>
                <p><em>These endpoints were likely generated before model attribution was implemented.</em></p>
            </div>
            """
        
        html_content += """
            </div>
        </body>
        </html>
        """
        
        # Save report
        report_file = Path(output_file)
        with open(report_file, 'w') as f:
            f.write(html_content)
        
        return f"Model traceability report generated: {report_file}"

def main():
    """Command-line interface for model traceability viewer"""
    import argparse
    
    parser = argparse.ArgumentParser(description="View model traceability information")
    parser.add_argument("--endpoint", help="Show model info for specific endpoint")
    parser.add_argument("--all", action="store_true", help="Show model info for all endpoints")
    parser.add_argument("--report", action="store_true", help="Generate HTML traceability report")
    parser.add_argument("--endpoints-dir", default="generated_endpoints", help="Endpoints directory")
    
    args = parser.parse_args()
    
    viewer = ModelTraceabilityViewer(args.endpoints_dir)
    
    if args.endpoint:
        # Show specific endpoint info
        info = viewer.show_endpoint_model_info(args.endpoint)
        print(json.dumps(info, indent=2))
        
    elif args.all:
        # Show all endpoint info
        summary = viewer.get_all_endpoint_models()
        print(json.dumps(summary, indent=2))
        
    elif args.report:
        # Generate HTML report
        result = viewer.generate_model_traceability_report()
        print(result)
        
    else:
        # Show usage
        parser.print_help()

if __name__ == "__main__":
    main()