import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building2,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  User,
  Mail,
  FileText,
  AlertCircle,
  HelpCircle,
  Zap,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, SiteSettings, Order, PaymentMethod, PaymentStatus, DeliveryOptionItem, DeliveryType, Package } from '../types';
import { StorageService, DEFAULT_DELIVERY_OPTIONS } from '../services/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  directPackage?: Package | null;
  settings: SiteSettings;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  directPackage,
  settings,
  onOrderCompleted
}) => {
  // Use either cart items or direct single package checkout
  const activeItems: CartItem[] = directPackage 
    ? [{ package: directPackage, quantity: 1 }] 
    : cart;

  const activeDeliveryOptions = (
    settings.deliveryOptions && settings.deliveryOptions.length > 0
      ? settings.deliveryOptions
      : DEFAULT_DELIVERY_OPTIONS
  ).filter((d: DeliveryOptionItem) => d.active !== false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [tcVkn, setTcVkn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isCorporate, setIsCorporate] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxOffice, setTaxOffice] = useState('');

  // Delivery state
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(
    activeDeliveryOptions[0]?.id || 'del-1'
  );
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Order processing state
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

  useEffect(() => {
    if (activeDeliveryOptions.length > 0 && !activeDeliveryOptions.some(d => d.id === selectedDeliveryId)) {
      setSelectedDeliveryId(activeDeliveryOptions[0].id);
    }
  }, [activeDeliveryOptions, selectedDeliveryId]);

  if (!isOpen) return null;

  // Price calculations
  const subtotal = activeItems.reduce((sum, item) => sum + (item.package.price * item.quantity), 0);
  const totalQuantity = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const kdvRate = 0.20;
  const kdvAmount = Math.round(subtotal * kdvRate);
  const grandTotal = subtotal + kdvAmount;

  // Format card number with spaces (e.g. 4506 1234 5678 9012)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length <= 2) {
      setCardExpiry(raw);
    } else {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !tcVkn.trim() || !phone.trim()) return;

    // Card validations if credit_card
    if (paymentMethod === 'credit_card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15 || !cardHolder.trim() || cardExpiry.length < 4 || cardCvv.length < 3) {
        alert('Lütfen geçerli kart bilgilerinizi eksiksiz giriniz.');
        return;
      }
    }

    const selectedOption = activeDeliveryOptions.find(d => d.id === selectedDeliveryId) || activeDeliveryOptions[0];
    const deliveryTitle = selectedOption ? selectedOption.title : 'Ankara Adreste Yerinde Teslim';
    const deliveryTypeCode = (selectedOption?.type as DeliveryType) || 'ankara_yerinde';

    const initialPaymentStatus: PaymentStatus = 
      paymentMethod === 'credit_card' ? 'odendi' :
      paymentMethod === 'bank_transfer' ? 'havale_bekleniyor' : 'kapida_odeme';

    const cardLast4 = paymentMethod === 'credit_card' 
      ? cardNumber.replace(/\s+/g, '').slice(-4) 
      : undefined;

    setLoading(true);

    setTimeout(() => {
      const primaryItem = activeItems[0];
      const pkgNames = activeItems.map(i => `${i.package.name} (x${i.quantity})`).join(', ');

      const order = StorageService.addOrder({
        fullName: fullName.trim(),
        tcVkn: tcVkn.trim(),
        phone: phone.trim(),
        email: email.trim(),
        isCorporate,
        companyName: isCorporate ? companyName.trim() : undefined,
        taxOffice: isCorporate ? taxOffice.trim() : undefined,
        packageId: primaryItem?.package.id || 'pkg-1-yil',
        packageName: pkgNames,
        duration: primaryItem?.package.duration || '1 Yıl',
        price: grandTotal,
        quantity: totalQuantity,
        totalAmount: grandTotal,
        items: activeItems,
        deliveryType: deliveryTypeCode,
        deliveryTitle,
        address: address.trim() || 'Adres belirtilmedi',
        city: 'ANKARA',
        district: district.trim(),
        paymentMethod,
        paymentStatus: initialPaymentStatus,
        cardLast4,
        notes: notes.trim()
      });

      setLoading(false);
      setCreatedOrder(order);
      onOrderCompleted(order);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }, 1200);
  };

  const handleCopyCode = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.orderNumber || createdOrder.trackingCode || '');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban.replace(/\s+/g, ''));
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const resetAndClose = () => {
    setCreatedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full h-full sm:h-auto max-w-3xl rounded-none sm:rounded-3xl bg-white dark:bg-zinc-900 border-0 sm:border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden my-0 sm:my-auto max-h-none sm:max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Güvenli Online Sipariş & Ödeme</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  256-Bit SSL
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                15 Dakikada Hazır • ArkSigner & Arkimza Yetkili Bayi
              </p>
            </div>
          </div>

          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {activeItems.length === 0 ? (
            /* Empty Cart View */
            <div className="py-12 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                  Sepetinizde Henüz Ürün Yok
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Ödeme sayfasına geçebilmek için lütfen önce e-imza paketlerinden birini seçerek sepetinize ekleyiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const el = document.getElementById('fiyatlar');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition cursor-pointer"
              >
                E-İmza Paketlerini İncele
              </button>
            </div>
          ) : createdOrder ? (
            /* ==================================================== */
            /* ORDER SUCCESS SCREEN                                 */
            /* ==================================================== */
            <div className="py-6 text-center space-y-6 animate-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  Ödeme & Sipariş Onaylandı
                </span>
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
                  Siparişiniz Başarıyla Alındı!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Talebiniz sisteme işlendi. E-İmzanız hazırlanıyor, müşteri temsilcimiz kimlik doğrulama ve teslimat için sizinle iletişime geçecektir.
                </p>
              </div>

              {/* Order Box */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Sipariş & Takip Numarası</span>
                  <button
                    onClick={handleCopyCode}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                  </button>
                </div>

                <div className="font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
                  {createdOrder.orderNumber}
                </div>

                <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between">
                    <span>Müşteri:</span>
                    <strong className="text-zinc-900 dark:text-white">{createdOrder.fullName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Paket:</span>
                    <strong className="text-zinc-900 dark:text-white">{createdOrder.packageName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ödeme Şekli:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {createdOrder.paymentMethod === 'credit_card' ? 'Kredi Kartı (Ödendi)' :
                       createdOrder.paymentMethod === 'bank_transfer' ? 'Havale/EFT (Bekleniyor)' : 'Kapıda Ödeme'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ödenen Tutar:</span>
                    <strong className="font-mono text-sm font-extrabold text-zinc-900 dark:text-white">
                      {(createdOrder.totalAmount ?? createdOrder.price ?? 0).toLocaleString('tr-TR')} ₺ (KDV Dahil)
                    </strong>
                  </div>
                </div>

                {/* If Bank Transfer, show IBAN reminder */}
                {createdOrder.paymentMethod === 'bank_transfer' && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Havale Açıklaması:</span>
                    </div>
                    <p>Lütfen banka havalesi açıklama alanına <strong>{createdOrder.orderNumber}</strong> kodunu yazmayı unutmayınız.</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20${createdOrder.orderNumber}%20nolu%20online%20e-imza%20siparisim%20hakkinda%20gorusmek%20istiyorum.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-lg shadow-green-600/20 transition cursor-pointer"
                >
                  <span>WhatsApp ile Temsilciye Yaz</span>
                </a>

                <button
                  onClick={resetAndClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition cursor-pointer"
                >
                  Tamamla ve Kapat
                </button>
              </div>

            </div>
          ) : (
            /* ==================================================== */
            /* CHECKOUT FORM                                        */
            /* ==================================================== */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* 1. Items in Order Summary Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Sipariş Özeti ({totalQuantity} Ürün)
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    Genel Toplam: {grandTotal.toLocaleString('tr-TR')} ₺
                  </span>
                </div>

                <div className="divide-y divide-zinc-200/60 dark:divide-zinc-700/60">
                  {activeItems.map((item) => (
                    <div key={item.package.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-zinc-900 dark:text-white">{item.package.name}</strong>
                        <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">
                          {item.package.duration} • Adet: {item.quantity}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white">
                        {(item.package.price * item.quantity).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Customer & Billing Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    1. Alıcı & Fatura Bilgileri
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="corp_check"
                      checked={isCorporate}
                      onChange={(e) => setIsCorporate(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="corp_check" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      Kurumsal Fatura İstiyorum
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Av. Mehmet Yılmaz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {isCorporate ? 'Vergi Numarası *' : 'T.C. Kimlik Numarası *'}
                    </label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      maxLength={isCorporate ? 10 : 11}
                      placeholder={isCorporate ? '10 Haneli Vergi No' : '11 Haneli T.C. No'}
                      value={tcVkn}
                      onChange={(e) => setTcVkn(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Corporate specific fields */}
                {isCorporate && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                    <div>
                      <label className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                        Şirket Resmi Unvanı *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: ABC Finans ve Danışmanlık A.Ş."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 text-xs text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                        Vergi Dairesi *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Yenimahalle V.D."
                        value={taxOffice}
                        onChange={(e) => setTaxOffice(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 text-xs text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      E-Posta Adresi
                    </label>
                    <input
                      type="email"
                      placeholder="ornek@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Delivery Method */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  2. Teslimat & Kurulum Şekli
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
                            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50'
                        }`}
                      >
                        {opt.badge && (
                          <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                            {opt.badge}
                          </span>
                        )}
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5 mb-1 pr-12">
                            {opt.title.toLowerCase().includes('mağaza') || opt.title.toLowerCase().includes('ofis') ? (
                              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            ) : opt.title.toLowerCase().includes('kargo') ? (
                              <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                            <span className="truncate">{opt.title}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {opt.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      İlçe / Semt
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Yenimahalle, Ostim, Çankaya..."
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Teslimat Adresi
                    </label>
                    <input
                      type="text"
                      placeholder="Mahalle, cadde, sokak ve bina no"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Payment Method Selection */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  3. Ödeme Seçeneği
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Option 1: Credit Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'credit_card'
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-xs">Kredi / Banka Kartı</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      3D Secure ile Anında Güvenli Ödeme
                    </p>
                  </button>

                  {/* Option 2: Bank Transfer */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-xs">Havale / EFT / FAST</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Banka Hesabına Direkt Transfer
                    </p>
                  </button>

                  {/* Option 3: Cash / Card on Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-bold text-xs">Teslimatta Ödeme</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Mağazada veya Adreste Yerinde Ödeme
                    </p>
                  </button>

                </div>

                {/* Sub-form: Credit Card Inputs */}
                {paymentMethod === 'credit_card' && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Kart Üzerindeki İsim Soyisim *
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === 'credit_card'}
                        placeholder="Örn: MEHMET YILMAZ"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Kart Numarası *
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === 'credit_card'}
                        inputMode="numeric"
                        maxLength={19}
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white font-mono tracking-widest"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Son Kullanma (AA/YY) *
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === 'credit_card'}
                          inputMode="numeric"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white font-mono text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Güvenlik Kodu (CVV) *
                        </label>
                        <input
                          type="password"
                          required={paymentMethod === 'credit_card'}
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form: Bank Transfer Info */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3 animate-in fade-in duration-200 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-zinc-400">Banka & Hesap Sahibi</div>
                        <strong className="text-zinc-900 dark:text-white">Ziraat Bankası • {settings.companyName}</strong>
                        <div className="font-mono text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                          TR92 0001 0021 5589 1234 5001
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyIban('TR9200010021558912345001')}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[11px] hover:bg-blue-100 transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedIban ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedIban ? 'Kopyalandı' : 'IBAN Kopyala'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Siparişinizi onayladıktan sonra size verilecek <strong>Sipariş Kodunu</strong> açıklama alanına yazarak havale işleminizi gerçekleştirebilirsiniz.
                    </p>
                  </div>
                )}

                {/* Sub-form: Cash on Delivery Info */}
                {paymentMethod === 'cash_on_delivery' && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2 animate-in fade-in duration-200 text-xs">
                    <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
                      <Truck className="w-4 h-4 text-purple-600" />
                      <span>Teslimatta Nakit / Kredi Kartı ile Ödeme</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Siparişiniz adresinize ulaştığında kuryemizdeki mobil POS cihazı ile temassız kredi kartınızla veya nakit olarak ödeme yapabilirsiniz.
                    </p>
                  </div>
                )}
              </div>

              {/* Price Summary Card */}
              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-600 dark:text-zinc-400 block">Ödenecek Tutar</span>
                  <span className="font-bold text-zinc-900 dark:text-white text-sm">
                    {totalQuantity} Adet E-İmza Paketi
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                    {grandTotal.toLocaleString('tr-TR')} ₺
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">KDV Dahil • Token Dahil</span>
                </div>
              </div>

              {/* Submit / Pay Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'credit_card' ? 'Güvenli Ödeme Yap ve Siparişi Tamamla' :
                       paymentMethod === 'bank_transfer' ? 'Siparişi Onayla ve IBAN Al' : 'Kapıda Ödemeli Siparişi Tamamla'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
                "Siparişi Tamamla" butonuna basarak 6698 Sayılı KVKK ve Mesafeli Satış Sözleşmesi koşullarını kabul etmiş olursunuz.
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
