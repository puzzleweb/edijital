import React from 'react';
import { Clock, ShieldCheck, Laptop } from 'lucide-react';
import { SiteSettings } from '../types';

interface FeaturesBentoProps {
  settings: SiteSettings;
  onOpenApply: () => void;
}

export const FeaturesBento: React.FC<FeaturesBentoProps> = ({ settings }) => {
  return (
    <section id="avantajlar" className="py-14 md:py-20 bg-slate-50 dark:bg-zinc-950 border-y border-slate-200/80 dark:border-zinc-800/80">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2.5 inline-block">
            Neden Biz?
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Neden E-DİJİTAL FİNANS?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            ArkSigner yetkili iş ortağı güvencesiyle 15 dakikada elden teslimat veya adrese yerinde kurulum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Item 1 */}
          <div className="relative overflow-hidden p-6 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition">
            <div className="relative z-10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                15 Dakikada Teslimat
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed pr-6">
                Mağazamızdan hemen 15 dakikada elden teslim veya Ankara içi adresinize yerinde teslimat ve kimlik onayı.
              </p>
            </div>
            <Clock className="absolute -right-3 -bottom-3 w-24 h-24 text-blue-500/10 dark:text-blue-400/10 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          </div>

          {/* Item 2 */}
          <div className="relative overflow-hidden p-6 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition">
            <div className="relative z-10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                %100 Yasal Geçerlilik
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed pr-6">
                5070 Sayılı Kanun ve BTK onaylı ArkSigner altyapısı. UYAP, EKAP, MERSİS ve e-Devlet ile tam uyumlu.
              </p>
            </div>
            <ShieldCheck className="absolute -right-3 -bottom-3 w-24 h-24 text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          </div>

          {/* Item 3 */}
          <div className="relative overflow-hidden p-6 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition">
            <div className="relative z-10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                USB Token & Kurulum Dahil
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed pr-6">
                Yeni nesil tak-çalıştır USB Token donanımı fiyata dahildir. Uzaktan kurulum ve teknik destek ücretsizdir.
              </p>
            </div>
            <Laptop className="absolute -right-3 -bottom-3 w-24 h-24 text-purple-500/10 dark:text-purple-400/10 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          </div>

        </div>

      </div>
    </section>
  );
};
