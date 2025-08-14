/* eslint-disable prefer-const */
// pages/api/layer-matching.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Anthropic } from '@anthropic-ai/sdk';
import type { LayerMatch } from '@/types/geospatial-ai-types';
import { layers, concepts } from '@/config/layers';
import type { LayerConfig } from '@/types/layers';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Extent from '@arcgis/core/geometry/Extent';
import { GoogleTrendsService } from '@/utils/services/google-trends-service';

interface CompositeFeature {
  geometry: any;
  attributes: {
    [key: string]: any;
    compositeIndex: number;
  };
}

export function createCompositeIndex(features: any[], layerMatches: LayerMatch[]): CompositeFeature[] {
  return features.map(feature => {
    let compositeScore = 0;
    let totalWeight = 0;

    layerMatches.forEach(match => {
      if (!match.field) return;
      const relevance = match.relevance ?? 0;
      const fieldValue = feature.attributes[match.field];
      if (fieldValue !== undefined && fieldValue !== null) {
        // Normalize all values to 0-100 range using min-max normalization
        const normalizedValue = Math.min(100, Math.max(0, fieldValue));
        compositeScore += (normalizedValue * relevance);
        totalWeight += relevance;
      }
    });

    return {
      geometry: feature.geometry,
      attributes: {
        ...feature.attributes,
        compositeIndex: totalWeight > 0 ? Math.round(compositeScore / totalWeight) : 0
      }
    };
  });
}

export function createVisualizationLayer(features: CompositeFeature[], title: string = "Combined Activity Index") {
  return {
    type: "feature",
    source: features,
    title: title,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0],
        outline: {
          color: [128, 128, 128, 0.5],
          width: "0.5px"
        }
      },
      visualVariables: [{
        type: "color",
        field: "compositeIndex",
        stops: [
          { value: 0, color: [240, 249, 243] },   // #f0f9f3 - light green
          { value: 50, color: [134, 203, 152] },  // #86cb98 - medium green
          { value: 100, color: [51, 168, 82] }    // #33a852 - target green
        ],
        legendOptions: {
          title: "Combined Activity Index"
        }
      }]
    }
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure it's a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: 'Missing question parameter' 
      });
    }

    // Try AI matching first
    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const aiMatches = await performAIMatching(anthropic, question, layers);
      if (aiMatches && aiMatches.length > 0) {
        return res.status(200).json({
          layerMatches: aiMatches,
          matchMethod: 'ai'
        });
      }
    } catch (aiError) {
      // Continue to rules-based matching as fallback
    }

    // Fallback to rules-based matching
    const rulesBasedMatches = performRulesBasedMatching(question);
    return res.status(200).json({
      layerMatches: rulesBasedMatches,
      matchMethod: 'rules'
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Layer matching failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function buildCategoriesFromLayers(layers: Record<string, LayerConfig>): Record<string, string[]> {
  const categories: Record<string, Set<string>> = {};
  
  Object.values(layers).forEach(layer => {
    // Extract terms from metadata tags
    layer.metadata?.tags?.forEach(tag => {
      const category = tag.split('-')[0] || tag; // Use first part of hyphenated tag as category
      if (!categories[category]) {
        categories[category] = new Set<string>();
      }
      categories[category].add(tag);
    });

    // Extract terms from field labels
    layer.fields?.forEach(field => {
      if (field.label) {
        const terms = field.label.toLowerCase().split(' ');
        terms.forEach(term => {
          if (!categories[term]) {
            categories[term] = new Set<string>();
          }
          categories[term].add(terms[0]); // Use the first term we already converted to lowercase
        });
      }
    });
  });

  // Convert Sets to arrays
  return Object.fromEntries(
    Object.entries(categories).map(([category, terms]) => [
      category,
      Array.from(terms)
    ])
  );
}

function performRulesBasedMatching(question: string): LayerMatch[] {
  const questionLower = question.toLowerCase();
  const matches: LayerMatch[] = [];

  Object.entries(layers).forEach(([layerId, layer]) => {
    if (!layer || layer.status !== 'active') return;

    let relevanceScore = 0;
    let matchedTerms: string[] = [];

    // Check layer fields against concepts
    layer.fields?.forEach(field => {
      const fieldNameLower = field.label?.toLowerCase() || '';
      
      Object.entries(concepts).forEach(([conceptName, concept]) => {
        concept.terms.forEach(term => {
          if (fieldNameLower.includes(term) && questionLower.includes(term)) {
            relevanceScore += concept.weight || 20;
            matchedTerms.push(field.label || '');
          }
        });
      });
    });

    // Check metadata tags
    layer.metadata?.tags?.forEach(tag => {
      if (questionLower.includes(tag.toLowerCase())) {
        relevanceScore += 15;
        matchedTerms.push(tag);
      }
    });

    if (relevanceScore > 0) {
      const featureLayer = new FeatureLayer({
        url: layer.url,
        outFields: ["*"]
      });

      matches.push({
        layer: featureLayer,
        extent: featureLayer.fullExtent || new Extent({
          xmin: -180,
          ymin: -90,
          xmax: 180,
          ymax: 90,
          spatialReference: { wkid: 4326 }
        }),
        layerId,
        relevance: relevanceScore,
        matchMethod: 'rules',
        confidence: relevanceScore / 100,
        reasoning: `Matched fields: ${matchedTerms.join(', ')}`,
        field: layer.rendererField
      });
    }
  });

  return matches.sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
}

async function performAIMatching(anthropic: Anthropic, question: string, layers: Record<string, LayerConfig>): Promise<LayerMatch[]> {
  // Get all active layers and their metadata
  const activeLayers = Object.entries(layers).filter(([_, layer]) => layer.status === 'active');
  const validLayerIds = activeLayers.map(([id]) => id);
  
  if (validLayerIds.length === 0) {
    return [];
  }

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    temperature: 0,
    system: `You are a geospatial data expert. Only return matches from these valid layer IDs: ${validLayerIds.join(', ')}. 
Each match must include the exact rendererField from the layer config.`,
    messages: [{
      role: "user",
      content: `Question: "${question}"

Available layers:
${activeLayers.map(([id, layer]) => `
- ID: ${id}
  Name: ${layer.name}
  Description: ${layer.description || 'N/A'}
  Fields: ${layer.fields?.map(f => f.label).join(', ') || 'N/A'}
  Tags: ${layer.metadata?.tags?.join(', ') || 'N/A'}
  Renderer Field: ${layer.rendererField}
`).join('\n')}

Return as JSON array with fields:
- layerId: string (must be one of: ${validLayerIds.join(', ')})
- relevance: number (0-100)
- confidence: number (0-1)
- reasoning: string
- field: string (must be exact rendererField from layer config)
- matchMethod: "ai"`
    }]
  });

  try {
    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    const matches = JSON.parse(content);
    // Validate matches against actual layer configuration
    return matches.filter((match: LayerMatch) => {
      if (!match.layerId) return false;
      return validLayerIds.includes(match.layerId) && 
             layers[match.layerId]?.rendererField === match.field;
    });
  } catch (e) {
    return [];
  }
}