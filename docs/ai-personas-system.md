# AI Personas System

## Overview
The AI Personas system allows users to select different analytical perspectives when querying geospatial data. Each persona represents a distinct approach to data analysis, with specialized prompts and focus areas tailored to different business roles and decision-making contexts.

## Persona Definitions

### 1. Strategist
**Focus**: High-level market insights, competitive positioning, and long-term growth opportunities
- Emphasizes market trends, competitive landscapes, and strategic implications
- Provides executive-level summaries with actionable strategic recommendations
- Focuses on broader market patterns and business implications

### 2. Tactician  
**Focus**: Operational efficiency, resource allocation, and tactical implementation
- Emphasizes practical execution and operational optimization
- Provides specific, actionable recommendations for immediate implementation
- Focuses on resource deployment and tactical decision-making

### 3. Creative
**Focus**: Innovation opportunities, emerging trends, and creative solutions
- Emphasizes unique insights, creative interpretations, and innovative approaches
- Provides inspiration for new product ideas or marketing campaigns
- Focuses on unconventional patterns and creative opportunities

### 4. Product Specialist
**Focus**: Product development, feature optimization, and user experience insights
- Emphasizes product-market fit, feature performance, and user behavior patterns
- Provides recommendations for product development and optimization
- Focuses on user needs and product enhancement opportunities

### 5. Customer Advocate
**Focus**: Customer satisfaction, experience optimization, and service improvements
- Emphasizes customer needs, pain points, and satisfaction drivers
- Provides recommendations for improving customer experience
- Focuses on customer-centric insights and service optimization

## Technical Implementation

### Current State
- Single prompt system using `app/api/claude/generate-response/route.ts`
- Unified system prompt for all analysis types
- Basic analysis type detection (correlation, thematic, joint, etc.)

### Planned Architecture

#### 1. Persona Selection UI
- **Location**: Persona button in first button row of query UI
- **Component**: Dialog with 5 persona options
- **Display**: Persona name + Focus description
- **State Management**: Selected persona stored in component state

#### 2. Prompt System Architecture
```
app/api/claude/
├── generate-response/
│   └── route.ts (main handler)
├── prompts/
│   ├── strategist.ts
│   ├── tactician.ts  
│   ├── creative.ts
│   ├── product-specialist.ts
│   └── customer-advocate.ts
└── shared/
    └── base-prompt.ts (common elements)
```

#### 3. Prompt Structure
Each persona prompt file will export:
- `systemPrompt`: Core persona-specific instructions
- `taskInstructions`: Analysis approach guidelines
- `responseFormat`: Output formatting preferences
- `focusAreas`: Key analytical priorities

#### 4. Integration Points
- **Request Metadata**: Include selected persona in request payload
- **Route Handler**: Load appropriate prompt based on persona selection
- **Response Processing**: Apply persona-specific formatting and emphasis

### Implementation Phases

#### Phase 1: Foundation & Prompt Development ✅
**Goal**: Create the core prompt system architecture and specialized persona prompts
- ✅ Analyze existing `route.ts` prompts to understand current system
- ✅ Create `app/api/claude/prompts/` directory structure
- ✅ Develop specialized prompt files for each persona:
  - ✅ `strategist.ts` - Market insights and competitive positioning
  - ✅ `tactician.ts` - Operational efficiency and resource allocation  
  - ✅ `creative.ts` - Innovation and emerging trends
  - ✅ `product-specialist.ts` - Product development and UX insights
  - ✅ `customer-advocate.ts` - Customer satisfaction and experience
- ✅ Create `shared/base-prompt.ts` for common elements
- ✅ Ensure prompts work with existing analysis types (correlation, thematic, joint, etc.)
- ✅ Create `index.ts` with persona registry and metadata for UI integration

**Phase 1 Accomplishments:**
- Created complete prompt system architecture with 5 specialized personas
- Each persona has unique system prompts, task instructions, and response formatting
- Established shared base prompt elements for consistency across personas
- Built persona registry system for dynamic loading and UI integration
- Added metadata with icons and colors for UI display
- Ensured compatibility with existing analysis types (correlation, thematic, joint, etc.)
- Ready for API integration in Phase 2

