# Claude + SHAP Contextual Chat Integration

> **Status:** 🔄 In Progress - Core components implemented, integration pending (Jan 2025)

This guide summarises how the UI, SHAP micro-service and Claude route collaborate to deliver context-aware follow-up questions in the chat interface, with AI persona continuity.

## Chat Session Management 🔄

### Session Boundaries
Chat sessions are determined by **query classification** rather than arbitrary limits. Each user query is classified as either:

- **`follow-up`** - Continues current session, maintains context
- **`new-analysis`** - Starts fresh session, clears context

### Session Lifecycle

#### **New Session Triggers** 🆕
A new session begins when:
1. **New Analysis Query**: User requests different metrics, locations, or topics
   - Examples: "show me income levels", "what about Nike trends?", "correlate education with housing"
2. **First Query**: Empty conversation history (always new-analysis)
3. **Manual Clear**: User clicks clear/reset button
4. **Session Timeout**: 30 minutes of inactivity (automatic cleanup)

#### **Session Continuation** 🔗
Session continues when:
1. **Follow-up Query**: User asks for clarification or different perspective on existing results
   - Examples: "why is that?", "what about in the east?", "is that positive correlation?"
2. **Persona Switch**: User changes AI persona but continues same analysis topic
3. **Visualization Changes**: User customizes charts/maps of current analysis

### Query Classification System
**File:** `/api/classify-query`
```typescript
// Claude Haiku determines query type
const classification = await classifyQuery(query, conversationHistory);

if (classification === 'new-analysis') {
  // Start new session
  clearConversationMemory();
  resetPersonaContext();
  clearMapVisualizations();
} else {
  // Continue session
  maintainContext();
  preservePersona();
}
```

### Session State Management
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

### Memory Retention Rules
- **Within Session**: All messages retained up to 50 max
- **Cross Session**: Previous session context cleared
- **Persona Memory**: Persona selection persists across sessions
- **Analysis Continuity**: New sessions start fresh, no carryover

## Implementation Status 🚧

### ✅ Completed Components
- **Conversation Memory System** - `ConversationMemory.ts` & `GeospatialConversationMemory.ts`
- **Claude Summarization API** - `/api/summarize-context` with Claude 3.5 Sonnet
- **Context-Aware UI Badge** - Visual indicator with hover tooltip
- **AI Persona System** - 5 personas (Strategist, Tactician, Creative, Product Specialist, Customer Advocate)
- **Chat Context Providers** - React context with localStorage persistence
- **Query Classification** - `/api/classify-query` determines new vs follow-up

### 🔄 In Progress
- **Conversation Context Integration** - Adding history to Claude API calls
- **Persona Continuity** - Maintaining selected persona across chat sessions
- **Memory Configuration Standardization** - Consistent thresholds across components
- **Session Boundary Integration** - Connect query classification to session management

### ❌ Pending
- **IndexedDB Persistence** - More robust storage than localStorage
- **Enhanced Context Injection** - Previous analysis metadata integration
- **Session Analytics** - Track session patterns and effectiveness

## Step-by-Step Implementation Plan 📋

### Phase 1: Core Context Integration

#### Step 1: Standardize Memory Configuration
**File:** `config/chat-memory-config.ts` (new)
```typescript
export const MEMORY_CONFIG = {
  MAX_MEMORY_MESSAGES: 50,
  SUMMARIZE_THRESHOLD: 15,
  CONTEXT_BADGE_COLOR: '#33a852',
  STORAGE_KEY: 'mpiQ_conversation_memory',
  PERSONA_STORAGE_KEY: 'mpiQ_selected_persona',
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
};

export const SESSION_CONFIG = {
  CLASSIFICATION_API: '/api/classify-query',
  NEW_SESSION_TRIGGERS: ['new-analysis', 'manual-clear', 'timeout'],
  PRESERVE_ACROSS_SESSIONS: ['persona', 'ui-preferences']
};
```

#### Step 2: Enhance Conversation Memory with Session Tracking
**File:** `components/ConversationMemory.ts`
- Add session ID and boundary tracking
- Implement session clearing on new-analysis
- Store session metadata (start time, analysis type)

