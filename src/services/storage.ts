import { 
  Order, 
  Application, 
  CartItem, 
  Package, 
  ContactMessage, 
  SiteSettings, 
  ActivityLog, 
  DeliveryOptionItem, 
  DeliveryType,
  OrderStatus,
  PaymentStatus,
  PaymentMethod
} from '../types';
import { SupabaseService } from './supabaseService';
import { supabase } from './supabase';

export const STORAGE_KEYS = {
  APPLICATIONS: 'edijital_orders_v8',
  ORDERS: 'edijital_orders_v8',
  CART: 'edijital_cart_v8',
  PACKAGES: 'edijital_packages_v7',
  MESSAGES: 'edijital_messages_v7',
  SETTINGS: 'edijital_settings_v7',
  LOGS: 'edijital_logs_v7',
  AUTH: 'edijital_admin_auth_v7',
  USER_ROLE: 'edijital_admin_role_v7',
  USER_EMAIL: 'edijital_admin_email_v7',
  DARK_MODE: 'edijital_theme_dark_v7'
};

// Cross-tab and window instant broadcast channel
let bc: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    bc = new BroadcastChannel('edijital_sync_channel');
    bc.onmessage = (event) => {
      if (event.data && event.data.type) {
        window.dispatchEvent(new CustomEvent(event.data.type, { detail: event.data.payload }));
      }
    };
  }
} catch {
  // ignore
}

export const notifyUpdated = (eventName: string, payload?: any) => {
  window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
  if (bc) {
    try {
      bc.postMessage({ type: eventName, payload });
    } catch {
      // ignore
    }
  }
};

