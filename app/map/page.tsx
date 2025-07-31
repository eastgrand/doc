'use client'

import dynamic from 'next/dynamic'

// No loading fallback - let MapApp handle all loading states with LoadingModal
const MapPageClient = dynamic(() => import('@/components/MapPageClient'), {
  ssr: false,
})

export default function MapPage() {
  return <MapPageClient />
}