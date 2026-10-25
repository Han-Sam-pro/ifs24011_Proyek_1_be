import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TripPlan } from '../types/trip';
import { AppUser } from '../services/roamApi';
import {
  Compass,
  Share2,
  Printer,
  Calendar,
  Wallet,
  User,
  Users,
  LogIn,
} from 'lucide-react';
import { PRESET_TRIPS } from '../data/presetTrips';

interface HeaderProps {
  trip: TripPlan;
  activeViewTab: 'planner' | 'budget';
  currentUser: AppUser | null;
  onChangeViewTab: (tab: 'planner' | 'budget') => void;
  onOpenShareModal: () => void;
  onTriggerPrint: () => void;
  onSelectPresetTrip: (preset: TripPlan) => void;
  onChangeCurrency: (currency: TripPlan['currency']) => void;
  onNewTrip: () => void;
  onOpenCityModal?: () => void;
  onOpenAuthModal: () => void;
  onOpenUsersModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  trip,
  activeViewTab,
  currentUser,
  onChangeViewTab,
  onOpenShareModal,
  onTriggerPrint,
  onSelectPresetTrip,
  onChangeCurrency,
  onOpenCityModal,
  onOpenAuthModal,
  onOpenUsersModal,
}) => {
  const navigate = useNavigate();

  return (
    <header role="banner" className="no-print bg-white/95 backdrop-blur-md border-b border-orange-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single Text Element Wordmark */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            to="/"
            onClick={() => onChangeViewTab('planner')}
            className="flex items-center gap-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap">
              RoamPlan
            </h1>
          </Link>

          {/* Quick Preset Selector & Custom City Trigger */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs" role="group" aria-label="Pilih Preset Itinerary">
            {PRESET_TRIPS.map((preset) => (
              <button
                type="button"
                key={preset.id}
                onClick={() => {
                  onSelectPresetTrip(preset);
                  navigate(`/plan/${preset.id}`);
                }}
                aria-label={`Muat contoh itinerary ${preset.destinationCity.split(',')[0]}`}
                className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  trip.id === preset.id
                    ? 'bg-orange-100 font-bold text-orange-950'
                    : 'text-stone-600 hover:text-orange-900 hover:bg-orange-50'
                }`}
              >
                {preset.destinationCity.split(',')[0]}
              </button>
            ))}
            <button
              type="button"
              onClick={onOpenCityModal}
              aria-label="Buka pilihan atau tambah kota tujuan baru"
              className="px-2.5 py-1 rounded text-xs font-semibold text-orange-950 bg-orange-100 hover:bg-orange-200 border border-orange-300/80 transition-colors whitespace-nowrap flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <span>+ Kota Lain</span>
            </button>
          </div>
        </div>

        {/* Zone 2: Workspace View Navigation Links */}
        <nav aria-label="Navigasi Mode Tampilan" className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-lg border border-stone-200/60">
          <Link
            to="/"
            onClick={() => onChangeViewTab('planner')}
            aria-label="Tampilan Itinerary dan Peta"
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              activeViewTab === 'planner'
                ? 'bg-white text-orange-950 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
            <span>Itinerary & Peta</span>
          </Link>
          <button
            type="button"
            onClick={() => onChangeViewTab('budget')}
            aria-label="Tampilan Anggaran dan Biaya"
            aria-current={activeViewTab === 'budget' ? 'page' : undefined}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              activeViewTab === 'budget'
                ? 'bg-white text-orange-950 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
            <span>Anggaran & Biaya</span>
          </button>
        </nav>

        {/* Zone 3: Users Directory, Auth Account, Currency & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Users Directory Page Link */}
          <Link
            to="/users"
            title="Lihat Daftar Pengguna Terdaftar"
            aria-label="Lihat daftar pengguna"
            className="px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200/80 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Users className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
            <span className="hidden md:inline">Users</span>
          </Link>

          {/* User Profile / Auth Link */}
          <Link
            to={currentUser ? '/profile' : '/auth/login'}
            title={currentUser ? `Akun: ${currentUser.name}` : 'Masuk atau Daftar Akun'}
            aria-label={currentUser ? `Profil pengguna ${currentUser.name}` : 'Masuk atau daftar akun'}
            className="px-2.5 py-1.5 text-xs font-semibold text-stone-900 bg-orange-50 hover:bg-orange-100/90 border border-orange-200 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {currentUser ? (
              <>
                <img
                  src={currentUser.photo || '/default-avatar.svg'}
                  alt={currentUser.name}
                  className="w-4 h-4 rounded-full object-cover border border-orange-300"
                />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{currentUser.name.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
                <span>Masuk</span>
              </>
            )}
          </Link>

          {/* Currency Dropdown */}
          <select
            id="currency-select"
            aria-label="Pilih Mata Uang Rencana Perjalanan"
            value={trip.currency}
            onChange={(e) => onChangeCurrency(e.target.value as TripPlan['currency'])}
            className="text-xs font-semibold bg-orange-50/50 border border-orange-200 text-stone-700 py-1.5 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer hidden sm:block"
            title="Pilih Mata Uang"
          >
            <option value="IDR">IDR (Rp)</option>
            <option value="USD">USD ($)</option>
            <option value="SGD">SGD (S$)</option>
            <option value="MYR">MYR (RM)</option>
            <option value="EUR">EUR (€)</option>
            <option value="JPY">JPY (¥)</option>
          </select>

          {/* Print/PDF */}
          <button
            type="button"
            onClick={onTriggerPrint}
            aria-label="Cetak atau Simpan PDF Ringkasan Perjalanan"
            title="Cetak atau Simpan PDF"
            className="p-2 text-stone-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors hidden sm:flex items-center focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Primary Share Action */}
          <button
            type="button"
            onClick={onOpenShareModal}
            aria-label="Buka dialog bagikan itinerary"
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Bagikan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
