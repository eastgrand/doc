'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Test dynamic import with a simple component first
const MapPageClient = dynamic(() => import('@/components/MapPageClient'), {
  ssr: false,
  loading: () => <div className="h-screen w-full flex items-center justify-center">Loading Map...</div>,
})

export default function MapPage() {
  return (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
        <MapPageClient />
      </Suspense>
  )
}