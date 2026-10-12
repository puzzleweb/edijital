import React from 'react';
import { Phone, Mail, MapPin, Lock, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../types';
import { LegalDocSlug } from '../pages/LegalPage';

interface FooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  onOpenTrack: () => void;
  onOpenApply: () => void;
  onNavigateToLegal?: (slug: LegalDocSlug) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenAdmin,
  onOpenTrack,
  onOpenApply,
  onNavigateToLegal
}) => {
  const handleLegalClick = (e: React.MouseEvent, slug: LegalDocSlug) => {
    e.preventDefault();
    if (onNavigateToLegal) {
      onNavigateToLegal(slug);
    } else {
      window.location.href = `/${slug}`;
    }
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
                <a href="#iletisim" className="hover:text-blue-600 transition">İletişim & Şubeler</a>
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
                <button onClick={onOpenApply} className="hover:text-blue-600 transition text-left cursor-pointer">
                  1 Yıllık E-İmza Paketi
                </button>
              </li>
              <li>
                <button onClick={onOpenApply} className="hover:text-blue-600 transition text-left cursor-pointer">
                  3 Yıllık E-İmza Paketi
                </button>
              </li>
              <li>
                <button onClick={onOpenApply} className="hover:text-blue-600 transition text-left cursor-pointer">
                  Kurumsal E-İmza Çözümleri
                </button>
              </li>
              <li>
                <button onClick={onOpenApply} className="hover:text-blue-600 transition text-left cursor-pointer">
                  Ankara Adrese Yerinde Teslimat
                </button>
              </li>
              <li>
                <button onClick={onOpenTrack} className="text-blue-600 font-semibold hover:underline text-left cursor-pointer">
                  Başvuru Durumu Takip Et
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
              Güvenlik & Yasal Bilgi
            </h4>
            <div className="space-y-3 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>256-Bit SSL & 3D Secure Koruması</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                5070 Sayılı Elektronik İmza Kanunu kapsamında üretilen e-imzalar ıslak imza ile aynı hukuki geçerliliğe sahiptir.
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                ArkSigner Yetkili İş Ortaklığı ile güvenli, hızlı ve anında teslimat.
              </div>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            {settings.copyrightText || `Telif Hakkı © ${new Date().getFullYear()} ${settings.companyName} - Tüm Hakları Saklıdır.`}
          </div>
          
          {/* Legal / Contract Links - Standalone Pages */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3.5 gap-y-2 text-xs">
            <a
              href="/mesafeli-satis-sozlesmesi"
              onClick={(e) => handleLegalClick(e, 'mesafeli-satis-sozlesmesi')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Mesafeli Satış Sözleşmesi
            </a>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <a
              href="/on-bilgilendirme-formu"
              onClick={(e) => handleLegalClick(e, 'on-bilgilendirme-formu')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Ön Bilgilendirme Formu
            </a>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <a
              href="/kvkk-aydinlatma-metni"
              onClick={(e) => handleLegalClick(e, 'kvkk-aydinlatma-metni')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              KVKK Aydınlatma Metni
            </a>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <a
              href="/gizlilik-politikasi"
              onClick={(e) => handleLegalClick(e, 'gizlilik-politikasi')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Gizlilik ve Güvenlik
            </a>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <a
              href="/iptal-ve-iade-kosullari"
              onClick={(e) => handleLegalClick(e, 'iptal-ve-iade-kosullari')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Teslimat, İptal ve İade
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
