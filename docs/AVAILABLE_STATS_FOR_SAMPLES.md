# Available Statistics for Sample Areas

## Immediately Available Data (via ArcGIS FeatureServer)

### Demographics & Population
1. **Total Population** - Raw count and density
2. **Generation Distribution**
   - Generation Alpha (Born 2017+)
   - Generation Z (Born 1999-2016)
   - Millennials, Gen X, Boomers
3. **Age Groups** - Various cohorts with percentages

### Financial Indicators
1. **Banking Behavior**
   - Bank of America usage (12-month)
   - Savings account ownership %
   - Personal lines of credit %
2. **Credit & Debt**
   - Credit card debt (% carrying balances)
   - Average debt amounts
3. **Investment Assets**
   - Stocks, bonds, mutual funds values
   - Cash assets (checking, savings, CDs)
   - Cryptocurrency ownership %

### Digital Adoption
1. **Mobile Payments**
   - Apple Pay usage (30-day)
   - Google Pay usage
   - Contactless payment adoption
2. **Online Services**
   - TurboTax usage
   - H&R Block online usage
   - Digital service preferences

### Business & Economic
1. **Business Density** - Count per area
2. **Tax Service Locations** - H&R Block density
3. **Market Opportunity Scores** - Derived metrics

## Randomization Strategy for Sample Areas

### Rendering Field Rotation
Create a pool of rendering fields that rotate randomly:

```typescript
const CHOROPLETH_FIELDS = [
  {
    field: 'population_density',
    label: 'Population Density',
    unit: 'per sq mi',
    colorScheme: 'blues',
    category: 'demographic'
  },
  {
    field: 'median_income',
    label: 'Median Income',
    unit: '$',
    colorScheme: 'greens',
    category: 'financial'
  },
  {
    field: 'gen_z_percent',
    label: 'Gen Z Population',
    unit: '%',
    colorScheme: 'purples',
    category: 'demographic'
  },
  {
    field: 'apple_pay_usage',
    label: 'Apple Pay Adoption',
    unit: '%',
    colorScheme: 'oranges',
    category: 'digital'
  },
  {
    field: 'credit_card_debt_pct',
    label: 'Credit Card Debt',
    unit: '% carrying',
    colorScheme: 'reds',
    category: 'financial'
  },
  {
    field: 'crypto_ownership',
    label: 'Crypto Ownership',
    unit: '%',
    colorScheme: 'teals',
    category: 'investment'
  },
  {
    field: 'business_density',
    label: 'Business Density',
    unit: 'per sq mi',
    colorScheme: 'browns',
    category: 'economic'
  },
  {
    field: 'savings_account_pct',
    label: 'Savings Accounts',
    unit: '%',
    colorScheme: 'greens',
    category: 'financial'
  }
];
```

### Focus Area Randomization
Rotate between different analytical focuses:

```typescript
const ANALYSIS_FOCUSES = [
  {
    id: 'young_professionals',
    name: 'Young Professional Hub',
    primaryField: 'gen_z_percent',
    secondaryStats: ['median_income', 'apple_pay_usage', 'crypto_ownership'],
    description: 'Areas with high concentration of young, tech-savvy professionals'
  },
  {
    id: 'financial_opportunity',
    name: 'Financial Services Opportunity',
    primaryField: 'savings_account_pct',
    secondaryStats: ['credit_card_debt_pct', 'investment_assets', 'bank_usage'],
    description: 'Markets with banking and financial service potential'
  },
  {
    id: 'digital_adoption',
    name: 'Digital Innovation Zone',
    primaryField: 'apple_pay_usage',
    secondaryStats: ['google_pay_usage', 'turbo_tax_usage', 'crypto_ownership'],
    description: 'Areas leading in digital service adoption'
  },
  {
    id: 'growth_market',
    name: 'Growth Market',
    primaryField: 'population_growth',
    secondaryStats: ['business_density', 'median_income', 'gen_alpha_percent'],
    description: 'Fast-growing areas with expansion potential'
  },
  {
    id: 'investment_hub',
    name: 'Investment Activity Center',
    primaryField: 'investment_assets',
    secondaryStats: ['crypto_ownership', 'median_income', 'savings_account_pct'],
    description: 'Areas with high investment and wealth management activity'
  }
];
```

### Implementation Algorithm

```typescript
function generateRandomSampleAreas(viewport: Extent, count: number = 4) {
  // 1. Get available ZIP codes in viewport
  const availableZips = getZipsInViewport(viewport);
  
  // 2. Randomly select focus types (ensure variety)
  const selectedFocuses = shuffleArray(ANALYSIS_FOCUSES).slice(0, count);
  
  // 3. For each focus, find best matching ZIP
  return selectedFocuses.map((focus, index) => {
    // Rotate through different choropleth fields
    const choroplethField = CHOROPLETH_FIELDS[index % CHOROPLETH_FIELDS.length];
    
    // Find ZIP with interesting values for this focus
    const targetZip = findInterestingZip(availableZips, focus.primaryField);
    
    return {
      id: `sample_${focus.id}_${targetZip}`,
      name: `${targetZip} - ${focus.name}`,
      focus: focus,
      choroplethField: choroplethField,
      stats: fetchQuickStats(targetZip, focus.secondaryStats),
      geometry: getZipGeometry(targetZip)
    };
  });
}

function findInterestingZip(zips: string[], field: string) {
  // Find ZIPs with high values (top quartile) or interesting patterns
  // Could look for:
  // - High absolute values
  // - High growth rates
  // - Outliers
  // - Clusters of similar values
  return selectByInterestingness(zips, field);
}
```

### Quick Stats Display Rotation

For each sample area, randomly select 3-4 quick stats from available pool:

```typescript
const QUICK_STAT_POOLS = {
  demographic: [
    'Total Population',
    'Pop. Density',
    'Gen Z %',
    'Median Age'
  ],
  financial: [
    'Median Income',
    'Credit Card Debt %',
    'Savings Account %',
    'Investment Assets'
  ],
  digital: [
    'Apple Pay Users',
    'Google Pay Users',
    'Online Tax Filing',
    'Crypto Owners %'
  ],
  business: [
    'Business Count',
    'Business Density',
    'Service Locations',
    'Market Score'
  ]
};

function selectQuickStats(focus: AnalysisFocus) {
  // Mix stats from different categories
  const primary = QUICK_STAT_POOLS[focus.category][0];
  const secondary = randomFromArray(QUICK_STAT_POOLS.financial);
  const tertiary = randomFromArray(QUICK_STAT_POOLS.digital);
  return [primary, secondary, tertiary];
}
```

## Benefits of Randomization

1. **Discovery**: Users discover different data dimensions
2. **Engagement**: Fresh content on each load
3. **Education**: Learn about available metrics
4. **Relevance**: Different users see different relevant data
5. **Testing**: A/B test which metrics drive engagement

## Implementation Priority

### Phase 1 - Basic Stats (Immediate)
- Population & density
- Median income
- Business count
- Gen Z percentage

### Phase 2 - Financial (Week 1)
- Banking behavior
- Credit card debt
- Investment assets
- Savings accounts

### Phase 3 - Digital (Week 2)
- Mobile payment adoption
- Online service usage
- Cryptocurrency ownership

### Phase 4 - Advanced (Week 3)
- Growth trends
- Comparative scores
- Market opportunities
- Predictive metrics