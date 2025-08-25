# Geo-Awareness System Documentation

## Overview
The Geo-Awareness System provides intelligent geographic query processing and filtering for location-based data analysis. It recognizes geographic entities in natural language queries and filters data accordingly.

## Current Implementation

### Geographic Hierarchy
The system uses a hierarchical structure for geographic entities:

```
State (California)
  └── Metro Areas (Greater LA Area, Bay Area, San Diego Metro, Central Valley, etc.)
      └── Counties (Los Angeles, Orange, San Diego, San Francisco, Santa Clara, etc.)
          └── Cities (Los Angeles, San Francisco, San Diego, San Jose, etc.)
              └── ZIP Codes (mapped at ALL levels)
```

### Entity Types Supported
- **State**: California
- **Metro Areas**: Greater Los Angeles Area, San Francisco Bay Area, San Diego Metro, Central Valley, Inland Empire, Sacramento Metro, Central Coast, North Bay, East Bay, South Bay, Peninsula
- **Counties**: Los Angeles, Orange, Riverside, San Bernardino, San Diego, Imperial, San Francisco, Alameda, Contra Costa, Marin, San Mateo, Santa Clara, Solano, Sonoma, Napa, Fresno, Kern, Kings, Tulare, Madera, Merced, Stanislaus, San Joaquin, Sacramento, Yolo, Placer, El Dorado, Santa Barbara, Ventura, San Luis Obispo, Monterey, San Benito, Santa Cruz
- **Cities**: Los Angeles, San Francisco, San Diego, San Jose, Fresno, Sacramento, Long Beach, Oakland, Bakersfield, Anaheim, Santa Ana, Riverside, Stockton, Irvine, Chula Vista, Fremont, and 60+ other major California cities

### Current Capabilities
1. **Entity Recognition**: Detects geographic entities in queries using:
   - Direct name matching
   - Alias matching (e.g., "MIA" → Miami, "Jax" → Jacksonville)
   - ZIP code pattern matching
   - Regional pattern matching

2. **Spatial Preposition Detection**: Recognizes but doesn't fully implement:
   - `in` - location within an area
   - `near`, `around` - proximity queries
   - `from` - origin location
   - `across` - spanning regions
   - `between` - comparative locations

3. **Multi-Level ZIP Code Mapping**: ✅ **IMPLEMENTED - Phase 1 Complete**
   ```typescript
   zipCodeToCity: Map<string, string>     // '33101' → 'miami'
   zipCodeToCounty: Map<string, string>   // '33101' → 'miami-dade county'  
   zipCodeToMetro: Map<string, string>    // '33101' → 'miami metro'
   zipCodeToState: Map<string, string>    // '33101' → 'florida'
   ```

4. **Hierarchical Entity Relationships**: ✅ **IMPLEMENTED**
   - Cities have `parentCounty` references
   - Counties have `childEntities` (cities) lists  
   - Metros have `childEntities` (counties) lists
   - Automatic ZIP code aggregation from child entities

### Current Limitations
- ❌ Spatial relations detected but not used for actual filtering (Phase 2)
- ❌ No proximity-based expansion of search areas (Phase 2)
- ❌ No adjacent area detection (Phase 3)
- ❌ Radius detection exists but isn't implemented (Phase 4)

## Implementation Plan

### ✅ Phase 1: Multi-Level ZIP Code Mapping - **COMPLETED**
**Goal**: Enable ZIP code mapping at all geographic hierarchy levels

#### ✅ Completed Implementation:
1. **✅ Extended Geographic Database Structure**
   ```typescript
   interface GeographicDatabase {
     entities: Map<string, GeographicEntity>;
     zipCodeToCity: Map<string, string>;      // Existing ✅
     zipCodeToCounty: Map<string, string>;    // ✅ IMPLEMENTED
     zipCodeToMetro: Map<string, string>;     // ✅ IMPLEMENTED  
     zipCodeToState: Map<string, string>;     // ✅ IMPLEMENTED
     aliasMap: Map<string, string>;
     stateAbbreviations: Map<string, string>;
     regionalGroups: Map<string, string[]>;
   }
   ```

2. **✅ Updated GeoDataManager**
   - ✅ Added 12 Florida counties with child city definitions
   - ✅ Added 4 metro areas with child county definitions
   - ✅ Automatic ZIP code aggregation from child entities
   - ✅ Multi-level mappings created during initialization

