import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Phone,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  FileCheck2,
  Clock,
  MapPin
} from 'lucide-react';
import { SiteSettings } from '../types';

interface HeaderProps {
  settings: SiteSettings;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenApply: () => void;
  onOpenTrack: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  darkMode,
  onToggleDarkMode,
  onOpenApply,
  onOpenTrack,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Ana Sayfa', href: '#hero' },
    { name: 'E-İmza Fiyatları', href: '#fiyatlar' },
    { name: 'Neden Biz?', href: '#avantajlar' },
    { name: 'Kullanım Alanları', href: '#uyumluluk' },
    { name: 'Hakkımızda', href: '#hakkimizda' },
    { name: 'İletişim', href: '#iletisim' },
  ];

  return (
    <>
      <header className="w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 py-3.5 sm:py-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Real Brand Logo */}
          <a href="#hero" className="flex items-center gap-3">
            <img
              src="/real_images/logo.png"
              alt="E-DİJİTAL FİNANS"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white">
                {settings.companyName || 'E-DİJİTAL FİNANS'}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-600 dark:text-blue-400">
                {settings.headerTagline || settings.officialPartner || 'ArkSigner & Arkimza İş Ortağı'}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-black dark:hover:text-white transition"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">

            {/* Direct Phone */}
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-blue-600 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{settings.phoneDisplay}</span>
            </a>

            {/* Application Track Button */}
            {settings.headerShowTrack && (
              <button
                onClick={onOpenTrack}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
              >
                Başvuru Takip
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Tema Değiştir"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Apply Action Button */}
            {settings.headerShowApply && (
              <button
                onClick={onOpenApply}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-98 transition cursor-pointer"
              >
                Hemen Başvur
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Menüyü Aç"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Render Mobile Sidebar in a Portal directly on document.body so it is never clipped or transparent */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[99990] transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
          />

          {/* Solid Slide-Over Sidebar Drawer from Left */}
          <div
            className={`fixed inset-y-0 left-0 z-[99999] w-[320px] max-w-[85vw] h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            style={{ backgroundColor: darkMode ? '#09090b' : '#ffffff' }}
          >
            <div>
              {/* Drawer Top / Header */}
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-zinc-100 dark:border-zinc-850">
                <div className="flex items-center gap-3">
                  <img
                    src="/real_images/logo.png"
                    alt="E-DİJİTAL FİNANS"
                    className="h-8 w-auto object-contain"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                      {settings.companyName || 'E-DİJİTAL FİNANS'}
                    </span>
                    <span className="text-[9px] uppercase font-semibold text-blue-600 dark:text-blue-400">
                      {settings.headerTagline || 'ArkSigner Yetkili İş Ortağı'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  aria-label="Menüyü Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenApply();
                  }}
                  className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center shadow-sm active:scale-98 transition cursor-pointer"
                >
                  Hemen Başvur
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTrack();
                  }}
                  className="py-3 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold text-center transition cursor-pointer"
                >
                  Başvuru Takip
                </button>
              </div>

              {/* Navigation Links */}
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 px-1">
                Menü
              </div>
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </a>
                ))}
              </nav>
            </div>

            {/* Drawer Footer - Branches & Direct Calls */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1 font-semibold">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  <span>Şubelerimiz & Hızlı Arama</span>
                </span>
                <span className="text-[10px] text-zinc-400">09:00 – 17:00</span>
              </div>

              {/* 1. Eryaman Branch */}
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span>Eryaman Şubesi</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">1.TBMM Cad. Etimesgut</div>
                </div>
                <a
                  href="tel:05459603303"
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>0545 960 33 03</span>
                </a>
              </div>

              {/* 2. Ostim Branch */}
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>Ostim Şubesi</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Prestij Plaza Kat:2</span>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5">
                  <a
                    href="tel:05432460655"
                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 text-center"
                    title="Simanur Kaya: 0543 246 06 55"
                  >
                    <Phone className="w-2.5 h-2.5 shrink-0 text-emerald-600" />
                    <span className="truncate">0543 246 06 55</span>
                  </a>
                  <a
                    href="tel:05412870655"
                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 text-center"
                    title="Cenk Gürses: 0541 287 06 55"
                  >
                    <Phone className="w-2.5 h-2.5 shrink-0 text-emerald-600" />
                    <span className="truncate">0541 287 06 55</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};
