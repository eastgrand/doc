#!/usr/bin/env python3
"""
Doors Documentary Audience Score - Composite Index Generator

Creates a composite index scoring markets for The Doors documentary appeal
by combining multiple entertainment and music-related behavioral indicators.

Composite Index Formula:
- Classic Rock Affinity (40%): Classic rock listening + rock radio + rock performances  
- Documentary Engagement (25%): Documentary viewing + biography consumption
- Music Consumption (20%): Streaming services + music purchasing + podcasts
- Cultural Engagement (15%): Entertainment seeking + concert spending + social media

Output: doors_audience_score (0-100 scale)
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json
import logging
from typing import Dict, List, Optional

class DoorsCompositeIndexGenerator:
    """Generate Doors Documentary Audience Score composite index"""
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.data_file = self.project_path / "merged_dataset.csv"
        self.output_file = self.project_path / "doors_audience_composite_data.csv"
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Component field mappings with weights
        self.index_components = {
            "classic_rock_affinity": {
                "weight": 0.40,
                "fields": [
                    "MP22055A_B_P",  # Listened to Classic Rock Music 6 Mo (%)
                    # Add rock radio and performance fields when available
                ]
            },
            "documentary_engagement": {
                "weight": 0.25, 
                "fields": [
                    "MP20158A_B_P",  # Rented/Purchased Documentary Movie (%)
                    # Add biography fields when available
                ]
            },
            "music_consumption": {
                "weight": 0.20,
                "fields": [
                    # Will be populated with streaming service fields
                ]
            },
            "cultural_engagement": {
                "weight": 0.15,
                "fields": [
                    "MP19180A_B_P",  # Used Internet for Entertainment/Celebrity Info (%)
                    "MP22103A_B_P",  # Listened to Entertainment/Culture Podcast (%)
                ]
            }
        }
    
    def load_data(self) -> pd.DataFrame:
        """Load the merged dataset"""
        self.logger.info(f"Loading data from {self.data_file}")
        
        if not self.data_file.exists():
            raise FileNotFoundError(f"Data file not found: {self.data_file}")
            
        df = pd.read_csv(self.data_file)
        self.logger.info(f"Loaded {len(df)} records with {len(df.columns)} fields")
        return df
    
    def identify_available_fields(self, df: pd.DataFrame) -> Dict[str, List[str]]:
        """Identify which component fields are actually available in the dataset"""
        available_components = {}
        all_columns = df.columns.tolist()
        
        for component, config in self.index_components.items():
            available_fields = []
            
            # Check explicitly defined fields
            for field in config["fields"]:
                if field in all_columns:
                    available_fields.append(field)
            
            # Auto-discover additional relevant fields based on patterns
            if component == "classic_rock_affinity":
                # Look for rock-related fields
                rock_fields = [col for col in all_columns if 
                              any(keyword in col.upper() for keyword in 
                                  ["ROCK", "CLASSIC_ROCK", "PERFORMANCE"])]
                available_fields.extend([f for f in rock_fields if f not in available_fields])
                
            elif component == "documentary_engagement":
                # Look for documentary/biography fields  
                doc_fields = [col for col in all_columns if
                             any(keyword in col.upper() for keyword in
                                 ["DOCUMENTARY", "BIOGRAPHY", "DOC_"])]
                available_fields.extend([f for f in doc_fields if f not in available_fields])
                
            elif component == "music_consumption":
                # Look for music streaming/purchasing fields
                music_fields = [col for col in all_columns if
                               any(keyword in col.upper() for keyword in
                                   ["SPOTIFY", "APPLE_MUSIC", "PANDORA", "AMAZON_MUSIC", 
                                    "ITUNES", "MUSIC_STORE", "MUSIC_PODCAST"])]
                available_fields.extend([f for f in music_fields if f not in available_fields])
            
            # Filter to only percentage fields (more comparable)
            available_fields = [f for f in available_fields if f.endswith("_P")]
            available_components[component] = available_fields
            
            self.logger.info(f"{component}: Found {len(available_fields)} fields")
            for field in available_fields[:5]:  # Log first 5
                self.logger.info(f"  - {field}")
        
        return available_components
    
    def normalize_to_percentile(self, series: pd.Series) -> pd.Series:
        """Convert values to 0-100 percentile scores"""
        return pd.Series(
            np.percentile(series.dropna(), 
                         np.linspace(0, 100, len(series))), 
            index=series.index
        ).fillna(0)
    
    def calculate_component_scores(self, df: pd.DataFrame, 
                                 available_components: Dict[str, List[str]]) -> pd.DataFrame:
        """Calculate normalized component scores"""
        component_scores = pd.DataFrame(index=df.index)
        
        for component, fields in available_components.items():
            if not fields:
                self.logger.warning(f"No fields available for {component}, setting to 0")
                component_scores[f"{component}_score"] = 0
                continue
            
            # Calculate mean of available fields for this component
            component_data = df[fields].fillna(0)
            raw_score = component_data.mean(axis=1)
            
            # Normalize to 0-100 percentile scale
            normalized_score = (raw_score.rank(pct=True) * 100).fillna(0)
            component_scores[f"{component}_score"] = normalized_score
            
            self.logger.info(f"{component}: Mean={raw_score.mean():.2f}, "
                           f"Range={raw_score.min():.2f}-{raw_score.max():.2f}")
        
        return component_scores
    
    def calculate_doors_audience_score(self, component_scores: pd.DataFrame) -> pd.Series:
        """Calculate final weighted Doors Documentary Audience Score"""
        doors_score = pd.Series(0.0, index=component_scores.index)
        
        for component, config in self.index_components.items():
            score_col = f"{component}_score"
            if score_col in component_scores.columns:
                doors_score += component_scores[score_col] * config["weight"]
                self.logger.info(f"Applied {component} with weight {config['weight']}")
        
        # Ensure 0-100 range
        doors_score = doors_score.clip(0, 100)
        
        self.logger.info(f"Final Doors Audience Score: Mean={doors_score.mean():.2f}, "
                        f"Range={doors_score.min():.2f}-{doors_score.max():.2f}")
        
        return doors_score
    
    def save_enhanced_dataset(self, df: pd.DataFrame, component_scores: pd.DataFrame, 
                            doors_score: pd.Series) -> None:
        """Save dataset with composite index scores"""
        
        # Combine original data with composite scores
        enhanced_df = df.copy()
        
        # Add component scores
        for col in component_scores.columns:
            enhanced_df[col] = component_scores[col]
        
        # Add final composite score
        enhanced_df['doors_audience_score'] = doors_score
        
        # Save to CSV
        enhanced_df.to_csv(self.output_file, index=False)
        self.logger.info(f"Enhanced dataset saved to {self.output_file}")
        
        # Save metadata
        metadata = {
            "composite_index": "doors_audience_score",
            "description": "Doors Documentary Audience Appeal Score (0-100)",
            "components": {
                component: {
                    "weight": config["weight"],
                    "available_fields": len(component_scores.columns)
                }
                for component, config in self.index_components.items()
            },
            "statistics": {
                "mean": float(doors_score.mean()),
                "std": float(doors_score.std()),
                "min": float(doors_score.min()),
                "max": float(doors_score.max()),
                "records": len(doors_score)
            }
        }
        
        metadata_file = self.project_path / "doors_audience_composite_metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        self.logger.info(f"Metadata saved to {metadata_file}")
    
    def generate_composite_index(self) -> str:
        """Main method to generate the Doors Documentary Audience Score"""
        
        self.logger.info("🎸 Starting Doors Documentary Audience Score Generation")
        
        # Load data
        df = self.load_data()
        
        # Identify available component fields
        available_components = self.identify_available_fields(df)
        
        # Calculate component scores
        component_scores = self.calculate_component_scores(df, available_components)
        
        # Calculate final composite score
        doors_score = self.calculate_doors_audience_score(component_scores)
        
        # Save enhanced dataset
        self.save_enhanced_dataset(df, component_scores, doors_score)
        
        self.logger.info("✅ Doors Documentary Audience Score generation complete!")
        return str(self.output_file)

def main():
    """CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate Doors Documentary Audience Score")
    parser.add_argument("project_path", help="Path to doors_documentary project directory")
    
    args = parser.parse_args()
    
    generator = DoorsCompositeIndexGenerator(args.project_path)
    output_file = generator.generate_composite_index()
    
    print(f"\n🎸 Doors Documentary Audience Score Generated!")
    print(f"📁 Enhanced dataset: {output_file}")
    print(f"🎯 Target variable: doors_audience_score")
    print(f"\nNext step: Run automation with target variable 'doors_audience_score'")

if __name__ == "__main__":
    main()