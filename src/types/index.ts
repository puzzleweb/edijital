export type DeliveryType = 'magaza' | 'ankara_yerinde' | 'kurye' | 'kargo' | (string & {});
export type ApplicationStatus = 'yeni' | 'inceleniyor' | 'onaylandi' | 'hazirlaniyor' | 'hazirlandi' | 'kargolandi' | 'teslim_edildi' | 'iptal';
export type OrderStatus = 'yeni' | 'inceleniyor' | 'onaylandi' | 'hazirlaniyor' | 'hazirlandi' | 'kargolandi' | 'teslim_edildi' | 'iptal';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash_on_delivery';
export type PaymentStatus = 'odendi' | 'havale_bekleniyor' | 'kapida_odeme' | 'odenmedi';
export type PackageCategory = 'bireysel' | 'kurumsal' | 'mali_muhur' | (string & {});

export interface Package {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  category: PackageCategory;
  popular?: boolean;
  badge?: string;
  description: string;
  features: string[];
}

export interface CartItem {
  package: Package;
  quantity: number;
}

export interface SignedLegalContract {
  slug: string;
  title: string;
  agreedAt: string;
  contentHtml: string;
}

export interface Order {
  id: string;
  orderNumber?: string; // e.g. 'EDF-74892'
  trackingCode: string; // Alias to orderNumber
  fullName: string;
  tcVkn: string;
  phone: string;
  email?: string;
  isCorporate: boolean;
  companyName?: string;
  taxOffice?: string;
  packageId: string;
  packageName: string;
  duration: string;
  price: number;
  quantity?: number;
  totalAmount?: number;
  items?: CartItem[];
  deliveryType: DeliveryType;
  deliveryTitle?: string;
  address: string;
  city: string;
  district: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  cardLast4?: string;
  notes?: string;
  adminNotes?: string;
  status: OrderStatus;
  signedContracts?: SignedLegalContract[];
  legalAgreedAt?: string;
  posTransactionUid?: string;
  posAuthCode?: string;
  posInstallment?: number;
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility alias for Application
export type Application = Order;

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SectionVisibility {
  announcement: boolean;
  hero: boolean;
  features: boolean;
  quickForm: boolean;
  pricing: boolean;
  compatibility: boolean;
  about: boolean;
  faq: boolean;
  contact: boolean;
}

export interface ThemeConfig {
  primaryColor: string;
  showPatterns: boolean;
  enableGlow: boolean;
  cardRadius: 'rounded-md' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
}

export interface DeliveryOptionItem {
  id: string;
  title: string;
  description: string;
  type?: DeliveryType | string;
  badge?: string;
  active: boolean;
}

export interface SiteSettings {
  companyName: string;
  officialPartner: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  address: string;
  addressDetail: string;
  district: string;
  city: string;
  workingHours: string;
  workingDays: string;
  mapEmbedUrl?: string;
  mapLocationQuery?: string;
  
  // Delivery & Service Methods
  deliveryOptions?: DeliveryOptionItem[];

  // Hero Section
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText?: string;
  heroSecondaryButtonText?: string;

  // Announcement
  announcementText: string;
  announcementActive: boolean;
  minDeliveryTime: string;

  // Header & Navigation
  headerTagline?: string;
  headerShowTrack?: boolean;
  headerShowApply?: boolean;

  // Quick Form Section
  quickFormTitle?: string;
  quickFormSubtitle?: string;
  quickFormBadge?: string;
  quickFormCardTitle?: string;
  quickFormCardSubtitle?: string;

  // About Section
  aboutTitle?: string;
  aboutP1?: string;
  aboutP2?: string;
  aboutP3?: string;

  // FAQ Section
  faqTitle?: string;
  faqSubtitle?: string;
  faqs?: FaqItem[];

  // Footer Section
  footerAbout?: string;
  copyrightText?: string;

  // Section Visibility Toggles
  sections?: SectionVisibility;

  // Theme & Styling Customization
  theme?: ThemeConfig;

  // Bank & Payment Information
  bankName?: string;
  iban?: string;
  ibanRecipient?: string;
  bankBranch?: string;
  bankTransferNote?: string;
  bankTransferActive?: boolean;
  creditCardActive?: boolean;
  posProvider?: string;
  posDescription?: string;
  require3dSecure?: boolean;
  cashOnDeliveryActive?: boolean;
  cashOnDeliveryNote?: string;

  // İşyerim POS Entegrasyon Ayarları
  isyerimPosActive?: boolean;
  isyerimPosTestMode?: boolean; // true = Test Ortamı, false = Gerçek Ortam
  isyerimPosMerchantId?: string;
  isyerimPosUserId?: string;
  isyerimPosApiKey?: string;
  isyerimPosReflectCost?: 'null' | 'true' | 'false' | null;
  isyerimPosInstallmentsActive?: boolean;

  // Editable Legal Documents (HTML content)
  legalDocuments?: Record<string, {
    title?: string;
    description?: string;
    badge?: string;
    contentHtml?: string;
    updatedAt?: string;
  }>;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

// İşyerim POS Model Tanımları
export interface IsyerimInstallmentItem {
  Installment: number;
  Amount: number;
  WithdrawAmount: number;
  CostRate: number;
  CostAmount: number;
  CostAmount2: number;
  NetAmount: number;
  NetAmount2: number;
}

export interface IsyerimCardInfo {
  BankId?: number;
  BankName?: string;
  CardModel?: number;
  CardType?: number;
  CardSchema?: number;
  CardBrand?: number;
  IsBusinessCard?: boolean;
  IsCreditCard?: boolean;
  CanInstallment?: boolean;
  LogoUrl?: string;
}

export interface IsyerimInstallmentResult {
  Installments: IsyerimInstallmentItem[];
  CardInfo?: IsyerimCardInfo;
}

export interface IsyerimPayResponse {
  Uid?: string;
  PaymentLink?: string;
  ResponseAsHtml?: string;
  OrderId?: string;
  Status?: number;
  AuthCode?: string;
  Message?: string;
  ErrorCode?: number;
  IsDone: boolean;
}

