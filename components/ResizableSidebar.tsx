/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import Image from 'next/image';

// Dynamic imports

export interface LayerState {
  layer: __esri.FeatureLayer | null;
  visible: boolean;
  loading: boolean;
  group: string;
  error?: string;
  filters: any[];
  queryResults?: {
    features: any[];
    fields: any[];
  };
  active: boolean;
  isVirtual?: boolean;
  sourceLayerId?: string;
  rendererField?: string;
  name: string;
}

interface ResizableSidebarProps {
  view: __esri.MapView | null;
  layerStates: { [key: string]: LayerState };
  chatInterface?: React.ReactNode;
  onWidthChange: (width: number) => void;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  onLayerStatesChange: (layerStates: { [key: string]: LayerState }) => void;
}

const ResizableSidebar = memo(({ 
  layerStates,
  chatInterface,
  defaultWidth}: ResizableSidebarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = useState('chat');

  // Track layer loading state
  useEffect(() => {
    if (!layerStates) return;

    const allLayers = Object.values(layerStates);
    const hasUnloadedLayers = allLayers.some(state => 
      state.layer && !state.layer.loaded
    );

    if (!hasUnloadedLayers && allLayers.length > 0) {
      // All layers are loaded
      setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Match the delay in MapWidgets
    } else {
      setIsLoading(true);
    }
  }, [layerStates]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handler for openInfographics events: store detail and switch to infographics tab
  const handleOpenInfographics = useCallback(() => {
    console.log('[ResizableSidebar] ✅ handleOpenInfographics received event. ONLY switching tab.');

    // Switch tab if not already on infographics
    setActiveTab('infographics'); // Always set to infographics when event received
  }, []); // No dependencies needed since we always want to switch to infographics

  // Listen for openInfographics event to switch to infographics tab
  useEffect(() => {
    document.addEventListener('openInfographics', handleOpenInfographics as EventListener);

    return () => {
      document.removeEventListener('openInfographics', handleOpenInfographics as EventListener);
    };
  }, [handleOpenInfographics]); // Only depend on the stable callback

  if (!mounted) return null;

  return (
    <>
      <div 
        ref={containerRef}
        className="fixed right-0 top-0 bottom-0 bg-white shadow-lg"
        style={{ width: `${defaultWidth}px`, zIndex: 10 }}
      >
        <div className="h-full flex flex-col border-l border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <div className="flex items-center gap-2 pl-4 p-4">
              <Image 
                src="/mpiq_pin2.png" 
                alt="IQ Logo" 
                width={20} 
                height={20}
                priority
              />
              <div className="flex text-xl font-bold">
                <span className="text-[#33a852]">IQ</span>
                <span className="text-black -ml-px">center</span>
              </div>
            </div>
          </div>

          {/* Direct chat content without Tabs */}
          <div className="flex-1 overflow-hidden h-[calc(100vh-80px)]">
            {chatInterface ? (
                <div className="h-full">{chatInterface}</div>
              ) : (
                <ChatLoadingState />
            )}
          </div>
        </div>
      </div>
    </>
  );
});

// Update LoadingProgress to be simpler

// Update ChatLoadingState to use the same simple loading state
const ChatLoadingState: React.FC = () => {
  return (
    <div className="p-4">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-green-500" />
          <span className="text-xs text-gray-600">Initializing AI...</span>
          <Loader2 className="h-3 w-3 animate-spin text-green-500" />
        </div>
      </div>
    </div>
  );
};

ResizableSidebar.displayName = 'ResizableSidebar';

export default ResizableSidebar;