import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageSquare, 
  X, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { SiteSettings } from '../types';

interface WelcomeInfoModalProps {
  settings: SiteSettings;
  onExplorePackages?: () => void;
}

export const WelcomeInfoModal: React.FC<WelcomeInfoModalProps> = ({
  settings,
  onExplorePackages
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if the user already dismissed the welcome popup in this session
    try {
      const alreadySeen = sessionStorage.getItem('edijital_welcome_popup_seen');
      if (!alreadySeen) {
        // Open smoothly after a short delay for great user experience
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('edijital_welcome_popup_seen', 'true');
    } catch {
      // ignore
    }
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('05459603303');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExplore = () => {
    handleClose();
    if (onExplorePackages) {
      onExplorePackages();
    } else {
      const elem = document.getElementById('fiyatlar') || document.getElementById('paketler');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!isOpen) return null;

  const phoneNumber = '0545 960 33 03';
  const phoneTel = '05459603303';
  const whatsappUrl = 'https://wa.me/905459603303?text=Merhaba,%20e-imza%20hakk%C4%B1nda%20bilgi%20ve%20fiyat%20almak%20istiyorum.';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-info-title"
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl shadow-blue-900/20 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Decorative Gradients */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-600/15 via-indigo-500/5 to-transparent pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 transition-colors shadow-xs"
          title="Kapat"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-6 sm:p-8 space-y-6">
          {/* Header Badge & Brand */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Resmi E-İmza Bilgi & Başvuru Hattı</span>
            </div>

            <h3 
              id="welcome-info-title"
              className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-snug"
            >
              E-İmza İçin Bilgi Alın
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Bireysel ve kurumsal e-imza başvurularınız, avantajlı fiyatlar ve 15 dakikada anında teslimat için uzman danışmanımıza hemen ulaşın.
            </p>
          </div>

          {/* Prominent Phone Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-emerald-500/10 border-2 border-blue-500/30 dark:border-blue-400/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Müşteri Danışmanı Aktif
              </span>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="text-[11px] font-medium text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition"
                title="Numarayı Kopyala"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <a
                href={`tel:${phoneTel}`}
                className="font-mono text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                {phoneNumber}
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <a
                href={`tel:${phoneTel}`}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition transform active:scale-98"
              >
                <Phone className="w-4 h-4" />
                <span>Hemen Ara</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition transform active:scale-98"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp İle Yaz</span>
              </a>
            </div>
          </div>

          {/* Key Advantages Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>15 Dakikada Ofisten Teslim</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>5070 Sayılı Kanuna Uygun</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>UYAP, e-Devlet & EKAP Uyumlu</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Kurulum & Teknik Destek Dahil</span>
            </div>
          </div>

          {/* Bottom Secondary Action */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={handleExplore}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Paket ve Fiyatları İncele</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium"
            >
              Siteye Devam Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
