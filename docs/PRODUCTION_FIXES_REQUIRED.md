# Production Fixes Required

**Created**: August 29, 2025  
**Priority**: High - Required before production deployment  
**Status**: Open Issues  

## Critical UI/UX Issues

### 1. **Brand Difference Analysis Pagination** 🔴
- **Issue**: Brand difference analysis showing only 5 "markets" on follow-up chat
- **Location**: `/components/chat/` or analysis endpoints
- **Expected**: Should show all relevant markets or implement proper pagination
- **Priority**: High - Core functionality broken

### 2. **Dynamic Loading Facts** 🔴  
- **Issue**: Remove FL or specifics from random facts on loading page. Should be dynamic, pulled from current project facts
- **Location**: Loading page components
- **Expected**: Facts should reflect current project context (energy drinks, brands, etc.)
- **Priority**: High - Branding consistency

### 3. **Chat Box Styling** 🟡
- **Issue**: Change chat box (user) from red to blue with some opacity
- **Location**: Chat interface styling
- **Expected**: User messages should be blue with opacity, maintain readability
- **Priority**: Medium - Visual polish

### 4. **Model Attribution in Responses** 🟡
- **Issue**: Chat responses should never include model attribution, only the initial analysis
- **Location**: Chat response processing
- **Expected**: Remove "Claude" or model references from follow-up responses
- **Priority**: Medium - Professional appearance

## Feature Parity Issues

### 5. **National Parks Filtering Fix** 🔴
- **Issue**: Make same fix that last project has for national parks filtering
- **Location**: Filtering system
- **Expected**: Apply proven filtering solution from previous project
- **Priority**: High - Known working solution exists

## Phase 4 Issues

### 6. **Remove Phase 4 Text from UI** 🟡
- **Issue**: Remove any phase 4 related text from UI
- **Location**: All Phase 4 components and labels
- **Expected**: Use generic terms like "Advanced Features" instead of "Phase 4"
- **Priority**: Medium - User-facing terminology

### 7. **Scholarly Search Focus** 🔴
- **Issue**: Focus scholarly search. It shouldn't search for the app methods or GIS, etc. only project-specific terms
- **Location**: `/components/phase4/ScholarlyResearchPanel.tsx`
- **Expected**: Search terms should focus on energy drinks, consumer behavior, demographics - not technical terms
- **Priority**: High - Search relevance broken

### 8. **Real-Time Data Broken** 🔴
- **Issue**: Real-time data is broken
- **Location**: `/components/phase4/RealTimeDataDashboard.tsx` and `/lib/integrations/real-time-data-service.ts`
- **Expected**: Should display live economic indicators and market data
- **Priority**: High - Component not functional

### 9. **Advanced Visualization Broken** 🔴
- **Issue**: Advanced visualization is broken, unreadable charts, map
- **Location**: `/components/phase4/AdvancedVisualizationSuite.tsx`
- **Expected**: Charts should be readable, 3D maps should render properly
- **Priority**: High - Component not functional

### 10. **AI-Powered Insights Clarity** 🟡
- **Issue**: Still don't understand what ai-powered insights is giving us that the analysis does not
- **Location**: `/components/phase4/AIInsightGenerator.tsx`
- **Expected**: Clear differentiation from standard analysis, provide unique value
- **Priority**: Medium - Feature value unclear

### 11. **Performance Tab Functionality** 🟡
- **Issue**: What does performance tab actually do?
- **Location**: Advanced filtering performance settings
- **Expected**: Clear documentation and visible impact of performance settings
- **Priority**: Medium - Feature purpose unclear

## Dialog/Modal Issues

### 12. **Persona Dialog Selection** 🟡
- **Issue**: Persona dialog - selected should have white text, currently grey
- **Location**: Persona selection dialog
- **Expected**: Selected persona should have high contrast white text
- **Priority**: Medium - Accessibility and visibility

### 13. **Advanced Feature UI Styling** 🟡
- **Issue**: Advanced feature UI tabs have nested container borders that look bad
- **Location**: Phase 4 integration wrapper and tab containers
- **Expected**: Clean, professional border styling without double borders
- **Priority**: Medium - Visual polish

### 14. **Advanced Dialog Scrolling** 🔴
- **Issue**: Filters/advanced dialog still does not scroll
- **Location**: Advanced filter dialog and Phase 4 modals
- **Expected**: All dialog content should scroll when it exceeds container height
- **Priority**: High - Accessibility issue

## Implementation Priority

### 🔴 **Critical (Fix First)**
1. Brand difference analysis pagination
2. Dynamic loading facts  
3. National parks filtering fix
4. Scholarly search focus
5. Real-time data functionality
6. Advanced visualization functionality
7. Advanced dialog scrolling

### 🟡 **Medium (Fix Second)**  
8. Chat box styling (red → blue)
9. Remove model attribution
10. Remove Phase 4 terminology
11. AI insights clarification
12. Performance tab documentation
13. Persona dialog styling
14. Advanced UI border cleanup

## Notes for Implementation

- **Test each fix individually** to avoid breaking working components
- **Focus on core functionality first** before visual polish
- **Maintain backward compatibility** with existing analysis workflows
- **Document any configuration changes** needed for deployment
- **Consider feature flags** for problematic Phase 4 components until fixed

---

**Next Steps**: Address critical issues first, then move through medium priority items. Each fix should be tested in isolation before moving to the next item.