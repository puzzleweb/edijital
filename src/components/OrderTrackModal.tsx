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
  Sparkles,
  CreditCard,
  Building2,
  MessageSquare,
  Scale,
  Printer,
  Eye
} from 'lucide-react';
import { Order, SiteSettings } from '../types';
import { StorageService } from '../services/storage';
import { SupabaseService } from '../services/supabaseService';
import { generateCustomerContractSnapshots } from '../data/defaultLegalDocs';

interface OrderTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
}

export const OrderTrackModal: React.FC<OrderTrackModalProps> = ({ isOpen, onClose, settings }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewingContract, setViewingContract] = useState<{ title: string; contentHtml: string } | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const cleanQ = query.trim().toUpperCase();

    // 1. First try live Supabase lookup
    const cloudApp = await SupabaseService.getApplicationByTrackingCode(cleanQ);
    if (cloudApp) {
      setResult({
        ...cloudApp,
        orderNumber: cloudApp.trackingCode,
        quantity: cloudApp.quantity || 1,
        totalAmount: cloudApp.totalAmount || cloudApp.price,
        paymentMethod: cloudApp.paymentMethod || 'credit_card',
        paymentStatus: cloudApp.paymentStatus || 'odendi'
      });
      setSearched(true);
      setLoading(false);
      return;
    }

    // 2. Fallback to local storage
    const orders = StorageService.getOrders();
    const cleanLower = query.trim().toLowerCase();

    const found = orders.find(a => 
      (a.orderNumber && a.orderNumber.toLowerCase() === cleanLower) || 
      (a.trackingCode && a.trackingCode.toLowerCase() === cleanLower) || 
      (a.tcVkn && a.tcVkn.toLowerCase() === cleanLower) ||
      (a.phone && a.phone.replace(/\s+/g, '').includes(cleanLower.replace(/\s+/g, '')))
    );

    setResult(found || null);
    setSearched(true);
    setLoading(false);
  };

  const steps = [
    { key: 'yeni', label: 'Sipariş Alındı', desc: 'Siparişiniz sisteme kaydedildi' },
    { key: 'onaylandi', label: 'Ödeme & Kimlik Onayı', desc: 'Ödeme ve kimlik doğrulaması tamamlandı' },
    { key: 'hazirlaniyor', label: 'E-İmza Token Hazırlandı', desc: 'Nitelikli elektronik sertifikanız üretildi' },
    { key: 'kargolandi', label: 'Kurye / Kargo Yola Çıktı', desc: 'Teslimat adresinize doğru hareket etti' },
    { key: 'teslim_edildi', label: 'Teslim & Kurulum Tamamlandı', desc: 'E-İmzanız teslim edildi ve kuruldu' }
  ];

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'yeni': return 0;
      case 'onaylandi': return 1;
      case 'hazirlaniyor': return 2;
      case 'kargolandi': return 3;
      case 'teslim_edildi': return 4;
      case 'iptal': return -1;
      default: return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full h-full sm:h-auto max-w-lg rounded-none sm:rounded-3xl bg-white dark:bg-zinc-900 border-0 sm:border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-none sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Sipariş & Teslimat Takibi
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Sipariş Numarası veya T.C. Kimlik No ile sorgulayın
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition cursor-pointer"
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
              placeholder="Sipariş No (Örn: EDF-94821) veya T.C. No"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition cursor-pointer"
            >
              {loading ? 'Aranıyor...' : 'Sorgula'}
            </button>
          </form>

          {/* Search Result */}
          {searched && (
            result ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Result header card */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-extrabold text-blue-600 dark:text-blue-400">
                      {result.orderNumber || result.trackingCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      result.status === 'teslim_edildi'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        : result.status === 'iptal'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                    <div>Müşteri: <strong>{result.fullName}</strong></div>
                    <div>Paket / Ürünler: <strong>{result.packageName}</strong></div>
                    <div>Tutar: <strong className="font-mono">{result.totalAmount || result.price} ₺ (KDV Dahil)</strong></div>
                    <div>Ödeme: <strong className="text-emerald-600 dark:text-emerald-400">
                      {result.paymentMethod === 'credit_card' ? 'Kredi Kartı' :
                       result.paymentMethod === 'bank_transfer' ? 'Havale/EFT' : 'Kapıda Ödeme'}
                    </strong></div>
                  </div>

                  {result.adminNotes && (
                    <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400">
                      <strong>Yetkili Notu:</strong> {result.adminNotes}
                    </div>
                  )}
                </div>

                {/* Signed Legal Documents & Official Agreements Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                        Onaylanan Yasal Sözleşmeleriniz
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      ✓ Yasal Onaylı
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                    Siparişiniz esnasında onayladığınız adınıza tanzim edilmiş sözleşme kopyaları:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {(result.signedContracts && result.signedContracts.length > 0
                      ? result.signedContracts
                      : generateCustomerContractSnapshots(result, settings)
                    ).map((contract) => (
                      <button
                        key={contract.slug}
                        type="button"
                        onClick={() => setViewingContract({ title: contract.title, contentHtml: contract.contentHtml })}
                        className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-700/60 text-left transition cursor-pointer hover:bg-emerald-50 dark:hover:bg-zinc-700 flex items-center justify-between group shadow-xs"
                      >
                        <div className="min-w-0 pr-1">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate">
                            {contract.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 block truncate">
                            {contract.agreedAt || 'Sipariş Onayı'}
                          </span>
                        </div>
                        <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0 group-hover:scale-110 transition" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Steps Timeline */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Sipariş Süreç Aşamaları
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
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${isCurrent ? 'text-blue-600 dark:text-blue-400 font-extrabold' : isCompleted ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>
                              {step.label}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* WhatsApp & Call */}
                <div className="pt-2 flex gap-2">
                  <a
                    href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20${result.orderNumber}%20nolu%20siparisim%20hakkinda%20bilgi%20almak%20istiyorum.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Destek</span>
                  </a>
                  <a
                    href={`tel:${settings.phone}`}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Ara: {settings.phoneDisplay}</span>
                  </a>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Sipariş Bulunamadı
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Girdiğiniz sipariş numarası veya T.C. kimlik numarasına ait kayıt bulunamadı. Lütfen bilgilerinizi kontrol ediniz.
                </p>
              </div>
            )
          )}

        </div>
      </div>

      {/* Populated Contract Viewer Modal for Customer */}
      {viewingContract && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  {viewingContract.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Yazdır / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingContract(null)}
                  className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 flex items-center justify-center cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div 
                className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-4 font-sans prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: viewingContract.contentHtml }}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingContract(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition cursor-pointer"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
