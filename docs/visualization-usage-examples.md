# Visualization Usage Examples

This document provides example queries and usage patterns for all visualization types available in the geospatial chat interface.

## Available Visualization Types

The system supports the following visualization types:

1. **Choropleth** - Shows values across geographic areas using color intensity
2. **Heatmap** - Shows density of points using a heat gradient
3. **Scatter** - Shows points with optional size and color encoding
4. **Cluster** - Groups nearby points into clusters
5. **Categorical** - Colors features based on categories
6. **Trends** - Shows temporal trends across geography
7. **Correlation** - Shows the relationship between two variables
8. **Joint High** - Identifies areas where multiple indicators are high
9. **Proportional Symbol** - Shows values through symbol size
10. **Comparison** - Compares values against a benchmark
11. **Top N** - Highlights the top N regions for a given attribute
12. **Hexbin** - Aggregates points into hexagonal bins
13. **Bivariate** - Shows relationship between two variables using a color matrix
14. **Buffer** - Creates buffer zones around features to analyze proximity
15. **Hotspot** - Identifies statistically significant spatial clusters
16. **Network** - Visualizes connections between points
17. **Multivariate** - Analyzes multiple variables simultaneously

## Example Queries by Visualization Type

### Choropleth Map

The choropleth map shows thematic data by coloring geographic areas according to a value.

**Example Queries:**
- "Show me income distribution across counties"
- "Map education levels by state"
- "Display population density by neighborhood"
- "Visualize home values by zip code"
- "Show poverty rates across the region"

### Heatmap

The heatmap visualizes the density of point features using a color gradient.

**Example Queries:**
- "Show density of restaurants in the city"
- "Create a heat map of crime incidents"
- "Where are traffic accidents concentrated?"
- "Heat map of customer locations"
- "Show concentration of emergency calls"

### Scatter Plot

The scatter plot shows individual point features on the map.

**Example Queries:**
- "Plot all store locations"
- "Show individual ATM locations"
- "Map the position of all fire hydrants"
- "Display school locations"
- "Show all bus stops on the map"

### Cluster Map

The cluster map groups nearby points into clusters to show concentrations.

**Example Queries:**
- "Cluster the coffee shops by location"
- "Group restaurants into clusters"
- "Show clustered patient locations"
- "Create clusters of event venues"
- "Cluster the bike-sharing stations"

### Categorical Map

The categorical map colors features based on discrete categories.

**Example Queries:**
- "Show land use categories on the map"
- "Categorize neighborhoods by dominant industry"
- "Show building types across the city"
- "Display zoning categories"
- "Map schools by type (public, private, charter)"

### Trends Map

The trends map shows change over time across geographic areas.

**Example Queries:**
- "Show population change from 2010 to 2020"
- "How has home value changed over the past 5 years?"
- "Display income growth by county"
- "Show trend in unemployment rates"
- "Map the change in air quality over time"

### Correlation Map

The correlation map shows the relationship between two variables.

**Example Queries:**
- "Show correlation between income and education"
- "Compare home prices and crime rates"
- "How does income relate to health outcomes?"
- "Relationship between school funding and test scores"
- "Compare pollution levels and asthma rates"

### Joint High Analysis

The joint high analysis identifies areas where multiple indicators are high.

**Example Queries:**
- "Find neighborhoods with both high income and good schools"
- "Show areas where both pollution and asthma rates are high"
- "Identify regions with high quality of life and low crime"
- "Where are income and education levels both high?"
- "Find areas with high housing prices and high walkability"

### Proportional Symbol Map

The proportional symbol map uses symbol size to represent values.

**Example Queries:**
- "Show cities with symbol size based on population"
- "Use proportional symbols to show earthquake magnitude"
- "Map sales by store with circle size"
- "Display revenue by location with bubbles sized by value"
- "Show COVID cases with symbol size by county"

### Comparison Map

The comparison map compares values against a benchmark.

**Example Queries:**
- "Compare income to national average by county"
- "Show counties above and below state poverty level"
- "Map areas exceeding air quality standards"
- "Compare local prices to regional average"
- "Show test scores relative to district mean"

### Top N Map

The top N map highlights the highest-ranking regions for a given attribute.

**Example Queries:**
- "Show top 10 counties by income"
- "Highlight the 5 neighborhoods with highest property values"
- "Which 15 districts have the best schools?"
- "Map the top 20 areas for business growth"
- "Show 10 cities with highest quality of life scores"

### Hexbin Map

The hexbin map aggregates points into hexagonal bins for better pattern visualization.

**Example Queries:**
- "Create a hexbin map of customer locations"
- "Show store density using hexagonal bins"
- "Aggregate incident reports into hexbins"
- "Use hexbin to show tourist concentration"
- "Create hexagonal grid of population density"

### Bivariate Map

The bivariate map shows the relationship between two variables using a color matrix.

**Example Queries:**
- "Create a bivariate map of income and education"
- "Show income and poverty relationship with a color matrix"
- "Map population density against home values using bivariate colors"
- "Create a two-variable map of age and income"
- "Show the relationship between health outcomes and education using a bivariate map"

### Buffer Analysis

The buffer analysis creates zones around features to analyze proximity.

**Example Queries:**
- "Show 5 mile buffer around hospitals"
- "Create a 10km radius around schools"
- "What areas are within 2 miles of parks?"
- "Create 500 meter buffers around transit stops"
- "Show 1 mile service area around fire stations"

### Hotspot Analysis

The hotspot analysis identifies statistically significant clusters.

**Example Queries:**
- "Find hotspots of crime incidents"
- "Show statistically significant clusters of high income"
- "Identify disease hotspots in the region"
- "Where are the significant clusters of business activity?"
- "Show hotspots of accident reports"

### Network Analysis

The network analysis visualizes connections and flows between points.

**Example Queries:**
- "Show transportation connections between cities"
- "Create a network diagram of trade between countries"
- "Visualize commuter flows from suburbs to downtown"
- "Show migration patterns between states"
- "Map supply chain connections between facilities"

### Multivariate Analysis

The multivariate analysis visualizes multiple variables simultaneously.

**Example Queries:**
- "Compare population, income, and education levels"
- "Show a multivariate analysis of demographic factors"
- "Visualize age, income, and health metrics together"
- "Create a multi-factor analysis of neighborhood quality"
- "Show income with color, population with size, and education with opacity"

## Using Visualizations in the Chat Interface

To create these visualizations using the geospatial chat interface, simply type your query in natural language. The AI will:

1. Analyze your query to determine the appropriate visualization type
2. Select relevant data layers
3. Configure visualization parameters
4. Generate and display the visualization

You can also be more explicit by specifying the visualization type in your query, for example:

- "Create a heatmap of crime incidents"
- "Show a choropleth map of income by county"
- "Make a proportional symbol map of population by city"

## Customizing Visualizations

After a visualization is created, you can customize it by specifying:

- Color schemes: "Use a green to red color scheme"
- Classification method: "Use quantile classification"
- Number of classes: "Use 5 classes"
- Filters: "Only show areas with population over 10,000"
- Labels: "Add labels showing the values"

Example: "Show income by county using a blue color scheme with 7 classes and quantile classification." 