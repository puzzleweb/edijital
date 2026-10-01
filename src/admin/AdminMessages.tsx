import React, { useState } from 'react';
import { ContactMessage } from '../types';
import { StorageService } from '../services/storage';
import { ConfirmModal } from '../components/ConfirmModal';
import { MessageSquare, Mail, Phone, Trash2, CheckCircle2, Clock } from 'lucide-react';

interface AdminMessagesProps {
  messages: ContactMessage[];
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({ messages }) => {
  const [msgToDelete, setMsgToDelete] = useState<string | null>(null);

  const handleMarkAsRead = (id: string) => {
    StorageService.markMessageAsRead(id);
  };

  const handleDelete = (id: string) => {
    setMsgToDelete(id);
  };

  const confirmDelete = () => {
    if (msgToDelete) {
      StorageService.deleteMessage(msgToDelete);
      setMsgToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          İletişim Formu Mesajları
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          Müşterilerinizin web sitesi üzerinden gönderdiği soru ve bilgi talepleri.
        </p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-3xl p-12 text-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-400">
            Henüz gelen bir iletişim mesajı bulunmamaktadır.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-3xl p-6 transition-all border ${
                !msg.read
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                    !msg.read ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300'
                  }`}>
                    {msg.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{msg.name}</span>
                      {!msg.read && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                          Yeni
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                      {msg.email ? `${msg.email} • ` : ''}{msg.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(msg.createdAt).toLocaleString('tr-TR')}</span>
                </div>
              </div>

              {/* Subject & body */}
              <div className="my-3 pl-12">
                <div className="font-semibold text-xs text-gray-900 dark:text-zinc-200 mb-1">
                  Konu: {msg.subject}
                </div>
                <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>

              {/* Actions */}
              <div className="pl-12 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${msg.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Ara</span>
                  </a>
                  <a
                    href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=Merhaba%20${encodeURIComponent(msg.name)},%20mesajiniz%20uzerine%20E-Dijital%20Finans%20olarak%20size%20ulastik.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-1 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  {msg.email && (
                    <a
                      href={`mailto:${msg.email}?subject=E-Dijital%20Finans%20E-İmza%20Bilgilendirme`}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-semibold flex items-center gap-1 transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>E-Posta</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!msg.read && (
                    <button
                      onClick={() => handleMarkAsRead(msg.id)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Okundu Olarak İşaretle
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modern Confirmation Modal */}
      <ConfirmModal
        isOpen={!!msgToDelete}
        onClose={() => setMsgToDelete(null)}
        onConfirm={confirmDelete}
        title="Mesajı Sil"
        description="Bu iletişim mesajını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        variant="danger"
      />

    </div>
  );
};
