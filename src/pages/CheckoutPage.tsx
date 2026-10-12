import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Building2,
  Truck,
  CheckCircle2,
  Copy,
  Check,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Phone,
  MessageSquare,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  FileText,
  User,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, SiteSettings, Order, PaymentMethod, PaymentStatus, DeliveryOptionItem, DeliveryType, Package } from '../types';
import { StorageService, DEFAULT_DELIVERY_OPTIONS } from '../services/storage';
import { LegalDocSlug } from './LegalPage';
import { generateCustomerContractSnapshots } from '../data/defaultLegalDocs';

interface CheckoutPageProps {
  settings: SiteSettings;
  cart: CartItem[];
  darkMode: boolean;
  onUpdateQuantity: (pkgId: string, quantity: number) => void;
  onRemoveItem: (pkgId: string) => void;
  onClearCart: () => void;
  onBackToHome: () => void;
  onNavigateToTrack: (orderNumber?: string) => void;
  onNavigateToLegal?: (slug: LegalDocSlug) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  settings,
  cart,
  darkMode,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onBackToHome,
  onNavigateToTrack,
  onNavigateToLegal,
}) => {
  const activeDeliveryOptions = (
    settings.deliveryOptions && settings.deliveryOptions.length > 0
      ? settings.deliveryOptions
      : DEFAULT_DELIVERY_OPTIONS
  )
    .filter((d: DeliveryOptionItem) => d.active !== false && d.id !== 'del-1' && d.id !== 'del-2' && !d.title?.includes('Ostim') && !d.title?.includes('Ankara Adreste'))
    .concat(
      // fallback to DEFAULT_DELIVERY_OPTIONS if empty
      (settings.deliveryOptions || []).filter((d: DeliveryOptionItem) => d.active !== false && d.id !== 'del-1' && d.id !== 'del-2' && !d.title?.includes('Ostim') && !d.title?.includes('Ankara Adreste')).length === 0
        ? DEFAULT_DELIVERY_OPTIONS
        : []
    );

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
    activeDeliveryOptions[0]?.id || 'del-3'
  );
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => {
    if (settings.creditCardActive !== false) return 'credit_card';
    if (settings.bankTransferActive !== false) return 'bank_transfer';
    if (settings.cashOnDeliveryActive) return 'cash_on_delivery';
    return 'credit_card';
  });

  // Credit Card Form states
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [secure3d, setSecure3d] = useState(true);

  // Legal Agreements (Müşteri kendisi açıkça işaretlemelidir - Boş başlar)
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedDistanceContract, setAgreedDistanceContract] = useState(false);
  const [agreedKvkk, setAgreedKvkk] = useState(false);

  // Order processing state
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `Güvenli Ödeme & Sipariş | ${settings.companyName || 'E-DİJİTAL FİNANS'}`;
  }, [settings.companyName]);

  useEffect(() => {
    if (activeDeliveryOptions.length > 0 && !activeDeliveryOptions.some(d => d.id === selectedDeliveryId)) {
      setSelectedDeliveryId(activeDeliveryOptions[0].id);
    }
  }, [activeDeliveryOptions, selectedDeliveryId]);

  // Price calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.package.price * item.quantity), 0);
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    let formatted = digits;
    if (!formatted.startsWith('0')) {
      formatted = '0' + formatted;
    }
    formatted = formatted.slice(0, 11);
    if (formatted.length <= 4) setPhone(formatted);
    else if (formatted.length <= 7) setPhone(`${formatted.slice(0, 4)} ${formatted.slice(4)}`);
    else if (formatted.length <= 9) setPhone(`${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`);
    else setPhone(`${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9, 11)}`);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!fullName.trim() || !tcVkn.trim() || !phone.trim()) {
      alert('Lütfen zorunlu müşteri ve fatura alanlarını eksiksiz doldurunuz.');
      return;
    }

    if (!agreedDistanceContract) {
      alert('Lütfen Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formunu onaylayınız.');
      return;
    }

    if (!agreedKvkk) {
      alert('Lütfen 6698 Sayılı KVKK Aydınlatma Metnini onaylayınız.');
      return;
    }

    // Card validations if credit_card
    if (paymentMethod === 'credit_card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15 || !cardHolder.trim() || cardExpiry.length < 4 || cardCvv.length < 3) {
        alert('Lütfen geçerli kart bilgilerinizi eksiksiz giriniz.');
        return;
      }
    }

    const selectedOption = activeDeliveryOptions.find(d => d.id === selectedDeliveryId) || activeDeliveryOptions[0];
    const deliveryTitle = selectedOption ? selectedOption.title : 'Hızlı Kargo ile Adrese Teslimat';
    const deliveryTypeCode = (selectedOption?.type as DeliveryType) || 'kargo';

    const initialPaymentStatus: PaymentStatus = 
      paymentMethod === 'credit_card' ? 'odendi' :
      paymentMethod === 'bank_transfer' ? 'havale_bekleniyor' : 'kapida_odeme';

    const cardLast4 = paymentMethod === 'credit_card' 
      ? cardNumber.replace(/\s+/g, '').slice(-4) 
      : undefined;

    setLoading(true);

    setTimeout(() => {
      const primaryItem = cart[0];
      const pkgNames = cart.map(i => `${i.package.name} (x${i.quantity})`).join(', ');

      // Generate populated legal contract snapshots with customer information
      const signedContracts = generateCustomerContractSnapshots({
        fullName: fullName.trim(),
        tcVkn: tcVkn.trim(),
        phone: phone.trim(),
        email: email.trim(),
        isCorporate,
        companyName: isCorporate ? companyName.trim() : undefined,
        taxOffice: isCorporate ? taxOffice.trim() : undefined,
        address: address.trim() || 'Adres belirtilmedi',
        district: district.trim(),
        city: 'ANKARA',
        packageName: pkgNames,
        totalAmount: grandTotal,
        price: grandTotal,
        paymentMethod,
        deliveryTitle
      }, settings);

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
        price: primaryItem?.package.price || 2450,
        quantity: totalQuantity,
        totalAmount: grandTotal,
        items: cart,
        deliveryType: deliveryTypeCode,
        deliveryTitle,
        address: address.trim() || 'Adres belirtilmedi',
        city: 'ANKARA',
        district: district.trim(),
        paymentMethod,
        paymentStatus: initialPaymentStatus,
        cardLast4,
        notes: `Ödeme: ${paymentMethod} | Teslimat: ${deliveryTitle}${notes ? ' | Not: ' + notes.trim() : ''}`,
        signedContracts,
        legalAgreedAt: new Date().toISOString()
      });

      // Clear shopping cart after successful purchase
      StorageService.clearCart();

      // Confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      setLoading(false);
      setCreatedOrder(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  const handleCopyCode = () => {
    if (!createdOrder) return;
    navigator.clipboard.writeText(createdOrder.orderNumber || createdOrder.trackingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban.replace(/\s+/g, ''));
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      
      {/* Checkout Dedicated Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 py-3.5 sm:py-4">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo & Home Back Link */}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-3 text-left group cursor-pointer"
            title="Ana Sayfaya Dön"
          >
            <img
              src="/real_images/logo.png"
              alt="E-DİJİTAL FİNANS"
              className="h-9 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white group-hover:text-blue-600 transition">
                {settings.companyName || 'E-DİJİTAL FİNANS'}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-600 dark:text-blue-400">
                Güvenli Ödeme Sayfası
              </span>
            </div>
          </button>

          {/* Security Badges in Header */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>256-Bit SSL Şifreli Güvenli Ödeme</span>
            </div>

            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Alışverişe Dön</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1300px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* ORDER SUCCESS SCREEN */}
        {createdOrder ? (
          <div className="max-w-2xl mx-auto py-8 text-center space-y-8 animate-in zoom-in-95 duration-300">
            
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 ring-8 ring-emerald-50 dark:ring-emerald-950/40">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Siparişiniz Başarıyla Alındı
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Teşekkür Ederiz, Siparişiniz Onaylandı!
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-lg mx-auto leading-relaxed">
                E-İmza sertifika başvurunuz sisteme işlendi. Müşteri temsilcimiz kimlik doğrulama ve adreste kurulum/teslimat için en kısa sürede sizinle iletişime geçecektir.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-left space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-2">
                <div>
                  <span className="text-xs text-zinc-400 font-medium block">Sipariş & Takip Numarası</span>
                  <span className="font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
                    {createdOrder.orderNumber}
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold transition cursor-pointer self-start sm:self-auto"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Kopyalandı!' : 'Sipariş Kodunu Kopyala'}</span>
                </button>
              </div>

              {/* Order Info Rows */}
              <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span>Müşteri Ad Soyad:</span>
                  <strong className="text-zinc-900 dark:text-white">{createdOrder.fullName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>T.C. / Vergi No:</span>
                  <strong className="text-zinc-900 dark:text-white">{createdOrder.tcVkn}</strong>
                </div>
                <div className="flex justify-between">
                  <span>İletişim Telefonu:</span>
                  <strong className="text-zinc-900 dark:text-white">{createdOrder.phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Paket(ler):</span>
                  <strong className="text-zinc-900 dark:text-white text-right max-w-xs">{createdOrder.packageName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Teslimat Şekli:</span>
                  <strong className="text-zinc-900 dark:text-white">{createdOrder.deliveryTitle || 'Hızlı Kargo ile Adrese Teslimat'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Ödeme Şekli:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {createdOrder.paymentMethod === 'credit_card' ? 'Kredi / Banka Kartı (Ödendi)' :
                     createdOrder.paymentMethod === 'bank_transfer' ? 'Banka Havalesi / EFT (Bekleniyor)' : 'Kapıda / Adreste Ödeme'}
                  </strong>
                </div>
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-baseline">
                  <span className="font-bold text-zinc-900 dark:text-white">Toplam Ödenen:</span>
                  <span className="font-mono text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {createdOrder.totalAmount?.toLocaleString('tr-TR')} ₺ (KDV Dahil)
                  </span>
                </div>
              </div>

              {/* Bank Transfer Instructions */}
              {createdOrder.paymentMethod === 'bank_transfer' && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-3">
                  <div className="font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Havale / EFT Ödeme Talimatı</span>
                  </div>
                  <p>
                    Lütfen ödemenizi yaparken açıklama alanına <strong>{createdOrder.orderNumber}</strong> sipariş kodunuzu yazınız.
                  </p>
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200/80 dark:border-amber-800/80 font-mono text-xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-400 font-sans">IBAN (Ziraat / Garanti / İş Bankası):</div>
                      <div className="font-bold text-zinc-900 dark:text-white">{settings.iban || 'TR12 0006 2000 0001 2345 6789 01'}</div>
                      <div className="text-[10px] text-zinc-400 font-sans">{settings.ibanRecipient || settings.companyName}</div>
                    </div>
                    <button
                      onClick={() => handleCopyIban(settings.iban || 'TR120006200000012345678901')}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 text-amber-900 dark:text-amber-100 text-[11px] font-bold cursor-pointer transition"
                    >
                      {copiedIban ? 'Kopyalandı!' : 'IBAN Kopyala'}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20${createdOrder.orderNumber}%20nolu%20e-imza%20siparisim%20icin%20yaziyorum.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp İle Bilgi Al & Onayla</span>
              </a>

              <button
                onClick={() => onNavigateToTrack(createdOrder.orderNumber)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/20 transition cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Siparişimi Canlı Takip Et</span>
              </button>

              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                Ana Sayfaya Dön
              </button>
            </div>

          </div>
        ) : cart.length === 0 ? (
          /* EMPTY CART SCREEN */
          <div className="max-w-md mx-auto py-16 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Sepetinizde Ürün Bulunmuyor
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Ödeme yapabilmek için lütfen öncelikle ihtiyacınıza uygun 1, 2 veya 3 yıllık e-imza paketlerinden birini seçerek sepetinize ekleyiniz.
              </p>
            </div>
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>E-İmza Paketlerini İncele</span>
            </button>
          </div>
        ) : (
          /* CHECKOUT 2-COLUMN FULL PAGE FORM */
          <div>
            
            {/* Step Indicators */}
            <div className="mb-8 hidden sm:flex items-center justify-between max-w-2xl mx-auto text-xs font-semibold text-zinc-400">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>Sepet Onayı</span>
              </div>
              <div className="h-0.5 w-12 bg-blue-600" />
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>Alıcı & Fatura</span>
              </div>
              <div className="h-0.5 w-12 bg-blue-600" />
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                <span>Güvenli Ödeme</span>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* LEFT COLUMN: Input Forms (Span 8) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* 1. Alıcı & Fatura Bilgileri Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                          Alıcı & Fatura Bilgileri
                        </h2>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          E-İmza sertifikası ve resmi fatura bu bilgilere göre düzenlenecektir.
                        </p>
                      </div>
                    </div>

                    {/* Corporate Toggle */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_corporate"
                        checked={isCorporate}
                        onChange={(e) => {
                          setIsCorporate(e.target.checked);
                          if (!e.target.checked) {
                            setCompanyName('');
                            setTaxOffice('');
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="is_corporate" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        Kurumsal Fatura İstiyorum
                      </label>
                    </div>
                  </div>

                  {/* Dynamic Form based on Bireysel vs Kurumsal */}
                  {isCorporate ? (
                    /* KURUMSAL FATURA FORMU */
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Yetkili Ad Soyad *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Örn: Av. Mehmet Yılmaz"
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Şirket / Kurum Resmi Ünvanı *
                          </label>
                          <input
                            type="text"
                            required={isCorporate}
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Örn: ABC Bilişim Danışmanlık Ltd. Şti."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Vergi Kimlik Numarası (VKN) *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={10}
                            value={tcVkn}
                            onChange={(e) => setTcVkn(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="10 Haneli Vergi Kimlik No"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Vergi Dairesi *
                          </label>
                          <input
                            type="text"
                            required={isCorporate}
                            value={taxOffice}
                            onChange={(e) => setTaxOffice(e.target.value)}
                            placeholder="Örn: Yenimahalle Vergi Dairesi"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            İletişim Telefon Numarası *
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={handlePhoneChange}
                              placeholder="0545 960 33 03"
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Kurumsal E-Posta (E-Fatura & Bildirim)
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="muhasebe@sirket.com"
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Adres ve İlçe Alanları (Kurumsal) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            İlçe / Semt (Ankara)
                          </label>
                          <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="Örn: Yenimahalle, Ostim, Çankaya..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Fatura & Teslimat Adresi *
                          </label>
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Şirket merkez adresi, mahalle, cadde, bina no..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* BİREYSEL FATURA FORMU */
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Ad Soyad (E-İmza Sahibi) *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Örn: Av. Mehmet Yılmaz"
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            T.C. Kimlik Numarası *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={11}
                            value={tcVkn}
                            onChange={(e) => setTcVkn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            placeholder="11 Haneli T.C. Kimlik No"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Telefon Numarası *
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={handlePhoneChange}
                              placeholder="0545 960 33 03"
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            E-Posta Adresi (E-Fatura & Bildirim)
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="ornek@domain.com"
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Adres ve İlçe Alanları (Bireysel) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            İlçe / Semt (Ankara)
                          </label>
                          <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="Örn: Yenimahalle, Ostim, Çankaya..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Fatura & Teslimat Adresi *
                          </label>
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Mahalle, cadde, sokak ve bina no..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* 2. Teslimat & Kurulum Tercihi Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                  
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                        Teslimat & Kurulum Şekli
                      </h2>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        E-İmza donanımınızı ve kurulumunuzu nasıl almak istersiniz?
                      </p>
                    </div>
                  </div>

                  {/* Delivery Option Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeDeliveryOptions.map((opt) => {
                      const isSelected = selectedDeliveryId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedDeliveryId(opt.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-600/30 shadow-sm'
                              : 'bg-slate-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {opt.badge && (
                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white">
                              {opt.badge}
                            </span>
                          )}
                          <div className="font-bold text-xs text-zinc-900 dark:text-white pr-6">
                            {opt.title}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                            {opt.description}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Sipariş / Kurulum Notu (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Örn: Saat 14:00'ten sonra adrese gelinmesi uygundur..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                </div>

                {/* 3. Ödeme Seçeneği & Sanal POS Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                  
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                        Ödeme Yöntemi
                      </h2>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        256-Bit SSL ve 3D Secure güvencesiyle dilediğiniz yöntemle ödeyin.
                      </p>
                    </div>
                  </div>

                  {/* Payment Method Selector Tabs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {settings.creditCardActive !== false && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('credit_card')}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          paymentMethod === 'credit_card'
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-600/30'
                            : 'bg-slate-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-bold text-xs text-zinc-900 dark:text-white">Kredi / Banka Kartı</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">{settings.posProvider || '3D Secure ile Anında Güvenli Ödeme'}</span>
                      </button>
                    )}

                    {settings.bankTransferActive !== false && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank_transfer')}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          paymentMethod === 'bank_transfer'
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-600/30'
                            : 'bg-slate-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-bold text-xs text-zinc-900 dark:text-white">Havale / EFT / FAST</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">{settings.bankName || 'Banka Hesabına Doğrudan Transfer'}</span>
                      </button>
                    )}

                    {Boolean(settings.cashOnDeliveryActive) && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash_on_delivery')}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          paymentMethod === 'cash_on_delivery'
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-600/30'
                            : 'bg-slate-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="font-bold text-xs text-zinc-900 dark:text-white">Kapıda Ödeme</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">Adreste Nakit veya POS ile Ödeme</span>
                      </button>
                    )}
                  </div>

                  {/* 1. Credit Card Form */}
                  {paymentMethod === 'credit_card' && (
                    <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4 animate-in fade-in duration-200">
                      
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-700/60">
                        <div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-blue-600" />
                            {settings.posProvider || 'Kart Bilgileri'}
                          </span>
                          {settings.posDescription && (
                            <span className="text-[10px] text-zinc-500 block mt-0.5">{settings.posDescription}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                          <span>VISA</span>
                          <span>•</span>
                          <span>MasterCard</span>
                          <span>•</span>
                          <span>Troy</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Kart Üzerindeki İsim Soyisim *
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === 'credit_card'}
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          placeholder="Örn: MEHMET YILMAZ"
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition uppercase font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Kart Numarası *
                        </label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required={paymentMethod === 'credit_card'}
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="0000 0000 0000 0000"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono tracking-wider"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Son Kullanma Tarihi (Ay/Yıl) *
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'credit_card'}
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="AA/YY"
                            maxLength={5}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-center font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Güvenlik Kodu (CVC / CVV) *
                          </label>
                          <input
                            type="password"
                            required={paymentMethod === 'credit_card'}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="***"
                            maxLength={4}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-center font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="secure3d"
                          checked={secure3d}
                          onChange={(e) => setSecure3d(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="secure3d" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer flex items-center gap-1">
                          <span>3D Secure ile SMS Doğrulamalı Güvenli Ödeme Yapılsın</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">(Tavsiye Edilen)</span>
                        </label>
                      </div>

                    </div>
                  )}

                  {/* 2. Bank Transfer Info */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4 animate-in fade-in duration-200">
                      <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                        <span className="font-bold block text-zinc-900 dark:text-white">Havale / EFT Hesap Bilgilerimiz:</span>
                        <p className="text-[11px] text-zinc-500">
                          Siparişinizi onayladıktan sonra aşağıdaki IBAN numarasına toplam tutarı transfer ediniz.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Banka:</span>
                          <strong className="text-zinc-900 dark:text-white">{settings.bankName || 'Ziraat Bankası'}</strong>
                        </div>
                        {settings.bankBranch && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Şube:</span>
                            <strong className="text-zinc-800 dark:text-zinc-200">{settings.bankBranch}</strong>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Alıcı / Ünvan:</span>
                          <strong className="text-zinc-900 dark:text-white">{settings.ibanRecipient || settings.companyName}</strong>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
                          <span className="text-zinc-500">IBAN:</span>
                          <div className="flex items-center gap-2">
                            <strong className="font-mono text-blue-600 dark:text-blue-400 font-bold">{settings.iban || 'TR12 0006 2000 0001 2345 6789 01'}</strong>
                            <button
                              type="button"
                              onClick={() => handleCopyIban(settings.iban || 'TR120006200000012345678901')}
                              className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold hover:bg-zinc-200 cursor-pointer"
                            >
                              {copiedIban ? 'Kopyalandı' : 'Kopyala'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900">
                        {settings.bankTransferNote || '* Siparişiniz tamamlandığında size özel oluşturulacak sipariş kodunu transfer açıklama kısmına yazmanız gerekmektedir.'}
                      </p>
                    </div>
                  )}

                  {/* 3. Cash on Delivery Info */}
                  {paymentMethod === 'cash_on_delivery' && (
                    <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3 animate-in fade-in duration-200 text-xs text-zinc-700 dark:text-zinc-300">
                      <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Truck className="w-4 h-4 text-purple-600" />
                        <span>Kapıda / Adreste Tahsilat Detayı:</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {settings.cashOnDeliveryNote || 'Yetkili teknik personelimiz adresinize gelerek kimlik doğrulama ve e-imza kurulumunuzu 15 dakikada tamamlar. Ödemenizi teslimat esnasında Nakit veya Tüm Banka Kartlarına Tek Çekim / Taksitli POS Cihazı ile yapabilirsiniz.'}
                      </p>
                    </div>
                  )}

                </div>

                {/* 4. Mandatory Legal Agreements (BDDK & Sanal POS Compliance) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="legal_distance"
                      required
                      checked={agreedDistanceContract}
                      onChange={(e) => setAgreedDistanceContract(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5 cursor-pointer shrink-0"
                    />
                    <label htmlFor="legal_distance" className="text-zinc-600 dark:text-zinc-400 cursor-pointer leading-snug">
                      <a
                        href="/mesafeli-satis-sozlesmesi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700 inline"
                        onClick={(e) => {
                          if (onNavigateToLegal && (e.ctrlKey || e.metaKey || e.button === 1)) {
                            // let open in new tab
                            return;
                          }
                          // user can click to open or right click to open in tab
                        }}
                      >
                        Mesafeli Satış Sözleşmesi
                      </a>
                      {' '}ve{' '}
                      <a
                        href="/on-bilgilendirme-formu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700 inline"
                      >
                        Ön Bilgilendirme Formu
                      </a>
                      'nu okudum, anladım ve kabul ediyorum.
                    </label>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="legal_kvkk"
                      required
                      checked={agreedKvkk}
                      onChange={(e) => setAgreedKvkk(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5 cursor-pointer shrink-0"
                    />
                    <label htmlFor="legal_kvkk" className="text-zinc-600 dark:text-zinc-400 cursor-pointer leading-snug">
                      6698 Sayılı{' '}
                      <a
                        href="/kvkk-aydinlatma-metni"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700 inline"
                      >
                        KVKK Aydınlatma Metni
                      </a>
                      {' '}kapsamında kişisel verilerimin işlenmesine ve elektronik imza sertifika üretimine onay veriyorum.
                    </label>
                  </div>
                </div>

                {/* Submit Payment CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>{grandTotal.toLocaleString('tr-TR')} ₺ • Güvenli Ödemeyi Tamamla</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

              </div>

              {/* RIGHT COLUMN: Sticky Order Summary & Trust Sidebar (Span 4) */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                
                {/* Order Summary Box */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Sipariş Özeti ({totalQuantity} Ürün)
                    </span>
                    <button
                      type="button"
                      onClick={onClearCart}
                      className="text-[11px] text-zinc-400 hover:text-red-500 transition cursor-pointer"
                    >
                      Sepeti Boşalt
                    </button>
                  </div>

                  {/* Cart Items List with Stepper */}
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-72 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.package.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <strong className="text-zinc-900 dark:text-white truncate block font-bold">
                            {item.package.name}
                          </strong>
                          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block mt-0.5">
                            {item.package.duration} Sertifika
                          </span>
                          
                          {/* Stepper */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="inline-flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5 bg-slate-50 dark:bg-zinc-800">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.package.id, item.quantity - 1)}
                                className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-bold text-xs px-2 text-zinc-900 dark:text-white font-mono">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.package.id, item.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.package.id)}
                              className="p-1 text-zinc-400 hover:text-red-500 transition cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <span className="font-mono text-sm font-extrabold text-blue-600 dark:text-blue-400 block">
                            {(item.package.price * item.quantity).toLocaleString('tr-TR')} ₺
                          </span>
                          <span className="text-[10px] text-zinc-400">+ KDV</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Ara Toplam (KDV Hariç)</span>
                      <span className="font-mono font-medium">{subtotal.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>KDV (%20)</span>
                      <span className="font-mono font-medium">{kdvAmount.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Teslimat & Kurulum</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">ÜCRETSİZ</span>
                    </div>
                    <div className="pt-2.5 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-baseline">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">Genel Toplam</span>
                      <div className="text-right">
                        <span className="font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400 block">
                          {grandTotal.toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="text-[10px] text-zinc-400">KDV Dahil Net Tutar</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Trust & Guarantee Badges Card */}
                <div className="p-5 rounded-3xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-3 text-xs text-blue-950 dark:text-blue-200">
                  <div className="flex items-center gap-2.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>5070 Sayılı Elektronik İmza Kanunu Uygunluğu</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>ArkSigner & Arkimza Resmi Yetkili Bayii</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-400">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Ankara Geneli 15 Dakikada Adreste Teslimat</span>
                  </div>
                </div>

                {/* Need Help Box */}
                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2.5">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>Sipariş Öncesi Danışmak İster misiniz?</span>
                  </div>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    E-İmza uzman temsilcimiz telefonda veya WhatsApp hattımızda sorularınızı yanıtlamaya hazırdır.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${settings.phone}`}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-center font-bold text-[11px] text-zinc-900 dark:text-white transition flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{settings.phoneDisplay || 'Hemen Ara'}</span>
                    </a>
                    <a
                      href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20odeme%20sayfasindayim%20ve%20e-imza%20hakkinda%20sorum%20var.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-center font-bold text-[11px] text-white transition flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

              </div>

            </form>
          </div>
        )}

      </main>

      {/* Checkout Footer with Standalone Dedicated Legal Page Links */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 text-xs text-zinc-500 text-center space-y-3">
        <div className="max-w-[1300px] mx-auto px-4 flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <a href="/mesafeli-satis-sozlesmesi" target="_blank" rel="noopener noreferrer" className="hover:underline text-zinc-600 dark:text-zinc-400 hover:text-blue-600">
            Mesafeli Satış Sözleşmesi
          </a>
          <span>•</span>
          <a href="/on-bilgilendirme-formu" target="_blank" rel="noopener noreferrer" className="hover:underline text-zinc-600 dark:text-zinc-400 hover:text-blue-600">
            Ön Bilgilendirme Formu
          </a>
          <span>•</span>
          <a href="/kvkk-aydinlatma-metni" target="_blank" rel="noopener noreferrer" className="hover:underline text-zinc-600 dark:text-zinc-400 hover:text-blue-600">
            KVKK Aydınlatma Metni
          </a>
          <span>•</span>
          <a href="/gizlilik-politikasi" target="_blank" rel="noopener noreferrer" className="hover:underline text-zinc-600 dark:text-zinc-400 hover:text-blue-600">
            Gizlilik ve Güvenlik
          </a>
          <span>•</span>
          <a href="/iptal-ve-iade-kosullari" target="_blank" rel="noopener noreferrer" className="hover:underline text-zinc-600 dark:text-zinc-400 hover:text-blue-600">
            Teslimat, İptal ve İade
          </a>
        </div>
        <p className="text-[10px] text-zinc-400">
          © {new Date().getFullYear()} {settings.companyName || 'E-DİJİTAL FİNANS'}. Tüm hakları saklıdır. 256-Bit SSL Sertifikası ile ödemeleriniz güvence altındadır.
        </p>
      </footer>

    </div>
  );
};

export default CheckoutPage;
