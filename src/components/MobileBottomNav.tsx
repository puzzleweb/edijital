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
  ChevronUp
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

  // Close contact popover when scrolling fast or clicking outside
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

      {/* Contact Quick Action Sheet / Popover (Opens Upward from Contact Button) */}
      <div 
        className={`fixed left-4 right-4 bottom-20 z-50 md:hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-2xl transition-all duration-300 transform ${
          contactOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100' 
            : 'opacity-0 translate-y-4 pointer-events-none scale-95'
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
              Hızlı İletişim Kanalları
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Uzman temsilcimizle hemen görüşün
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

        <div className="space-y-2.5">
          {/* Direct Phone Call Button */}
          <a
            href={`tel:${settings.phone}`}
            onClick={() => setContactOpen(false)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/70 transition active:scale-98 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-zinc-900 dark:text-white">Telefonla Ara</div>
                <div className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400">{settings.phoneDisplay}</div>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs">
              Hemen Ara
            </span>
          </a>

          {/* WhatsApp Direct Chat Button */}
          <a
            href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20e-imza%20hakkinda%20bilgi%20ve%20fiyat%20almak%20istiyorum.`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setContactOpen(false)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition active:scale-98 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <MessageSquare className="w-4 h-4 fill-current" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-zinc-900 dark:text-white">WhatsApp Destek Hattı</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Anında Canlı Yanıt</div>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs">
              Yazışma Başlat
            </span>
          </a>
        </div>

        {/* Working Hours Mini Badge */}
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Çalışma: {settings.workingHours}</span>
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">15 Dk Teslim</span>
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
