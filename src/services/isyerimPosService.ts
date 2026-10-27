import { SiteSettings, IsyerimInstallmentResult, IsyerimPayResponse } from '../types';
import { StorageService } from './storage';

// Varsayılan İşyerim POS Test Bilgileri (https://dev.isyerimpos.com)
export const DEFAULT_ISYERIM_CONFIG = {
  testMerchantId: '11039',
  testUserId: '445',
  testApiKey: 'AQAAAAEAACcQAAAAEBfEWS9XGrZta1wfYC1qeTCA2gJIbDH1+rQEdrY8k4qE8EFtWf3i0Axyb4jY2uReyw==',
  testApiUrl: 'https://apitest.isyerimpos.com/v1',
  prodApiUrl: 'https://api.isyerimpos.com/v1'
};

// dev.isyerimpos.com Test Kartları
export interface TestCardItem {
  bank: string;
  schema: string;
  cardNo: string;
  expiry: string;
  cvv: string;
  smsCode: string;
  recommended?: boolean;
}

export const ISYERIM_TEST_CARDS: TestCardItem[] = [
  {
    bank: 'Halk Bankası',
    schema: 'Visa',
    cardNo: '4531 4445 3144 2283',
    expiry: '12/26',
    cvv: '001',
    smsCode: 'a',
    recommended: true
  },
  {
    bank: 'QNB Finansbank',
    schema: 'Visa',
    cardNo: '4022 7740 2277 4026',
    expiry: '12/26',
    cvv: '000',
    smsCode: '123456',
    recommended: true
  },
  {
    bank: 'Halk Bankası',
    schema: 'MasterCard',
    cardNo: '5818 7758 1877 2285',
    expiry: '12/26',
    cvv: '001',
    smsCode: 'a'
  },
  {
    bank: 'Ziraat Bankası',
    schema: 'Visa',
    cardNo: '4546 7112 3456 7894',
    expiry: '12/26',
    cvv: '000',
    smsCode: 'a'
  },
  {
    bank: 'Ziraat Bankası',
    schema: 'MasterCard',
    cardNo: '5401 3412 3456 7891',
    expiry: '12/26',
    cvv: '000',
    smsCode: 'a'
  },
  {
    bank: 'QNB Finansbank',
    schema: 'Visa',
    cardNo: '4022 7740 2277 4026',
    expiry: '12/26',
    cvv: '000',
    smsCode: '123456'
  },
  {
    bank: 'İş Bankası',
    schema: 'Visa',
    cardNo: '4508 0345 0803 4509',
    expiry: '12/26',
    cvv: '001',
    smsCode: 'a'
  },
  {
    bank: 'Akbank',
    schema: 'Visa',
    cardNo: '4355 0930 0077 7068',
    expiry: '11/40',
    cvv: '313',
    smsCode: '123456'
  }
];

export interface IsyerimPaymentPayload {
  returnUrl: string;
  orderId: string;
  clientIp?: string;
  installment?: number;
  amount: number;
  is3d?: boolean;
  isAutoCommit?: boolean;
  reflectCost?: boolean | null;
  cardInfo: {
    cardOwner: string;
    cardNo: string;
    month: string;
    year: string;
    cvv: string;
  };
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    description?: string;
  };
  products?: Array<{
    name: string;
    count: number;
    unitPrice: number;
  }>;
}

export class IsyerimPosService {
  /**
   * Aktif konfigürasyonu döner (Ayarlardan veya varsayılan test bilgilerinden)
   */
  public static getConfig(customSettings?: SiteSettings) {
    const settings = customSettings || StorageService.getSettings();
    const isTestMode = settings.isyerimPosTestMode !== false; // Varsayılan: test modu açık

    const merchantId = (isTestMode 
      ? (settings.isyerimPosMerchantId || DEFAULT_ISYERIM_CONFIG.testMerchantId)
      : (settings.isyerimPosMerchantId || '')).trim();

    const userId = (isTestMode 
      ? (settings.isyerimPosUserId || DEFAULT_ISYERIM_CONFIG.testUserId)
      : (settings.isyerimPosUserId || '')).trim();

    const apiKey = (isTestMode 
      ? (settings.isyerimPosApiKey || DEFAULT_ISYERIM_CONFIG.testApiKey)
      : (settings.isyerimPosApiKey || '')).trim();

    // Browser ortamında CORS engelini aşmak için proxy endpoint'ini tercih et
    const baseUrl = isTestMode ? '/api/isyerimpos/test' : '/api/isyerimpos/prod';
    const directUrl = isTestMode ? DEFAULT_ISYERIM_CONFIG.testApiUrl : DEFAULT_ISYERIM_CONFIG.prodApiUrl;

    return {
      isActive: settings.creditCardActive !== false && settings.isyerimPosActive !== false,
      isTestMode,
      merchantId,
      userId,
      apiKey,
      baseUrl,
      directUrl,
      reflectCost: settings.isyerimPosReflectCost === 'true' 
        ? true 
        : settings.isyerimPosReflectCost === 'null' 
        ? null 
        : false,
      installmentsActive: settings.isyerimPosInstallmentsActive !== false
    };
  }

