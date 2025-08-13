# Map Popup Infographics Integration Plan

## Overview

This document outlines the plan to integrate the existing map popup infographics button with the unified UI. The popup button should trigger the infographics report selection workflow, bypassing the area selection steps since geometry is already provided from the popup click.

## Infographics Workflow Understanding

### Original UI: 3-Step Infographics Process
1. **Draw Step**: Select area on map (point, polygon, click)
2. **Buffer Step**: If point selected, add buffer (radius, drive time, walk time)  
3. **Report Step**: Choose infographic report from `ReportSelectionDialog`

### Unified UI: Area Already Selected
- **Step 1 (Area Selection)**: ✅ Already completed in unified workflow
- **Step 2 (Analysis Type)**: ✅ User would select analysis type or...
- **Popup Shortcut**: 🎯 **Skip directly to Report Selection**

## Current vs Target Flow

### Original UI Flow
```
Map Popup Click → openInfographics Event → InfographicsTab → Report Selection → Generate Report
```

### Target Unified UI Flow  
```
Map Popup Click → openInfographics Event → Report Selection Dialog → Generate Report
```

**Key Insights**: 
- The popup infographics flow is **independent of UI navigation**
- Popup click triggers report selection dialog **immediately**
- No need to navigate to any specific step in the unified workflow
- Works regardless of what step the user is currently on

## Current Popup Integration Points

### A. Event Dispatch (Line 598-603 in CustomPopupManager.tsx)
```typescript
const infographicsEvent = new CustomEvent('openInfographics', {
  detail: { geometry: geometry },
  bubbles: true,
  composed: true
});
document.dispatchEvent(infographicsEvent);
```

### B. Geometry Storage (Lines 579-595 in CustomPopupManager.tsx)
```typescript
const geometryData = {
  type: geometry.type,
  rings: geometry.type === 'polygon' ? (geometry as __esri.Polygon).rings : undefined,
  x: geometry.type === 'point' ? (geometry as __esri.Point).x : undefined,
  y: geometry.type === 'point' ? (geometry as __esri.Point).y : undefined,
  spatialReference: geometry.spatialReference.toJSON()
};
localStorage.setItem('emergencyGeometry', JSON.stringify(geometryData));
```

### C. Legacy Global Function (Commented, Lines 607-619)
```typescript
// Previously used window.forceToStep3() - now disabled
```

## Integration Challenges

### 1. **Workflow State Management**
- Unified UI manages workflow steps differently than original InfographicsTab
- Need to integrate geometry passing with unified workflow state
- Must handle analysis type selection automatically

### 2. **Event System Compatibility**
- Original UI uses `openInfographics` event with ResizableSidebar
- Unified UI doesn't have ResizableSidebar - needs new event handling
- Must maintain backward compatibility if both UIs coexist

### 3. **Geometry Processing**
- Original: InfographicsTab manages geometry state directly
- Unified: UnifiedAnalysisWorkflow handles area selection differently
- Need to bypass area selection step when geometry provided via popup

### 4. **UI Navigation**
- Original: Direct step navigation within InfographicsTab
- Unified: Workflow steps managed by UnifiedAnalysisWorkflow
- Must integrate with unified step progression

## Simplified Implementation Plan

### Core Requirement: Modal Dialog Overlay

The implementation is straightforward - just add a modal dialog that can be triggered from anywhere:

#### 1. Add Infographics Event Listener
**File:** `components/unified-analysis/UnifiedAnalysisWorkflow.tsx`

```typescript
// Add state for infographics dialog (independent of workflow state)
const [infographicsDialog, setInfographicsDialog] = useState({
  open: false,
  geometry: null as __esri.Geometry | null
});

// Add useEffect to listen for openInfographics events
useEffect(() => {
  const handleOpenInfographics = (event: CustomEvent) => {
    console.log('[UnifiedWorkflow] Infographics popup event received', event.detail);
    
    // Open dialog immediately with popup geometry
    setInfographicsDialog({
      open: true,
      geometry: event.detail?.geometry
    });
  };

  document.addEventListener('openInfographics', handleOpenInfographics as EventListener);
  return () => {
    document.removeEventListener('openInfographics', handleOpenInfographics as EventListener);
  };
}, []);
```

#### 1.2 Add Report Selection Dialog Integration
**File:** `components/unified-analysis/UnifiedAnalysisWorkflow.tsx`

