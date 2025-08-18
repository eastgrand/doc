'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingModal } from '@/components/LoadingModal'

// Test dynamic import with a simple component first
const MapPageClient = dynamic(() => import('@/components/MapPageClient'), {
  ssr: false,
  loading: () => <LoadingModal progress={0} show={true} />,
})

export default function MapPage() {
  return (
      <Suspense fallback={<LoadingModal progress={0} show={true} />}>
        <MapPageClient />
      </Suspense>
  )
}