#### Step 3: Integrate Query Classification with Session Management
**File:** `lib/chat/session-manager.ts` (new)
```typescript
export class ChatSessionManager {
  async handleNewQuery(query: string, conversationHistory: string): Promise<{
    isNewSession: boolean;
    sessionId: string;
    shouldClearContext: boolean;
  }> {
    const classification = await this.classifyQuery(query, conversationHistory);
    
    if (classification === 'new-analysis') {
      return {
        isNewSession: true,
        sessionId: this.generateSessionId(),
        shouldClearContext: true
      };
    }
    
    return {
      isNewSession: false,
      sessionId: this.getCurrentSessionId(),
      shouldClearContext: false
    };
  }
}
```

### Phase 2: Claude Route Integration

#### Step 4: Modify Claude Generate Response Route
**File:** `app/api/claude/generate-response/route.ts`
- Integrate session management before processing
- Clear context for new-analysis queries
- Maintain context for follow-up queries

**Key Changes:**
```typescript
// Check if this is a new session
const sessionInfo = await sessionManager.handleNewQuery(userQuery, conversationHistory);

if (sessionInfo.shouldClearContext) {
  // New analysis - start fresh
  conversationContext = null;
  previousAnalysis = null;
} else {
  // Follow-up - maintain context
  conversationContext = await extractConversationContext(messages);
}

// Enhanced system prompt with conditional context
const dynamicSystemPrompt = `${selectedPersona.systemPrompt}

${conversationContext ? `
CONVERSATION CONTEXT:
${conversationContext.summary}

PREVIOUS ANALYSIS CONTEXT:
${conversationContext.previousAnalysis}
` : ''}

${shapAnalysisInfo}
// ... rest of system prompt
```

#### Step 5: Update Chat Interface with Session Awareness
**File:** `components/geospatial-chat-interface.tsx`
- Integrate query classification before submission
- Show session boundary indicators in UI
- Handle context clearing for new sessions

### Phase 3: UI Enhancements

#### Step 6: Add Session Boundary Indicators
**File:** `components/chat/SessionBoundary.tsx` (new)
- Visual separator for new sessions
- "New Analysis" vs "Follow-up" indicators
- Session metadata display (time, query count)

#### Step 7: Enhance Context Display with Session Info
**File:** `components/ContextDisplay.tsx`
- Show session status in tooltip
- Display query classification
- Session continuity indicators

#### Step 8: Update Message Handling for Sessions
**File:** `components/chat/MessageList.tsx`
- Group messages by session
- Show session boundaries
- Handle context clearing animations

### Phase 4: Advanced Session Features

#### Step 9: Session Persistence and Recovery
**File:** `lib/storage/session-storage.ts` (new)
- Save session state to IndexedDB
- Recover interrupted sessions
- Handle browser refresh gracefully

#### Step 10: Session Analytics and Optimization
**File:** `lib/analytics/session-analytics.ts` (new)
- Track session lengths and patterns
- Monitor query classification accuracy
- Optimize session boundary detection

#### Step 11: Advanced Session Management
- **Session Merging**: Combine related sessions
- **Context Bridging**: Selective context transfer
- **Session History**: Browse previous sessions

### Phase 5: Testing & Optimization

#### Step 12: Session Integration Testing
**File:** `__tests__/session-management.test.ts` (new)
- Test query classification accuracy
- Verify session boundary detection
- Validate context clearing/preservation

#### Step 13: Performance Optimization
- Optimize session state storage
- Implement efficient context switching
- Add session cleanup strategies

#### Step 14: Error Handling & Fallbacks
- Graceful session recovery
- Fallback classification when API fails
- Session corruption recovery

## Technical Implementation Details 🔧

### Session Classification Logic
```typescript
interface SessionDecision {
  classification: 'follow-up' | 'new-analysis';
  confidence: number;
  shouldClearContext: boolean;
  sessionAction: 'continue' | 'start-new' | 'merge';
}
```

### Session State Structure
```typescript
interface SessionState {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  messageCount: number;
  activePersona: string;
  classification: 'follow-up' | 'new-analysis';
  analysisContext: {
    type: string;
    metrics: string[];
    regions: string[];
    lastResults?: any;
  };
  conversationMemory: ConversationMemory;
}
```

### Context Preservation Rules
1. **New Analysis**: Clear all context, start fresh
2. **Follow-up**: Preserve context, continue conversation
3. **Persona Switch**: Preserve context, note persona change
4. **Manual Clear**: Clear everything, reset session
5. **Timeout**: Archive session, start fresh

## Conversational Memory System 🧠
* **Session-aware context** – conversations segmented by analysis boundaries
* **Claude-powered classification** – Haiku determines new vs follow-up queries
* **Smart context clearing** – automatic context reset for new analyses
* **Persona continuity** – selected AI persona maintained across appropriate boundaries
* **Visual indicators** – "Context-Aware" chip with session status (hover = tooltip summary)

## SHAP-Aware Follow-ups with Sessions 🔗
Users can ask follow-up questions within a session while the system intelligently detects when to start fresh.

Example Session Flow:
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

## Technical Flow with Session Management
1. **Query Classification**: Determine if new-analysis or follow-up
2. **Session Decision**: Continue current or start new session
3. **Context Management**: Clear or preserve based on classification
4. **UI Build**: Request with session-aware context
5. **Claude Processing**: Context-aware or fresh analysis
6. **Response**: Session-appropriate response with continuity

## Configuration
* `MAX_MEMORY_MESSAGES = 50` – maximum messages before pruning
* `SUMMARIZE_THRESHOLD = 15` – trigger summarization after this many messages
* `SESSION_TIMEOUT = 30 * 60 * 1000` – 30 minutes session timeout
* `CONTEXT_BADGE_COLOR = #33a852` – brand green for context indicator
* `PERSONA_STORAGE_KEY = mpiQ_selected_persona` – localStorage key for persona persistence

