import React from 'react';
import dynamic from 'next/dynamic';
import { useVisualizationFactory } from '../hooks/useVisualizationFactory';

const LearningMonitor = dynamic(
  () => import('../components/LearningMonitor').then(mod => mod.LearningMonitor),
  { ssr: false }
);

export default function LearningMonitorPage() {
  const { factory } = useVisualizationFactory();

  if (!factory) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  return <LearningMonitor learningSystem={factory.learningSystem} />;
} 