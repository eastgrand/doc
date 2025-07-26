# Geospatial Chat Interface Refactoring Plan

This document outlines the plan to refactor the `geospatial-chat-interface.tsx` component into smaller, more manageable modules.

## 1. Core Problem

The `geospatial-chat-interface.tsx` file has become too large and complex. It currently manages all state, handles complex business logic (query processing, API calls), and renders the entire UI, including multiple dialogs and side panels. This makes it difficult to maintain, debug, and extend.

## 2. Refactoring Goal

The goal is to break up the component based on the **Separation of Concerns** principle. We will extract UI components, state management, and business logic into their own dedicated files. This will result in a leaner, more maintainable, and testable codebase without altering functionality.

## 3. Proposed File Structure

A new `components/chat/` directory will be created to house the new UI components. A custom hook will be created in the `hooks/` directory to manage state and logic.

```
/components/
├── geospatial-chat-interface.tsx      # The new, lean container component
│
└── chat/                              # New directory for chat-related components
    ├── useGeospatialChat.ts         # ⭐ Custom hook for all state and logic
    ├── ChatInput.tsx                # The main input form component
    ├── MessageList.tsx              # Renders the list of chat messages
    ├── QueryDialog.tsx              # Reusable dialog for Quickstart/Trends
    ├── MessageDialog.tsx              # Dialog for showing message details
    ├── ProcessingIndicator.tsx      # The processing step indicator
    ├── chat-constants.ts            # For `ANALYSIS_CATEGORIES`, etc.
    └── map-highlight-manager.ts     # For the `createHighlights` ArcGIS logic
```

## 4. Refactoring Steps

1.  **Create `components/chat/chat-constants.ts`**:
    *   Move the `ANALYSIS_CATEGORIES` and `TRENDS_CATEGORIES` constant objects into this file.

2.  **Create `components/chat/map-highlight-manager.ts`**:
    *   Move the `createHighlights` function here. This will isolate the ArcGIS-specific map manipulation logic.

3.  **Extract UI Components into `components/chat/`**:
    *   **`ProcessingIndicator.tsx`**: The `ProcessingStepIndicator` component.
    *   **`MessageDialog.tsx`**: The `MessageDialog` component for viewing message details.
    *   **`QueryDialog.tsx`**: A reusable dialog component to handle the "Quickstart" and "Trends" functionality.
    *   **`MessageList.tsx`**: A component responsible for rendering the list of chat messages, the empty state, and the processing indicators.
    *   **`ChatInput.tsx`**: A component for the main user input section, including the text area, action buttons, and the "Minimum Applications" filter.

4.  **Create `hooks/useGeospatialChat.ts`**:
    *   This custom hook will be the "brain" of the component.
    *   It will manage all state currently in `geospatial-chat-interface.tsx` (e.g., `messages`, `isProcessing`, `inputQuery`, etc.).
    *   It will contain all the core logic and handler functions, including the main `handleSubmit` function.
    *   It will expose the state and handler functions to the main component.

5.  **Refactor `geospatial-chat-interface.tsx`**:
    *   This will become a lean "container" component.
    *   It will call the `useGeospatialChat` hook to get all the necessary state and functions.
    *   Its render method will be simplified to assemble the new, smaller UI components (`MessageList`, `ChatInput`, etc.).
    *   It will pass down the required props from the hook to the child components. 