/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect, useMemo } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, Maximize2, Bot } from 'lucide-react';
//import { AgentManager } from '../lib/agents';
import StatsVisualization from './StatsVisualization';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal } from './ui/dialog';
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Graphic from "@arcgis/core/Graphic";

interface Message {
  text: string;
  isUser: boolean;
  data?: __esri.Graphic[];
  statistics?: Record<string, number>;
  error?: boolean;
  timestamp?: Date;
}

interface ChatInterfaceProps {
  view: __esri.MapView | null;
  showQueryBuilder?: boolean;
  queryBuilderOnly?: boolean;
}

const AlertCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 rounded-lg border ${className}`}>
    {children}
  </div>
);

export default function ChatInterface({ 
  view, 
  showQueryBuilder = false, 
  queryBuilderOnly = false 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{
    type: 'text' | 'chart';
    content: React.ReactNode;
    title: string;
  } | null>(null);
  
  //const agentManagerRef = useRef<AgentManager | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);

  const zoomToFeatures = (features: __esri.Graphic[]) => {
    if (!view || features.length === 0) return;

    try {
      const geometries = features
        .map(feature => feature.geometry)
        .filter((geometry): geometry is __esri.GeometryUnion => 
          geometry !== null && 
          geometry !== undefined &&
          (geometry.type === 'extent' || 
           geometry.type === 'multipoint' || 
           geometry.type === 'point' || 
           geometry.type === 'polygon' || 
           geometry.type === 'polyline')
        );
      
      if (geometries.length === 0) {
        console.warn("No valid geometries found in features");
        return;
      }

      const union = geometryEngine.union(geometries);
      
      if (union && union.extent) {
        const extent = union.extent;
        const paddedExtent = extent.expand(1.2);
        
        view.goTo(paddedExtent, {
          duration: 1000,
          easing: "ease-in-out"
        }).catch((error) => {
          console.error("Error zooming to features:", error);
        });
      }
    } catch (error) {
      console.error("Error processing geometries:", error);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 5 * 24);
      textarea.style.height = `${newHeight}px`;
    };

    adjustHeight();
  }, [inputMessage]);

  const handleContentClick = (type: 'text' | 'chart', content: React.ReactNode, title: string) => {
    setSelectedContent({ type, content, title });
  };

  const isValidStatsData = (message: Message): boolean => {
    return !!(
      message.data && 
      message.data.length > 0 && 
      message.statistics && 
      Object.keys(message.statistics).length > 0
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = inputMessage;
    setMessages(prev => [...prev, { 
      text: userMessage, 
      isUser: true,
      timestamp: new Date()
    }]);
    setInputMessage('');
    setIsProcessing(true);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestions = [
    "What areas have the highest pet ownership?",
    "Compare pet ownership between neighborhoods",
    "Which neighborhoods have over 50% pet ownership?",
    "What's the average pet ownership in Detroit?"
  ];

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center">
              {/*<Bot className="h-12 w-12 mx-auto mb-4" style={{ color: '#33a852' }} />*/}
              <AlertCard className="bg-[#e8f5e9] border-[#c8e6c9] text-[#2e7d32]">
                Start a conversation to get insights about your data
              </AlertCard>
              <div className="mt-4 space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="block w-full p-2 text-sm text-left hover:bg-gray-50 rounded-md text-gray-600 transition-colors"
                    onClick={() => {
                      setInputMessage(suggestion);
                      setTimeout(handleSendMessage, 100);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                ref={index === messages.length - 1 ? latestMessageRef : undefined}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[80%]">
                  <div 
                    className={`relative px-4 py-2 group cursor-pointer hover:shadow-md transition-shadow ${
                      message.isUser 
                        ? 'bg-[#33a852] text-white rounded-2xl rounded-br-sm' 
                        : message.error 
                          ? 'bg-red-100 text-red-800 rounded-2xl rounded-bl-sm'
                          : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm'
                    }`}
                    onClick={() => handleContentClick('text', message.text, 'Message Content')}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                    <button 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContentClick('text', message.text, 'Message Content');
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                    {message.timestamp && (
                      <div className="text-xs opacity-50 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    )}
                  </div>

                  {!message.isUser && isValidStatsData(message) && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        onClick={() => handleContentClick(
                          'chart',
                          <StatsVisualization 
                            data={message.data as __esri.Graphic[]}
                            statistics={message.statistics as Record<string, number>}
                            enlarged={true}
                          />,
                          'Statistics Visualization'
                        )}
                      >
                        <span>View Statistics</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                     style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                     style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="shrink-0 border-t p-4 bg-white">
        <div className="flex space-x-2 items-end bg-white rounded-lg border shadow-sm">
          <Textarea 
            ref={textareaRef}
            placeholder="Ask about your data..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow min-h-[3rem] max-h-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none py-2"
            disabled={isProcessing}
            aria-label="Message input"
            rows={1}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            className="mb-2"
            variant="default"
            style={{ backgroundColor: 'white', color: '#232323' }}
            disabled={isProcessing}
            aria-label="Ask question"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedContent} onOpenChange={(open) => !open && setSelectedContent(null)}>
        <DialogPortal>
          <DialogContent 
            className="max-w-[90vw] h-fit bg-white fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[60]"
            aria-describedby="dialog-description"
          >
            <DialogHeader>
              <DialogTitle>{selectedContent?.title || ''}</DialogTitle>
            </DialogHeader>
            <div 
              id="dialog-description"
              className="p-4"
            >
              {selectedContent?.type === 'chart' ? (
                <div className="w-[800px] h-[550px] overflow-hidden">
                  {selectedContent.content}
                </div>
              ) : (
                <div className="max-w-2xl whitespace-pre-wrap">
                  {selectedContent?.content}
                </div>
              )}
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}