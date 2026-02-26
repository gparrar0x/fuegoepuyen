'use client'

import { Activity, AlertTriangle, CheckCircle, Flame } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'
import { MapControls } from '@/components/map/map-controls'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFireReports } from '@/hooks/use-fire-reports'

// Dynamic import for map (no SSR)
const FireMap = dynamic(() => import('@/components/map/fire-map').then((mod) => mod.FireMap), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[500px] bg-gray-100 animate-pulse flex items-center justify-center">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  )
}

export default function HomePage() {
  const { data: fireReports = [], isLoading } = useFireReports()
  const [showStats] = useState(true)

  // Calculate stats
  const activeCount = fireReports.filter((r) => r.status === 'active').length
  const pendingCount = fireReports.filter((r) => r.status === 'pending').length
  const containedCount = fireReports.filter((r) => r.status === 'contained').length
  const totalToday = fireReports.filter((r) => {
    const today = new Date()
    const reportDate = new Date(r.created_at)
    return reportDate.toDateString() === today.toDateString()
  }).length

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Stats bar */}
      {showStats && (
        <div className="bg-gradient-to-r from-sky-800 to-emerald-800 text-white px-4 py-3">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                <span className="font-semibold">{activeCount}</span>
                <span className="text-white/80 text-sm">activos</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">{pendingCount}</span>
                <span className="text-white/80 text-sm">pendientes</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <span className="font-semibold">{containedCount}</span>
                <span className="text-white/80 text-sm">contenidos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">{totalToday}</span>
                <span className="text-white/80 text-sm">reportes hoy</span>
              </div>
            </div>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="bg-white text-amber-700 hover:bg-amber-50"
            >
              <Link href="/reportar">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reportar foco
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <FireMap className="h-full" />
        <MapControls />

        {/* Info card (bottom left) */}
        <Card className="absolute bottom-4 left-4 z-10 w-72 shadow-lg hidden lg:block">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-600" />
              Fuego Epuyén
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>Sistema de monitoreo y reporte de incendios forestales en tiempo real.</p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                NASA FIRMS
              </Badge>
              <Badge variant="outline" className="text-xs">
                Crowdsourcing
              </Badge>
              <Badge variant="outline" className="text-xs">
                Tiempo real
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-4 right-16 z-10">
            <Badge variant="secondary" className="animate-pulse">
              Cargando datos...
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