#### Phase 2: API Integration ✅
**Goal**: Integrate persona system into the API route handler
- ✅ Modify `route.ts` to accept persona parameter
- ✅ Add prompt loading logic based on selected persona
- ✅ Update system prompt construction to use persona-specific prompts
- ✅ Maintain backward compatibility with existing requests
- ✅ Test API functionality with different persona selections

**Phase 2 Accomplishments:**
- Successfully integrated persona system into the main API route handler
- Added persona parameter to RequestBody interface and request parsing
- Implemented dynamic persona loading with error handling and fallback
- Updated system prompt construction to use persona-specific prompts instead of hardcoded content
- Added analysis type-aware task instructions for each persona
- Maintained full backward compatibility - existing requests work without persona parameter
- Added comprehensive logging for persona selection and loading
- Ready for UI implementation in Phase 3

#### Phase 3: UI Implementation ⏳
**Goal**: Create the user interface for persona selection
- Implement persona selection dialog component
- Add persona state management to query UI
- Update request building to include selected persona
- Ensure proper integration with existing query flow
- Add visual indicators for selected persona

#### Phase 4: Testing & Validation ✅
**Goal achieved**: Persona-loader unit tests and API-level integration tests ensure:
- Each registered persona loads correctly with required fields.
- `generate-response` route forwards the proper persona prompt (with Anthropic client stub).
- Graceful fallback to the default persona on invalid ID.

#### Phase 5: Documentation & Deployment 🚀  *(monitoring & feedback steps intentionally skipped)*
**Focus**: Ship the feature with clear guidance for users and developers.

1. **User-Facing Docs:**
   - Update the main product README and in-app help to explain persona selection and appropriate use cases.
   - Include a quick-start table mapping each persona → best-fit business questions.

2. **Developer Docs:**
   - `docs/ai-personas-extension.md` (new) – how to add or tweak personas, file structure overview, testing checklist.
   - Code samples for: adding new prompt file, registering in `personaRegistry`, extending UI metadata.

3. **Deployment Tasks:**
   - Ensure environment variable `PERSONA_DEFAULT=strategist` is set (optional override).
   - Roll updated API route and prompts to staging → prod.
   - Smoke-test the live endpoint with at least one request per persona (script `scripts/smoke-test-personas.ts`).

4. **Release Notes:**
   - Add entry in `CHANGELOG.md` under *vNext* with feature summary and migration pointers.

*Skipped:* real-time monitoring dashboards and user-feedback loop will be handled in a later iteration.

### Implementation Steps (Detailed)

1. **Create Personas Reference** ✅
   - Document persona definitions and focus areas
   - Define technical architecture

2. **Create Prompt Files**
   - Develop specialized prompts for each persona
   - Ensure consistent base functionality across all personas

3. **Update UI Components**
   - Implement persona selection dialog
   - Add persona state management
   - Update request building to include persona

4. **Modify API Route**
   - Add prompt loading logic based on persona
   - Update system prompt construction
   - Maintain backward compatibility

5. **Testing & Validation**
   - Test each persona with various query types
   - Validate response quality and consistency
   - Ensure proper fallback behavior

## Usage Flow

1. User clicks "Persona" button in query interface
2. Dialog opens showing 5 persona options with focus descriptions
3. User selects desired persona (or keeps default)
4. Selected persona is included in analysis request metadata
5. API route loads appropriate prompt configuration
6. Analysis is performed with persona-specific approach
7. Response reflects chosen persona's analytical perspective

## Benefits

- **Tailored Analysis**: Each persona provides specialized insights relevant to specific roles
- **Improved Relevance**: Users get analysis that matches their decision-making context
- **Enhanced User Experience**: Clear persona definitions help users choose the right analytical approach
- **Scalable Architecture**: Easy to add new personas or modify existing ones
- **Consistent Quality**: Specialized prompts ensure high-quality, role-appropriate analysis

## Future Enhancements

- **Persona Learning**: Track which personas work best for different query types
- **Custom Personas**: Allow users to create custom personas for specific use cases
- **Persona Combinations**: Enable hybrid approaches combining multiple persona perspectives
- **Context Awareness**: Automatically suggest personas based on query content or user behavior 