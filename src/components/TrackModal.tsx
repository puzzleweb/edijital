import React, { useState } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin, 
  Phone, 
  AlertCircle,
  FileCheck2,
  Truck,
  Sparkles
} from 'lucide-react';
import { Application, SiteSettings } from '../types';
import { StorageService } from '../services/storage';
import { SupabaseService } from '../services/supabaseService';

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
}

export const TrackModal: React.FC<TrackModalProps> = ({ isOpen, onClose, settings }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Application | null>(null);
  const [searched, setSearched] = useState(false);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const cleanQ = query.trim().toUpperCase();

    // 1. First try direct live Supabase lookup
    const cloudApp = await SupabaseService.getApplicationByTrackingCode(cleanQ);
    if (cloudApp) {
      setResult(cloudApp);
      setSearched(true);
      setLoading(false);
      return;
    }

    // 2. Fallback to local cache search
    const apps = StorageService.getApplications();
    const cleanLower = query.trim().toLowerCase();

    const found = apps.find(a => 
      a.trackingCode.toLowerCase() === cleanLower || 
      a.tcVkn.toLowerCase() === cleanLower ||
      a.phone.replace(/\s+/g, '').includes(cleanLower.replace(/\s+/g, ''))
    );

    setResult(found || null);
    setSearched(true);
    setLoading(false);
  };

  const steps = [
    { key: 'yeni', label: 'Başvuru Alındı', desc: 'Talebiniz sisteme kaydedildi' },
    { key: 'inceleniyor', label: 'Kimlik & Evrak Kontrolü', desc: 'Bilgileriniz doğrulanıyor' },
    { key: 'onaylandi', label: 'Sertifika Onaylandı', desc: 'BTK ve ArkSigner onayı tamamlandı' },
    { key: 'hazirlandi', label: 'Token Hazırlandı', desc: 'Cihazınıza e-imzanız yüklendi' },
    { key: 'teslim_edildi', label: 'Teslim Edildi', desc: 'Teslim ve kurulum tamamlandı' }
  ];

  const getStepIndex = (status: Application['status']) => {
    switch (status) {
      case 'yeni': return 0;
      case 'inceleniyor': return 1;
      case 'onaylandi': return 2;
      case 'hazirlandi': return 3;
      case 'teslim_edildi': return 4;
      case 'iptal': return -1;
      default: return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full h-full sm:h-auto max-w-lg rounded-none sm:rounded-3xl bg-white dark:bg-zinc-900 border-0 sm:border border-gray-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-none sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Başvuru Durumu Sorgulama
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                Takip Kodu veya T.C. Kimlik No ile sorgulayın
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 flex items-center justify-center transition cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Takip Kodu (Örn: EDF-94821) veya T.C. No"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              type="submit"
              className="apple-btn-primary px-5 py-2.5 text-xs font-bold shrink-0"
            >
              Sorgula
            </button>
          </form>

          {/* Quick sample hints */}
          {!searched && (
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300">
              💡 <strong>Hızlı Deneme:</strong> Örnek takip kodu <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded cursor-pointer" onClick={() => setQuery('EDF-94821')}>EDF-94821</code> veya <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded cursor-pointer" onClick={() => setQuery('EDF-73912')}>EDF-73912</code> deneyebilirsiniz.
            </div>
          )}

          {/* Search Result */}
          {searched && (
            result ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Result header card */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-extrabold text-blue-600 dark:text-blue-400">
                      {result.trackingCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      result.status === 'teslim_edildi'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        : result.status === 'iptal'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-gray-700 dark:text-zinc-300 space-y-1">
                    <div>Başvuran: <strong>{result.fullName}</strong></div>
                    <div>Paket: <strong>{result.packageName}</strong></div>
                    <div>Teslimat: <strong>{
                      result.deliveryType === 'magaza' ? 'Ostim Mağaza Teslim' :
                      result.deliveryType === 'ankara_yerinde' ? 'Ankara Adrese Yerinde Kurulum' : 'Kargo ile Adrese Teslim'
                    }</strong></div>
                  </div>

                  {result.adminNotes && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-zinc-700 text-xs text-gray-500 dark:text-zinc-400">
                      <strong>Yetkili Notu:</strong> {result.adminNotes}
                    </div>
                  )}
                </div>

                {/* Progress Steps Timeline */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                    Süreç Aşamaları
                  </h4>

                  <div className="space-y-3">
                    {steps.map((step, idx) => {
                      const currentIdx = getStepIndex(result.status);
                      const isCompleted = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <div key={step.key} className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isCompleted 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-gray-200 dark:bg-zinc-800 text-gray-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${isCurrent ? 'text-blue-600 dark:text-blue-400 font-extrabold' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-zinc-500'}`}>
                              {step.label}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct support action */}
                <div className="pt-2">
                  <a
                    href={`tel:${settings.phone}`}
                    className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Müşteri Temsilcisini Ara: {settings.phoneDisplay}</span>
                  </a>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Başvuru Bulunamadı
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Girdiğiniz takip kodu veya T.C. numarasına ait aktif bir başvuru kaydı bulunamadı. Lütfen bilgilerinizi kontrol ediniz.
                </p>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
};
