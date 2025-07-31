'use client'

import React, { Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Consistent loading component
const MapLoadingFallback = () => (
  <div className="map-page-loading">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <div className="text-lg text-gray-600">Initializing map components...</div>
    </div>
  </div>
)

// Enhanced error fallback
const MapErrorFallback = ({ error }: { error?: Error }) => (
  <div className="h-screen w-full flex items-center justify-center bg-red-50">
    <div className="text-center space-y-4 p-8">
      <div className="text-red-600 text-xl font-semibold">Error loading map</div>
      <div className="text-gray-600">Please refresh the page to try again</div>
      {error && (
        <details className="text-sm text-gray-500 mt-4">
          <summary className="cursor-pointer">Error details</summary>
          <pre className="mt-2 text-left bg-gray-100 p-2 rounded text-xs overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  </div>
)

// Dynamic import to avoid potential SSR issues
const MapApp = React.lazy(() => import('@/components/MapApp'));

export default function MapPageClient() {
  return (
    <ErrorBoundary fallback={<MapErrorFallback />}>
      <Suspense fallback={<MapLoadingFallback />}>
        <MapApp />
      </Suspense>
    </ErrorBoundary>
  )
} 