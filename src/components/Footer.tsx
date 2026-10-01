import React, { useState } from 'react';
import { Phone, Mail, MapPin, Lock, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../types';
import { LegalModal, LegalDocType } from './LegalModal';

interface FooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  onOpenTrack: () => void;
  onOpenApply: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenAdmin,
  onOpenTrack,
  onOpenApply
}) => {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>('kvkk');

  const handleOpenLegal = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    setLegalModalOpen(true);
  };
  return (
    <footer className="bg-zinc-50 dark:bg-black text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-16 pb-12 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-zinc-200 dark:border-zinc-800">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/real_images/logo.png" 
                alt="E-DİJİTAL FİNANS" 
                className="h-8 w-auto object-contain"
              />
              <span className="font-bold text-base text-zinc-900 dark:text-white tracking-tight">
                {settings.companyName}
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {settings.footerAbout || 'Arkimza ve ArkSigner yetkili iş ortağı olarak Ankara genelinde hızlı, güvenilir ve yasal mevzuata uygun e-İmza çözümleri sunuyoruz.'}
            </p>

            <div className="pt-1 text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{settings.address}, {settings.addressDetail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-blue-600 font-semibold">{settings.phoneDisplay}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-blue-600">{settings.email}</a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
              Hızlı Menü
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-blue-600 transition">Ana Sayfa</a>
              </li>
              <li>
                <a href="#fiyatlar" className="hover:text-blue-600 transition">E-İmza Fiyatları</a>
              </li>
              <li>
                <a href="#avantajlar" className="hover:text-blue-600 transition">Neden Biz?</a>
              </li>
              <li>
                <a href="#uyumluluk" className="hover:text-blue-600 transition">Kullanım Alanları (UYAP, EKAP)</a>
              </li>
              <li>
                <a href="#hakkimizda" className="hover:text-blue-600 transition">Hakkımızda</a>
              </li>
              <li>
                <a href="#iletisim" className="hover:text-blue-600 transition">İletişim</a>
              </li>
            </ul>
          </div>

          {/* Packages */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
              E-İmza Hizmetleri
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenApply} className="hover:text-blue-600 transition text-left">
                  1 Yıllık E-İmza Paketi
                </button>
              </li>
              <li>
                <button onClick={onOpenApply} className="hover:text-blue-600 transition text-left">
                  3 Yıllık E-İmza Paketi
                </button>
              </li>
              <li>
                <button onClick={onOpenApply} className="hover:text-blue-600 transition text-left">
                  Kurumsal E-İmza Çözümleri
                </button>
              </li>
              <li>
                <button onClick={onOpenApply} className="hover:text-blue-600 transition text-left">
                  Ankara Adrese Yerinde Teslimat
                </button>
              </li>
              <li>
                <button onClick={onOpenTrack} className="text-blue-600 font-semibold hover:underline text-left">
                  Başvuru Durumu Takip Et
                </button>
              </li>
            </ul>
          </div>

          {/* Admin and Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
              Yönetim & Kurumsal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200 hover:text-blue-600"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Yönetici Paneli Girişi</span>
                </button>
              </li>
              <li className="text-[11px] text-zinc-500 pt-2 leading-relaxed">
                5070 Sayılı Elektronik İmza Kanunu kapsamında üretilen e-imzalar ıslak imza ile aynı hukuki geçerliliğe sahiptir.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            {settings.copyrightText || `Telif Hakkı © ${new Date().getFullYear()} ${settings.companyName} - Tüm Hakları Saklıdır.`}
          </div>
          
          {/* Legal / Contract Links */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3.5 gap-y-2 text-xs">
            <button
              onClick={() => handleOpenLegal('kvkk')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              KVKK Aydınlatma Metni
            </button>
            <span className="text-zinc-300 dark:text-zinc-750 hidden sm:inline">•</span>
            <button
              onClick={() => handleOpenLegal('mesafeli-satis')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Mesafeli Satış Sözleşmesi
            </button>
            <span className="text-zinc-300 dark:text-zinc-750 hidden sm:inline">•</span>
            <button
              onClick={() => handleOpenLegal('gizlilik')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Gizlilik & Güvenlik
            </button>
            <span className="text-zinc-300 dark:text-zinc-750 hidden sm:inline">•</span>
            <button
              onClick={() => handleOpenLegal('teslimat-iade')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Teslimat & İade
            </button>
          </div>
        </div>

      </div>

      {/* Legal Contract Policy Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        settings={settings}
        initialDoc={activeLegalDoc}
      />
    </footer>
  );
};