export const DEFAULT_DELIVERY_OPTIONS: DeliveryOptionItem[] = [
  {
    id: 'del-3',
    title: 'Hızlı Kargo ile Adrese Teslimat',
    description: 'Tüm Türkiye geneline güvenli, sigortalı kurye ve kargo ile adrese teslim.',
    type: 'kargo',
    badge: 'Tüm Türkiye',
    active: true
  }
];

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: 'E-DİJİTAL FİNANS',
  officialPartner: 'ArkSigner & Arkimza Yetkili İş Ortağı',
  phone: '05459603303',
  phoneDisplay: '0545 960 33 03',
  whatsapp: '905459603303',
  email: 'edijitalfinans@gmail.com',
  address: 'Ostim OSB, 100. Yıl Blv. Prestij Plaza No:55 A Blok No:20 Kat:2',
  addressDetail: 'Yenimahalle / ANKARA',
  district: 'Yenimahalle / ANKARA',
  city: 'ANKARA',
  workingHours: '09:00 – 17:00',
  workingDays: 'Pazartesi - Cuma',
  mapLocationQuery: '39.969709, 32.744914',
  mapEmbedUrl: '',
  bankName: 'Ziraat Bankası',
  bankBranch: 'Ostim Şubesi (Kod: 1042)',
  iban: 'TR12 0006 2000 0001 2345 6789 01',
  ibanRecipient: 'E-DİJİTAL FİNANS DANIŞMANLIK LİMİTED ŞİRKETİ',
  bankTransferNote: 'Lütfen Havale/EFT açıklama kısmına sipariş takip numaranızı (Örn: EDF-12345) yazınız.',
  bankTransferActive: true,
  creditCardActive: true,
  posProvider: '256-Bit SSL & 3D Secure Sanal POS',
  posDescription: 'Tüm Visa, MasterCard ve Troy kartlarla güvenli anında ödeme.',
  require3dSecure: true,
  cashOnDeliveryActive: false,
  cashOnDeliveryNote: 'Teslimat anında nakit veya temassız pos ile ödeme.',

  // İşyerim POS Entegrasyon Bilgileri
  isyerimPosActive: true,
  isyerimPosTestMode: true,
  isyerimPosMerchantId: '11039',
  isyerimPosUserId: '445',
  isyerimPosApiKey: 'AQAAAAEAACcQAAAAEBfEWS9XGrZta1wfYC1qeTCA2gJIbDH1+rQEdrY8k4qE8EFtWf3i0Axyb4jY2uReyw==',
  isyerimPosReflectCost: 'false',
  isyerimPosInstallmentsActive: true,
  deliveryOptions: DEFAULT_DELIVERY_OPTIONS,
  heroBadge: 'Ankara İçi 15 Dakikada Adrese / Mağazada Teslimat',
  heroTitle: 'Hızlı, Güvenilir ve Resmi E-İmza Hizmeti',
  heroSubtitle: '5070 Sayılı Kanun kapsamında %100 yasal geçerli Nitelikli Elektronik Sertifika (NES). Ostim ofisimizden 15 dakikada elden teslim alın veya Ankara genelinde adrese teslim kurye hizmetimizden yararlanın.',
  heroButtonText: 'Hemen E-İmza Başvurusu',
  heroSecondaryButtonText: 'Paket Fiyatlarını Gör',
  announcementText: 'Ankara geneli adrese hemen teslim ve yerinde kurulum hizmeti. İletişim: 0545 960 33 03',
  announcementActive: true,
  minDeliveryTime: '15 Dakika',
  headerTagline: 'ArkSigner & Arkimza Yetkili İş Ortağı',
  headerShowTrack: true,
  headerShowApply: true,
  quickFormTitle: 'E-İmza Satın Al',
  quickFormSubtitle: 'Ücretsiz ön bilgi ve hızlı başvuru için formu doldurun. Uzmanlarımız 5 dakika içinde arasın.',
  quickFormBadge: 'HIZLI FORM',
  quickFormCardTitle: 'E-İmzanız 15 Dakikada Hazırlansın',
  quickFormCardSubtitle: 'Formu doldurun; ofisimizden hemen teslim alın veya Ankara geneli adresinize getirelim.',
  aboutTitle: 'ARKSİGNER E-İMZA YETKİLİ İŞ ORTAĞI',
  aboutP1: 'Firmamız, güvenli e imza çözümleri alanında hızlı ve güvenilir hizmet sunmak amacıyla kurulmuştur. Arkimza’nın bayisi olarak, yasal mevzuatlara uygun, kaliteli ve sürdürülebilir elektronik imza hizmetleri ile müşterilerimize en doğru şekilde ulaşmayı hedefliyoruz.',
  aboutP2: 'Ankara genelinde hemen teslim, yerinde teslim ve mağaza teslim seçeneklerimizle, zaman kaybetmeden e-İmzanıza ulaşmanızı sağlıyoruz. İhtiyacınıza göre adresinize gelerek teslimat yapıyor veya mağazamızdan elden teslim imkânı sunuyoruz.',
  aboutP3: 'Böylece hem bireysel hem de kurumsal müşteriler için hızlı, pratik ve güvenli bir süreç oluşturuyoruz. Müşteri memnuniyetini ön planda tutan yaklaşımımızla; satış öncesi bilgilendirme, kurulum desteği ve satış sonrası teknik destek hizmetlerini eksiksiz sunuyoruz.',
  faqTitle: 'Sıkça Sorulan Sorular',
  faqSubtitle: 'E-İmza süreci, fiyatlandırma, kurulum ve teslimat hakkında aklınıza takılan tüm soruların yanıtları.',
  faqs: [
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
  ],
  footerAbout: 'Arkimza ve ArkSigner yetkili iş ortağı olarak Ankara genelinde hızlı, güvenilir ve yasal mevzuata uygun e-İmza çözümleri sunuyoruz.',
  copyrightText: `© ${new Date().getFullYear()} E-DİJİTAL FİNANS. Tüm hakları saklıdır.`,
  sections: {
    announcement: true,
    hero: true,
    features: true,
    quickForm: true,
    pricing: true,
    compatibility: true,
    about: true,
    faq: true,
    contact: true
  },
  theme: {
    primaryColor: '#0080c8',
    showPatterns: true,
    enableGlow: true,
    cardRadius: 'rounded-2xl'
  }
};

