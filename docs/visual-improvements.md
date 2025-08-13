# Visual Improvements Implementation Plan

**Version 1.0 | August 2025**  
*Comprehensive Firefly-based Light/Dark Mode Implementation*

---

## **Overview**

This document outlines the systematic implementation of a light/dark mode switcher using the Firefly style system. The improvements will maintain all existing functionality while adding a cohesive visual theme across the entire application.

## **Phase 1: Foundation Setup**

### **1.1 Create Theme Infrastructure**
- [ ] Create `/styles/firefly-theme.css` with complete Firefly CSS system
- [ ] Set up CSS custom properties for theme switching
- [ ] Create theme context and provider for React
- [ ] Implement theme persistence with localStorage

### **1.2 Remove Basemap Gallery Widget**
- [ ] Locate and remove basemap gallery widget from map interface
- [ ] Remove associated icons and controls
- [ ] Reclaim space for theme switcher placement

### **1.3 Theme Switcher Component**
- [ ] Design toggle component (light/dark modes)
- [ ] Position switcher in reclaimed basemap gallery space
- [ ] Implement smooth transitions between modes
- [ ] Add appropriate icons (sun/moon or similar)

## **Phase 2: Basemap Integration**

### **2.1 Dynamic Basemap Switching**
- [ ] Light mode: Switch to `"gray-vector"` or `"streets-vector"` 
- [ ] Dark mode: Switch to `"dark-gray-vector"`
- [ ] Update MapClient.tsx to respond to theme changes
- [ ] Ensure smooth basemap transitions

### **2.2 Map Component Theming**
- [ ] Apply Firefly colors to map legends
- [ ] Update constraint visualization (if visible)
- [ ] Theme map controls and UI elements

## **Phase 3: Core Component Theming**

### **3.1 Sidebars**
- [ ] Update main sidebar backgrounds and borders
- [ ] Apply Firefly color palette to sidebar elements
- [ ] Ensure text contrast meets accessibility standards
- [ ] Theme scrollbars and hover states

### **3.2 Tab System**
- [ ] Update tab backgrounds and active states
- [ ] Apply Firefly accent colors to tab indicators
- [ ] Ensure tab text readability in both modes
- [ ] Theme tab transitions and animations

### **3.3 Dialog Windows**
- [ ] Update modal/dialog backgrounds
- [ ] Apply Firefly styling to dialog borders and shadows
- [ ] Theme dialog buttons and form elements
- [ ] Ensure overlay backgrounds work in both modes

## **Phase 4: Text and Typography**

### **4.1 Text Color System**
- [ ] Define text color hierarchy (primary, secondary, muted)
- [ ] Apply appropriate contrast ratios for accessibility
- [ ] Update headings and body text colors
- [ ] Theme code blocks and preformatted text

### **4.2 Interactive Elements**
- [ ] Update button styling for both themes
- [ ] Theme form inputs and controls
- [ ] Apply Firefly colors to links and interactive text
- [ ] Ensure focus states are visible in both modes

## **Phase 5: Data Visualization Integration**

### **5.1 Chart and Graph Theming**
- [ ] Apply Firefly color palette to data visualizations
- [ ] Update chart backgrounds and gridlines
- [ ] Ensure data points and lines are visible in both modes
- [ ] Theme tooltips and data labels

### **5.2 Analysis Components**
- [ ] Update analysis results styling
- [ ] Apply Firefly colors to statistical displays
- [ ] Theme progress bars and loading states
- [ ] Ensure data readability in both modes

## **Phase 6: Advanced Features**

### **6.1 Animation and Transitions**
- [ ] Implement smooth theme transitions
- [ ] Add Firefly glow effects to key UI elements
- [ ] Create subtle animations for interactive elements
- [ ] Optimize performance for mobile devices

### **6.2 Accessibility Enhancements**
- [ ] Implement high contrast mode support
- [ ] Add reduced motion preferences
- [ ] Ensure WCAG AA compliance
- [ ] Test with screen readers

## **Implementation Strategy**

### **Step-by-Step Approach**
1. **Foundation First**: Set up theme infrastructure and switcher
2. **Map Integration**: Update basemap and map-related components
3. **Component by Component**: Theme one major component per iteration
4. **Test and Iterate**: Test each phase before proceeding
5. **Performance Optimization**: Optimize after basic implementation

