# Analysis-Driven Clustering Feature Plan

**Date**: January 2025  
**Status**: 📋 **PLANNING**  
**Feature**: Campaign Territory Clustering via Analysis Results  
**Priority**: High - Addresses real business need for campaign-scale insights

---

## **🎯 Overview**

Transform individual zip code analysis into campaign territory planning by clustering areas based on analysis results. Users can group similar areas into meaningful territories for marketing and advertising campaigns.

**Core Concept**: Use the selected analysis endpoint (strategic, competitive, demographic) as the clustering method, combined with geographic proximity and user-defined parameters.

---

## **📋 Business Requirements**

### **Primary Goals**

- ✅ **Campaign-Scale Planning**: Results suitable for real marketing campaigns
- ✅ **Analysis-Driven**: Clusters based on actual analysis scores, not arbitrary geography
- ✅ **User Control**: Adjustable cluster parameters for different campaign scales
- ✅ **Geographic Coherence**: Clusters must be geographically sensible for logistics

### **User Stories**

1. **Campaign Manager**: "I need 5 strategic territories in California, each with 50K+ population"
2. **Media Planner**: "Show me competitive territories where Nike vs Adidas dynamics are similar"
3. **Marketing Director**: "Group demographic segments into viable advertising regions"

---

## **🔧 Technical Specification**

### **Clustering Algorithm: Geographic K-Means**

**Primary Algorithm**: K-means with geographic distance weighting

- **Analysis Features**: Strategic scores, competitive metrics, demographic data (80% weight)
- **Geographic Features**: Latitude/longitude proximity (20% weight)
- **Distance Constraint**: Maximum 50 miles between zip codes in same cluster

**Why Geographic K-Means:**

- ✅ **Predictable cluster count** - User specifies desired number
- ✅ **Analysis-driven** - Primary clustering based on business metrics
- ✅ **Geographic coherence** - Distance weighting prevents scattered clusters
- ✅ **Performance** - Fast enough for real-time use
- ✅ **Interpretable** - Users understand grouped similar + nearby areas

### **Distance Constraints**

**Maximum Cluster Radius**: 50 miles

- **Rationale**: Typical advertising DMA (Designated Market Area) coverage
- **Implementation**: Hard constraint - reject clusters exceeding radius
- **Fallback**: Split oversized clusters into sub-clusters

**Minimum Cluster Distance**: 10 miles between cluster centroids

- **Rationale**: Prevents overlapping campaign territories
- **Implementation**: Post-processing step to merge too-close clusters

---

## **🎨 User Interface Design**

### **Default Behavior**

- ✅ **Clustering OFF by default** - Maintains current individual zip code behavior
- ✅ **Optional enhancement** - Users explicitly enable clustering
- ✅ **Clear toggle** - Obvious on/off state

### **Cluster Configuration Panel**

```
┌─────────── 🎯 Campaign Territory Clustering ───────────┐
│ [ ] Enable clustering for campaign planning             │
│                                                         │
│ Number of Territories: [5] ────────────────── (1-20)   │
│ Min Zip Codes per Territory: [10] ─────────── (5-50)   │
│ Min Combined Population: [50,000] ─────────── (10K-1M) │
│ Max Territory Radius: [50 miles] ─────────── (20-100)  │
│                                                         │
│ Clustering Method: [Strategic Analysis Scores ▼]       │
│ • Strategic Analysis Scores                             │
│ • Competitive Analysis Scores                           │
│ • Demographic Analysis Scores                           │
│ • Analysis + Geographic Proximity (Recommended)        │
│                                                         │
│ [Preview Territories] [Apply Clustering]                │
└─────────────────────────────────────────────────────────┘
```

### **Results Display Enhancements**

- **Individual Mode** (current): Shows individual zip codes
- **Clustered Mode** (new): Shows territories with cluster boundaries
- **Toggle View**: Switch between individual and clustered visualization
- **Cluster Cards**: Summary stats for each territory

---

## **🏗️ Implementation Architecture**

