import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Check,
  CheckSquare,
  ChevronDown
} from 'lucide-react';
import { SiteSettings, Package, DeliveryType, DeliveryOptionItem } from '../types';
import { StorageService, DEFAULT_DELIVERY_OPTIONS } from '../services/storage';

interface QuickFormSectionProps {
  settings: SiteSettings;
  packages: Package[];
}

export const QuickFormSection: React.FC<QuickFormSectionProps> = ({ settings, packages }) => {
  const activeDeliveryOptions = (
    settings.deliveryOptions && settings.deliveryOptions.length > 0
      ? settings.deliveryOptions
      : DEFAULT_DELIVERY_OPTIONS
  ).filter((d: DeliveryOptionItem) => d.active !== false);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    packages.find(p => p.popular)?.id || packages[0]?.id || ''
  );
  const [formDelivery, setFormDelivery] = useState<string>(
    activeDeliveryOptions[0]?.title || 'Ankara Adreste Yerinde Teslim & Kurulum'
  );
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [createdTrackingCode, setCreatedTrackingCode] = useState('');
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    if (packages.length > 0 && (!selectedPkgId || !packages.some(p => p.id === selectedPkgId))) {
      const pop = packages.find(p => p.popular) || packages[0];
      if (pop) setSelectedPkgId(pop.id);
    }
  }, [packages, selectedPkgId]);

  useEffect(() => {
    if (activeDeliveryOptions.length > 0 && !activeDeliveryOptions.some(d => d.title === formDelivery)) {
      setFormDelivery(activeDeliveryOptions[0].title);
    }
  }, [activeDeliveryOptions, formDelivery]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';

    let formatted = digits;
    if (!formatted.startsWith('0')) {
      formatted = '0' + formatted;
    }
    formatted = formatted.slice(0, 11);

    if (formatted.length <= 4) return formatted;
    if (formatted.length <= 7) return `${formatted.slice(0, 4)} ${formatted.slice(4)}`;
    if (formatted.length <= 9) return `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`;
    return `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9, 11)}`;
  };

  const handleQuickFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Honeypot check (Bots fill hidden fields)
    if (honeypot.trim() !== '') {
      setFormLoading(true);
      setTimeout(() => {
        setFormLoading(false);
        setFormSubmitted(true);
      }, 300);
      return;
    }

    const cleanDigits = formPhone.replace(/\D/g, '');
    if (!formName.trim() || cleanDigits.length < 10) return;

    setFormLoading(true);
    setTimeout(() => {
      // Find matching package
      const targetPkg = packages.find(p => p.id === selectedPkgId) || packages[0];
      const selectedDeliveryOpt = activeDeliveryOptions.find(d => d.title === formDelivery);
      const deliveryTitle = selectedDeliveryOpt ? selectedDeliveryOpt.title : formDelivery;

      const app = StorageService.addApplication({
        fullName: formName.trim(),
        tcVkn: 'Belirtilmedi',
        phone: formPhone.trim(),
        email: '',
        isCorporate: false,
        packageId: targetPkg ? targetPkg.id : 'pkg-1-yil',
        packageName: targetPkg ? targetPkg.name : 'E-İmza Paketi',
        duration: targetPkg ? targetPkg.duration : '1 Yıl',
        price: targetPkg ? targetPkg.price : 2450,
        deliveryType: deliveryTitle,
        address: 'Hızlı Başvuru (Adres belirtilmedi)',
        city: 'ANKARA',
        district: '',
        notes: ''
      });

      setFormLoading(false);
      setCreatedTrackingCode(app.trackingCode);
      setFormSubmitted(true);
      setFormName('');
      setFormPhone('');
      setTimeout(() => setFormSubmitted(false), 10000);
    }, 400);
  };

  return (
    <section id="hizli-basvuru" className="py-14 md:py-20 bg-slate-50/60 dark:bg-zinc-950/60 border-b border-slate-200/80 dark:border-zinc-800/80">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

          {/* Left Column: Workplace / Customer Service Image */}
          <div className="lg:col-span-6 flex flex-col h-full">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 group h-full flex flex-col min-h-[420px] lg:min-h-0">
              <img
                src="/real_images/form_workplace.jpg"
                alt="E-Dijital Finans E-İmza Başvuru ve Kurulum"
                className="w-full h-full min-h-[360px] lg:min-h-full object-cover transition-transform duration-500 group-hover:scale-105 flex-1"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none"></div>

              <div className="absolute bottom-6 left-6 right-6 text-white text-left pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-bold uppercase tracking-wider inline-block mb-2 backdrop-blur-xs">
                  {settings.quickFormBadge || 'Hızlı Başvuru & Teslimat'}
                </span>
                <h4 className="text-xl sm:text-2xl font-bold leading-tight">
                  {settings.quickFormCardTitle || 'E-İmzanız 15 Dakikada Hazırlansın'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-md leading-relaxed">
                  {settings.quickFormCardSubtitle || 'Formu doldurun; ofisimizden hemen teslim alın veya Ankara geneli adresinize getirelim.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Form Card */}
          <div className="lg:col-span-6 relative flex flex-col h-full">

            {/* Top-Right Badge */}
            <div className="absolute -top-3.5 right-6 px-4 py-1 rounded-full bg-[#0080c8] text-white text-[11px] font-extrabold tracking-wider uppercase shadow-md z-10">
              {settings.quickFormBadge || 'HIZLI FORM'}
            </div>

            <div className="rounded-3xl p-6 sm:p-9 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl relative h-full flex flex-col justify-between">

              <div className="mb-6 text-left">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {settings.quickFormTitle || 'E-İmza Satın Al'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {settings.quickFormSubtitle || 'Ücretsiz ön bilgi ve hızlı başvuru için formu doldurun. Uzmanlarımız 5 dakika içinde arasın.'}
                </p>
              </div>

              {formSubmitted ? (
                <div className="py-10 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Başvurunuz Alındı!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-sm mx-auto">
                    Talebiniz kaydedildi. Uzmanımız 5 dakika içinde <strong className="text-slate-900 dark:text-white">{settings.phoneDisplay}</strong> üzerinden sizinle iletişime geçecektir.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-sm font-bold text-blue-600">
                    Takip Kodu: {createdTrackingCode}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuickFormSubmit} className="space-y-4 text-left">
                  {/* Honeypot field for bot trap */}
                  <div className="hidden" aria-hidden="true" style={{ display: 'none', position: 'absolute', left: '-9999px' }}>
                    <label htmlFor="quick_website_hp">Website</label>
                    <input
                      id="quick_website_hp"
                      type="text"
                      name="website_url"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* Ad Soyad */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Ad Soyad *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Adınız ve Soyadınız"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>

                  {/* Telefon Numarası */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Telefon Numarası *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        maxLength={14}
                        placeholder="05XX XXX XX XX"
                        value={formPhone}
                        onChange={(e) => setFormPhone(formatPhoneNumber(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
                      />
                    </div>
                  </div>

                  {/* Paket Tercihi Seçiniz */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Paket Tercihi Seçiniz:
                    </label>
                    <div className={`grid grid-cols-1 ${packages.length > 1 ? 'sm:grid-cols-2' : ''} gap-2.5`}>
                      {packages.map((pkg) => {
                        const isSelected = selectedPkgId === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setSelectedPkgId(pkg.id)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                              isSelected
                                ? 'border-[#0080c8] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#0080c8]'
                                : 'border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 hover:bg-slate-50 dark:hover:bg-zinc-800/70'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-[#0080c8]' : 'border-slate-400'
                              }`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-[#0080c8]"></div>}
                              </div>
                              <div className="truncate">
                                <span className={`text-xs font-bold block truncate ${
                                  isSelected ? 'text-[#0080c8]' : 'text-slate-800 dark:text-zinc-200'
                                }`}>
                                  {pkg.name}
                                </span>
                                {pkg.badge && (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium block leading-none mt-0.5">
                                    {pkg.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 shrink-0">
                              {pkg.price.toLocaleString('tr-TR')} ₺
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Teslimat & Hizmet Şekli */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Teslimat & Hizmet Şekli
                    </label>
                    <div className="relative">
                      <select
                        value={formDelivery}
                        onChange={(e) => setFormDelivery(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer pr-10"
                      >
                        {activeDeliveryOptions.map((opt) => (
                          <option key={opt.id} value={opt.title}>
                            {opt.title} {opt.badge ? `(${opt.badge})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Green Submit Button */}
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-3.5 rounded-xl bg-[#0b9356] hover:bg-[#097b48] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] cursor-pointer mt-2"
                  >
                    {formLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4 stroke-[2.5]" />
                        <span>E-İMZA BAŞVUR</span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="bg-white dark:bg-zinc-900 px-3">VEYA</span>
                    </div>
                  </div>

                  {/* Blue Call Button */}
                  <a
                    href={`tel:${settings.phone}`}
                    className="w-full py-3.5 rounded-xl bg-[#0080c8] hover:bg-[#006ea8] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Hemen Ara: {settings.phoneDisplay || '+90 545 960 33 03'}</span>
                  </a>

                  {/* KVKK Footer */}
                  <p className="text-[10px] sm:text-[11px] text-slate-400 text-center leading-relaxed pt-2">
                    Verileriniz 6698 Sayılı KVKK kapsamında korunmakta ve yalnızca yetkili e-imza başvurunuzun tamamlanması amacıyla işlenmektedir.
                  </p>

                </form>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
