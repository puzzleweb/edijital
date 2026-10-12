import { SiteSettings } from '../types';
import { LegalDocSlug } from '../pages/LegalPage';

export interface DefaultLegalDoc {
  slug: LegalDocSlug;
  title: string;
  shortTitle: string;
  badge: string;
  description: string;
  defaultHtml: string;
}

export const DEFAULT_LEGAL_DOCS_DATA: Record<LegalDocSlug, DefaultLegalDoc> = {
  'mesafeli-satis-sozlesmesi': {
    slug: 'mesafeli-satis-sozlesmesi',
    title: 'Mesafeli Satış Sözleşmesi',
    shortTitle: 'Mesafeli Satış',
    badge: 'Zorunlu Sözleşme',
    description: '6502 Sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca tarafların hak ve yükümlülükleri.',
    defaultHtml: `<section class="space-y-4">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    MADDE 1 – TARAFLAR
  </h2>
  
  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 space-y-3">
    <div>
      <strong>1.1. SATICI BİLGİLERİ:</strong><br />
      <strong>Ünvanı:</strong> {{companyName}}<br />
      <strong>Yetkili İş Ortaklığı:</strong> {{officialPartner}}<br />
      <strong>Adres:</strong> {{address}}, {{district}} / {{city}}<br />
      <strong>Telefon:</strong> {{phoneDisplay}}<br />
      <strong>E-Posta:</strong> {{email}}<br />
      <strong>Web Sitesi:</strong> www.edijitalfinans.com
    </div>

    <div class="pt-2 border-t border-slate-200 dark:border-zinc-700">
      <strong>1.2. ALICI (MÜŞTERİ) BİLGİLERİ:</strong><br />
      Web sitesi üzerinden elektronik ortamda sipariş veren ve fatura/teslimat bilgileri sipariş formunda belirtilen gerçek veya tüzel kişi (“Alıcı”).
    </div>
  </div>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    MADDE 2 – SÖZLEŞMENİN KONUSU
  </h2>
  <p>
    İşbu Sözleşme’nin konusu, Alıcı’nın Satıcı’ya ait internet sitesi üzerinden elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı belirtilen 5070 Sayılı Elektronik İmza Kanunu’na uygun Nitelikli Elektronik Sertifika (NES), USB Token Donanımı ve kurulum/destek hizmetinin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    MADDE 3 – SÖZLEŞME KONUSU ÜRÜN, FİYAT VE ÖDEME KOŞULLARI
  </h2>
  <p>
    3.1. Ürün/Hizmetin adı, süresi (1 Yıl, 2 Yıl veya 3 Yıl), adedi, KDV dahil satış bedeli ve teslimat bilgileri sipariş özetinde ve Alıcı’ya iletilen e-arşiv faturada yer almaktadır.
  </p>
  <p>
    3.2. Ödeme, Satıcı’nın web sitesinde sunulan 256-Bit SSL korumalı Kredi / Banka Kartı (3D Secure), Banka Havalesi / EFT / FAST veya Kapıda Ödeme yöntemlerinden biri ile gerçekleştirilir.
  </p>
  <p>
    3.3. Banka havalesi ile yapılan siparişlerde, sipariş onayından itibaren 3 (üç) iş günü içerisinde ödeme yapılmadığı takdirde Satıcı siparişi iptal etme hakkını saklı tutar.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    MADDE 4 – TESLİMAT VE İFA KOŞULLARI
  </h2>
  <p>
    4.1. E-İmza donanımı ve sertifikası, Alıcı’nın sipariş esnasında seçtiği yöntem uyarınca; anlaşmalı güvenli kargo/kurye şirketi vasıtasıyla Alıcı’nın teslimat adresine kimlik doğrulaması yapılarak teslim edilir.
  </p>
  <p>
    4.2. Teslimat süresi yasal 30 günlük süreyi aşmamak koşuluyla, kargo ile adrese teslimatlarda genellikle 1-3 iş günüdür.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    MADDE 5 – CAYMA HAKKI VE İSTİSNALARI
  </h2>
  <p>
    5.1. Alıcı, 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca sözleşme konusu ürünün tesliminden itibaren 14 (ondört) gün içinde herhangi bir gerekçe göstermeksizin cayma hakkına sahiptir.
  </p>
  <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200">
    <strong>5.2. Cayma Hakkının Kullanılamayacağı Haller (Yönetmelik Madde 15/1-b):</strong><br />
    5070 Sayılı Elektronik İmza Kanunu kapsamında Nitelikli Elektronik Sertifika (NES) kişiye veya kuruma özel olarak üretilen, anında aktive edilen ve geri döndürülemez dijital kimlik niteliğinde olduğundan; <em>“Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler”</em> kapsamında yer alır. Bu nedenle sertifikası üretilmiş ve onaylanmış e-imzalarda yasal olarak cayma hakkı kullanılamaz.
  </div>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    MADDE 6 – UYUŞMAZLIKLARIN ÇÖZÜMÜ
  </h2>
  <p>
    İşbu Sözleşme’den doğabilecek uyuşmazlıklarda, Ticaret Bakanlığı’nca her yıl ilan edilen değere kadar Alıcı’nın yerleşim yerindeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
  </p>
</section>`
  },

  'on-bilgilendirme-formu': {
    slug: 'on-bilgilendirme-formu',
    title: 'Ön Bilgilendirme Formu',
    shortTitle: 'Ön Bilgilendirme',
    badge: 'Yasal Form',
    description: 'Sipariş öncesi ürün, teslimat, cayma hakkı ve ödeme şartlarına dair yasal bilgilendirme.',
    defaultHtml: `<section class="space-y-4">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    1. SATICI BİLGİLERİ
  </h2>
  <p>
    <strong>Ünvan:</strong> {{companyName}}<br />
    <strong>Yetkili İş Ortaklığı:</strong> {{officialPartner}}<br />
    <strong>Adres:</strong> {{address}}, {{district}} / {{city}}<br />
    <strong>Telefon:</strong> {{phoneDisplay}}<br />
    <strong>E-Posta:</strong> {{email}}
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    2. SÖZLEŞME KONUSU HİZMETİN TEMEL NİTELİKLERİ VE FİYATI
  </h2>
  <p>
    Satışa konu ürün; 5070 Sayılı Elektronik İmza Kanunu kapsamında üretilen, Bilgi Teknolojileri ve İletişim Kurumu (BTK) onaylı Nitelikli Elektronik Sertifika (NES) ve USB Güvenlik Token donanımıdır. Ürün fiyatı, süre tercihi (1 Yıl / 2 Yıl / 3 Yıl) ve KDV (%20) dahil toplam bedel sepet ve ödeme ekranında net olarak gösterilmektedir.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    3. ÖDEME VE TESLİMAT ESASLARI
  </h2>
  <p>
    Ödeme kredi kartı (256-Bit SSL / 3D Secure), banka havalesi / EFT veya kapıda ödeme ile yapılabilir. Sipariş tamamlandıktan sonra e-imza token donanımı ve sertifika belgeleri anlaşmalı kargo/kurye şirketi aracılığıyla alıcının adresine sevk edilir.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    4. CAYMA HAKKI BİLGİLENDİRMESİ
  </h2>
  <p>
    Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesinin (b) bendi gereğince; alıcının talebi ve kişisel kimlik doğrulaması neticesinde adına tanzim edilen Nitelikli Elektronik Sertifika ürünlerinde cayma hakkı bulunmamaktadır. Arızalı USB token donanımları 2 yıl üretici garantisi dahilinde birebir yenisiyle değiştirilir.
  </p>
</section>`
  },

  'kvkk-aydinlatma-metni': {
    slug: 'kvkk-aydinlatma-metni',
    title: '6698 Sayılı KVKK Aydınlatma Metni',
    shortTitle: 'KVKK Aydınlatma',
    badge: 'Veri Güvenliği',
    description: 'Kişisel verilerinizin işlenmesi, saklanması ve aktarılmasına ilişkin aydınlatma metni.',
    defaultHtml: `<section class="space-y-4">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    1. VERİ SORUMLUSU
  </h2>
  <p>
    6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, <strong>{{companyName}}</strong> (“Şirket”) olarak veri sorumlusu sıfatıyla kişisel verilerinizin hukuka ve dürüstlük kurallarına uygun olarak işlenmesine ve korunmasına büyük hassasiyet göstermekteyiz.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    2. İŞLENEN KİŞİSEL VERİLER
  </h2>
  <ul class="list-disc list-inside space-y-1.5 pl-2">
    <li><strong>Kimlik Bilgileri:</strong> Ad, Soyad, T.C. Kimlik Numarası, Doğum Tarihi, Kimlik Seri Numarası.</li>
    <li><strong>İletişim Bilgileri:</strong> Telefon Numarası, E-posta Adresi, Fatura ve Teslimat Adresi.</li>
    <li><strong>Kurumsal Bilgiler:</strong> Şirket Ünvanı, Vergi Dairesi, Vergi Kimlik Numarası (VKN), İmza Sirküleri Yetkilisi.</li>
    <li><strong>İşlem Güvenliği Verileri:</strong> IP adresi, sipariş takip kodları, çerez kayıtları.</li>
  </ul>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    3. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI
  </h2>
  <p>
    Kişisel verileriniz; 5070 Sayılı Elektronik İmza Kanunu, BTK mevzuatı, Vergi Usul Kanunu ve Tüketici Hakları mevzuatları kapsamında nitelikli elektronik sertifikanın üretilmesi, yasal kimlik doğrulamasının yapılması, e-arşiv fatura tanzimi, sipariş takibi ve müşteri destek hizmetlerinin sunulması amacıyla işlenmektedir.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    4. VERİLERİN AKTARILMASI
  </h2>
  <p>
    Kişisel verileriniz yalnızca sertifika üretiminin ifası amacıyla yetkili Elektronik Sertifika Hizmet Sağlayıcısı ({{officialPartner}}), siparişin teslimi için anlaşmalı kargo/kurye kuruluşları ve mevzuatın emrettiği kanuni yetkili kamu kurum ve kuruluşları (BTK, GİB, Adli Merciler) ile paylaşılmaktadır.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    5. KVKK KAPSAMINDAKİ HAKLARINIZ (MADDE 11)
  </h2>
  <p>
    KVKK’nın 11. maddesi uyarınca şirketimize başvurarak kişisel verilerinizin işlenip işlenmediğini öğrenme, yanlış işlenmişse düzeltilmesini talep etme ve kanuni şartlar dahilinde silinmesini isteme haklarına sahipsiniz. Başvurularınızı <strong>{{email}}</strong> adresine yazılı olarak iletebilirsiniz.
  </p>
</section>`
  },

  'gizlilik-politikasi': {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik ve Güvenlik Politikası',
    shortTitle: 'Gizlilik & Güvenlik',
    badge: 'SSL Korumalı',
    description: '256-Bit SSL şifreleme, kredi kartı güvenliği ve çerez politikası detayları.',
    defaultHtml: `<section class="space-y-4">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    1. KREDİ KARTI VE ÖDEME GÜVENLİĞİ
  </h2>
  <p>
    Web sitemizde kredi kartı ve banka kartı ödemeleri 256-Bit SSL (Secure Sockets Layer) sertifikası ve uluslararası <strong>3D Secure</strong> güvenlik altyapısıyla gerçekleştirilmektedir. Kart bilgileriniz hiçbir şekilde sunucularımızda saklanmaz; doğrudan banka ve lisanslı ödeme kuruluşu altyapısına iletilir.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    2. KİŞİSEL BİLGİ GİZLİLİĞİ
  </h2>
  <p>
    Sipariş formunda ilettiğiniz bilgiler gizli tutulmakta olup, yasal zorunluluklar haricinde hiçbir üçüncü taraf kişi veya kurum ile paylaşılmamakta ve pazarlama amacıyla satılmamaktadır.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    3. ÇEREZ (COOKIE) KULLANIMI
  </h2>
  <p>
    Sitemizde sepet işlemlerinin yürütülmesi, güvenli oturum açma ve analitik performans ölçümleri amacıyla temel çerezler kullanılmaktadır. Çerez ayarlarını tarayıcınızın tercihlerinden dilediğiniz an yönetebilirsiniz.
  </p>
</section>`
  },

  'iptal-ve-iade-kosullari': {
    slug: 'iptal-ve-iade-kosullari',
    title: 'Teslimat, İptal ve İade Koşulları',
    shortTitle: 'Teslimat & İade',
    badge: 'Garanti & İade',
    description: '5070 Sayılı Kanun kapsamında sertifika aktivasyonu, donanım garantisi ve cayma hakkı istisnaları.',
    defaultHtml: `<section class="space-y-4">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    1. TESLİMAT KOŞULLARI
  </h2>
  <p>
    Sipariş edilen E-İmza donanımları, sipariş onayından sonra Türkiye genelinde anlaşmalı kargo/kurye şirketine teslim edilir. Kargo takip kodu müşteriye SMS ve e-posta yoluyla bildirilir.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    2. SERTİFİKA İPTALİ VE CAYMA HAKKI İSTİSNASI
  </h2>
  <p>
    5070 Sayılı Kanun gereği adınıza üretilmiş ve aktive edilmiş Nitelikli Elektronik Sertifikalar kişiye özel dijital mülk statüsünde olduğundan iade ve iptal edilemez. Ancak sertifika henüz üretilmemiş ve onaylanmamışsa, müşteri siparişini iptal ederek tam ücret iadesi alma hakkına sahiptir.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    3. DONANIM GARANTİSİ VE DEĞİŞİM
  </h2>
  <p>
    Tarafımızca sağlanan USB Token e-imza cihazları 2 (iki) yıl resmi distribütör garantisi kapsamındadır. Donanımsal arıza halinde cihaz birebir yenisiyle değiştirilir.
  </p>
</section>`
  },

  'kullanim-kosullari': {
    slug: 'kullanim-kosullari',
    title: 'Web Sitesi Kullanım Koşulları',
    shortTitle: 'Kullanım Koşulları',
    badge: 'Genel Şartlar',
    description: 'Web sitesi fikri mülkiyet hakları, sorumluluk sınırları ve kullanım şartları.',
    defaultHtml: `<section class="space-y-4">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    1. GENEL KULLANIM ESASLARI
  </h2>
  <p>
    www.edijitalfinans.com web sitesini ziyaret eden veya sipariş veren her kullanıcı, işbu kullanım koşullarını kabul etmiş sayılır. Web sitesinde yer alan tüm görsel, logo, metin ve yazılım kodları telif hakları ile korunmaktadır.
  </p>
</section>

<section class="space-y-4 mt-6">
  <h2 class="text-base font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-zinc-800">
    2. SORUMLULUK SINIRLARI
  </h2>
  <p>
    E-İmza şifresi (PIN/PUK) kullanıcıya özel olup, şifrenin güvenliği ve üçüncü şahıslarla paylaşılmamasından doğan tüm hukuki ve cezai sorumluluk sertifika sahibine aittir.
  </p>
</section>`
  }
};

