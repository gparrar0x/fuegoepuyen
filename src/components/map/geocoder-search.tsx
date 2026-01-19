'use client';

import { useRef, useEffect } from 'react';
import { useGeocoder } from '@/hooks/use-geocoder';
import { Input } from '@/components/ui/input';
import { Search, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GeocoderSearch() {
  const { query, results, isOpen, search, selectResult, clear } = useGeocoder();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        clear();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clear]);

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-16 z-10 w-72"
      data-testid="geocoder-search"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar lugar..."
          value={query}
          onChange={(e) => search(e.target.value)}
          className="pl-9 pr-8 bg-white shadow-md border-0"
          data-testid="geocoder-input"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={clear}
            data-testid="geocoder-clear"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border overflow-hidden"
          data-testid="geocoder-results"
        >
          {results.map((result) => (
            <button
              key={result.id}
              className="w-full px-3 py-2 text-left hover:bg-muted flex items-start gap-2 border-b last:border-b-0"
              onClick={() => selectResult(result)}
              data-testid="geocoder-result-item"
            >
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">
                  {result.text}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {result.place_name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
