-- ==========================================================
-- E-DİJİTAL FİNANS - SUPABASE MASTER RESTORE & BACKUP SCRIPT
-- Bu dosya Supabase SQL Editor'de tek seferde çalıştırılmaya uygundur.
-- Hem auth kullanıcısını (djktasarim@gmail.com) hem de tüm public tabloları ve verileri yükler.
-- ==========================================================

-- 1. UZANTILAR
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================
-- 2. AUTH KULLANICISI YÜKLEME (auth.users & auth.identities)
-- ==========================================================

-- Admin Kullanıcısı: djktasarim@gmail.com (ID: 89755e8a-3b92-4ded-8b5c-c4d705f3c430)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '89755e8a-3b92-4ded-8b5c-c4d705f3c430',
    'authenticated',
    'authenticated',
    'djktasarim@gmail.com',
    '$2a$10$CU8uk91FNgtZKmM0nkOavu4/u529oIpegOVfMzgFU6zqx3WubRP.i',
    '2026-10-01 12:26:23.512153+00',
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"email_verified": true}'::jsonb,
    '2026-10-01 12:26:23.492514+00',
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Identity Kaydı
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    provider_id
) VALUES (
    '89755e8a-3b92-4ded-8b5c-c4d705f3c430',
    '89755e8a-3b92-4ded-8b5c-c4d705f3c430',
    '{"sub": "89755e8a-3b92-4ded-8b5c-c4d705f3c430", "email": "djktasarim@gmail.com", "email_verified": false, "phone_verified": false}'::jsonb,
    'email',
    '2026-10-01 12:26:23.508506+00',
    '2026-10-01 12:26:23.508561+00',
    now(),
    'edb3c398-f76b-49e4-88f3-d02d0a88f5e0'
) ON CONFLICT (provider, id) DO NOTHING;

-- ==========================================================
-- 3. PUBLIC TABLOLARIN TANIMLARI
-- ==========================================================

-- TABLO: site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'general',
    company_name TEXT,
    official_partner TEXT,
    phone TEXT,
    phone_display TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    address_detail TEXT,
    district TEXT,
    city TEXT,
    working_hours TEXT,
    working_days TEXT,
    map_location_query TEXT,
    map_embed_url TEXT,
    hero_badge TEXT,
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_button_text TEXT,
    hero_secondary_button_text TEXT,
    announcement_text TEXT,
    announcement_active BOOLEAN DEFAULT true,
    min_delivery_time TEXT,
    header_tagline TEXT,
    header_show_track BOOLEAN DEFAULT true,
    header_show_apply BOOLEAN DEFAULT true,
    quick_form_title TEXT,
    quick_form_subtitle TEXT,
    quick_form_badge TEXT,
    quick_form_card_title TEXT,
    quick_form_card_subtitle TEXT,
    about_title TEXT,
    about_p1 TEXT,
    about_p2 TEXT,
    about_p3 TEXT,
    faq_title TEXT,
    faq_subtitle TEXT,
    faqs JSONB DEFAULT '[]'::jsonb,
    footer_about TEXT,
    copyright_text TEXT,
    sections JSONB DEFAULT '{}'::jsonb,
    delivery_options JSONB DEFAULT '[]'::jsonb,
    theme JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLO: packages
CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    category TEXT DEFAULT 'bireysel',
    popular BOOLEAN DEFAULT false,
    badge TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLO: applications
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    tc_vkn TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    is_corporate BOOLEAN DEFAULT false,
    company_name TEXT,
    tax_office TEXT,
    package_id TEXT REFERENCES public.packages(id) ON UPDATE CASCADE,
    package_name TEXT,
    duration TEXT,
    price NUMERIC,
    delivery_type TEXT DEFAULT 'ankara_yerinde',
    address TEXT,
    city TEXT DEFAULT 'ANKARA',
    district TEXT,
    notes TEXT,
    admin_notes TEXT,
    status TEXT DEFAULT 'yeni',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLO: contact_messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLO: activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    details TEXT,
    user_email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLO: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- 4. RLS & GÜVENLİK