### **File Structure**

```
/components/clustering/
  ├── ClusterConfigPanel.tsx      // User controls UI
  ├── ClusterPreview.tsx          // Preview territories before applying
  ├── ClusterResultsView.tsx      // Enhanced results display
  └── ClusterBoundaryLayer.tsx    // Map visualization

/lib/clustering/
  ├── algorithms/
  │   ├── geographic-kmeans.ts    // Core clustering algorithm
  │   ├── distance-constraints.ts // Geographic validation
  │   └── cluster-validation.ts   // Size/population validation
  ├── processors/
  │   ├── strategic-clustering.ts // Strategic analysis features
  │   ├── competitive-clustering.ts // Competitive features
  │   └── demographic-clustering.ts // Demographic features
  ├── utils/
  │   ├── feature-extraction.ts   // Prepare data for clustering
  │   ├── boundary-generation.ts  // Create territory polygons
  │   └── cluster-naming.ts       // Generate territory names
  └── types.ts                    // TypeScript interfaces
```

### **Core Interfaces**

```typescript
interface ClusterConfig {
  enabled: boolean;                    // Default: false
  numClusters: number;                // Default: 5, Range: 1-20
  minZipCodes: number;                // Default: 10, Range: 5-50
  minPopulation: number;              // Default: 50000, Range: 10K-1M
  maxRadiusMiles: number;             // Default: 50, Range: 20-100
  method: ClusteringMethod;           // Default: 'analysis-geographic'
}

type ClusteringMethod = 
  | 'strategic-scores'     // Strategic analysis results only
  | 'competitive-scores'   // Competitive analysis results only  
  | 'demographic-scores'   // Demographic analysis results only
  | 'analysis-geographic'; // Analysis scores + geographic proximity (recommended)

interface ClusterResult {
  clusterId: number;
  name: string;                       // "High Strategic Value Territory"
  zipCodes: string[];
  
  // Geographic properties
  centroid: [number, number];         // Center point
  boundary: GeoJSON.Polygon;          // Territory boundary
  radiusMiles: number;                // Actual radius
  
  // Aggregated metrics
  totalPopulation: number;
  averageScore: number;
  scoreRange: [number, number];       // Min/max scores in cluster
  
  // Campaign planning data
  recommendedBudget?: number;
  primaryChannels?: string[];
  keyInsights: string;                // "High income, young professionals, Nike preference"
}
```

---

## **🚀 Implementation Phases**

### **Phase 1: Core Infrastructure (Week 1)**

1. ✅ Create clustering types and interfaces
2. ✅ Implement geographic K-means algorithm with distance constraints
3. ✅ Add feature extraction for strategic/competitive/demographic endpoints
4. ✅ Create basic cluster validation (size, population, radius)

### **Phase 2: UI Integration (Week 2)**

1. ✅ Build ClusterConfigPanel component
2. ✅ Integrate with existing query pipeline
3. ✅ Add cluster toggle to analysis results
4. ✅ Implement preview functionality

### **Phase 3: Visualization Enhancement (Week 3)**

1. ✅ Create cluster boundary visualization on map
2. ✅ Add territory summary cards
3. ✅ Implement view toggle (individual vs clustered)
4. ✅ Generate automatic territory names

### **Phase 4: Campaign Features (Week 4)**

1. ✅ Add cluster-level export functionality
2. ✅ Generate campaign planning recommendations
3. ✅ Create territory comparison tools
4. ✅ Add budget and channel recommendations

---

## **🎯 User Experience Flow**

### **Default Experience (No Change)**

```
Current behavior maintained:
1. User selects analysis type
2. Enters query
3. Gets individual zip code results
4. Views, exports, asks questions as before
```

### **Clustering Experience (New Optional)**

```
Enhanced workflow:
1. User selects analysis type
2. [NEW] Enables clustering, sets parameters
3. [NEW] Previews territory boundaries (optional)
4. Enters query (same as before)
5. [NEW] Gets territory-level results + individual data
6. [NEW] Views clustered visualization
7. [NEW] Exports campaign-ready territory data
8. Asks questions about territories (enhanced)
```

