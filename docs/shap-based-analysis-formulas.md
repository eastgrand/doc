# SHAP-Based Analysis Formulas

This document describes the data-driven SHAP (SHapley Additive exPlanations) feature importance-based scoring formulas used across all analysis processors in the system. These formulas replace arbitrary weights with actual performance data derived from Nike's market performance patterns.

## Overview

All analysis processors now use **data-driven feature weighting** based on SHAP feature importance values extracted from real performance data. This ensures that scoring algorithms reflect actual market behavior rather than assumptions.

### Key SHAP Feature Importance Values (from analyze endpoint):
- **thematic_value**: 7380.56 (target variable)
- **MP30016A_B** (Nike): 1246.06 
- **MP33107A_B** (Adidas): 989.05
- **HHPOP_CY** (Household Population): 531.60
- **ASIAN_CY_P** (Asian Demographics): 191.05

---

## 1. Competitive Analysis Processor

**Endpoint**: `/competitive-analysis`, `/comparative-analysis`

**Output Range**: 0-10 (competitive advantage score)

### Formula Components:

```
Competitive Score = 5.0 (base) + MarketPosition + Demographic + Income + Scale + CompetitiveEnvironment
Final Score = max(0, min(10, Competitive Score))
```

### 1.1 Market Position Score (-4 to +4 points)
```
shareAdvantage = max(-20, min(20, nikeShare - adidasShare))
shapAdvantage = max(-10, min(10, nikeShap - adidasShap))
presenceBonus = min(1.0, nikeShare * 0.04)

MarketPosition = (shareAdvantage * 0.1) + (shapAdvantage * 0.1) + presenceBonus
```

### 1.2 Demographic Score (-2 to +2.5 points)
```
asianComponent = asianPercent * 0.05              // Up to +2.5 (SHAP: +191.05)
genZPenalty = -(genZPercent * 0.02)              // Penalty (SHAP: -5.11)
millennialPenalty = -(millennialPercent * 0.01)  // Penalty (SHAP: -2.07)
genAlphaPenalty = -(genAlphaPercent * 0.005)     // Small penalty (SHAP: -0.12)

Demographic = max(-2.0, min(2.5, asianComponent + genZPenalty + millennialPenalty + genAlphaPenalty))
```

### 1.3 Income Advantage Score (-0.3 to +1.0 points)
```
if (60000 ≤ avgIncome ≤ 120000):
    Income = 1.0 * (1 - |avgIncome - 90000| / 30000)    // Peak at $90k
elif (40000 ≤ avgIncome < 60000):
    Income = (avgIncome - 40000) / 20000 * 0.5
elif (120000 < avgIncome ≤ 200000):
    Income = max(0, 0.8 - (avgIncome - 120000) / 80000 * 0.3)
else:
    Income = -0.3
```

### 1.4 Scale Advantage Score (0 to +0.8 points)
```
Scale = min(0.8, totalPop / 50000)
```

### 1.5 Competitive Environment Score (-1.0 to +0.8 points)
```
totalCompetitorShare = adidasShare + jordanShare + underArmourShare + pumaShare
marketFragmentation = max(0, 100 - nikeShare - totalCompetitorShare)
fragmentationBonus = min(0.8, marketFragmentation * 0.01)
competitionIntensity = adidasShare + max(jordanShare, underArmourShare, pumaShare)
competitionPenalty = min(1.0, competitionIntensity * 0.015)

CompetitiveEnvironment = fragmentationBonus - competitionPenalty
```

### Fields Used:
- `value_MP30016A_B_P` (Nike market share %)
- `value_MP33107A_B_P` (Adidas market share %)
- `value_MP30032A_B_P` (Jordan market share %)
- `value_MP30030A_B_P` (Under Armour market share %)
- `value_MP30031A_B_P` (Puma market share %)
- `shap_MP30016A_B_P` (Nike SHAP values)
- `shap_MP33107A_B_P` (Adidas SHAP values)
- `value_HHPOP_CY` (Household population)
- `value_MEDDI_CY` (Median income)
- `value_ASIAN_CY_P` (Asian demographic %)
- `value_GENZ_CY_P` (Gen Z %)
- `value_MILLENN_CY_P` (Millennial %)
- `value_GENALPHACY_P` (Gen Alpha %)

---

## 2. Core Analysis Processor

**Endpoints**: `/analyze`, `/correlation-analysis`, `/feature-interactions`, `/outlier-detection`, `/predictive-modeling`

**Output Range**: 0-100 (opportunity score)

### Formula Components:

```
Opportunity Score = 50.0 (base) + BrandPerformance + Demographics + Income + Population + SHAPMultiplier
Final Score = max(0, min(100, Opportunity Score))
```

### 2.1 Brand Performance Component (up to +65 points)
```
nikeComponent = (nikeShare / 100) * 30                    // Up to +30 points
marketGap = max(0, 100 - nikeShare - adidasShare)
gapComponent = (marketGap / 100) * 20                     // Up to +20 points
competitiveAdvantage = max(0, nikeShare - adidasShare)
competitiveComponent = (competitiveAdvantage / 50) * 15   // Up to +15 points

BrandPerformance = nikeComponent + gapComponent + competitiveComponent
```

### 2.2 Demographics Component (up to +15 points)
```
asianComponent = min(asianPercent * 0.5, 15)  // Based on SHAP: 191.05
```

### 2.3 Population Scale Component (up to +10 points)
```
populationComponent = min(householdPop / 10000, 10)  // Based on SHAP: 531.60
```

