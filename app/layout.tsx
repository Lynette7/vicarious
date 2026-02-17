import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import { GoogleAnalytics } from '@next/third-parties/google'
export const metadata: Metadata = {
  title: 'Around the World in Books',
  description: 'Track your reading journey around the world in 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}

