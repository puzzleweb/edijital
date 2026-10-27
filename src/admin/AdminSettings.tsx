import React, { useState, useEffect } from 'react';
import { SiteSettings, DeliveryOptionItem, DeliveryType } from '../types';
import { StorageService, DEFAULT_DELIVERY_OPTIONS } from '../services/storage';
import { Settings, Save, Check, Phone, MapPin, Clock, Bell, Sparkles, RefreshCw, Truck, Plus, Trash2, CreditCard, Building2, Landmark, Wallet, ShieldCheck, ExternalLink, Key, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { IsyerimPosService, ISYERIM_TEST_CARDS, DEFAULT_ISYERIM_CONFIG } from '../services/isyerimPosService';

interface AdminSettingsProps {
  settings: SiteSettings;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings }) => {
  const [formData, setFormData] = useState<SiteSettings>(() => {
    const raw = (settings.deliveryOptions && settings.deliveryOptions.length > 0)
      ? settings.deliveryOptions
      : DEFAULT_DELIVERY_OPTIONS;
    const filtered = raw.filter(d => d.id !== 'del-1' && d.id !== 'del-2' && !d.title?.includes('Ostim') && !d.title?.includes('Ankara Adreste'));
    return {
      ...settings,
      deliveryOptions: filtered.length > 0 ? filtered : DEFAULT_DELIVERY_OPTIONS
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTestCards, setShowTestCards] = useState(false);

  const handleTestIsyerimPos = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await IsyerimPosService.testConnection({
        merchantId: formData.isyerimPosMerchantId || DEFAULT_ISYERIM_CONFIG.testMerchantId,
        userId: formData.isyerimPosUserId || DEFAULT_ISYERIM_CONFIG.testUserId,
        apiKey: formData.isyerimPosApiKey || DEFAULT_ISYERIM_CONFIG.testApiKey,
        isTestMode: formData.isyerimPosTestMode !== false
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Bağlantı testi başarısız oldu' });
    } finally {
      setTestLoading(false);
    }
  };

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
            Web sitesinde yer alan telefon, WhatsApp, adres, çalışma saatleri, ödeme yöntemleri, banka IBAN bilgileri ve duyuru bandı ayarlarını canlı olarak güncelleyin.
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

        {/* ÖDEME YÖNTEMLERİ & BANKA HESAP (IBAN) AYARLARI */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-500" />
                <span>Ödeme Yöntemleri & Banka IBAN Yönetimi</span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                Ödeme sayfasında müşteriye sunulan Banka Havalesi / EFT, IBAN hesap bilgileri, Kredi Kartı ve Kapıda Ödeme ayarlarını yapılandırın.
              </p>
            </div>
          </div>

          {/* 1. BANKA HAVALESİ / EFT & IBAN BİLGİLERİ */}
          <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/50 dark:border-amber-900/30">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  Banka Havalesi / EFT & IBAN Bilgileri
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bankTransferActive !== false}
                  onChange={(e) => setFormData({ ...formData, bankTransferActive: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  {formData.bankTransferActive !== false ? 'Havale/EFT Aktif' : 'Pasif'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Banka Adı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Ziraat Bankası / Garanti BBVA / QNB Finansbank"
                  value={formData.bankName || ''}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Hesap Sahibi / Alıcı Ünvanı (Firma Adı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: E-DİJİTAL FİNANS DANIŞMANLIK LİMİTED ŞİRKETİ"
                  value={formData.ibanRecipient || ''}
                  onChange={(e) => setFormData({ ...formData, ibanRecipient: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  IBAN Numarası (TR ile başlar)
                </label>
                <input
                  type="text"
                  placeholder="Örn: TR12 0006 2000 0001 2345 6789 01"
                  value={formData.iban || ''}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 font-mono font-bold text-gray-900 dark:text-white tracking-wider"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Şube Adı / Şube Kodu (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Ostim Şubesi (Şube Kodu: 1042)"
                  value={formData.bankBranch || ''}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Müşteriye Gösterilecek Havale Talimatı / Açıklama Notu
                </label>
                <input
                  type="text"
                  placeholder="Örn: Açıklamaya sipariş takip kodunuzu (Örn: EDF-12345) yazınız."
                  value={formData.bankTransferNote || ''}
                  onChange={(e) => setFormData({ ...formData, bankTransferNote: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* 2. KREDİ / BANKA KARTI & İŞYERİM POS AYARLARI */}
          <div className="p-5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-blue-200/50 dark:border-blue-900/30 gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-blue-900 dark:text-blue-200">
                  Kredi / Banka Kartı (İşyerim POS Sanal POS)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  dev.isyerimpos.com
                </span>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.creditCardActive !== false}
                    onChange={(e) => setFormData({ ...formData, creditCardActive: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    {formData.creditCardActive !== false ? 'Kartla Ödeme Açık' : 'Kapalı'}
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Sanal POS Başlığı / Sağlayıcı
                </label>
                <input
                  type="text"
                  placeholder="Örn: 256-Bit SSL & 3D Secure Sanal POS"
                  value={formData.posProvider || ''}
                  onChange={(e) => setFormData({ ...formData, posProvider: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Kart Açıklama / Bilgilendirme
                </label>
                <input
                  type="text"
                  placeholder="Örn: Tüm Visa, MasterCard ve Troy kartlarla güvenli ödeme."
                  value={formData.posDescription || ''}
                  onChange={(e) => setFormData({ ...formData, posDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* İşyerim POS API Ayarları Kutusu */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/80 border border-blue-100 dark:border-blue-900/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-zinc-900 dark:text-white">
                    İşyerim POS API Entegrasyon Bilgileri
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={formData.isyerimPosActive !== false}
                      onChange={(e) => setFormData({ ...formData, isyerimPosActive: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>İşyerim POS Aktif</span>
                  </label>
                </div>
              </div>

              {/* Ortam Seçimi: Test vs Canlı */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isyerimPosTestMode: true })}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    formData.isyerimPosTestMode !== false
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-500'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-zinc-900 dark:text-white block">🧪 Test Ortamı</span>
                    <span className="text-[10px] text-zinc-500 font-mono">https://apitest.isyerimpos.com/v1/</span>
                  </div>
                  {formData.isyerimPosTestMode !== false && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isyerimPosTestMode: false })}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    formData.isyerimPosTestMode === false
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-zinc-900 dark:text-white block">🚀 Canlı / Gerçek Ortam</span>
                    <span className="text-[10px] text-zinc-500 font-mono">https://api.isyerimpos.com/v1/</span>
                  </div>
                  {formData.isyerimPosTestMode === false && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              </div>

              {/* API Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Merchant ID (Üye İşyeri No) *
                  </label>
                  <input
                    type="text"
                    placeholder="11039"
                    value={formData.isyerimPosMerchantId ?? DEFAULT_ISYERIM_CONFIG.testMerchantId}
                    onChange={(e) => setFormData({ ...formData, isyerimPosMerchantId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    API User ID (Kullanıcı No) *
                  </label>
                  <input
                    type="text"
                    placeholder="445"
                    value={formData.isyerimPosUserId ?? DEFAULT_ISYERIM_CONFIG.testUserId}
                    onChange={(e) => setFormData({ ...formData, isyerimPosUserId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    API Key (Gizli Anahtar) *
                  </label>
                  <input
                    type="password"
                    placeholder="AQAAAAEAACcQAAAA..."
                    value={formData.isyerimPosApiKey ?? DEFAULT_ISYERIM_CONFIG.testApiKey}
                    onChange={(e) => setFormData({ ...formData, isyerimPosApiKey: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Additional Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    3D Secure İşlemi
                  </label>
                  <select
                    value={formData.require3dSecure !== false ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, require3dSecure: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                  >
                    <option value="true">Zorunlu (3D Secure ile Güvenli)</option>
                    <option value="false">İsteğe Bağlı / Non-3D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Taksit Seçenekleri
                  </label>
                  <select
                    value={formData.isyerimPosInstallmentsActive !== false ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isyerimPosInstallmentsActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                  >
                    <option value="true">Aktif (Taksit Tablosu Göster)</option>
                    <option value="false">Pasif (Yalnızca Tek Çekim)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Komisyon Maliyeti (ReflectCost)
                  </label>
                  <select
                    value={formData.isyerimPosReflectCost === 'true' ? 'true' : formData.isyerimPosReflectCost === 'null' ? 'null' : 'false'}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData({
                        ...formData,
                        isyerimPosReflectCost: v === 'true' ? 'true' : v === 'null' ? 'null' : 'false'
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                  >
                    <option value="false">Müşteriye Yansıtma (Firma Karşılar - Sepet Tutarını Birebir Çek)</option>
                    <option value="true">Müşteriye Yansıt (+Komisyon & Vade Farkı Ekle)</option>
                    <option value="null">İşyerim POS Panel Tanımına Bırak</option>
                  </select>
                </div>
              </div>

              {/* Action buttons & test connection */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestIsyerimPos}
                    disabled={testLoading}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {testLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>{testLoading ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        isyerimPosMerchantId: DEFAULT_ISYERIM_CONFIG.testMerchantId,
                        isyerimPosUserId: DEFAULT_ISYERIM_CONFIG.testUserId,
                        isyerimPosApiKey: DEFAULT_ISYERIM_CONFIG.testApiKey,
                        isyerimPosTestMode: true
                      });
                      setTestResult({ success: true, message: 'Test bilgileri başarıyla forma yüklendi.' });
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition cursor-pointer"
                  >
                    Varsayılan Test Bilgilerini Doldur
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTestCards(!showTestCards)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showTestCards ? 'Test Kartlarını Gizle' : 'Test Kartlarını Gör'}</span>
                  </button>

                  <a
                    href="https://dev.isyerimpos.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-600 transition"
                  >
                    <span>Dökümantasyon</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Test Result Message Banner */}
              {testResult && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Test Cards Reference Table */}
              {showTestCards && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2 animate-in fade-in">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                    <span>İşyerim POS Test Kartları (dev.isyerimpos.com)</span>
                    <span className="text-[10px] text-zinc-400">SMS şifresi genelde "a" dır</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-500 uppercase">
                          <th className="py-1 px-2">Banka</th>
                          <th className="py-1 px-2">Kart Numarası</th>
                          <th className="py-1 px-2">SKT</th>
                          <th className="py-1 px-2">CVV</th>
                          <th className="py-1 px-2">SMS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-700/60 font-mono text-[11px]">
                        {ISYERIM_TEST_CARDS.map((card, idx) => (
                          <tr key={idx} className={card.recommended ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''}>
                            <td className="py-1.5 px-2 font-sans font-medium text-zinc-900 dark:text-white flex items-center gap-1">
                              <span>{card.bank}</span>
                              {card.recommended && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-bold">Önerilen</span>
                              )}
                            </td>
                            <td className="py-1.5 px-2 font-bold text-blue-600 dark:text-blue-400">{card.cardNo}</td>
                            <td className="py-1.5 px-2">{card.expiry}</td>
                            <td className="py-1.5 px-2">{card.cvv}</td>
                            <td className="py-1.5 px-2 text-emerald-600 dark:text-emerald-400 font-bold">{card.smsCode || 'a'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* 3. KAPIDA / ADRESTE ÖDEME AYARLARI */}
          <div className="p-5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-200/50 dark:border-purple-900/30">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-purple-900 dark:text-purple-200">
                  Kapıda / Adreste Tahsilat
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.cashOnDeliveryActive)}
                  onChange={(e) => setFormData({ ...formData, cashOnDeliveryActive: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                  {formData.cashOnDeliveryActive ? 'Kapıda Ödeme Aktif' : 'Kapıda Ödeme Kapalı'}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Kapıda Ödeme Bilgilendirme Metni
              </label>
              <input
                type="text"
                placeholder="Örn: Teslimat esnasında nakit veya mobil POS ile kartla ödeme."
                value={formData.cashOnDeliveryNote || ''}
                onChange={(e) => setFormData({ ...formData, cashOnDeliveryNote: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white"
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
