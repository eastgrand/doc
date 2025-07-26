#!/usr/bin/env node

/**
 * Basic Flow Debug - Find WHERE the analysis flow is breaking
 */

console.log(`
🚨 BASIC FLOW DEBUG - Find Where Analysis Breaks
=================================================

Since NO analysis logs are appearing, the issue is much earlier.

STEP 1: Check if analysis is being triggered at all
---------------------------------------------------
In browser console, look for ANY of these log patterns:

// Chat interface logs:
[GeospatialChatInterface]
[Chat]
[Analysis]

// API route logs:
[API]
[Claude]
[Route]

// Any error messages:
Error:
Failed:
Cannot:

STEP 2: Check network tab for API calls
---------------------------------------
1. Open Network tab in browser dev tools
2. Run the query: "Show me strategic markets for Nike expansion"
3. Look for these API calls:
   - /api/claude/generate-response
   - Any 404 or 500 errors
   - Any failed requests

STEP 3: Check browser console for JavaScript errors
---------------------------------------------------
Look for red error messages like:
- "Cannot read property of undefined"
- "Module not found"
- "Syntax error"
- "Reference error"

STEP 4: Check if the query is being processed
---------------------------------------------
In browser console, run during analysis:
console.log('Current query state:', window.currentQuery);
console.log('Analysis state:', window.analysisState);

STEP 5: Manual analysis trigger test
------------------------------------
In browser console, try to manually trigger:
// If there's a chat interface
if (window.triggerAnalysis) {
  window.triggerAnalysis('Show me strategic markets for Nike expansion');
}

STEP 6: Check component mounting
-------------------------------
Look for these logs that indicate components are loaded:
[MapClient]
[GeospatialChatInterface] 
[AnalysisEngine]

=================================================

🎯 MOST LIKELY ISSUES:

1. **Component not mounted**: The analysis components aren't loading
2. **API route broken**: The /api/claude/generate-response endpoint is failing
3. **JavaScript error**: There's a syntax/import error preventing execution
4. **Query not recognized**: The query isn't being detected as analysis-worthy
5. **Authentication/permissions**: API calls are being blocked

=================================================

🔧 IMMEDIATE ACTIONS:

❌ If NO logs appear at all:
   → Check for JavaScript errors in console (red messages)
   → Check if the page loaded correctly
   → Check network tab for failed requests

❌ If you see [GeospatialChatInterface] but no [AnalysisEngine]:
   → Analysis isn't being triggered by the query
   → Check query processing logic

❌ If you see API calls but they're failing:
   → Check the API endpoint status
   → Check for authentication issues

❌ If you see errors mentioning "Cannot find module":
   → Import/build issue - restart dev server

=================================================

REPORT BACK:
1. Any red error messages in console? (Yes/No + details)
2. Any logs starting with [GeospatialChatInterface]? (Yes/No)
3. Any API calls in Network tab? (Yes/No + status codes)
4. Any other log messages at all? (List them)

This will tell us if it's a:
- Build/import issue
- Component loading issue  
- API issue
- Query processing issue
`);