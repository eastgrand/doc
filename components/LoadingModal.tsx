import React, { useState, useEffect, useRef } from 'react';
import { useProjectStats, formatProjectFacts } from '@/hooks/useProjectStats';
import { ParticleEffectManager } from './particles/ParticleEffectManager';
import Image from 'next/image';
import { 
  BarChart3, 
  Car, 
  Brain, 
  Target, 
  Layers, 
  Zap,
  TrendingUp
} from 'lucide-react';

interface LoadingModalProps {
  progress: number;
  show: boolean;
}


interface LoadingFact {
  type: 'general' | 'project';
  text: string;
  icon?: React.ReactNode;
}

// General facts about the application capabilities
const GENERAL_FACTS: LoadingFact[] = [
  { type: 'general', text: 'Our AI analyzes over 47,000 data points per query', icon: <BarChart3 className="w-5 h-5" /> },
  { type: 'general', text: 'Drive-time analysis uses real-world traffic patterns', icon: <Car className="w-5 h-5" /> },
  { type: 'general', text: 'Machine learning identifies up to 15 demographic patterns', icon: <Brain className="w-5 h-5" /> },
  { type: 'general', text: 'Spatial clustering reveals hidden market opportunities', icon: <Target className="w-5 h-5" /> },
  { type: 'general', text: 'Each analysis combines 10+ data sources for accuracy', icon: <Layers className="w-5 h-5" /> },
  { type: 'general', text: 'Real-time processing delivers insights in seconds', icon: <Zap className="w-5 h-5" /> },
];


export const LoadingModal: React.FC<LoadingModalProps> = ({ progress: externalProgress, show }) => {
  // Internal progress state to manage continuous loading even when tab is inactive
  const [internalProgress, setInternalProgress] = useState(externalProgress);
  const [currentFact, setCurrentFact] = useState<LoadingFact | null>(null);
  const [allFacts, setAllFacts] = useState<LoadingFact[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const factIntervalRef = useRef<NodeJS.Timeout>();
  
  // Fetch project stats
  const { stats: projectStats } = useProjectStats();
  
  console.log('[LoadingModal] Render:', { show, externalProgress, internalProgress });
  
  // Simplified useEffect to avoid loops - only update when external progress increases
  useEffect(() => {
    if (externalProgress > internalProgress) {
      setInternalProgress(externalProgress);
    }
  }, [externalProgress, internalProgress]); // Add internalProgress to dependencies
  
  
  // Load facts
  useEffect(() => {
    if (!show) return;
    
    const loadFacts = () => {
      const projectFacts: LoadingFact[] = projectStats 
        ? formatProjectFacts(projectStats).map(text => ({
            type: 'project' as const,
            text,
            icon: <TrendingUp className="w-5 h-5" />
          }))
        : [];
      
      const combinedFacts = [...GENERAL_FACTS, ...projectFacts];
      // Shuffle facts for variety
      const shuffled = combinedFacts.sort(() => Math.random() - 0.5);
      setAllFacts(shuffled);
      if (shuffled.length > 0) {
        setCurrentFact(shuffled[0]);
      }
    };
    loadFacts();
  }, [projectStats, show]);
  
  // Rotate facts - start after animation and progress are both active
  useEffect(() => {
    if (!show || allFacts.length === 0) return;

    // Wait 1 second to ensure animation has started and is visually active
    const initialDelay = setTimeout(() => {
      let currentIndex = 0;
      factIntervalRef.current = setInterval(() => {
        currentIndex = (currentIndex + 1) % allFacts.length;
        setCurrentFact(allFacts[currentIndex]);
      }, 3500); // Change fact every 3.5 seconds
    }, 1000); // 1 second delay to ensure animation is fully active

    return () => {
      clearTimeout(initialDelay);
      if (factIntervalRef.current) {
        clearInterval(factIntervalRef.current);
      }
    };
  }, [allFacts, show]);
  
  
  if (!show) {
    console.log('[LoadingModal] Not showing - returning null');
    return null;
  }
  
  console.log('[LoadingModal] Showing modal');
  
  const getLoadingMessage = () => {
    if (internalProgress < 30) return "Initializing map...";
    if (internalProgress < 60) return "Loading map layers...";
    if (internalProgress < 90) return "Preparing analysis tools...";
    if (internalProgress < 100) return "Finalizing setup...";
    return "Ready!";
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[99999] flex items-center justify-center pointer-events-auto">
      {/* Animation Canvas - starts immediately */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.7 }}
      />
      <ParticleEffectManager 
        show={show}
        canvasRef={canvasRef}
      />
      
      {/* Map pin logo positioned in the center of the network */}
      <div 
        className="absolute pointer-events-none"
        style={{
          left: '50%',
          top: '35%', // Match network center position
          transform: 'translate(-50%, -50%)',
          zIndex: 50 // Position above the network animation
        }}
      >
        <Image
          src="/mpiq_pin2.png"
          alt="Loading..."
          width={48}
          height={48}
          priority
          className="opacity-90" // Slightly transparent to blend with network
          style={{
            filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))' // Green glow to match network theme
          }}
        />
      </div>
      
      {/* Text content positioned in lower half to avoid network overlap */}
      <div className="absolute bottom-0 left-0 right-0 pb-16">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="space-y-4 text-center">
            {/* Progress ring only - no logo since it's in the globe */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse">
                  <div className="w-32 h-32 bg-primary/20 rounded-full blur-xl" />
                </div>
                <div className="relative w-32 h-32">
                  <svg className="animate-spin-slow w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="stroke-primary/20"
                      strokeWidth="4"
                      fill="none"
                      cx="50"
                      cy="50"
                      r="45"
                    />
                    <circle
                      className="stroke-primary"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${internalProgress * 2.827}, 282.7`}
                      style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                      cx="50"
                      cy="50"
                      r="45"
                    />
                  </svg>
                  {/* Map pin logo now handled by particle effects */}
                </div>
              </div>
            </div>
          
          {/* Loading message and progress */}
          <div className="space-y-4 text-center">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {getLoadingMessage()}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(internalProgress)}% complete
              </p>
            </div>
            
            {/* Fact display */}
            {currentFact && (
              <div className="animate-entrance">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <span className={`transition-all duration-500 ${
                    currentFact.type === 'project' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {currentFact.icon}
                  </span>
                  <span className={`transition-all duration-500 ${
                    currentFact.type === 'project' ? 'text-primary' : ''
                  }`}>
                    {currentFact.text}
                  </span>
                </div>
              </div>
            )}
            
            {/* Loading dots */}
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};