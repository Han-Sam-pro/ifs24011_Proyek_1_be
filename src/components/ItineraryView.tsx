import React from 'react';
import { Destination, DayPlan, DestinationCategory } from '../types/trip';
import { calculateDayRouteStats, formatCurrency, formatDuration } from '../utils/geo';
import {
  Sparkles,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Car,
  Clock,
  Compass,
  MapPin,
  Utensils,
  Camera,
  ShoppingBag,
  Bed,
} from 'lucide-react';

interface ItineraryViewProps {
  currentDay: DayPlan;
  currency: string;
  selectedDestinationId: string | null;
  onSelectDestination: (id: string | null) => void;
  onAddDestination: () => void;
  onEditDestination: (dest: Destination) => void;
  onDeleteDestination: (destId: string) => void;
  onMoveDestination: (index: number, direction: 'up' | 'down') => void;
  onOptimizeRoute: () => void;
}

const CATEGORY_ICONS: Record<DestinationCategory, React.ReactNode> = {
  sightseeing: <Camera className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />,
  culinary: <Utensils className="w-3.5 h-3.5 text-orange-700" aria-hidden="true" />,
  nature: <Compass className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />,
  hotel: <Bed className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />,
  shopping: <ShoppingBag className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />,
  transit: <Car className="w-3.5 h-3.5 text-stone-600" aria-hidden="true" />,
};