-- ==========================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politikalar
DO $$ BEGIN
  -- Site Settings
  DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
  CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Admin manage site_settings" ON public.site_settings;
  CREATE POLICY "Admin manage site_settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

  -- Packages
  DROP POLICY IF EXISTS "Public read packages" ON public.packages;
  CREATE POLICY "Public read packages" ON public.packages FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Admin manage packages" ON public.packages;
  CREATE POLICY "Admin manage packages" ON public.packages FOR ALL USING (auth.role() = 'authenticated');

  -- Applications
  DROP POLICY IF EXISTS "Public insert applications" ON public.applications;
  CREATE POLICY "Public insert applications" ON public.applications FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Public select tracking" ON public.applications;
  CREATE POLICY "Public select tracking" ON public.applications FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Admin manage applications" ON public.applications;
  CREATE POLICY "Admin manage applications" ON public.applications FOR ALL USING (auth.role() = 'authenticated');

  -- Contact Messages
  DROP POLICY IF EXISTS "Public insert messages" ON public.contact_messages;
  CREATE POLICY "Public insert messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Admin manage messages" ON public.contact_messages;
  CREATE POLICY "Admin manage messages" ON public.contact_messages FOR ALL USING (auth.role() = 'authenticated');

  -- Activity Logs
  DROP POLICY IF EXISTS "Admin manage logs" ON public.activity_logs;
  CREATE POLICY "Admin manage logs" ON public.activity_logs FOR ALL USING (auth.role() = 'authenticated');

  -- Profiles
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  DROP POLICY IF EXISTS "Admin manage profiles" ON public.profiles;
  CREATE POLICY "Admin manage profiles" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
END $$;

-- ==========================================================
-- 5. VERİLERİN YÜKLENMESİ
-- ==========================================================

-- 5.1. PROFILES VERİSİ
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('89755e8a-3b92-4ded-8b5c-c4d705f3c430', 'djktasarim@gmail.com', 'Yönetici', 'superadmin')
ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

