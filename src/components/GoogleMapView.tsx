import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { Destination, DayPlan, DestinationCategory } from '../types/trip';
import { formatCurrency, formatDuration } from '../utils/geo';
import { Layers, MapPin, Navigation } from 'lucide-react';

import { getCoordinatesForCityName } from '../data/cityData';

interface GoogleMapViewProps {
  currentDay: DayPlan;
  selectedDestinationId: string | null;
  onSelectDestination: (id: string | null) => void;
  currency: string;
  destinationCity?: string;
  isPickingLocation: boolean;
  onPickLocation?: (lat: number, lng: number) => void;
  onEditDestination?: (dest: Destination) => void;
  apiKey: string;
}

const CATEGORY_COLORS: Record<DestinationCategory, string> = {
  sightseeing: '#ea580c', // Orange primary
  culinary: '#c2410c',   // Deep rust orange
  hotel: '#d97706',      // Warm Amber
  shopping: '#e11d48',   // Rose
  nature: '#15803d',     // Forest Green
  transit: '#57534e',    // Warm Stone
};

// Polyline component rendering the geodesic route between destinations
function RoutePolyline({
  destinations,
}: {
  destinations: Destination[];
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || destinations.length < 2 || !window.google?.maps) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const path = destinations.map((d) => ({ lat: d.lat, lng: d.lng }));

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#ea580c', // Theme Orange
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map,
    });

    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
      polylineRef.current = null;
    };
  }, [map, destinations]);

  return null;
}

