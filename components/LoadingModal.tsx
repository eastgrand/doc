import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface LoadingModalProps {
  progress: number;
  show: boolean;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ progress: externalProgress, show }) => {
  // Internal progress state to manage continuous loading even when tab is inactive
  const [internalProgress, setInternalProgress] = useState(externalProgress);
  
  // Simplified useEffect to avoid loops - only update when external progress increases
  useEffect(() => {
    if (externalProgress > internalProgress) {
      setInternalProgress(externalProgress);
    }
  }, [externalProgress, internalProgress]);
  
  // Early return with null when not showing - this was the fix
  if (!show) {
    return null;
  }
  
  const getLoadingMessage = () => {
    if (internalProgress < 30) return "Initializing map...";
    if (internalProgress < 60) return "Loading map layers...";
    if (internalProgress < 90) return "Preparing analysis tools...";
    if (internalProgress < 100) return "Finalizing setup...";
    return "Ready!";
  };

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[99999] flex items-center justify-center pointer-events-auto">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16">
                <svg className="animate-spin-slow" viewBox="0 0 100 100">
                  <circle
                    className="stroke-green-500/20"
                    strokeWidth="8"
                    fill="none"
                    cx="50"
                    cy="50"
                    r="40"
                  />
                  <circle
                    className="stroke-green-500 stroke-[8] fill-none origin-center rotate-[-90deg]"
                    strokeLinecap="round"
                    strokeDasharray={`${internalProgress * 2.51327}, 251.327`}
                    cx="50"
                    cy="50"
                    r="40"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/mpiq_pin2.png"
                  alt="Loading..."
                  width={32}
                  height={32}
                  priority
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {getLoadingMessage()}
            </h3>
            <p className="text-sm text-gray-500">
              {internalProgress < 100 ? "Please wait while we set up your workspace" : "Setup complete"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 