  /**
   * HTTP Headers
   */
  private static getHeaders(config: ReturnType<typeof IsyerimPosService.getConfig>) {
    return {
      'Content-Type': 'application/json',
      'MerchantId': config.merchantId,
      'UserId': config.userId,
      'ApiKey': config.apiKey
    };
  }

  /**
   * Taksit Seçeneklerini Sorgula (getInstallments)
   */
  public static async getInstallments(
    cardNumber: string,
    amount: number,
    reflectCost?: boolean | null
  ): Promise<IsyerimInstallmentResult | null> {
    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard.length < 6) return null;

    const config = this.getConfig();
    if (!config.merchantId || !config.userId || !config.apiKey) {
      console.warn('İşyerim POS: API bilgileri eksik.');
      return null;
    }

    const payload: Record<string, unknown> = {
      CardNumber: cleanCard,
      Amount: amount
    };
    if (reflectCost !== undefined) {
      payload.ReflectCost = reflectCost;
    }

    try {
      // 1. Önce proxy adresi üzerinden dene
      const res = await fetch(`${config.baseUrl}/getInstallments`, {
        method: 'POST',
        headers: this.getHeaders(config),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data && data.IsDone && data.Content) {
        return data.Content as IsyerimInstallmentResult;
      }
      return null;
    } catch (err) {
      console.warn('İşyerim POS getInstallments çağrısı başarısız oldu:', err);
      return null;
    }
  }

  /**
   * 3D Ödeme İsteği Başlat (payRequest3d)
   */
  public static async create3DPayment(
    payload: IsyerimPaymentPayload
  ): Promise<IsyerimPayResponse> {
    const config = this.getConfig();

    if (!config.merchantId || !config.userId || !config.apiKey) {
      return {
        IsDone: false,
        Message: 'İşyerim POS üye işyeri bilgileri eksik. Lütfen panelden API ayarlarını kontrol ediniz.'
      };
    }

    // Model eşlemesi (dev.isyerimpos.com spesifikasyonu)
    const requestBody = {
      ReturnUrl: payload.returnUrl,
      OrderId: payload.orderId,
      ClientIp: payload.clientIp || '127.0.0.1',
      Installment: payload.installment || 1,
      Amount: payload.amount,
      Is3D: payload.is3d !== false, // Varsayılan: 3D True
      IsAutoCommit: payload.isAutoCommit !== false, // Otomatik Onay True
      ReflectCost: payload.reflectCost !== undefined ? payload.reflectCost : config.reflectCost,
      CardInfo: {
        CardOwner: payload.cardInfo.cardOwner,
        CardNo: payload.cardInfo.cardNo.replace(/\D/g, ''),
        Month: payload.cardInfo.month.padStart(2, '0'),
        Year: payload.cardInfo.year.length === 4 ? payload.cardInfo.year.slice(-2) : payload.cardInfo.year,
        Cvv: payload.cardInfo.cvv
      },
      CustomerInfo: {
        Name: payload.customerInfo.name,
        Phone: payload.customerInfo.phone.replace(/\D/g, ''),
        Email: payload.customerInfo.email || 'musteri@edijitalfinans.com',
        Address: payload.customerInfo.address || 'Ankara',
        Description: payload.customerInfo.description || `Sipariş #${payload.orderId}`
      },
      Products: payload.products?.length ? payload.products.map(p => ({
        Name: p.name,
        Count: p.count,
        UnitPrice: p.unitPrice
      })) : [
        {
          Name: `E-İmza Siparişi (${payload.orderId})`,
          Count: 1,
          UnitPrice: payload.amount
        }
      ]
    };

    try {
      const res = await fetch(`${config.baseUrl}/payRequest3d`, {
        method: 'POST',
        headers: this.getHeaders(config),
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          IsDone: false,
          Message: `POS Sunucu Hatası: ${res.status} - ${errorText || 'İşlem başlatılamadı'}`
        };
      }

      const json = await res.json();
      if (!json) {
        return {
          IsDone: false,
          Message: 'POS yanıtı boş döndü.'
        };
      }

      if (json.IsDone && json.Content) {
        return {
          IsDone: true,
          Uid: json.Content.Uid,
          PaymentLink: json.Content.PaymentLink,
          ResponseAsHtml: json.Content.ResponseAsHtml,
          OrderId: json.Content.OrderId || payload.orderId,
          Message: json.Message || '3D Doğrulama Başlatıldı'
        };
      }

      return {
        IsDone: false,
        Message: json.Message || 'Ödeme isteği reddedildi.',
        ErrorCode: json.ErrorCode
      };
    } catch (err: any) {
      console.error('İşyerim POS payRequest3d error:', err);
      return {
        IsDone: false,
        Message: `Bağlantı hatası: ${err.message || 'Ödeme sunucusuna erişilemedi.'}`
      };
    }
  }

