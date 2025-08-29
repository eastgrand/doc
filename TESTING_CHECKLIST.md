# MPIQ AI Chat - Manual Testing Checklist

## Test Environment
- **URL**: http://localhost:3001
- **Date**: ___________
- **Tester**: ___________
- **Browser**: ___________

---

## 1. 🗺️ MAP INITIALIZATION & DISPLAY
**Location**: `/components/map/MapClient.tsx` & `/components/MapApp.tsx`

### 1.1 Initial Load
- [x] Map loads without console errors
- [x] Map centers on Los Angeles (ZIP 90650) area
- [x] Basemap displays correctly (gray-vector for light theme)
- [x] No ArcGIS widget errors in console
- [x] Assets load from `/assets/esri/` path

### 1.2 Map Controls
- [x] Zoom controls appear and function
- [x] Attribution widget loads without errors
- [x] Map constraints work (if enabled)
- [x] Theme-appropriate basemap (light/dark mode)

**Issues Found**: _________________________________

---

## 2. 🎛️ MAP WIDGETS
**Location**: `/components/MapWidgets.tsx`

### 2.1 Search Widget
- [x] Search widget initializes without errors
- [x] Can search for locations
- [x] Search results display properly
- [x] No t9n/locale errors

### 2.2 Print Widget
- [x] Print widget loads
- [x] Print service URL works
- [x] Can generate print preview
- [x] No locale errors

### 2.3 Bookmarks Widget
- [x] Bookmarks widget loads
- [x] California city bookmarks display (Fresno, LA, San Diego, SF, San Jose)
- [x] Clicking bookmark navigates to location
- [x] No errors when switching bookmarks

### 2.4 Layer List
- [x] Layer list displays
- [x] Layers can be toggled on/off
- [x] Layer ordering works (if drag-drop enabled)
- [x] Layer visibility persists

**Issues Found**: _________________________________

---

## 3. 📍 SAMPLE AREAS PANEL
**Location**: `/components/map/SampleAreasPanel.tsx`

### 3.1 Panel Display
- [x] Panel shows on right side
- [x] 5 sample areas display with correct data
- [x] Color scheme shows correctly (Red → Orange → Light Green → Green)
- [x] No semicolon errors in console
- [x] Hover effects work on area cards

### 3.2 Area Interaction
- [x] Clicking area card navigates map to that location
- [x] Active area highlighted
- [x] Statistics display correctly
- [x] Graphics render on map (204 per area)

### 3.3 Data Display
- [x] Strategic scores show (0-100)
- [x] Population data displays
- [x] Income data displays
- [x] Age data displays
- [x] All 5 ZIP codes present (90650, 90731, 90745, 90805, 90813)

**Issues Found**: _________________________________

---

## 4. 💬 AI CHAT INTERFACE
**Location**: `/components/geospatial-chat-interface.tsx`

### 4.1 Chat Initialization
- [ ] Chat panel loads on left side
- [ ] Input field is accessible
- [ ] Send button visible
- [ ] No console errors on load

### 4.2 Query Processing
- [ ] Can type and send messages
- [ ] Loading indicator shows during processing
- [ ] Responses display correctly
- [ ] Error messages display appropriately

### 4.3 Geospatial Features
- [ ] Geographic queries recognized
- [ ] Map updates based on chat queries
- [ ] Context awareness works

**Example Queries to Test**:
1. "Show me high income areas"
2. "Where are the best demographics?"
3. "Find areas with young population"
4. "Compare income levels across ZIP codes"

**Issues Found**: _________________________________

---

## 5. 🎨 LAYER MANAGEMENT
**Location**: `/components/LayerController/LayerController.tsx`