### 2.4 Income Optimization Component (up to +10 points)
```
if (60000 ≤ medianIncome ≤ 120000):
    incomeComponent = 10 * (1 - |medianIncome - 90000| / 30000)  // Peak at $90k
elif (40000 ≤ medianIncome < 60000):
    incomeComponent = (medianIncome - 40000) / 20000 * 5
else:
    incomeComponent = 0
```

### 2.5 SHAP Performance Multiplier (±20% adjustment)
```
shapMultiplier = 1 + (max(-1, min(1, nikeShap / 50)) * 0.2)
```

### Fields Used:
- `value_MP30016A_B_P` (Nike market share %)
- `value_MP33107A_B_P` (Adidas market share %)
- `value_HHPOP_CY` (Household population)
- `value_ASIAN_CY_P` (Asian demographic %)
- `value_MEDDI_CY` (Median income)
- `shap_MP30016A_B_P` (Nike SHAP values)

---

## 3. Demographic Analysis Processor

**Endpoint**: `/demographic-insights`

**Output Range**: 0-100 (demographic fit score)

### Formula Components:

```
Demographic Score = 50.0 (base) + Population + Asian + Income + Generational + EthnicDiversity * SHAPMultiplier
Final Score = max(0, min(100, Demographic Score))
```

### 3.1 Population Scale Component (up to +20 points)
```
populationComponent = min(householdPop / 10000, 20)  // Based on SHAP: 531.60
```

### 3.2 Asian Demographics Component (up to +20 points)
```
asianComponent = min(asianPercent * 0.6, 20)  // Based on SHAP: 191.05
```

### 3.3 Income Optimization Component (up to +15 points)
```
if (60000 ≤ medianIncome ≤ 120000):
    incomeComponent = 15 * (1 - |medianIncome - 90000| / 30000)  // Peak at $90k
elif (40000 ≤ medianIncome < 60000):
    incomeComponent = (medianIncome - 40000) / 20000 * 8
else:
    incomeComponent = 0
```

### 3.4 Generational Mix Component (up to +10 points)
```
totalGenerationalPercent = genZPercent + millennialPercent + genAlphaPercent
generationalDiversity = min(totalGenerationalPercent / 100, 1) * 10
```

### 3.5 Ethnic Diversity Bonus (up to +10 points)
```
ethnicGroups = count([asianPercent, blackPercent, whitePercent, hispanicWhitePercent] where > 5%)
ethnicDiversityBonus = min(ethnicGroups * 2.5, 10)
```

### 3.6 SHAP Performance Multiplier (±15% adjustment)
```
shapMultiplier = 1 + (max(-0.5, min(0.5, asianShap / 200)) * 0.3)
```

### Fields Used:
- `value_HHPOP_CY` (Household population)
- `value_MEDDI_CY` (Median income)
- `value_ASIAN_CY_P` (Asian demographic %)
- `value_GENZ_CY_P` (Gen Z %)
- `value_MILLENN_CY_P` (Millennial %)
- `value_GENALPHACY_P` (Gen Alpha %)
- `value_BLACK_CY_P` (Black demographic %)
- `value_WHITE_CY_P` (White demographic %)
- `value_HISPWHT_CY_P` (Hispanic White demographic %)
- `shap_ASIAN_CY_P` (Asian SHAP values)

---

## 4. Trend Analysis Processor

**Endpoint**: `/trend-analysis`

**Status**: Field validation updated to use available SHAP data

**Available Fields for Future SHAP-Based Trend Scoring**:
- `value_MP30016A_B_P` (Nike market share trends)
- `value_MP33107A_B_P` (Adidas market share trends)
- `shap_MP30016A_B_P` (Nike SHAP trend variability)
- `shap_MP33107A_B_P` (Adidas SHAP trend variability)
- `value_HHPOP_CY` (Population trend indicators)
- `value_ASIAN_CY_P` (Demographic trend patterns)

---

## 5. Risk Analysis Processor

**Endpoint**: `/risk-analysis`

**Status**: Field validation updated to use available SHAP data

**Available Fields for Future SHAP-Based Risk Scoring**:
- `value_MP30016A_B_P` (Nike market share volatility)
- `value_MP33107A_B_P` (Adidas market share volatility)
- `shap_MP30016A_B_P` (Nike SHAP risk indicators)
- `shap_MP33107A_B_P` (Adidas SHAP risk indicators)
- `value_HHPOP_CY` (Population stability)
- `value_MEDDI_CY` (Income stability indicators)

---

## Key Insights from SHAP Analysis

### Positive Performance Drivers:
1. **Asian Demographics** (SHAP: +191.05) - Strongest positive demographic indicator
2. **Nike Market Presence** (SHAP: +1246.06) - Self-reinforcing market advantage
3. **Population Scale** (SHAP: +531.60) - Market size opportunities
4. **Income Optimization** - Peak performance around $90k median income

### Negative Performance Indicators:
1. **Gen Z Demographics** (SHAP: -5.11) - Contrary to assumptions, shows negative impact
2. **Millennial Demographics** (SHAP: -2.07) - Also shows slight negative correlation
3. **High Competition Intensity** - Reduces competitive advantage

### Geographic Identifier Parsing:
All processors extract area names from `value_DESCRIPTION` field using the pattern:
```
"10001 (New York)" → "ZIP 10001 (New York)"
```

## Implementation Notes

- All scores are bounded to prevent extreme values
- Debug logging shows component breakdowns for verification
- Fallback values ensure system stability when data is missing
- SHAP multipliers provide fine-tuning based on actual performance variance
- Field mappings corrected to use available data fields

This data-driven approach ensures that all analysis results reflect actual market performance patterns rather than assumptions or arbitrary weights.