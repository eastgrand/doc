
# Query Classifier Test Report

| Query | Expected Viz | Actual Viz | Expected Intent | Actual Intent | Layers Match | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Show me the top 10 areas with the highest conversion rates | TOP_N | proportional_symbol | ranking | proportional_symbol_analysis | ❌ | ❌ FAIL |
| Which areas have high median disposable income and high conversion rates | JOINT_HIGH | bivariate | joint_high_analysis | bivariate_analysis | ❌ | ❌ FAIL |
| How does income level correlate with conversion rates? | CORRELATION | bivariate | correlation_analysis | bivariate_analysis | ❌ | ❌ FAIL |
| Show me a heatmap of application density | HEATMAP | heatmap | density_analysis | heatmap_analysis | ❌ | ❌ FAIL |
| Show me the conversion rates across all areas | CHOROPLETH | N/A | simple_display | undefined_analysis | ❌ | ❌ FAIL |
