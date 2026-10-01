import { Application, Package, ContactMessage, SiteSettings, ActivityLog, DeliveryOptionItem, DeliveryType } from '../types';
import { SupabaseService } from './supabaseService';
import { supabase } from './supabase';

export const STORAGE_KEYS = {
  APPLICATIONS: 'edijital_applications_v7',
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
        window.dispatchEvent(new Event(event.data.type));
      }
    };
  }
} catch {
  // ignore
}

export const notifyUpdated = (eventName: string) => {
  window.dispatchEvent(new Event(eventName));
  if (bc) {
    try {
      bc.postMessage({ type: eventName });
    } catch {
      // ignore
    }
  }
};

export const DEFAULT_DELIVERY_OPTIONS: DeliveryOptionItem[] = [
  {
    id: 'del-1',
    title: 'Ankara Adreste Yerinde Teslim & Kurulum',
    description: 'Adresinize gelip kimlik doğrulamanızı ve kurulumunuzu yapıyoruz.',
    type: 'ankara_yerinde',
    badge: 'Tavsiye Edilen',
    active: true
  },
  {
    id: 'del-2',
    title: 'Ostim Mağazadan 15 Dk Elden Teslim',
    description: 'Ostim ofisimizden hemen 15 dakikada elden teslim alın.',
    type: 'magaza',
    badge: 'Hızlı Teslimat',
    active: true
  },
  {
    id: 'del-3',
    title: 'Hızlı Kargo ile Adrese Teslimat',
    description: 'Tüm Türkiye geneli güvenli kurye / kargo ile adrese teslim.',
    type: 'kargo',
    badge: 'Türkiye Geneli',
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
  address: 'Ostim OSB, 100. Yıl Blv PRESTİJ PLAZA NO:55 A BLOK 20 KAT:2, 06374',
  addressDetail: 'Yenimahalle / ANKARA',
  district: 'Yenimahalle / ANKARA',
  city: 'ANKARA',
  workingHours: '09:00 – 17:00',
  workingDays: 'Pazartesi - Cuma',
  mapLocationQuery: '39.969709, 32.744914',
  mapEmbedUrl: '',
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
      if (cloudPackages && cloudPackages.length === 2) {
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(cloudPackages));
        notifyUpdated('edijital_packages_updated');
      }

      // 3. Applications
      const cloudApps = await SupabaseService.getApplications();
      if (cloudApps) {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(cloudApps));
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
        sections: {
          ...DEFAULT_SETTINGS.sections,
          ...(parsed.sections || {})
        },
        theme: {
          ...DEFAULT_SETTINGS.theme,
          ...(parsed.theme || {})
        },
        deliveryOptions: (parsed.deliveryOptions && parsed.deliveryOptions.length > 0)
          ? parsed.deliveryOptions
          : (parsed.theme?.deliveryOptions && parsed.theme.deliveryOptions.length > 0)
            ? parsed.theme.deliveryOptions
            : DEFAULT_DELIVERY_OPTIONS,
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
      if (!Array.isArray(parsed) || parsed.length !== 2 || parsed.some(p => p.id !== 'pkg-1-yil' && p.id !== 'pkg-3-yil')) {
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
    if (updatedPkg.id !== 'pkg-1-yil' && updatedPkg.id !== 'pkg-3-yil') return;
    const packages = this.getPackages();
    const index = packages.findIndex(p => p.id === updatedPkg.id);
    if (index !== -1) {
      packages[index] = updatedPkg;
    }
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
    notifyUpdated('edijital_packages_updated');
    // Async push to Supabase
    SupabaseService.updatePackage(updatedPkg).catch(console.error);
  },

  // ==========================================
  // APPLICATIONS
  // ==========================================
  getApplications(): Application[] {
    const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!data) {
      return [];
    }
    try {
      const list: Application[] = JSON.parse(data);
      return list.map(a => ({
        ...a,
        district: (a.district === 'Etimesgut' || a.district === 'Etimesgut / Eryaman' || a.district === 'Eryaman / Etimesgut') ? '' : a.district
      }));
    } catch {
      return [];
    }
  },

  addApplication(appData: Omit<Application, 'id' | 'trackingCode' | 'createdAt' | 'updatedAt' | 'status'>): Application {
    const apps = this.getApplications();
    const randomCode = 'EDF-' + Math.floor(10000 + Math.random() * 90000);
    const newApp: Application = {
      ...appData,
      id: `APP-${1000 + apps.length + 1}`,
      trackingCode: randomCode,
      status: 'yeni',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    apps.unshift(newApp);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    this.addLog('Yeni Başvuru', `${newApp.fullName} (${newApp.packageName} - ${newApp.trackingCode})`, 'Müşteri');
    notifyUpdated('edijital_applications_updated');

    // Async push to Supabase
    SupabaseService.addApplication(appData).then(cloudApp => {
      if (cloudApp) {
        const currentApps = this.getApplications();
        const idx = currentApps.findIndex(a => a.trackingCode === newApp.trackingCode);
        if (idx !== -1) {
          currentApps[idx] = cloudApp;
          localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(currentApps));
          notifyUpdated('edijital_applications_updated');
        }
      }
    }).catch(console.error);

    return newApp;
  },

  updateApplicationStatus(id: string, status: Application['status'], adminNotes?: string): void {
    const apps = this.getApplications();
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index].status = status;
      if (adminNotes !== undefined) {
        apps[index].adminNotes = adminNotes;
      }
      apps[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
      notifyUpdated('edijital_applications_updated');
      
      // Async push to Supabase
      SupabaseService.updateApplicationStatus(id, status, adminNotes).catch(console.error);
    }
  },

  deleteApplication(id: string): void {
    let apps = this.getApplications();
    apps = apps.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    notifyUpdated('edijital_applications_updated');

    // Async delete from Supabase
    SupabaseService.deleteApplication(id).catch(console.error);
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