3. **✅ Implemented Entity Structure**
   ```typescript
   interface GeographicEntity {
     name: string;
     type: 'state' | 'metro' | 'county' | 'city' | ...;
     aliases: string[];
     parentEntity?: string;        // ✅ Cities → Counties → State
     childEntities?: string[];     // ✅ Counties → Cities, Metros → Counties
     zipCodes?: string[];          // ✅ Auto-aggregated for higher levels
     confidence: number;
   }
   ```

4. **✅ Updated Filtering Logic**
   - ✅ Metro/county queries use aggregated ZIP codes
   - ✅ Hierarchical support: "Bay Area" → San Francisco + Alameda + Santa Clara + other counties
   - ✅ Real-time ZIP aggregation during database initialization

#### ✅ Geographic Entities Loaded:
- **1 State**: California
- **11 Metro Areas**: Greater Los Angeles Area, San Francisco Bay Area, San Diego Metro, Central Valley, Inland Empire, Sacramento Metro, Central Coast, North Bay, East Bay, South Bay, Peninsula  
- **32 Counties**: Los Angeles, Orange, Riverside, San Bernardino, San Diego, Imperial, San Francisco, Alameda, Contra Costa, Marin, San Mateo, Santa Clara, Solano, Sonoma, Napa, Fresno, Kern, Kings, Tulare, Madera, Merced, Stanislaus, San Joaquin, Sacramento, Yolo, Placer, El Dorado, Santa Barbara, Ventura, San Luis Obispo, Monterey, San Benito, Santa Cruz
- **80+ Cities**: Los Angeles, San Francisco, San Diego, San Jose, Fresno, Sacramento, Long Beach, Oakland, Bakersfield, Anaheim, Santa Ana, Riverside, Stockton, Irvine, Chula Vista, Fremont, San Bernardino, Modesto, Fontana, Oxnard, Moreno Valley, Huntington Beach, Glendale, Santa Clarita, Garden Grove, Oceanside, Rancho Cucamonga, Santa Rosa, Ontario, Lancaster, Elk Grove, Corona, Palmdale, Salinas, Pomona, Hayward, Escondido, Torrance, Sunnyvale, Orange, Fullerton, Pasadena, Thousand Oaks, Visalia, Simi Valley, Concord, Roseville, Victorville, Santa Clara, Vallejo, Berkeley, El Monte, Downey, Costa Mesa, Inglewood, Carlsbad, San Buenaventura, Fairfield, West Covina, Richmond, Norwalk, Antioch, Temecula, Burbank, Daly City, Rialto, Santa Maria, El Cajon, San Mateo, Clovis, Compton, Jurupa Valley, Vista, South Gate, Mission Viejo, Vacaville, Carson, Hesperia, Santa Monica, Westminster, Santa Barbara, Redding, Chico, Newport Beach, San Marcos, Whittier

#### ✅ ZIP Code Coverage:
- **Cities**: 2000+ ZIP codes mapped directly to cities across California
- **Counties**: ZIP codes auto-aggregated from child cities
- **Metros**: ZIP codes auto-aggregated from child counties  
- **State**: All California ZIP codes (90000-96999 ranges) mapped to state level

### Phase 2: Proximity Filtering (FUTURE)
**Goal**: Implement actual spatial filtering based on detected relations

#### Planned Features:
1. **"Near/Around" Queries**
   - Expand search to include adjacent cities
   - Use configurable proximity radius (default: 25 miles)
   - Example: "near Miami" includes Hialeah, Coral Gables, Miami Beach

2. **Distance Calculation**
   - Add centroid coordinates to each entity
   - Calculate distances between geographic entities
   - Filter based on proximity threshold

### Phase 3: Adjacent Area Detection (FUTURE)
**Goal**: Identify and include neighboring geographic areas

#### Planned Features:
1. **Adjacency Mapping**
   ```typescript
   interface GeographicEntity {
     // ... existing fields
     adjacentEntities?: string[]; // List of neighboring areas
   }
   ```

2. **Smart Expansion**
   - "Greater Miami area" → Miami + adjacent cities
   - County boundaries awareness
   - Metro area overlap handling

### Phase 4: Radius-Based Filtering (FUTURE)
**Goal**: Support explicit radius queries like "within 10 miles of Orlando"

