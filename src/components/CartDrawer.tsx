import React from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';
import { CartItem, SiteSettings } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (pkgId: string, quantity: number) => void;
  onRemoveItem: (pkgId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onNavigateToPricing?: () => void;
  settings: SiteSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onNavigateToPricing,
  settings
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.package.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const kdvRate = 0.20;
  const kdvAmount = Math.round(subtotal * kdvRate);
  const grandTotal = subtotal + kdvAmount;

  const handleInspectPackages = () => {
    onClose();
    if (onNavigateToPricing) {
      onNavigateToPricing();
    } else {
      setTimeout(() => {
        const el = document.getElementById('fiyatlar');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.hash = '#fiyatlar';
        }
      }, 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Alışveriş Sepeti</span>
                  {totalItems > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      {totalItems} Adet
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {settings.companyName || 'E-DİJİTAL FİNANS'} • 15 Dk Hızlı Teslimat
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

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-zinc-900 dark:text-white">
                    Sepetiniz Boş
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                    Henüz sepetinize bir e-imza paketi eklemediniz. İhtiyacınıza uygun paketi hemen seçin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleInspectPackages}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
                >
                  Paketleri İncele
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.package.id}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex flex-col gap-3 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                              {item.package.name}
                            </span>
                            {item.package.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                                {item.package.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {item.package.duration} Süreli • USB Token Donanımı Dahil
                          </p>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.package.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          title="Sepetten Çıkar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50">
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 px-2 py-1">
                          <button
                            onClick={() => onUpdateQuantity(item.package.id, item.quantity - 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                            aria-label="Azalt"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs text-zinc-900 dark:text-white w-5 text-center font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.package.id, item.quantity + 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                            aria-label="Arttır"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item Total Price */}
                        <div className="text-right">
                          <span className="font-mono text-base font-extrabold text-blue-600 dark:text-blue-400">
                            {(item.package.price * item.quantity).toLocaleString('tr-TR')} ₺
                          </span>
                          <span className="text-[10px] text-zinc-400 block">+ KDV</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={onClearCart}
                    className="text-[11px] text-zinc-400 hover:text-red-500 transition cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Sepeti Temizle</span>
                  </button>
                </div>

                {/* Assurance Badges */}
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2 text-[11px] text-blue-900 dark:text-blue-200">
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>5070 Sayılı Kanuna %100 Yasal Uygun</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Ankara İçi 15 Dk Teslim veya Ücretsiz Kargo</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Bar */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
              
              {/* Price Details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Ara Toplam (KDV Hariç)</span>
                  <span className="font-mono font-medium">{subtotal.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>KDV (%20)</span>
                  <span className="font-mono font-medium">{kdvAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">Genel Toplam</span>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                      {grandTotal.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-normal">KDV Dahil</span>
                  </div>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Siparişi Tamamla & Ödemeye Geç</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
