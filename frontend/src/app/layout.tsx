import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orbital Tracking',
  description: 'Real-time vehicle telemetry tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
