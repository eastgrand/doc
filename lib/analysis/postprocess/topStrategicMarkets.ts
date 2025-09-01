/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveAreaName as resolveSharedAreaName, getZip as getSharedZip } from '@/lib/shared/AreaName';

// Local helper: robust ZIP extractor compatible with existing feature shapes
function getZIPCode(feature: any): string {
  try {
    if (!feature) return 'Unknown';
    const f = feature?.properties ? feature : { properties: feature };
    const props = f.properties || {};
    const direct = props.ZIP || props.Zip || props.zip || props.ZIPCODE || props.zip_code || props.ZipCode;
    if (direct && typeof direct === 'string') {
      const m = direct.match(/\b(\d{5})\b/);
      if (m) return m[1];
    } else if (typeof direct === 'number') {
      const s = String(direct).padStart(5, '0');
      return s;
    }
    const desc = typeof props.DESCRIPTION === 'string' ? props.DESCRIPTION : (typeof props.area_name === 'string' ? props.area_name : '');
    const zipMatch = desc.match(/\b(\d{5})\b/);
    if (zipMatch && zipMatch[1]) return zipMatch[1];
  } catch {}
  try {
    // Fallback to shared util
    const z = getSharedZip(feature);
    if (z && z !== 'Unknown') return z;
  } catch {}
  return 'Unknown';
}

// Resolve score field with analysis-type specific priorities and generic fallbacks
function resolvePrimaryScoreField(analysisType: string, features: any[], metadata?: any): string {
  if (metadata?.targetVariable) return metadata.targetVariable;
  // Energy dataset convention: pick last numeric field from properties (handle double nesting)
  const pickLastNumericField = (list: any[]): string | undefined => {
    for (const f of (list || []).slice(0, 5)) {
      const propsLvl1 = (f && typeof f === 'object') ? (f as any).properties || f : {};
      const props = (propsLvl1 && typeof propsLvl1 === 'object') ? (propsLvl1 as any).properties || propsLvl1 : propsLvl1;
      const keys = Object.keys(props || {});
      for (let i = keys.length - 1; i >= 0; i--) {
        const k = keys[i];
        const v = (props as any)[k];
        const n = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
        if (!Number.isNaN(n)) return k;
      }
    }
    return undefined;
  };
  const lastNumeric = pickLastNumericField(features);
  if (lastNumeric) return lastNumeric;
  // Fallbacks by analysis type
  const typeDefaults: Record<string, string[]> = {
    strategic_analysis: ['strategic_analysis_score', 'strategic_score', 'strategic_value_score'],
    brand_difference: ['brand_difference_score', 'brand_difference_value'],
    competitive_analysis: ['competitive_advantage_score'],
    comparative_analysis: ['comparison_score', 'comparative_score'],
    demographic_insights: ['demographic_insights_score']
  };
  const candidates = [
    ...(typeDefaults[analysisType] || []),
    'target_value',
    'score',
    'value'
  ];
  const first = (features || []).find(f => !!(f?.properties || f));
  const props = first?.properties || first || {};
  for (const c of candidates) {
    const v = (props as any)[c];
    if (typeof v === 'number' && !Number.isNaN(v)) return c;
  }
  return candidates[0] || 'strategic_analysis_score';
}

// Compute simple descriptive stats used for the Study Area Summary
function computeScoreStats(features: any[], scoreField: string) {
  const vals = (features || [])
    .map((f: any) => (f?.properties || f || {})[scoreField])
    .filter((v: any) => typeof v === 'number' && !Number.isNaN(v)) as number[];
  if (vals.length === 0) return null;
  const sorted = [...vals].sort((a, b) => a - b);
  const n = sorted.length;
  const q = (p: number) => {
    const idx = (n - 1) * p;
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };
  const min = sorted[0];
  const max = sorted[n - 1];
  const avg = vals.reduce((a, b) => a + b, 0) / n;
  return { count: n, min, max, avg, q1: q(0.25), q2: q(0.5), q3: q(0.75) };
}

