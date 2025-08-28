# Component Architecture Guide

This document provides a comprehensive mapping of React components to their dependencies, purposes, and relationships within the MPIQ AI Chat application.

## 🏗️ Application Architecture Overview

The MPIQ AI Chat application is a sophisticated geospatial data analysis platform that combines:
- **ArcGIS mapping** capabilities for spatial visualization
- **AI-powered chat** interface for natural language queries
- **Multi-endpoint analysis** for competitive intelligence
- **Real-time data processing** with microservice architecture

**Search Terms:** architecture, overview, mapping, geospatial, AI, analysis, microservice

## 📱 Core Application Flow

### 1. Application Entry Points

#### **app/page.tsx**
- **Purpose:** Home page dashboard entry point
- **Components Used:** Link (Next.js)
- **Description:** Simple landing page with navigation to map application
- **Search Terms:** home, dashboard, entry, landing

#### **app/map/page.tsx**
- **Purpose:** Main map application route
- **Components Used:**
  - `MapPageClient` (dynamic import)
  - `LoadingModal`
- **Description:** Server-side route wrapper with dynamic loading
- **Search Terms:** map, route, dynamic, loading

### 2. Primary Application Components

#### **components/MapPageClient.tsx**
- **Purpose:** Client-side map application wrapper
- **Components Used:**
  - `MapApp` (lazy loaded)
  - `ErrorBoundary`
  - `LoadingModal`
- **Description:** Handles client-side rendering with error boundaries
- **Search Terms:** client, wrapper, error-boundary, lazy-load

#### **components/MapApp.tsx**
- **Purpose:** Main application orchestrator
- **Core Components:**
  - `MapContainer` - Base map functionality
  - `CustomPopupManager` - Popup interactions
  - `ResizableSidebar` - Layout management
  - `DynamicGeospatialChat` - AI chat interface
  - `DynamicMapWidgets` - Map controls
  - `DynamicUnifiedAnalysis` - Analysis workflow
- **Services Used:**
  - ArcGIS esriConfig
  - Custom popup management
  - Legend state management
- **Description:** Central hub coordinating all application features
- **Search Terms:** orchestrator, main, central, coordination, hub

## 🗺️ Mapping Components

### Core Map Infrastructure

#### **components/MapContainer.tsx**
- **Purpose:** ArcGIS Map view container
- **Dependencies:**
  - `@arcgis/core` modules
  - Custom map event handlers
- **Description:** Renders the base ArcGIS map view with core functionality
- **Search Terms:** arcgis, map-view, container, base-map

#### **components/MapContext.tsx**
- **Purpose:** Map state context provider
- **Services Used:**
  - React Context API
  - Map state management
- **Description:** Provides map state to child components
- **Search Terms:** context, state, provider, map-state

### Map Controls & Widgets

#### **components/MapWidgets.tsx**
- **Purpose:** ArcGIS widget management
- **Widget Types:**
  - Search widget
  - Bookmarks
  - Layer list
  - Print tools
  - Basemap gallery
  - Quick statistics
- **Description:** Manages standard ArcGIS widgets
- **Search Terms:** widgets, controls, arcgis-widgets, search, bookmarks

#### **components/CustomZoom.tsx**
- **Purpose:** Custom zoom control implementation
- **Dependencies:** ArcGIS view management
- **Description:** Enhanced zoom functionality with custom styling
- **Search Terms:** zoom, custom-control, navigation

## 🎨 Layer Management System

### Layer Controllers

#### **components/LayerController/LayerController.tsx**
- **Purpose:** Primary layer management interface
- **Sub-components:**
  - `DraggableLayer.tsx` - Drag/drop layer ordering
  - `LayerListItem.tsx` - Individual layer controls
  - `LayerSharing.tsx` - Layer sharing functionality
  - `LayerStatistics.tsx` - Layer analytics
  - `VisualizationControls.tsx` - Rendering controls
- **Services Used:**
  - Layer state management
  - Visualization factory
- **Description:** Comprehensive layer management system
- **Search Terms:** layer-controller, layer-management, drag-drop, sharing

