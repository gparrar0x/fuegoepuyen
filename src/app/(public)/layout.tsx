import { Flame, Menu } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Flame className="h-6 w-6 text-amber-600" />
            <span className="hidden sm:inline">Fuego Epuyén</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-sky-700 transition-colors">
              Mapa
            </Link>
            <Link
              href="/reportar"
              className="text-sm font-medium hover:text-sky-700 transition-colors"
            >
              Reportar
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </nav>

          {/* Mobile nav */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium hover:text-sky-700">
                  Mapa
                </Link>
                <Link href="/reportar" className="text-lg font-medium hover:text-sky-700">
                  Reportar foco
                </Link>
                <Link href="/dashboard" className="text-lg font-medium hover:text-sky-700">
                  Dashboard
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 bg-gray-50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Fuego Epuyén — Sistema de gestión de incendios forestales</p>
          <p className="mt-1">
            Datos de focos:{' '}
            <a
              href="https://firms.modaps.eosdis.nasa.gov/"
              target="_blank"
              rel="noopener"
              className="underline"
            >
              NASA FIRMS
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
