import React, { useState, useEffect } from 'react';
import { SiteSettings, DeliveryOptionItem, DeliveryType } from '../types';
import { StorageService, DEFAULT_DELIVERY_OPTIONS } from '../services/storage';
import { Settings, Save, Check, Phone, MapPin, Clock, Bell, Sparkles, RefreshCw, Truck, Plus, Trash2 } from 'lucide-react';

interface AdminSettingsProps {
  settings: SiteSettings;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings }) => {
  const [formData, setFormData] = useState<SiteSettings>(() => ({
    ...settings,
    deliveryOptions: (settings.deliveryOptions && settings.deliveryOptions.length > 0)
      ? settings.deliveryOptions
      : DEFAULT_DELIVERY_OPTIONS
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updatedSettings: SiteSettings = {
      ...formData,
      district: formData.addressDetail || formData.district
    };
    StorageService.updateSettings(updatedSettings);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Site & Firma İletişim Ayarları
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Web sitesinde yer alan telefon, WhatsApp, adres, çalışma saatleri, teslimat seçenekleri ve duyuru bandı ayarlarını canlı olarak güncelleyin.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Firma & Bayilik Bilgileri</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Firma / Marka Adı
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Yetkili İş Ortaklığı / Bayi Unvanı
              </label>
              <input
                type="text"
                required
                value={formData.officialPartner}
                onChange={(e) => setFormData({ ...formData, officialPartner: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-500" />
            <span>İletişim & Destek Numaraları</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Telefon (Arama Formatı)
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Telefon (Görünüm Formatı)
              </label>
              <input
                type="text"
                required
                value={formData.phoneDisplay}
                onChange={(e) => setFormData({ ...formData, phoneDisplay: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                WhatsApp Numarası (Ülke koduyla)
              </label>
              <input
                type="text"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Resmi E-Posta Adresi
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Address & Hours */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>Adres & Çalışma Saatleri</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Ofis / Mağaza Adresi
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                İlçe & Şehir Detayı
              </label>
              <input
                type="text"
                required
                value={formData.addressDetail}
                onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value, district: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Çalışma Saatleri
              </label>
              <input
                type="text"
                required
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Çalışma Günleri
              </label>
              <input
                type="text"
                required
                value={formData.workingDays}
                onChange={(e) => setFormData({ ...formData, workingDays: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-100 dark:border-zinc-800">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Google Harita Konum Arama Metni / Bina Adı
              </label>
              <input
                type="text"
                placeholder="Örn: Prestij Plaza, 100. Yıl Bulvarı, Ostim OSB, Ankara"
                value={formData.mapLocationQuery || ''}
                onChange={(e) => setFormData({ ...formData, mapLocationQuery: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
              <p className="text-[11px] text-gray-400 mt-1">Harita iğnesinin tam binanızın üzerine gelmesi için bina ve cadde adını yazabilirsiniz.</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Özel Google Maps Embed Linki / Iframe (Opsiyonel)
              </label>
              <input
                type="text"
                placeholder="https://maps.google.com/maps?... veya iframe kodu"
                value={formData.mapEmbedUrl || ''}
                onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white font-mono text-[11px]"
              />
              <p className="text-[11px] text-gray-400 mt-1">Doğrudan Google Haritalar'dan aldığınız 'Haritayı yerleştir' embed bağlantısı.</p>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-500" />
            <span>Üst Duyuru Bandı</span>
          </h3>

          <div className="text-xs space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="annActive"
                checked={formData.announcementActive}
                onChange={(e) => setFormData({ ...formData, announcementActive: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600"
              />
              <label htmlFor="annActive" className="font-semibold text-gray-800 dark:text-zinc-200 cursor-pointer">
                Web sitesinin en üstündeki duyuru bandını göster
              </label>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Duyuru Metni
              </label>
              <input
                type="text"
                value={formData.announcementText}
                onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Service Methods (Teslimat & Hizmet Şekli Seçenekleri) */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-500" />
                <span>Teslimat & Hizmet Şekli Seçenekleri</span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                Hem ana sayfadaki Hızlı Form'da hem de Başvuru Modalında müşteriye sunulan teslimat seçeneklerini buradan yönetebilirsiniz.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const currentOptions = formData.deliveryOptions && formData.deliveryOptions.length > 0
                  ? formData.deliveryOptions 
                  : DEFAULT_DELIVERY_OPTIONS;
                const newOption: DeliveryOptionItem = {
                  id: `del-${Date.now()}`,
                  title: 'Yeni Teslimat Seçeneği',
                  description: 'Teslimat seçeneği açıklaması',
                  type: 'ankara_yerinde',
                  badge: '',
                  active: true
                };
                setFormData({
                  ...formData,
                  deliveryOptions: [...currentOptions, newOption]
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-bold transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Seçenek Ekle</span>
            </button>
          </div>

          <div className="space-y-4">
            {(formData.deliveryOptions || DEFAULT_DELIVERY_OPTIONS).map((option, index) => (
              <div 
                key={option.id || `opt-${index}`}
                className={`p-4 rounded-2xl border transition-all ${
                  option.active !== false 
                    ? 'border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40' 
                    : 'border-dashed border-gray-200 dark:border-zinc-800 bg-gray-100/40 dark:bg-zinc-900/40 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {option.title || `Seçenek #${index + 1}`}
                    </span>
                    {option.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                        {option.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Active toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.deliveryOptions || DEFAULT_DELIVERY_OPTIONS;
                        const updated = [...current];
                        updated[index] = { ...updated[index], active: updated[index].active === false ? true : false };
                        setFormData({ ...formData, deliveryOptions: updated });
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                        option.active !== false
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {option.active !== false ? 'Aktif' : 'Pasif'}
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.deliveryOptions || DEFAULT_DELIVERY_OPTIONS;
                        const updated = current.filter((_, i) => i !== index);
                        setFormData({ ...formData, deliveryOptions: updated });
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                      title="Seçeneği Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                        Seçenek Başlığı (Formda Görünecek İsim) *
                      </label>
                      <input
                        type="text"
                        required
                        value={option.title}
                        onChange={(e) => {
                          const current = formData.deliveryOptions || DEFAULT_DELIVERY_OPTIONS;
                          const updated = [...current];
                          updated[index] = { ...updated[index], title: e.target.value };
                          setFormData({ ...formData, deliveryOptions: updated });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                        placeholder="Örn: Ostim Mağazadan 15 Dk Elden Teslim"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                        Rozet / Etiket (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={option.badge || ''}
                        onChange={(e) => {
                          const current = formData.deliveryOptions || DEFAULT_DELIVERY_OPTIONS;
                          const updated = [...current];
                          updated[index] = { ...updated[index], badge: e.target.value };
                          setFormData({ ...formData, deliveryOptions: updated });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                        placeholder="Örn: Hızlı Teslimat, Tavsiye Edilen, Ücretsiz"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Açıklama (Modalda ve Bilgilendirmede Görünür)
                    </label>
                    <input
                      type="text"
                      value={option.description}
                      onChange={(e) => {
                        const current = formData.deliveryOptions || DEFAULT_DELIVERY_OPTIONS;
                        const updated = [...current];
                        updated[index] = { ...updated[index], description: e.target.value };
                        setFormData({ ...formData, deliveryOptions: updated });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                      placeholder="Örn: Ostim ofisimizden hemen 15 dakikada elden teslim alın."
                    />
                  </div>
                </div>
              </div>
            ))}

            {(!formData.deliveryOptions || formData.deliveryOptions.length === 0) && (
              <div className="p-6 text-center text-xs text-gray-500 dark:text-zinc-400 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
                Henüz teslimat seçeneği eklenmemiş. Yukarıdaki "Yeni Seçenek Ekle" butonuna tıklayarak ekleyebilirsiniz.
              </div>
            )}
          </div>
        </div>

        {/* Sticky Save Button Bar */}
        <div className="pt-3 flex items-center justify-end sticky bottom-4 z-30 p-2.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-gray-200/80 dark:border-zinc-800/80 shadow-2xl">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-8 py-3.5 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-xl transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-75 ${
              savedSuccess
                ? 'bg-emerald-600 shadow-emerald-600/30'
                : isSaving
                  ? 'bg-blue-700 shadow-blue-600/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>✓ Başarıyla Kaydedildi ve Yayınlandı!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Tüm Ayarları Kaydet</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
