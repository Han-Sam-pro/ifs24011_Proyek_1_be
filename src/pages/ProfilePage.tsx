import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppUser } from '../services/roamApi';
import { Header } from '../components/Header';
import { User, ShieldCheck, Mail, Calendar, LogOut, MapPin, Sparkles } from 'lucide-react';
import { TripPlan } from '../types/trip';

interface ProfilePageProps {
  trip: TripPlan;
  currentUser: AppUser | null;
  onUserLoggedOut: () => void;
  onOpenShareModal: () => void;
  onTriggerPrint: () => void;
  onSelectPresetTrip: (preset: TripPlan) => void;
  onChangeCurrency: (currency: TripPlan['currency']) => void;
  onNewTrip: () => void;
  onOpenCityModal?: () => void;
  onOpenAuthModal: () => void;
  onOpenUsersModal: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = (props) => {
  const navigate = useNavigate();
  const user = props.currentUser;

  const handleLogout = () => {
    props.onUserLoggedOut();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-stone-900 flex flex-col font-sans">
      <Header
        trip={props.trip}
        activeViewTab="planner"
        currentUser={props.currentUser}
        onChangeViewTab={() => {}}
        onOpenShareModal={props.onOpenShareModal}
        onTriggerPrint={props.onTriggerPrint}
        onSelectPresetTrip={props.onSelectPresetTrip}
        onChangeCurrency={props.onChangeCurrency}
        onNewTrip={props.onNewTrip}
        onOpenCityModal={props.onOpenCityModal}
        onOpenAuthModal={props.onOpenAuthModal}
        onOpenUsersModal={props.onOpenUsersModal}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-orange-200/90 p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <img
            src={user?.photo || '/default-avatar.svg'}
            alt={user?.name || 'Pengguna'}
            className="w-24 h-24 rounded-full border-4 border-orange-200 shadow-md object-cover shrink-0"
          />

          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-2xl font-bold text-stone-900">
              {user?.name || 'Profil Pengguna'}
            </h1>
            <p className="text-xs text-stone-500 font-mono flex items-center justify-center md:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-orange-600" />
              <span>{user?.email || 'email@domain.com'}</span>
            </p>
            <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>✓ Terautentikasi di database</span>
              </span>
              <span className="px-2.5 py-1 text-xs font-mono bg-orange-50 text-orange-900 rounded-full border border-orange-200">
                User ID #{user?.id || 0}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>

        {/* Active Trip Info */}
        <div className="bg-white rounded-2xl border border-orange-200/90 p-6 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>Rencana Perjalanan Aktif Anda</span>
          </h2>

          <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200/80 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">{props.trip.title}</h3>
              <p className="text-xs text-stone-600 font-mono mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>{props.trip.destinationCity} · {props.trip.days.length} Hari</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/plan/${props.trip.id}`)}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors"
            >
              Buka Planner
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