  /**
   * İşlem Sonucunu Kontrol Et (payResultCheck)
   * Uid veya OrderId ile sorgulanır. Status=4 olmalıdır.
   */
  public static async checkPaymentResult(
    uid?: string,
    orderId?: string
  ): Promise<{ isDone: boolean; status?: number; authCode?: string; message?: string; content?: any }> {
    const config = this.getConfig();

    const param = uid ? `uid=${encodeURIComponent(uid)}` : `orderId=${encodeURIComponent(orderId || '')}`;
    if (!param || param === 'orderId=') {
      return { isDone: false, message: 'Uid veya OrderId belirtilmedi.' };
    }

    try {
      const res = await fetch(`${config.baseUrl}/payResultCheck?${param}`, {
        method: 'POST',
        headers: this.getHeaders(config)
      });

      if (!res.ok) {
        return { isDone: false, message: `Sunucu yanıtı: ${res.status}` };
      }

      const json = await res.json();
      if (json && json.IsDone && json.Content) {
        const content = json.Content;
        const isSuccess = content.Status === 4; // Status=4 Başarılı
        return {
          isDone: isSuccess,
          status: content.Status,
          authCode: content.AuthCode,
          message: json.Message || (isSuccess ? 'Ödeme Başarılı' : `Ödeme durumu: ${content.Status}`),
          content
        };
      }

      return {
        isDone: false,
        message: json?.Message || 'Ödeme sonucu doğrulanamadı'
      };
    } catch (err: any) {
      console.error('İşyerim POS payResultCheck error:', err);
      return {
        isDone: false,
        message: err.message || 'Sonuç kontrolü sırasında hata oluştu'
      };
    }
  }

  /**
   * Test Bağlantısını Kontrol Et (Admin panelinde buton için)
   */
  public static async testConnection(customConfig?: {
    merchantId: string;
    userId: string;
    apiKey: string;
    isTestMode: boolean;
  }): Promise<{ success: boolean; message: string; details?: any }> {
    const config = customConfig ? {
      merchantId: customConfig.merchantId.trim(),
      userId: customConfig.userId.trim(),
      apiKey: customConfig.apiKey.trim(),
      baseUrl: customConfig.isTestMode ? '/api/isyerimpos/test' : '/api/isyerimpos/prod'
    } : this.getConfig();

    if (!config.merchantId || !config.userId || !config.apiKey) {
      return { success: false, message: 'Lütfen Merchant ID, User ID ve API Key alanlarını doldurunuz.' };
    }

    try {
      // Bir test sorgusu (getInstallments ile genel kontrol)
      const res = await fetch(`${config.baseUrl}/getInstallments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'MerchantId': config.merchantId,
          'UserId': config.userId,
          'ApiKey': config.apiKey
        },
        body: JSON.stringify({
          CardNumber: '4546711234567894',
          Amount: 100
        })
      });

      if (!res.ok) {
        return { success: false, message: `Sunucu Hatası: ${res.status} (${res.statusText})` };
      }

      const json = await res.json();
      if (json && (json.IsDone || json.ErrorCode === 0 || json.Content)) {
        return {
          success: true,
          message: 'İşyerim POS API bağlantısı başarılı! Kimlik doğrulama onaylandı.',
          details: json.Content
        };
      }

      return {
        success: false,
        message: json.Message || 'Yetkilendirme başarısız veya geçersiz API anahtarları.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Bağlantı hatası: ${err.message || 'Sunucuya ulaşılamadı'}`
      };
    }
  }
}
