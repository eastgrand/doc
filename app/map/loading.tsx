export default function Loading() {
  return (
    <div className="map-page-loading">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="text-lg text-gray-600">Loading map...</div>
      </div>
    </div>
  )
} 