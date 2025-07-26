import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Placeholder for User Dashboard</h1>
      <Link href="/map" className="text-blue-500 hover:underline">
        Launch Map Application
      </Link>
    </main>
  )
}