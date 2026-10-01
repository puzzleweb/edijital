import React from 'react';
import {
  Briefcase,
  Gavel,
  Building,
  FileText,
  Stethoscope,
  Landmark,
  MailCheck,
  Globe2
} from 'lucide-react';

export const CompatibilityGrid: React.FC = () => {
  const portals = [
    {
      title: 'UYAP Portalı',
      category: 'Hukuk & Yargı',
      icon: Gavel,
      description: 'Avukatlar, arabulucular, bilirkişiler ve vatandaşlar için dava açma, evrak imzalama ve dosya takibi.'
    },
    {
      title: 'EKAP Kamu İhaleleri',
      category: 'İhale & Kamu',
      icon: Briefcase,
      description: 'Kamu ihalelerine teklif verme, e-ihale dokümanlarını onaylama ve sözleşme imzalama.'
    },
    {
      title: 'MERSİS & Ticaret Sicil',
      category: 'Şirket İşlemleri',
      icon: Building,
      description: 'Şirket kuruluşu, hisse devirleri, genel kurul ve imza sirküleri tescil işlemleri.'
    },
    {
      title: 'KEP Kayıtlı E-Posta',
      category: 'Resmi Yazışma',
      icon: MailCheck,
      description: 'Yasal geçerli elektronik tebligat alma ve resmi kurumlarla delil niteliğinde yazışma.'
    },
    {
      title: 'e-Devlet & Kamu Portalları',
      category: 'Genel Kamu',
      icon: Globe2,
      description: 'Tüm bakanlıklar, e-Devlet kapısı, SGK, Çevre ve Şehircilik portallarına güvenli giriş.'
    },
    {
      title: 'Sağlık & e-Reçete (MEDULA)',
      category: 'Sağlık Sektörü',
      icon: Stethoscope,
      description: 'Hekimler, diş hekimleri ve sağlık kuruluşları için güvenli e-reçete ve rapor onayı.'
    },
    {
      title: 'GİB e-Fatura & e-Defter',
      category: 'Maliye & Muhasebe',
      icon: FileText,
      description: 'Mali müşavirler ve şirketler için e-defter berat yükleme ve e-fatura mühürleme.'
    },
    {
      title: 'Bankacılık & Finans',
      category: 'Finansal İşlemler',
      icon: Landmark,
      description: 'Kurumsal bankacılık talimatları, kredi sözleşmeleri ve dijital finansal işlemler.'
    },
  ];

  return (
    <section id="uyumluluk" className="relative py-16 md:py-24 bg-slate-50/70 dark:bg-zinc-950 border-y border-slate-200/80 dark:border-zinc-800/80 overflow-hidden">
      {/* Geometric Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-70 dark:opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 50%, transparent 100%)'
        }}
      />

      {/* Subtle Dot Matrix Accent */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 128, 200, 0.25) 1.2px, transparent 1.2px)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* Ambient Blue Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/5 dark:bg-blue-600/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 block">
            Tam Sistem Uyumluluğu
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Tüm Kamu ve Özel Sistemlerde %100 Geçerli
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">
            E-DİJİTAL FİNANS üzerinden edineceğiniz ArkSigner elektronik imzalar Türkiye'deki tüm resmi platformlarla tam entegredir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {portals.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition hover:border-slate-300 dark:hover:border-zinc-700"
              >
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed pr-4">
                    {item.description}
                  </p>
                </div>

                <Icon className="absolute -right-2 -bottom-2 w-20 h-20 text-slate-400/10 dark:text-zinc-400/10 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
