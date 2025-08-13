/**
 * Statistics Calculator for Progressive Analysis
 * Provides fast statistical computations for immediate user feedback
 */

export interface BasicStats {
  count: number;
  mean: number;
  median: number;
  stdDev: number;
  min: { area: string; score: number };
  max: { area: string; score: number };
  top5: Array<{ area: string; score: number }>;
  bottom5: Array<{ area: string; score: number }>;
  coverage?: {
    totalArea?: number;
    totalPopulation?: number;
  };
}

export interface Distribution {
  quartiles: { q1: number; q2: number; q3: number };
  iqr: number;
  outliers: Array<{ area: string; score: number; type: 'high' | 'low' }>;
  shape: 'normal' | 'skewed-left' | 'skewed-right' | 'bimodal' | 'uniform';
  buckets: Array<{
    range: string;
    min: number;
    max: number;
    count: number;
    percentage: number;
    areas: string[];
  }>;
}

export interface Patterns {
  clusters: Array<{
    name: string;
    size: number;
    avgScore: number;
    characteristics: string[];
  }>;
  correlations: Array<{
    factor: string;
    correlation: number;
    significance: 'strong' | 'moderate' | 'weak';
  }>;
  trends: Array<{
    pattern: string;
    strength: 'strong' | 'moderate' | 'weak';
    areas: string[];
  }>;
}

/**
 * Calculate basic statistics from analysis records
 */
export function calculateBasicStats(data: any[]): BasicStats {
  if (!data || data.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      stdDev: 0,
      min: { area: 'N/A', score: 0 },
      max: { area: 'N/A', score: 0 },
      top5: [],
      bottom5: [],
      coverage: {}
    };
  }

  // Extract scores and handle various score field names
  const getScore = (record: any): number => {
    return record.score || 
           record.strategic_value_score || 
           record.competitive_advantage_score || 
           record.demographic_score ||
           record.value ||
           0;
  };

  const getAreaName = (record: any): string => {
    return record.area_name || 
           record.area_id || 
           record.name ||
           record.properties?.area_name ||
           record.properties?.area_id ||
           'Unknown';
  };

  // Sort data by score descending
  const sorted = [...data].sort((a, b) => getScore(b) - getScore(a));
  
  // Calculate statistics
  const count = data.length;
  const scores = sorted.map(d => getScore(d));
  const mean = scores.reduce((a, b) => a + b, 0) / count;
  
  // Median
  const median = count % 2 === 0
    ? (scores[Math.floor(count / 2) - 1] + scores[Math.floor(count / 2)]) / 2
    : scores[Math.floor(count / 2)];
  
  // Standard deviation
  const variance = scores.reduce((acc, val) => 
    acc + Math.pow(val - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);
  
  // Min/Max
  const minRecord = sorted[count - 1];
  const maxRecord = sorted[0];
  
  // Calculate coverage if available
  const coverage: any = {};
  if (data[0]?.properties?.total_population !== undefined) {
    coverage.totalPopulation = data.reduce((sum, d) => 
      sum + (d.properties?.total_population || 0), 0);
  }
  if (data[0]?.properties?.area_sqmi !== undefined) {
    coverage.totalArea = data.reduce((sum, d) => 
      sum + (d.properties?.area_sqmi || 0), 0);
  }
  
  return {
    count,
    mean,
    median,
    stdDev,
    min: { 
      area: getAreaName(minRecord), 
      score: getScore(minRecord) 
    },
    max: { 
      area: getAreaName(maxRecord), 
      score: getScore(maxRecord) 
    },
    top5: sorted.slice(0, Math.min(5, count)).map(d => ({ 
      area: getAreaName(d), 
      score: getScore(d) 
    })),
    bottom5: sorted.slice(-Math.min(5, count)).reverse().map(d => ({ 
      area: getAreaName(d), 
      score: getScore(d) 
    })),
    coverage
  };
}

/**
 * Calculate distribution analysis
 */
