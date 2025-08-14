# MPIQ AI Chat Improvements & Documentation Tasks

**Date:** January 14, 2025  
**Status:** Planning Phase

## IMPROVEMENTS

### Analysis & Visualization
- [ ] **Only strategic analysis is working?** - Investigate other analysis types
- [ ] **Analysis visualizations are still not using firefly colors** - Update color schemes
- [ ] **Does "Score Distribution Buckets" include a chart?** - Create visualization if missing

### UI/UX Layout & Design
- [ ] **Map container is centered on screen, but needs to be centered between sidebars** - Adjust layout positioning
- [ ] **Remove "data completeness" and "data quality" from pre-analysis stats** - Clean up stats display
- [ ] **Slider handles still missing** - Fix slider component styling
- [ ] **Seems to be using Canada infographics, no thumbnails** - Update infographic content and add thumbnails
- [ ] **Remove "what you'll get" box from infographicQ view** - Clean up infographic interface
- [ ] **Scrolling not working in infographicsQ view** - Fix scrolling functionality

### Dark/Light Mode Issues
- [ ] **IQ in IQbuilder needs to match firefly green when in dark mode** - Update color consistency
- [ ] **If widget is open when switching light/dark mode it disappears (but does not close)** - Fix widget persistence
- [ ] **Map graphics disappear when switching modes** - Maintain map graphics across mode changes
- [ ] **Widgets don't load correctly after switching modes** - Fix widget state management
- [ ] **Everything visible should persist when switching modes** - Comprehensive mode switching fixes
- [ ] **Widget containers only have dark mode header - contents is still light mode all the time** - Fix widget content styling
- [ ] **Should light mode go back to non-firefly colors?** - Design decision needed

### Map & Interaction Features
- [ ] **Zoomto in map popup should flash feature as well as zoom** - Enhance map interaction feedback
- [ ] **Buffer step has light mode selected button/card and input area when in dark mode** - Fix styling inconsistency
- [ ] **Walk-time, drive-time not working** - Debug and fix routing features

### Loading & Initial State
- [ ] **Let's create a more interesting loading page** - Explore data-driven loading content (discuss implementation)
- [ ] **What are some ideas for not having a blank map on map page load?** - Consider random visualization or default content (discuss options)
- [ ] **Animations are not working (if implemented)** - Audit and fix animation implementations

### Theming & Customization
- [ ] **How to create a custom css theme?** - Document theming system and create guide

## DOCUMENTATION/CLEAN-UP

### Documentation System
- [ ] **Use created or edited dates of docs to create full documentation and diagrams** - Automated documentation generation
- [ ] **Recommended and minimum requirements to run MPIQ effectively** - System requirements documentation

### Legal & Compliance
- [ ] **R2 disclaimer?** - Add statistical disclaimer (e.g., "does not imply a causal relationship...")

### Code Clean-up
- [ ] **Search for remnants of previous project** - Remove Nike, athletic, fitness, brand references throughout codebase

---

## Priority Levels (To be assigned)
- **High:** Critical functionality issues
- **Medium:** UX improvements and consistency fixes  
- **Low:** Nice-to-have features and enhancements

## Next Steps
1. Review and prioritize items
2. Assign timeline estimates
3. Begin implementation planning
4. Create detailed technical specifications for complex items