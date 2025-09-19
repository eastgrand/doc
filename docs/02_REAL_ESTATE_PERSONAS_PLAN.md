# Real Estate Personas Implementation Plan

## Overview

Create a housing-specific personas system similar to the prompts approach - a separate personas file that can be easily switched based on project type.

## Implementation Strategy

### 1. File Structure (Mirror Prompts Approach)

- **Keep existing**: `/app/api/claude/shared/personas.ts` (business/retail personas)
- **Create new**: `/app/api/claude/shared/housing-personas.ts` (real estate personas)
- **Switch at API level**: housing-generate-response uses housing-personas, generate-response uses business personas

### 2. Proposed Real Estate Personas

#### Core Real Estate Personas

1. **Real Estate Broker/Agent** - Primary user, needs market insights for client advisory
2. **Homebuyer** - Individual/family looking to purchase residential property
3. **Home Seller** - Property owner looking to sell, needs pricing and timing guidance
4. **Real Estate Team CEO/Manager** - Leadership needing market overview and team strategy

#### Additional Specialized Personas (Optional)

5. **First-Time Homebuyer** - Specific needs around affordability and guidance
6. **Property Appraiser** - Needs detailed market comparables and valuation factors
7. **Mortgage Loan Officer** - Focuses on affordability and financing considerations

## Key Differences from Business Personas

### Terminology Shifts

- **Market expansion** → **Market opportunities for clients**
- **Customer acquisition** → **Client advisory and transactions**
- **Brand positioning** → **Neighborhood characteristics**
- **Competitive analysis** → **Market comparison analysis**
- **Strategic investment** → **Market timing and opportunities**

### Focus Areas

- **Affordability analysis** using HOUSING_AFFORDABILITY_INDEX
- **Market timing** for buying/selling decisions
- **Neighborhood insights** for client advisory
- **Price trends** and market health indicators
- **First-time buyer opportunities** using NEW_HOMEOWNER_INDEX
- **Market momentum** using HOT_GROWTH_INDEX

## Implementation Steps

1. **Create housing-personas.ts** with real estate-focused personas
2. **Update housing-generate-response API** to import housing personas
3. **Update persona detection logic** to use housing personas in housing API
4. **Test persona switching** between business and housing projects
5. **Document switching process** in automation plan

## Questions for Discussion

- Should we include property management personas?
- Do we need investor personas separate from broker personas?
- Should appraiser and loan officer be included or focus on core 4?
- Any Quebec-specific real estate roles to consider?
