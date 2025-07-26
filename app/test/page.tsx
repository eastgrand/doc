import dynamic from 'next/dynamic';

const TestRunnerClient = dynamic(() => import('@/components/TestRunner'), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Geospatial Query Test Suite</h1>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    </div>
  )
});

export default function TestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Geospatial Query Test Suite</h1>
      <TestRunnerClient />
    </div>
  );
} 