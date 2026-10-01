export type DeliveryType = 'magaza' | 'ankara_yerinde' | 'kurye' | 'kargo' | (string & {});
export type ApplicationStatus = 'yeni' | 'inceleniyor' | 'onaylandi' | 'hazirlandi' | 'teslim_edildi' | 'iptal';
export type PackageCategory = 'bireysel' | 'kurumsal';

export interface Package {
  id: string;
  name: string;
  duration: '1 Yıl' | '3 Yıl';
  price: number;
  originalPrice?: number;
  category: PackageCategory;
  popular?: boolean;
  badge?: string;
  description: string;
  features: string[];
}

export interface Application {
  id: string;
  trackingCode: string;
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
  deliveryType: DeliveryType;
  address: string;
  city: string;
  district: string;
  notes?: string;
  adminNotes?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

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
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}
