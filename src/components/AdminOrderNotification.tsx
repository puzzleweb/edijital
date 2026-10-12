import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  X, 
  Eye, 
  Package, 
  User, 
  Phone,
  Mail,
  MessageSquare,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Order, ContactMessage } from '../types';
import { NotificationSoundService } from '../utils/notificationSound';

export interface AdminOrderNotificationItem {
  id: string;
  order: Order;
  timestamp: number;
}

export interface AdminMessageNotificationItem {
  id: string;
  message: ContactMessage;
  timestamp: number;
}

interface AdminOrderNotificationProps {
  notifications: AdminOrderNotificationItem[];
  messageNotifications?: AdminMessageNotificationItem[];
  onDismiss: (id: string) => void;
  onDismissMessage?: (id: string) => void;
  onViewOrder: (order: Order) => void;
  onViewMessage?: (message: ContactMessage) => void;
}

export const AdminOrderNotification: React.FC<AdminOrderNotificationProps> = ({
  notifications,
  messageNotifications = [],
  onDismiss,
  onDismissMessage = () => {},
  onViewOrder,
  onViewMessage = () => {}
}) => {
  const [soundEnabled, setSoundEnabled] = useState(NotificationSoundService.isSoundEnabled());

  useEffect(() => {
    const handlePrefChange = (e: any) => {
      if (e.detail?.enabled !== undefined) {
        setSoundEnabled(e.detail.enabled);
      }
    };
    window.addEventListener('edijital_sound_pref_changed', handlePrefChange);
    return () => window.removeEventListener('edijital_sound_pref_changed', handlePrefChange);
  }, []);

  const totalCount = notifications.length + messageNotifications.length;
  if (totalCount === 0) return null;

  return (
    <aside
      aria-label="Canlı Bildirimler"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none"
    >
      {/* 1. ORDER NOTIFICATIONS */}
      {notifications.map((item, index) => {
        const order = item.order;
        const paymentLabel = 
          order.paymentMethod === 'credit_card' ? 'Kredi Kartı' :
          order.paymentMethod === 'bank_transfer' ? 'Havale/EFT' : 'Kapıda Ödeme';

        const paymentBadgeStyle = 
          order.paymentMethod === 'credit_card' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' :
          order.paymentMethod === 'bank_transfer' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700' :
          'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-700';

        return (
          <div
            key={item.id}
            role="alert"
            aria-live="assertive"
            className="pointer-events-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-2 border-emerald-500/80 dark:border-emerald-500/90 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 transform transition-all duration-300 ease-out animate-in slide-in-from-top-4 fade-in"
          >
            {/* Top header of card */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping"></span>
                  <div className="relative p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/30">
                    <Bell className="w-4 h-4 animate-bounce" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                      Yeni Sipariş Alındı!
                    </span>
                    {totalCount > 1 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {index + 1}/{totalCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono font-semibold">
                    {order.orderNumber || order.trackingCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    NotificationSoundService.setSoundEnabled(next);
                  }}
                  title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => onDismiss(item.id)}
                  title="Kapat"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Order details body */}
            <div className="py-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate max-w-[180px] sm:max-w-[220px]">
                    {order.fullName}
                  </span>
                </div>
                <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {(order.totalAmount || order.price || 0).toLocaleString('tr-TR')} ₺
                </div>
              </div>

              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-[11px]">
                <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <Package className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{order.packageName || 'E-İmza Paketi'}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${paymentBadgeStyle}`}>
                  {paymentLabel}
                </span>
              </div>

              {order.phone && (
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{order.phone}</span>
                  {order.city && (
                    <span className="text-zinc-400 dark:text-zinc-600">• {order.city}</span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onViewOrder(order);
                  onDismiss(item.id);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition transform active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Siparişi İncele</span>
              </button>
              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                className="py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition"
              >
                Tamam
              </button>
            </div>
          </div>
        );
      })}

      {/* 2. CONTACT MESSAGE NOTIFICATIONS */}
      {messageNotifications.map((item, index) => {
        const msg = item.message;
        const msgIndex = notifications.length + index + 1;

        return (
          <div
            key={item.id}
            role="alert"
            aria-live="assertive"
            className="pointer-events-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-2 border-blue-500/80 dark:border-blue-500/90 rounded-2xl p-4 shadow-2xl shadow-blue-500/20 transform transition-all duration-300 ease-out animate-in slide-in-from-top-4 fade-in"
          >
            {/* Top header of card */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping"></span>
                  <div className="relative p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/30">
                    <MessageSquare className="w-4 h-4 animate-bounce" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                      Yeni İletişim Mesajı!
                    </span>
                    {totalCount > 1 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {msgIndex}/{totalCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[190px]">
                    {msg.subject || 'Bilgi Talebi'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    NotificationSoundService.setSoundEnabled(next);
                  }}
                  title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => onDismissMessage(item.id)}
                  title="Kapat"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message details body */}
            <div className="py-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span className="truncate max-w-[200px]">
                    {msg.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Yeni Form
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-zinc-500 dark:text-zinc-400 text-[11px]">
                {msg.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{msg.phone}</span>
                  </div>
                )}
                {msg.email && (
                  <div className="flex items-center gap-1 truncate max-w-[170px]">
                    <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{msg.email}</span>
                  </div>
                )}
              </div>

              {msg.message && (
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px] line-clamp-2 italic">
                  "{msg.message}"
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onViewMessage(msg);
                  onDismissMessage(item.id);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition transform active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Mesajı İncele</span>
              </button>
              <button
                type="button"
                onClick={() => onDismissMessage(item.id)}
                className="py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition"
              >
                Tamam
              </button>
            </div>
          </div>
        );
      })}
    </aside>
  );
};
