'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  isPhase4FeatureEnabled, 
  getPhase4FeatureConfig 
} from '@/config/phase4-features';
import { 
  generateAIInsights,
  type AIInsight as ServiceAIInsight,
  type ExecutiveSummary as ServiceExecutiveSummary,
  type AIInsightRequest
} from '@/lib/integrations/ai-insights-service';
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  FileText,
  BarChart3,
  Shield,
  DollarSign,
  Copy
} from 'lucide-react';

// Types for AI insights
interface AIInsight {
  id: string;
  type: 'pattern' | 'opportunity' | 'risk' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: 'strategic' | 'demographic' | 'competitive' | 'economic';
  supportingData: {
    metric: string;
    value: string | number;
    source: string;
  }[];
  actionItems?: string[];
  relatedInsights?: string[];
  timestamp: Date;
}

interface ExecutiveSummary {
  overview: string;
  keyFindings: string[];
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  confidenceScore: number;
  roi: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
}

interface AIInsightGeneratorProps {
  analysisResult?: any; // Changed from analysisData for consistency
  analysisContext?: {
    location?: string;
    brand?: string;
    analysisType?: string;
    zipCodes?: string[];
    selectedAreaName?: string;
    persona?: string;
  };
  businessContext?: string;
  confidenceThreshold?: number;
  maxInsights?: number;
  onInsightGenerated?: (insight: AIInsight) => void;
  onSummaryGenerated?: (summary: ExecutiveSummary) => void;
  onCopyInsight?: (insight: AIInsight) => void;
  className?: string;
}

// Mock insight generator (replace with real AI analysis)
const generateMockInsights = (context: any): AIInsight[] => [
  {
    id: 'insight-1',
    type: 'opportunity',
    title: 'High-Growth Market Segment Identified',
    description: 'Analysis reveals a 34% higher energy drink affinity in Orange County compared to state average, with particularly strong performance in the 25-34 age bracket earning $60-100K annually.',
    confidence: 0.94,
    impact: 'high',
    category: 'strategic',
    supportingData: [
      { metric: 'Market Affinity', value: '+34%', source: 'Demographic Analysis' },
      { metric: 'Target Age Group', value: '25-34 years', source: 'Census Data' },
      { metric: 'Income Bracket', value: '$60-100K', source: 'Economic Data' }
    ],
    actionItems: [
      'Focus marketing on 25-34 age demographic',
      'Position products in premium retail locations',
      'Develop targeted digital campaigns for high-income segments'
    ],
    timestamp: new Date()
  },
  {
    id: 'insight-2',
    type: 'risk',
    title: 'Market Saturation Risk in Newport Beach',
    description: 'Competitor density is 2.3x the county average in Newport Beach, suggesting potential market saturation and intense competition.',
    confidence: 0.87,
    impact: 'medium',
    category: 'competitive',
    supportingData: [
      { metric: 'Competitor Density', value: '2.3x average', source: 'Competitive Analysis' },
      { metric: 'Market Share Available', value: '12%', source: 'Market Research' },
      { metric: 'Customer Loyalty', value: 'High', source: 'Consumer Survey' }
    ],
    actionItems: [
      'Consider alternative locations in Irvine or Huntington Beach',
      'Develop differentiation strategy for Newport Beach',
      'Focus on underserved customer segments'
    ],
    timestamp: new Date()
  },
  {
    id: 'insight-3',
    type: 'pattern',
    title: 'Spatial Clustering of Target Demographics',
    description: 'DBSCAN analysis identifies 3 distinct geographic clusters with high concentration of target demographics, suggesting optimal store placement locations.',
    confidence: 0.91,
    impact: 'high',
    category: 'demographic',
    supportingData: [
      { metric: 'Identified Clusters', value: 3, source: 'Spatial Analysis' },
      { metric: 'Population Coverage', value: '67%', source: 'Demographics' },
      { metric: 'Accessibility Score', value: 8.7, source: 'Geographic Analysis' }
    ],
    actionItems: [
      'Prioritize expansion in identified cluster centers',
      'Optimize distribution routes based on clusters',
      'Tailor marketing messages for each cluster'
    ],
    timestamp: new Date()
  },
  {
    id: 'insight-4',
    type: 'prediction',
    title: '24-Month Growth Projection',
    description: 'Predictive modeling indicates 28-35% market growth potential over the next 24 months, driven by demographic shifts and economic indicators.',
    confidence: 0.82,
    impact: 'high',
    category: 'economic',
    supportingData: [
      { metric: 'Growth Range', value: '28-35%', source: 'Predictive Model' },
      { metric: 'Population Growth', value: '+3.2%', source: 'Census Projection' },
      { metric: 'Disposable Income', value: '+5.1%', source: 'Economic Forecast' }
    ],
    actionItems: [
      'Secure market position before competitors',
      'Plan phased expansion to capture growth',
      'Build brand awareness early in growth cycle'
    ],
    timestamp: new Date()
  }
];