/**
 * Replaces dynamic variables {{companyName}}, {{phoneDisplay}}, {{email}}, {{address}}, etc.
 */
export const interpolateLegalPlaceholders = (html: string, settings: SiteSettings): string => {
  if (!html) return '';
  return html
    .replace(/\{\{companyName\}\}/g, settings.companyName || 'E-DİJİTAL FİNANS')
    .replace(/\{\{officialPartner\}\}/g, settings.officialPartner || 'Arkimza & ArkSigner Yetkili İş Ortağı')
    .replace(/\{\{phone\}\}/g, settings.phone || '')
    .replace(/\{\{phoneDisplay\}\}/g, settings.phoneDisplay || settings.phone || '')
    .replace(/\{\{email\}\}/g, settings.email || '')
    .replace(/\{\{address\}\}/g, settings.address || '')
    .replace(/\{\{district\}\}/g, settings.district || '')
    .replace(/\{\{city\}\}/g, settings.city || '')
    .replace(/\{\{website\}\}/g, 'www.edijitalfinans.com');
};

/**
 * Generates customer-specific signed legal snapshots for an order
 */
export const generateCustomerContractSnapshots = (
  order: {
    orderNumber?: string;
    trackingCode?: string;
    fullName: string;
    tcVkn: string;
    phone: string;
    email?: string;
    isCorporate?: boolean;
    companyName?: string;
    taxOffice?: string;
    address: string;
    district?: string;
    city?: string;
    packageName: string;
    totalAmount?: number;
    price?: number;
    paymentMethod?: string;
    deliveryTitle?: string;
    createdAt?: string;
  },
  settings: SiteSettings
): Array<{ slug: string; title: string; agreedAt: string; contentHtml: string }> => {
  const agreedAt = new Date().toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'medium' });
  const orderNum = order.orderNumber || order.trackingCode || 'EDF-YASAL';

  const customerBlockHtml = `
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 24px; font-family: sans-serif; font-size: 13px; color: #1e293b; line-height: 1.6;">
    <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
      📋 SİPARİŞ VE ALICI (MÜŞTERİ) DOĞRULAMA BİLGİLERİ
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <div><strong>Sipariş No:</strong> <span style="font-family: monospace; color: #2563eb; font-weight: bold;">${orderNum}</span></div>
      <div><strong>Onay Zamanı:</strong> ${agreedAt}</div>
      <div><strong>Alıcı Adı Soyadı:</strong> ${order.fullName}</div>
      <div><strong>${order.isCorporate ? 'Vergi No (VKN)' : 'T.C. Kimlik No'}:</strong> ${order.tcVkn}</div>
      ${order.isCorporate && order.companyName ? `<div style="grid-column: span 2;"><strong>Kurum / Şirket:</strong> ${order.companyName} (${order.taxOffice || 'Vergi Dairesi'})</div>` : ''}
      <div><strong>Telefon:</strong> ${order.phone}</div>
      <div><strong>E-Posta:</strong> ${order.email || 'Belirtilmedi'}</div>
      <div style="grid-column: span 2;"><strong>Fatura & Teslimat Adresi:</strong> ${order.address} ${order.district ? `(${order.district})` : ''} ${order.city || 'ANKARA'}</div>
      <div><strong>Seçilen Ürün:</strong> ${order.packageName}</div>
      <div><strong>Toplam Bedel:</strong> <strong style="color: #2563eb;">${(order.totalAmount || order.price || 0).toLocaleString('tr-TR')} ₺ (KDV Dahil)</strong></div>
      <div><strong>Ödeme Şekli:</strong> ${order.paymentMethod === 'credit_card' ? 'Kredi Kartı (256-Bit SSL 3D Secure)' : order.paymentMethod === 'bank_transfer' ? 'Banka Havalesi / EFT / FAST' : 'Kapıda Ödeme'}</div>
      <div><strong>Teslimat Yöntemi:</strong> ${order.deliveryTitle || 'Adrese Teslimat'}</div>
    </div>
    <div style="margin-top: 12px; padding: 10px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; color: #065f46; font-size: 12px;">
      ✓ <strong>Elektronik Onay Beyanı:</strong> İşbu yasal sözleşme, Alıcı tarafından www.edijitalfinans.com ödeme sayfasında elektronik ortamda okunmuş, onay kutusu işaretlenerek 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 6698 sayılı KVKK uyarınca hukuken bağlayıcı olarak onaylanmıştır.
    </div>
  </div>
  `;

  // Get base templates from settings or default
  const distanceBaseHtml = interpolateLegalPlaceholders(
    settings.legalDocuments?.['mesafeli-satis-sozlesmesi']?.contentHtml || DEFAULT_LEGAL_DOCS_DATA['mesafeli-satis-sozlesmesi'].defaultHtml,
    settings
  );

  const onbilgiBaseHtml = interpolateLegalPlaceholders(
    settings.legalDocuments?.['on-bilgilendirme-formu']?.contentHtml || DEFAULT_LEGAL_DOCS_DATA['on-bilgilendirme-formu'].defaultHtml,
    settings
  );

  const kvkkBaseHtml = interpolateLegalPlaceholders(
    settings.legalDocuments?.['kvkk-aydinlatma-metni']?.contentHtml || DEFAULT_LEGAL_DOCS_DATA['kvkk-aydinlatma-metni'].defaultHtml,
    settings
  );

  return [
    {
      slug: 'mesafeli-satis-sozlesmesi',
      title: 'Mesafeli Satış Sözleşmesi',
      agreedAt,
      contentHtml: customerBlockHtml + distanceBaseHtml
    },
    {
      slug: 'on-bilgilendirme-formu',
      title: 'Ön Bilgilendirme Formu',
      agreedAt,
      contentHtml: customerBlockHtml + onbilgiBaseHtml
    },
    {
      slug: 'kvkk-aydinlatma-metni',
      title: 'KVKK Aydınlatma & Açık Rıza Metni',
      agreedAt,
      contentHtml: customerBlockHtml + kvkkBaseHtml
    }
  ];
};

