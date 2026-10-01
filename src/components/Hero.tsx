import React from 'react';
import { 
  ArrowRight, 
  Phone, 
  Check, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  Package as PackageIcon,
  Lock,
  KeyRound,
  FileSignature,
  Cpu,
  Sparkles,
  Shield
} from 'lucide-react';
import { SiteSettings, Package } from '../types';

interface HeroProps {
  settings: SiteSettings;
  packages: Package[];
  onOpenApply: (pkg?: Package) => void;
  onOpenTrack: (prefillCode?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, packages, onOpenApply }) => {
  return (
    <section id="hero" className="relative min-h-[calc(100svh-68px)] md:min-h-[calc(100svh-104px)] flex items-center py-8 md:py-12 bg-white dark:bg-black border-b border-slate-150 dark:border-zinc-900 overflow-hidden">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 -right-24 w-[450px] md:w-[650px] h-[450px] md:h-[650px] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent dark:from-blue-600/25 dark:via-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] md:w-[550px] h-[400px] md:h-[550px] bg-gradient-to-tr from-sky-400/12 via-blue-500/8 to-transparent dark:from-sky-500/18 dark:via-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Tech Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 113, 227, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 113, 227, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 85% 70% at 50% 50%, #000 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 50%, #000 50%, transparent 100%)'
        }}
      />

      {/* Concentric Circuit Rings Behind Product */}
      <svg
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-[0.12] dark:opacity-[0.08] hidden lg:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="400" cy="400" r="180" fill="none" stroke="#0080c8" strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="400" cy="400" r="280" fill="none" stroke="#0080c8" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="400" cy="400" r="370" fill="none" stroke="#0080c8" strokeWidth="1" strokeDasharray="10 14" />
      </svg>

      {/* Floating Decorative Watermark Icons - Ultra Soft & Light */}
      <div className="absolute top-10 left-6 md:left-20 text-blue-600 dark:text-blue-400 opacity-[0.05] dark:opacity-[0.07] pointer-events-none -rotate-12">
        <FileSignature className="w-40 h-40 md:w-56 md:h-56" strokeWidth={0.75} />
      </div>

      <div className="absolute bottom-6 left-1/3 text-blue-600 dark:text-blue-400 opacity-[0.04] dark:opacity-[0.06] pointer-events-none rotate-45 hidden sm:block">
        <KeyRound className="w-28 h-28 md:w-36 md:h-36" strokeWidth={0.75} />
      </div>

      <div className="absolute top-6 right-10 md:right-28 text-blue-600 dark:text-blue-400 opacity-[0.05] dark:opacity-[0.07] pointer-events-none rotate-12">
        <ShieldCheck className="w-36 h-36 md:w-48 md:h-48" strokeWidth={0.75} />
      </div>

      <div className="absolute bottom-8 right-1/4 text-blue-600 dark:text-blue-400 opacity-[0.04] dark:opacity-[0.06] pointer-events-none -rotate-6 hidden md:block">
        <Cpu className="w-32 h-32" strokeWidth={0.75} />
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Concise Direct Information */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            
            <div className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-900 dark:text-white">
                {settings.heroBadge || 'ArkSigner Yetkili İş Ortağı | Ankara İçi 15 Dk Teslim'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] text-center lg:text-left">
              {settings.heroTitle || 'Hızlı, Güvenilir ve Resmi E-İmza Hizmeti'}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              {settings.heroSubtitle || '5070 Sayılı Kanun kapsamında %100 yasal geçerli Nitelikli Elektronik Sertifika (NES). Ostim ofisimizden 15 dakikada elden teslim alın veya Ankara genelinde adrese teslim kurye hizmetimizden yararlanın.'}
            </p>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-2 w-full lg:w-auto">
              <button
                onClick={() => onOpenApply()}
                className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{settings.heroButtonText || 'Hemen E-İmza Başvurusu'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:${settings.phone}`}
                className="px-4 sm:px-4.5 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-2 transition active:scale-98 shadow-xs whitespace-nowrap shrink-0"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{settings.phoneDisplay}</span>
              </a>

              <a
                href="#fiyatlar"
                className="px-4 sm:px-4.5 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-2 transition active:scale-98 shadow-xs whitespace-nowrap shrink-0"
              >
                <PackageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{settings.heroSecondaryButtonText || 'Paket Fiyatlarını Gör'}</span>
              </a>
            </div>

            {/* Value Checkmarks */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-xs text-slate-700 dark:text-zinc-300 w-full">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5] shrink-0" />
                <span>15 Dakikada Hızlı Teslimat</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5] shrink-0" />
                <span>USB Token Donanımı Dahil</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5] shrink-0" />
                <span>UYAP & e-Devlet %100 Uyumlu</span>
              </div>
            </div>

          </div>

          {/* Right: Direct Product Visual (No Card Frame) */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <img 
              src="/real_images/hero_banner.png" 
              alt="ArkSigner E-İmza Token Donanımları"
              className="w-full h-auto max-h-[500px] object-contain"
            />
          </div>

        </div>

      </div>
    </section>
  );
};
