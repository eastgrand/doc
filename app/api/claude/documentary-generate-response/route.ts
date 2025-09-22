/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { layers } from '@/config/layers';
import { ExtendedLayerConfig, LayerConfig } from '@/types/layers';
import type { AnalysisResponse, ProcessedLayerResult } from '@/types/geospatial-chat';
import { NextRequest } from 'next/server';
import { LocalGeospatialFeature } from '@/types/index';
import { getRelevantFields } from '@/app/utils/field-analysis';
import { EnhancedQueryAnalyzer } from '@/lib/analysis/EnhancedQueryAnalyzer';
import { detectThresholdQuery, detectSegmentQuery, detectComparativeQuery } from '@/lib/analytics/query-analysis';
import { getDocumentaryPersona } from '../shared/documentary-personas';
import { unionByGeoId } from '../../../../types/union-layer';
import { multiEndpointFormatting, strategicSynthesis } from '../shared/base-prompt';
import { GeoAwarenessEngine } from '../../../../lib/geo/GeoAwarenessEngine';
import { getDocumentaryAnalysisPrompt } from '../shared/documentary-analysis-prompts';
import { resolveAreaName as resolveSharedAreaName, getZip as getSharedFSA, resolveRegionName as resolveSharedRegionName } from '@/lib/shared/AreaName';
import { getAnalysisLayers, sanitizeSummaryForAnalysis, sanitizeRankingArrayForAnalysis } from '@/lib/analysis/analysisLens';
import { filterFeaturesBySpatialFilterIds, extractFeatureId } from '@/lib/analysis/utils/spatialFilter';
import { getPrimaryScoreField, getTopFieldDefinitions } from '@/lib/analysis/strategies/processors/HardcodedFieldDefs';

/**
 * Validate documentary analysis response for hallucinated data
 */