## Key Files
| File | Purpose |
|------|---------|
| `app/api/claude/generate-response/route.ts` | Route handler, session-aware context integration |
| `pages/api/classify-query.ts` | Query classification for session boundaries |
| `lib/chat/session-manager.ts` | Session lifecycle management |
| `components/chat/SessionBoundary.tsx` | Visual session indicators |
| `components/ConversationMemory.ts` | Session-aware memory management |
| `lib/storage/session-storage.ts` | Session persistence and recovery |
| `config/chat-memory-config.ts` | Centralized session and memory configuration |

## Implementation Priority
1. **High Priority**: Session-aware context integration (Steps 3-4)
2. **Medium Priority**: UI session indicators and classification (Steps 5-7)
3. **Low Priority**: Advanced session features and analytics (Steps 9-11)

## Success Metrics
- [ ] Query classification accurately determines session boundaries
- [ ] Context properly cleared for new-analysis queries
- [ ] Context maintained for follow-up queries within sessions
- [ ] Persona selection persists appropriately across session boundaries
- [ ] Session transitions are visually clear to users
- [ ] Memory system handles session switching efficiently

## Further Reading
* [Two-Pass Analysis Architecture](two-pass-analysis.md)
* [Extending AI Personas](../ai-personas-extension.md)
* [SHAP Integration Guide](../shap-integration.md)

## SHAP Context in Follow-up Chat

Once an analysis is complete the front-end sends a `shapAnalysis` block (feature-importance array + target name) to `/api/claude/generate-response`.  Claude uses it to craft the initial narrative.

### How the data flows today
1. **Analysis turn** – full `featureData` and `shapAnalysis` are embedded in the first request.  
2. **Chat turns** – we resend only `featureData`; the SHAP block is *not* included, but it still lives in the conversation history so the model can reference it.  
3. Cost: Claude re-tokenises that original SHAP JSON on every turn (a few hundred tokens).

### Optimisation patterns
| Pattern | Token cost | Complexity | Notes |
|---------|-----------|------------|-------|
| Do nothing (current) | repeat cost each turn | none | small JSON ( <100 KB ) usually cheap enough |
| **Trimmed top-N** | ~200 tokens / turn | low | send only the 20–50 most important features |
| **Server-side cache + tool call** | ~0 tokens unless tool used | medium | cache SHAP on first call, expose `get_shap(sessionId)` tool; model calls it when needed |

### Recommended approach
For most demos keep the default flow – it is simpler and the cost is minor.  When running long advisory chat sessions, switch to the *cache + tool* pattern to avoid re-paying for the SHAP block each round.

See `components/geospatial-chat-interface.tsx` (`sendChatMessage`) and `app/api/claude/generate-response/route.ts` for current wiring. 