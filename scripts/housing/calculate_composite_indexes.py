#!/usr/bin/env python3
"""
Housing Composite Indexes Calculator

Calculates three composite indexes for housing market analysis:
1. Hot Growth Markets Index - Identifies areas with significant housing tenure shifts
2. New Home Owner Index - Targets young renters with growing incomes
3. Housing Affordability Index - Assesses housing affordability (limited by available data)

Creates delta fields for all matching time-series variables.
"""

import pandas as pd
import numpy as np
import logging
from pathlib import Path
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def calculate_composite_indexes(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate all composite indexes and delta fields"""
    
    logger.info("Starting composite index calculations...")
    result_df = df.copy()
    
    # =================================================================
    # DELTA FIELD CALCULATIONS
    # =================================================================
    
    logger.info("Calculating delta fields...")
    
    # Housing Tenure Delta Fields
    if all(col in df.columns for col in ['ECYTENOWN', 'ECYTENHHD', 'P5YTENOWN', 'P5YTENHHD', 'P0YTENOWN', 'P0YTENHHD']):
        # Calculate ownership percentages
        result_df['OWNERSHIP_PCT_2023'] = (df['ECYTENOWN'] / df['ECYTENHHD']) * 100
        result_df['OWNERSHIP_PCT_2028'] = (df['P5YTENOWN'] / df['P5YTENHHD']) * 100
        result_df['OWNERSHIP_PCT_2033'] = (df['P0YTENOWN'] / df['P0YTENHHD']) * 100
        
        # Calculate ownership delta fields
        result_df['OWNERSHIP_DELTA_23_28'] = result_df['OWNERSHIP_PCT_2028'] - result_df['OWNERSHIP_PCT_2023']
        result_df['OWNERSHIP_DELTA_28_33'] = result_df['OWNERSHIP_PCT_2033'] - result_df['OWNERSHIP_PCT_2028']
        result_df['OWNERSHIP_DELTA_23_33'] = result_df['OWNERSHIP_PCT_2033'] - result_df['OWNERSHIP_PCT_2023']
        
        logger.info("✅ Ownership delta fields calculated")
    
    if all(col in df.columns for col in ['ECYTENRENT', 'ECYTENHHD', 'P5YTENRENT', 'P5YTENHHD', 'P0YTENRENT', 'P0YTENHHD']):
        # Calculate rental percentages
        result_df['RENTAL_PCT_2023'] = (df['ECYTENRENT'] / df['ECYTENHHD']) * 100
        result_df['RENTAL_PCT_2028'] = (df['P5YTENRENT'] / df['P5YTENHHD']) * 100
        result_df['RENTAL_PCT_2033'] = (df['P0YTENRENT'] / df['P0YTENHHD']) * 100
        
        # Calculate rental delta fields
        result_df['RENTAL_DELTA_23_28'] = result_df['RENTAL_PCT_2028'] - result_df['RENTAL_PCT_2023']
        result_df['RENTAL_DELTA_28_33'] = result_df['RENTAL_PCT_2033'] - result_df['RENTAL_PCT_2028']
        result_df['RENTAL_DELTA_23_33'] = result_df['RENTAL_PCT_2033'] - result_df['RENTAL_PCT_2023']
        
        logger.info("✅ Rental delta fields calculated")
    
    # Total Household Growth Delta Fields
    if all(col in df.columns for col in ['ECYTENHHD', 'P5YTENHHD', 'P0YTENHHD']):
        result_df['TOTAL_HH_DELTA_23_28'] = ((df['P5YTENHHD'] - df['ECYTENHHD']) / df['ECYTENHHD']) * 100
        result_df['TOTAL_HH_DELTA_28_33'] = ((df['P0YTENHHD'] - df['P5YTENHHD']) / df['P5YTENHHD']) * 100
        result_df['TOTAL_HH_DELTA_23_33'] = ((df['P0YTENHHD'] - df['ECYTENHHD']) / df['ECYTENHHD']) * 100
        
        logger.info("✅ Total household delta fields calculated")
    
    # Income Delta Fields - Constant Dollars
    if all(col in df.columns for col in ['ECYHRIAVG', 'P5YHRIAVG']):
        result_df['INCOME_AVG_CONS_DELTA_23_28'] = ((df['P5YHRIAVG'] - df['ECYHRIAVG']) / df['ECYHRIAVG']) * 100
        
    if all(col in df.columns for col in ['ECYHRIMED', 'P5YHRIMED']):
        result_df['INCOME_MED_CONS_DELTA_23_28'] = ((df['P5YHRIMED'] - df['ECYHRIMED']) / df['ECYHRIMED']) * 100
        
    if all(col in df.columns for col in ['ECYHRIAGG', 'P5YHRIAGG']):
        result_df['INCOME_AGG_CONS_DELTA_23_28'] = ((df['P5YHRIAGG'] - df['ECYHRIAGG']) / df['ECYHRIAGG']) * 100
    
    # Income Delta Fields - Current Dollars
    if all(col in df.columns for col in ['ECYHNIAVG', 'P5YHNIAVG']):
        result_df['INCOME_AVG_CURR_DELTA_23_28'] = ((df['P5YHNIAVG'] - df['ECYHNIAVG']) / df['ECYHNIAVG']) * 100
        
    if all(col in df.columns for col in ['ECYHNIMED', 'P5YHNIMED']):
        result_df['INCOME_MED_CURR_DELTA_23_28'] = ((df['P5YHNIMED'] - df['ECYHNIMED']) / df['ECYHNIMED']) * 100
        
    if all(col in df.columns for col in ['ECYHNIAGG', 'P5YHNIAGG']):
        result_df['INCOME_AGG_CURR_DELTA_23_28'] = ((df['P5YHNIAGG'] - df['ECYHNIAGG']) / df['ECYHNIAGG']) * 100
    
    logger.info("✅ Income delta fields calculated")
    
    # =================================================================
    # COMPOSITE INDEX 1: HOT GROWTH MARKETS
    # =================================================================
    
    logger.info("Calculating Hot Growth Markets Index...")
    
    if all(col in result_df.columns for col in ['OWNERSHIP_DELTA_23_28', 'OWNERSHIP_DELTA_28_33', 'OWNERSHIP_DELTA_23_33', 'RENTAL_DELTA_23_28', 'TOTAL_HH_DELTA_23_28']):
        hot_growth_score = (
            (result_df['OWNERSHIP_DELTA_23_28'] * 0.3) +      # 30% weight on 5-year ownership shift
            (result_df['OWNERSHIP_DELTA_28_33'] * 0.2) +      # 20% weight on next 5-year ownership shift
            (result_df['OWNERSHIP_DELTA_23_33'] * 0.2) +      # 20% weight on total 10-year ownership shift
            (-result_df['RENTAL_DELTA_23_28'] * 0.15) +       # 15% weight on rental decline (negative = good)
            (result_df['TOTAL_HH_DELTA_23_28'] * 0.15)        # 15% weight on household growth
        ) * 5  # Scale to reasonable range
        
        # Normalize to 0-100 scale
        result_df['HOT_GROWTH_INDEX'] = np.clip(hot_growth_score + 50, 0, 100)
        
        logger.info("✅ Hot Growth Markets Index calculated")
    else:
        logger.warning("⚠️ Missing fields for Hot Growth Markets Index")
    
    # =================================================================
    # COMPOSITE INDEX 2: NEW HOME OWNER INDEX
    # =================================================================
    
    logger.info("Calculating New Home Owner Index...")
    
    if all(col in df.columns for col in ['ECYMTN1524', 'ECYMTN2534', 'ECYTENHHD', 'ECYTENRENT']):
        # Calculate young maintainer concentration
        result_df['YOUNG_MAINTAINERS_PCT'] = ((df['ECYMTN1524'] + df['ECYMTN2534']) / df['ECYTENHHD']) * 100
        
        # Calculate rental market size
        result_df['RENTAL_MARKET_PCT'] = (df['ECYTENRENT'] / df['ECYTENHHD']) * 100
        
        # New Home Owner Index calculation
        index_components = [
            (result_df['YOUNG_MAINTAINERS_PCT'] * 0.3),  # 30% weight on young demographics
            (result_df['RENTAL_MARKET_PCT'] * 0.2)       # 20% weight on rental market size
        ]
        
        # Add income growth components if available
        if 'INCOME_AVG_CONS_DELTA_23_28' in result_df.columns:
            index_components.append(result_df['INCOME_AVG_CONS_DELTA_23_28'] * 0.2)  # 20% weight on real income growth
        if 'INCOME_MED_CONS_DELTA_23_28' in result_df.columns:
            index_components.append(result_df['INCOME_MED_CONS_DELTA_23_28'] * 0.15)  # 15% weight on median real income growth
        if 'INCOME_AVG_CURR_DELTA_23_28' in result_df.columns:
            index_components.append(result_df['INCOME_AVG_CURR_DELTA_23_28'] * 0.15)  # 15% weight on nominal income growth
        
        new_homeowner_score = sum(index_components)
        result_df['NEW_HOMEOWNER_INDEX'] = np.clip(new_homeowner_score, 0, 100)
        
        logger.info("✅ New Home Owner Index calculated")
    else:
        logger.warning("⚠️ Missing fields for New Home Owner Index")
    
    # =================================================================
    # COMPOSITE INDEX 3: HOUSING AFFORDABILITY INDEX (LIMITED)
    # =================================================================
    
    logger.info("Calculating Housing Affordability Index...")
    
    # Note: Most spending fields (HSSH*) are not available in dataset
    # Creating a simplified affordability index with available data
    
    if all(col in df.columns for col in ['ECYHRIAVG', 'ECYHRIMED']):
        # Income-based affordability proxy
        # Higher income = better affordability
        # Use income relative to national/regional averages
        
        national_avg_income = df['ECYHRIAVG'].median()  # Use median as proxy for national average
        national_med_income = df['ECYHRIMED'].median()
        
        income_affordability_avg = (df['ECYHRIAVG'] / national_avg_income) * 50  # Scale to 0-100
        income_affordability_med = (df['ECYHRIMED'] / national_med_income) * 50
        
        # Combine average and median income affordability
        result_df['HOUSING_AFFORDABILITY_INDEX'] = np.clip(
            (income_affordability_avg * 0.6) + (income_affordability_med * 0.4), 
            0, 100
        )
        
        # Add component fields
        result_df['RELATIVE_INCOME_AVG'] = income_affordability_avg
        result_df['RELATIVE_INCOME_MED'] = income_affordability_med
        
        logger.info("✅ Housing Affordability Index calculated (income-based proxy)")
        logger.warning("⚠️ Limited affordability calculation - spending data not available")
    else:
        logger.warning("⚠️ Missing fields for Housing Affordability Index")
    
    # =================================================================
    # SUMMARY STATISTICS
    # =================================================================
    
    new_fields = []
    for col in result_df.columns:
        if col not in df.columns:
            new_fields.append(col)
    
    logger.info(f"✅ Created {len(new_fields)} new calculated fields:")
    for field in sorted(new_fields):
        logger.info(f"  - {field}")
    
    return result_df

def main():
    """Main execution function"""
    
    # Input and output paths
    input_path = "/Users/voldeck/code/mpiq-ai-chat/projects/housing_2025/microservice_package/data/training_data.csv"
    output_path = "/Users/voldeck/code/mpiq-ai-chat/projects/housing_2025/microservice_package/data/training_data_with_indexes.csv"
    
    # Create backup
    backup_path = f"{input_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    try:
        logger.info(f"Loading dataset from {input_path}")
        df = pd.read_csv(input_path)
        logger.info(f"Loaded {len(df)} records with {len(df.columns)} fields")
        
        # Create backup
        df.to_csv(backup_path, index=False)
        logger.info(f"Backup created at {backup_path}")
        
        # Calculate indexes
        enhanced_df = calculate_composite_indexes(df)
        
        # Save enhanced dataset
        enhanced_df.to_csv(output_path, index=False)
        logger.info(f"Enhanced dataset saved to {output_path}")
        logger.info(f"Final dataset: {len(enhanced_df)} records with {len(enhanced_df.columns)} fields")
        
        # Replace original file
        enhanced_df.to_csv(input_path, index=False)
        logger.info(f"Original file updated with composite indexes")
        
        # Generate summary report
        generate_summary_report(df, enhanced_df, output_path)
        
        return True
        
    except Exception as e:
        logger.error(f"Error calculating composite indexes: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

def generate_summary_report(original_df: pd.DataFrame, enhanced_df: pd.DataFrame, output_path: str):
    """Generate a summary report of the calculations"""
    
    new_fields = [col for col in enhanced_df.columns if col not in original_df.columns]
    
    report_path = output_path.replace('.csv', '_report.md')
    
    with open(report_path, 'w') as f:
        f.write("# Housing Composite Indexes Calculation Report\n\n")
        f.write(f"**Generated**: {datetime.now().isoformat()}\n\n")
        f.write(f"**Original Dataset**: {len(original_df)} records, {len(original_df.columns)} fields\n")
        f.write(f"**Enhanced Dataset**: {len(enhanced_df)} records, {len(enhanced_df.columns)} fields\n")
        f.write(f"**New Fields Added**: {len(new_fields)}\n\n")
        
        f.write("## New Calculated Fields\n\n")
        
        # Group fields by category
        categories = {
            'Ownership Delta Fields': [f for f in new_fields if 'OWNERSHIP_DELTA' in f or 'OWNERSHIP_PCT' in f],
            'Rental Delta Fields': [f for f in new_fields if 'RENTAL_DELTA' in f or 'RENTAL_PCT' in f],
            'Household Growth Fields': [f for f in new_fields if 'TOTAL_HH_DELTA' in f],
            'Income Delta Fields': [f for f in new_fields if 'INCOME_' in f and 'DELTA' in f],
            'Composite Indexes': [f for f in new_fields if 'INDEX' in f],
            'Supporting Fields': [f for f in new_fields if f not in sum([
                [f for f in new_fields if 'OWNERSHIP_DELTA' in f or 'OWNERSHIP_PCT' in f],
                [f for f in new_fields if 'RENTAL_DELTA' in f or 'RENTAL_PCT' in f],
                [f for f in new_fields if 'TOTAL_HH_DELTA' in f],
                [f for f in new_fields if 'INCOME_' in f and 'DELTA' in f],
                [f for f in new_fields if 'INDEX' in f]
            ], [])]
        }
        
        for category, fields in categories.items():
            if fields:
                f.write(f"### {category}\n")
                for field in sorted(fields):
                    # Calculate basic statistics
                    if field in enhanced_df.columns:
                        field_data = enhanced_df[field].dropna()
                        if len(field_data) > 0:
                            f.write(f"- **{field}**: min={field_data.min():.2f}, max={field_data.max():.2f}, mean={field_data.mean():.2f}\n")
                        else:
                            f.write(f"- **{field}**: No data\n")
                f.write("\n")
        
        f.write("## Index Summary\n\n")
        
        # Hot Growth Markets Index
        if 'HOT_GROWTH_INDEX' in enhanced_df.columns:
            hgi_data = enhanced_df['HOT_GROWTH_INDEX'].dropna()
            f.write(f"### Hot Growth Markets Index\n")
            f.write(f"- **Records with data**: {len(hgi_data)}\n")
            f.write(f"- **Range**: {hgi_data.min():.2f} - {hgi_data.max():.2f}\n")
            f.write(f"- **Mean**: {hgi_data.mean():.2f}\n")
            f.write(f"- **Top 10% threshold**: {hgi_data.quantile(0.9):.2f}\n\n")
        
        # New Home Owner Index
        if 'NEW_HOMEOWNER_INDEX' in enhanced_df.columns:
            nhi_data = enhanced_df['NEW_HOMEOWNER_INDEX'].dropna()
            f.write(f"### New Home Owner Index\n")
            f.write(f"- **Records with data**: {len(nhi_data)}\n")
            f.write(f"- **Range**: {nhi_data.min():.2f} - {nhi_data.max():.2f}\n")
            f.write(f"- **Mean**: {nhi_data.mean():.2f}\n")
            f.write(f"- **Top 10% threshold**: {nhi_data.quantile(0.9):.2f}\n\n")
        
        # Housing Affordability Index
        if 'HOUSING_AFFORDABILITY_INDEX' in enhanced_df.columns:
            hai_data = enhanced_df['HOUSING_AFFORDABILITY_INDEX'].dropna()
            f.write(f"### Housing Affordability Index\n")
            f.write(f"- **Records with data**: {len(hai_data)}\n")
            f.write(f"- **Range**: {hai_data.min():.2f} - {hai_data.max():.2f}\n")
            f.write(f"- **Mean**: {hai_data.mean():.2f}\n")
            f.write(f"- **Top 10% threshold**: {hai_data.quantile(0.9):.2f}\n\n")
    
    logger.info(f"Summary report generated: {report_path}")

if __name__ == "__main__":
    success = main()
    if success:
        logger.info("🎉 Composite indexes calculation completed successfully!")
    else:
        logger.error("❌ Composite indexes calculation failed")
        exit(1)