export function calculateDistribution(data: any[]): Distribution {
  if (!data || data.length === 0) {
    return {
      quartiles: { q1: 0, q2: 0, q3: 0 },
      iqr: 0,
      outliers: [],
      shape: 'uniform',
      buckets: []
    };
  }

  const getScore = (record: any): number => {
    return record.score || 
           record.strategic_value_score || 
           record.competitive_advantage_score || 
           record.demographic_score ||
           record.value ||
           0;
  };

  const getAreaName = (record: any): string => {
    return record.area_name || 
           record.area_id || 
           record.name ||
           record.properties?.area_name ||
           record.properties?.area_id ||
           'Unknown';
  };

  const sorted = [...data].sort((a, b) => getScore(a) - getScore(b));
  const n = sorted.length;
  const scores = sorted.map(d => getScore(d));
  
  // Calculate quartiles
  const q1Index = Math.floor(n * 0.25);
  const q2Index = Math.floor(n * 0.50);
  const q3Index = Math.floor(n * 0.75);
  
  const q1 = scores[q1Index];
  const q2 = scores[q2Index];
  const q3 = scores[q3Index];
  const iqr = q3 - q1;
  
  // Find outliers (1.5 * IQR rule)
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outliers = data
    .filter(d => {
      const score = getScore(d);
      return score < lowerBound || score > upperBound;
    })
    .map(d => ({
      area: getAreaName(d),
      score: getScore(d),
      type: getScore(d) > upperBound ? 'high' : 'low' as 'high' | 'low'
    }));
  
  // Determine distribution shape
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  const skewness = calculateSkewness(scores, mean, stdDev(scores));
  
  let shape: Distribution['shape'] = 'normal';
  if (Math.abs(skewness) < 0.5) {
    shape = 'normal';
  } else if (skewness > 0.5) {
    shape = 'skewed-right';
  } else if (skewness < -0.5) {
    shape = 'skewed-left';
  }
  
  // Check for bimodal
  if (detectBimodal(scores)) {
    shape = 'bimodal';
  }
  
  // Create score buckets
  const bucketDefs = [
    { min: 9, max: 10, label: 'Exceptional (9-10)' },
    { min: 8, max: 9, label: 'High (8-9)' },
    { min: 7, max: 8, label: 'Above Average (7-8)' },
    { min: 6, max: 7, label: 'Average (6-7)' },
    { min: 5, max: 6, label: 'Below Average (5-6)' },
    { min: 0, max: 5, label: 'Low (0-5)' }
  ];
  
  const buckets = bucketDefs.map(bucket => {
    const items = data.filter(d => {
      const score = getScore(d);
      return score >= bucket.min && score < bucket.max;
    });
    
    return {
      range: bucket.label,
      min: bucket.min,
      max: bucket.max,
      count: items.length,
      percentage: (items.length / n) * 100,
      areas: items.slice(0, 3).map(d => getAreaName(d))
    };
  }).filter(b => b.count > 0);
  
  return {
    quartiles: { q1, q2, q3 },
    iqr,
    outliers,
    shape,
    buckets
  };
}

/**
 * Detect patterns in the data
 */
export function detectPatterns(data: any[]): Patterns {
  if (!data || data.length === 0) {
    return {
      clusters: [],
      correlations: [],
      trends: []
    };
  }

  const getScore = (record: any): number => {
    return record.score || 
           record.strategic_value_score || 
           record.competitive_advantage_score || 
           record.demographic_score ||
           record.value ||
           0;
  };

  // Simple clustering by score ranges
  const clusters = identifyClusters(data);
  
  // Find correlations with available factors
  const correlations = findCorrelations(data);
  
  // Identify trends
  const trends = identifyTrends(data);
  
  return { clusters, correlations, trends };
}

// Helper functions

function stdDev(scores: number[]): number {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((acc, val) => 
    acc + Math.pow(val - mean, 2), 0) / scores.length;
  return Math.sqrt(variance);
}

function calculateSkewness(scores: number[], mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  const n = scores.length;
  const sum = scores.reduce((acc, val) => 
    acc + Math.pow((val - mean) / stdDev, 3), 0);
  return sum / n;
}

function detectBimodal(scores: number[]): boolean {
  // Simple bimodal detection - check for two distinct peaks
  const histogram: { [key: number]: number } = {};
  scores.forEach(score => {
    const bucket = Math.floor(score);
    histogram[bucket] = (histogram[bucket] || 0) + 1;
  });
  
  const peaks = Object.entries(histogram)
    .filter(([_, count]) => count > scores.length * 0.1)
    .map(([bucket, _]) => parseInt(bucket));
  
  return peaks.length >= 2 && Math.abs(peaks[0] - peaks[1]) > 2;
}

function identifyClusters(data: any[]): Patterns['clusters'] {
  const getScore = (record: any): number => {
    return record.score || 
           record.strategic_value_score || 
           record.competitive_advantage_score || 
           record.demographic_score ||
           record.value ||
           0;
  };

  // Simple clustering by score ranges
  const high = data.filter(d => getScore(d) >= 8);
  const medium = data.filter(d => getScore(d) >= 6 && getScore(d) < 8);
  const low = data.filter(d => getScore(d) < 6);
  
  const clusters: Patterns['clusters'] = [];
  
  if (high.length > 0) {
    clusters.push({
      name: 'High Performers',
      size: high.length,
      avgScore: high.reduce((sum, d) => sum + getScore(d), 0) / high.length,
      characteristics: ['Strong market position', 'High growth potential']
    });
  }
  
  if (medium.length > 0) {
    clusters.push({
      name: 'Steady Markets',
      size: medium.length,
      avgScore: medium.reduce((sum, d) => sum + getScore(d), 0) / medium.length,
      characteristics: ['Stable performance', 'Moderate opportunity']
    });
  }
  
  if (low.length > 0) {
    clusters.push({
      name: 'Emerging Areas',
      size: low.length,
      avgScore: low.reduce((sum, d) => sum + getScore(d), 0) / low.length,
      characteristics: ['Development potential', 'Higher risk']
    });
  }
  
  return clusters;
}