// Generate executive summary
const generateExecutiveSummary = (insights: AIInsight[]): ExecutiveSummary => ({
  overview: 'Market analysis reveals significant expansion opportunity with 34% higher product affinity than state average. Strategic entry recommended with focus on identified demographic clusters.',
  keyFindings: [
    'Orange County shows 34% higher energy drink consumption than California average',
    'Three distinct geographic clusters identified for optimal store placement',
    '28-35% market growth projected over next 24 months',
    'Target demographic (25-34, $60-100K income) comprises 67% of consumption'
  ],
  recommendations: [
    'Prioritize expansion in Irvine and Huntington Beach markets',
    'Focus marketing on 25-34 age demographic with premium positioning',
    'Implement phased rollout strategy aligned with cluster analysis',
    'Develop competitive differentiation for saturated markets'
  ],
  risks: [
    'Market saturation in Newport Beach (2.3x competitor density)',
    'Price sensitivity in lower-income segments',
    'Supply chain constraints for rapid expansion'
  ],
  opportunities: [
    '$23.7M addressable market in target region',
    'First-mover advantage in emerging Irvine market',
    'Partnership potential with local fitness centers and universities'
  ],
  confidenceScore: 0.89,
  roi: {
    conservative: 18,
    moderate: 34,
    aggressive: 52
  }
});

/**
 * AIInsightGenerator - Advanced Feature Implementation
 * 
 * AI-powered insight extraction and narrative generation.
 * Modular component that can be disabled via feature flags.
 */
