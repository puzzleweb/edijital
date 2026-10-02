import React from 'react';
import {
  Check,
  Zap,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Package, SiteSettings } from '../types';

interface PricingSectionProps {
  packages: Package[];
  settings: SiteSettings;
  onSelectPackage: (pkg: Package) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ packages, settings, onSelectPackage }) => {
  return (
    <section id="fiyatlar" className="relative py-16 md:py-24 bg-white dark:bg-black border-b border-slate-200/80 dark:border-zinc-800/80 overflow-hidden">
      {/* Diagonal Diamond Tech Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(0, 128, 200, 0.08) 0, rgba(0, 128, 200, 0.08) 1px, transparent 0, transparent 36px),
            repeating-linear-gradient(-45deg, rgba(0, 128, 200, 0.08) 0, rgba(0, 128, 200, 0.08) 1px, transparent 0, transparent 36px)
          `,
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 50%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 50%, #000 40%, transparent 100%)'
        }}
      />

      {/* Concentric Circuit Rings */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[650px] pointer-events-none opacity-25 dark:opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="550" cy="325" r="160" fill="none" stroke="#0080c8" strokeWidth="1.2" strokeDasharray="6 6" />
        <circle cx="550" cy="325" r="260" fill="none" stroke="#0080c8" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="550" cy="325" r="360" fill="none" stroke="#0080c8" strokeWidth="1" strokeDasharray="10 14" />
      </svg>

      {/* Ambient Gradient Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/8 dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/8 dark:bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 block">
            Şeffaf Fiyatlar
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            E-İmza Paketleri
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            Tüm paketlerimizde USB Token donanımı ve teknik kurulum desteği fiyata dahildir.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className={`grid grid-cols-1 ${
          packages.length === 1 
            ? 'max-w-md' 
            : packages.length === 2 
              ? 'md:grid-cols-2 max-w-4xl' 
              : 'md:grid-cols-2 lg:grid-cols-3 max-w-6xl'
        } gap-6 mx-auto mb-10`}>
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-2xl p-7 transition flex flex-col justify-between ${pkg.popular
                ? 'bg-slate-900 text-white border-2 border-blue-600 shadow-md relative'
                : 'bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white'
                }`}
            >
              {pkg.popular ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white tracking-wider uppercase">
                  {pkg.badge || 'En Çok Tercih Edilen'}
                </div>
              ) : pkg.badge ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white tracking-wider uppercase">
                  {pkg.badge}
                </div>
              ) : null}

              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`text-lg font-bold ${pkg.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {pkg.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      pkg.category === 'mali_muhur'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : pkg.category === 'kurumsal'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {pkg.category === 'mali_muhur' ? 'MALİ MÜHÜR' : pkg.category ? pkg.category.toUpperCase() : 'BİREYSEL'}
                    </span>
                  </div>
                  <p className={`text-xs ${pkg.popular ? 'text-slate-400' : 'text-slate-500 dark:text-zinc-400'}`}>
                    {pkg.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className={`mb-5 pb-5 border-b ${pkg.popular ? 'border-zinc-800' : 'border-slate-200 dark:border-zinc-800'}`}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight">
                      {pkg.price.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className={`text-xs ${pkg.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                      + KDV / {pkg.duration}
                    </span>
                  </div>
                  {pkg.originalPrice && (
                    <div className="mt-1 text-xs text-slate-400 line-through">
                      Standart: {pkg.originalPrice.toLocaleString('tr-TR')} ₺
                    </div>
                  )}
                  <div className="mt-2 text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> USB Token Donanımı Dahil
                  </div>
                </div>

                {/* Concise Feature List */}
                <div className="space-y-2.5 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <Check className={`w-3.5 h-3.5 shrink-0 stroke-[2.5] ${pkg.popular ? 'text-blue-400' : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      <span className={pkg.popular ? 'text-slate-300' : 'text-slate-600 dark:text-zinc-300'}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => onSelectPackage(pkg)}
                  className={`w-full py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${pkg.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white'
                    }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Hemen Başvur</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Contact Banner */}
        <div className="rounded-xl p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 dark:text-zinc-400">
            Detaylı bilgi ve toplu alımlar için: <strong className="text-slate-900 dark:text-white">{settings.phoneDisplay}</strong>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${settings.phone}`}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>Hemen Ara</span>
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20e-imza%20paketleri%20hakkinda%20bilgi%20almak%20istiyorum.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
