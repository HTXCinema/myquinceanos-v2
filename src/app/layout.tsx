import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyQuinceAños — Houston Quinceañera Planning',
  description: 'Find trusted Houston quinceañera vendors, read verified reviews from real moms, and plan your daughter\'s perfect quinceañera — all in one place.',
  keywords: 'quinceañera Houston, quince vendors Houston, quinceañera planning, XV años Houston',
  openGraph: {
    title: 'MyQuinceAños — Houston Quinceañera Planning',
    description: 'Trusted vendors, verified reviews, free planning tools.',
    url: 'https://beta.myquinceanos.com',
    siteName: 'MyQuinceAños',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
