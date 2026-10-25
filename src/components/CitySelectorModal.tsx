import React, { useState, useEffect } from 'react';
import { TripPlan } from '../types/trip';
import { POPULAR_CITIES, CityInfo, getCoordinatesForCityName } from '../data/cityData';
import { X, MapPin, Plus, Sparkles, Globe, ArrowRight, Check } from 'lucide-react';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrip: TripPlan;
  onUpdateTripCity: (cityName: string) => void;
  onCreateTripForCity: (newTrip: TripPlan) => void;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  currentTrip,
  onUpdateTripCity,
  onCreateTripForCity,
}) => {
  const [customCityInput, setCustomCityInput] = useState('');
  const [selectedCityObj, setSelectedCityObj] = useState<CityInfo | null>(null);
  const [newTripTitle, setNewTripTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'update' | 'new'>('update');

  useEffect(() => {
    if (isOpen) {
      setCustomCityInput(currentTrip.destinationCity || '');
      setNewTripTitle(`Liburan Seru ke ${currentTrip.destinationCity || 'Kota Impian'}`);
    }
  }, [isOpen, currentTrip]);

  if (!isOpen) return null;

  const handleSelectPresetCity = (city: CityInfo) => {
    setSelectedCityObj(city);
    setCustomCityInput(city.cityName);
    setNewTripTitle(`Eksplorasi ${city.cityName} — Perjalanan ${city.provinceOrCountry}`);
  };

  const handleApplyCityUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCity = customCityInput.trim();
    if (!finalCity) return;

    if (activeTab === 'update') {
      onUpdateTripCity(finalCity);
      onClose();
    } else {
      // Create fresh trip for this city
      const coords = selectedCityObj
        ? { lat: selectedCityObj.lat, lng: selectedCityObj.lng }
        : getCoordinatesForCityName(finalCity);

      const currency = selectedCityObj ? selectedCityObj.defaultCurrency : 'IDR';

      // Pick popular spots if available
      const spots = selectedCityObj?.popularSpots || [];
      const initialDestinations = spots.slice(0, 3).map((s, idx) => ({
        id: `dest-${Date.now()}-${idx}`,
        title: s.title,
        category: s.cat,
        startTime: `${9 + idx * 3}:00`.padStart(5, '0'),
        durationMinutes: 90,
        cost: s.cost,
        lat: s.lat,
        lng: s.lng,
        address: s.address,
      }));

      const newTrip: TripPlan = {
        id: `trip-${Date.now()}`,
        title: newTripTitle.trim() || `Rencana Perjalanan ${finalCity}`,
        destinationCity: finalCity,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        currency: currency,
        totalBudget: currency === 'IDR' ? 5000000 : 1000,
        days: [
          {
            id: `day-1-${Date.now()}`,
            dayNumber: 1,
            date: new Date().toISOString().split('T')[0],
            themeTitle: `Hari Pertama di ${finalCity}`,
            destinations: initialDestinations,
          },
        ],
      };

      onCreateTripForCity(newTrip);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-orange-200/90 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between bg-orange-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="city-modal-title" className="text-base font-bold text-stone-900">
                Ganti atau Tambah Kota Tujuan
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Bebas tentukan kota mana saja di Indonesia maupun Internasional
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela pilih kota"
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-orange-100/60 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Mode Selector Switcher */}
        <div className="px-6 pt-4 bg-orange-50/20">
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200/70">
            <button
              type="button"
              onClick={() => setActiveTab('update')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'update'
                  ? 'bg-white text-orange-950 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Ganti Kota pada Rencana Saat Ini</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-white text-orange-950 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-orange-600" />
              <span>Buat Rencana Baru Kota Ini</span>
            </button>
          </div>
        </div>

        {/* Form & Preset Grid Body */}
        <form onSubmit={handleApplyCityUpdate} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Custom City Free Input Box */}
          <div className="space-y-1.5 bg-orange-50/60 p-4 rounded-xl border border-orange-200/80">
            <label htmlFor="custom-city-input" className="text-xs font-bold text-orange-950 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
                <span>Ketik Nama Kota Sendiri (Bebas)</span>
              </span>
              <span className="text-[11px] font-mono font-normal text-stone-500">
                Contoh: Bandung, Makassar, Malang, Tokyo...
              </span>
            </label>
            <div className="relative">
              <input
                id="custom-city-input"
                type="text"
                required
                value={customCityInput}
                onChange={(e) => {
                  setCustomCityInput(e.target.value);
                  setSelectedCityObj(null);
                  if (activeTab === 'new') {
                    setNewTripTitle(`Perjalanan Seru ke ${e.target.value || 'Kota Baru'}`);
                  }
                }}
                placeholder="Masukkan nama kota impian Anda..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-orange-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              />
              <MapPin className="w-4 h-4 text-orange-500 absolute left-3 top-3" aria-hidden="true" />
            </div>
          </div>

          {/* New Trip Title (When activeTab === 'new') */}
          {activeTab === 'new' && (
            <div className="space-y-1">
              <label htmlFor="new-trip-title" className="text-xs font-semibold text-stone-700">
                Judul Perjalanan Baru:
              </label>
              <input
                id="new-trip-title"
                type="text"
                required
                value={newTripTitle}
                onChange={(e) => setNewTripTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Popular Cities Preset Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800">
                Atau Pilih Dari Kota Populer:
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                {POPULAR_CITIES.length} Destinasi Populer
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {POPULAR_CITIES.map((city) => {
                const isSelected =
                  customCityInput.toLowerCase().trim() === city.cityName.toLowerCase().trim();

                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectPresetCity(city)}
                    aria-label={`Pilih kota ${city.cityName}`}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      isSelected
                        ? 'border-orange-600 bg-orange-100/70 text-orange-950 ring-1 ring-orange-600 shadow-xs'
                        : 'border-stone-200 hover:border-orange-300 bg-white hover:bg-orange-50/40 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs truncate">{city.cityName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-stone-500 truncate font-mono">
                      {city.provinceOrCountry}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!customCityInput.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>
                {activeTab === 'update'
                  ? `Atur Kota ke "${customCityInput.trim() || '...'}"`
                  : `Buat Itinerary ${customCityInput.trim() || '...'}`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
