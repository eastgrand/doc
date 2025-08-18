'use client'

import React, { Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import EnhancedAppLoader from '@/components/EnhancedAppLoader'

// Dynamic import to avoid potential SSR issues
const MapApp = React.lazy(() => import('@/components/MapApp'));

export default function MapPageClient() {
  return (
      <ErrorBoundary fallback={<div>Error loading map</div>}>
      <Suspense fallback={<EnhancedAppLoader />}>
        <MapApp />
        </Suspense>
      </ErrorBoundary>
  )
} 