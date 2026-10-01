# E-DİJİTAL FİNANS • Modern Kurumsal Web Sitesi & Yönetim Paneli

**https://edijitalfinans.com** sitesindeki tüm kurumsal bilgiler, hizmetler, iletişim kanalları ve yasal dayanaklar esas alınarak; **Apple tasarım standartlarında (Keynote typography, Glassmorphism, Bento Grid, Dark/Light Mode)** modern bir web sitesi ve **kapsamlı Yönetim Paneli (Admin Management Panel)** hazırlanmıştır.

---

## 🌟 Öne Çıkan Özellikler

### 1. Kurumsal & Apple Tarzı Web Sitesi (Public Website)
- **Apple Estetiği & Tasarım:** Buzlu cam efektleri (`backdrop-filter: blur(20px)`), rafine tipografi, mikro animasyonlar, yumuşak geçişler ve tam uyumlu **Açık / Karanlık Mod (Dark Mode)**.
- **Hero & 3D Token Önizlemesi:** Keynote tarzı başlıklar, ArkSigner yetkili bayi rozeti, akıllı kart/token güvenlik çipi illüstrasyonu ve hızlı aksiyon butonları.
- **Bento Grid Avantajlar Bölümü:**
  - 15 Dakikada Hazır E-İmza & Sıfır Bekleme Süresi
  - Ankara İçi Yerinde Teslimat & Eryaman Mağaza Teslim Seçenekleri
  - 5070 Sayılı Elektronik İmza Kanunu'na %100 Uyum
  - BTK ve EAL4+ Güvenlik Sertifikasyonları
  - 7/24 Teknik Destek & Ücretsiz Uzaktan Kurulum
- **İnteraktif Fiyatlandırma & Paketler:**
  - Bireysel & Kurumsal geçiş anahtarı
  - 1 Yıllık, 2 Yıllık ve 3 Yıllık (En Çok Tercih Edilen) paketler
  - Tek tıkla ilgili paket için başvuru modalını başlatma
- **Tam Sistem Entegrasyon Matrisi:**
  - UYAP, EKAP, MERSİS, KEP, e-Devlet, Sağlık Bakanlığı e-Reçete (MEDULA), GİB e-Fatura/e-Defter ve Bankacılık uyumluluk kartları.
- **Online E-İmza Başvuru Sihirbazı (Application Wizard):**
  - Ad Soyad, T.C. Kimlik / VKN, Telefon, E-Posta, Paket seçimi
  - Teslimat tercihi: **Eryaman Mağaza Teslim**, **Ankara İçi Adrese Yerinde Teslim**, **Hızlı Kargo**
  - Başvuru tamamlandığında kutlama konfetisi ve otomatik üretilen **Takip Kodu** (Örn: `EDF-94821`).
  - Veriler anında **Yönetim Paneline** yansır.
- **Canlı Başvuru Sorgulama (Track Modal):**
  - Müşteriler Takip Kodu veya T.C. No ile başvurularının anlık durumunu (Başvuru Alındı → Evrak Kontrolü → Sertifika Onayı → Token Hazırlandı → Teslim Edildi) aşama aşama takip edebilir.
- **Hakkımızda, SSS (Accordion) & İletişim:**
  - Şeyh Şamil Mah. 1. TBMM Cad. No:59 Eryaman Etimesgut adresine ait entegre harita.
  - Doğrudan Arama ve WhatsApp başlatıcı butonları.
  - Canlı mesaj gönderme formu.

---

### 2. Apple iPadOS / macOS Tarzı Yönetim Paneli (Admin Panel)

Yönetim paneline web sitesinin sağ üstündeki veya altındaki **"Yönetim Paneli"** butonlarından doğrudan erişilebilir.

- **Güvenli Giriş Ekranı:**
  - **Kullanıcı Adı:** `admin`
  - **Şifre:** `edijital2026`
- **Dashboard (Genel Bakış):**
  - Toplam Başvuru Sayısı, Aksiyon Bekleyenler, Teslim Edilenler, Toplam Ciro Hacmi.
  - Son gelen başvurular tablosu ve hızlı durum değiştirici.
  - Sistem işlem günlüğü (Activity Logs).
- **Başvuru Yönetimi (Applications Management):**
  - İsim, T.C. No, Takip Kodu ve Telefona göre canlı arama.
  - Durum filtresi (*Yeni, İnceleniyor, Onaylandı, Hazırlandı, Teslim Edildi, İptal*).
  - Teslimat türü filtresi (*Yerinde Teslim, Mağaza, Kargo*).
  - Başvuru detay modalı: Yönetici ve kurye notları ekleme, tek tıkla müşteriyi arama veya WhatsApp mesajı başlatma.
  - **Excel / CSV Dışa Aktarma:** Tüm başvuruları tek tıkla CSV dosyası olarak indirme.
  - **Manuel Yeni Başvuru Ekleme:** Telefonla veya mağazadan gelen talepleri panele işleme.
- **Paket & Fiyat Yönetimi:**
  - 1, 2, 3 yıllık paketlerin satış fiyatlarını, indirimlerini, rozetlerini ve madde madde özelliklerini canlı düzenleme.
- **İletişim Mesajları:**
  - Web sitesindeki formdan gelen mesajları okuma, okundu işaretleme, tek tıkla müşteriye dönüş yapma.
- **Site & İletişim Ayarları:**
  - Telefon, WhatsApp numarası, E-posta, Ofis adresi, Çalışma saatleri ve üst duyuru bandı metnini panelden anında güncelleme.

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda başlatmak için:

```bash
# Bağımlılıkları yükleyin (zaten yüklü)
npm install

# Geliştirici sunucusunu başlatın
npm run dev

# Üretim derlemesi oluşturmak için
npm run build
```

Tarayıcınızda açılan adresten (genellikle `http://localhost:5173`) platformu görüntüleyebilirsiniz.
