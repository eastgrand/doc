import '../styles/globals.css'
// Note: ArcGIS CSS moved to MapApp component to avoid webpack issues
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ChatProvider } from '@/contexts/ChatContext'
import ThemeProvider from '@/components/theme/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MPIQ',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}