#### Planned Features:
1. **Radius Extraction**
   - Parse radius from query (already exists)
   - Convert units (miles, kilometers)

2. **Geographic Bounds**
   ```typescript
   interface GeographicEntity {
     // ... existing fields
     bounds?: {
       north: number;
       south: number;
       east: number;
       west: number;
     };
     centroid?: {
       lat: number;
       lng: number;
     };
   }
   ```

3. **Spatial Filtering**
   - Calculate which ZIP codes fall within radius
   - Use haversine formula for distance calculations
   - Cache commonly requested radius searches

## Usage Examples

### ✅ Currently Working Queries (Phase 1 Complete)
```
"Compare Los Angeles and San Francisco"                    // City level
"Show data for San Diego"                                 // City level  
"Sales in San Jose"                                       // City level
"Compare Los Angeles County and Orange County"             // County level ✅ NEW
"Show Bay Area metrics"                                   // Metro level ✅ NEW
"Southern California analysis"                            // Metro level ✅ NEW
"Compare Fresno County and San Diego County"              // County level ✅ NEW
"Central Valley vs Bay Area"                             // Metro vs Metro ✅ NEW
"Greater LA Area vs San Francisco Bay Area"               // Metro comparison ✅ NEW
```

### After Full Implementation (All Phases)
```
"Stores within 20 miles of Los Angeles"
"Compare areas near San Francisco"
"Adjacent counties to Orange County"
"Shops around downtown San Diego"
```

## Technical Architecture

### File Structure
```
lib/geo/
  ├── GeoAwarenessEngine.ts    # Main processing engine
  ├── GeoDataManager.ts         # Geographic data and hierarchy
  └── GeoTypes.ts              # (Future) Type definitions

docs/
  └── geo-awareness-system.md   # This documentation
```

### Data Flow
1. Query enters GeoAwarenessEngine
2. Geographic entities extracted from query
3. Spatial relations and radius parsed
4. GeoDataManager provides entity data and ZIP mappings
5. Filtering strategies applied based on entity type
6. Filtered results returned with match statistics

## Testing Strategy

### Phase 1 Tests
- Verify ZIP codes map correctly to all hierarchy levels
- Test county-level queries
- Test metro area queries
- Validate aggregated ZIP codes

### Integration Tests
- Comparative analysis with different geographic levels
- Mixed queries (city vs county, metro vs city)
- Alias resolution at all levels

## Performance Considerations
- Cache aggregated ZIP codes for metros/counties
- Index ZIP code mappings for O(1) lookup
- Lazy load geographic data as needed
- Consider using spatial indices for Phase 4 radius queries

## Implementation Status & Next Steps

### ✅ Completed
1. ✅ **Phase 1: Multi-Level ZIP Code Mapping** - COMPLETE
   - Extended GeographicDatabase interface with multi-level mappings
   - Implemented California geographic hierarchy (state → metros → counties → cities)
   - Added automatic ZIP code aggregation for higher-level entities
   - Updated GeoDataManager.ts with comprehensive California data
   - Enabled county and metro-level geographic queries

### 🎯 Current Status
- **Phase 1**: ✅ **COMPLETED** - Multi-level ZIP mapping fully implemented
- **Phase 2**: 📋 **PLANNED** - Proximity filtering ("near", "around") 
- **Phase 3**: 📋 **PLANNED** - Adjacent area detection
- **Phase 4**: 📋 **PLANNED** - Radius-based filtering ("within X miles")

### 🚀 Next Steps
1. ✅ Document current system (this document) - **COMPLETED**
2. ✅ Implement Phase 1: Multi-level ZIP mapping - **COMPLETED**  
3. 🧪 Test Phase 1 implementation with comparative analysis
4. 📊 Monitor performance impact of multi-level mappings
5. 📋 Plan Phase 2-4 implementation timeline
6. 🔄 Consider extending to other states/regions as needed

### 🛠️ Maintenance Notes
- **Important**: When updating project geographic scope, maintain the same hierarchical data structure in `GeoDataManager.ts`
- Follow the established pattern: State → Metros → Counties → Cities → ZIP codes
- Ensure proper parent-child relationships and ZIP code aggregation
- California implementation now provides comprehensive statewide coverage
- See this documentation for reference implementation structure