-- 5.2. PACKAGES (PAKETLER)
INSERT INTO public.packages (id, name, duration, price, original_price, category, popular, badge, description, features, sort_order)
VALUES
(
    'pkg-1-yil',
    '1 Yıllık E-İmza',
    '1 Yıl',
    2450,
    3990,
    'bireysel',
    false,
    '1 Yıllık',
    'Bireysel ve kurumsal tüm işlemleriniz için güvenli e-imza çözümü.',
    '["Ankara''da yerinde kurulum imkânı", "10 dakikada hazırlanır, 15 dakikada teslim", "E-Devlet, e-Fatura, KEP uyumlu", "Kurumsal ve bireysel kullanım için ideal", "Ücretsiz destek ve kurulum rehberliği", "1 Yıl Süreli Ekonomik E imza"]'::jsonb,
    1
),
(
    'pkg-3-yil',
    '3 Yıllık E-İmza',
    '3 Yıl',
    3750,
    4990,
    'bireysel',
    true,
    'En Çok Tercih Edilen',
    'En avantajlı ve uzun ömürlü kullanım paketi.',
    '["Ankara''da yerinde kurulum imkânı", "10 dakikada hazırlanır, 15 dakikada teslim", "E-Devlet, e-Fatura, KEP uyumlu", "Kurumsal ve bireysel kullanım için ideal", "Ücretsiz destek ve kurulum rehberliği", "3 Yıl Süreli Ekonomik E imza"]'::jsonb,
    2
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    duration = EXCLUDED.duration,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    features = EXCLUDED.features;

-- 5.3. SITE SETTINGS
INSERT INTO public.site_settings (
    id,
    company_name,
    official_partner,
    phone,
    phone_display,
    whatsapp,
    email,
    address,
    address_detail,
    district,
    city,
    working_hours,
    working_days,
    map_location_query,
    map_embed_url,
    hero_badge,
    hero_title,
    hero_subtitle,
    hero_button_text,
    hero_secondary_button_text,
    announcement_text,
    announcement_active,
    min_delivery_time,
    header_tagline,
    header_show_track,
    header_show_apply,
    quick_form_title,
    quick_form_subtitle,
    quick_form_badge,
    quick_form_card_title,
    quick_form_card_subtitle,
    about_title,
    about_p1,
    about_p2,
    about_p3,
    faq_title,
    faq_subtitle,
    faqs,
    footer_about,
    copyright_text,
    sections,
    delivery_options,
    theme,
    updated_at
) VALUES (
    'general',
    'E-DİJİTAL FİNANS',
    'ArkSigner & Arkimza Yetkili İş Ortağı',
    '05459603303',
    '0545 960 33 03',
    '905459603303',
    'edijitalfinans@gmail.com',
    'Ostim OSB, 100. Yıl Blv PRESTİJ PLAZA NO:55 A BLOK 20 KAT:2, 06374',
    'Yenimahalle / ANKARA',
    'Yenimahalle / ANKARA',
    'ANKARA',
    '09:00 – 18:00',
    'Pazartesi - Cumartesi',
    '39.969709, 32.744914',
    '',
    'Ankara İçi 15 Dakikada Adrese / Mağazada Teslimat',
    'Hızlı ve Güvenilir E-İmza Hizmetleri',
    'Güvenli e-imza çözümleri, uygun e-imza fiyatları ve 15 dakikada hızlı teslimat.',
    'Hemen E-İmza Başvurusu',
    'Paket Fiyatlarını Gör',
    'Ankara geneli adrese hemen teslim ve yerinde kurulum hizmeti.',
    false,
    '15 Dakika',
    'ArkSigner & Arkimza Yetkili İş Ortağı',
    false,
    true,
    'E-İmza Satın Al',
    'Ücretsiz ön bilgi ve hızlı başvuru için formu doldurun. Uzmanlarımız 5 dakika içinde arasın.',
    'HIZLI FORM',
    'E-İmzanız 15 Dakikada Hazırlansın',
    'Formu doldurun; Eryaman ofisimizden hemen teslim alın veya Ankara geneli adresinize getirelim.',
    'ARKSİGNER E-İMZA YETKİLİ İŞ ORTAĞI',
    'Firmamız, güvenli e imza çözümleri alanında hızlı ve güvenilir hizmet sunmak amacıyla kurulmuştur. Arkimza’nın bayisi olarak, yasal mevzuatlara uygun, kaliteli ve sürdürülebilir elektronik imza hizmetleri ile müşterilerimize en doğru şekilde ulaşmayı hedefliyoruz.',
    'Ankara genelinde hemen teslim, yerinde teslim ve mağaza teslim seçeneklerimizle, zaman kaybetmeden e-İmzanıza ulaşmanızı sağlıyoruz. İhtiyacınıza göre adresinize gelerek teslimat yapıyor veya mağazamızdan elden teslim imkânı sunuyoruz.',
    'Böylece hem bireysel hem de kurumsal müşteriler için hızlı, pratik ve güvenli bir süreç oluşturuyoruz. Müşteri memnuniyetini ön planda tutan yaklaşımımızla; satış öncesi bilgilendirme, kurulum desteği ve satış sonrası teknik destek hizmetlerini eksiksiz sunuyoruz.',
    'Sıkça Sorulan Sorular',
    'E-İmza süreci, fiyatlandırma, kurulum ve teslimat hakkında aklınıza takılan tüm soruların yanıtları.',
    '[
        {"question": "E-İmza (Elektronik İmza) nedir ve hukuki geçerliliği nedir?", "answer": "Elektronik İmza, 5070 Sayılı Elektronik İmza Kanunu uyarınca ıslak imza ile tamamen aynı hukuki geçerliliğe sahip olan sayısal kimlik doğrulama aracıdır. Kamusal ve özel tüm sözleşmelerde, UYAP dava dosyalarında, EKAP ihalelerinde ve bankacılık talimatlarında resmi imzanız yerine geçer."},
        {"question": "Ankara genelinde teslimat ne kadar sürer? Hemen teslim alabilir miyim?", "answer": "Evet! Ostim Mahallesi’ndeki mağazamıza geldiğinizde sadece 15 dakika içinde e-imzanız hazırlanıp elden teslim edilir. Ayrıca Ankara içi adrese teslimat seçeneğimizle, kuryemiz ofisinize veya evinize gelerek kimlik doğrulamanızı yapar ve e-imzanızı hemen teslim eder."},
        {"question": "E-İmza başvurusu için hangi evraklar gereklidir?", "answer": "Bireysel E-İmza için sadece T.C. Kimlik Kartınızın (veya Pasaport/Ehliyet) aslı yeterlidir. Kurumsal E-İmza için ise T.C. Kimlik Kartı, İmza Sirküleri fotokopisi, güncel Faaliyet Belgesi ve Vergi Levhası gerekmektedir."},
        {"question": "UYAP, EKAP, MERSİS ve KEP sistemlerinde hemen çalışır mı?", "answer": "Kesinlikle evet. E-DİJİTAL FİNANS üzerinden sağlanan ArkSigner nitelikli elektronik sertifikaları, Türkiye’deki tüm yargı, kamu, bankacılık ve ticaret portallarıyla %100 uyumludur."},
        {"question": "Mac (Apple macOS) ve Windows bilgisayarlarla uyumlu mu?", "answer": "Evet, sağladığımız yeni nesil USB token donanımları hem Apple macOS (M1/M2/M3/M4 ve Intel işlemcili tüm Mac cihazlar), hem Windows 10/11, hem de Linux dağıtımları ile sorunsuz ve tak-çalıştır şeklinde çalışmaktadır."},
        {"question": "Kurulum ve sürücü ayarlarında yardımcı oluyor musunuz?", "answer": "Evet, tüm müşterilerimize ücretsiz satış sonrası kurulum desteği sunuyoruz. Dilerseniz yerinde teslimatta ekibimiz bilgisayarınıza kurar, dilerseniz uzaktan bağlantı programı (AnyDesk/TeamViewer) ile UYAP, Java ve tarayıcı ayarlarınızı birkaç dakikada tamamlarız."},
        {"question": "E-İmza süreleri kaç yıldır ve süre bitiminde ne yapılır?", "answer": "E-İmzalar 1 Yıllık veya 3 Yıllık olarak üretilir. Süre bitimine yakın tarafınıza bilgilendirme yapılır ve dilerseniz mevcut USB token cihazınız değiştirilmeden sadece sertifika yenilemesi yapılarak süreç hızlıca uzatılır."}
    ]'::jsonb,
    'Arkimza ve ArkSigner yetkili iş ortağı olarak Ankara genelinde hızlı, güvenilir ve yasal mevzuata uygun e-İmza çözümleri sunuyoruz.',
    '© 2026 E-DİJİTAL FİNANS. Tüm hakları saklıdır.',
    '{"announcement": true, "hero": true, "features": true, "quickForm": true, "pricing": true, "compatibility": true, "about": true, "faq": true, "contact": true}'::jsonb,
    '[
        {"id": "del-1", "type": "ankara_yerinde", "badge": "Tavsiye Edilen", "title": "Ankara Adreste Yerinde Teslim & Kurulum", "active": true, "description": "Adresinize gelip kimlik doğrulamanızı ve kurulumunuzu yapıyoruz."},
        {"id": "del-2", "type": "magaza", "badge": "Hızlı Teslimat", "title": "Ostim Mağazadan 15 Dk Elden Teslim", "active": true, "description": "Ostim ofisimizden hemen 15 dakikada elden teslim alın."},
        {"id": "del-3", "type": "kargo", "badge": "Türkiye Geneli", "title": "Hızlı Kargo ile Adrese Teslimat", "active": true, "description": "Tüm Türkiye geneli güvenli kurye / kargo ile adrese teslim."}
    ]'::jsonb,
    '{"primaryColor": "#0080c8", "showPatterns": true, "enableGlow": true, "cardRadius": "rounded-md"}'::jsonb,
    now()
) ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    official_partner = EXCLUDED.official_partner,
    phone = EXCLUDED.phone,
    phone_display = EXCLUDED.phone_display,
    whatsapp = EXCLUDED.whatsapp,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    address_detail = EXCLUDED.address_detail,
    district = EXCLUDED.district,
    city = EXCLUDED.city,
    working_hours = EXCLUDED.working_hours,
    working_days = EXCLUDED.working_days,
    map_location_query = EXCLUDED.map_location_query,
    map_embed_url = EXCLUDED.map_embed_url,
    hero_badge = EXCLUDED.hero_badge,
    hero_title = EXCLUDED.hero_title,
    hero_subtitle = EXCLUDED.hero_subtitle,
    hero_button_text = EXCLUDED.hero_button_text,
    hero_secondary_button_text = EXCLUDED.hero_secondary_button_text,
    announcement_text = EXCLUDED.announcement_text,
    announcement_active = EXCLUDED.announcement_active,
    min_delivery_time = EXCLUDED.min_delivery_time,
    header_tagline = EXCLUDED.header_tagline,
    header_show_track = EXCLUDED.header_show_track,
    header_show_apply = EXCLUDED.header_show_apply,
    quick_form_title = EXCLUDED.quick_form_title,
    quick_form_subtitle = EXCLUDED.quick_form_subtitle,
    quick_form_badge = EXCLUDED.quick_form_badge,
    quick_form_card_title = EXCLUDED.quick_form_card_title,
    quick_form_card_subtitle = EXCLUDED.quick_form_card_subtitle,
    about_title = EXCLUDED.about_title,
    about_p1 = EXCLUDED.about_p1,
    about_p2 = EXCLUDED.about_p2,
    about_p3 = EXCLUDED.about_p3,
    faq_title = EXCLUDED.faq_title,
    faq_subtitle = EXCLUDED.faq_subtitle,
    faqs = EXCLUDED.faqs,
    footer_about = EXCLUDED.footer_about,
    copyright_text = EXCLUDED.copyright_text,
    sections = EXCLUDED.sections,
    delivery_options = EXCLUDED.delivery_options,
    theme = EXCLUDED.theme,
    updated_at = now();

