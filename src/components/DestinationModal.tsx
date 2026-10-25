import React, { useState, useEffect } from 'react';
import { Destination, DestinationCategory } from '../types/trip';
import { X, MapPin, Clock, DollarSign, Tag, FileText, Check } from 'lucide-react';
import { POPULAR_CITIES } from '../data/cityData';

interface DestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (destination: Destination) => void;
  destinationToEdit?: Destination | null;
  dayNumber: number;
  currency: string;
  destinationCity?: string;
  onTriggerMapPick: () => void;
  pendingCoordinates?: { lat: number; lng: number } | null;
  defaultTime?: string;
}

const CATEGORIES: { key: DestinationCategory; label: string; color: string }[] = [
  { key: 'sightseeing', label: 'Wisata / Budaya', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { key: 'culinary', label: 'Kuliner / Cafe', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { key: 'nature', label: 'Alam / Pantai', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { key: 'hotel', label: 'Akomodasi / Hotel', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { key: 'shopping', label: 'Belanja / Pasar', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { key: 'transit', label: 'Transit / Stasiun', color: 'bg-stone-50 text-stone-800 border-stone-200' },
];

export const DestinationModal: React.FC<DestinationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  destinationToEdit,
  dayNumber,
  currency,
  destinationCity,
  onTriggerMapPick,
  pendingCoordinates,
  defaultTime = '09:00',
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DestinationCategory>('sightseeing');
  const [startTime, setStartTime] = useState(defaultTime);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [cost, setCost] = useState(50000);
  const [lat, setLat] = useState(-7.7956);
  const [lng, setLng] = useState(110.3695);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (destinationToEdit) {
      setTitle(destinationToEdit.title);
      setCategory(destinationToEdit.category);
      setStartTime(destinationToEdit.startTime);
      setDurationMinutes(destinationToEdit.durationMinutes);
      setCost(destinationToEdit.cost);
      setLat(destinationToEdit.lat);
      setLng(destinationToEdit.lng);
      setAddress(destinationToEdit.address || '');
      setNotes(destinationToEdit.notes || '');
    } else {
      setTitle('');
      setCategory('sightseeing');
      setStartTime(defaultTime);
      setDurationMinutes(90);
      setCost(50000);
      setLat(-7.7956);
      setLng(110.3695);
      setAddress('');
      setNotes('');
    }
  }, [destinationToEdit, isOpen, defaultTime]);

  useEffect(() => {
    if (pendingCoordinates) {
      setLat(pendingCoordinates.lat);
      setLng(pendingCoordinates.lng);
    }
  }, [pendingCoordinates]);

  if (!isOpen) return null;

  // Find spots matching destination city or fall back to popular multi-city spots
  const matchedCity = POPULAR_CITIES.find(
    (c) =>
      destinationCity &&
      (c.cityName.toLowerCase().includes(destinationCity.toLowerCase()) ||
        destinationCity.toLowerCase().includes(c.cityName.toLowerCase()))
  );

  const availableSpotPresets = matchedCity?.popularSpots && matchedCity.popularSpots.length > 0
    ? matchedCity.popularSpots
    : POPULAR_CITIES.flatMap((c) => c.popularSpots || []).slice(0, 6);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newDest: Destination = {
      id: destinationToEdit ? destinationToEdit.id : `dest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      category,
      startTime: startTime || '09:00',
      durationMinutes: Number(durationMinutes) || 60,
      cost: Number(cost) || 0,
      lat: Number(lat) || 0,
      lng: Number(lng) || 0,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(newDest);
    onClose();
  };

  const handleApplySpotPreset = (spot: {
    title: string;
    lat: number;
    lng: number;
    cat: DestinationCategory;
    address: string;
    cost: number;
  }) => {
    setTitle(spot.title);
    setLat(spot.lat);
    setLng(spot.lng);
    setCategory(spot.cat);
    setAddress(spot.address);
    setCost(spot.cost);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-dest-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-orange-200/90 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between bg-orange-50/40">
          <div>
            <h2 id="modal-dest-title" className="text-base font-bold text-stone-900">
              {destinationToEdit ? 'Edit Destinasi Kunjungan' : `Tambah Destinasi — Hari ${dayNumber}`}
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Isi rincian waktu, titik Google Maps, dan estimasi biaya destinasi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela formulir destinasi"
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Quick preset chips */}
          {!destinationToEdit && availableSpotPresets.length > 0 && (
            <div className="space-y-1.5" role="group" aria-label="Tempat Populer">
              <span className="text-[11px] font-semibold text-stone-600">
                Isi Cepat Tempat Populer {matchedCity ? `(${matchedCity.cityName})` : ''}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableSpotPresets.map((spot) => (
                  <button
                    key={spot.title}
                    type="button"
                    onClick={() => handleApplySpotPreset(spot)}
                    aria-label={`Gunakan data cepat ${spot.title}`}
                    className="text-[11px] px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-950 font-medium rounded border border-orange-200 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    + {spot.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="dest-title-input" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <span>Nama Destinasi / Tempat</span>
              <span className="text-rose-600" aria-label="Wajib diisi">*</span>
            </label>
            <input
              id="dest-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Candi Prambanan, Gudeg Yu Djum, Hotel Tentrem..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5" role="group" aria-label="Pilih Kategori Tempat">
            <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
              <span>Kategori</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  aria-pressed={category === c.key}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    category === c.key
                      ? 'border-orange-600 bg-orange-50 text-orange-950 ring-1 ring-orange-600 font-bold'
                      : 'border-stone-200 hover:border-orange-200 bg-white text-stone-700'
                  }`}
                >
                  <span>{c.label}</span>
                  {category === c.key && <Check className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="dest-time-input" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
                <span>Waktu Mulai</span>
              </label>
              <input
                id="dest-time-input"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="dest-duration-input" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <span>Durasi Kunjungan (Menit)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="dest-duration-input"
                  type="number"
                  min="15"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex gap-1 shrink-0" role="group" aria-label="Durasi Cepat">
                  {[60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      aria-label={`Set durasi ${mins} menit`}
                      className="px-2 py-1.5 text-[11px] bg-orange-50 hover:bg-orange-100 text-orange-950 font-medium rounded border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cost */}
          <div className="space-y-1">
            <label htmlFor="dest-cost-input" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
              <span>Estimasi Biaya ({currency})</span>
            </label>
            <input
              id="dest-cost-input"
              type="number"
              min="0"
              step="1000"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Coordinates & Google Map Placement */}
          <div className="space-y-1.5 p-3.5 bg-orange-50/40 rounded-lg border border-orange-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
                <span>Titik Koordinat Google Maps</span>
              </span>
              <button
                type="button"
                onClick={onTriggerMapPick}
                aria-label="Pilih titik koordinat langsung di peta Google Maps"
                className="text-xs font-semibold text-orange-800 hover:text-orange-950 hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <span>Pilih Langsung di Peta</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label htmlFor="dest-lat-input" className="text-[11px] text-stone-600 font-medium">Latitude:</label>
                <input
                  id="dest-lat-input"
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 mt-0.5 font-mono text-xs border border-orange-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label htmlFor="dest-lng-input" className="text-[11px] text-stone-600 font-medium">Longitude:</label>
                <input
                  id="dest-lng-input"
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 mt-0.5 font-mono text-xs border border-orange-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Address / Landmark */}
          <div className="space-y-1">
            <label htmlFor="dest-address-input" className="text-xs font-semibold text-stone-700">
              Alamat Lengkap / Patokan
            </label>
            <input
              id="dest-address-input"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Raya Solo - Yogyakarta No.16, Sleman"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label htmlFor="dest-notes-input" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
              <span>Catatan Khusus / Tips Perjalanan</span>
            </label>
            <textarea
              id="dest-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Beli tiket online lebih awal, sewa pemandu lokal, bawa payung..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {destinationToEdit ? 'Simpan Perubahan' : 'Tambahkan ke Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
