# Infographics Score Integration Analysis

## Current Infographics Implementation

### How Infographics Work Currently

1. **ArcGIS GeoEnrichment Service**
   - Component: `/components/tabs/InfographicsTab.tsx`
   - Uses ArcGIS GeoEnrichment API at: `https://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver/Geoenrichment/createreport`
   - Takes a geometry (polygon drawn on map) and generates demographic reports
   - Returns PDF reports with demographic, income, and market data for that geographic area

2. **Report Types Available**
   - What's in my Neighbourhood
   - Community Demographics Report  
   - Demographic and Income
   - PRIZM Profile
   - Work and Occupation
   - Emergency Community Information
   - And more...

3. **Data Flow**
   ```
   User draws area → Geometry created → Send to ArcGIS API → Receive PDF → Display in iframe
   ```

## Endpoint Scores Already Available

Your endpoint JSON files already include comprehensive scoring! Example from `strategic-analysis.json`:

```json
{
  "strategic_value_score": 16.5,
  "competitive_advantage_score": 23.5,
  "demographic_opportunity_score": 31.5,
  "market_growth_potential": 15.5,
  "innovation_index": 11.5,
  "talent_availability_score": 14.5,
  "infrastructure_quality": 17.5,
  "business_climate_score": 28.5,
  "quality_of_life_index": 22.5,
  "cost_efficiency_score": 12.5,
  "environmental_sustainability": 8.5,
  "digital_readiness_score": 19.5,
  "education_index": 26.5,
  "healthcare_access_score": 18.5,
  "economic_diversity_score": 13.5
}
```

## Options for Including Scores in Infographics

### Option 1: Hybrid Approach (Recommended)
**Create a custom component that combines ArcGIS reports with your endpoint scores**

#### Implementation:
1. Keep the existing ArcGIS report generation for demographic data
2. Add a new section above or below the report that displays endpoint scores
3. Query your endpoints to get scores for the drawn geometry area
4. Display both together in a unified interface

#### Pros:
- Leverages existing ArcGIS demographic data
- Adds your unique scoring insights
- No need to modify ArcGIS services
- Full control over score presentation

#### Cons:
- Requires matching geometry to your data points
- Two separate data sources to manage

### Option 2: Custom Infographic Component  
**Replace ArcGIS reports entirely with custom visualizations**

#### Implementation:
1. Create custom React components for report layouts
2. Pull demographic data from your endpoints
3. Include all scores natively
4. Generate custom PDFs with your branding

#### Pros:
- Complete control over design and content
- Single data source (your endpoints)
- Can customize for your specific needs
- Better performance (no external API calls)

#### Cons:
- Lose access to ArcGIS demographic enrichment
- More development work required
- Need to handle PDF generation yourself

### Option 3: Score Overlay Only
**Keep ArcGIS reports but add a score overlay panel**

#### Implementation:
1. Continue using ArcGIS reports as-is
2. Add a floating panel or sidebar with scores
3. Update scores based on selected geometry
4. Allow toggling between report and scores

#### Pros:
- Minimal changes to existing code
- Clear separation of concerns
- Easy to implement

#### Cons:
- Less integrated user experience
- Scores not included in PDF exports

## Recommended Implementation Steps

### For Option 1 (Hybrid Approach):

1. **Create Score Fetching Service**
   ```typescript
   // /lib/services/scoreService.ts
   export async function getScoresForGeometry(geometry: __esri.Geometry) {
     // Query endpoints based on geometry bounds
     // Aggregate scores for all points within geometry
     // Return averaged or weighted scores
   }
   ```

2. **Modify Infographics Component**
   ```typescript
   // Add score display section
   const [scores, setScores] = useState(null);
   
   useEffect(() => {
     if (geometry) {
       getScoresForGeometry(geometry).then(setScores);
     }
   }, [geometry]);
   ```

3. **Create Score Display Component**
   ```typescript
   // /components/ScoreCard.tsx
   export function ScoreCard({ scores }) {
     return (
       <div className="score-grid">
         <div>Strategic Value: {scores.strategic_value_score}</div>
         <div>Market Growth: {scores.market_growth_potential}</div>
         // ... more scores
       </div>
     );
   }
   ```

4. **Integrate Both Components**
   - Display ScoreCard above the ArcGIS report iframe
   - Include scores in PDF export using html2canvas

## Quick Start Code

Here's a minimal implementation to get started:

```typescript
// In InfographicsTab.tsx or Infographics.tsx

const fetchScoresForArea = async (geometry: __esri.Geometry) => {
  try {
    // Get bounds of the drawn geometry
    const extent = (geometry as __esri.Polygon).extent;
    
    // Fetch data from your strategic-analysis endpoint
    const response = await fetch('/api/strategic-analysis');
    const data = await response.json();
    
    // Filter points within the geometry bounds
    const pointsInArea = data.results.filter(point => {
      // Check if point falls within geometry
      // You'll need to implement geometric containment check
      return geometryEngine.contains(geometry, point.geometry);
    });
    
    // Calculate average scores
    const avgScores = {
      strategic_value: average(pointsInArea.map(p => p.strategic_value_score)),
      competitive_advantage: average(pointsInArea.map(p => p.competitive_advantage_score)),
      // ... other scores
    };
    
    return avgScores;
  } catch (error) {
    console.error('Error fetching scores:', error);
    return null;
  }
};
```

## Decision Factors

**Choose Option 1 (Hybrid) if:**
- You want to keep ArcGIS demographic enrichment
- You need both demographic data and scores
- You want a quick implementation

**Choose Option 2 (Custom) if:**
- You want full control over the report design
- You have all necessary data in your endpoints
- You want to eliminate external dependencies

**Choose Option 3 (Overlay) if:**
- You need the quickest implementation
- PDF export of scores is not critical
- You want to test the concept first

## Next Steps

1. Decide which approach fits your needs
2. Test score aggregation for geographic areas
3. Design the UI for score display
4. Implement PDF export with scores if needed
5. Add score explanations and tooltips for users

## Important Considerations

- **Spatial Matching**: You'll need to match the drawn geometry with your data points
- **Score Aggregation**: Decide how to aggregate multiple scores within an area (average, weighted, max, etc.)
- **Performance**: Consider caching scores for frequently accessed areas
- **User Experience**: Make it clear what scores mean and how they relate to the demographic data