# Data Migration Quick Reference

## TL;DR - Essential Files to Update

### 1. Data Files (Replace with your data)
```
public/data/blob-urls.json                    # Update blob storage URLs
public/data/endpoints/*.json                  # 17 endpoint files (fallbacks)
public/data/microservice-all-fields.json     # Your CSV field list
```

### 2. Configuration Files (Update field mappings)
```
lib/analysis/ConfigurationManager.ts         # Endpoint configurations
lib/geo/GeoDataManager.ts                   # Geographic regions (if needed)
lib/geo/GeoAwarenessEngine.ts               # Field priorities (if needed)
```

### 3. Processors (Update field names)
```
lib/analysis/strategies/processors/          # Update field mappings in all processors
```

## Required Endpoints (17 total)

Create these JSON files with your data:
1. `strategic-analysis.json`
2. `competitive-analysis.json` 
3. `comparative-analysis.json`
4. `demographic-insights.json`
5. `correlation-analysis.json`
6. `trend-analysis.json`
7. `spatial-clusters.json`
8. `anomaly-detection.json`
9. `predictive-modeling.json`
10. `scenario-analysis.json`
11. `segment-profiling.json`
12. `sensitivity-analysis.json`
13. `feature-interactions.json`
14. `feature-importance-ranking.json`
15. `model-performance.json`
16. `outlier-detection.json`
17. `analyze.json`

## Data Format Template

```json
{
  "success": true,
  "total_records": 1000,
  "results": [
    {
      "ID": "12345",                    // REQUIRED: Geographic identifier
      "DESCRIPTION": "Area Name",       // REQUIRED: Human-readable name  
      "your_score_field": 85.5,        // Your main analysis score
      "your_metric_1": 100.2,          // Your data fields
      "your_metric_2": 75.8
    }
  ],
  "summary": "Analysis description",
  "feature_importance": [              // OPTIONAL: Feature rankings
    {"feature": "your_metric_1", "importance": 0.85},
    {"feature": "your_metric_2", "importance": 0.76}
  ]
}
```

## Migration Steps (30 minutes)

### Step 1: Prepare Data (10 min)
1. Export your data as CSV with consistent headers
2. Ensure you have geographic identifiers (ZIP codes, area IDs)
3. Create the 17 endpoint JSON files from your data

### Step 2: Upload Data (10 min)  
1. Upload large files (>10MB) to Vercel Blob Storage
2. Update `public/data/blob-urls.json` with new URLs
3. Copy files to `public/data/endpoints/` as fallbacks

### Step 3: Configure (10 min)
1. Update `public/data/microservice-all-fields.json` with your field names
2. Update `lib/analysis/ConfigurationManager.ts` endpoint configs
3. Update field mappings in processors if field names changed

## Upload Script Usage

```bash
# For large files, use blob storage
npm run upload-endpoint -- strategic-analysis
npm run upload-endpoint -- competitive-analysis
# ... repeat for each endpoint

# Test data loading
curl http://localhost:3000/api/test-endpoint/strategic-analysis
```

## Geographic Data (Optional)

Only update if your data covers different regions:

```typescript
// lib/geo/GeoDataManager.ts - Replace city definitions
{
  name: 'Your City',
  aliases: ['City Alias'],
  zipCodes: ['12345', '12346', '12347'] // Specific ZIP codes for precise boundaries
}
```

## Field Mapping Pattern

If your field names are different, update processors:

```typescript
// In each processor file
private extractScore(record: any): number {
  return Number(record.YOUR_FIELD_NAME) || 0;  // Update field name
}
```

## Testing Checklist

- [ ] Basic query: "Show me strategic analysis" 
- [ ] Geographic: "Compare City A and City B"
- [ ] Visualization renders without errors
- [ ] Data values appear correctly in tooltips

## Common Field Names

| Purpose | Current Names | Your Names |
|---------|---------------|------------|
| Main Score | `strategic_value_score` | `your_score_field` |
| Geographic ID | `ID`, `GEOID` | `your_geo_id` |
| Area Name | `DESCRIPTION` | `your_area_name` |
| Population | `TOTPOP_CY` | `your_population` |

## File Sizes

- Small files (<10MB): Store in `public/data/endpoints/`
- Large files (>10MB): Upload to Vercel Blob Storage
- Update `blob-urls.json` with blob URLs for large files

---

Need help? Check the full [DATA_MIGRATION_GUIDE.md](./DATA_MIGRATION_GUIDE.md)