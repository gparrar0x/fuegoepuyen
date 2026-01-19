'use client';

import { useMeasure } from '@/hooks/use-measure';
import { formatDistance } from '@/lib/measure-utils';
import { Button } from '@/components/ui/button';
import { Ruler, X, Undo2 } from 'lucide-react';

export function MeasureTool() {
  const {
    isActive,
    points,
    totalDistance,
    toggle,
    removeLastPoint,
    clear,
  } = useMeasure();

  return (
    <div
      className="absolute bottom-20 right-4 z-10 flex flex-col items-end gap-2"
      data-testid="measure-tool"
    >
      {isActive && points.length > 0 && (
        <div
          className="bg-white rounded-lg shadow-md px-3 py-2 flex items-center gap-2"
          data-testid="measure-display"
        >
          <Ruler className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium text-sm">
            {formatDistance(totalDistance)}
          </span>
          {points.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={removeLastPoint}
              title="Deshacer ultimo punto"
              data-testid="measure-undo"
            >
              <Undo2 className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={clear}
            title="Borrar medicion"
            data-testid="measure-clear"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Button
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        className="bg-white shadow-md"
        onClick={toggle}
        data-testid="measure-toggle"
      >
        <Ruler className="h-4 w-4 mr-1" />
        {isActive ? 'Midiendo...' : 'Medir'}
      </Button>
    </div>
  );
}