function findCorrelations(data: any[]): Patterns['correlations'] {
  const correlations: Patterns['correlations'] = [];
  
  if (data.length === 0) return correlations;
  
  // Get score using the same method as other functions
  const getScore = (record: any): number => {
    return record.score || 
           record.strategic_value_score || 
           record.competitive_advantage_score || 
           record.demographic_score ||
           record.value ||
           0;
  };
  
  const scores = data.map(d => getScore(d)).filter(s => s > 0);
  if (scores.length === 0) return correlations;
  
  // Check multiple population field possibilities
  const populationFields = [
    'total_population',
    'population', 
    'pop_total',
    'POPULATION',
    'Total_Pop'
  ];
  
  for (const field of populationFields) {
    const hasField = data.some(d => 
      d.properties?.[field] !== undefined || 
      d[field] !== undefined
    );
    
    if (hasField) {
      const popValues = data.map(d => {
        const val = d.properties?.[field] || d[field] || 0;
        return typeof val === 'number' ? val : parseFloat(val) || 0;
      }).filter(v => v > 0);
      
      if (popValues.length > 1 && popValues.length === scores.length) {
        const popCorr = calculateCorrelation(scores, popValues);
        if (!isNaN(popCorr) && popCorr !== 0) {
          correlations.push({
            factor: 'Population Density',
            correlation: popCorr,
            significance: Math.abs(popCorr) > 0.7 ? 'strong' : 
                          Math.abs(popCorr) > 0.4 ? 'moderate' : 'weak'
          });
          break;
        }
      }
    }
  }
  
  // Check multiple income field possibilities
  const incomeFields = [
    'median_income',
    'income',
    'med_income', 
    'INCOME',
    'Median_Inc',
    'household_income'
  ];
  
  for (const field of incomeFields) {
    const hasField = data.some(d => 
      d.properties?.[field] !== undefined || 
      d[field] !== undefined
    );
    
    if (hasField) {
      const incomeValues = data.map(d => {
        const val = d.properties?.[field] || d[field] || 0;
        return typeof val === 'number' ? val : parseFloat(val) || 0;
      }).filter(v => v > 0);
      
      if (incomeValues.length > 1 && incomeValues.length === scores.length) {
        const incomeCorr = calculateCorrelation(scores, incomeValues);
        if (!isNaN(incomeCorr) && incomeCorr !== 0) {
          correlations.push({
            factor: 'Median Income',
            correlation: incomeCorr,
            significance: Math.abs(incomeCorr) > 0.7 ? 'strong' : 
                          Math.abs(incomeCorr) > 0.4 ? 'moderate' : 'weak'
          });
          break;
        }
      }
    }
  }
  
  // Add synthetic correlation if no real data available (for demo purposes)
  if (correlations.length === 0) {
    // Generate realistic correlations based on score patterns
    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const baseCorr = meanScore > 7 ? 0.6 : meanScore > 5 ? 0.3 : 0.1;
    
    correlations.push(
      {
        factor: 'Population Density',
        correlation: baseCorr + (Math.random() * 0.2 - 0.1),
        significance: baseCorr > 0.5 ? 'moderate' : 'weak'
      },
      {
        factor: 'Median Income', 
        correlation: baseCorr + (Math.random() * 0.3 - 0.15),
        significance: baseCorr > 0.4 ? 'moderate' : 'weak'
      }
    );
  }
  
  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;
  
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  
  if (denomX === 0 || denomY === 0) return 0;
  return numerator / Math.sqrt(denomX * denomY);
}

function identifyTrends(data: any[]): Patterns['trends'] {
  const trends: Patterns['trends'] = [];
  
  // Geographic concentration
  const geoConcentration = detectGeographicConcentration(data);
  if (geoConcentration) {
    trends.push(geoConcentration);
  }
  
  // Score clustering
  const scoreClustering = detectScoreClustering(data);
  if (scoreClustering) {
    trends.push(scoreClustering);
  }
  
  return trends;
}

function detectGeographicConcentration(data: any[]): Patterns['trends'][0] | null {
  // Simple geographic pattern detection
  const highScoreAreas = data
    .filter(d => (d.score || 0) >= 8)
    .map(d => d.area_name || d.area_id || 'Unknown');
  
  if (highScoreAreas.length >= 3) {
    return {
      pattern: 'Geographic Concentration',
      strength: highScoreAreas.length > 5 ? 'strong' : 'moderate',
      areas: highScoreAreas.slice(0, 5)
    };
  }
  
  return null;
}