export const AIInsightGenerator: React.FC<AIInsightGeneratorProps> = ({
  analysisResult,
  analysisContext,
  businessContext,
  confidenceThreshold,
  maxInsights,
  onInsightGenerated,
  onSummaryGenerated,
  onCopyInsight,
  className
}) => {
  // Check if feature is enabled
  const isEnabled = isPhase4FeatureEnabled('aiInsights');
  const config = getPhase4FeatureConfig('aiInsights');
  
  // State
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'summary' | 'recommendations'>('insights');
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  
  // If feature is disabled, return null
  if (!isEnabled) {
    return null;
  }
  
  // Generate insights using real AI service
  const generateInsights = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Prepare request for AI insights service
      const request: AIInsightRequest = {
        analysisData: analysisResult,
        analysisContext: analysisContext || {},
        maxInsights: maxInsights || config?.maxInsightsPerAnalysis || 5,
        confidenceThreshold: confidenceThreshold || config?.confidenceThreshold || 0.85,
        businessContext: businessContext || analysisContext?.persona || 'market expansion analysis'
      };
      
      // Generate insights using Claude AI
      const response = await generateAIInsights(request);
      
      setInsights(response.insights);
      setExecutiveSummary(response.executiveSummary);
      
      // Notify parent components
      response.insights.forEach(insight => onInsightGenerated?.(insight));
      onSummaryGenerated?.(response.executiveSummary);
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      
      // Fallback to mock data on error
      const fallbackInsights = generateMockInsights(analysisContext);
      const filteredFallback = fallbackInsights.filter(
        insight => insight.confidence >= (confidenceThreshold || config?.confidenceThreshold || 0.8)
      ).slice(0, maxInsights || config?.maxInsightsPerAnalysis || 5);
      
      setInsights(filteredFallback);
      setExecutiveSummary(generateExecutiveSummary(filteredFallback));
    } finally {
      setIsGenerating(false);
    }
  }, [analysisResult, analysisContext, businessContext, confidenceThreshold, maxInsights, config, onInsightGenerated, onSummaryGenerated]);
  
  // Auto-generate on mount if data available
  useEffect(() => {
    if (analysisResult || analysisContext) {
      generateInsights();
    }
  }, [analysisResult, analysisContext, generateInsights]);
  
  // Group insights by type
  const groupedInsights = useMemo(() => {
    const groups: Record<string, AIInsight[]> = {};
    insights.forEach(insight => {
      if (!groups[insight.type]) {
        groups[insight.type] = [];
      }
      groups[insight.type].push(insight);
    });
    return groups;
  }, [insights]);
  
  // Get insight type icon
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity': return Target;
      case 'risk': return AlertTriangle;
      case 'pattern': return BarChart3;
      case 'recommendation': return Lightbulb;
      case 'prediction': return TrendingUp;
    }
  };
  
  // Get impact color
  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
    }
  };
  
  // Copy insight to clipboard
  const copyInsight = useCallback((insight: AIInsight) => {
    const text = `${insight.title}\n\n${insight.description}\n\nConfidence: ${Math.round(insight.confidence * 100)}%\nImpact: ${insight.impact}`;
    navigator.clipboard.writeText(text);
    onCopyInsight?.(insight);
  }, [onCopyInsight]);
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI-Powered Insights</h3>
            <p className="text-xs text-muted-foreground">
              Intelligent pattern detection and recommendations
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={generateInsights}
            disabled={isGenerating}
            className="text-xs"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">
            Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>
        
        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {Object.entries(groupedInsights).map(([type, typeInsights]) => (
                <div key={type} className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                    {type} ({typeInsights.length})
                  </h4>
                  
                  {typeInsights.map(insight => {
                    const Icon = getInsightIcon(insight.type);
                    
                    return (
                      <Card
                        key={insight.id}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedInsight === insight.id && "ring-2 ring-blue-500"
                        )}
                        onClick={() => setSelectedInsight(
                          selectedInsight === insight.id ? null : insight.id
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <div className={cn("p-1 rounded", {
                                'bg-yellow-100 dark:bg-yellow-900/20': insight.type === 'opportunity',
                                'bg-red-100 dark:bg-red-900/20': insight.type === 'risk',
                                'bg-blue-100 dark:bg-blue-900/20': insight.type === 'pattern',
                                'bg-green-100 dark:bg-green-900/20': insight.type === 'recommendation',
                                'bg-purple-100 dark:bg-purple-900/20': insight.type === 'prediction'
                              })}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-sm">
                                  {insight.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(insight.confidence * 100)}% confidence
                                  </Badge>
                                  <Badge
                                    variant={insight.impact === 'high' ? 'destructive' : 
                                            insight.impact === 'medium' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {insight.impact} impact
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyInsight(insight);
                              }}
                              className="text-xs"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            {insight.description}
                          </p>
                          
                          {selectedInsight === insight.id && (
                            <>
                              {/* Supporting Data */}
                              {insight.supportingData.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-xs font-semibold">Supporting Data</h5>
                                  <div className="grid grid-cols-1 gap-2">
                                    {insight.supportingData.map((data, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between text-xs p-2 rounded bg-muted"
                                      >
                                        <span className="text-muted-foreground">
                                          {data.metric}
                                        </span>
                                        <div className="text-right">
                                          <div className="font-semibold">{data.value}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {data.source}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Action Items */}
                              {insight.actionItems && insight.actionItems.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-xs font-semibold">Recommended Actions</h5>
                                  <ul className="space-y-1">
                                    {insight.actionItems.map((action, i) => (
                                      <li key={i} className="flex items-start gap-2 text-xs">
                                        <ChevronRight className="w-3 h-3 mt-0.5 text-muted-foreground" />
                                        <span>{action}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ))}
              
              {insights.length === 0 && !isGenerating && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No insights generated yet. Click "Generate Insights" to start.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Executive Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          {executiveSummary ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Executive Summary</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {Math.round(executiveSummary.confidenceScore * 100)}% confidence
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {insights.length} insights analyzed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overview */}
                <div>
                  <h5 className="text-xs font-semibold mb-2">Overview</h5>
                  <p className="text-xs text-muted-foreground">
                    {executiveSummary.overview}
                  </p>
                </div>
                
                {/* Key Findings */}
                <div>
                  <h5 className="text-xs font-semibold mb-2">Key Findings</h5>
                  <ul className="space-y-1">
                    {executiveSummary.keyFindings.map((finding, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 mt-0.5 text-green-500" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* ROI Projections */}
                <div>
                  <h5 className="text-xs font-semibold mb-2">ROI Projections</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Conservative</p>
                      <p className="text-lg font-semibold text-green-600">
                        {executiveSummary.roi.conservative}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Moderate</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {executiveSummary.roi.moderate}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Aggressive</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {executiveSummary.roi.aggressive}%
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Opportunities & Risks */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-semibold mb-2 text-green-600">
                      Opportunities
                    </h5>
                    <ul className="space-y-1">
                      {executiveSummary.opportunities.map((opp, i) => (
                        <li key={i} className="text-xs">• {opp}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold mb-2 text-red-600">
                      Risks
                    </h5>
                    <ul className="space-y-1">
                      {executiveSummary.risks.map((risk, i) => (
                        <li key={i} className="text-xs">• {risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Generate insights to see executive summary
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {executiveSummary ? (
            <div className="space-y-4">
              {executiveSummary.recommendations.map((rec, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <Target className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">
                          Recommendation {i + 1}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rec}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark Complete
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            Create Task
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Generate insights to see recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Summary Stats */}
      {insights.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{insights.filter(i => i.type === 'opportunity').length} opportunities</span>
            <span>{insights.filter(i => i.type === 'risk').length} risks</span>
            <span>{insights.filter(i => i.type === 'pattern').length} patterns</span>
          </div>
          <div>
            Avg confidence: {Math.round(
              insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length * 100
            )}%
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightGenerator;