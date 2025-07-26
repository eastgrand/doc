# Plan: NLP-Powered Geographic Area Filtering

This document outlines the implementation plan for a state-of-the-art spatial filtering feature. The system will use a Natural Language Processing (NLP) model to understand user queries and a geocoding service to define geographic boundaries, allowing for highly accurate, context-aware analysis.

The architecture uses a sequential, multi-step process that intelligently combines frontend orchestration with backend processing.

## Phase 1: Frontend - Intelligent Query Parsing & Geocoding

This phase occurs in the `handleSubmit` function within `geospatial-chat-interface.tsx`.

### Step 1: Named Entity Recognition (NER) with Hugging Face

The first step is to determine if the user's query contains a specific place name.

-   **File to Modify**: `geospatial-chat-interface.tsx`, at the beginning of the `handleSubmit` function.
-   **Action**: Before any existing analysis code (like `conceptMapping`), make an asynchronous `fetch` call to a Hugging Face Inference API.
-   **Recommended Model**: `dslim/bert-base-NER`. This is a powerful, general-purpose model adept at recognizing locations, organizations, and people.
-   **API Endpoint**: `https://api-inference.huggingface.co/models/dslim/bert-base-NER`
-   **Authentication**: The request must include a Hugging Face API token in the `Authorization` header (`Bearer hf_...`). This token will be stored securely as a Next.js environment variable (e.g., `NEXT_PUBLIC_HUGGINGFACE_API_KEY`).
-   **Implementation Logic**: The code will send the raw query text to the model. It will then parse the array of entities in the JSON response, specifically looking for any entity with the label `GPE` (Geopolitical Entity), `LOC` (Location), or similar. If found, the corresponding `word` (e.g., "southern Ontario") will be extracted and stored in a variable.

### Step 2: Geographic Boundary Definition with OpenStreetMap

Once a place name is identified, we need to get its actual geometric boundaries.

-   **File to Modify**: `geospatial-chat-interface.tsx`, immediately following a successful NER API call.
-   **Action**: If a location entity was extracted, make a `fetch` request to the OpenStreetMap Nominatim API. This is a free, open geocoding service.
-   **API Endpoint**: `https://nominatim.openstreetmap.org/search`
-   **Request Parameters**: The request must be structured with specific query parameters: `?q=<location_name>&format=jsonv2&polygon_geojson=1`. The `polygon_geojson=1` parameter is crucial as it requests the full boundary polygon.
-   **Usage Policy Compliance**: **Crucially**, all requests to Nominatim must include a custom `User-Agent` header that identifies our application. This is a strict requirement of their usage policy.
-   **Implementation Logic**: The code will parse the JSON response from Nominatim. It will look for the first object in the results array that contains a `geojson` property of type `Polygon` or `MultiPolygon`. This GeoJSON object represents the boundary of the location and will be stored.

## Phase 2: Frontend to Backend Communication

### Step 3: Augment the Microservice Request

The boundary data must be sent to our own backend for processing.

-   **Files to Modify**:
    1.  `lib/analytics/types.ts`: Add a new optional field `filterGeometry?: any;` to the `AnalysisServiceRequest` interface.
    2.  `geospatial-chat-interface.tsx`: In the `handleSubmit` function, when constructing the `microserviceRequest` object.
-   **Implementation Logic**: If a GeoJSON `filterGeometry` was successfully retrieved from Nominatim, it will be added to the `microserviceRequest` object. If no location was found or the geocoding failed, this field will be omitted.

## Phase 3: Backend - Spatially Filtered Analysis

### Step 4: Enhancing the Python Microservice

Our Python backend needs to be able to understand and use the new geometry data.

-   **File to Modify**: The main `/analyze` endpoint logic in the Python microservice.
-   **Action**: The endpoint will be updated to check for the presence of the `filterGeometry` key in the incoming request payload.
-   **Implementation Logic**:
    -   If `filterGeometry` is not present, the analysis proceeds as it does now, over the entire dataset.
    -   If `filterGeometry` **is** present, the service will use a library like **GeoPandas** to perform a spatial filter. It will create a GeoDataFrame from the primary dataset and use the provided GeoJSON polygon to select only the rows that fall `within` or `intersect` with that geometry.
    -   All subsequent analysis (e.g., SHAP, correlation calculations) will then be performed **only on this pre-filtered subset** of the data.

## Phase 4: Frontend - User Feedback and Visualization

### Step 5: Visual Confirmation on the Map

The user must be shown what area was used for the analysis.

-   **File to Modify**: `geospatial-chat-interface.tsx`.
-   **Action**: Create a new, dedicated `GraphicsLayer` in the ArcGIS MapView for displaying the filter boundary.
-   **Implementation Logic**: When a `filterGeometry` is successfully used in a query, a new `Graphic` will be created from the GeoJSON polygon returned by Nominatim. This graphic will be styled with a semi-transparent fill and a distinct outline and added to the dedicated graphics layer. This provides immediate, unambiguous visual feedback to the user. This layer will be cleared before each new query is submitted.

This plan creates a clean separation of concerns: the frontend is responsible for understanding the user's intent (including geographic scope), while the backend is responsible for executing the analysis on the correctly filtered data. It's a scalable approach that will allow us to easily add more predefined geographic regions in the future. 