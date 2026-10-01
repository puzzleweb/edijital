import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Clock, 
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Truck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Package, DeliveryType, SiteSettings, Application, DeliveryOptionItem } from '../types';
import { StorageService, DEFAULT_DELIVERY_OPTIONS } from '../services/storage';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: Package | null;
  packages: Package[];
  settings: SiteSettings;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  packages,
  settings
}) => {
  const activeDeliveryOptions = (
    settings.deliveryOptions && settings.deliveryOptions.length > 0
      ? settings.deliveryOptions
      : DEFAULT_DELIVERY_OPTIONS
  ).filter((d: DeliveryOptionItem) => d.active !== false);

  const [activePkgId, setActivePkgId] = useState<string>(selectedPackage?.id || packages[0]?.id || 'pkg-1-yil');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(
    activeDeliveryOptions[0]?.id || 'del-1'
  );
  const [fullName, setFullName] = useState('');
  const [tcVkn, setTcVkn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [createdApp, setCreatedApp] = useState<Application | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedPackage) {
      setActivePkgId(selectedPackage.id);
    }
  }, [selectedPackage]);

  useEffect(() => {
    if (activeDeliveryOptions.length > 0 && !activeDeliveryOptions.some(d => d.id === selectedDeliveryId)) {
      setSelectedDeliveryId(activeDeliveryOptions[0].id);
    }
  }, [activeDeliveryOptions, selectedDeliveryId]);

  if (!isOpen) return null;

  const currentPkg = packages.find(p => p.id === activePkgId) || packages[0] || {
    id: 'pkg-1-yil',
    name: '1 Yıllık E-İmza',
    duration: '1 Yıl',
    price: 890
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !tcVkn || !phone) return;

    const selectedOption = activeDeliveryOptions.find(d => d.id === selectedDeliveryId) || activeDeliveryOptions[0];
    const deliveryTitle = selectedOption ? selectedOption.title : 'Ankara Adreste Yerinde Teslim';

    setLoading(true);
    setTimeout(() => {
      const app = StorageService.addApplication({
        fullName: fullName.trim(),
        tcVkn: tcVkn.trim(),
        phone: phone.trim(),
        email: email.trim(),
        isCorporate: false,
        packageId: currentPkg.id,
        packageName: currentPkg.name,
        duration: currentPkg.duration,
        price: currentPkg.price,
        deliveryType: deliveryTitle,
        address: address.trim() || 'Adres belirtilmedi',
        city: 'ANKARA',
        district: district.trim(),
        notes: notes.trim()
      });

      setLoading(false);
      setCreatedApp(app);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Confetti fallback
      }
    }, 700);
  };

  const handleCopyCode = () => {
    if (createdApp) {
      navigator.clipboard.writeText(createdApp.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const resetFormAndClose = () => {
    setCreatedApp(null);
    setFullName('');
    setTcVkn('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full h-full sm:h-auto max-w-2xl rounded-none sm:rounded-3xl bg-white dark:bg-zinc-900 border-0 sm:border border-gray-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden my-0 sm:my-auto max-h-none sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Online E-İmza Başvurusu
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                15 Dakikada Hazır • ArkSigner Yetkili Bayi
              </p>
            </div>
          </div>

          <button
            onClick={resetFormAndClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 flex items-center justify-center transition cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {createdApp ? (
            /* Success confirmation screen */
            <div className="py-6 text-center space-y-6 animate-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Başvurunuz Başarıyla Alındı!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-md mx-auto">
                  Talebiniz sistemimize işlendi. Temsilcimiz kimlik doğrulama ve teslimat için birkaç dakika içinde sizinle iletişime geçecektir.
                </p>
              </div>

              {/* Tracking Code Box */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 max-w-md mx-auto text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Başvuru Takip Kodunuz</span>
                  <button
                    onClick={handleCopyCode}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                  </button>
                </div>
                <div className="font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
                  {createdApp.trackingCode}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700 text-xs text-gray-600 dark:text-zinc-300 flex justify-between">
                  <span>Paket: <strong>{createdApp.packageName}</strong></span>
                  <span>Tutar: <strong>{createdApp.price} ₺ + KDV</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20${createdApp.trackingCode}%20nolu%20e-imza%20basvurum%20hakkinda%20gorusmek%20istiyorum.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow transition"
                >
                  <span>WhatsApp ile Temsilciye Yaz</span>
                </a>

                <button
                  onClick={resetFormAndClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-semibold transition"
                >
                  Kapat
                </button>
              </div>

            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Package Selector - Exactly 2 Packages */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
                  E-İmza Paketi Seçimi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setActivePkgId(pkg.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        activePkgId === pkg.id
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/40'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{pkg.name}</div>
                        <div className="text-[11px] text-gray-500 dark:text-zinc-400">{pkg.duration} Süreli</div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                          {pkg.price.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Kimlik & İletişim Bilgileri
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Adınız Soyadınız *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Av. Mehmet Yılmaz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      T.C. Kimlik / Vergi No *
                    </label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      placeholder="11 Haneli T.C. veya Vergi No"
                      value={tcVkn}
                      onChange={(e) => setTcVkn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      maxLength={11}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Telefon Numarası *
                    </label>
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      maxLength={14}
                      placeholder="0545 960 33 03"
                      value={phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        if (!digits) { setPhone(''); return; }
                        let formatted = digits.startsWith('0') ? digits : '0' + digits;
                        formatted = formatted.slice(0, 11);
                        if (formatted.length <= 4) setPhone(formatted);
                        else if (formatted.length <= 7) setPhone(`${formatted.slice(0, 4)} ${formatted.slice(4)}`);
                        else if (formatted.length <= 9) setPhone(`${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`);
                        else setPhone(`${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9, 11)}`);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      E-Posta Adresi
                    </label>
                    <input
                      type="email"
                      placeholder="ornek@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery preference */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Teslimat & Hizmet Tercihi
                </label>
                
                <div className={`grid grid-cols-1 ${activeDeliveryOptions.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-2.5`}>
                  {activeDeliveryOptions.map((opt) => {
                    const isSelected = selectedDeliveryId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedDeliveryId(opt.id)}
                        className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-gray-200 dark:border-zinc-800 bg-gray-50/40 dark:bg-zinc-800/30 text-gray-700 dark:text-zinc-300 hover:bg-gray-100/50'
                        }`}
                      >
                        {opt.badge && (
                          <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                            {opt.badge}
                          </span>
                        )}
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5 mb-1 pr-12">
                            {(() => {
                              const t = (opt.title || '').toLowerCase();
                              if (t.includes('mağaza') || t.includes('ofis') || t.includes('elden')) {
                                return <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
                              } else if (t.includes('kargo')) {
                                return <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />;
                              } else if (t.includes('kurye') || t.includes('motor')) {
                                return <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />;
                              }
                              return <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                            })()}
                            <span className="truncate">{opt.title}</span>
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {opt.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      İlçe / Bölge
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Yenimahalle, Ostim, Çankaya..."
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Açık Adres
                    </label>
                    <input
                      type="text"
                      placeholder="Mahalle, cadde, sokak ve kapı no"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Özel Notunuz (Varsa)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: UYAP için acil teslimat rica ederim veya saat 14:00'ten sonra uygundur"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price summary badge */}
              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-600 dark:text-zinc-400 block">Ödenecek Tutar</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{currentPkg.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {currentPkg.price.toLocaleString('tr-TR')} ₺
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">+ KDV / Token Dahil</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full apple-btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Başvuruyu Onayla ve Gönder</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
