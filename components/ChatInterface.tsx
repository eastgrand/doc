// ChatInterface component - complete chat functionality for analysis results
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
import { Send, Bot, User, Loader2, Copy, Check, X } from 'lucide-react';
import { renderPerformanceMetrics } from '@/lib/utils/performanceMetrics';
import { 
  calculateBasicStats, 
  calculateDistribution, 
  detectPatterns,
  formatStatsForChat,
  formatDistributionForChat,
  formatPatternsForChat
} from '@/lib/analysis/statsCalculator';
import { ErrorBoundary } from './ErrorBoundary';
import { sendChatMessage } from '@/services/chat-service';

// Wrapper component for performance metrics
const PerformanceMetrics = ({ analysisResult, className }: { analysisResult: any, className: string }) => {
  if (!analysisResult) return null;
  return renderPerformanceMetrics(analysisResult, className);
};

interface UnifiedAnalysisResponse {
  analysisResult: any;
  metadata?: any;
}

interface ChatInterfaceProps {
  analysisResult: UnifiedAnalysisResponse;
  onExportChart?: () => void;
  onZipCodeClick?: (zipCode: string) => void;
  persona?: string;
  messages?: ChatMessage[];
  setMessages?: (messages: ChatMessage[]) => void;
  hasGeneratedNarrative?: boolean;
  setHasGeneratedNarrative?: (value: boolean) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Inner component - following QueryInterface pattern with full UnifiedAnalysisChat functionality
const ChatInterfaceInner: React.FC<ChatInterfaceProps> = ({ 
  analysisResult, 
  onExportChart, 
  onZipCodeClick, 
  persona = 'strategist',
  messages: externalMessages,
  setMessages: externalSetMessages,
  hasGeneratedNarrative: externalHasGeneratedNarrative,
  setHasGeneratedNarrative: externalSetHasGeneratedNarrative
}) => {

  // Use external state if provided, otherwise fall back to local state
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [localHasGeneratedNarrative, setLocalHasGeneratedNarrative] = useState(false);
  
  const messages = externalMessages || localMessages;
  const setMessages = externalSetMessages || setLocalMessages;
  const hasGeneratedNarrative = externalHasGeneratedNarrative ?? localHasGeneratedNarrative;
  const setHasGeneratedNarrative = externalSetHasGeneratedNarrative || setLocalHasGeneratedNarrative;

  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'full' | 'stats-only'>('full');
  
  // Abort controller for cancelling chat requests
  const chatAbortControllerRef = useRef<AbortController | null>(null);
  
  // Stop chat processing function
  const stopChatProcessing = useCallback(() => {
    console.log('[ChatInterface] Stopping chat processing...');
    
    // Abort any ongoing requests
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
      chatAbortControllerRef.current = null;
    }
    
    // Reset processing state
    setIsProcessing(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
  }, []);

  // Command processing
  const processCommand = useCallback((input: string): { isCommand: boolean; response?: string; action?: string } => {
    if (!input.startsWith('/')) {
      return { isCommand: false };
    }

    const [command, ...args] = input.slice(1).split(' ');
    const lowerCommand = command.toLowerCase();

    switch (lowerCommand) {
      case 'quick':
      case 'stats':
        setAnalysisMode('stats-only');
        return { 
          isCommand: true, 
          response: '📊 **Stats-Only Mode Enabled**\n\nFuture analysis will show statistics only without AI insights. This is faster and uses fewer resources.\n\nUse `/full` to re-enable AI analysis.',
          action: 'mode-change'
        };

      case 'full':
      case 'ai':
        setAnalysisMode('full');
        return { 
          isCommand: true, 
          response: '🤖 **Full Analysis Mode Enabled**\n\nFuture analysis will include comprehensive AI insights along with statistics.\n\nUse `/quick` for stats-only mode.',
          action: 'mode-change'
        };

      case 'export':
        try {
          const latestMessage = messages.find(m => m.role === 'assistant');
          if (latestMessage) {
            navigator.clipboard.writeText(latestMessage.content);
            return { 
              isCommand: true, 
              response: '✅ **Analysis Exported**\n\nThe latest analysis has been copied to your clipboard.',
              action: 'export'
            };
          } else {
            return { 
              isCommand: true, 
              response: '❌ **Export Failed**\n\nNo analysis found to export. Please run an analysis first.',
              action: 'export'
            };
          }
        } catch (error) {
          return { 
            isCommand: true, 
            response: '❌ **Export Failed**\n\nUnable to copy to clipboard. Please try selecting and copying manually.',
            action: 'export'
          };
        }

      case 'help':
      case 'commands':
        return { 
          isCommand: true, 
          response: `🔧 **Available Commands**

**Analysis Modes:**
• \`/quick\` or \`/stats\` - Stats-only mode (faster, no AI)
• \`/full\` or \`/ai\` - Full analysis with AI insights (default)

**Utilities:**
• \`/export\` - Copy current analysis to clipboard
• \`/help\` - Show this command list

**Tips:**
- Commands work anywhere in the chat
- Current mode: **${analysisMode === 'full' ? 'Full Analysis' : 'Stats Only'}**
- Stats always appear within 3 seconds
- Full AI analysis takes 5-10 seconds`,
          action: 'help'
        };

      case 'status':
        const { analysisResult: result } = analysisResult;
        const recordCount = result.data?.records?.length || 0;
        return { 
          isCommand: true, 
          response: `📊 **Analysis Status**

**Current Dataset:**
• Areas analyzed: ${recordCount}
• Analysis type: ${result.endpoint?.replace('/', '').replace(/-/g, ' ') || 'Unknown'}
• Mode: ${analysisMode === 'full' ? 'Full Analysis' : 'Stats Only'}

**Available Data:**
• Basic statistics ✅
• Distribution analysis ✅
• Pattern detection ✅
• AI insights ${analysisMode === 'full' ? '✅' : '⚠️ Disabled'}

Use \`/help\` for available commands.`,
          action: 'status'
        };

      default:
        return { 
          isCommand: true, 
          response: `❓ **Unknown Command: "${command}"**\n\nUse \`/help\` to see available commands.`,
          action: 'unknown'
        };
    }
  }, [analysisMode, messages, analysisResult]);

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
    console.log(`[ChatInterface] ZIP code ${zipCode} clicked - zooming to feature`);
    if (onZipCodeClick) {
      onZipCodeClick(zipCode);
    } else {
      console.warn('[ChatInterface] onZipCodeClick prop not provided - cannot zoom to ZIP code');
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
      
      // Process ZIP codes and markdown formatting in the line
      const processLine = (text: string) => {
        // First, split by ZIP codes
        const zipParts = text.split(/\b(\d{5})\b/);
        
        return zipParts.map((part, partIndex) => {
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
          
          // Process markdown bold formatting (**text**)
          const boldParts = part.split(/(\*\*[^*]+\*\*)/);
          return boldParts.map((boldPart, boldIndex) => {
            if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
              // Remove ** and make bold
              const boldText = boldPart.slice(2, -2);
              return (
                <strong key={`${lineIndex}-${partIndex}-${boldIndex}`}>
                  {boldText}
                </strong>
              );
            }
            return boldPart;
          });
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

    // Get the analysis data
    const { analysisResult: result, metadata } = analysisResult;
    const analysisData = result.data?.records || [];
    
    // Start with analyzing message  
    let messageContent = `📊 Analyzing ${analysisData.length} areas...`;
    
    // Declare at top level so it's accessible in error handler
    const messageId = Date.now().toString();
    const messageTimestamp = new Date();
    
    const initialMessage: ChatMessage = {
      id: messageId,
      role: 'assistant',
      content: messageContent,
      timestamp: messageTimestamp
    };
    setMessages([initialMessage]);
    
    // Calculate and append basic stats immediately (Phase 1)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      
      const basicStats = calculateBasicStats(analysisData);
      messageContent += '\n\n' + formatStatsForChat(basicStats);
      
      setMessages([{
        ...initialMessage,
        content: messageContent
      }]);
      
      // Calculate and append distribution (Phase 2)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const distribution = calculateDistribution(analysisData);
      messageContent += '\n\n' + formatDistributionForChat(distribution);
      
      setMessages([{
        ...initialMessage,
        content: messageContent
      }]);
      
      // Calculate and append patterns (Phase 3)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const patterns = detectPatterns(analysisData);
      messageContent += '\n\n' + formatPatternsForChat(patterns);
      
      setMessages([{
        ...initialMessage,
        content: messageContent
      }]);
      
      // Only proceed with AI if in full mode
      if (analysisMode === 'stats-only') {
        messageContent += '\n\n✅ **Analysis Complete**\n\n*Stats-only mode - use `/full` to enable AI insights, or ask specific questions below.*';
        
        setMessages([{
          id: messageId,
          role: 'assistant',
          content: messageContent,
          timestamp: messageTimestamp
        }]);
        return; // Exit early for stats-only mode
      }

      // Add AI analysis loading indicator for full mode
      messageContent += '\n\n🤖 **AI Analysis**\n*Generating comprehensive insights...*';
      
      setMessages([{
        ...initialMessage,
        content: messageContent
      }]);
      
    } catch (statsError) {
      console.error('[ChatInterface] Error calculating stats:', statsError);
      // Continue with AI analysis even if stats fail (in full mode only)
    }

    // Only generate AI analysis in full mode
    if (analysisMode !== 'full') return;

    try {
      console.log('[ChatInterface] Generating initial AI narrative...');
      
      // Build the request payload with sanitized data
      const sanitizeFeatureData = (records: any[]) => {
        if (!records || records.length === 0) return [];
        
        return records.map(record => {
          if (!record || typeof record !== 'object') return record;
          
          const cleanRecord: any = {};
          for (const [key, value] of Object.entries(record)) {
            if (value !== undefined && 
                value !== null && 
                typeof value !== 'function' &&
                typeof value !== 'symbol') {
              
              if (typeof value === 'object') {
                try {
                  cleanRecord[key] = JSON.parse(JSON.stringify(value));
                } catch (e) {
                  console.warn(`[ChatInterface] Skipping problematic property ${key}:`, e);
                }
              } else {
                cleanRecord[key] = value;
              }
            }
          }
          return cleanRecord;
        });
      };

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
          // Skip clusterAnalysis to reduce complexity
          isContextualChat: false
        },
        featureData: [{
          layerId: 'unified_analysis',
          layerName: 'Analysis Results',
          layerType: 'polygon',
          features: sanitizeFeatureData(result.data?.records?.slice(0, 50) || [])
        }],
        persona: persona
      };

      console.log('[ChatInterface] Request payload prepared:', {
        endpoint: result.endpoint,
        recordCount: result.data?.records?.length,
        spatialFilter: !!(metadata as any)?.spatialFilterIds,
        isClustered: !!result.data?.isClustered
      });

      // Use the chat abort controller for cancellation
      chatAbortControllerRef.current = new AbortController();
      const controller = chatAbortControllerRef.current;
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

      // Use external service with FormData format (same as analysis)
      const claudeResponse = await sendChatMessage(requestPayload, { signal: controller.signal });
      
      clearTimeout(timeoutId);
      
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
          console.log('[ChatInterface] Removed leaked prompt instructions from response');
        }
        
        // Remove the loading indicator and append AI analysis
        const statsEndIndex = messageContent.lastIndexOf('🤖 **AI Analysis**');
        if (statsEndIndex > -1) {
          messageContent = messageContent.substring(0, statsEndIndex);
        }
        
        // Append the AI analysis to the existing message with stats
        messageContent += '\n\n🤖 **AI Analysis**\n' + cleanContent;
        
        const completeMessage: ChatMessage = {
          id: messageId,
          role: 'assistant',
          content: messageContent,
          timestamp: messageTimestamp
        };
        setMessages([completeMessage]);
        console.log('[ChatInterface] AI narrative generated successfully');
      } else {
        throw new Error('No content in API response');
      }
    } catch (error) {
      console.error('[ChatInterface] Failed to generate AI narrative:', error);
      
      // Determine error type and provide appropriate fallback
      let errorMessage = 'Failed to generate AI analysis.';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = chatAbortControllerRef.current === null ? 
            'Analysis was cancelled.' : 
            'AI analysis timed out. Please try asking a specific question instead.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Authentication error. Please check API configuration.';
        } else {
          errorMessage = `AI analysis failed: ${error.message}`;
        }
      }
      
      // Keep the stats and show error for AI portion
      const statsEndIndex = messageContent.lastIndexOf('🤖 **AI Analysis**');
      if (statsEndIndex > -1) {
        messageContent = messageContent.substring(0, statsEndIndex);
      }
      messageContent += `\n\n⚠️ ${errorMessage}\n\nYou can ask specific questions about the data in the chat below.`;
      
      const fallbackMessage: ChatMessage = {
        id: messageId,
        role: 'assistant',
        content: messageContent,
        timestamp: messageTimestamp
      };
      setMessages([fallbackMessage]);
    } finally {
      // Clean up abort controller
      chatAbortControllerRef.current = null;
      setIsProcessing(false);
    }
  }, [analysisResult, persona, setMessages, setHasGeneratedNarrative, analysisMode]);

  // Auto-generate AI narrative when analysisResult is available (only once initially)
  React.useEffect(() => {
    if (!hasGeneratedNarrative && analysisResult) {
      console.log('[ChatInterface] Starting auto-generation of AI narrative');
      generateInitialNarrative();
    }
  }, [hasGeneratedNarrative, analysisResult, generateInitialNarrative]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;

    const trimmedInput = inputValue.trim();
    
    // Check if this is a command
    const commandResult = processCommand(trimmedInput);
    if (commandResult.isCommand) {
      // Add user command message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: trimmedInput,
        timestamp: new Date()
      };
      
      // Add command response
      const commandResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: commandResult.response || 'Command processed.',
        timestamp: new Date()
      };
      
      const newMessages = [...messages, userMessage, commandResponse];
      setMessages(newMessages);
      setInputValue('');
      return; // Don't process as regular message
    }

    // Regular message processing
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsProcessing(true);

    try {
      console.log('[ChatInterface] Sending chat message via service');
      
      const { analysisResult: result, metadata } = analysisResult;
      
      // Smart payload optimization for follow-up questions
      const isFollowUpQuestion = messages.length > 1;
      
      // For follow-ups, keep only recent context to avoid token limits
      const optimizedMessages = isFollowUpQuestion ? 
        [
          ...messages.slice(-3).map(msg => ({ // Keep last 3 messages for context
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user' as const,
            content: userMessage.content
          }
        ] :
        [
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user' as const,
            content: userMessage.content
          }
        ];

      // Build optimized request payload with sanitized data to prevent Fast Refresh
      const sanitizeFeatureData = (records: any[]) => {
        if (!records || records.length === 0) return [];
        
        // Create plain objects to avoid proxy/getter issues
        return records.map(record => {
          if (!record || typeof record !== 'object') return record;
          
          // Create a clean, serializable copy
          const cleanRecord: any = {};
          
          // Only copy safe, serializable properties
          for (const [key, value] of Object.entries(record)) {
            // Skip functions, undefined, and complex objects that might cause issues
            if (value !== undefined && 
                value !== null && 
                typeof value !== 'function' &&
                typeof value !== 'symbol') {
              
              if (typeof value === 'object') {
                // Handle nested objects carefully
                try {
                  cleanRecord[key] = JSON.parse(JSON.stringify(value));
                } catch (e) {
                  // Skip problematic nested objects
                  console.warn(`[ChatInterface] Skipping problematic property ${key}:`, e);
                }
              } else {
                cleanRecord[key] = value;
              }
            }
          }
          
          return cleanRecord;
        });
      };

      const requestPayload = {
        messages: optimizedMessages,
        metadata: {
          query: userMessage.content,
          analysisType: result.endpoint?.replace('/', '').replace(/-/g, '_') || 'strategic_analysis',
          relevantLayers: ['unified_analysis'],
          spatialFilterIds: (metadata as any)?.spatialFilterIds,
          filterType: (metadata as any)?.filterType,
          rankingContext: (metadata as any)?.rankingContext,
          isClustered: result.data?.isClustered,
          // Skip clusterAnalysis entirely to reduce payload complexity
          targetVariable: result.data?.targetVariable,
          endpoint: result.endpoint,
          isContextualChat: true
        },
        featureData: [{
          layerId: 'unified_analysis',
          layerName: 'Analysis Results',
          layerType: 'polygon',
          features: sanitizeFeatureData(
            isFollowUpQuestion ? 
              result.data?.records?.slice(0, 15) || [] : // Fewer features for follow-ups
              result.data?.records?.slice(0, 50) || []   // Full data for initial questions
          )
        }],
        persona: persona
      };

      console.log('[ChatInterface] Request payload prepared');
      
      // Use external service with FormData format (same as analysis)
      const claudeResponse = await sendChatMessage(requestPayload);
      
      if (claudeResponse.content) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: claudeResponse.content,
          timestamp: new Date()
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        console.log('[ChatInterface] Chat response received successfully');
      } else {
        throw new Error('No content in API response');
      }
    } catch (error) {
      console.error('[ChatInterface] Failed to get chat response:', error);
      
      // Provide a helpful error message
      let errorMessage = 'Sorry, I encountered an error processing your question.';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = chatAbortControllerRef.current === null ? 
            'Request was cancelled.' : 
            'Request timed out. Please try a simpler question.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
        }
      }
      
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      };
      const errorMessages = [...updatedMessages, errorResponse];
      setMessages(errorMessages);
    } finally {
      // Clean up abort controller
      chatAbortControllerRef.current = null;
      setIsProcessing(false);
    }
  }, [inputValue, isProcessing, analysisResult, messages, persona, setMessages, processCommand]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)] overflow-hidden">
      {/* Chat messages */}
      <div className="flex-1 min-h-0 max-h-[calc(100vh-420px)] overflow-y-auto p-4 space-y-4">
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
              <div className="inline-flex items-center gap-3 p-3 rounded-lg bg-gray-100">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Generating response...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopChatProcessing}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Stop generation"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 border-t max-h-[200px] overflow-y-auto">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Ask questions about your analysis results... (or try /help for commands, current mode: ${analysisMode === 'full' ? 'Full' : 'Stats-only'})`}
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
        <div className="mt-2 pb-2">
          <PerformanceMetrics 
            analysisResult={analysisResult.analysisResult}
            className="flex flex-wrap gap-2"
          />
        </div>
      </div>

      {/* MessageDialog for expanded message viewing - same as original UI */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto theme-dialog" aria-describedby="analysis-details-description">
          <DialogHeader>
            <DialogTitle>Analysis Details</DialogTitle>
          </DialogHeader>
          <div id="analysis-details-description" className="space-y-4">
            <div>
              <div className="text-sm leading-relaxed">
                {selectedMessage?.content && renderFormattedMessage(selectedMessage.content)}
              </div>
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
};

// Outer component with ErrorBoundary - following QueryInterface pattern
export const ChatInterface: React.FC<ChatInterfaceProps> = (props) => {
  return (
    <ErrorBoundary>
      <ChatInterfaceInner {...props} />
    </ErrorBoundary>
  );
};