// Controller component for auto-fit bounds and camera adjustments
function MapCameraController({
  destinations,
  selectedDestinationId,
}: {
  destinations: Destination[];
  selectedDestinationId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || destinations.length === 0 || !window.google?.maps) return;

    if (selectedDestinationId) {
      const selected = destinations.find((d) => d.id === selectedDestinationId);
      if (selected) {
        map.panTo({ lat: selected.lat, lng: selected.lng });
        return;
      }
    }

    const bounds = new google.maps.LatLngBounds();
    destinations.forEach((d) => bounds.extend({ lat: d.lat, lng: d.lng }));
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  }, [map, destinations, selectedDestinationId]);

  return null;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  currentDay,
  selectedDestinationId,
  onSelectDestination,
  currency,
  destinationCity,
  isPickingLocation,
  onPickLocation,
  onEditDestination,
  apiKey,
}) => {
  const [mapTypeId, setMapTypeId] = useState<string>('roadmap');
  const [infoWindowDest, setInfoWindowDest] = useState<Destination | null>(null);

  const defaultCenter =
    currentDay.destinations.length > 0
      ? { lat: currentDay.destinations[0].lat, lng: currentDay.destinations[0].lng }
      : getCoordinatesForCityName(destinationCity || 'Yogyakarta');

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (isPickingLocation && onPickLocation && e.detail.latLng) {
        const lat = Number(e.detail.latLng.lat.toFixed(5));
        const lng = Number(e.detail.latLng.lng.toFixed(5));
        onPickLocation(lat, lng);
      }
    },
    [isPickingLocation, onPickLocation]
  );

  const handleMarkerClick = (dest: Destination) => {
    onSelectDestination(dest.id);
    setInfoWindowDest(dest);
  };

  return (
    <APIProvider
      apiKey={apiKey}
      language="id"
      region="ID"
    >
      <div className="relative w-full h-full min-h-[350px] lg:min-h-[500px] overflow-hidden rounded-xl border border-orange-200/90 bg-orange-50/20 shadow-xs">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={12}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapTypeId}
          onClick={handleMapClick}
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          zoomControl={true}
          gestureHandling="greedy"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Polylines between destinations */}
          <RoutePolyline destinations={currentDay.destinations} />

          {/* Camera Auto Controller */}
          <MapCameraController
            destinations={currentDay.destinations}
            selectedDestinationId={selectedDestinationId}
          />

          {/* Numbered Advanced Markers */}
          {currentDay.destinations.map((dest, index) => {
            const isSelected = dest.id === selectedDestinationId;
            const color = CATEGORY_COLORS[dest.category] || '#ea580c';

            return (
              <AdvancedMarker
                key={dest.id}
                position={{ lat: dest.lat, lng: dest.lng }}
                onClick={() => handleMarkerClick(dest)}
                title={dest.title}
                zIndex={isSelected ? 999 : index + 10}
              >
                <div
                  style={{
                    backgroundColor: color,
                    width: isSelected ? '36px' : '30px',
                    height: isSelected ? '36px' : '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: isSelected ? '14px' : '12px',
                    border: '2.5px solid #ffffff',
                    boxShadow: isSelected
                      ? '0 6px 16px rgba(234, 88, 12, 0.45)'
                      : '0 4px 10px rgba(0, 0, 0, 0.25)',
                    transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                >
                  {index + 1}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Info Window for Selected Marker */}
          {infoWindowDest && (
            <InfoWindow
              position={{ lat: infoWindowDest.lat, lng: infoWindowDest.lng }}
              onCloseClick={() => setInfoWindowDest(null)}
            >
              <div className="p-1 space-y-1.5 text-stone-800 text-xs min-w-[200px] max-w-[260px] font-sans">
                <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <span
                    style={{
                      backgroundColor: CATEGORY_COLORS[infoWindowDest.category] || '#ea580c',
                      color: '#fff',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      textAlign: 'center',
                      lineHeight: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {currentDay.destinations.findIndex((d) => d.id === infoWindowDest.id) + 1}
                  </span>
                  <span className="truncate">{infoWindowDest.title}</span>
                </div>
                <div className="text-[11px] text-stone-500 font-mono">
                  {infoWindowDest.startTime} · {formatDuration(infoWindowDest.durationMinutes)} ·{' '}
                  <span className="font-semibold text-orange-700">
                    {formatCurrency(infoWindowDest.cost, currency)}
                  </span>
                </div>
                {infoWindowDest.address && (
                  <div className="text-[11px] text-stone-500 line-clamp-2">
                    {infoWindowDest.address}
                  </div>
                )}
                {infoWindowDest.notes && (
                  <div className="text-[11px] italic text-stone-700 bg-orange-50/70 p-1.5 rounded border border-orange-200/60">
                    {infoWindowDest.notes}
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Floating Map Controls Top Bar */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-orange-200/80 shadow-xs">
            {/* Map Type (Roadmap / Satellite) */}
            <button
              onClick={() => setMapTypeId(mapTypeId === 'roadmap' ? 'hybrid' : 'roadmap')}
              title="Ganti tampilan peta (Jalan / Satelit)"
              aria-label="Ganti jenis peta antara jalan dan satelit"
              className="p-1.5 text-stone-700 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors text-xs flex items-center gap-1.5 font-medium"
            >
              <Layers className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
              <span>{mapTypeId === 'roadmap' ? 'Satelit' : 'Jalan'}</span>
            </button>
          </div>
        </div>

        {/* Picking Coordinates Overlay Banner */}
        {isPickingLocation && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-orange-950/95 text-white p-3 rounded-lg shadow-xl border border-orange-700/60 flex items-center justify-between text-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400 animate-bounce" />
              <span>
                <strong>Mode Penempatan Pin Google Maps:</strong> Klik di peta untuk menandai titik lokasi.
              </span>
            </div>
            <span className="text-orange-200 text-[11px] font-mono">
              Klik sembarang area
            </span>
          </div>
        )}

        {/* Legend strip at bottom left */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-orange-200/80 shadow-xs hidden md:flex items-center gap-3 text-[11px] text-stone-600">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" />
            <span>Wisata</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
            <span>Hotel</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block" />
            <span>Alam</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span>Belanja</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-600 inline-block" />
            <span>Transit</span>
          </div>
        </div>
      </div>
    </APIProvider>
  );
};
