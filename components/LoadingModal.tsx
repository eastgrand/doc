import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useProjectStats, formatProjectFacts } from '@/hooks/useProjectStats';

interface LoadingModalProps {
  progress: number;
  show: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  pulse: boolean;
}

interface LoadingFact {
  type: 'general' | 'project';
  text: string;
  icon?: string;
}

// General facts about the application capabilities
const GENERAL_FACTS: LoadingFact[] = [
  { type: 'general', text: 'Our AI analyzes over 47,000 data points per query', icon: '📊' },
  { type: 'general', text: 'Drive-time analysis uses real-world traffic patterns', icon: '🚗' },
  { type: 'general', text: 'Machine learning identifies up to 15 demographic patterns', icon: '🤖' },
  { type: 'general', text: 'Spatial clustering reveals hidden market opportunities', icon: '🎯' },
  { type: 'general', text: 'Each analysis combines 10+ data sources for accuracy', icon: '🔄' },
  { type: 'general', text: 'Real-time processing delivers insights in seconds', icon: '⚡' },
];

// Firefly theme colors
const FIREFLY_COLORS = [
  '#00ff40', // Primary green
  '#00ff80', // Bright green
  '#00ffbf', // Spring green
  '#00bfff', // Deep sky blue
  '#0080ff', // Dodger blue
  '#40ff00', // Chartreuse
];

export const LoadingModal: React.FC<LoadingModalProps> = ({ progress: externalProgress, show }) => {
  // Internal progress state to manage continuous loading even when tab is inactive
  const [internalProgress, setInternalProgress] = useState(externalProgress);
  const [currentFact, setCurrentFact] = useState<LoadingFact | null>(null);
  const [allFacts, setAllFacts] = useState<LoadingFact[]>([]);
  const [factIndex, setFactIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const factIntervalRef = useRef<NodeJS.Timeout>();
  const particlesRef = useRef<Particle[]>([]);
  
  // Fetch project stats
  const { stats: projectStats } = useProjectStats();
  
  console.log('[LoadingModal] Render:', { show, externalProgress, internalProgress });
  
  // Simplified useEffect to avoid loops - only update when external progress increases
  useEffect(() => {
    if (externalProgress > internalProgress) {
      setInternalProgress(externalProgress);
    }
  }, [externalProgress, internalProgress]); // Add internalProgress to dependencies
  
  // Initialize particles
  useEffect(() => {
    if (!show) return;
    
    const particleCount = 50;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: FIREFLY_COLORS[Math.floor(Math.random() * FIREFLY_COLORS.length)],
        opacity: Math.random() * 0.5 + 0.3,
        pulse: Math.random() > 0.7,
      });
    }
    particlesRef.current = newParticles;
  }, [show]);
  
  // Load facts
  useEffect(() => {
    if (!show) return;
    
    const loadFacts = () => {
      const projectFacts: LoadingFact[] = projectStats 
        ? formatProjectFacts(projectStats).map(text => ({
            type: 'project' as const,
            text,
            icon: '📊'
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
  
  // Rotate facts
  useEffect(() => {
    if (!show || allFacts.length === 0) return;

    factIntervalRef.current = setInterval(() => {
      setFactIndex(prev => {
        const next = (prev + 1) % allFacts.length;
        setCurrentFact(allFacts[next]);
        return next;
      });
    }, 3500); // Change fact every 3.5 seconds

    return () => {
      if (factIntervalRef.current) {
        clearInterval(factIntervalRef.current);
      }
    };
  }, [allFacts, show]);
  
  // Animate particles
  useEffect(() => {
    if (!show) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize particles if not already done
    if (particlesRef.current.length === 0) {
      const particleCount = 50;
      const newParticles: Particle[] = [];

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          color: FIREFLY_COLORS[Math.floor(Math.random() * FIREFLY_COLORS.length)],
          opacity: Math.random() * 0.5 + 0.3,
          pulse: Math.random() > 0.7,
        });
      }
      particlesRef.current = newParticles;
    }

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop - directly mutate particles in ref
    let frameCount = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      
      // Debug log every 60 frames (about once per second at 60fps)
      if (frameCount++ % 60 === 0) {
        console.log('[LoadingModal] Animation frame', frameCount, 'particles:', particles.length, 'sample position:', particles[0]?.x, particles[0]?.y);
      }
      
      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Pulse effect for some particles
        let opacity = particle.opacity;
        if (particle.pulse) {
          opacity = particle.opacity + Math.sin(Date.now() * 0.001) * 0.2;
        }

        // Draw particle with glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
        ctx.globalAlpha = opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connecting lines to nearby particles
        particles.forEach(other => {
          if (particle.id === other.id) return;
          const distance = Math.sqrt(
            Math.pow(particle.x - other.x, 2) + 
            Math.pow(particle.y - other.y, 2)
          );
          if (distance < 100) {
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (1 - distance / 100) * 0.1;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [show]); // Only depend on show, not particles
  
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
      {/* Particle canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.4 }}
      />
      
      <div className="relative z-10 max-w-md w-full mx-auto p-6">
        <div className="space-y-6">
          {/* Logo with progress ring */}
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/mpiq_pin2.png"
                    alt="Loading..."
                    width={64}
                    height={64}
                    priority
                    className="animate-entrance"
                  />
                </div>
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
                  <span className="text-lg">{currentFact.icon}</span>
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
  );
};