-- 5.4. APPLICATIONS (BAŞVURULAR - 5 Kayıt)
INSERT INTO public.applications ("id", "tracking_code", "full_name", "tc_vkn", "phone", "email", "is_corporate", "company_name", "tax_office", "package_id", "package_name", "duration", "price", "delivery_type", "address", "city", "district", "notes", "admin_notes", "status", "created_at", "updated_at")
VALUES
('82dd46f1-4e86-4373-b214-ddbb15d68ef8', 'EDF-21229', 'ddd', 'Belirtilmedi', 'ddddddd', NULL, FALSE, NULL, NULL, 'pkg-3-yil', '3 Yıllık E-İmza', '3 Yıl', 2990, 'ankara_yerinde', 'Ankara Adreste Yerinde Teslim & Kurulum', 'ANKARA', 'Etimesgut', 'Hızlı Form Başvurusu (Ankara Adreste Yerinde Teslim & Kurulum)', NULL, 'yeni', '2026-10-01T13:18:57.36159+00:00', '2026-10-01T13:18:57.36159+00:00'),
('e25ef46f-12f8-4dba-b0e0-8144bfcab7ce', 'EDF-28101', 'ddd', 'Belirtilmedi', 'ddddd', NULL, FALSE, NULL, NULL, 'pkg-3-yil', '3 Yıllık E-İmza', '3 Yıl', 2990, 'ankara_yerinde', 'Ankara Adreste Yerinde Teslim & Kurulum', 'ANKARA', 'Etimesgut', 'Hızlı Form Başvurusu (Ankara Adreste Yerinde Teslim & Kurulum)', NULL, 'yeni', '2026-10-01T13:19:37.937151+00:00', '2026-10-01T13:19:37.937151+00:00'),
('95250884-6e87-4ab7-8fae-5a7bb3395764', 'EDF-65453', 'ddddd', 'Belirtilmedi', '0533 381 05 03', NULL, FALSE, NULL, NULL, 'pkg-3-yil', '3 Yıllık E-İmza', '3 Yıl', 2990, 'ankara_yerinde', 'Ankara Adreste Yerinde Teslim & Kurulum', 'ANKARA', 'Etimesgut', 'Hızlı Form Başvurusu (Ankara Adreste Yerinde Teslim & Kurulum)', NULL, 'yeni', '2026-10-01T13:24:26.540289+00:00', '2026-10-01T13:24:26.540289+00:00'),
('c070c998-3458-407b-b637-505b0c238225', 'EDF-38856', 'eeeeeee', 'Belirtilmedi', '0533 381 05 03', NULL, FALSE, NULL, NULL, 'pkg-1-yil', '1 Yıllık E-İmza', '1 Yıl', 2490, 'ankara_yerinde', 'Ankara Adreste Yerinde Teslim & Kurulum', 'ANKARA', 'Etimesgut', 'Hızlı Form Başvurusu (Ankara Adreste Yerinde Teslim & Kurulum)', NULL, 'yeni', '2026-10-01T13:29:02.700897+00:00', '2026-10-01T13:29:02.700897+00:00'),
('a3fe8244-eb30-489f-a2ef-aa24c924729c', 'EDF-53672', 'ddddd', 'Belirtilmedi', '0555 555 55 55', NULL, FALSE, NULL, NULL, 'pkg-3-yil', '3 Yıllık E-İmza', '3 Yıl', 2990, 'magaza', 'Ostim Mağazadan 15 Dk Elden Teslim', 'ANKARA', 'Etimesgut', 'Hızlı Form Başvurusu (Ostim Mağazadan 15 Dk Elden Teslim)', '', 'inceleniyor', '2026-10-01T14:40:06.888765+00:00', '2026-10-01T14:49:02.209+00:00')
ON CONFLICT (id) DO NOTHING;

-- Grant İzinleri
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