// SADECE 2 PAKET: 1 YILLIK VE 3 YILLIK
const ONLY_PACKAGES: Package[] = [
  {
    id: 'pkg-1-yil',
    name: '1 Yıllık E-İmza',
    duration: '1 Yıl',
    price: 890,
    originalPrice: 1100,
    category: 'bireysel',
    popular: false,
    badge: '1 Yıllık',
    description: 'Bireysel ve kurumsal tüm işlemleriniz için güvenli e-imza çözümü.',
    features: [
      'Ankara\'da yerinde kurulum imkânı',
      '10 dakikada hazırlanır, 15 dakikada teslim',
      'E-Devlet, e-Fatura, KEP uyumlu',
      'Kurumsal ve bireysel kullanım için ideal',
      'Ücretsiz destek ve kurulum rehberliği',
      '1 Yıl Süreli Ekonomik E imza'
    ]
  },
  {
    id: 'pkg-3-yil',
    name: '3 Yıllık E-İmza',
    duration: '3 Yıl',
    price: 1790,
    originalPrice: 2400,
    category: 'bireysel',
    popular: true,
    badge: 'En Çok Tercih Edilen',
    description: 'En avantajlı ve uzun ömürlü kullanım paketi.',
    features: [
      'Ankara\'da yerinde kurulum imkânı',
      '10 dakikada hazırlanır, 15 dakikada teslim',
      'E-Devlet, e-Fatura, KEP uyumlu',
      'Kurumsal ve bireysel kullanım için ideal',
      'Ücretsiz destek ve kurulum rehberliği',
      '3 Yıl Süreli Ekonomik E imza'
    ]
  }
];

