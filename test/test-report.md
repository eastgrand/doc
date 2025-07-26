
# Query Classifier Test Report

| Query | Expected Viz | Actual Viz | Expected Intent | Actual Intent | Layers Match | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Show me the top 10 areas with the highest conversion rates | TOP_N | top_n | ranking | top_n_analysis | ✅ | ✅ PASS |
| Which areas have high median disposable income and high conversion rates | JOINT_HIGH | joint_high | joint_high_analysis | joint_high_analysis | ✅ | ✅ PASS |
| How does income level correlate with conversion rates? | CORRELATION | correlation | correlation_analysis | correlation_analysis | ✅ | ✅ PASS |
| Show me a heatmap of application density | HEATMAP | heatmap | density_analysis | heatmap_analysis | ✅ | ✅ PASS |
| Show me the conversion rates across all areas | CHOROPLETH | choropleth | simple_display | choropleth_analysis | ✅ | ✅ PASS |
