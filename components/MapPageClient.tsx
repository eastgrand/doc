'use client'

import React, { Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Dynamic import to avoid potential SSR issues
const MapApp = React.lazy(() => import('@/components/MapApp'));

export default function MapPageClient() {
  return (
      <ErrorBoundary fallback={<div>Error loading map</div>}>
      <Suspense fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading map application...</div>
        </div>
      }>
        <MapApp />
        </Suspense>
      </ErrorBoundary>
  )
} 