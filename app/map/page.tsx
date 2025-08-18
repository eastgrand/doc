'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import EnhancedAppLoader from '@/components/EnhancedAppLoader'

// Test dynamic import with a simple component first
const MapPageClient = dynamic(() => import('@/components/MapPageClient'), {
  ssr: false,
  loading: () => <EnhancedAppLoader />,
})

export default function MapPage() {
  return (
      <Suspense fallback={<EnhancedAppLoader />}>
        <MapPageClient />
      </Suspense>
  )
}