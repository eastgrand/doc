# MPIQ-AI-Chat: App Architecture & Chat System Overview

> **Generated**: January 2025  
> **Purpose**: Comprehensive overview of app flow and contextual chat functionality for troubleshooting

## App Overview Summary

**MPIQ-AI-Chat** is a sophisticated geospatial analysis platform that combines natural language processing, machine learning, and interactive mapping to provide contextual business insights. The platform translates everyday questions into accurate geographic insights and visuals, spoken in the voice that best fits the user's role.

### Core Technology Stack

- **Frontend**: Next.js 14 (React, App-Router)
- **Mapping**: ArcGIS JS 4.x for map and layer rendering
- **Backend**: Node/Edge API routes (TypeScript) + Python SHAP/XGBoost micro-service
- **Data Stores**: Redis (cache), Postgres (config), Vercel Blob / S3 (feature blobs)
- **AI**: Claude 3.5 Sonnet (narrative), Claude Haiku (classification)

## Core App Flow

### 1. Query Input & Classification
- Users enter natural language queries about geographic/demographic data
- The system classifies queries into types: correlation, thematic, outlier detection, scenario analysis, etc.
- Query complexity is assessed to route to either rule-based or ML-based processing
- **File**: `/api/classify-query` determines query type and session boundaries

### 2. Two-Pass Analysis Pipeline

| Pass | Engine | Key Actions |
|------|--------|------------|
| **1 Statistical** | SHAP micro-service | Filters data, computes SHAP, returns features + terse summary |
| **2 Narrative** | Claude route | Converts same features into streamed prose (persona voice) |

### 3. AI Personas System (5 personas)

| Persona | Focus | Typical Use Cases |
|---------|-------|------------------|
| **Strategist** | Market insights and competitive positioning | Market expansion, long-term growth |
| **Tactician** | Operational efficiency and resource allocation | Day-to-day operations, efficiency |
| **Creative** | Innovation and emerging trends | New ideas, creative solutions |
| **Product Specialist** | Product development and UX insights | Product features, user experience |
| **Customer Advocate** | Customer satisfaction and experience | Customer service, satisfaction |

### 4. Visualization & Mapping
- ArcGIS JS renders interactive maps with data overlays
- `DynamicVisualizationFactory` selects appropriate chart types
- Results displayed as both narrative text and visual maps
- `VisualizationTypeIndicator` reflects the chosen visualization type

## Chat Functionality Deep Dive

### Session Management Architecture

The chat system uses **query classification-based session boundaries** rather than arbitrary limits:

#### Session Types
- **`follow-up`**: Continues current session, maintains context
- **`new-analysis`**: Starts fresh session, clears context

#### Session Lifecycle

**New Session Triggers** 🆕
- **New Analysis Query**: Different metrics, locations, or topics
- **First Query**: Empty conversation history (always new-analysis)
- **Manual Clear**: User clicks clear/reset button
- **Session Timeout**: 30 minutes of inactivity

**Session Continuation** 🔗
- **Follow-up Query**: Clarification or different perspective on existing results
- **Persona Switch**: User changes AI persona but continues same analysis topic
- **Visualization Changes**: User customizes charts/maps of current analysis

### Contextual Chat Flow

```
User Query → Query Classification → Session Decision → Context Management → Response Generation
```

#### Technical Implementation

**Core Components:**
- **ConversationMemory.ts**: Manages chat history and context
- **session-manager.ts**: Handles session lifecycle and boundaries
- **`/api/classify-query`**: Claude Haiku determines query type
- **`/api/claude/generate-response`**: Main chat endpoint with persona integration

**Memory Configuration:**
- Max 50 messages per session
- Summarization after 15 messages
- 30-minute session timeout
- Context preserved within sessions, cleared between sessions

### Session State Structure

```typescript
interface ChatSession {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  messageCount: number;
  activePersona: string;
  analysisContext: {
    type: string;
    metrics: string[];
    regions: string[];
    lastResults?: any;
  };
  conversationMemory: ConversationMemory;
}
```

### Chat-Specific Features

1. **Context-Aware Responses**: Visual badge shows when AI has conversation context
2. **SHAP Integration**: Follow-up questions can reference previous statistical analysis without re-computation
3. **Persona Continuity**: Selected AI persona maintained across appropriate session boundaries
4. **Session Boundaries**: Visual indicators show when new analysis sessions begin

### Example Session Flow

```text
[SESSION 1 - New Analysis]
User: Which areas have highest diversity and conversion rate? [Strategist]
SHAP: Richmond Hill (M2M, M2H) and Markham (L3T, L3S)…
Classification: new-analysis → Start new session

User: Why is Filipino population such a strong factor? [Same session continues]
Claude (Strategist): Based on the previous analysis... [Context maintained]
Classification: follow-up → Continue session

[SESSION 2 - New Analysis] 
User: Show me Nike brand affinity trends [Different topic]
Classification: new-analysis → Clear context, start new session
Claude: Starting fresh analysis of Nike trends... [No previous context]
```

