# Visualization Query Examples

This document provides examples of how to phrase queries for each of the 16 supported visualization types. Use these examples as a guide when formulating your own queries.

## 1. Choropleth

Choropleth maps display values using color intensity across geographic areas.

**Example Queries:**
- Show me income distribution across counties
- Map education levels by state
- Visualize home values by zip code
- Show poverty rates across the region
- Create a thematic map of income levels

## 2. Heatmap

Heatmaps show the density or concentration of point data.

**Example Queries:**
- Show density of restaurants in the city
- Create a heat map of crime incidents
- Where are traffic accidents concentrated?
- Heat map of customer locations
- Show concentration of emergency calls
- Display the density of tourist activity

## 3. Scatter

Scatter plots display individual point locations.

**Example Queries:**
- Plot all store locations
- Show individual ATM locations
- Map the position of all fire hydrants
- Display school locations
- Show all bus stops on the map
- Mark each earthquake epicenter on the map

## 4. Cluster

Clusters group similar features based on proximity or attributes.

**Example Queries:**
- Cluster the coffee shops by location
- Group restaurants into clusters
- Show clustered patient locations
- Create clusters of event venues
- Cluster the bike-sharing stations
- Group similar businesses by type and location

## 5. Categorical

Categorical maps show discrete categories rather than continuous values.

**Example Queries:**
- Show land use categories on the map
- Categorize neighborhoods by dominant industry
- Show building types across the city
- Display zoning categories
- Map schools by type (public, private, charter)
- Show property categories by color

## 6. Trends

Trends visualizations show changes over time.

**Example Queries:**
- Show population change from 2010 to 2020
- How has home value changed over the past 5 years?
- Display income growth by county
- Show trend in unemployment rates
- Map the change in air quality over time
- Historical trend of crime rates by neighborhood

## 7. Bivariate (formerly Correlation)

Bivariate visualizations show relationships between two dependent variables using a 3x3 color matrix. This replaces the previous correlation analysis which used problematic normalized differences.

**Example Queries:**
- What is the relationship between income and Nike athletic shoe purchases?
- How does age demographics correlate with athletic shoe buying patterns?
- Analyze the correlation between population diversity and premium athletic shoe purchases
- How do basketball participation rates affect Jordan shoe sales?
- Show the relationship between household income and luxury athletic shoe purchases
- What is the correlation between education level and athletic shoe brand preferences?

## 8. Difference

Difference visualizations show the normalized difference between two compatible variables using a diverging red/blue color scheme.

**Example Queries:**
- Compare Nike vs Adidas athletic shoe purchases across regions
- Where is Nike spending higher than Adidas?
- Show me Nike versus New Balance market share differences
- Compare Nike vs Puma - show me the differences
- Nike vs Jordan - where are the biggest differences?
- Show difference between Nike and Skechers purchases

## 9. Joint High

Joint High visualizations highlight areas where two variables are both high.

**Example Queries:**
- Find neighborhoods with both high income and good schools
- Show areas where both pollution and asthma rates are high
- Identify regions with high quality of life and low crime
- Where are income and education levels both high?
- Find areas with high housing prices and high walkability
- Show places with both good schools and parks

## 10. Proportional Symbol

Proportional Symbol maps use differently sized symbols to represent values.

**Example Queries:**
- Show cities with symbol size based on population
- Use proportional symbols to show earthquake magnitude
- Map sales by store with circle size
- Display revenue by location with bubbles sized by value
- Show COVID cases with symbol size by county
- Create a bubble map of business revenue

## 11. Top N

Top N visualizations highlight the top-ranking features by a specific measure.

**Example Queries:**
- Show top 10 counties by income
- Highlight the 5 neighborhoods with highest property values
- Which 15 districts have the best schools?
- Map the top 20 areas for business growth
- Show 10 cities with highest quality of life scores
- Display the top 5 most populous areas

## 12. Hexbin

Hexbin maps aggregate point data into hexagonal grids.

**Example Queries:**
- Create a hexbin map of customer locations
- Show store density using hexagonal bins
- Aggregate incident reports into hexbins
- Use hexbin to show tourist concentration
- Create hexagonal grid of population density
- Visualize traffic patterns with hexbin aggregation

## 13. Buffer

Buffer visualizations show areas within a specified distance of features.

**Example Queries:**
- Show 5 mile buffer around hospitals
- Create a 10km radius around schools
- What areas are within 2 miles of parks?
- Create 500 meter buffers around transit stops
- Show 1 mile service area around fire stations
- Display neighborhoods within 3km of downtown

## 14. Hotspot

Hotspot maps identify statistically significant spatial clusters.

**Example Queries:**
- Find hotspots of crime incidents
- Show statistically significant clusters of high income
- Identify disease hotspots in the region
- Where are the significant clusters of business activity?
- Show hotspots of accident reports
- Map spatial clusters of high unemployment

## 15. Network

Network visualizations show connections or flows between locations.

**Example Queries:**
- Show transportation connections between cities
- Create a network diagram of trade between countries
- Visualize commuter flows from suburbs to downtown
- Show migration patterns between states
- Map supply chain connections between facilities
- Display flight routes between major airports

## 16. Multivariate

Multivariate visualizations display relationships among three or more variables.

**Example Queries:**
- Compare population, income, and education levels
- Show a multivariate analysis of demographic factors
- Visualize age, income, and health metrics together
- Create a multi-factor analysis of neighborhood quality
- Show income with color, population with size, and education with opacity
- Analyze crime, property value, and school quality in one visualization 