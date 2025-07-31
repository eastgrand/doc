'use client'

import dynamic from 'next/dynamic'

// Dynamic import without loading fallback - let the component handle its own loading
const MapPageClient = dynamic(() => import('@/components/MapPageClient'), {
  ssr: false,
})

export default function MapPage() {
  return <MapPageClient />
}