'use client'

import type { User as SupabaseUser } from '@supabase/supabase-js'
import { ChevronLeft, ChevronRight, Flame, LayoutDashboard, Map, MapPin, Truck } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Mapa', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Focos', href: '/dashboard/focos', icon: MapPin },
  { name: 'Recursos', href: '/dashboard/recursos', icon: Truck },
]

type SidebarState = 'hidden' | 'collapsed' | 'expanded'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const _router = useRouter()
  const [_user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarState, setSidebarState] = useState<SidebarState>('hidden')

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const supabaseClient = supabase
      if (!supabaseClient) {
        setLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabaseClient.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const supabaseClient = supabase
    if (!supabaseClient) return

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-900">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside
        className={cn(
          'relative hidden md:flex flex-col bg-slate-800 border-r border-slate-700 transition-all duration-300',
          sidebarState === 'hidden' && 'w-16',
          sidebarState === 'collapsed' && 'w-16',
          sidebarState === 'expanded' && 'w-56',
        )}
      >
        {/* Logo / Fire button */}
        <div className="flex items-center justify-center h-14 border-b border-slate-700">
          <button
            onClick={() => setSidebarState(sidebarState === 'hidden' ? 'collapsed' : 'hidden')}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title={sidebarState === 'hidden' ? 'Abrir menú' : 'Cerrar menú'}
          >
            <Flame className="h-6 w-6 text-amber-500 flex-shrink-0" />
            {sidebarState === 'expanded' && (
              <span className="font-bold text-white truncate">Fuego Epuyén</span>
            )}
          </button>
        </div>

        {/* Navigation - only visible when not hidden */}
        {sidebarState !== 'hidden' && (
          <>
            <nav className="flex-1 p-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                      sidebarState === 'collapsed' && 'justify-center px-2',
                    )}
                    title={sidebarState === 'collapsed' ? item.name : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarState === 'expanded' && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom actions */}
            <div className="p-2 border-t border-slate-700 space-y-1">
              <Link
                href="/"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors',
                  sidebarState === 'collapsed' && 'justify-center px-2',
                )}
                title={sidebarState === 'collapsed' ? 'Mapa público' : undefined}
              >
                <Map className="h-5 w-5 flex-shrink-0" />
                {sidebarState === 'expanded' && <span>Mapa público</span>}
              </Link>
            </div>

            {/* Expand/Collapse toggle - positioned better */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white shadow-md"
              onClick={() =>
                setSidebarState(sidebarState === 'collapsed' ? 'expanded' : 'collapsed')
              }
              title={sidebarState === 'collapsed' ? 'Expandir' : 'Colapsar'}
            >
              {sidebarState === 'collapsed' ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </Button>
          </>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden pb-16 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation - hidden on desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[64px] transition-colors',
                  isActive ? 'text-sky-400' : 'text-slate-400 active:text-slate-200',
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-sky-400')} />
                <span className={cn('text-xs font-medium', isActive && 'text-sky-400')}>
                  {item.name}
                </span>
              </Link>
            )
          })}
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[64px] text-slate-400 active:text-slate-200 transition-colors"
          >
            <Map className="h-5 w-5" />
            <span className="text-xs font-medium">Público</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
