/**
 * Clustering Tab Component
 * 
 * Migrates the existing ClusterConfigPanel into the new tabbed filtering system.
 * Maintains 100% compatibility with existing clustering functionality.
 */

import React, { useCallback } from 'react';
import { ClusterConfigPanel } from '@/components/clustering/ClusterConfigPanel';
import { FilterTabProps } from '../types';
import { ClusterConfig } from '@/lib/clustering/types';

export default function ClusteringTab({
  config,
  onConfigChange,
  availableFields,
  endpoint,
}: FilterTabProps) {
  
  // Handle clustering configuration changes
  const handleClusterConfigChange = useCallback((clusterConfig: ClusterConfig) => {
    onConfigChange({
      ...config,
      clustering: clusterConfig,
    });
  }, [config, onConfigChange]);

  // Handle save action from ClusterConfigPanel
  const handleSave = useCallback(() => {
    // In the original implementation, save just closed the dialog
    // In our new system, this is handled by the parent dialog
    // So we don't need to do anything here
  }, []);

  return (
    <div className="h-full">
      <ClusterConfigPanel
        config={config.clustering}
        onConfigChange={handleClusterConfigChange}
        onSave={handleSave}
        // Pass through any additional props that ClusterConfigPanel might need
        datasetInfo={{
          totalZipCodes: 1000, // TODO: Get actual count from analysis context
          totalPopulation: 50000, // TODO: Get actual total from analysis context
          geographicSpread: {
            minDistance: 0,
            maxDistance: 100
          }
        }}
      />
    </div>
  );
}