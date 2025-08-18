import React, { useState, useEffect, useRef } from 'react';
import { ColorTheme, GREEN_THEME } from './utils/ColorThemes';
import { GlobeEffect } from './effects/GlobeEffect';

export type EffectType = 'globe' | 'wave';

export interface EffectConfig {
  type: EffectType;
  colorTheme: ColorTheme;
  initialized: boolean;
}

interface ParticleEffectManagerProps {
  show: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ParticleEffectManager: React.FC<ParticleEffectManagerProps> = React.memo(({
  show,
  canvasRef
}) => {
  const [effectConfig, setEffectConfig] = useState<EffectConfig | null>(null);
  const initializationRef = useRef(false);
  const configLockRef = useRef(false); // Prevent multiple initializations

  // Initialize effect configuration on first show - only once per component lifecycle
  useEffect(() => {
    if (show && !effectConfig && !initializationRef.current && !configLockRef.current) {
      configLockRef.current = true; // Lock to prevent race conditions
      initializationRef.current = true;
      
      const type: EffectType = 'globe'; // Force globe only for now
      const colorTheme = GREEN_THEME; // Force green theme for consistency
      
      console.log('[ParticleEffectManager] LOCKED - Forcing Globe Effect with Green Theme:', { type, colorTheme: colorTheme.name });
      console.log('[ParticleEffectManager] Will render ONLY: Globe Effect with Green colors');
      
      setEffectConfig({
        type,
        colorTheme,
        initialized: true
      });
    }
  }, [show]); // Remove effectConfig from dependencies to prevent loops

  // Reset when component unmounts or show becomes false
  useEffect(() => {
    return () => {
      if (!show) {
        initializationRef.current = false;
        configLockRef.current = false;
        setEffectConfig(null);
      }
    };
  }, [show]);

  // Don't render until we have a configuration
  if (!show || !effectConfig) {
    return null;
  }

  // Render globe effect only
  return (
    <GlobeEffect
      canvasRef={canvasRef}
      colorTheme={effectConfig.colorTheme}
      show={show}
    />
  );
});