## Implementation Status

### ✅ Completed Components
- **Conversation Memory System** - `ConversationMemory.ts` & `GeospatialConversationMemory.ts`
- **Claude Summarization API** - `/api/summarize-context` with Claude 3.5 Sonnet
- **Context-Aware UI Badge** - Visual indicator with hover tooltip
- **AI Persona System** - 5 personas with specialized prompts
- **Chat Context Providers** - React context with localStorage persistence
- **Query Classification** - `/api/classify-query` determines new vs follow-up
- **Advanced Query Types** - Outlier detection, scenario analysis, feature interactions

### 🔄 In Progress
- **Conversation Context Integration** - Adding history to Claude API calls
- **Persona Continuity** - Maintaining selected persona across chat sessions
- **Memory Configuration Standardization** - Consistent thresholds across components
- **Session Boundary Integration** - Connect query classification to session management

### ❌ Pending
- **IndexedDB Persistence** - More robust storage than localStorage
- **Enhanced Context Injection** - Previous analysis metadata integration
- **Session Analytics** - Track session patterns and effectiveness

## Key Files for Troubleshooting

| File | Purpose |
|------|---------|
| `app/api/claude/generate-response/route.ts` | Route handler, session-aware context integration |
| `pages/api/classify-query.ts` | Query classification for session boundaries |
| `lib/chat/session-manager.ts` | Session lifecycle management |
| `components/chat/SessionBoundary.tsx` | Visual session indicators |
| `components/ConversationMemory.ts` | Session-aware memory management |
| `lib/storage/session-storage.ts` | Session persistence and recovery |
| `config/chat-memory-config.ts` | Centralized session and memory configuration |
| `components/geospatial-chat-interface.tsx` | Main chat interface component |

## Current Chat Issues to Troubleshoot

Based on the documentation analysis, the main areas needing attention for the contextual/follow-up chat functionality are:

### 1. Session Integration Priority Issues
- **High Priority**: Session-aware context integration (connecting query classification to session management)
- **Medium Priority**: UI session indicators and classification display
- **Low Priority**: Advanced session features and analytics

### 2. Specific Technical Gaps
1. **Context Injection**: Previous analysis metadata needs better integration into Claude prompts
2. **Persona Continuity**: Ensuring persona selection persists correctly across session boundaries
3. **Memory Standardization**: Consistent thresholds and configuration across components
4. **Session Boundary Detection**: Visual indicators for session transitions

### 3. Configuration Issues
- `MAX_MEMORY_MESSAGES = 50` – maximum messages before pruning
- `SUMMARIZE_THRESHOLD = 15` – trigger summarization after this many messages
- `SESSION_TIMEOUT = 30 * 60 * 1000` – 30 minutes session timeout
- `CONTEXT_BADGE_COLOR = #33a852` – brand green for context indicator

## Advanced Features

### Hybrid ML System
- **Rule-based Processing**: Fast processing for simple queries
- **ML-based Processing**: Complex statistical analysis via SHAP microservice
- **Adaptive Routing**: System learns to route queries optimally
- **Fallback Mechanisms**: Graceful degradation if ML service unavailable

### Advanced Query Types
- **Outlier Detection**: Identifies statistically unusual areas
- **Scenario Analysis**: Models what-if scenarios and predicts impacts
- **Feature Interactions**: Analyzes how variables work together
- **Correlation Analysis**: Statistical relationships between variables

### SHAP Integration
- **Feature Importance**: SHAP values explain model predictions
- **Context Reuse**: Follow-up questions leverage cached SHAP analysis
- **Cost Optimization**: Avoid re-computation for chat turns
- **Statistical Backing**: All narratives backed by rigorous analysis

## Testing & Quality Assurance

- **Jest + ts-jest**: Comprehensive test suite with ArcGIS mocks
- **Target Coverage**: ≥ 85% test coverage
- **Smoke Tests**: `scripts/smoke-test-personas.ts` validates all personas
- **Integration Tests**: End-to-end query processing validation
- **Anthropic Mock**: `__mocks__/@anthropic-ai/sdk.ts` for offline testing

## Success Metrics for Chat System

- [ ] Query classification accurately determines session boundaries
- [ ] Context properly cleared for new-analysis queries
- [ ] Context maintained for follow-up queries within sessions
- [ ] Persona selection persists appropriately across session boundaries
- [ ] Session transitions are visually clear to users
- [ ] Memory system handles session switching efficiently

---

The system is designed to be highly contextual, with the AI remembering previous analyses within a session while intelligently detecting when users want to start fresh analysis on new topics. The chat functionality represents a sophisticated balance between maintaining conversational context and providing fresh analytical perspectives when needed. 