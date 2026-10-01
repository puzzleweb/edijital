import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Lock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '../types';

export type LegalDocType = 'kvkk' | 'mesafeli-satis' | 'gizlilik' | 'teslimat-iade';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  initialDoc?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  settings,
  initialDoc = 'kvkk'
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialDoc);

  useEffect(() => {
    if (initialDoc) {
      setActiveTab(initialDoc);
    }
  }, [initialDoc]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'kvkk' as LegalDocType, title: 'KVKK Aydınlatma Metni', icon: ShieldCheck },
    { id: 'mesafeli-satis' as LegalDocType, title: 'Mesafeli Satış Sözleşmesi', icon: FileText },
    { id: 'gizlilik' as LegalDocType, title: 'Gizlilik ve Güvenlik', icon: Lock },
    { id: 'teslimat-iade' as LegalDocType, title: 'Teslimat & İade Şartları', icon: RefreshCw },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl bg-white dark:bg-zinc-900 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-150 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Yasal Bilgilendirme & Sözleşmeler
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {settings.companyName} Resmi Sözleşme ve Yasal Politikaları
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-2 sm:px-6 bg-slate-100/60 dark:bg-zinc-950/40 border-b border-slate-200 dark:border-zinc-800 overflow-x-auto shrink-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 space-y-5 leading-relaxed">
          
          {/* KVKK Content */}
          {activeTab === 'kvkk' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-2">
                6698 SAYILI KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) AYDINLATMA METNİ
              </h4>
              
              <p>
                <strong>1. Veri Sorumlusu:</strong> {settings.companyName} (“Şirket”) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca kişisel verilerinizin güvenliğine ve gizliliğine azami önem vermekteyiz.
              </p>

              <p>
                <strong>2. İşlenen Kişisel Veriler:</strong> Elektronik İmza (E-İmza) başvurularınız kapsamında ad, soyad, T.C. kimlik numarası, iletişim bilgileri (telefon, e-posta, teslimat adresi), kimlik seri no ve imza sirküleri gibi yasal kimlik doğrulama verileri işlenmektedir.
              </p>

              <p>
                <strong>3. Kişisel Verilerin İşlenme Amacı:</strong> 5070 Sayılı Elektronik İmza Kanunu ve Bilgi Teknolojileri ve İletişim Kurumu (BTK) mevzuatlarına uygun olarak nitelikli elektronik sertifika üretimi, kimlik doğrulama, yerinde/elden teslimat, faturalandırma ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenir.
              </p>

              <p>
                <strong>4. Verilerin Aktarılması:</strong> Kişisel verileriniz yalnızca yetkili Elektronik Sertifika Hizmet Sağlayıcısı (Arkimza / ArkSigner) ve yasal olarak yetkili kamu kurum ve kuruluşları (BTK, Gelir İdaresi Başkanlığı, Yargı Mercileri) ile kanuni sınırlar çerçevesinde paylaşılmaktadır. Üçüncü şahıslara ticari amaçla satılmaz veya devredilmez.
              </p>

              <p>
                <strong>5. Haklarınız:</strong> KVKK’nın 11. maddesi uyarınca dilediğiniz zaman şirketimize başvurarak verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya kanuni şartlar dahilinde silinmesini talep etme hakkına sahipsiniz.
              </p>
            </div>
          )}

          {/* Mesafeli Satış Sözleşmesi */}
          {activeTab === 'mesafeli-satis' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-2">
                MESAFELİ SATIŞ SÖZLEŞMESİ
              </h4>

              <p>
                <strong>Madde 1 - Taraflar:</strong><br />
                <strong>Satıcı:</strong> {settings.companyName}<br />
                <strong>Adres:</strong> {settings.address}, {settings.addressDetail}<br />
                <strong>Telefon:</strong> {settings.phoneDisplay} | <strong>E-Posta:</strong> {settings.email}<br />
                <strong>Alıcı:</strong> www.edijitalfinans.com üzerinden elektronik ortamda e-imza başvurusu yapan gerçek veya tüzel kişi.
              </p>

              <p>
                <strong>Madde 2 - Konu:</strong> İşbu sözleşmenin konusu, Alıcı’nın Satıcı’ya ait web sitesinden siparişini verdiği 5070 Sayılı Kanuna uygun Nitelikli Elektronik İmza (USB Token donanımı ve sertifika süresi) ürün/hizmetinin satışı ve teslimine ilişkin 6502 sayılı Kanun kapsamındaki hak ve yükümlülüklerin belirlenmesidir.
              </p>

              <p>
                <strong>Madde 3 - Teslimat Koşulları:</strong> Alıcı’nın tercihine göre Ostim mağazadan 15 dakikada elden teslim veya Ankara içi adrese kurye ile yerinde kimlik teyidi yapılarak teslim edilir.
              </p>

              <p>
                <strong>Madde 4 - Ödeme ve Fatura:</strong> Ürün ve hizmet bedelleri web sitesinde belirtilen güncel fiyatlar üzerinden nakit, kredi kartı veya havale/EFT yoluyla tahsil edilir. Yasal fatura Alıcı’nın bildirdiği e-posta adresine e-arşiv fatura olarak iletilir.
              </p>
            </div>
          )}

          {/* Gizlilik ve Güvenlik Politikası */}
          {activeTab === 'gizlilik' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-2">
                GİZLİLİK VE GÜVENLİK POLİTİKASI
              </h4>

              <p>
                <strong>1. Güvenli İletişim:</strong> Web sitemiz üzerinden iletilen tüm veriler 256-bit SSL (Secure Sockets Layer) şifreleme sertifikası ile korunmaktadır. Bilgileriniz transfer esnasında üçüncü şahısların erişimine kapalıdır.
              </p>

              <p>
                <strong>2. Veri Güvenliği:</strong> E-İmza üretiminde kullanılan kimlik doğrulama bilgileri yüksek güvenlikli sunucularda saklanmakta ve yetkisiz erişimlere karşı uluslararası güvenlik protokolleri ile korunmaktadır.
              </p>

              <p>
                <strong>3. Çerez Politikası:</strong> Sitemizde kullanıcı deneyimini iyileştirmek, oturumları yönetmek ve analitik veriler toplamak amacıyla temel çerezler (cookies) kullanılmaktadır. Tarayıcı ayarlarınızdan çerez tercihlerinizi dilediğiniz an değiştirebilirsiniz.
              </p>
            </div>
          )}

          {/* Teslimat ve İade Şartları */}
          {activeTab === 'teslimat-iade' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-2">
                TESLİMAT VE İADE / İPTAL ŞARTLARI
              </h4>

              <p>
                <strong>1. Teslimat Seçenekleri ve Süreleri:</strong><br />
                • <strong>Ostim Mağaza Teslim:</strong> Kimlik ibrazı ile mağazamızda yaklaşık 15 dakika içinde e-imzanız hazırlanıp elden teslim edilir.<br />
                • <strong>Ankara Adrese Yerinde Teslimat:</strong> Uzman personelimiz adresinize gelerek yüz yüze kimlik doğrulamanızı gerçekleştirir ve kurulum desteğiyle birlikte teslim eder.
              </p>

              <p>
                <strong>2. İade ve İptal Koşulları (Cayma Hakkı İstisnası):</strong><br />
                Elektronik İmza sertifikaları, 5070 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesi uyarınca <em>“Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler”</em> kapsamında yer aldığından, sertifika üretimi tamamlandıktan ve aktive edildikten sonra yasal olarak cayma ve iade hakkı bulunmamaktadır.
              </p>

              <p>
                <strong>3. Donanım Arızası ve Garanti:</strong> Satın alınan USB Token donanımları 2 yıl üretici garantisi altındadır. Donanımsal arıza durumunda birebir değişim sağlanır.
              </p>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>T.C. Bilgi Teknolojileri ve İletişim Kurumu (BTK) & 5070 Sayılı Kanun Uyumlu</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer"
          >
            Anladım, Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
