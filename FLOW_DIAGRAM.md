```mermaid
graph TB
    %% Main Components
    subgraph "Map-Centric Architecture"
        MapContainer[MapContainer]
        LayerController[LayerController]
        MapWidgets[MapWidgets]
        QueryHistoryPanel[QueryHistoryPanel]
        ExportPanel[ExportPanel]
    end

    subgraph "Query Processing Pipeline"
        GeospatialChat[GeospatialChat Interface]
        QueryAnalyzer[Query Analyzer]
        ConceptMapping[Concept Mapping]
        DataFetcher[Data Fetcher]
        AIService[AI Analysis Service]
        VisualizationFactory[Visualization Factory]
    end

    subgraph "Layer Management"
        LayerConfig[Layer Configuration]
        LayerState[Layer State]
        LayerErrorHandler[Layer Error Handler]
        LayerBookmarks[Layer Bookmarks]
        LayerFilter[Layer Filter]
    end

    subgraph "Visualization System"
        RendererManager[Renderer Manager]
        ViewSync[View Synchronization]
        FeatureHighlight[Feature Highlighting]
        PopupConfig[Popup Configuration]
        LegendManager[Legend Manager]
    end

    subgraph "Analysis Integration"
        SHAPService[SHAP Microservice]
        FeatureAugmentation[Feature Augmentation]
        ResultCache[Result Cache]
        JobStatus[Job Status Polling]
    end

    %% User Interactions
    User((User)) --> GeospatialChat
    User --> MapWidgets
    User --> QueryHistoryPanel
    User --> ExportPanel

    %% Query Flow
    GeospatialChat --> QueryAnalyzer
    QueryAnalyzer --> ConceptMapping
    ConceptMapping --> DataFetcher
    DataFetcher --> AIService
    AIService --> VisualizationFactory
    VisualizationFactory --> MapContainer

    %% Layer Management Flow
    MapContainer --> LayerController
    LayerController --> LayerConfig
    LayerController --> LayerState
    LayerController --> LayerErrorHandler
    LayerController --> LayerBookmarks
    LayerController --> LayerFilter

    %% Visualization Flow
    MapContainer --> RendererManager
    RendererManager --> ViewSync
    RendererManager --> FeatureHighlight
    RendererManager --> PopupConfig
    RendererManager --> LegendManager

    %% Analysis Flow
    AIService --> SHAPService
    SHAPService --> FeatureAugmentation
    FeatureAugmentation --> ResultCache
    SHAPService --> JobStatus

    %% Data Persistence
    QueryHistoryPanel --> QueryHistoryManager
    LayerBookmarks --> LocalStorage
    LayerState --> StatePersistence
    ResultCache --> CacheManager

    %% Error Handling
    LayerErrorHandler --> ErrorLogging
    QueryAnalyzer --> ErrorRecovery
    DataFetcher --> ErrorRecovery
    AIService --> ErrorRecovery

    %% Styling
    classDef component fill:#f9f,stroke:#333,stroke-width:2px
    classDef service fill:#bbf,stroke:#333,stroke-width:2px
    classDef storage fill:#bfb,stroke:#333,stroke-width:2px
    classDef user fill:#fbb,stroke:#333,stroke-width:2px

    class MapContainer,LayerController,MapWidgets,QueryHistoryPanel,ExportPanel component
    class GeospatialChat,QueryAnalyzer,ConceptMapping,DataFetcher,AIService,VisualizationFactory service
    class QueryHistoryManager,LocalStorage,StatePersistence,CacheManager storage
    class User user

    %% Component Details
    subgraph "Component Details"
        MapContainer_Details["
            - Layer initialization
            - View management
            - Loading states
            - Error handling
        "]

        LayerController_Details["
            - Group management
            - Visibility control
            - Opacity settings
            - State persistence
        "]

        QueryProcessing_Details["
            - Intent detection
            - Concept mapping
            - Data fetching
            - AI analysis
            - Visualization
        "]

        Visualization_Details["
            - Dynamic renderers
            - View sync
            - Feature highlighting
            - Popup configuration
            - Legend management
        "]
    end
```

## Component Descriptions

### Map-Centric Architecture
- **MapContainer**: Central hub for map visualization and component coordination
- **LayerController**: Manages layer visibility, opacity, and state
- **MapWidgets**: Provides UI controls for map interaction
- **QueryHistoryPanel**: Manages query history and favorites
- **ExportPanel**: Handles layer data export functionality