```typescript
// Import ReportSelectionDialog component
import ReportSelectionDialog from '../ReportSelectionDialog';

interface WorkflowState {
  // ... existing properties
  popupGeometry?: __esri.Geometry;
  showInfographicsDialog?: boolean;
  selectedReport?: string;
}

// Add report selection handler
const handleReportSelect = useCallback((reportId: string) => {
  setWorkflowState(prev => ({
    ...prev,
    selectedReport: reportId,
    showInfographicsDialog: false,
    step: 'processing',
    isProcessing: true
  }));
  
  // Generate infographic with selected report and popup geometry
  if (workflowState.popupGeometry) {
    generateInfographic(workflowState.popupGeometry, reportId);
  }
}, [workflowState.popupGeometry]);

// Add infographic generation function
const generateInfographic = useCallback(async (geometry: __esri.Geometry, reportId: string) => {
  try {
    // Use existing Infographics component logic or API call
    const result = await generateInfographicReport(geometry, reportId);
    
    setWorkflowState(prev => ({
      ...prev,
      step: 'results',
      isProcessing: false,
      infographicResult: result
    }));
  } catch (error) {
    console.error('[UnifiedWorkflow] Infographic generation failed:', error);
    setWorkflowState(prev => ({
      ...prev,
      step: 'selection',
      isProcessing: false,
      error: error.message
    }));
  }
}, []);
```

### Phase 2: Component Integration

#### 2.1 Add Report Selection Dialog to Unified UI
**File:** `components/unified-analysis/UnifiedAnalysisWorkflow.tsx`

```typescript
// Add dialog rendering in component return
return (
  <div className="w-full h-full flex flex-col">
    {/* ... existing workflow content */}
    
    {/* Infographics Report Selection Dialog */}
    {workflowState.showInfographicsDialog && (
      <ReportSelectionDialog
        open={workflowState.showInfographicsDialog}
        reports={infographicsReports} // Need to load available reports
        onClose={() => setWorkflowState(prev => ({ ...prev, showInfographicsDialog: false }))}
        onSelect={handleReportSelect}
      />
    )}
  </div>
);
```

#### 2.2 Load Available Infographics Reports
**File:** `components/unified-analysis/UnifiedAnalysisWorkflow.tsx`

```typescript
// Add state for infographics reports
const [infographicsReports, setInfographicsReports] = useState<Report[]>([]);

// Load reports when component mounts (reuse logic from InfographicsTab)
useEffect(() => {
  const loadInfographicsReports = async () => {
    try {
      const response = await fetch('/api/infographics/reports');
      const reports = await response.json();
      setInfographicsReports(reports);
    } catch (error) {
      console.error('Failed to load infographics reports:', error);
    }
  };
  
  loadInfographicsReports();
}, []);
```

#### 2.3 Infographics Results Display
**File:** `components/unified-analysis/UnifiedAnalysisWorkflow.tsx`

```typescript
// Add infographics results rendering
const renderInfographicsResults = () => {
  if (!workflowState.infographicResult) return null;
  
  return (
    <div className="w-full h-full">
      <Infographics
        geometry={workflowState.popupGeometry}
        reportTemplate={workflowState.selectedReport}
        view={mapView} // Pass map view if needed
        // ... other props
      />
    </div>
  );
};

// Update main rendering logic
const renderContent = () => {
  switch (workflowState.step) {
    case 'results':
      // Check if this is infographics results
      if (workflowState.infographicResult) {
        return renderInfographicsResults();
      }
      // Otherwise render normal analysis results
      return renderAnalysisResults();
    
    // ... other cases
  }
};
```

### Phase 3: Testing & Validation

#### 3.1 Conditional Event Handling
**File:** `components/popup/CustomPopupManager.tsx`

```typescript
infoButton.onclick = () => {
  console.log('[CustomPopupManager] Infographics button clicked!');
  const geometry = feature.geometry;

  if (geometry) {
    // Store geometry for backward compatibility
    const geometryData = {
      type: geometry.type,
      rings: geometry.type === 'polygon' ? (geometry as __esri.Polygon).rings : undefined,
      x: geometry.type === 'point' ? (geometry as __esri.Point).x : undefined,
      y: geometry.type === 'point' ? (geometry as __esri.Point).y : undefined,
      spatialReference: geometry.spatialReference.toJSON()
    };
    localStorage.setItem('emergencyGeometry', JSON.stringify(geometryData));

    // Check which UI is active
    const isUnifiedUIActive = document.querySelector('[data-unified-workflow]');
    
    if (isUnifiedUIActive) {
      // Dispatch event for unified UI
      const unifiedEvent = new CustomEvent('openInfographics', {
        detail: { 
          geometry: geometry,
          source: 'popup',
          ui: 'unified'
        },
        bubbles: true,
        composed: true
      });
      document.dispatchEvent(unifiedEvent);
    } else {
      // Dispatch event for original UI
      const originalEvent = new CustomEvent('openInfographics', {
        detail: { 
          geometry: geometry,
          source: 'popup',
          ui: 'original'
        },
        bubbles: true,
        composed: true
      });
      document.dispatchEvent(originalEvent);
    }
  }

  // Call original configured action if exists
  if (config?.actions) {
    const infoAction = config.actions.find(a => a.label === 'Infographics');
    if (infoAction) {
      infoAction.onClick(feature);
    }
  }
};
```