#### **components/LayerPanel.tsx**
- **Purpose:** Layer configuration panel
- **Related Components:**
  - `LayerControl.tsx`
  - `LayerControls.tsx`
  - `LayerFilter.tsx`
  - `LayerGroupManager.tsx`
  - `LayerOrderControls.tsx`
  - `LayerVariableSelector.tsx`
- **Description:** User interface for layer configuration
- **Search Terms:** layer-panel, configuration, filters, variables

### Layer Utilities

#### **components/BaseLayerControls.tsx**
- **Purpose:** Base layer selection interface
- **Description:** Controls for switching between different base maps
- **Search Terms:** base-layer, basemap, selection

#### **components/LayerBookmarks.tsx**
- **Purpose:** Layer configuration bookmarking
- **Description:** Save and restore layer configurations
- **Search Terms:** bookmarks, save-restore, layer-config

## 🤖 AI & Chat System

### Chat Interface Components

#### **components/ai-chat-interface.tsx**
- **Purpose:** Primary AI chat interface
- **Dependencies:**
  - `chat-context-provider`
  - `useChatContext` hook
  - UI components (Button, Textarea, Card, etc.)
- **Features:**
  - Message history
  - Context summaries
  - Real-time responses
  - Error handling
- **Description:** Main AI chat component for user interactions
- **Search Terms:** ai-chat, chat-interface, conversation, ai-assistant

#### **components/chat-context-provider.tsx**
- **Purpose:** Chat state management context
- **Services Used:**
  - React Context API
  - Message persistence
  - Context summarization
- **Description:** Provides chat state and methods to components
- **Search Terms:** chat-context, state-management, context-provider

#### **components/geospatial-chat-interface.tsx**
- **Purpose:** Enhanced chat with geospatial awareness
- **Dependencies:**
  - Base chat interface
  - Geographic recognition service
  - Map integration
- **Description:** Specialized chat for geospatial queries
- **Search Terms:** geospatial-chat, geographic, spatial-aware, enhanced-chat

### Chat Support Components

#### **components/chat/ProcessingIndicator.tsx**
- **Purpose:** Visual processing feedback
- **Description:** Shows AI processing status during queries
- **Search Terms:** processing, indicator, loading, feedback

#### **components/chat/SessionBoundary.tsx**
- **Purpose:** Chat session management
- **Description:** Handles chat session lifecycle
- **Search Terms:** session, boundary, lifecycle, management

#### **components/animated-message.tsx**
- **Purpose:** Animated message display
- **Description:** Smooth animations for chat messages
- **Search Terms:** animated, message, smooth, transitions

## 📊 Analysis & Visualization System

### Analysis Components

#### **components/AnalysisDashboard.tsx**
- **Purpose:** Main analysis interface dashboard
- **Services Used:**
  - Analysis engine
  - Multi-endpoint router
  - Visualization factory
- **Description:** Central dashboard for data analysis workflows
- **Search Terms:** analysis-dashboard, analytics, workflow, insights

#### **components/SpatialAnalysis.tsx**
- **Purpose:** Spatial analysis operations
- **Related Components:**
  - `SpatialQuery/SpatialQueryTools.tsx`
  - `TemporalQuery/TemporalQueryTools.tsx`
- **Description:** Advanced spatial analysis functionality
- **Search Terms:** spatial-analysis, geographic-analysis, spatial-query

#### **components/CorrelationAnalysis.tsx**
- **Purpose:** Statistical correlation analysis
- **Related Components:**
  - `CorrelationAnalysisPanel.tsx`
  - `CorrelationMapControls.tsx`
- **Services Used:**
  - Correlation service
  - Statistical analysis
- **Description:** Correlation analysis between variables
- **Search Terms:** correlation, statistics, statistical-analysis, variables

### Visualization Components

#### **components/Visualization/CustomVisualizationPanel.tsx**
- **Purpose:** Custom visualization creation
- **Related Components:**
  - `ExportPanel.tsx` - Export functionality
  - `RendererOptimizationPanel.tsx` - Performance optimization
  - `ViewSynchronization.tsx` - Multi-view sync
- **Description:** Advanced visualization configuration panel
- **Search Terms:** custom-visualization, visualization-panel, export, optimization

#### **components/VisualizationControls.tsx**
- **Purpose:** Visualization rendering controls
- **Dependencies:**
  - Renderer factory
  - Styling system
- **Description:** Controls for visualization appearance and behavior
- **Search Terms:** visualization-controls, rendering, styling, appearance

#### **components/StatsVisualization.tsx**
- **Purpose:** Statistical data visualization
- **Description:** Charts and graphs for statistical data display
- **Search Terms:** stats-visualization, charts, graphs, statistics

### Chart Components

#### **components/ChartComponent.tsx**
- **Purpose:** Base chart component
- **Dependencies:**
  - Chart.js library
  - Recharts
- **Description:** Reusable chart component for data visualization
- **Search Terms:** chart, chart-js, recharts, data-viz

#### **components/ChartCustomizer.tsx**
- **Purpose:** Chart customization interface
- **Description:** UI for customizing chart appearance and data
- **Search Terms:** chart-customizer, customization, chart-config

## 🏢 Business Intelligence Components

### Market Analysis

#### **components/ApplianceMarketReport.tsx**
- **Purpose:** Appliance market analysis reporting
- **Related Components:**
  - `ApplianceMarketService.tsx`
  - `ApplianceLayerController.tsx`
  - `ApplianceIndexLayerController.tsx`
- **Description:** Specialized reporting for appliance market data
- **Search Terms:** appliance-market, market-report, business-intelligence

#### **components/ColdMarketReport.tsx**
- **Purpose:** Cold market analysis
- **Related Components:**
  - `cold-filter-fields.tsx`
  - `createColdPopupTemplate.tsx`
- **Description:** Cold market segment analysis and reporting
- **Search Terms:** cold-market, market-analysis, cold-segment

### Location Intelligence

#### **components/ChaseBankLocations.tsx**
- **Purpose:** Chase Bank location analysis
- **Dependencies:**
  - Bank location data
  - Spatial analysis
- **Description:** Specialized analysis for banking locations
- **Search Terms:** chase-bank, location-analysis, banking, poi

### Filtering & Data Management

#### **components/FilterBuilder.tsx**
- **Purpose:** Advanced filter construction
- **Related Components:**
  - `FilterWidget.tsx`
  - `bank-filter-fields.tsx`
  - `cold-filter-fields.tsx`
- **Description:** Dynamic filter creation for data analysis
- **Search Terms:** filter-builder, filtering, data-filters, dynamic-filters

#### **components/FeatureSelection.tsx**
- **Purpose:** Feature selection interface
- **Related Components:**
  - `FeatureTableComponentImpl.tsx`
- **Description:** Interactive feature selection and management
- **Search Terms:** feature-selection, features, table, selection

## 🚀 Project Management System

### Configuration Management

#### **components/ProjectConfigManager/ProjectConfigManager.tsx**
- **Purpose:** Project configuration hub
- **Sub-components:**
  - `AdvancedServiceManager.tsx` - Service configuration
  - `ConceptMappingEditor.tsx` - Concept mapping
  - `DependencyAnalyzer.tsx` - Dependency analysis
  - `DeploymentResultsDialog.tsx` - Deployment feedback
  - `DeploymentTestDialog.tsx` - Testing interface
  - `GroupManagementPanel.tsx` - Group management
  - `MicroserviceManager.tsx` - Microservice config
  - `ServiceManager.tsx` - Service management
  - `TemplateLibrary.tsx` - Template management
- **Description:** Comprehensive project configuration system
- **Search Terms:** project-config, configuration, management, deployment

### Query Management

#### **components/QueryBuilder.tsx**
- **Purpose:** Visual query construction
- **Related Components:**
  - `QueryClassifier.tsx`
  - `QueryDebugger.tsx`
  - `QueryEnhancementDisplay.tsx`
  - `QueryHistory/QueryHistoryPanel.tsx`
- **Description:** Visual interface for building complex queries
- **Search Terms:** query-builder, query-construction, visual-query

#### **components/TextToSQLQuery.tsx**
- **Purpose:** Natural language to SQL conversion
- **Dependencies:**
  - AI query processing
  - SQL generation
- **Description:** Converts natural language queries to SQL
- **Search Terms:** text-to-sql, natural-language, sql-generation, nlp

## 🔧 Utility & Supporting Components

### Data Processing

#### **components/HybridQueryProcessorProvider.tsx**
- **Purpose:** Hybrid query processing context
- **Services Used:**
  - Hybrid query processor
  - Multi-endpoint routing
- **Description:** Provides hybrid query processing capabilities
- **Search Terms:** hybrid-query, query-processor, provider, routing

#### **components/ProcessingStepIndicator.tsx**
- **Purpose:** Visual processing progress
- **Description:** Shows progress of multi-step processing operations
- **Search Terms:** processing-indicator, progress, steps, workflow

### UI Components

#### **components/LoadingModal.tsx**
- **Purpose:** Application loading overlay
- **Description:** Modal loading indicator with progress tracking
- **Search Terms:** loading-modal, loading, overlay, progress

#### **components/LoadingState.tsx**
- **Purpose:** Component-level loading states
- **Description:** Reusable loading state component
- **Search Terms:** loading-state, loading, component-loading

#### **components/ErrorBoundary.tsx**
- **Purpose:** React error boundary
- **Description:** Catches and handles component errors gracefully
- **Search Terms:** error-boundary, error-handling, react-boundary

### Interactive Elements

#### **components/TooltipButton.tsx**
- **Purpose:** Button with tooltip functionality
- **Description:** Enhanced button component with informational tooltips
- **Search Terms:** tooltip-button, tooltip, button, interactive

#### **components/EnhancedTooltip.tsx**
- **Purpose:** Advanced tooltip component
- **Description:** Feature-rich tooltip with multiple display options
- **Search Terms:** enhanced-tooltip, tooltip, advanced, rich-tooltip

### Export & Reporting

#### **components/EnhancedExportButton.tsx**
- **Purpose:** Advanced export functionality
- **Services Used:**
  - Export manager
  - PDF service
- **Description:** Comprehensive data and visualization export
- **Search Terms:** export-button, export, pdf, data-export

#### **components/ReportDialog.tsx**
- **Purpose:** Report generation interface
- **Dependencies:**
  - Report service
  - PDF generation
- **Description:** Dialog for creating and configuring reports
- **Search Terms:** report-dialog, report-generation, reports, pdf

## 🎯 Specialized Analysis Components

### Advanced Analytics

#### **components/TernaryPlot.tsx**
- **Purpose:** Ternary diagram visualization
- **Description:** Three-variable compositional data visualization
- **Search Terms:** ternary-plot, three-variable, compositional, diagram

#### **components/Infographic.tsx**
- **Purpose:** Data infographic generation
- **Related Components:**
  - `infographics/Infographics.tsx`
- **Description:** Creates visual infographics from data
- **Search Terms:** infographic, data-infographic, visual-summary

### Performance Monitoring

#### **components/LearningMonitor.tsx**
- **Purpose:** ML model performance monitoring
- **Description:** Monitors and displays machine learning model performance
- **Search Terms:** learning-monitor, ml-monitoring, performance, ai-monitoring

#### **components/MLAnalyticsTest.tsx**
- **Purpose:** ML analytics testing interface
- **Description:** Testing and validation interface for ML components
- **Search Terms:** ml-analytics, testing, ml-testing, validation

### Debugging & Testing

#### **components/TestRunner.tsx**
- **Purpose:** Component testing runner
- **Description:** Runs automated tests for application components
- **Search Terms:** test-runner, testing, automated-testing, runner

#### **components/debug/QueryDebugger.tsx**
- **Purpose:** Query debugging interface
- **Related Components:**
  - `debug/ProcessingFlowDebugger.tsx`
- **Description:** Debug interface for query processing
- **Search Terms:** query-debugger, debugging, query-debug

## 🔗 Hooks & Utilities Integration

### Custom Hooks

#### **hooks/useAnalysisEngine.ts**
- **Used By:** Analysis components, visualization components
- **Purpose:** Analysis engine state management
- **Search Terms:** analysis-engine, hook, state-management

#### **hooks/useVisualizationFactory.ts**
- **Used By:** Visualization components, layer controllers
- **Purpose:** Visualization creation and management
- **Search Terms:** visualization-factory, hook, visualization-management

#### **hooks/useLegendManager.ts**
- **Used By:** Map legend components, layer controllers
- **Purpose:** Legend state and display management
- **Search Terms:** legend-manager, legend, map-legend, hook

#### **hooks/useTheme.ts**
- **Used By:** UI components, theme-aware components
- **Purpose:** Application theme management
- **Search Terms:** theme, theme-management, styling, hook

### Core Services

#### **lib/hybrid-query-processor.ts**
- **Used By:** Query components, chat interface, analysis engine
- **Purpose:** Processes queries across multiple endpoints
- **Search Terms:** hybrid-query, query-processor, multi-endpoint

#### **lib/enhanced-query-analyzer.ts**
- **Used By:** Chat interface, query builder, analysis components
- **Purpose:** Advanced query analysis and enhancement
- **Search Terms:** query-analyzer, query-enhancement, analysis

#### **services/analysisService.ts**
- **Used By:** Analysis dashboard, visualization components
- **Purpose:** Core analysis functionality
- **Search Terms:** analysis-service, analysis, service

#### **services/visualization-analysis-service.ts**
- **Used By:** Visualization components, analysis dashboard
- **Purpose:** Visualization-specific analysis operations
- **Search Terms:** visualization-analysis, visualization-service

## 🎨 Styling & Theme System

### Theme Components

#### **components/theme-provider.tsx**
- **Purpose:** Application theme context provider
- **Related Components:**
  - `theme-toggle.tsx`
  - `theme-aware-wrapper.tsx`
- **Description:** Manages application-wide theming
- **Search Terms:** theme-provider, theming, theme-context

### Styling Utilities

#### **lib/styling/enhanced-styling-manager.ts**
- **Used By:** Visualization components, layer controllers
- **Purpose:** Advanced styling management for visualizations
- **Search Terms:** styling-manager, enhanced-styling, visualization-styling

#### **utils/visualization-factory.ts**
- **Used By:** Visualization components, analysis components
- **Purpose:** Creates and manages visualization instances
- **Search Terms:** visualization-factory, factory-pattern, visualization-creation

## 📋 Component Usage Patterns

### High-Frequency Components
- `MapApp.tsx` - Application orchestrator
- `ai-chat-interface.tsx` - Primary user interaction
- `LayerController.tsx` - Layer management
- `AnalysisDashboard.tsx` - Data analysis
- `LoadingModal.tsx` - Loading states

### Integration Points
- Map components integrate through `MapContext`
- Chat components use `chat-context-provider`
- Analysis components use `useAnalysisEngine` hook
- Visualization components use `useVisualizationFactory` hook

### Performance Considerations
- Components use dynamic imports for code splitting
- Lazy loading for non-critical components
- Memoization for expensive computations
- Error boundaries for fault tolerance

## 🔍 Quick Reference Search Index

**AI & Chat:** ai-chat-interface, chat-context-provider, geospatial-chat-interface, animated-message, processing-indicator, session-management

**Mapping:** MapApp, MapContainer, MapContext, MapWidgets, CustomZoom, layer-controller, layer-management

**Analysis:** AnalysisDashboard, SpatialAnalysis, CorrelationAnalysis, query-builder, hybrid-query-processor, analysis-engine

**Visualization:** CustomVisualizationPanel, VisualizationControls, StatsVisualization, ChartComponent, visualization-factory

**Project Management:** ProjectConfigManager, deployment, configuration, microservice-manager, template-library

**Utilities:** LoadingModal, ErrorBoundary, theme-provider, export-functionality, debugging, testing

---

*This document serves as a comprehensive guide to understanding the component relationships and architecture of the MPIQ AI Chat application. Use the search terms to quickly locate relevant components and their purposes.*