const CATEGORY_BADGES: Record<DestinationCategory, string> = {
  sightseeing: 'Wisata',
  culinary: 'Kuliner',
  nature: 'Alam',
  hotel: 'Hotel',
  shopping: 'Belanja',
  transit: 'Transit',
};

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  currentDay,
  currency,
  selectedDestinationId,
  onSelectDestination,
  onAddDestination,
  onEditDestination,
  onDeleteDestination,
  onMoveDestination,
  onOptimizeRoute,
}) => {
  const destinations = currentDay.destinations;
  const routeStats = calculateDayRouteStats(destinations);
  const totalDayCost = destinations.reduce((sum, d) => sum + d.cost, 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-orange-200/80 overflow-hidden shadow-xs">
      {/* Header & Stats Banner - Clean Stacked Layout preventing any text squishing */}
      <div className="p-4 border-b border-orange-200/70 bg-orange-50/40 space-y-3">
        {/* Title */}
        <div>
          <h2 className="font-bold text-stone-900 text-sm leading-snug">
            Hari {currentDay.dayNumber}: {currentDay.themeTitle || 'Rencana Perjalanan'}
          </h2>
        </div>

        {/* Clean Unboxed Metadata Strip */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-600 font-mono tabular-nums bg-white/80 p-2 rounded-lg border border-orange-200/60">
          <span className="font-semibold text-stone-800">{destinations.length} Destinasi</span>
          <span aria-hidden="true" className="text-orange-300">·</span>
          <span>{routeStats.totalDistanceKm} km rute</span>
          <span aria-hidden="true" className="text-orange-300">·</span>
          <span>~{routeStats.totalTravelMinutes} mnt di jalan</span>
          <span aria-hidden="true" className="text-orange-300">·</span>
          <span className="text-orange-900 font-bold">{formatCurrency(totalDayCost, currency)}</span>
        </div>

        {/* Action CTAs - Responsive full-row button container */}
        <div className="flex items-center gap-2">
          {destinations.length > 2 && (
            <button
              type="button"
              onClick={onOptimizeRoute}
              aria-label="Optimalkan urutan rute kunjungan hari ini"
              title="Susun ulang urutan kunjungan berdasarkan jarak terdekat dan waktu secara otomatis"
              className="flex-1 px-3 py-1.5 text-xs font-semibold text-orange-950 bg-orange-100 hover:bg-orange-200 border border-orange-300/80 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" aria-hidden="true" />
              <span className="truncate">Optimalkan Rute</span>
            </button>
          )}
          <button
            type="button"
            onClick={onAddDestination}
            aria-label="Tambah destinasi tempat baru"
            className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Tambah Tempat</span>
          </button>
        </div>
      </div>

      {/* Destinations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {destinations.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-orange-200/70 rounded-xl bg-orange-50/20">
            <Compass className="w-10 h-10 text-orange-400 mb-2" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-stone-800">
              Belum Ada Destinasi di Hari Ini
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mt-1 mb-4">
              Mulai tambahkan tempat wisata, kuliner, atau penginapan untuk melihat lokasi di Google Maps.
            </p>
            <button
              type="button"
              onClick={onAddDestination}
              aria-label="Tambah destinasi pertama ke hari ini"
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Tambah Destinasi Pertama</span>
            </button>
          </div>
        ) : (
          destinations.map((dest, index) => {
            const isSelected = dest.id === selectedDestinationId;
            const segment = routeStats.segments[index];

            return (
              <React.Fragment key={dest.id}>
                {/* Destination Item Card */}
                <div
                  onClick={() => onSelectDestination(dest.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`Destinasi ${index + 1}: ${dest.title}`}
                  className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 shadow-xs'
                      : 'border-stone-200 hover:border-orange-300 bg-white hover:bg-orange-50/30 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Numbered order badge */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-orange-100/70 text-orange-900 group-hover:bg-orange-200'
                      }`}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </div>

                    {/* Content details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="shrink-0">{CATEGORY_ICONS[dest.category]}</span>
                          <h3 className="text-sm font-bold text-stone-900 truncate">
                            {dest.title}
                          </h3>
                        </div>
                        <span className="text-xs font-semibold text-orange-950 font-mono tabular-nums shrink-0">
                          {formatCurrency(dest.cost, currency)}
                        </span>
                      </div>

                      {/* Clean Unboxed Metadata */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600 mt-1 font-mono">
                        <span className="flex items-center gap-1 text-stone-800 font-medium">
                          <Clock className="w-3 h-3 text-orange-600" aria-hidden="true" />
                          <span>{dest.startTime}</span>
                        </span>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span>{formatDuration(dest.durationMinutes)}</span>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="text-stone-700">{CATEGORY_BADGES[dest.category]}</span>
                      </div>

                      {/* Address & Notes */}
                      {dest.address && (
                        <p className="text-[11px] text-stone-600 truncate mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-orange-600 shrink-0" aria-hidden="true" />
                          <span>{dest.address}</span>
                        </p>
                      )}

                      {dest.notes && (
                        <p className="text-[11px] text-stone-700 bg-orange-50/60 border border-orange-200/60 p-1.5 rounded mt-1.5 italic">
                          {dest.notes}
                        </p>
                      )}
                    </div>

                    {/* Quick Reorder and Actions with axe-compliant accessible labels */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-0.5 shrink-0"
                    >
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => onMoveDestination(index, 'up')}
                        title="Pindahkan ke atas"
                        aria-label={`Pindahkan ${dest.title} ke atas`}
                        className="p-1.5 text-stone-500 hover:text-orange-700 disabled:opacity-20 hover:bg-orange-50 rounded transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={index === destinations.length - 1}
                        onClick={() => onMoveDestination(index, 'down')}
                        title="Pindahkan ke bawah"
                        aria-label={`Pindahkan ${dest.title} ke bawah`}
                        className="p-1.5 text-stone-500 hover:text-orange-700 disabled:opacity-20 hover:bg-orange-50 rounded transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditDestination(dest)}
                        title="Edit rincian tempat"
                        aria-label={`Edit destinasi ${dest.title}`}
                        className="p-1.5 text-stone-500 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors ml-0.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDestination(dest.id)}
                        title="Hapus dari jadwal"
                        aria-label={`Hapus ${dest.title} dari jadwal`}
                        className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transit Travel Gap Between Destinations */}
                {segment && (
                  <div className="flex items-center gap-2 pl-3 py-0.5 text-[11px] text-stone-600 font-mono">
                    <div className="w-4 flex justify-center" aria-hidden="true">
                      <div className="w-0.5 h-6 bg-orange-200 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-orange-50/80 px-2 py-0.5 rounded border border-orange-200/70 text-orange-950">
                      <Car className="w-3 h-3 text-orange-600" aria-hidden="true" />
                      <span>{segment.distanceKm} km</span>
                      <span className="text-orange-300" aria-hidden="true">·</span>
                      <span>~{segment.estimatedMinutes} menit perjalanan</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};
