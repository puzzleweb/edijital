import React, { useState } from 'react';
import { Package, PackageCategory } from '../types';
import { StorageService } from '../services/storage';
import { Edit3, Check, Plus, Trash2, Sparkles, Tag, DollarSign } from 'lucide-react';

interface AdminPackagesProps {
  packages: Package[];
}

export const AdminPackages: React.FC<AdminPackagesProps> = ({ packages }) => {
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleEdit = (pkg: Package) => {
    setEditingPkg({ ...pkg, features: [...pkg.features] });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    StorageService.updatePackage(editingPkg);
    setSavedSuccess(true);
    setEditingPkg(null);
    setTimeout(() => setSavedSuccess(false), 3000);
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
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            E-İmza Paket & Fiyat Yönetimi
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Web sitesinde listelenen 1 ve 3 yıllık paketlerin fiyatlarını, indirimlerini ve özelliklerini buradan güncelleyebilirsiniz.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Fiyatlar Başarıyla Güncellendi!</span>
          </div>
        )}
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`rounded-3xl p-6 bg-white dark:bg-zinc-900 border transition flex flex-col justify-between ${
              pkg.popular
                ? 'border-blue-500 shadow-md shadow-blue-500/10'
                : 'border-gray-200 dark:border-zinc-800'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  pkg.category === 'kurumsal'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {pkg.category.toUpperCase()}
                </span>
                {pkg.badge && (
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    {pkg.badge}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {pkg.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4 min-h-[32px]">
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
                  <div className="text-[11px] text-gray-400 line-through">
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

            <button
              onClick={() => handleEdit(pkg)}
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Fiyatı & Bilgileri Düzenle</span>
            </button>
          </div>
        ))}
      </div>

      {/* Package Edit Modal */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/50">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Paket Düzenleme: {editingPkg.name}
              </h3>
              <button
                onClick={() => setEditingPkg(null)}
                className="w-7 h-7 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Paket Adı *</label>
                  <input
                    type="text"
                    required
                    value={editingPkg.name}
                    onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Süre (1 veya 3 Yıl) *</label>
                  <select
                    value={editingPkg.duration}
                    onChange={(e) => setEditingPkg({ ...editingPkg, duration: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                  >
                    <option value="1 Yıl">1 Yıl</option>
                    <option value="3 Yıl">3 Yıl</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Satış Fiyatı (TL) *</label>
                  <input
                    type="number"
                    required
                    value={editingPkg.price}
                    onChange={(e) => setEditingPkg({ ...editingPkg, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Çizili Normal Fiyat (TL)</label>
                  <input
                    type="number"
                    value={editingPkg.originalPrice || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Kampanya Rozeti</label>
                  <input
                    type="text"
                    value={editingPkg.badge || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, badge: e.target.value })}
                    placeholder="Örn: En Çok Tercih Edilen ⭐"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={editingPkg.popular || false}
                    onChange={(e) => setEditingPkg({ ...editingPkg, popular: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="isPopular" className="font-semibold text-gray-700 dark:text-zinc-300 cursor-pointer">
                    Öne Çıkan Paket Yap (Mavi Çerçeve)
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Açıklama</label>
                <input
                  type="text"
                  value={editingPkg.description}
                  onChange={(e) => setEditingPkg({ ...editingPkg, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Features list editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-gray-700 dark:text-zinc-300">Özellikler Listesi</label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Özellik Ekle</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {editingPkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="apple-btn-primary px-5 py-2 font-bold"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