function validateDocumentaryResponse(response: string, originalAnalysis: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Extract ZIP codes from both texts
  const responseZips: string[] = response.match(/\b\d{5}\b/g) || [];
  const originalZips: string[] = originalAnalysis.match(/\b\d{5}\b/g) || [];
  
  // Check for ZIP codes outside IL, IN, WI (doors documentary target markets)
  const outsideTargetMarkets = responseZips.filter(zip => {
    const firstDigit = zip.charAt(0);
    // IL: 606xx-629xx, IN: 460xx-479xx, WI: 530xx-549xx
    return !['6', '4', '5'].includes(firstDigit);
  });
  if (outsideTargetMarkets.length > 0) {
    issues.push(`ZIP codes outside target markets (IL/IN/WI): ${outsideTargetMarkets.join(', ')}`);
  }
  
  // Check for ZIP codes in response that aren't in original
  const hallucinatedZips = responseZips.filter(zip => !originalZips.includes(zip));
  if (hallucinatedZips.length > 0) {
    issues.push(`Hallucinated ZIP codes: ${hallucinatedZips.join(', ')}`);
  }
  
  // Check for doors_audience_score values outside valid range (27-69)
  const scoreMatches = response.match(/doors_audience_score[:\s]*(\d+\.?\d*)/gi);
  if (scoreMatches) {
    const invalidScores = scoreMatches.filter(match => {
      const scoreValue = parseFloat(match.replace(/[^\d.]/g, ''));
      return scoreValue < 27 || scoreValue > 69;
    });
    if (invalidScores.length > 0) {
      issues.push(`Invalid doors_audience_score values (must be 27-69): ${invalidScores.join(', ')}`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Documentary-specific spatial filter validation
 */
function validateDocumentarySpatialData(features: LocalGeospatialFeature[]): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!features || features.length === 0) {
    issues.push('No features provided for documentary analysis');
    return { isValid: false, issues };
  }
  
  // Check for required documentary fields
  const requiredFields = ['doors_audience_score'];
  const firstFeature = features[0];
  
  const missingFields = requiredFields.filter(field => 
    !(field in firstFeature.properties) && 
    !(field in firstFeature)
  );
  
  if (missingFields.length > 0) {
    issues.push(`Missing required documentary fields: ${missingFields.join(', ')}`);
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { query, summary, spatialFilterIds, analysisLensType } = body;

    // Validate request
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required and must be a string' }, { status: 400 });
    }

    if (!summary || !summary.insights) {
      return NextResponse.json({ error: 'Summary with insights is required' }, { status: 400 });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Get documentary persona for entertainment industry context
    const documentaryPersona = getDocumentaryPersona();

    // Enhanced query analysis for documentary content
    const enhancedAnalyzer = new EnhancedQueryAnalyzer();
    const analyzedQuery = enhancedAnalyzer.analyzeQuery(query);
    const analysisEndpoint = analyzedQuery.suggestedEndpoint || '/strategic-analysis';

    // Get documentary-specific analysis prompt
    const analysisType = analysisEndpoint.replace('/', '').replace('-', '_');
    const documentaryAnalysisPrompt = getDocumentaryAnalysisPrompt(analysisType);

    // Apply spatial filtering for documentary market analysis
    let spatiallyFilteredInsights = summary.insights;
    let spatialValidation = { isValid: true, issues: [] as string[] };

    if (spatialFilterIds && spatialFilterIds.length > 0) {
      const filteredResults = filterFeaturesBySpatialFilterIds(summary.insights.results, spatialFilterIds);
      spatialValidation = validateDocumentarySpatialData(filteredResults);
      
      if (!spatialValidation.isValid) {
        console.warn('[Documentary Route] Spatial validation issues:', spatialValidation.issues);
      }
      
      spatiallyFilteredInsights = {
        ...summary.insights,
        results: filteredResults
      };
    }

    // Format data for documentary analysis
    const formattedData = multiEndpointFormatting(
      spatiallyFilteredInsights,
      query,
      analyzedQuery
    );

    // Create documentary industry context
    const documentaryContext = `
🎬 THE DOORS DOCUMENTARY MARKET ANALYSIS

TARGET MARKETS: Illinois, Indiana, Wisconsin (Primary Launch Markets)
AUDIENCE FOCUS: Classic Rock Enthusiasts (Ages 45-70)
SCORING SYSTEM: Doors Audience Score (27-69 range)

Key Entertainment Metrics:
- Classic Rock Affinity (40% weight)
- Documentary Engagement (25% weight) 
- Music Consumption (20% weight)
- Cultural Engagement (15% weight)

ENTERTAINMENT INDUSTRY CONTEXT:
${documentaryPersona.description}

ANALYSIS REQUIREMENTS:
${documentaryAnalysisPrompt}
`;

    // Construct the documentary analysis prompt
    const prompt = `${documentaryContext}

${strategicSynthesis}

USER QUERY: "${query}"

DOCUMENTARY MARKET DATA:
${formattedData}

Provide a comprehensive documentary market analysis focusing on audience appeal, strategic launch opportunities, and entertainment industry insights. Use entertainment industry terminology and focus on cultural engagement patterns.`;

    // Generate response
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Validate documentary response
    const responseValidation = validateDocumentaryResponse(responseText, formattedData);
    
    if (!responseValidation.isValid) {
      console.warn('[Documentary Route] Response validation issues:', responseValidation.issues);
    }

    // Return documentary analysis response
    return NextResponse.json({
      response: responseText,
      analyzedQuery: {
        ...analyzedQuery,
        documentarySpecific: true,
        targetMarkets: ['IL', 'IN', 'WI'],
        scoreRange: '27-69',
        primaryMetric: 'doors_audience_score'
      },
      spatialValidation,
      responseValidation,
      debugInfo: {
        queryType: 'documentary_analysis',
        endpoint: analysisEndpoint,
        spatialFilterApplied: spatialFilterIds && spatialFilterIds.length > 0,
        persona: 'documentary_specialist'
      }
    });

  } catch (error) {
    console.error('[Documentary Generate Response] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate documentary analysis response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}