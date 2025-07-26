#!/bin/bash

# Check if mmdc is installed
if ! command -v mmdc &> /dev/null; then
    echo "Installing @mermaid-js/mermaid-cli..."
    npm install -g @mermaid-js/mermaid-cli
fi

# Create output directory if it doesn't exist
mkdir -p diagrams

# Extract and generate each diagram
echo "Generating diagrams..."

# Main flow diagram
mmdc -i FLOW_DIAGRAM.md -o diagrams/main_flow.png

# Sequence diagrams
# Query Processing Flow
cat > temp_query.mmd << 'EOL'
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
EOL
mmdc -i temp_query.mmd -o diagrams/query_flow.png

# Layer Management Flow
cat > temp_layer.mmd << 'EOL'
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
EOL
mmdc -i temp_layer.mmd -o diagrams/layer_flow.png

# Visualization Flow
cat > temp_visual.mmd << 'EOL'
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
EOL
mmdc -i temp_visual.mmd -o diagrams/visual_flow.png

# Analysis Flow
cat > temp_analysis.mmd << 'EOL'
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
EOL
mmdc -i temp_analysis.mmd -o diagrams/analysis_flow.png

# Error Handling Flow
cat > temp_error.mmd << 'EOL'
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
EOL
mmdc -i temp_error.mmd -o diagrams/error_flow.png

# Clean up temporary files
rm temp_*.mmd

echo "Diagrams generated in the 'diagrams' directory!" 