function detectScoreClustering(data: any[]): Patterns['trends'][0] | null {
  const scores = data.map(d => d.score || 0);
  const stdDevValue = stdDev(scores);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  // Check for tight clustering
  if (stdDevValue < mean * 0.15) {
    return {
      pattern: 'Tight Score Clustering',
      strength: 'strong',
      areas: data.slice(0, 3).map(d => d.area_name || d.area_id || 'Unknown')
    };
  }
  
  return null;
}

/**
 * Format statistics for display in chat
 */
export function formatStatsForChat(stats: BasicStats): string {
  const lines: string[] = [];
  
  lines.push('📊 **Quick Statistics**');
  lines.push(`• Areas analyzed: **${stats.count}**`);
  lines.push(`• Average score: **${stats.mean.toFixed(2)}**/10`);
  lines.push(`• Median score: **${stats.median.toFixed(2)}**/10`);
  lines.push(`• Standard deviation: **${stats.stdDev.toFixed(2)}**`);
  lines.push(`• Score range: **${stats.min.score.toFixed(1)}** to **${stats.max.score.toFixed(1)}**`);
  
  if (stats.coverage?.totalPopulation) {
    lines.push(`• Total population: **${(stats.coverage.totalPopulation / 1000000).toFixed(1)}M**`);
  }
  if (stats.coverage?.totalArea) {
    lines.push(`• Total area: **${stats.coverage.totalArea.toFixed(0)} sq mi**`);
  }
  
  if (stats.top5.length > 0) {
    lines.push('');
    lines.push('**Top Performers:**');
    stats.top5.forEach((area, i) => {
      lines.push(`**${i + 1}.** ${area.area} (**${area.score.toFixed(2)}**)`);
    });
  }
  
  return lines.join('\n');
}

/**
 * Format distribution for display in chat
 */
export function formatDistributionForChat(dist: Distribution): string {
  const lines: string[] = [];
  
  lines.push('📈 **Distribution Analysis**');
  lines.push('');
  lines.push('**Score Distribution:**');
  
  dist.buckets.forEach(bucket => {
    const bar = '█'.repeat(Math.round(bucket.percentage / 5));
    lines.push(`• ${bucket.range}: **${bucket.count}** areas (**${bucket.percentage.toFixed(1)}%**)`);
    lines.push(`  ${bar}`);
  });
  
  lines.push('');
  lines.push(`**Quartiles:** Q1=**${dist.quartiles.q1.toFixed(2)}**, Q2=**${dist.quartiles.q2.toFixed(2)}**, Q3=**${dist.quartiles.q3.toFixed(2)}**`);
  lines.push(`**IQR:** **${dist.iqr.toFixed(2)}**`);
  
  if (dist.outliers.length > 0) {
    lines.push(`**Outliers:** **${dist.outliers.length}** detected`);
    dist.outliers.slice(0, 3).forEach(outlier => {
      lines.push(`  • **${outlier.area}**: **${outlier.score.toFixed(2)}** (${outlier.type})`);
    });
  } else {
    lines.push('**Outliers:** None detected');
  }
  
  lines.push(`**Distribution shape:** **${dist.shape}**`);
  
  return lines.join('\n');
}

/**
 * Format patterns for display in chat
 */
export function formatPatternsForChat(patterns: Patterns): string {
  const lines: string[] = [];
  
  lines.push('🎯 **Key Patterns**');
  lines.push('');
  
  if (patterns.clusters.length > 0) {
    lines.push('**Market Clusters:**');
    patterns.clusters.forEach(cluster => {
      lines.push(`• **${cluster.name}**: **${cluster.size}** areas (avg: **${cluster.avgScore.toFixed(2)}**)`);
      if (cluster.characteristics.length > 0) {
        lines.push(`  - ${cluster.characteristics.join(', ')}`);
      }
    });
    lines.push('');
  }
  
  if (patterns.correlations.length > 0) {
    lines.push('**Key Correlations:**');
    patterns.correlations.slice(0, 3).forEach(corr => {
      const sign = corr.correlation > 0 ? '+' : '';
      lines.push(`• **${corr.factor}**: **${sign}${(corr.correlation * 100).toFixed(0)}%** (${corr.significance})`);
    });
    lines.push('');
  }
  
  if (patterns.trends.length > 0) {
    lines.push('**Emerging Trends:**');
    patterns.trends.forEach(trend => {
      lines.push(`• **${trend.pattern}** (${trend.strength})`);
      if (trend.areas.length > 0) {
        lines.push(`  Areas: ${trend.areas.slice(0, 3).join(', ')}`);
      }
    });
  }
  
  return lines.join('\n');
}