---

## **📊 Success Metrics**

### **Technical Metrics**

- ✅ **Clustering Performance**: < 2 seconds for territory generation
- ✅ **Geographic Coherence**: 95%+ of clusters within radius limits
- ✅ **Territory Quality**: 90%+ of clusters meet size/population requirements

### **Business Metrics**

- ✅ **User Adoption**: 30%+ of power users enable clustering within 30 days
- ✅ **Campaign Utility**: Territory results used for actual campaign planning
- ✅ **Export Usage**: Cluster-level exports increase by 200%

### **User Experience Metrics**

- ✅ **Feature Discovery**: 80%+ of users notice clustering option
- ✅ **Understanding**: 90%+ understand territory vs individual difference
- ✅ **Satisfaction**: Positive feedback on campaign-scale insights

---

## **🚧 Edge Cases & Constraints**

### **Geographic Constraints**

- **Sparse Areas**: Rural regions may not meet population requirements
- **Urban Density**: Cities may create tiny territories with high population
- **State Boundaries**: Territories may cross state lines (acceptable for campaigns)
- **Water Bodies**: Algorithm should respect major geographic barriers

### **Data Quality**

- **Missing Scores**: Handle zip codes with incomplete analysis data
- **Outliers**: Extremely high/low scores that skew clustering
- **Population Zeros**: Zip codes with zero population (industrial areas)

### **User Error Handling**

- **Impossible Parameters**: Too many clusters for available zip codes
- **Conflicting Requirements**: High min population + small radius
- **No Valid Clusters**: All territories fail validation criteria

---

## **🔧 Configuration & Defaults**

### **Default Settings (Conservative)**

```typescript
const DEFAULT_CLUSTER_CONFIG: ClusterConfig = {
  enabled: false,                     // Maintains current behavior
  numClusters: 5,                     // Manageable number for campaigns
  minZipCodes: 10,                    // Meaningful territory size
  minPopulation: 50000,               // Viable campaign audience
  maxRadiusMiles: 50,                 // Typical DMA coverage
  method: 'analysis-geographic'       // Balanced approach
};
```

### **Recommended Settings by Use Case**

```typescript
// Large-scale brand campaigns
const BRAND_CAMPAIGN_CONFIG = {
  numClusters: 3-5,
  minPopulation: 100000,
  maxRadiusMiles: 75
};

// Regional advertising campaigns  
const REGIONAL_CAMPAIGN_CONFIG = {
  numClusters: 6-10,
  minPopulation: 25000,
  maxRadiusMiles: 35
};

// Local market testing
const LOCAL_TEST_CONFIG = {
  numClusters: 10-15,
  minPopulation: 10000,
  maxRadiusMiles: 25
};
```

---

## **📝 Development Notes**

### **Libraries & Dependencies**

- **Clustering**: Custom K-means implementation (avoid heavy ML libraries)
- **Geography**: Use existing ArcGIS geometry utilities
- **Distance**: Haversine formula for accurate geographic distance
- **Boundaries**: Convex hull algorithm for territory polygons

### **Performance Considerations**

- **Lazy Loading**: Only cluster when user enables feature
- **Caching**: Cache clustering results for repeated queries
- **Progressive**: Show clustering progress for large datasets
- **Limits**: Maximum 1000 zip codes for clustering (performance)

### **Future Enhancements**

- **Advanced Algorithms**: DBSCAN for natural territory discovery
- **Multi-Criteria**: Cluster by multiple analysis types simultaneously
- **Territory Names**: AI-generated descriptive territory names
- **Optimization**: Genetic algorithms for optimal territory boundaries

---

## **✅ Ready for Implementation**

This plan provides a complete roadmap for implementing analysis-driven clustering while maintaining backward compatibility and providing significant new business value for campaign planning.

**Next Steps**: Begin Phase 1 with core infrastructure implementation.
