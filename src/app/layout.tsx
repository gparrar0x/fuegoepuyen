import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fuego Epuyén',
  description: 'Sistema de gestión de incendios forestales con crowdsourcing para Argentina',
  keywords: ['incendios', 'argentina', 'emergencias', 'focos de fuego', 'alertas', 'epuyen'],
  openGraph: {
    title: 'Fuego Epuyén',
    description: 'Sistema de gestión de incendios forestales',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