#### 3.2 UI Detection
**File:** `components/unified-analysis/UnifiedAnalysisWorkflow.tsx`

```typescript
// Add data attribute for UI detection
return (
  <div className="w-full h-full flex flex-col" data-unified-workflow="true">
    {/* ... existing content */}
  </div>
);
```

### Phase 4: Testing & Validation

#### 4.1 Test Scenarios

1. **Popup to Unified Infographic**
   - Click infographics button in map popup
   - Verify unified UI opens with infographic type selected
   - Verify area selection is bypassed
   - Verify analysis processes with popup geometry

2. **Original UI Compatibility**
   - Ensure original UI still works when unified UI not active
   - Test InfographicsTab functionality unchanged
   - Verify ResizableSidebar event handling preserved

3. **Error Handling**
   - Test popup without geometry
   - Test invalid geometry types
   - Test analysis processing failures

#### 4.2 Debug Infrastructure

```typescript
// Add debugging utilities
const debugPopupIntegration = {
  logEvent: (event: CustomEvent) => {
    console.log('[DEBUG] Popup Integration Event:', {
      type: event.type,
      detail: event.detail,
      timestamp: new Date().toISOString(),
      ui: document.querySelector('[data-unified-workflow]') ? 'unified' : 'original'
    });
  },
  
  logWorkflowState: (state: WorkflowState) => {
    console.log('[DEBUG] Workflow State Change:', {
      step: state.step,
      analysisType: state.analysisType,
      hasGeometry: !!state.popupGeometry,
      bypassAreaSelection: state.bypassAreaSelection
    });
  }
};
```

## Implementation Timeline

### Week 1: Core Integration
- [ ] Add event listener to UnifiedAnalysisWorkflow
- [ ] Implement geometry state management
- [ ] Create area selection bypass logic
- [ ] Basic popup-to-unified flow working

### Week 2: Enhancement & Polish
- [ ] Add backward compatibility detection
- [ ] Implement conditional event handling
- [ ] Add debug infrastructure
- [ ] Error handling and edge cases

### Week 3: Testing & Refinement
- [ ] Comprehensive testing scenarios
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Code review and refinement

## Risk Assessment

### High Risk
- **State Management Complexity**: Unified workflow state might conflict with popup geometry injection
- **Event System Conflicts**: Multiple event listeners might cause duplicate processing

### Medium Risk
- **Backward Compatibility**: Changes might break original UI functionality
- **Geometry Processing**: Different geometry formats might cause processing failures

### Low Risk
- **UI/UX Consistency**: Visual integration should be straightforward
- **Performance Impact**: Event handling additions should have minimal performance impact

## Success Criteria

1. **Functional Integration**: Popup infographics button triggers unified infographic workflow
2. **Smooth UX**: Seamless transition from popup click to analysis results
3. **Backward Compatibility**: Original UI functionality preserved
4. **Error Resilience**: Graceful handling of edge cases and failures
5. **Performance**: No noticeable performance degradation

## Rollback Plan

If integration fails or causes issues:

1. **Immediate**: Disable unified event handling, fallback to original UI
2. **Short-term**: Implement feature flag to control integration
3. **Long-term**: Maintain separate code paths for both UI systems

## Future Enhancements

1. **Direct Analysis Type Selection**: Allow popup to specify which analysis type to run
2. **Batch Processing**: Support multiple geometries from map selection
3. **Custom Popup Actions**: Allow configuration of popup button behavior
4. **Advanced Geometry Processing**: Support complex geometry types and operations

---

*This plan provides a comprehensive roadmap for integrating map popup infographics functionality with the unified analysis workflow while maintaining system stability and backward compatibility.*