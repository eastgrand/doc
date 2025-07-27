# Query Management Enhancements

## Problem Scenarios Addressed

1. **User starts new query without clearing previous results**
2. **User tries to start new query while one is already processing**  
3. **User wants to stop/cancel a running query**

## Solutions Implemented

### 1. Overlapping Query Prevention
- **Detection**: Check `isProcessing` state before allowing new queries
- **User Feedback**: Toast notification explaining why query was blocked
- **Behavior**: Prevents multiple concurrent analyses

```typescript
if (isProcessing) {
  toast({
    title: "Query in Progress",
    description: "Please wait for the current analysis to complete before starting a new one.",
    variant: "default",
    duration: 3000,
  });
  return;
}
```

### 2. Automatic Previous Results Clearing
- **Detection**: Check if `features.length > 0` or `currentVisualizationLayer.current` exists
- **User Feedback**: Toast notification explaining auto-clear
- **Behavior**: Automatically clears memory and UI before new query

```typescript
if (features.length > 0 || currentVisualizationLayer.current) {
  toast({
    title: "Previous Results Cleared",
    description: "Automatically cleared previous analysis to start new query. Use the Clear button manually if preferred.",
    variant: "default",
    duration: 2000,
  });
}
```

### 3. Query Cancellation Capability
- **UI Change**: Analyze button becomes red "Stop" button when processing
- **Functionality**: Immediately stops processing and clears state
- **Memory Safety**: Calls `clearAnalysis()` to free cached datasets

```typescript
const handleCancel = () => {
  setCancelRequested(true);
  setIsProcessing(false);
  setCurrentProcessingStep(null);
  clearAnalysis();
  
  toast({
    title: "Analysis Cancelled",
    description: "The current analysis has been stopped.",
    variant: "default",
    duration: 2000,
  });
};
```

### 4. Responsive Cancellation Checks
- **Early Return**: Checks `cancelRequested` at key processing points
- **Prevention**: Stops processing pipeline if user clicked stop
- **Resource Cleanup**: Ensures memory is freed even on cancellation

```typescript
// Before starting analysis
if (cancelRequested) {
  console.log('[QueryManager] Cancellation detected before analysis start');
  return;
}

// After analysis completion
if (cancelRequested) {
  console.log('[QueryManager] Cancellation detected after analysis');
  return;
}
```

## UI/UX Improvements

### Analyze Button States
1. **Normal State**: Green "Analyze" button
2. **Processing State**: Red "Stop" button with X icon
3. **Disabled State**: When no query text entered

### User Feedback
- **Toast Notifications**: Clear, contextual messages for all scenarios
- **Visual Indicators**: Button color/icon changes show current state
- **Console Logging**: Detailed logs for debugging and monitoring

### Memory Management
- **Automatic Clearing**: Every new query automatically clears cache
- **Manual Clearing**: Clear button still available for user control
- **Cancellation Cleanup**: Stop button ensures proper resource cleanup

## Benefits

1. **User Experience**: 
   - No confusion about overlapping queries
   - Clear feedback on what's happening
   - Ability to stop long-running analyses

2. **Memory Safety**:
   - Automatic cache clearing prevents accumulation
   - Cancellation properly frees resources
   - No more browser crashes on second query

3. **Robustness**:
   - Graceful handling of edge cases
   - Proper error recovery
   - Consistent state management

4. **Flexibility**:
   - Users can still manually clear if preferred
   - Stop button gives immediate control
   - Auto-clearing works seamlessly in background

## Technical Implementation

### State Management
- `isProcessing`: Tracks if analysis is running
- `cancelRequested`: Tracks if user wants to stop
- Proper state transitions and cleanup

### Error Handling
- Existing error handling preserved
- Cancellation treated as normal flow, not error
- `setIsProcessing(false)` called in all code paths

### UI Integration
- Button type changes (`submit` vs `button`)
- Dynamic styling based on state
- Tooltip updates for context

This enhancement provides a much more robust and user-friendly query management system while maintaining all existing functionality and adding proper memory management.