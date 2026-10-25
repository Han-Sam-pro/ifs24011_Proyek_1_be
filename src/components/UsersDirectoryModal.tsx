import React, { useState, useEffect } from 'react';
import { getUsersList, AppUser } from '../services/roamApi';
import { X, Users, Search, RefreshCw, Mail, Calendar } from 'lucide-react';

interface UsersDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsersDirectoryModal: React.FC<UsersDirectoryModalProps> = ({
  isOpen,
  onClose,
}) => {
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
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="users-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-orange-200/90 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between bg-orange-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="users-modal-title" className="text-base font-bold text-stone-900">
                Daftar pengguna
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Daftar akun pengguna yang terdaftar pada RoamPlan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup direktori pengguna"
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-orange-100/60 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-stone-200/70 bg-stone-50/60 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pengguna berdasarkan nama atau email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="p-2 text-stone-600 hover:text-orange-800 hover:bg-orange-50 border border-stone-200 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 shrink-0"
            title="Muat Ulang Daftar Users"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Users List Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="p-10 text-center text-xs text-stone-500 font-mono">
              Memuat data pengguna dari database...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-xs text-stone-500">
              Tidak ada pengguna ditemukan.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-3 bg-white border border-stone-200 rounded-xl hover:border-orange-300 transition-colors flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.photo || '/default-avatar.svg'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-orange-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-stone-900 truncate">
                      {user.name} <span className="text-[10px] text-stone-400 font-mono font-normal">#{user.id}</span>
                    </h3>
                    <p className="text-[11px] text-stone-500 truncate flex items-center gap-1 font-mono">
                      <Mail className="w-3 h-3 text-orange-500 shrink-0" />
                      <span>{user.email}</span>
                    </p>
                  </div>
                </div>

                {user.created_at && (
                  <div className="text-[10px] text-stone-400 font-mono shrink-0 hidden sm:flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    <span>{new Date(user.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200/80 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>Total {filteredUsers.length} Pengguna Terdaftar</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
