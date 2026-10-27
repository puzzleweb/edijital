import React, { useEffect, useRef, useState } from 'react';
import { Lock, ShieldCheck, X, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { IsyerimPosService } from '../services/isyerimPosService';

interface Isyerim3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: { uid?: string; authCode?: string; message?: string }) => void;
  onFailure: (errorMessage: string) => void;
  uid?: string;
  orderId: string;
  amount: number;
  paymentLink?: string;
  responseAsHtml?: string;
}

export const Isyerim3DModal: React.FC<Isyerim3DModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onFailure,
  uid,
  orderId,
  amount,
  paymentLink,
  responseAsHtml
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Bankanızın 3D Secure doğrulama ekranı yükleniyor...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollingRef = useRef<any>(null);

  // Sayfa yüklendiğinde iframe içine HTML bas veya yönlendir
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setStatusMessage('3D Secure SMS doğrulama sayfası aktif. Lütfen şifrenizi giriniz.');

    // 1. Asseco / Modirum MPI origin hatasını önlemek için doğrudan PaymentLink'i yükle
    if (iframeRef.current) {
      if (paymentLink) {
        iframeRef.current.src = paymentLink;
      } else if (responseAsHtml) {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(responseAsHtml);
          doc.close();
        }
      }
    }

    // 2. Her 2.5 saniyede bir sonuç kontrolü (payResultCheck) yap
    if (uid) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await IsyerimPosService.checkPaymentResult(uid, orderId);
          if (res.isDone && res.status === 4) {
            // Başarılı!
            clearInterval(pollingRef.current);
            onSuccess({
              uid,
              authCode: res.authCode,
              message: res.message
            });
          }
        } catch (err) {
          // ignore polling network errors
        }
      }, 2500);
    }

    // 3. Callback window.postMessage dinle
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'ISYERIM_POS_COMPLETED') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        onSuccess({
          uid: e.data.uid || uid,
          authCode: e.data.authCode,
          message: 'Ödeme başarıyla tamamlandı'
        });
      } else if (e.data && e.data.type === 'ISYERIM_POS_FAILED') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setErrorMessage(e.data.message || 'Ödeme banka tarafından reddedildi');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, responseAsHtml, uid, orderId, onSuccess]);

  if (!isOpen) return null;

  const handleManualCheck = async () => {
    if (!uid && !orderId) return;
    setIsChecking(true);
    setErrorMessage(null);

    try {
      const res = await IsyerimPosService.checkPaymentResult(uid, orderId);
      if (res.isDone && res.status === 4) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        onSuccess({
          uid,
          authCode: res.authCode,
          message: res.message
        });
      } else {
        setErrorMessage(res.message || 'Ödeme henüz onaylanmadı. Lütfen SMS kodunu giriniz.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Sonuç kontrol edilirken bir hata oluştu.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleOpenNewTab = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  3D Secure Güvenlik Doğrulaması
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  256-Bit SSL
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Sipariş: <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{orderId}</span> • Tutar:{' '}
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{amount.toLocaleString('tr-TR')} ₺</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {paymentLink && (
              <button
                type="button"
                onClick={handleOpenNewTab}
                title="Yeni sekmede aç"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Yeni Sekmede Aç</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (confirm('3D Secure ödeme işlemini iptal etmek istiyor musunuz?')) {
                  if (pollingRef.current) clearInterval(pollingRef.current);
                  onClose();
                }
              }}
              className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-5 py-2.5 bg-blue-50/60 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] font-medium leading-relaxed">{statusMessage}</span>
          </div>

          <button
            type="button"
            onClick={handleManualCheck}
            disabled={isChecking}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 transition cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Kontrol...' : 'Durumu Kontrol Et'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 3D Secure Iframe Container */}
        <div className="relative flex-1 min-h-[460px] sm:min-h-[520px] bg-white">
          <iframe
            ref={iframeRef}
            name="isyerimpos_3d_frame"
            id="isyerimpos_3d_frame"
            title="İşyerim POS 3D Secure"
            src={paymentLink || undefined}
            className="w-full h-full min-h-[460px] sm:min-h-[520px] border-0"
            sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-modals allow-popups"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="text-[10px] text-zinc-500">
            Telefonunuza gelen SMS onay kodunu girdikten sonra işlem otomatik onaylanacaktır.
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                if (pollingRef.current) clearInterval(pollingRef.current);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition cursor-pointer"
            >
              Vazgeç
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
