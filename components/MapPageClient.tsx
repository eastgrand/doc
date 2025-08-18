'use client'

import React, { Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingModal } from '@/components/LoadingModal'

// Dynamic import to avoid potential SSR issues
const MapApp = React.lazy(() => import('@/components/MapApp'));

export default function MapPageClient() {
  return (
      <ErrorBoundary fallback={<div>Error loading map</div>}>
      <Suspense fallback={<LoadingModal progress={0} show={true} />}>
        <MapApp />
        </Suspense>
      </ErrorBoundary>
  )
} 