### 5.1 Layer Loading
- [ ] Demographic layers load
- [ ] Store location layers load (Target, Whole Foods, Trader Joe's, Costco)
- [ ] Consumer behavior layers available
- [ ] Energy drink consumption layers present

### 5.2 Layer Visualization
- [ ] Choropleth rendering works
- [ ] Color schemes apply correctly
- [ ] Quartile renderer functions
- [ ] Legend updates with layer changes

### 5.3 Layer Controls
- [ ] Can toggle layer visibility
- [ ] Can adjust layer opacity (if available)
- [ ] Filter controls work
- [ ] Statistics panel updates

**Issues Found**: _________________________________

---

## 6. 🔍 POPUP FUNCTIONALITY
**Location**: `/components/popup/CustomPopupManager.tsx`

### 6.1 Popup Display
- [ ] Clicking map features shows popup
- [ ] Popup content formatted correctly
- [ ] Demographics data displays in popup
- [ ] Store information shows for point layers

### 6.2 Popup Content
- [ ] Value bars display for demographic data
- [ ] Address information shows for stores
- [ ] All fields accessible
- [ ] Close button works

**Issues Found**: _________________________________

---

## 7. 🔄 ROUTING & ANALYSIS
**Location**: `/lib/routing/` & `/lib/analysis/`

### 7.1 Query Routing
- [ ] Queries route to correct endpoints
- [ ] Fallback mechanisms work
- [ ] Out-of-scope queries rejected appropriately

### 7.2 Analysis Results
- [ ] Analysis completes without errors
- [ ] Results display on map
- [ ] Statistics calculate correctly
- [ ] SHAP explanations available (if enabled)

**Test Endpoints** (via chat):
- `/demographic-insights`
- `/competitive-analysis`
- `/strategic-analysis`
- `/spatial-clusters`

**Issues Found**: _________________________________

---

## 8. 📊 UNIFIED ANALYSIS WORKFLOW
**Location**: `/components/unified-analysis/UnifiedAnalysisWorkflow.tsx`

### 8.1 Analysis Panel
- [ ] Panel opens when triggered
- [ ] Analysis options display
- [ ] Can select analysis type
- [ ] Results display correctly

### 8.2 Visualization Options
- [ ] Can switch visualization types
- [ ] Color schemes update
- [ ] Legend reflects changes
- [ ] Export options work (if available)

**Issues Found**: _________________________________

---

## 9. 🎨 THEME & STYLING
**Location**: `/components/theme/ThemeProvider.tsx`

### 9.1 Theme Toggle
- [ ] Light/dark mode switch works
- [ ] Map basemap updates with theme
- [ ] UI colors adapt correctly
- [ ] No styling conflicts

### 9.2 Responsive Design
- [ ] Sidebar resizing works
- [ ] Mobile responsive (if applicable)
- [ ] Panels don't overlap
- [ ] Scrolling works in panels

**Issues Found**: _________________________________

---

## 10. ⚠️ ERROR HANDLING
**Location**: `/components/ErrorBoundary.tsx`

### 10.1 Error Boundaries
- [ ] Application doesn't crash on errors
- [ ] Error messages display to user
- [ ] Can recover from errors
- [ ] Console provides debugging info

### 10.2 Loading States
- [ ] Loading modals display
- [ ] Progress indicators work
- [ ] No infinite loading states
- [ ] Timeouts handled properly

**Issues Found**: _________________________________

---

## 11. 🚀 PERFORMANCE
**Location**: Various

### 11.1 Load Times
- [ ] Initial page load < 5 seconds
- [ ] Map renders < 3 seconds
- [ ] Chat responses < 2 seconds
- [ ] Layer switching smooth

### 11.2 Memory Usage
- [ ] No memory leaks detected
- [ ] Browser remains responsive
- [ ] Can run for extended period
- [ ] Cleanup on component unmount

**Issues Found**: _________________________________

---

## 12. 🔌 INTEGRATIONS
**Location**: Various services

### 12.1 ArcGIS Integration
- [ ] API key configured
- [ ] Feature services accessible
- [ ] Geometry operations work
- [ ] Spatial queries function

### 12.2 AI Integration
- [ ] Claude API connected (if configured)
- [ ] Responses generate correctly
- [ ] Context maintained in chat
- [ ] Error handling for API failures

**Issues Found**: _________________________________

---

## CRITICAL ISSUES SUMMARY

### 🔴 Blockers (App doesn't work)
1. _________________________________
2. _________________________________

### 🟡 Major Issues (Feature broken)
1. _________________________________
2. _________________________________

### 🟢 Minor Issues (Cosmetic/UX)
1. _________________________________
2. _________________________________

---

## NOTES & OBSERVATIONS
_________________________________
_________________________________
_________________________________

---

## SIGN-OFF
- [ ] All critical features tested
- [ ] No blocking issues found
- [ ] Application ready for use

**Tested By**: ___________
**Date**: ___________
**Version**: ___________