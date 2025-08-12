import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Send, Bot, User, Loader2, Copy, Check } from 'lucide-react';
import { UnifiedAnalysisResponse } from './UnifiedAnalysisWrapper';
import { renderPerformanceMetrics } from '@/lib/utils/performanceMetrics';

interface UnifiedAnalysisChatProps {
  analysisResult: UnifiedAnalysisResponse;
  onExportChart: () => void;
  onZipCodeClick?: (zipCode: string) => void;
  persona?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function UnifiedAnalysisChat({ analysisResult, onExportChart, onZipCodeClick, persona = 'strategist' }: UnifiedAnalysisChatProps) {

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasGeneratedNarrative, setHasGeneratedNarrative] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleMessageClick = useCallback((message: ChatMessage) => {
    setSelectedMessage(message);
  }, []);

  const handleCopyMessage = useCallback(async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  }, []);

  const handleZipCodeClick = useCallback((zipCode: string) => {
    console.log(`[UnifiedAnalysisChat] ZIP code ${zipCode} clicked - zooming to feature`);
    if (onZipCodeClick) {
      onZipCodeClick(zipCode);
    } else {
      console.warn('[UnifiedAnalysisChat] onZipCodeClick prop not provided - cannot zoom to ZIP code');
    }
  }, [onZipCodeClick]);

  const renderFormattedMessage = useCallback((content: string) => {
    // Split content into lines to preserve formatting
    const lines = content.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Check if line is a header (all caps or starts with ###)
      const isHeader = /^[A-Z\s]+:?\s*$/.test(line.trim()) && line.trim().length > 0;
      const isBulletPoint = line.trim().startsWith('•') || line.trim().startsWith('-');
      const isNumberedItem = /^\d+\.\s/.test(line.trim());
      
      // Process ZIP codes in the line to make them clickable
      const processLine = (text: string) => {
        const parts = text.split(/\b(\d{5})\b/);
        return parts.map((part, partIndex) => {
          if (/^\d{5}$/.test(part)) {
            // This is a ZIP code - make it clickable
            return (
              <button
                key={`${lineIndex}-${partIndex}`}
                className="inline-flex items-center px-1 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors cursor-pointer mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZipCodeClick(part);
                }}
                title={`Click to zoom to ZIP code ${part}`}
              >
                {part}
              </button>
            );
          }
          return part;
        });
      };
      
      // Apply styling based on line type
      if (isHeader) {
        return (
          <div key={lineIndex} className="font-bold text-sm mt-3 mb-2 first:mt-0">
            {processLine(line)}
          </div>
        );
      } else if (isBulletPoint) {
        return (
          <div key={lineIndex} className="ml-4 mb-1">
            {processLine(line)}
          </div>
        );
      } else if (isNumberedItem) {
        return (
          <div key={lineIndex} className="font-semibold mb-2 mt-2">
            {processLine(line)}
          </div>
        );
      } else if (line.trim() === '') {
        return <div key={lineIndex} className="h-2"></div>; // Empty line spacing
      } else {
        return (
          <div key={lineIndex} className="mb-2">
            {processLine(line)}
          </div>
        );
      }
    });
  }, [handleZipCodeClick]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const generateInitialNarrative = useCallback(async () => {
    setHasGeneratedNarrative(true);
    setIsProcessing(true);

    // Add initial loading message
    const loadingMessage: ChatMessage = {
      id: 'loading',
      role: 'assistant',
      content: 'Analyzing your data and generating insights...',
      timestamp: new Date()
    };
    setMessages([loadingMessage]);

    try {
      console.log('[UnifiedAnalysisChat] Generating initial AI narrative...');
      
      // Prepare the request to generate AI narrative
      const { analysisResult: result, metadata } = analysisResult;
      
      // Build the request payload
      const requestPayload = {
        messages: [{
          role: 'user' as const,
          content: `Provide a comprehensive analysis of the ${result.endpoint?.replace('/', '').replace(/-/g, ' ')} results`
        }],
        metadata: {
          query: `Analyze the ${result.endpoint?.replace('/', '').replace(/-/g, ' ')} results`,
          analysisType: result.endpoint?.replace('/', '').replace(/-/g, '_') || 'strategic_analysis',
          relevantLayers: ['unified_analysis'],
          spatialFilterIds: (metadata as any)?.spatialFilterIds,
          filterType: (metadata as any)?.filterType,
          rankingContext: (metadata as any)?.rankingContext,
          isClustered: result.data?.isClustered,
          clusterAnalysis: (result.data as any)?.clusterAnalysis
        },
        featureData: [{
          layerId: 'unified_analysis',
          layerName: 'Analysis Results',
          layerType: 'polygon',
          features: result.data?.records?.slice(0, 50) || [] // Limit to 50 for performance
        }],
        persona: persona // Use the selected persona
      };

      console.log('[UnifiedAnalysisChat] Request payload prepared:', {
        endpoint: result.endpoint,
        recordCount: result.data?.records?.length,
        spatialFilter: !!(metadata as any)?.spatialFilterIds,
        isClustered: !!result.data?.isClustered
      });

      // Call the Claude API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch('/api/claude/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UnifiedAnalysisChat] API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const claudeResponse = await response.json();
      
      if (claudeResponse.content) {
        // Clean the response content to remove any leaked prompt instructions
        let cleanContent = claudeResponse.content;
        
        // Remove any prompt instructions that might have leaked into the response
        const promptMarkers = [
          'STRATEGIC ANALYSIS TECHNICAL CONTEXT:',
          'REQUIRED RESPONSE FORMAT:',
          'DATA STRUCTURE:',
          'CRITICAL REQUIREMENTS:',
          'ANALYSIS FOCUS:',
          'ACTIONABLE RECOMMENDATIONS REQUIRED:',
          'CLUSTERING-SPECIFIC INSTRUCTIONS:',
          'CITY-LEVEL ANALYSIS SUPPORT:',
          'MODEL ATTRIBUTION REQUIREMENTS:',
          'CRITICAL FIELD DATA TYPE INSTRUCTIONS:',
          'MANDATORY FIELD TYPE RECOGNITION:',
          'SAMPLE-BASED ANALYSIS CONTEXT'
        ];
        
        // Find the first occurrence of any prompt marker and cut off there
        let cutIndex = cleanContent.length;
        promptMarkers.forEach(marker => {
          const index = cleanContent.indexOf(marker);
          if (index !== -1 && index < cutIndex) {
            cutIndex = index;
          }
        });
        
        if (cutIndex < cleanContent.length) {
          cleanContent = cleanContent.substring(0, cutIndex).trim();
          console.log('[UnifiedAnalysisChat] Removed leaked prompt instructions from response');
        }
        
        // Replace loading message with actual narrative
        const narrativeMessage: ChatMessage = {
          id: '1',
          role: 'assistant',
          content: cleanContent,
          timestamp: new Date()
        };
        setMessages([narrativeMessage]);
        console.log('[UnifiedAnalysisChat] AI narrative generated successfully');
      } else {
        throw new Error('No content in API response');
      }
    } catch (error) {
      console.error('[UnifiedAnalysisChat] Failed to generate AI narrative:', error);
      
      // Determine error type and provide appropriate fallback
      let errorMessage = 'Failed to generate AI analysis.';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'AI analysis timed out. Please try asking a specific question instead.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Authentication error. Please check API configuration.';
        } else {
          errorMessage = `AI analysis failed: ${error.message}`;
        }
      }
      
      // Fallback to simple summary with error info
      const fallbackMessage: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: `Analysis completed! ${analysisResult.analysisResult.data.summary}

⚠️ ${errorMessage}

You can ask specific questions about the data in the chat below.`,
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [analysisResult]);

  // Auto-generate AI narrative when analysisResult is available
  React.useEffect(() => {
    if (!hasGeneratedNarrative && analysisResult) {
      console.log('[UnifiedAnalysisChat] Starting auto-generation of AI narrative');
      generateInitialNarrative();
    }
  }, [hasGeneratedNarrative, analysisResult, generateInitialNarrative]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Simulate AI response (in real implementation, this would call the analysis API)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on your analysis results, I can help you understand the ${analysisResult.analysisResult.data.targetVariable} patterns. What specific aspect would you like to explore?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1500);
  }, [inputValue, isProcessing, analysisResult]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 min-h-0 max-h-[60vh] overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`flex-1 max-w-[90%] ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}>
              <div className="relative group">
                <div 
                  className={`inline-block p-3 rounded-lg text-xs cursor-pointer transition-all hover:shadow-md ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="whitespace-pre-wrap" style={{ lineHeight: '1.5' }}>
                    {renderFormattedMessage(message.content)}
                  </div>
                </div>
                {/* Copy button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 ${
                    message.role === 'user' ? 'text-white hover:bg-blue-600' : 'text-gray-500 hover:bg-gray-300'
                  }`}
                  onClick={() => handleCopyMessage(message)}
                >
                  {copiedMessageId === message.id ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-3 rounded-lg bg-gray-100">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask questions about your analysis results..."
            className="flex-1 min-h-[60px] text-xs"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            size="sm"
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2">
          {renderPerformanceMetrics(
            analysisResult.analysisResult,
            "flex flex-wrap gap-2"
          )}
        </div>
      </div>

      {/* MessageDialog for expanded message viewing - same as original UI */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white" aria-describedby="analysis-details-description">
          <DialogHeader>
            <DialogTitle>Analysis Details</DialogTitle>
          </DialogHeader>
          <div id="analysis-details-description" className="space-y-4">
            <div>
              <p className="whitespace-pre-wrap">{selectedMessage?.content}</p>
            </div>
            {analysisResult.analysisResult.data.records && (
              <div>
                <h4 className="font-semibold">Results:</h4>
                <p>{analysisResult.analysisResult.data.records.length} features found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}