### Query Processing Pipeline
- **GeospatialChat Interface**: Entry point for user queries
- **Query Analyzer**: Processes and classifies queries
- **Concept Mapping**: Maps query terms to layers and fields
- **Data Fetcher**: Retrieves data from configured layers
- **AI Analysis Service**: Integrates with SHAP microservice
- **Visualization Factory**: Creates appropriate visualizations

### Layer Management
- **Layer Configuration**: Manages layer settings and metadata
- **Layer State**: Tracks layer visibility and properties
- **Layer Error Handler**: Manages layer-related errors
- **Layer Bookmarks**: Saves and restores layer combinations
- **Layer Filter**: Provides search and filtering capabilities

### Visualization System
- **Renderer Manager**: Creates and manages renderers
- **View Synchronization**: Coordinates map view updates
- **Feature Highlighting**: Manages feature selection
- **Popup Configuration**: Configures feature popups
- **Legend Manager**: Manages map legends

### Analysis Integration
- **SHAP Microservice**: Performs advanced statistical analysis
- **Feature Augmentation**: Enhances features with analysis results
- **Result Cache**: Caches analysis results
- **Job Status**: Monitors analysis job progress

### Data Persistence
- **Query History Manager**: Manages query history
- **Local Storage**: Stores layer bookmarks
- **State Persistence**: Saves layer states
- **Cache Manager**: Manages result caching

### Error Handling
- **Error Logging**: Logs system errors
- **Error Recovery**: Handles error recovery
- **Validation**: Validates data and operations

## Sequence Diagrams

### Query Processing Flow
```mermaid
sequenceDiagram
    participant User
    participant Chat as GeospatialChat
    participant Analyzer as QueryAnalyzer
    participant Mapper as ConceptMapping
    participant Fetcher as DataFetcher
    participant AI as AIService
    participant Visual as VisualizationFactory
    participant Map as MapContainer
    participant History as QueryHistoryManager

    User->>Chat: Submit query
    Chat->>Analyzer: Process query
    Analyzer->>Mapper: Map concepts
    Mapper->>Fetcher: Request data
    Fetcher->>AI: Send data for analysis
    AI->>Visual: Create visualization
    Visual->>Map: Update view
    Map->>History: Save query
    History-->>User: Update history panel
```

### Layer Management Flow
```mermaid
sequenceDiagram
    participant User
    participant Widgets as MapWidgets
    participant Map as MapContainer
    participant Controller as LayerController
    participant Config as LayerConfig
    participant State as LayerState
    participant Storage as LocalStorage

    User->>Widgets: Toggle layer
    Widgets->>Map: Update layer state
    Map->>Controller: Handle layer change
    Controller->>Config: Get layer config
    Controller->>State: Update visibility
    State->>Storage: Persist state
    Storage-->>User: Update UI
```

### Visualization Flow
```mermaid
sequenceDiagram
    participant User
    participant Map as MapContainer
    participant Renderer as RendererManager
    participant View as ViewSync
    participant Feature as FeatureHighlight
    participant Popup as PopupConfig
    participant Legend as LegendManager

    User->>Map: Interact with map
    Map->>Renderer: Update renderer
    Renderer->>View: Sync view state
    Renderer->>Feature: Update highlights
    Renderer->>Popup: Configure popups
    Renderer->>Legend: Update legend
    Legend-->>User: Update UI
```

### Analysis Flow
```mermaid
sequenceDiagram
    participant User
    participant AI as AIService
    participant SHAP as SHAPService
    participant Feature as FeatureAugmentation
    participant Cache as ResultCache
    participant Status as JobStatus
    participant Map as MapContainer

    User->>AI: Request analysis
    AI->>SHAP: Submit job
    SHAP->>Status: Start polling
    Status->>SHAP: Check completion
    SHAP->>Feature: Augment features
    Feature->>Cache: Store results
    Cache->>Map: Update visualization
    Map-->>User: Show results
```

### Error Handling Flow
```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Error as ErrorHandler
    participant Logger as ErrorLogging
    participant Recovery as ErrorRecovery
    participant UI as UserInterface

    Component->>Error: Handle error
    Error->>Logger: Log error
    Error->>Recovery: Attempt recovery
    alt Recovery Successful
        Recovery->>Component: Resume operation
        Component-->>User: Continue normal flow
    else Recovery Failed
        Recovery->>UI: Show error message
        UI-->>User: Display error state
    end
``` 