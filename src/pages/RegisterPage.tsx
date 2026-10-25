import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/roamApi';
import { Compass, User, Mail, Lock, UserPlus, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await registerUser(name.trim(), email.trim(), password);
      if (res.status === 'success') {
        setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke halaman masuk...');
        setTimeout(() => {
          navigate('/auth/login');
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Gagal mendaftar akun. Silakan periksa kembali data Anda.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan koneksi ke server RoamPlan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-600 text-white shadow-md">
          <Compass className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Daftar Akun RoamPlan
        </h1>
        <p className="text-xs text-stone-600 max-w-xs mx-auto">
          Buat akun baru untuk menyimpan dan mengelola rencana perjalanan Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-orange-200/90 rounded-2xl sm:px-10 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="reg-name" className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-600" />
                <span>Nama Lengkap</span>
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda..."
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50/30"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-email" className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-600" />
                <span>Alamat Email</span>
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@gmail.com"
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50/30"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-password" className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-600" />
                <span>Kata Sandi (Password)</span>
              </label>
              <input
                id="reg-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Memproses Pendaftaran...' : 'Daftar Akun Baru'}</span>
              <UserPlus className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-stone-200/80 text-center text-xs text-stone-600">
            <span>Sudah memiliki akun? </span>
            <Link
              to="/auth/login"
              className="font-bold text-orange-700 hover:text-orange-900 hover:underline inline-flex items-center gap-0.5 ml-1"
            >
              <span>Masuk di sini</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
