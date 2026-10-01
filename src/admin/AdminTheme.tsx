import React, { useState } from 'react';
import { 
  Palette, 
  Eye, 
  EyeOff, 
  Layout, 
  Sliders, 
  Save, 
  Check, 
  Sparkles, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Layers, 
  Compass, 
  FileText, 
  PhoneCall, 
  CreditCard, 
  Info,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { SiteSettings, FaqItem, SectionVisibility, ThemeConfig } from '../types';
import { StorageService } from '../services/storage';

interface AdminThemeProps {
  settings: SiteSettings;
}

export const AdminTheme: React.FC<AdminThemeProps> = ({ settings }) => {
  const [activeSubTab, setActiveSubTab] = useState<'visibility' | 'header_footer' | 'hero_quickform' | 'about_faq' | 'styling'>('visibility');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [formSettings, setFormSettings] = useState<SiteSettings>(() => {
    return {
      ...settings,
      sections: settings.sections || {
        announcement: settings.announcementActive ?? true,
        hero: true,
        features: true,
        quickForm: true,
        pricing: true,
        compatibility: true,
        about: true,
        faq: true,
        contact: true
      },
      theme: settings.theme || {
        primaryColor: '#0080c8',
        showPatterns: true,
        enableGlow: true,
        cardRadius: 'rounded-2xl'
      },
      headerTagline: settings.headerTagline || settings.officialPartner || 'ArkSigner & Arkimza Yetkili İş Ortağı',
      headerShowTrack: settings.headerShowTrack ?? true,
      headerShowApply: settings.headerShowApply ?? true,
      heroButtonText: settings.heroButtonText || 'E-İmza Başvurusu',
      heroSecondaryButtonText: settings.heroSecondaryButtonText || 'Paketleri İncele',
      quickFormTitle: settings.quickFormTitle || 'E-İmza Satın Al',
      quickFormSubtitle: settings.quickFormSubtitle || 'Ücretsiz ön bilgi ve hızlı başvuru için formu doldurun. Uzmanlarımız 5 dakika içinde arasın.',
      quickFormBadge: settings.quickFormBadge || 'HIZLI FORM',
      quickFormCardTitle: settings.quickFormCardTitle || 'E-İmzanız 15 Dakikada Hazırlansın',
      quickFormCardSubtitle: settings.quickFormCardSubtitle || 'Formu doldurun; ofisimizden hemen teslim alın veya Ankara geneli adresinize getirelim.',
      aboutTitle: settings.aboutTitle || 'ARKSİGNER E-İMZA YETKİLİ İŞ ORTAĞI',
      aboutP1: settings.aboutP1 || 'Firmamız, güvenli e imza çözümleri alanında hızlı ve güvenilir hizmet sunmak amacıyla kurulmuştur. Arkimza’nın bayisi olarak, yasal mevzuatlara uygun, kaliteli ve sürdürülebilir elektronik imza hizmetleri ile müşterilerimize en doğru şekilde ulaşmayı hedefliyoruz.',
      aboutP2: settings.aboutP2 || 'Ankara genelinde hemen teslim, yerinde teslim ve mağaza teslim seçeneklerimizle, zaman kaybetmeden e-İmzanıza ulaşmanızı sağlıyoruz. İhtiyacınıza göre adresinize gelerek teslimat yapıyor veya mağazamızdan elden teslim imkânı sunuyoruz.',
      aboutP3: settings.aboutP3 || 'Böylece hem bireysel hem de kurumsal müşteriler için hızlı, pratik ve güvenli bir süreç oluşturuyoruz. Müşteri memnuniyetini ön planda tutan yaklaşımımızla; satış öncesi bilgilendirme, kurulum desteği ve satış sonrası teknik destek hizmetlerini eksiksiz sunuyoruz.',
      faqTitle: settings.faqTitle || 'Sıkça Sorulan Sorular',
      faqSubtitle: settings.faqSubtitle || 'E-İmza başvuru süreci, teslimat ve yasal geçerlilik hakkında merak edilenler.',
      faqs: settings.faqs || [
        {
          question: 'E-İmza kaç dakikada teslim edilir?',
          answer: 'Ofisimize geldiğinizde 15 dakika içinde e-imzanız hazırlanıp elden teslim edilir. Ankara geneli adresinize kurye/yerinde teslimat seçeneğimiz ile aynı gün adresinizde kimlik doğrulaması yapılarak kurulumu tamamlanır.'
        },
        {
          question: 'E-İmza hangi sistemlerde geçerlidir?',
          answer: '5070 Sayılı Elektronik İmza Kanunu uyarınca ıslak imza ile birebir aynı hukuki geçerliliğe sahiptir. UYAP, EKAP, MERSİS, GİB (e-Fatura/e-Defter), KEP, e-Devlet ve tüm kurumsal/kamu sistemlerinde %100 geçerlidir.'
        },
        {
          question: 'USB Token donanımı fiyata dahil midir?',
          answer: 'Evet, tüm paketlerimizde son teknoloji yüksek güvenlikli USB Token cihazı ve ilk kurulum/teknik destek hizmeti fiyata dahildir.'
        },
        {
          question: 'Kurulum ve teknik destek nasıl sağlanıyor?',
          answer: 'Uzman ekibimiz e-imzanızı teslim ederken bilgisayarınıza sürücüleri kurar ve test eder. Ayrıca uzaktan bağlantı ile ücretsiz teknik destek sunmaktayız.'
        }
      ],
      footerAbout: settings.footerAbout || 'E-DİJİTAL FİNANS, ArkSigner ve Arkimza yetkili iş ortağı olarak Ankara Ostim merkezli hızlı, güvenli ve 15 dakikada yerinde teslimatlı e-imza hizmetleri sunmaktadır.',
      copyrightText: settings.copyrightText || `© ${new Date().getFullYear()} E-DİJİTAL FİNANS. Tüm hakları saklıdır.`
    };
  });

  const handleToggleSection = (key: keyof SectionVisibility) => {
    const current = formSettings.sections || {
      announcement: true,
      hero: true,
      features: true,
      quickForm: true,
      pricing: true,
      compatibility: true,
      about: true,
      faq: true,
      contact: true
    };
    const updated = {
      ...formSettings,
      sections: {
        ...current,
        [key]: !current[key]
      }
    };
    setFormSettings(updated);
  };

  const handleAddFaq = () => {
    const list = formSettings.faqs || [];
    setFormSettings({
      ...formSettings,
      faqs: [...list, { question: 'Yeni Soru Başlığı', answer: 'Soruya ait detaylı açıklama metni.' }]
    });
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const list = [...(formSettings.faqs || [])];
    list[index][field] = value;
    setFormSettings({ ...formSettings, faqs: list });
  };

  const handleRemoveFaq = (index: number) => {
    const list = (formSettings.faqs || []).filter((_, i) => i !== index);
    setFormSettings({ ...formSettings, faqs: list });
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    StorageService.updateSettings(formSettings);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }, 250);
  };

  const sectionsList: { key: keyof SectionVisibility; label: string; desc: string; icon: any }[] = [
    { key: 'announcement', label: '1. Üst Duyuru Çubuğu (Announcement Bar)', desc: 'Sayfanın en üstündeki teslimat ve acil irtibat bildirim bandı.', icon: Info },
    { key: 'hero', label: '2. Hero / Karşılama Alanı', desc: 'Büyük başlık, slogan, teslimat rozeti ve e-imza görseli.', icon: Layout },
    { key: 'quickForm', label: '3. Hızlı Başvuru Formu Alanı', desc: '5 dakikada hızlı geri arama ve doğrudan başvuru formu.', icon: FileText },
    { key: 'features', label: '4. Avantajlar & Özellikler (Bento Grid)', desc: '15 Dk Teslimat, %100 Yasal Geçerlilik ve USB Token avantaj kartları.', icon: Layers },
    { key: 'pricing', label: '5. E-İmza Paketleri & Fiyatlar', desc: '1 Yıllık ve 3 Yıllık şeffaf fiyat kartları ve detayları.', icon: CreditCard },
    { key: 'compatibility', label: '6. Sistem Uyumluluğu (Platformlar)', desc: 'UYAP, EKAP, MERSİS, KEP ve kamu entegrasyon kartları.', icon: Compass },
    { key: 'about', label: '7. Hakkımızda & İş Ortaklığı', desc: 'Şirket tanıtımı ve ArkSigner yetkili iş ortaklığı bilgileri.', icon: HelpCircle },
    { key: 'faq', label: '8. Sıkça Sorulan Sorular (SSS)', desc: 'Müşterilerin merak ettiği sorular ve akordeon yanıtları.', icon: HelpCircle },
    { key: 'contact', label: '9. İletişim, Harita & Lokasyon', desc: 'Ostim ofis bilgileri, telefonlar ve doğrudan mesaj formu.', icon: PhoneCall },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Palette className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Tema, Sayfa & Bölüm Yönetimi</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Ana sayfadaki tüm bölümleri açıp kapatabilir, başlıklarını, butonlarını, SSS ve tema stilini buradan yönetebilirsiniz.
          </p>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setActiveSubTab('visibility')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'visibility'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Bölüm Görünürlükleri (Aç/Kapat)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('header_footer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'header_footer'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Header & Footer Ayarları</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hero_quickform')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'hero_quickform'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hero & Hızlı Form Metinleri</span>
        </button>

        <button
          onClick={() => setActiveSubTab('about_faq')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'about_faq'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Hakkımızda & SSS Yönetimi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('styling')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'styling'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Görsel Tema & Desenler</span>
        </button>
      </div>

      {/* Tab Contents */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* 1. SECTION VISIBILITY */}
        {activeSubTab === 'visibility' && (
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Ana Sayfa Bölüm Görünürlükleri
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                İstediğiniz bölümü tek tıkla ana sayfada yayına alabilir veya gizleyebilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionsList.map((sec) => {
                const isVisible = formSettings.sections ? formSettings.sections[sec.key] : true;
                const Icon = sec.icon;

                return (
                  <div
                    key={sec.key}
                    onClick={() => handleToggleSection(sec.key)}
                    className={`p-5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isVisible
                        ? 'border-blue-500/80 bg-blue-50/40 dark:bg-blue-950/20'
                        : 'border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 pr-4">
                      <div className={`p-2.5 rounded-xl ${
                        isVisible ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                          {sec.label}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                          {sec.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`text-xs font-bold ${
                        isVisible ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`}>
                        {isVisible ? 'Aktif' : 'Gizli'}
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isVisible ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-zinc-700 text-white'
                      }`}>
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. HEADER & FOOTER */}
        {activeSubTab === 'header_footer' && (
          <div className="space-y-6">
            
            {/* Header Settings */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-600" />
                <span>Header (Üst Menü) Ayarları</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Logo Altı Slogan (Tagline)
                  </label>
                  <input
                    type="text"
                    value={formSettings.headerTagline || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, headerTagline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formSettings.headerShowTrack ?? true}
                      onChange={(e) => setFormSettings({ ...formSettings, headerShowTrack: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>"Başvuru Takip" Butonunu Göster</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formSettings.headerShowApply ?? true}
                      onChange={(e) => setFormSettings({ ...formSettings, headerShowApply: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>"E-İmza Başvurusu" Butonunu Göster</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Settings */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Footer (Alt Bilgi) Ayarları</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Footer Şirket Tanıtım Metni
                  </label>
                  <textarea
                    rows={2}
                    value={formSettings.footerAbout || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, footerAbout: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Telif Hakkı (Copyright) Metni
                  </label>
                  <input
                    type="text"
                    value={formSettings.copyrightText || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, copyrightText: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 3. HERO & QUICK FORM */}
        {activeSubTab === 'hero_quickform' && (
          <div className="space-y-6">
            
            {/* Hero Section */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Hero (Karşılama Alanı) Metinleri</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Hero Üst Rozet (Badge) Metni
                  </label>
                  <input
                    type="text"
                    value={formSettings.heroBadge}
                    onChange={(e) => setFormSettings({ ...formSettings, heroBadge: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Hero Ana Başlık
                  </label>
                  <input
                    type="text"
                    value={formSettings.heroTitle}
                    onChange={(e) => setFormSettings({ ...formSettings, heroTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Hero Alt Açıklama
                  </label>
                  <input
                    type="text"
                    value={formSettings.heroSubtitle}
                    onChange={(e) => setFormSettings({ ...formSettings, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Birincil Buton Metni
                  </label>
                  <input
                    type="text"
                    value={formSettings.heroButtonText || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, heroButtonText: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    İkincil Buton Metni
                  </label>
                  <input
                    type="text"
                    value={formSettings.heroSecondaryButtonText || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, heroSecondaryButtonText: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Quick Form Section */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Hızlı Başvuru Formu Metinleri</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Form Başlığı
                  </label>
                  <input
                    type="text"
                    value={formSettings.quickFormTitle || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, quickFormTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Form Rozet Metni
                  </label>
                  <input
                    type="text"
                    value={formSettings.quickFormBadge || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, quickFormBadge: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Form Alt Açıklaması
                  </label>
                  <input
                    type="text"
                    value={formSettings.quickFormSubtitle || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, quickFormSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Sol Görsel Kart Başlığı
                  </label>
                  <input
                    type="text"
                    value={formSettings.quickFormCardTitle || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, quickFormCardTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Sol Görsel Kart Açıklaması
                  </label>
                  <input
                    type="text"
                    value={formSettings.quickFormCardSubtitle || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, quickFormCardSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 4. ABOUT & FAQ */}
        {activeSubTab === 'about_faq' && (
          <div className="space-y-6">
            
            {/* About Section */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span>Hakkımızda Metinleri</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Bölüm Ana Başlığı
                  </label>
                  <input
                    type="text"
                    value={formSettings.aboutTitle || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, aboutTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    1. Paragraf (Şirket & Yetkili Bayilik)
                  </label>
                  <textarea
                    rows={2}
                    value={formSettings.aboutP1 || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, aboutP1: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    2. Paragraf (Teslimat Seçenekleri & Ankara Hizmeti)
                  </label>
                  <textarea
                    rows={2}
                    value={formSettings.aboutP2 || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, aboutP2: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    3. Paragraf (Müşteri Memnuniyeti & Destek)
                  </label>
                  <textarea
                    rows={2}
                    value={formSettings.aboutP3 || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, aboutP3: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                    <span>Sıkça Sorulan Sorular (SSS) Yönetimi</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                    Müşterilerinize sunulan soruları ve yanıtları buradan ekleyebilir veya güncelleyebilirsiniz.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Soru Ekle</span>
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {(formSettings.faqs || []).map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                        Soru #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                        title="Soruyu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                        placeholder="Soru metni..."
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                        placeholder="Cevap açıklaması..."
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-700 dark:text-zinc-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 5. STYLING & PATTERNS */}
        {activeSubTab === 'styling' && (
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <span>Görsel Tema, Renk ve Arka Plan Desenleri</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                Sitenin genel renk tonunu ve modern geometrik arka plan efektlerini özelleştirin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Primary Color Palette */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-2">
                  Ana Vurgu Rengi
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { name: 'Kurumsal Mavi', color: '#0080c8' },
                    { name: 'Zümrüt Yeşil', color: '#0b9356' },
                    { name: 'Gece Mavisi', color: '#2563eb' },
                    { name: 'Koyu İndigo', color: '#4f46e5' },
                    { name: 'Modern Turuncu', color: '#ea580c' }
                  ].map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => setFormSettings({
                        ...formSettings,
                        theme: { ...(formSettings.theme || { showPatterns: true, enableGlow: true, cardRadius: 'rounded-2xl', primaryColor: '#0080c8' }), primaryColor: item.color }
                      })}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition cursor-pointer ${
                        (formSettings.theme?.primaryColor || '#0080c8') === item.color
                          ? 'ring-4 ring-blue-500/30 scale-110 shadow-md'
                          : 'hover:scale-105 opacity-80'
                      }`}
                      style={{ backgroundColor: item.color }}
                      title={item.name}
                    >
                      {(formSettings.theme?.primaryColor || '#0080c8') === item.color && (
                        <Check className="w-5 h-5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Border Radius */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-2">
                  Kart Köşe Yuvarlaklığı
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Medium (MD)', value: 'rounded-md' },
                    { label: 'Standart (XL)', value: 'rounded-xl' },
                    { label: 'Modern (2XL)', value: 'rounded-2xl' },
                    { label: 'Yumuşak (3XL)', value: 'rounded-3xl' }
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setFormSettings({
                        ...formSettings,
                        theme: { ...(formSettings.theme || { showPatterns: true, enableGlow: true, cardRadius: 'rounded-2xl', primaryColor: '#0080c8' }), cardRadius: r.value as any }
                      })}
                      className={`p-2.5 border text-xs font-bold transition text-center cursor-pointer ${
                        (formSettings.theme?.cardRadius || 'rounded-2xl') === r.value
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                          : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      } ${r.value}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pattern toggles */}
              <div className="sm:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSettings.theme?.showPatterns ?? true}
                    onChange={(e) => setFormSettings({
                      ...formSettings,
                      theme: { ...(formSettings.theme || { cardRadius: 'rounded-2xl', primaryColor: '#0080c8', enableGlow: true, showPatterns: true }), showPatterns: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Geometrik Izgara & Nokta Arka Plan Desenlerini Etkinleştir
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 block mt-0.5">
                      Fiyatlar ve sistem uyumluluğu alanlarının arka planında derinlik katan desenleri gösterir.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSettings.theme?.enableGlow ?? true}
                    onChange={(e) => setFormSettings({
                      ...formSettings,
                      theme: { ...(formSettings.theme || { cardRadius: 'rounded-2xl', primaryColor: '#0080c8', showPatterns: true, enableGlow: true }), enableGlow: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Ambiyans Işık Işıltılarını (Ambient Light Glows) Etkinleştir
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 block mt-0.5">
                      Modern neon ve yumuşak ışık gradyanlarını arka planda aktif eder.
                    </span>
                  </div>
                </label>
              </div>

            </div>
          </div>
        )}

        {/* Global Save Button with Sticky Bar */}
        <div className="pt-3 flex items-center justify-end sticky bottom-4 z-30 p-2.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-gray-200/80 dark:border-zinc-800/80 shadow-2xl">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-8 py-3.5 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-xl transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-75 ${
              savedSuccess
                ? 'bg-emerald-600 shadow-emerald-600/30'
                : isSaving
                  ? 'bg-blue-700 shadow-blue-600/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>✓ Başarıyla Kaydedildi ve Yayınlandı!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Tüm Tema & Sayfa Değişikliklerini Kaydet</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
