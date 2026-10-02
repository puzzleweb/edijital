import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Package as PackageIcon, 
  Zap, 
  Search, 
  PhoneCall, 
  MessageSquare, 
  Phone, 
  X,
  Clock,
  MapPin,
  Building,
  User
} from 'lucide-react';
import { SiteSettings } from '../types';

interface MobileBottomNavProps {
  settings: SiteSettings;
  onOpenApply: () => void;
  onOpenTrack: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  settings,
  onOpenApply,
  onOpenTrack,
}) => {
  const [contactOpen, setContactOpen] = useState(false);

  // Close contact popover when Escape is pressed
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContactOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      {/* Contact Popover Backdrop */}
      {contactOpen && (
        <div 
          onClick={() => setContactOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sleek Mobile Contact Action Sheet */}
      <div 
        className={`fixed left-3 right-3 bottom-20 z-50 md:hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl transition-all duration-300 transform ${
          contactOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100' 
            : 'opacity-0 translate-y-4 pointer-events-none scale-95'
        }`}
      >
        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
              Hızlı İletişim Kanalları
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Eryaman ve Ostim şubelerimize doğrudan ulaşın
            </p>
          </div>
          <button
            onClick={() => setContactOpen(false)}
            className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2 Branches Clean List */}
        <div className="space-y-2.5">

          {/* 1. Eryaman Branch */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold text-zinc-900 dark:text-white">Eryaman Şubesi</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Etimesgut</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                0545 960 33 03
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href="tel:05459603303"
                  onClick={() => setContactOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ara</span>
                </a>
                <a
                  href="https://wa.me/905459603303?text=Merhaba,%20Eryaman%20subenizden%20e-imza%20hakkinda%20bilgi%20almak%20istiyorum."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setContactOpen(false)}
                  className="p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs active:scale-95 transition"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                </a>
              </div>
            </div>
          </div>

          {/* 2. Ostim Branch */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="text-xs font-bold text-zinc-900 dark:text-white">Ostim Şubesi</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Prestij Plaza</span>
            </div>

            {/* Simanur Kaya */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-zinc-700/40">
              <div>
                <div className="text-[11px] font-bold text-zinc-900 dark:text-white">Simanur Kaya</div>
                <div className="text-[10px] font-mono text-zinc-500">0543 246 06 55</div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href="tel:05432460655"
                  onClick={() => setContactOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ara</span>
                </a>
                <a
                  href="https://wa.me/905432460655?text=Merhaba%20Simanur%20Hanim,%20Ostim%20subenizden%20e-imza%20hakkinda%20bilgi%20almak%20istiyorum."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setContactOpen(false)}
                  className="p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs active:scale-95 transition"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                </a>
              </div>
            </div>

            {/* Cenk Gürses */}
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60 dark:border-zinc-700/40">
              <div>
                <div className="text-[11px] font-bold text-zinc-900 dark:text-white">Cenk Gürses</div>
                <div className="text-[10px] font-mono text-zinc-500">0541 287 06 55</div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href="tel:05412870655"
                  onClick={() => setContactOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ara</span>
                </a>
                <a
                  href="https://wa.me/905412870655?text=Merhaba%20Cenk%20Bey,%20Ostim%20subenizden%20e-imza%20hakkinda%20bilgi%20almak%20istiyorum."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setContactOpen(false)}
                  className="p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs active:scale-95 transition"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Working Hours Mini Badge */}
        <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>09:00 – 17:00 (Hafta İçi)</span>
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">15 Dk Elden Teslim</span>
        </div>
      </div>

      {/* Main Mobile Bottom Bar */}
      <nav 
        aria-label="Mobil Alt Navigasyon"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800/80 px-2 py-2 shadow-2xl safe-area-bottom"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center gap-1">
          
          {/* 1. Home */}
          <a
            href="#hero"
            onClick={() => setContactOpen(false)}
            className="flex flex-col items-center justify-center gap-1 py-1 px-1.5 w-full text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">Ana Sayfa</span>
          </a>

          {/* 2. Packages & Pricing */}
          <a
            href="#fiyatlar"
            onClick={() => setContactOpen(false)}
            className="flex flex-col items-center justify-center gap-1 py-1 px-1.5 w-full text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition"
          >
            <PackageIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">Fiyatlar</span>
          </a>

          {/* 3. Center Highlight: Hemen Başvur */}
          <button
            onClick={() => {
              setContactOpen(false);
              onOpenApply();
            }}
            className="flex flex-col items-center justify-center -mt-4 group cursor-pointer focus:outline-none"
            aria-label="Hemen E-İmza Başvurusu Yap"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 group-hover:scale-105 active:scale-95 transition-all border-2 border-white dark:border-zinc-900">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1 leading-none">
              Başvur
            </span>
          </button>

          {/* 4. Application Track */}
          <button
            onClick={() => {
              setContactOpen(false);
              onOpenTrack();
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 px-1.5 w-full text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition cursor-pointer"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">Takip</span>
          </button>

          {/* 5. Contact / İletişim (Toggles popover with Phone & WhatsApp) */}
          <button
            onClick={() => setContactOpen(!contactOpen)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-1.5 w-full transition cursor-pointer ${
              contactOpen 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400'
            }`}
          >
            <div className="relative">
              <PhoneCall className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <span className="text-[10px] font-medium leading-none">İletişim</span>
          </button>

        </div>
      </nav>
    </>
  );
};
