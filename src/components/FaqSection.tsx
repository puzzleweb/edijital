import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { SiteSettings } from '../types';

interface FaqSectionProps {
  settings?: SiteSettings;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ settings }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const fallbackFaqs = [
    {
      question: 'E-İmza (Elektronik İmza) nedir ve hukuki geçerliliği nedir?',
      answer: 'Elektronik İmza, 5070 Sayılı Elektronik İmza Kanunu uyarınca ıslak imza ile tamamen aynı hukuki geçerliliğe sahip olan sayısal kimlik doğrulama aracıdır. Kamusal ve özel tüm sözleşmelerde, UYAP dava dosyalarında, EKAP ihalelerinde ve bankacılık talimatlarında resmi imzanız yerine geçer.'
    },
    {
      question: 'Ankara genelinde teslimat ne kadar sürer? Hemen teslim alabilir miyim?',
      answer: 'Evet! Ostim mağazamıza geldiğinizde sadece 15 dakika içinde e-imzanız hazırlanıp elden teslim edilir. Ayrıca Ankara içi adrese teslimat seçeneğimizle, kuryemiz ofisinize veya evinize gelerek kimlik doğrulamanızı yapar ve e-imzanızı hemen teslim eder.'
    },
    {
      question: 'E-İmza başvurusu için hangi evraklar gereklidir?',
      answer: 'Bireysel E-İmza için sadece T.C. Kimlik Kartınızın (veya Pasaport/Ehliyet) aslı yeterlidir. Kurumsal E-İmza için ise T.C. Kimlik Kartı, İmza Sirküleri fotokopisi, güncel Faaliyet Belgesi ve Vergi Levhası gerekmektedir.'
    },
    {
      question: 'UYAP, EKAP, MERSİS ve KEP sistemlerinde hemen çalışır mı?',
      answer: 'Kesinlikle evet. E-DİJİTAL FİNANS üzerinden sağlanan ArkSigner nitelikli elektronik sertifikaları, Türkiye’deki tüm yargı, kamu, bankacılık ve ticaret portallarıyla %100 uyumludur.'
    },
    {
      question: 'Mac (Apple macOS) ve Windows bilgisayarlarla uyumlu mu?',
      answer: 'Evet, sağladığımız yeni nesil USB token donanımları hem Apple macOS (M1/M2/M3/M4 ve Intel işlemcili tüm Mac cihazlar), hem Windows 10/11, hem de Linux dağıtımları ile sorunsuz ve tak-çalıştır şeklinde çalışmaktadır.'
    },
    {
      question: 'Kurulum ve sürücü ayarlarında yardımcı oluyor musunuz?',
      answer: 'Evet, tüm müşterilerimize ücretsiz satış sonrası kurulum desteği sunuyoruz. Dilerseniz yerinde teslimatta ekibimiz bilgisayarınıza kurar, dilerseniz uzaktan bağlantı programı (AnyDesk/TeamViewer) ile UYAP, Java ve tarayıcı ayarlarınızı birkaç dakikada tamamlarız.'
    },
    {
      question: 'E-İmza süreleri kaç yıldır ve süre bitiminde ne yapılır?',
      answer: 'E-İmzalar 1 Yıllık veya 3 Yıllık olarak üretilir. Süre bitimine yakın tarafınıza bilgilendirme yapılır ve dilerseniz mevcut USB token cihazınız değiştirilmeden sadece sertifika yenilemesi yapılarak süreç hızlıca uzatılır.'
    }
  ];

  const faqs = settings?.faqs && settings.faqs.length > 0 ? settings.faqs : fallbackFaqs;

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="sss" className="py-20 md:py-28 relative bg-gradient-to-b from-slate-100/90 via-indigo-50/20 to-slate-100/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 border-t border-slate-200/80 dark:border-zinc-800/80 overflow-hidden">
      
      {/* Distinct Indigo & Purple Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-gradient-to-r from-indigo-500/12 via-purple-500/8 to-blue-500/10 dark:from-indigo-600/18 dark:via-purple-600/12 dark:to-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-[360px] h-[360px] bg-purple-500/8 dark:bg-purple-600/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-8 w-[300px] h-[300px] bg-indigo-500/8 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Distinct Dot Matrix Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-25"
        style={{
          backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.22) 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 50%, #000 45%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 50%, #000 45%, transparent 100%)'
        }}
      />

      {/* Faint FAQ Watermark Icons */}
      <div className="absolute top-16 right-12 pointer-events-none opacity-[0.035] dark:opacity-[0.045]">
        <svg className="w-52 h-52 text-indigo-900 dark:text-indigo-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <div className="absolute bottom-12 left-10 pointer-events-none opacity-[0.03] dark:opacity-[0.04]">
        <svg className="w-44 h-44 text-indigo-900 dark:text-indigo-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Section Header */}
          <div className="text-center mb-14">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 inline-block">
              Merak Edilenler
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
              {settings?.faqTitle || 'Sıkça Sorulan Sorular'}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-400">
              {settings?.faqSubtitle || 'E-İmza süreci, fiyatlandırma, kurulum ve teslimat hakkında aklınıza takılan tüm soruların yanıtları.'}
            </p>
          </div>

          {/* Accordion Container */}
          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                    isOpen
                      ? 'border-indigo-400/60 dark:border-indigo-500/60 bg-white dark:bg-zinc-900 shadow-md ring-2 ring-indigo-500/10'
                      : 'border-gray-200/80 dark:border-zinc-800/80 bg-white/95 hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base pr-2">{faq.question}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen 
                        ? 'rotate-180 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400' 
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed border-t border-gray-100 dark:border-zinc-800/60 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
