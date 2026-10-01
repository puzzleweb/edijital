import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface AboutSectionProps {
  settings: SiteSettings;
  onOpenApply: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings, onOpenApply }) => {
  return (
    <section id="hakkimizda" className="relative py-18 md:py-24 bg-gradient-to-b from-white via-blue-50/20 to-white dark:from-zinc-950 dark:via-blue-950/15 dark:to-zinc-950 border-t border-slate-200/80 dark:border-zinc-800/80 overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-5 w-[480px] h-[480px] bg-gradient-to-br from-blue-500/10 to-sky-400/5 dark:from-blue-600/15 dark:to-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-[380px] h-[380px] bg-gradient-to-tr from-cyan-400/8 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Linear Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 113, 227, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 113, 227, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 50%, #000 45%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 50%, #000 45%, transparent 100%)'
        }}
      />

      {/* Subtle Corporate Watermark Decorative Elements */}
      <div className="absolute top-12 left-10 pointer-events-none opacity-[0.03] dark:opacity-[0.04]">
        <svg className="w-48 h-48 text-blue-900 dark:text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <div className="absolute bottom-8 right-16 pointer-events-none opacity-[0.03] dark:opacity-[0.04]">
        <svg className="w-40 h-40 text-blue-900 dark:text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              Hakkımızda
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
              {settings.aboutTitle || 'ARKSİGNER E-İMZA YETKİLİ İŞ ORTAĞI'} <br />
              <span className="text-blue-600 dark:text-blue-400">{settings.companyName}</span>
            </h2>

            <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                {settings.aboutP1 || 'Firmamız, güvenli e imza çözümleri alanında hızlı ve güvenilir hizmet sunmak amacıyla kurulmuştur. Arkimza’nın bayisi olarak, yasal mevzuatlara uygun, kaliteli ve sürdürülebilir elektronik imza hizmetleri ile müşterilerimize en doğru şekilde ulaşmayı hedefliyoruz.'}
              </p>

              <p>
                {settings.aboutP2 || 'Ankara genelinde hemen teslim, yerinde teslim ve mağaza teslim seçeneklerimizle, zaman kaybetmeden e-İmzanıza ulaşmanızı sağlıyoruz. İhtiyacınıza göre adresinize gelerek teslimat yapıyor veya mağazamızdan elden teslim imkânı sunuyoruz.'}
              </p>

              <p>
                {settings.aboutP3 || 'Böylece hem bireysel hem de kurumsal müşteriler için hızlı, pratik ve güvenli bir süreç oluşturuyoruz. Müşteri memnuniyetini ön planda tutan yaklaşımımızla; satış öncesi bilgilendirme, kurulum desteği ve satış sonrası teknik destek hizmetlerini eksiksiz sunuyoruz.'}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenApply}
                className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
              >
                <span>E-İmza Başvurusu Yap</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:${settings.phone}`}
                className="px-5 py-3 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition"
              >
                Bilgi Al: {settings.phoneDisplay}
              </a>
            </div>
          </div>

          {/* Right Column: Direct Seamless Graphic (No card appearance) */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-lg mx-auto">
              <img
                src="/real_images/arksigner_partner.png"
                alt="ArkSigner E-İmza USB Token Çözümleri"
                className="w-full h-auto object-contain select-none"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
