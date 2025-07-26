# Schema Refactor Plan: Single Source of Truth

**Objective:** To eliminate schema discrepancies between the frontend and the SHAP microservice by creating a single, authoritative source of truth for all data fields, their canonical names, and their user-friendly aliases.

**Guiding Principles:**

1.  **Backend is Authoritative:** The microservice holds the master definition of the data schema.
2.  **Dynamic Frontend:** The frontend will fetch this schema on startup and configure itself dynamically.
3.  **No Hardcoded Field Names:** All hardcoded field alias maps and lists in the frontend will be removed.
4.  **Universal Logic:** The new system must work for all visualization and query types without special casing (e.g., for `joint-high` vs. `correlation`).

---

## Phase 1: Backend Refactoring (SHAP Microservice)

### Task 1.1: Consolidate Field Definitions

-   **File:** `shap-microservice/map_nesto_data.py`
-   **Action:** Create a new, comprehensive data structure at the top of the file that defines every field. This structure will contain the canonical name, a list of all known aliases (including those currently in the frontend), and a brief description.

-   **Proposed Structure:**

    ```python
    MASTER_SCHEMA = {
        'FREQUENCY': {
            'canonical_name': 'FREQUENCY',
            'aliases': [
                'frequency', 'applications', 'application',
                'numberOfApplications', 'number_of_applications', 'mortgage_applications'
            ],
            'description': 'Total number of mortgage applications.'
        },
        'mortgage_approvals': {
            'canonical_name': 'mortgage_approvals',
            'raw_mapping': 'SUM_FUNDED',
            'aliases': [
                'approvals', 'approval', 'funded_applications', 'funded'
            ],
            'description': 'Total number of funded mortgage applications, derived from SUM_FUNDED.'
        },
        'conversion_rate': {
            'canonical_name': 'conversion_rate',
            'raw_mapping': 'CONVERSION_RATE',
            'aliases': ['conversion rate', 'conversionrate'],
            'description': 'The ratio of funded applications to total applications.'
        },
        # ... Add entries for all other fields like median_income, condo_ownership_pct, etc.
    }
    ```
-   **Refactor:** The existing `FIELD_MAPPINGS` dictionary will be dynamically generated from this `MASTER_SCHEMA` to maintain the existing data cleaning logic.

### Task 1.2: Create a New Schema Endpoint

-   **File:** `shap-microservice/app.py`
-   **Action:** Add a new Flask route `/api/v1/schema`.
-   **Functionality:**
    -   This endpoint will import the `MASTER_SCHEMA` from `map_nesto_data.py`.
    -   It will format this schema into a clean JSON response.
    -   The JSON response will be sent to any client that requests it. This eliminates the need for the frontend to have any hardcoded knowledge of the schema.
    -   The endpoint should also include a simple list of all canonical field names for easy access.

-   **Example JSON Response from `GET /api/v1/schema`:**
    ```json
    {
      "fields": {
        "FREQUENCY": {
          "canonical_name": "FREQUENCY",
          "aliases": ["frequency", "applications", ...],
          "description": "Total number of mortgage applications."
        },
        "mortgage_approvals": {
          "canonical_name": "mortgage_approvals",
          "aliases": ["approvals", "funded", ...],
          "description": "Total number of funded mortgage applications, derived from SUM_FUNDED."
        }
        // ...
      },
      "known_fields": ["FREQUENCY", "mortgage_approvals", "conversion_rate", ...]
    }
    ```

---

## Phase 2: Frontend Refactoring (Next.js App)

### Task 2.1: Create a Schema Fetching Service

-   **File:** Create a new file, e.g., `lib/analytics/schema.ts`.
-   **Functionality:**
    -   Define a function, `fetchSchema()`, that makes a `GET` request to the backend's `/api/v1/schema` endpoint.
    -   This function should be called once when the application initializes (e.g., in a top-level component or context provider).
    -   The fetched schema should be stored in a globally accessible state (e.g., using React Context or a state management library like Zustand/Redux).

### Task 2.2: Refactor `geospatial-chat-interface.tsx`

-   **Action:** Consume the schema from the global state.
-   **Changes:**
    1.  **Remove `FIELD_ALIAS`:** Delete the large, hardcoded `FIELD_ALIAS` object.
    2.  **Remove `KNOWN_FIELDS`:** Delete the hardcoded `KNOWN_FIELDS` array.
    3.  **Generate Aliases Dynamically:** The logic that currently uses `FIELD_ALIAS` (like the `getAlias` function) will be modified. It will now iterate through the `fields` object from the fetched schema to find the correct canonical name for a given user term.
    4.  **Handle Loading State:** The chat input should be disabled or show a loading indicator until the schema has been successfully fetched from the backend, preventing users from making requests before the app is ready.
    5.  **Remove Special Logic:** The line `canonicalMatched.filter(f => f !== 'FREQUENCY')` will be removed. All filtering logic should be generic and not dependent on specific field names. If certain fields are heavyweight, this information should be included in the schema from the backend (e.g., `"is_heavy": true`).

---

## Phase 3: Verification

-   **Testing:**
    -   Verify that `joint-high`, `correlation`, and single-metric `choropleth` visualizations all work correctly using different aliases for the metrics (e.g., "show areas with high applications and conversion rate").
    -   Confirm that error messages for unknown fields are still generated correctly, now using the dynamic schema for suggestions.
    -   Test the application's behavior while the schema is loading.
-   **Documentation:**
    -   Update `main-reference.md` to reflect the new, simplified architecture and remove the now-obsolete instructions about manually syncing aliases between the frontend and backend. 