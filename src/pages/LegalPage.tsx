import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  ArrowLeft, 
  Printer, 
  Share2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Scale, 
  ExternalLink,
  ChevronRight,
  Home
} from 'lucide-react';
import { SiteSettings } from '../types';
import { Header } from '../components/Header';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Footer } from '../components/Footer';
import { DEFAULT_LEGAL_DOCS_DATA, interpolateLegalPlaceholders } from '../data/defaultLegalDocs';

export type LegalDocSlug = 
  | 'mesafeli-satis-sozlesmesi' 
  | 'on-bilgilendirme-formu' 
  | 'kvkk-aydinlatma-metni' 
  | 'gizlilik-politikasi' 
  | 'iptal-ve-iade-kosullari' 
  | 'kullanim-kosullari';

interface LegalDocMeta {
  slug: LegalDocSlug;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ElementType;
  badge: string;
}

export const LEGAL_DOCS: LegalDocMeta[] = [
  {
    slug: 'mesafeli-satis-sozlesmesi',
    title: 'Mesafeli Satış Sözleşmesi',
    shortTitle: 'Mesafeli Satış',
    description: '6502 Sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca tarafların hak ve yükümlülükleri.',
    icon: FileText,
    badge: 'Zorunlu Sözleşme'
  },
  {
    slug: 'on-bilgilendirme-formu',
    title: 'Ön Bilgilendirme Formu',
    shortTitle: 'Ön Bilgilendirme',
    description: 'Sipariş öncesi ürün, teslimat, cayma hakkı ve ödeme şartlarına dair yasal bilgilendirme.',
    icon: Scale,
    badge: 'Yasal Form'
  },
  {
    slug: 'kvkk-aydinlatma-metni',
    title: '6698 Sayılı KVKK Aydınlatma Metni',
    shortTitle: 'KVKK Aydınlatma',
    description: 'Kişisel verilerinizin işlenmesi, saklanması ve aktarılmasına ilişkin aydınlatma metni.',
    icon: ShieldCheck,
    badge: 'Veri Güvenliği'
  },
  {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik ve Güvenlik Politikası',
    shortTitle: 'Gizlilik & Güvenlik',
    description: '256-Bit SSL şifreleme, kredi kartı güvenliği ve çerez politikası detayları.',
    icon: Lock,
    badge: 'SSL Korumalı'
  },
  {
    slug: 'iptal-ve-iade-kosullari',
    title: 'Teslimat, İptal ve İade Koşulları',
    shortTitle: 'Teslimat & İade',
    description: '5070 Sayılı Kanun kapsamında sertifika aktivasyonu, donanım garantisi ve cayma hakkı istisnaları.',
    icon: RefreshCw,
    badge: 'Garanti & İade'
  },
  {
    slug: 'kullanim-kosullari',
    title: 'Web Sitesi Kullanım Koşulları',
    shortTitle: 'Kullanım Koşulları',
    description: 'Web sitesi fikri mülkiyet hakları, sorumluluk sınırları ve kullanım şartları.',
    icon: Scale,
    badge: 'Genel Şartlar'
  }
];

