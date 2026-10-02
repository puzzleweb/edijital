import React, { useState } from 'react';
import { Package, PackageCategory } from '../types';
import { StorageService } from '../services/storage';
import { Edit3, Check, Plus, Trash2, Sparkles, Tag, DollarSign, AlertTriangle, Layers } from 'lucide-react';

interface AdminPackagesProps {
  packages: Package[];
}

const DEFAULT_NEW_PACKAGE: Package = {
  id: '',
  name: '2 Yıllık E-İmza',
  duration: '2 Yıl',
  price: 3250,
  originalPrice: 3900,
  category: 'bireysel',
  popular: false,
  badge: 'Avantajlı Paket ⭐',
  description: 'Bireysel ve kurumsal tüm işlemleriniz için 2 yıllık güvenli e-imza çözümü.',
  features: [
    "Ankara'da yerinde kurulum imkânı",
    '10 dakikada hazırlanır, 15 dakikada teslim',
    'E-Devlet, e-Fatura, KEP, UYAP uyumlu',
    'Kurumsal ve bireysel kullanım için ideal',
    'USB Token Donanımı Dahil'
  ]
};

export const AdminPackages: React.FC<AdminPackagesProps> = ({ packages }) => {
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [deletingPkg, setDeletingPkg] = useState<Package | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customDuration, setCustomDuration] = useState(false);

  const handleAddNew = () => {
    setEditingPkg({
      ...DEFAULT_NEW_PACKAGE,
      features: [...DEFAULT_NEW_PACKAGE.features]
    });
    setCustomDuration(false);
  };

  const handleEdit = (pkg: Package) => {
    setEditingPkg({ ...pkg, features: [...pkg.features] });
    const isStandardDuration = ['1 Yıl', '2 Yıl', '3 Yıl', '5 Yıl'].includes(pkg.duration);
    setCustomDuration(!isStandardDuration);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    if (!editingPkg.name.trim() || editingPkg.price <= 0) {
      alert('Lütfen geçerli bir paket adı ve satış fiyatı giriniz.');
      return;
    }

    if (!editingPkg.id) {
      StorageService.addPackage({
        ...editingPkg,
        id: `pkg-${Date.now()}`
      });
      setSuccessMessage('Yeni paket başarıyla eklendi!');
    } else {
      StorageService.updatePackage(editingPkg);
      setSuccessMessage('Paket bilgileri başarıyla güncellendi!');
    }

    setEditingPkg(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const confirmDelete = () => {
    if (!deletingPkg) return;
    if (packages.length <= 1) {
      alert('Sistemde en az 1 aktif paket bulunmalıdır.');
      setDeletingPkg(null);
      return;
    }
    StorageService.deletePackage(deletingPkg.id);
    setDeletingPkg(null);
    setSuccessMessage('Paket başarıyla silindi!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleFeatureChange = (index: number, val: string) => {
    if (!editingPkg) return;
    const newFeatures = [...editingPkg.features];
    newFeatures[index] = val;
    setEditingPkg({ ...editingPkg, features: newFeatures });
  };

  const handleAddFeature = () => {
    if (!editingPkg) return;
    setEditingPkg({ ...editingPkg, features: [...editingPkg.features, 'Yeni Özellik'] });
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingPkg) return;
    const newFeatures = editingPkg.features.filter((_, i) => i !== index);
    setEditingPkg({ ...editingPkg, features: newFeatures });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>E-İmza Paket & Fiyat Yönetimi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
              {packages.length} Paket
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Web sitesinde ve başvuru formlarında listelenen tüm e-imza paketlerini buradan yönetebilir, yeni paket ekleyebilir veya silebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {successMessage && (
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            onClick={handleAddNew}
            className="apple-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Paket Ekle</span>
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`rounded-3xl p-6 bg-white dark:bg-zinc-900 border transition flex flex-col justify-between relative group ${
              pkg.popular
                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md shadow-blue-500/10'
                : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    pkg.category === 'mali_muhur'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : pkg.category === 'kurumsal'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {pkg.category === 'mali_muhur' ? 'MALİ MÜHÜR' : pkg.category ? pkg.category.toUpperCase() : 'BİREYSEL'}
                  </span>
                  {pkg.popular && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Öne Çıkan
                    </span>
                  )}
                </div>
                
                {pkg.badge && (
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/50">
                    {pkg.badge}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {pkg.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4 min-h-[32px] line-clamp-2">
                {pkg.description}
              </p>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                    {pkg.price.toLocaleString('tr-TR')} ₺
                  </span>
                  <span className="text-xs text-gray-400">+ KDV / {pkg.duration}</span>
                </div>
                {pkg.originalPrice && (
                  <div className="text-[11px] text-gray-400 line-through mt-0.5">
                    Normal Fiyat: {pkg.originalPrice.toLocaleString('tr-TR')} ₺
                  </div>
                )}
              </div>

              <div className="space-y-1.5 mb-6 text-xs text-gray-600 dark:text-zinc-400">
                <div className="font-semibold text-gray-800 dark:text-zinc-200 text-[11px] uppercase tracking-wider mb-2">
                  Özellikler ({pkg.features.length})
                </div>
                {pkg.features.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 truncate">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{f}</span>
                  </div>
                ))}
                {pkg.features.length > 4 && (
                  <div className="text-[10px] text-gray-400 pl-5">
                    +{pkg.features.length - 4} diğer özellik...
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
              <button
                onClick={() => handleEdit(pkg)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Düzenle</span>
              </button>

              <button
                onClick={() => setDeletingPkg(pkg)}
                disabled={packages.length <= 1}
                title={packages.length <= 1 ? 'En az bir paket bulunmalıdır' : 'Paketi Sil'}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                  packages.length <= 1
                    ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-zinc-800 text-gray-400'
                    : 'border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Package Create/Edit Modal */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  {editingPkg.id ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    {editingPkg.id ? `Paket Düzenle: ${editingPkg.name}` : 'Yeni Paket Oluştur'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    {editingPkg.id ? 'Paket fiyatını, süresini ve özelliklerini güncelleyin.' : 'Sitede yayınlanacak yeni bir paket ekleyin.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingPkg(null)}
                className="w-7 h-7 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-700 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Name and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Paket Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 2 Yıllık E-İmza veya 3 Yıllık Mali Mühür"
                    value={editingPkg.name}
                    onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={editingPkg.category || 'bireysel'}
                    onChange={(e) => setEditingPkg({ ...editingPkg, category: e.target.value as PackageCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="bireysel">Bireysel E-İmza</option>
                    <option value="kurumsal">Kurumsal E-İmza</option>
                    <option value="mali_muhur">Mali Mühür</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Kullanım Süresi *
                </label>
                <div className="flex gap-2">
                  {!customDuration ? (
                    <select
                      value={editingPkg.duration}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setCustomDuration(true);
                        } else {
                          setEditingPkg({ ...editingPkg, duration: e.target.value });
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="1 Yıl">1 Yıl</option>
                      <option value="2 Yıl">2 Yıl</option>
                      <option value="3 Yıl">3 Yıl</option>
                      <option value="5 Yıl">5 Yıl</option>
                      <option value="custom">Özel Süre Yaz...</option>
                    </select>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Örn: 2 Yıl, 6 Ay, 5 Yıl..."
                        value={editingPkg.duration}
                        onChange={(e) => setEditingPkg({ ...editingPkg, duration: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomDuration(false)}
                        className="px-3 py-1 text-xs rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300"
                      >
                        Listeye Dön
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Price and Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Satış Fiyatı (TL + KDV) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Örn: 2450"
                    value={editingPkg.price || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Normal Liste Fiyatı (TL - Üstü Çizili)
                  </label>
                  <input
                    type="number"
                    placeholder="Örn: 3000 (Opsiyonel)"
                    value={editingPkg.originalPrice || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Badge & Popular Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Kampanya Rozeti
                  </label>
                  <input
                    type="text"
                    value={editingPkg.badge || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, badge: e.target.value })}
                    placeholder="Örn: En Çok Tercih Edilen ⭐"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={editingPkg.popular || false}
                    onChange={(e) => setEditingPkg({ ...editingPkg, popular: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="isPopular" className="font-semibold text-gray-800 dark:text-zinc-200 cursor-pointer text-[11px]">
                    Öne Çıkan Paket Yap (Mavi Vurgu)
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Kısa Açıklama *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Bireysel ve kurumsal tüm işlemleriniz için güvenli e-imza çözümü."
                  value={editingPkg.description}
                  onChange={(e) => setEditingPkg({ ...editingPkg, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Features list editor */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-gray-700 dark:text-zinc-300">
                    Özellik Maddeleri ({editingPkg.features.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 text-[11px] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Özellik Ekle</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {editingPkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder="Özellik metni..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        disabled={editingPkg.features.length <= 1}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition cursor-pointer disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-semibold text-gray-700 dark:text-zinc-300 transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="apple-btn-primary px-5 py-2 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPkg.id ? 'Değişiklikleri Kaydet' : 'Paketi Oluştur & Yayınla'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Paketi Silmek İstiyor musunuz?
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                <strong className="text-gray-900 dark:text-white">{deletingPkg.name}</strong> paketi sistemden ve web sitesinden kalıcı olarak kaldırılacaktır.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPkg(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-semibold text-xs text-gray-700 dark:text-zinc-300 transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-sm shadow-red-600/20"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
