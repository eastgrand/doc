/* eslint-disable @typescript-eslint/no-explicit-any */
// Accept a minimal layer shape to avoid tight coupling to ArcGIS types in the browser
export interface MinimalClientLayer {
  layerId: string;
  layerName: string;
  layerType?: string;
  field?: string;
  features: Array<{ properties?: Record<string, any> } | any>;
}

export interface HistogramBin {
  start: number;
  end: number;
  count: number;
}

export interface LayerSummary {
  layerId: string;
  layerName: string;
  layerType?: string;
  field?: string;
  featureCount: number;
  numericField?: string;
  stats?: {
    min: number;
    max: number;
    mean: number;
    median: number;
    p25: number;
    p75: number;
    std: number;
  };
  histogram?: HistogramBin[];
  top?: Array<{ id: string; name: string; value: number; }>; // highest values
  bottom?: Array<{ id: string; name: string; value: number; }>; // lowest values
  samples?: Array<Record<string, any>>; // small set of representative properties (no geometry)
}

export interface ClientSummary {
  totalLayers: number;
  totalFeatures: number;
  layers: LayerSummary[];
  approxBytes?: number;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function computeStats(values: number[]) {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const min = sorted[0];
  const max = sorted[n - 1];
  const mean = sorted.reduce((s, v) => s + v, 0) / n;
  const median = quantile(sorted, 0.5);
  const p25 = quantile(sorted, 0.25);
  const p75 = quantile(sorted, 0.75);
  const variance = sorted.reduce((s, v) => s + (v - mean) * (v - mean), 0) / n;
  const std = Math.sqrt(variance);
  return { min, max, mean, median, p25, p75, std };
}

function buildHistogram(values: number[], bins = 10): HistogramBin[] | undefined {
  if (!values.length) return undefined;
  const stats = computeStats(values);
  if (!stats) return undefined;
  const { min, max } = stats;
  if (!isFiniteNumber(min) || !isFiniteNumber(max) || min === max) {
    return [{ start: min, end: max, count: values.length }];
  }
  const width = (max - min) / bins;
  const counts = new Array(bins).fill(0);
  for (const v of values) {
    if (!isFiniteNumber(v)) continue;
    let idx = Math.floor((v - min) / width);
    if (idx < 0) idx = 0;
    if (idx >= bins) idx = bins - 1;
    counts[idx]++;
  }
  const out: HistogramBin[] = [];
  for (let i = 0; i < bins; i++) {
    out.push({ start: min + i * width, end: min + (i + 1) * width, count: counts[i] });
  }
  return out;
}

function pickIdAndName(props: any): { id: string; name: string } {
  const id = String(
    props?.area_id ?? props?.zip ?? props?.ZIP ?? props?.zip_code ?? props?.id ?? props?.OBJECTID ?? props?.OBJECTID_1 ?? props?.GEOID ?? props?.FID ?? props?.NAME ?? 'unknown'
  );
  const name = String(
    props?.area_name ?? props?.NAME ?? props?.name ?? props?.DESCRIPTION ?? props?.city ?? props?.zip ?? id
  );
  
  // Debug logging for strategic analysis (first few only to reduce noise)
  if ((props?.strategic_analysis_score || props?.strategic_value_score) && id && ['32544', '33621', '32542'].includes(id)) {
    console.log(`🔍 [pickIdAndName] Strategic analysis - ${id}:`, {
      area_name: props?.area_name,
      final_id: id,
      final_name: name,
      name_source: props?.area_name ? 'area_name' : 'other'
    });
  }
  
  return { id, name };
}

function selectNumericFieldFromFeature(props: Record<string, any>): string | undefined {
  // Prefer explicit target field names if present
  const preferred = [
    'target_value',
    'value',
    // All endpoint scoring fields from ENDPOINT_SCORING_FIELD_MAPPING.md
    'strategic_analysis_score',
    'competitive_analysis_score',
    'demographic_insights_score',
    'correlation_analysis_score',
    'brand_difference_score',
    'comparative_analysis_score',
    'customer_profile_score',
    'trend_analysis_score',
    'segment_profiling_score',
    'anomaly_detection_score',
    'predictive_modeling_score',
    'feature_interactions_score',
    'outlier_detection_score',
    'scenario_analysis_score',
    'sensitivity_analysis_score',
    'model_performance_score',
    'ensemble_analysis_score',
    'feature_importance_ranking_score',
    'dimensionality_insights_score',
    'spatial_clusters_score',
    'consensus_analysis_score',
    'algorithm_comparison_score',
    'analyze_score',
    'algorithm_category', // Special case for model-selection
    // Legacy fields for backward compatibility
    'strategic_value_score',
    'competitive_advantage_score',
    'comparative_score'
  ];
  for (const key of preferred) {
    if (isFiniteNumber(props?.[key])) return key;
  }
  // Otherwise pick the first numeric-looking field
  for (const [k, v] of Object.entries(props)) {
    if (isFiniteNumber(v)) return k;
  }
  return undefined;
}

function safeSampleProperties(props: Record<string, any>, maxKeys = 20): Record<string, any> {
  const out: Record<string, any> = {};
  let added = 0;
  for (const [k, v] of Object.entries(props)) {
    if (added >= maxKeys) break;
    if (v === null || v === undefined) continue;
    if (typeof v === 'object') continue; // skip nested objects/arrays
    out[k] = v;
    added++;
  }
  return out;
}

export function summarizeFeatureData(featureData: MinimalClientLayer[] | undefined | null): ClientSummary | undefined {
  if (!featureData || !Array.isArray(featureData) || featureData.length === 0) return undefined;

  const layerSummaries: LayerSummary[] = [];
  let totalFeatures = 0;

  for (const layer of featureData) {
    const featureCount = Array.isArray(layer.features) ? layer.features.length : 0;
    totalFeatures += featureCount;
  const firstProps = featureCount > 0 ? (layer.features[0] as any)?.properties ?? layer.features[0] ?? {} : {};
    const numericField = layer.field || selectNumericFieldFromFeature(firstProps);

    const values: number[] = [];
    const ranked: Array<{ id: string; name: string; value: number }> = [];
    if (numericField) {
      for (const f of layer.features) {
        const props = (f as any)?.properties ?? f;
        const v = props?.[numericField];
        if (isFiniteNumber(v)) {
          values.push(v);
          const { id, name } = pickIdAndName(props || {});
          ranked.push({ id, name, value: v });
        }
      }
    }

    ranked.sort((a, b) => b.value - a.value);

    const stats = values.length ? computeStats(values) : undefined;
    const histogram = values.length ? buildHistogram(values, 10) : undefined;
    const top = ranked.slice(0, 5);
    const bottom = ranked.slice(-5).reverse();

    const samples: Array<Record<string, any>> = [];
    const sampleSize = Math.min(5, featureCount);
    for (let i = 0; i < sampleSize; i++) {
      const props = (layer.features[i] as any)?.properties ?? layer.features[i] ?? {};
      const { id, name } = pickIdAndName(props);
      samples.push({ id, name, ...safeSampleProperties(props) });
    }

    layerSummaries.push({
      layerId: layer.layerId,
      layerName: layer.layerName,
      layerType: (layer as any)?.layerType,
      field: layer.field,
      featureCount,
      numericField,
      stats,
      histogram,
      top,
      bottom,
      samples
    });
  }

  const summary: ClientSummary = {
    totalLayers: featureData.length,
    totalFeatures,
    layers: layerSummaries
  };
  try {
    summary.approxBytes = Buffer.from(JSON.stringify(summary)).byteLength;
  } catch {
    // ignore if Buffer not available in browser; fall back
    try {
      summary.approxBytes = new TextEncoder().encode(JSON.stringify(summary)).length;
    } catch {
      // noop
    }
  }
  return summary;
}
