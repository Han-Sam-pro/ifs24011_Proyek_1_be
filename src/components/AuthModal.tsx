import React, { useState } from 'react';
import {
  loginUser,
  registerUser,
  setAuthSession,
  AppUser,
} from '../services/roamApi';
import { X, LogIn, UserPlus, ShieldCheck, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onUserLoggedIn: (user: AppUser) => void;
  onUserLoggedOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserLoggedIn,
  onUserLoggedOut,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await loginUser(email.trim(), password);
        if (res.status === 'success' && res.data) {
          setSuccessMessage('Berhasil masuk ke akun RoamPlan!');
          onUserLoggedIn(res.data.user);
          setTimeout(() => {
            onClose();
          }, 800);
        } else {
          setErrorMessage(res.message || 'Email atau password salah');
        }
      } else {
        const res = await registerUser(name.trim(), email.trim(), password);
        if (res.status === 'success') {
          setSuccessMessage('Pendaftaran berhasil! Silakan masuk dengan email & password Anda.');
          setActiveTab('login');
        } else {
          setErrorMessage(res.message || 'Gagal mendaftar akun');
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan koneksi ke server RoamPlan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-orange-200/90 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between bg-orange-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-bold text-stone-900">
                {currentUser ? 'Profil pengguna' : 'Autentikasi Akun'}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Powered by Open API Database
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela autentikasi"
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-orange-100/60 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Current User Profile View (When Logged In) */}
        {currentUser ? (
          <div className="p-6 space-y-5 text-center">
            <div className="flex flex-col items-center gap-3">
              <img
                src={currentUser.photo || '/default-avatar.svg'}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full border-4 border-orange-200 shadow-md object-cover"
              />
              <div>
                <h3 className="text-base font-bold text-stone-900">{currentUser.name}</h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">{currentUser.email}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                  ✓ Terautentikasi di database
                </span>
              </div>
            </div>

            <div className="bg-orange-50/60 p-3.5 rounded-xl border border-orange-200/80 text-xs text-stone-700 text-left space-y-1 font-mono">
              <div><strong>User ID:</strong> #{currentUser.id}</div>
              <div><strong>Status:</strong> Terhubung dengan API Database</div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={onUserLoggedOut}
                className="flex-1 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              >
                Keluar (Logout)
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register Form View */
          <div className="p-6 space-y-5">
            {/* Tab Switcher */}
            <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200/70">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-white text-orange-950 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-orange-600" />
                <span>Masuk (Login)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-white text-orange-950 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-orange-600" />
                <span>Daftar Akun</span>
              </button>
            </div>

            {/* Error & Success Feedback */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'register' && (
                <div className="space-y-1">
                  <label htmlFor="auth-name" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-orange-600" />
                    <span>Nama Lengkap</span>
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama Anda..."
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="auth-email" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-orange-600" />
                  <span>Email</span>
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@gmail.com"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="auth-password" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-orange-600" />
                  <span>Password</span>
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                <span>
                  {loading
                    ? 'Memproses...'
                    : activeTab === 'login'
                    ? 'Masuk ke Akun'
                    : 'Daftar Akun Baru'}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
