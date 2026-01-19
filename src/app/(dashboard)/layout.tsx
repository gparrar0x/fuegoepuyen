'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Flame,
  LayoutDashboard,
  MapPin,
  Truck,
  ChevronLeft,
  ChevronRight,
  Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const navigation = [
  { name: 'Mapa', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Focos', href: '/dashboard/focos', icon: MapPin },
  { name: 'Recursos', href: '/dashboard/recursos', icon: Truck },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true); // Start collapsed, will expand on desktop

  const supabase = createClient();

  // Auto-collapse on mobile, expand on desktop
  useEffect(() => {
    const checkMobile = () => {
      setCollapsed(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const supabaseClient = supabase;
      if (!supabaseClient) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const supabaseClient = supabase;
    if (!supabaseClient) return;

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400" />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-900">
      {/* Sidebar */}
      <aside
        className={cn(
          'relative flex flex-col bg-slate-800 border-r border-slate-700 transition-all duration-300',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-2 h-14 border-b border-slate-700 px-3',
          collapsed && 'justify-center'
        )}>
          <Flame className="h-6 w-6 text-amber-500 flex-shrink-0" />
          {!collapsed && <span className="font-bold text-white truncate">Fuego Epuyén</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-slate-700 space-y-1">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? 'Mapa público' : undefined}
          >
            <Map className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Mapa público</span>}
          </Link>
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-16 h-6 w-6 rounded-full bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>

      {/* Main content - full height, no padding */}
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
