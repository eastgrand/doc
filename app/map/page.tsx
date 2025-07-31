'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Immediate loading component to prevent FOUC
const LoadingScreen = () => (
  <div className="map-page-loading">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <div className="text-lg text-gray-600">Loading map application...</div>
    </div>
  </div>
)

// Dynamic import with immediate loading fallback
const MapPageClient = dynamic(() => import('@/components/MapPageClient'), {
  ssr: false,
  loading: LoadingScreen,
})

export default function MapPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <MapPageClient />
    </Suspense>
  )
}