// Main entry: injects a ranked, capped Top Strategic Markets list and a Study Area Summary.
export function injectTopStrategicMarkets(
  finalContent: string,
  processedLayersData: any[] | undefined,
  metadata: any | undefined,
  analysisType: string
): string {
  const listHeaderMatch = finalContent.match(/Top Strategic Markets:\s*(?:\n|\r\n)/i);
  if (!listHeaderMatch) return finalContent;

  const allFeatures = (processedLayersData || []).flatMap(layer => Array.isArray((layer as any)?.features) ? (layer as any).features : []);
  let candidateFeatures = allFeatures;
  // Apply study area selection filtering when spatialFilterIds provided
  try {
    const forceProjectScope = metadata?.analysisScope === 'project' || metadata?.scope === 'project' || metadata?.forceProjectScope === true;
    const ids = Array.isArray(metadata?.spatialFilterIds) ? (metadata?.spatialFilterIds as any[]) : [];
    if (!forceProjectScope && ids.length > 0) {
      const idSet = new Set(ids.map((v: any) => String(v)));
      const resolveFeatureId = (feat: any): string | null => {
        try {
          const props = feat?.properties || feat || {};
          const direct = props.ID ?? props.id ?? props.area_id ?? props.areaID ?? props.geoid ?? props.GEOID;
          if (direct !== undefined && direct !== null) return String(direct);
          const desc = typeof props.DESCRIPTION === 'string' ? props.DESCRIPTION : (typeof props.area_name === 'string' ? props.area_name : '');
          const zipMatch = desc.match(/\b(\d{5})\b/);
          if (zipMatch && zipMatch[1]) return zipMatch[1];
          const zip = getZIPCode({ properties: props });
          if (zip && zip !== 'Unknown') return String(zip);
        } catch {}
        return null;
      };
      const filtered = allFeatures.filter((f: any) => {
        const fid = resolveFeatureId(f);
        return fid ? idSet.has(fid) : false;
      });
      if (filtered.length > 0) {
        candidateFeatures = filtered;
      }
    }
  } catch {}

  const resolvedScoreField = resolvePrimaryScoreField(analysisType, candidateFeatures, metadata);
  // Helper formatters and pickers
  const toNum = (v: any): number | null => {
    const n = typeof v === 'number' ? v : (typeof v === 'string' ? Number(v) : NaN);
    return Number.isFinite(n) ? n : null;
  };
  const pickFirst = (obj: any, keys: string[]): any => {
    for (const k of keys) {
      const val = obj?.[k];
      if (val !== undefined && val !== null && val !== '') return val;
    }
    return undefined;
  };
  const fmtPct = (v: number | null | undefined): string => {
    if (v === null || v === undefined || Number.isNaN(v as any)) return 'Data not available';
    // If looks like a fraction, convert to percent
    const num = Number(v);
    const pct = num > 0 && num <= 1 ? num * 100 : num;
    return `${pct.toFixed(1)}%`;
  };
  const fmtInt = (v: number | null | undefined): string => {
    if (v === null || v === undefined || Number.isNaN(v as any)) return 'Data not available';
    return Math.round(Number(v)).toLocaleString();
  };
  const fmtMoney = (v: number | null | undefined): string => {
    if (v === null || v === undefined || Number.isNaN(v as any)) return 'Data not available';
    return `$${Math.round(Number(v)).toLocaleString()}`;
  };

  // Build ranked list with enriched per-item details
  let ranked = candidateFeatures
    .map((feat: any) => {
      const props = feat?.properties || feat || {};
      const score = Number(
        props?.[resolvedScoreField] ??
        props?.strategic_analysis_score ??
        props?.strategic_score ??
        props?.strategic_value_score ??
        props?.target_value
      );
      const name = resolveSharedAreaName(feat, { mode: 'zipCity', neutralFallback: props?.area_name || props?.name || props?.area_id || '' });

      // Enrich: Market Gap, Brand Share, Demographics
      const marketGapRaw = pickFirst(props, ['market_gap', 'opportunity_gap', 'market_gap_pct', 'gap_percent', 'gap']);
      const brandShareRaw = pickFirst(props, ['brand_share', 'target_brand_share', 'red_bull_share', 'brand_penetration', 'brand_share_pct']);
      const populationRaw = pickFirst(props, ['total_population', 'population', 'TOTPOP_CY', 'value_TOTPOP_CY']);
      const incomeRaw = pickFirst(props, ['median_income', 'AVGHINC_CY', 'value_AVGHINC_CY', 'household_income']);

      const marketGap = marketGapRaw != null ? toNum(marketGapRaw) : null;
      const brandShare = brandShareRaw != null ? toNum(brandShareRaw) : null;
      const population = populationRaw != null ? toNum(populationRaw) : null;
      const income = incomeRaw != null ? toNum(incomeRaw) : null;

      return {
        name,
        score,
        details: {
          marketGap: marketGap,
          brandShare: brandShare,
          population: population,
          income: income
        }
      };
    })
    .filter((x: any) => x.name && !Number.isNaN(x.score))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, Math.min(10, candidateFeatures.length || 10));

  // Deduplicate by normalized name to avoid repeated entries (e.g., duplicate Oceanside ZIP)
  const seen = new Set<string>();
  ranked = ranked.filter(item => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (ranked.length >= 1) {
    const formatted = ranked.map((r: any, i: number) => {
      const bullets = [
        `   • Market Gap: ${fmtPct(r.details.marketGap)}`,
        `   • Brand Share: ${fmtPct(r.details.brandShare)}`,
        `   • Demographics: Pop ${fmtInt(r.details.population)}, Income ${fmtMoney(r.details.income)}`
      ].join('\n');
      return `${i + 1}. ${r.name} (Strategic Score: ${r.score.toFixed(2)})\n${bullets}`;
    }).join('\n');
    const stats = computeScoreStats(candidateFeatures, resolvedScoreField);
    const total = allFeatures.length;
    const studyAreaBlock = stats ? `Study Area Summary:\n• Areas analyzed: ${stats.count}${total && total !== stats.count ? `/${total}` : ''}\n• Avg score: ${stats.avg.toFixed(2)}\n• Range: ${stats.min.toFixed(2)} – ${stats.max.toFixed(2)}\n• Quartiles: Q1 ${stats.q1.toFixed(2)}, Q2 ${stats.q2.toFixed(2)}, Q3 ${stats.q3.toFixed(2)}\n\n` : '';
    const sectionRegex = /Top Strategic Markets:\s*(?:\n|\r\n)[\s\S]*?(?=\n{2,}[A-Z][^\n]{0,60}:\s*\n|\n{2,}\*\*|$)/i;
    const replacement = `Top Strategic Markets:\n\n${studyAreaBlock}${formatted}\n\n`;
    if (sectionRegex.test(finalContent)) {
      return finalContent.replace(sectionRegex, replacement);
    }
    // Fallback to original minimal replacement
    return finalContent.replace(/(Top Strategic Markets:\s*)([\s\S]*?)(\n\n|$)/i, (_m: string, p1: string) => `${p1}\n${studyAreaBlock}${formatted}\n\n`);
  }
  return finalContent;
}

export default injectTopStrategicMarkets;
