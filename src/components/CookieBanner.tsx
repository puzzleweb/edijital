import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, Check, SlidersHorizontal, ChevronRight, ExternalLink } from 'lucide-react';
import { LegalDocSlug } from '../pages/LegalPage';

interface CookieBannerProps {
  onNavigateLegal: (slug: LegalDocSlug) => void;
}

const STORAGE_KEY = 'edijital_cookie_consent';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigateLegal }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Show banner smoothly after 800ms
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = {
      status: 'accepted_all',
      date: new Date().toISOString(),
      preferences: { necessary: true, analytics: true, marketing: true }
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    } catch {}
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    const consentData = {
      status: 'accepted_necessary',
      date: new Date().toISOString(),
      preferences: { necessary: true, analytics: false, marketing: false }
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    } catch {}
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    const consentData = {
      status: 'custom',
      date: new Date().toISOString(),
      preferences
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    } catch {}
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[999] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl text-slate-800 dark:text-zinc-100">
        
        {/* Main Banner View */}
        {!showPreferences ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Çerez Politikası & KVKK
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                    Gizliliğinize ve verilerinize değer veriyoruz
                  </span>
                </div>
              </div>

              <button
                onClick={handleAcceptNecessary}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Sitemizde kullanıcı deneyiminizi geliştirmek, site trafiğini analiz etmek ve güvenli hizmet sunabilmek amacıyla 6698 sayılı KVKK ve GDPR mevzuatına uygun çerezler (cookies) kullanmaktayız.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => onNavigateLegal('gizlilik-politikasi')}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Gizlilik ve Çerez Politikamızı İnceleyin</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-sm active:scale-98 text-center"
              >
                Tümünü Kabul Et
              </button>

              <button
                type="button"
                onClick={handleAcceptNecessary}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition cursor-pointer text-center"
              >
                Sadece Zorunlu Çerezler
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 inline-flex items-center gap-1 transition cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Çerez Tercihlerini Özelleştir</span>
              </button>
            </div>

          </div>
        ) : (
          /* Preferences Customize View */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Çerez Tercihleri
                </h4>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                ← Geri
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Necessary */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Zorunlu ve Güvenlik Çerezleri</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                      Zorunlu
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Web sitesinin temel işlevleri, sepet ve oturum güvenliği için gereklidir. Kapatılamaz.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 w-4 h-4 text-blue-600 rounded cursor-not-allowed accent-blue-600"
                />
              </div>

              {/* Analytics */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Analitik ve Performans Çerezleri
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Ziyaretçi sayılarını ve gezinme trafiğini anonim olarak ölçerek siteyi geliştirmemizi sağlar.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                />
              </div>

              {/* Marketing */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Pazarlama & İletişim Çerezleri
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    İlgi alanlarınıza uygun bilgilendirme ve teklifler sunmamıza olanak tanır.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                />
              </div>

            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={handleSaveCustom}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-sm active:scale-98"
              >
                Tercihleri Kaydet
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