interface LegalPageProps {
  settings: SiteSettings;
  darkMode?: boolean;
  cartCount?: number;
  cartTotal?: number;
  onToggleDarkMode?: () => void;
  onOpenCart?: () => void;
  onOpenApply?: () => void;
  onOpenTrack?: () => void;
  onOpenAdmin?: () => void;
  activeSlug?: LegalDocSlug;
  onNavigateToDoc: (slug: LegalDocSlug) => void;
  onBackToHome: () => void;
  onNavigateToCheckout: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  settings,
  darkMode = false,
  cartCount = 0,
  cartTotal = 0,
  onToggleDarkMode = () => {},
  onOpenCart = () => {},
  onOpenApply = () => {},
  onOpenTrack = () => {},
  onOpenAdmin = () => {},
  activeSlug = 'mesafeli-satis-sozlesmesi',
  onNavigateToDoc,
  onBackToHome,
  onNavigateToCheckout
}) => {
  const [currentDoc, setCurrentDoc] = useState<LegalDocSlug>(activeSlug);
  const topNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentDoc(activeSlug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const docMeta = LEGAL_DOCS.find(d => d.slug === activeSlug) || LEGAL_DOCS[0];
    document.title = `${docMeta.title} | ${settings.companyName || 'E-DİJİTAL FİNANS'}`;
  }, [activeSlug, settings.companyName]);

  const handleSelectDoc = (slug: LegalDocSlug) => {
    setCurrentDoc(slug);
    onNavigateToDoc(slug);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeDocMeta = LEGAL_DOCS.find(d => d.slug === currentDoc) || LEGAL_DOCS[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors">
      
      {/* 1. Global Fixed Top Navigation Header */}
      <div ref={topNavRef} className="fixed top-0 left-0 right-0 z-40 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md print:hidden">
        {(settings.sections?.announcement !== false && settings.announcementActive) && (
          <AnnouncementBar
            settings={settings}
            onOpenApply={onOpenApply}
          />
        )}

        <Header
          settings={settings}
          darkMode={darkMode}
          cartCount={cartCount}
          cartTotal={cartTotal}
          onToggleDarkMode={onToggleDarkMode}
          onOpenCart={onOpenCart}
          onOpenApply={onOpenApply}
          onOpenTrack={onOpenTrack}
          onOpenAdmin={onOpenAdmin}
        />
      </div>

      {/* Header Spacer */}
      <div
        style={{ height: 'var(--header-total-height, 68px)' }}
        className="w-full shrink-0 print:hidden"
        aria-hidden="true"
      />

      {/* 2. Breadcrumb & Action Sub-Bar */}
      <section className="bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800/80 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <button
              onClick={onBackToHome}
              className="hover:text-blue-600 flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Ana Sayfa</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Kurumsal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
              {activeDocMeta.title}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-700 transition cursor-pointer"
              title="Sözleşmeyi Yazdır / PDF Olarak Kaydet"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Yazdır / PDF</span>
            </button>

            <button
              onClick={onNavigateToCheckout}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95 cursor-pointer"
            >
              <span>Siparişe Geç</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Sidebar (Desktop Span 4) */}
          <aside className="lg:col-span-4 space-y-4 print:hidden">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Resmi Sözleşmeler
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Sanal POS & BDDK Uyumlu Yasal Metinler
                  </p>
                </div>
              </div>

              <nav className="space-y-1.5" aria-label="Sözleşmeler Menüsü">
                {LEGAL_DOCS.map((doc) => {
                  const Icon = doc.icon;
                  const isSelected = currentDoc === doc.slug;
                  return (
                    <button
                      key={doc.slug}
                      onClick={() => handleSelectDoc(doc.slug)}
                      className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                          : 'bg-slate-50/70 hover:bg-slate-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold leading-tight truncate">
                          {doc.title}
                        </div>
                        <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-zinc-500'}`}>
                          {doc.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Company contact summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-xs space-y-2 text-slate-600 dark:text-zinc-400">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-zinc-200 block">
                  Satıcı & Hizmet Sağlayıcı
                </span>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {settings.companyName}
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{settings.phoneDisplay || settings.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{settings.email}</span>
                </div>
                <div className="flex items-start gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{settings.address}, {settings.district} / {settings.city}</span>
                </div>
              </div>

            </div>
          </aside>

          {/* Right Contract Viewer (Desktop Span 8) */}
          <article className="lg:col-span-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs p-6 sm:p-10 space-y-6">
            
            {/* Document Header */}
            <div className="pb-6 border-b border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{activeDocMeta.badge} • T.C. Mevzuatlarına Tam Uyumlu</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {activeDocMeta.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                {activeDocMeta.description}
              </p>
              <div className="text-[11px] text-slate-400 pt-1 font-mono">
                Son Güncelleme Tarihi: {new Date().toLocaleDateString('tr-TR')} • Versiyon: v2.4 (Sanal POS & NES Uyumlu)
              </div>
            </div>

            {/* Document Dynamic Text Body (Managed via Admin HTML Editor) */}
            <div 
              className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed space-y-6 font-sans legal-document-content prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: interpolateLegalPlaceholders(
                  settings.legalDocuments?.[currentDoc]?.contentHtml || DEFAULT_LEGAL_DOCS_DATA[currentDoc]?.defaultHtml || '',
                  settings
                )
              }}
            />

            {/* Bottom Navigation & Actions */}
            <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 print:hidden">
              <button
                onClick={onBackToHome}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold transition cursor-pointer"
              >
                ← Ana Sayfaya Dön
              </button>

              <button
                onClick={onNavigateToCheckout}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                E-İmza Satın Al & Siparişe Geç →
              </button>
            </div>

          </article>

        </div>
      </main>

      {/* 3. Global Footer */}
      <div className="mt-auto print:hidden">
        <Footer
          settings={settings}
          onOpenAdmin={onOpenAdmin}
          onOpenTrack={onOpenTrack}
          onOpenApply={onOpenApply}
          onNavigateToLegal={handleSelectDoc}
        />
      </div>

    </div>
  );
};