export const StorageService = {
  // ==========================================
  // SYNC WITH SUPABASE CLOUD
  // ==========================================
  async syncWithSupabase(): Promise<void> {
    try {
      // 1. Settings
      const cloudSettings = await SupabaseService.getSettings();
      if (cloudSettings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(cloudSettings));
        notifyUpdated('edijital_settings_updated');
      }

      // 2. Packages
      const cloudPackages = await SupabaseService.getPackages();
      if (cloudPackages && cloudPackages.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(cloudPackages));
        notifyUpdated('edijital_packages_updated');
      }

      // 3. Applications / Orders
      const cloudApps = await SupabaseService.getApplications();
      if (cloudApps !== null) {
        // Supabase is the single source of truth
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(cloudApps));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(cloudApps));
        notifyUpdated('edijital_applications_updated');
      }

      // 4. Messages
      const cloudMessages = await SupabaseService.getMessages();
      if (cloudMessages) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(cloudMessages));
        notifyUpdated('edijital_messages_updated');
      }
    } catch (err) {
      console.warn('Supabase senkronizasyon uyarısı:', err);
    }
  },

  // ==========================================
  // SETTINGS
  // ==========================================
  getSettings(): SiteSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        isyerimPosReflectCost: (parsed.isyerimPosReflectCost === 'true' || parsed.isyerimPosReflectCost === 'null')
          ? parsed.isyerimPosReflectCost
          : 'false',
        sections: {
          ...DEFAULT_SETTINGS.sections,
          ...(parsed.sections || {})
        },
        theme: {
          ...DEFAULT_SETTINGS.theme,
          ...(parsed.theme || {})
        },
        deliveryOptions: (() => {
          const raw = (parsed.deliveryOptions && parsed.deliveryOptions.length > 0)
            ? parsed.deliveryOptions
            : (parsed.theme?.deliveryOptions && parsed.theme.deliveryOptions.length > 0)
              ? parsed.theme.deliveryOptions
              : DEFAULT_DELIVERY_OPTIONS;
          const filtered = raw.filter((d: any) => d.id !== 'del-1' && d.id !== 'del-2' && !d.title?.includes('Ostim') && !d.title?.includes('Ankara Adreste'));
          return filtered.length > 0 ? filtered : DEFAULT_DELIVERY_OPTIONS;
        })(),
        faqs: parsed.faqs && parsed.faqs.length > 0 ? parsed.faqs : DEFAULT_SETTINGS.faqs
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  updateSettings(settings: SiteSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    notifyUpdated('edijital_settings_updated');
    // Async push to Supabase
    SupabaseService.updateSettings(settings).catch(console.error);
  },

  // ==========================================
  // PACKAGES
  // ==========================================
  getPackages(): Package[] {
    const data = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(ONLY_PACKAGES));
      return ONLY_PACKAGES;
    }
    try {
      const parsed: Package[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(ONLY_PACKAGES));
        return ONLY_PACKAGES;
      }
      return parsed;
    } catch {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(ONLY_PACKAGES));
      return ONLY_PACKAGES;
    }
  },

  updatePackage(updatedPkg: Package): void {
    const packages = this.getPackages();
    const index = packages.findIndex(p => p.id === updatedPkg.id);
    if (index !== -1) {
      packages[index] = updatedPkg;
    } else {
      packages.push(updatedPkg);
    }
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
    notifyUpdated('edijital_packages_updated');
    // Async push to Supabase
    SupabaseService.updatePackage(updatedPkg).catch(console.error);
  },

  addPackage(newPkgData: Omit<Package, 'id'> | Package): Package {
    const packages = this.getPackages();
    const newPkg: Package = {
      ...newPkgData,
      id: ('id' in newPkgData && newPkgData.id) ? newPkgData.id : `pkg-${Date.now()}`
    };
    packages.push(newPkg);
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
    notifyUpdated('edijital_packages_updated');
    // Async push to Supabase
    SupabaseService.updatePackage(newPkg).catch(console.error);
    return newPkg;
  },

  deletePackage(id: string): void {
    const packages = this.getPackages();
    const filtered = packages.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(filtered));
    notifyUpdated('edijital_packages_updated');
    // Async push to Supabase
    SupabaseService.deletePackage(id).catch(console.error);
  },

  // ==========================================
  // SHOPPING CART (SEPET)
  // ==========================================
  getCart(): import('../types').CartItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveCart(items: import('../types').CartItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
    notifyUpdated('edijital_cart_updated');
  },

  addToCart(pkg: Package, quantity: number = 1): import('../types').CartItem[] {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.package.id === pkg.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ package: pkg, quantity: Math.max(1, quantity) });
    }
    this.saveCart(cart);
    return cart;
  },

  updateCartQuantity(pkgId: string, quantity: number): import('../types').CartItem[] {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter(item => item.package.id !== pkgId);
    } else {
      const item = cart.find(i => i.package.id === pkgId);
      if (item) {
        item.quantity = quantity;
      }
    }
    this.saveCart(cart);
    return cart;
  },

  removeFromCart(pkgId: string): import('../types').CartItem[] {
    const cart = this.getCart().filter(item => item.package.id !== pkgId);
    this.saveCart(cart);
    return cart;
  },

  clearCart(): void {
    this.saveCart([]);
  },

  getCartCount(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  getCartTotal(): number {
    return this.getCart().reduce((sum, item) => sum + (item.package.price * item.quantity), 0);
  },

  // ==========================================
  // ORDERS (ONLINE SİPARİŞLER)
  // ==========================================
  getOrders(): Order[] {
    let data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    let list: any[] = [];
    try {
      if (data) list = JSON.parse(data);
    } catch {
      list = [];
    }

    if (!Array.isArray(list) || list.length === 0) {
      return [];
    }

    try {
      return list.map(a => {
        const notesLower = String(a.notes || '').toLowerCase();
        let method: PaymentMethod = 'credit_card';
        if (a.paymentMethod === 'bank_transfer' || notesLower.includes('bank_transfer') || notesLower.includes('havale') || notesLower.includes('eft')) {
          method = 'bank_transfer';
        } else if (a.paymentMethod === 'cash_on_delivery' || notesLower.includes('cash_on_delivery') || notesLower.includes('kapıda') || notesLower.includes('kapida')) {
          method = 'cash_on_delivery';
        } else if (a.paymentMethod === 'credit_card') {
          method = 'credit_card';
        }

        let payStatus: PaymentStatus = 'odendi';
        if (a.paymentStatus) {
          payStatus = a.paymentStatus;
        } else if (method === 'bank_transfer' || notesLower.includes('bekliyor')) {
          payStatus = 'havale_bekleniyor';
        } else if (method === 'cash_on_delivery') {
          payStatus = 'kapida_odeme';
        }

        return {
          ...a,
          orderNumber: a.orderNumber || a.trackingCode || `EDF-${Math.floor(10000 + Math.random() * 90000)}`,
          trackingCode: a.trackingCode || a.orderNumber || `EDF-${Math.floor(10000 + Math.random() * 90000)}`,
          quantity: a.quantity || 1,
          totalAmount: a.totalAmount || a.price || 0,
          paymentMethod: method,
          paymentStatus: payStatus,
          district: (a.district === 'Etimesgut' || a.district === 'Etimesgut / Eryaman' || a.district === 'Eryaman / Etimesgut') ? '' : a.district
        };
      });
    } catch {
      return [];
    }
  },

  getApplications(): Application[] {
    return this.getOrders();
  },

  addOrder(orderData: {
    fullName: string;
    tcVkn: string;
    phone: string;
    email?: string;
    isCorporate?: boolean;
    companyName?: string;
    taxOffice?: string;
    packageId?: string;
    packageName?: string;
    duration?: string;
    price?: number;
    quantity?: number;
    totalAmount?: number;
    items?: import('../types').CartItem[];
    deliveryType?: DeliveryType;
    deliveryTitle?: string;
    address?: string;
    city?: string;
    district?: string;
    paymentMethod?: import('../types').PaymentMethod;
    paymentStatus?: import('../types').PaymentStatus;
    cardLast4?: string;
    notes?: string;
    signedContracts?: import('../types').SignedLegalContract[];
    legalAgreedAt?: string;
    posTransactionUid?: string;
    posAuthCode?: string;
    posInstallment?: number;
  }): Order {
    const orders = this.getOrders();
    const randomCode = 'EDF-' + Math.floor(10000 + Math.random() * 90000);
    
    const primaryItem = orderData.items?.[0];
    const pkgName = orderData.packageName || (orderData.items && orderData.items.length > 0 
      ? orderData.items.map(i => `${i.package.name} (x${i.quantity})`).join(', ') 
      : 'E-İmza Paketi');
    const pkgId = orderData.packageId || primaryItem?.package.id || 'pkg-1-yil';
    const duration = orderData.duration || primaryItem?.package.duration || '1 Yıl';
    const total = orderData.totalAmount || orderData.price || 0;

    const newOrder: Order = {
      id: `ORD-${1000 + orders.length + 1}`,
      orderNumber: randomCode,
      trackingCode: randomCode,
      fullName: orderData.fullName,
      tcVkn: orderData.tcVkn,
      phone: orderData.phone,
      email: orderData.email || '',
      isCorporate: Boolean(orderData.isCorporate),
      companyName: orderData.companyName,
      taxOffice: orderData.taxOffice,
      packageId: pkgId,
      packageName: pkgName,
      duration: duration,
      price: total,
      quantity: orderData.quantity || 1,
      totalAmount: total,
      items: orderData.items || [],
      deliveryType: orderData.deliveryType || 'ankara_yerinde',
      deliveryTitle: orderData.deliveryTitle,
      address: orderData.address || 'Adres belirtilmedi',
      city: orderData.city || 'ANKARA',
      district: orderData.district || '',
      paymentMethod: orderData.paymentMethod || 'credit_card',
      paymentStatus: orderData.paymentStatus || 'odendi',
      cardLast4: orderData.cardLast4,
      notes: orderData.notes,
      signedContracts: orderData.signedContracts,
      legalAgreedAt: orderData.legalAgreedAt || (orderData.signedContracts ? new Date().toISOString() : undefined),
      posTransactionUid: orderData.posTransactionUid,
      posAuthCode: orderData.posAuthCode,
      posInstallment: orderData.posInstallment,
      status: 'yeni',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    
    const paymentLabel = 
      newOrder.paymentMethod === 'credit_card' ? 'Kredi Kartı (Ödendi)' :
      newOrder.paymentMethod === 'bank_transfer' ? 'Havale/EFT (Bekliyor)' : 'Kapıda Ödeme';

    this.addLog('Yeni Online Sipariş', `${newOrder.fullName} (${newOrder.packageName} - ${newOrder.totalAmount} ₺ - ${paymentLabel})`, 'Müşteri');
    notifyUpdated('edijital_new_order_placed', newOrder);
    notifyUpdated('edijital_applications_updated');

    // Async push to Supabase Cloud
    SupabaseService.addApplication({
      fullName: newOrder.fullName,
      tcVkn: newOrder.tcVkn,
      phone: newOrder.phone,
      email: newOrder.email,
      isCorporate: newOrder.isCorporate,
      companyName: newOrder.companyName,
      taxOffice: newOrder.taxOffice,
      packageId: newOrder.packageId,
      packageName: newOrder.packageName,
      duration: newOrder.duration,
      price: newOrder.totalAmount ?? newOrder.price ?? 0,
      deliveryType: newOrder.deliveryType,
      address: newOrder.address,
      city: newOrder.city,
      district: newOrder.district,
      notes: `[Sipariş: ${newOrder.orderNumber}] Ödeme: ${paymentLabel}${newOrder.cardLast4 ? ' (Son 4 hane: ' + newOrder.cardLast4 + ')' : ''} | ${newOrder.deliveryTitle || newOrder.deliveryType}${newOrder.notes ? ' | Not: ' + newOrder.notes : ''}`
    }).then(cloudApp => {
      if (cloudApp) {
        const currentOrders = this.getOrders();
        const idx = currentOrders.findIndex(a => a.trackingCode === newOrder.trackingCode);
        if (idx !== -1) {
          currentOrders[idx] = {
            ...newOrder,
            id: cloudApp.id
          };
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(currentOrders));
          notifyUpdated('edijital_applications_updated');
        }
      }
    }).catch(console.error);

    return newOrder;
  },

  addApplication(appData: any): Application {
    return this.addOrder(appData);
  },

  updateOrderStatus(id: string, status: Order['status'], adminNotes?: string, paymentStatus?: import('../types').PaymentStatus): void {
    const orders = this.getOrders();
    const index = orders.findIndex(a => a.id === id);
    if (index !== -1) {
      orders[index].status = status;
      if (adminNotes !== undefined) {
        orders[index].adminNotes = adminNotes;
      }
      if (paymentStatus !== undefined) {
        orders[index].paymentStatus = paymentStatus;
      }
      orders[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      notifyUpdated('edijital_applications_updated');

      // Async push to Supabase
      SupabaseService.updateApplicationStatus(id, status, adminNotes).catch(console.error);
    }
  },

  updateApplicationStatus(id: string, status: Application['status'], adminNotes?: string): void {
    this.updateOrderStatus(id, status, adminNotes);
  },

  deleteOrder(id: string): void {
    let orders = this.getOrders();
    orders = orders.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    notifyUpdated('edijital_applications_updated');

    // Async delete from Supabase
    SupabaseService.deleteApplication(id).catch(console.error);
  },

  deleteApplication(id: string): void {
    this.deleteOrder(id);
  },

  // ==========================================
  // CONTACT MESSAGES
  // ==========================================
  getMessages(): ContactMessage[] {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  },

  addMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): ContactMessage {
    const messages = this.getMessages();
    const newMsg: ContactMessage = {
      ...msg,
      id: `MSG-${300 + messages.length + 1}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    messages.unshift(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    this.addLog('Yeni İletişim Mesajı', `${newMsg.name} (${newMsg.subject})`, 'Ziyaretçi');
    notifyUpdated('edijital_messages_updated');
    notifyUpdated('edijital_new_message_received', newMsg);

    // Async push to Supabase
    SupabaseService.addMessage(msg).catch(console.error);

    return newMsg;
  },

  markMessageAsRead(id: string): void {
    const messages = this.getMessages();
    const msg = messages.find(m => m.id === id);
    if (msg) {
      msg.read = true;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      notifyUpdated('edijital_messages_updated');
      SupabaseService.markMessageAsRead(id).catch(console.error);
    }
  },

  deleteMessage(id: string): void {
    let messages = this.getMessages();
    messages = messages.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    notifyUpdated('edijital_messages_updated');
    SupabaseService.deleteMessage(id).catch(console.error);
  },

  // ==========================================
  // ACTIVITY LOGS
  // ==========================================
  getLogs(): ActivityLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  },

  addLog(action: string, details: string, user: string = 'Sistem'): void {
    try {
      const logs = this.getLogs();
      const newLog: ActivityLog = {
        id: `LOG-${Date.now()}`,
        action,
        details,
        timestamp: new Date().toISOString(),
        user
      };
      logs.unshift(newLog);
      const trimmed = logs.slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(trimmed));
    } catch {
      // ignore
    }
  },

  // ==========================================
  // AUTH & ROLES
  // ==========================================
  isAdminAuthenticated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },

  getAdminEmail(): string {
    return localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || 'admin@edijitalfinans.com';
  },

  getAdminRole(): string {
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE) || 'admin';
  },

  setAdminAuthenticated(val: boolean, email?: string, role?: string): void {
    if (val) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      if (email) localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
      if (role) localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
      localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    }
  },

  async signOut(): Promise<void> {
    this.setAdminAuthenticated(false);
    await SupabaseService.signOut();
  }
};
