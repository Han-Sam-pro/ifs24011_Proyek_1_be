import React, { useState, useEffect } from 'react';
import { getUsersList, AppUser } from '../services/roamApi';
import { Header } from '../components/Header';
import { Users, Search, RefreshCw, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { TripPlan } from '../types/trip';

interface UsersPageProps {
  trip: TripPlan;
  currentUser: AppUser | null;
  onOpenShareModal: () => void;
  onTriggerPrint: () => void;
  onSelectPresetTrip: (preset: TripPlan) => void;
  onChangeCurrency: (currency: TripPlan['currency']) => void;
  onNewTrip: () => void;
  onOpenCityModal?: () => void;
  onOpenAuthModal: () => void;
  onOpenUsersModal: () => void;
}

export const UsersPage: React.FC<UsersPageProps> = (props) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const list = await getUsersList();
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl border border-orange-200/90 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Daftar pengguna</h1>
              <p className="text-xs text-stone-600 mt-0.5">
                Daftar akun pengguna yang terdaftar pada RoamPlan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Muat Ulang</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari pengguna berdasarkan nama atau email..."
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-orange-200 rounded-xl bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-16 text-center text-xs text-stone-500 font-mono">
              Memuat data pengguna dari database...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-stone-500">
              Tidak ada pengguna ditemukan.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white p-4 rounded-2xl border border-orange-200/80 hover:border-orange-400 transition-all shadow-2xs flex items-center gap-3.5"
              >
                <img
                  src={user.photo || '/default-avatar.svg'}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-stone-900 truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-stone-500 truncate flex items-center gap-1 font-mono mt-0.5">
                    <Mail className="w-3 h-3 text-orange-500 shrink-0" />
                    <span>{user.email}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-800 rounded font-semibold border border-orange-200">
                      ID #{user.id}
                    </span>
                    {user.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>{new Date(user.created_at).toLocaleDateString('id-ID')}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