### **Git Strategy**
- Create feature branch for each phase
- Push incremental changes frequently
- Test on each push to catch issues early
- Merge phases only after thorough testing

## **Technical Specifications**

### **Color Palette Usage**

**Dark Mode (Primary Colors)**:
- Primary Accent: `#00ffff` (Cyan - Firefly Color 11)
- Secondary Accent: `#40ff00` (Chartreuse - Firefly Color 15) 
- Warning: `#ffff00` (Yellow - Firefly Color 18)
- Error: `#ff0040` (Deep Pink - Firefly Color 1)

**Light Mode (Adapted Colors)**:
- Primary Accent: `#00cccc` (Darker Cyan - Firefly Light Color 11)
- Secondary Accent: `#33cc00` (Darker Chartreuse - Firefly Light Color 15)
- Warning: `#cccc00` (Darker Yellow - Firefly Light Color 18)
- Error: `#cc0033` (Darker Deep Pink - Firefly Light Color 1)

### **Background Specifications**

**Dark Mode**:
- Primary Background: `#1a1a1a` (Very dark gray)
- Secondary Background: `#2a2a2a` (Dark gray)
- Card/Panel Background: `#333333` (Medium dark gray)

**Light Mode**:
- Primary Background: `#f8f8f8` (Very light gray)
- Secondary Background: `#f0f0f0` (Light gray)
- Card/Panel Background: `#ffffff` (White)

### **Typography System**

**Text Colors**:
- **Dark Mode**: Primary `#ffffff`, Secondary `#cccccc`, Muted `#999999`
- **Light Mode**: Primary `#333333`, Secondary `#666666`, Muted `#999999`

## **Files to Modify**

### **New Files**
- `/styles/firefly-theme.css` - Complete Firefly CSS system
- `/components/theme/ThemeProvider.tsx` - Theme context provider
- `/components/theme/ThemeSwitcher.tsx` - Toggle component
- `/hooks/useTheme.ts` - Theme management hook

### **Existing Files to Update**
- `/components/map/MapClient.tsx` - Basemap switching
- `/styles/globals.css` - Global theme integration
- `/components/[various]` - Component-specific theming
- `/app/layout.tsx` - Theme provider integration

## **Performance Considerations**

### **Optimization Strategies**
- Use CSS custom properties for theme switching (no JavaScript)
- Implement hardware acceleration for smooth transitions
- Minimize reflows during theme changes
- Optimize Firefly glow effects for mobile devices

### **Mobile Adaptations**
- Reduce glow effects on small screens
- Simplify animations on low-powered devices
- Ensure touch targets meet accessibility guidelines
- Test performance on various device types

## **Testing Strategy**

### **Visual Testing**
- Test both themes in all major components
- Verify contrast ratios meet WCAG standards
- Test with various screen sizes and orientations
- Validate print styles work in both modes

### **Functional Testing**
- Ensure no functionality is lost during theming
- Test theme persistence across sessions
- Verify system preference detection works
- Test with assistive technologies

### **Performance Testing**
- Monitor frame rates during theme transitions
- Test with large datasets and many UI elements
- Profile memory usage with theme switching
- Test on low-powered devices

## **Success Criteria**

### **Visual Quality**
- [ ] Consistent Firefly aesthetic across all components
- [ ] Smooth transitions between light and dark modes
- [ ] High contrast ratios for accessibility compliance
- [ ] Professional appearance suitable for production use

### **Functionality**
- [ ] No loss of existing functionality
- [ ] Theme preference persists across sessions
- [ ] Automatic detection of system preferences
- [ ] Basemap switches appropriately with theme

### **Performance**
- [ ] Theme switching completes within 300ms
- [ ] No performance degradation on mobile devices
- [ ] Smooth animations without frame drops
- [ ] Efficient memory usage during theme changes

---

## **Next Steps**

1. **Begin Phase 1**: Set up foundation infrastructure
2. **Create Feature Branch**: `feature/firefly-theme-implementation`
3. **Implement Theme Switcher**: Start with basic toggle functionality
4. **Test and Iterate**: Push frequently and test thoroughly

This implementation will transform the application with a cohesive, professional appearance while maintaining all existing functionality and improving accessibility.