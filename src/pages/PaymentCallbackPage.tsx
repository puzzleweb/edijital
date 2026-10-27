import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { IsyerimPosService } from '../services/isyerimPosService';

interface PaymentCallbackPageProps {
  onBackToHome: () => void;
  onNavigateToTrack: (orderNumber?: string) => void;
}

export const PaymentCallbackPage: React.FC<PaymentCallbackPageProps> = ({
  onBackToHome,
  onNavigateToTrack
}) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>('Ödeme sonucu İşyerim POS üzerinden kontrol ediliyor...');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid') || params.get('UID') || undefined;
    const ordId = params.get('orderId') || params.get('OrderId') || params.get('orderid') || undefined;
    if (ordId) setOrderId(ordId);

    const verify = async () => {
      if (!uid && !ordId) {
        setLoading(false);
        setSuccess(false);
        setMessage('Ödeme referans kodu (UID/OrderId) bulunamadı.');
        return;
      }

      try {
        const res = await IsyerimPosService.checkPaymentResult(uid, ordId);
        setLoading(false);
        if (res.isDone && res.status === 4) {
          setSuccess(true);
          setMessage('Ödemeniz başarıyla tahsil edildi.');
          // If in iframe, notify parent
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'ISYERIM_POS_COMPLETED',
              uid,
              orderId: ordId,
              authCode: res.authCode
            }, '*');
          }
        } else {
          setSuccess(false);
          setMessage(res.message || 'Ödeme banka tarafından onaylanmadı veya işlem iptal edildi.');
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'ISYERIM_POS_FAILED',
              uid,
              orderId: ordId,
              message: res.message
            }, '*');
          }
        }
      } catch (err: any) {
        setLoading(false);
        setSuccess(false);
        setMessage(err.message || 'Ödeme sonucu doğrulanırken sunucu hatası oluştu.');
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center space-y-5 animate-in zoom-in-95">
        
        {loading ? (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center mx-auto">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Ödeme Doğrulanıyor
            </h2>
            <p className="text-xs text-zinc-500">{message}</p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Ödeme Başarılı!
              </h2>
              <p className="text-xs text-zinc-500 mt-1">{message}</p>
            </div>
            {orderId && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                Sipariş Kodu: {orderId}
              </div>
            )}
            <div className="pt-2 flex flex-col gap-2">
              {orderId && (
                <button
                  type="button"
                  onClick={() => onNavigateToTrack(orderId)}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Siparişi Takip Et
                </button>
              )}
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Ödeme Tamamlanamadı
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{message}</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/odeme';
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ödeme Sayfasına Tekrar Dön</span>
              </button>
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
