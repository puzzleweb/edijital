import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, Mail, Shield } from 'lucide-react';
import { SupabaseService } from '../services/supabaseService';
import { StorageService } from '../services/storage';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);

    try {
      // 1. Strict Supabase Auth Login with Role check
      const res = await SupabaseService.signIn(email, password);

      if (res.error) {
        setLoading(false);
        // Translate common Supabase error messages to clear Turkish
        let errorMsg = res.error;
        if (errorMsg.includes('Invalid login credentials')) {
          errorMsg = 'Hatalı e-posta veya şifre girdiniz.';
        } else if (errorMsg.includes('Email not confirmed')) {
          errorMsg = 'E-posta adresiniz henüz onaylanmamış.';
        }
        setError(errorMsg);
        return;
      }

      // 2. Verified Admin Role
      const role = res.role || 'admin';
      StorageService.setAdminAuthenticated(true, email.trim(), role);
      setLoading(false);
      onLoginSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Giriş sırasında bir hata oluştu.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Card */}
        <div className="rounded-3xl p-8 sm:p-10 bg-zinc-900/90 border border-zinc-800 backdrop-blur-2xl shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
              E-DİJİTAL FİNANS
            </h2>
            <p className="text-xs text-zinc-400">
              Supabase Auth Yetkili Yönetim Girişi
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Yönetici E-Posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="admin@edijitalfinans.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-[0.99] cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Yetkili Girişi Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Back to site */}
          <div className="mt-6 text-center">
            <button
              onClick={onBackToSite}
              className="text-xs text-zinc-400 hover:text-white transition underline cursor-pointer"
            >
              ← Web Sitesine Geri Dön
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
