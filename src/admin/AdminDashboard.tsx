import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  Users, 
  Package, 
  MapPin, 
  ChevronRight, 
  MessageSquare,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Application, Package as PkgType, ContactMessage, ActivityLog, SiteSettings } from '../types';

interface AdminDashboardProps {
  applications: Application[];
  packages: PkgType[];
  messages: ContactMessage[];
  logs: ActivityLog[];
  settings: SiteSettings;
  onNavigate: (tab: string) => void;
  onSelectApplication: (app: Application) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  applications,
  packages,
  messages,
  logs,
  settings,
  onNavigate,
  onSelectApplication
}) => {
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'yeni' || a.status === 'inceleniyor').length;
  const completedApps = applications.filter(a => a.status === 'teslim_edildi').length;
  const totalRevenue = applications.reduce((sum, a) => sum + (a.status !== 'iptal' ? a.price : 0), 0);
  const unreadMessages = messages.filter(m => !m.read).length;

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* Top Banner / Welcome */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-zinc-900/60 border border-blue-500/20 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1 block">
            Yönetici Paneli • Genel Bakış
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hoş Geldiniz, {settings.companyName}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1">
            Ankara genelinde aktif {pendingApps} bekleyen e-imza başvurusu ve {unreadMessages} okunmamış mesajınız bulunmaktadır.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('applications')}
            className="apple-btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tüm Başvuruları Gör</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Apps */}
        <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm apple-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12% bu hafta
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            {totalApps}
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
            Toplam E-İmza Başvurusu
          </div>
        </div>

        {/* Card 2: Pending Apps */}
        <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm apple-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              Aksiyon Bekliyor
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            {pendingApps}
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
            Bekleyen / Hazırlanan
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm apple-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              15 Dk Ort. Teslim
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            {completedApps}
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
            Teslim Edilen Sertifikalar
          </div>
        </div>

        {/* Card 4: Estimated Revenue */}
        <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm apple-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              Toplam Ciro
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            {totalRevenue.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
            Aktif Başvuru Hacmi
          </div>
        </div>

      </div>

      {/* Grid: Recent Applications & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Applications Table (Span 8) */}
        <div className="lg:col-span-8 rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Son Gelen Başvurular
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                En son web sitesinden yapılan e-imza talepleri
              </p>
            </div>
            <button
              onClick={() => onNavigate('applications')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Tümünü Listele ({applications.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Takip No / Müşteri</th>
                  <th className="pb-3">Paket</th>
                  <th className="pb-3">Teslimat</th>
                  <th className="pb-3">Tutar</th>
                  <th className="pb-3">Durum</th>
                  <th className="pb-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3.5">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{app.trackingCode}</div>
                      <div className="text-gray-900 dark:text-zinc-200 font-medium">{app.fullName}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="text-gray-900 dark:text-zinc-300 font-medium">{app.packageName}</div>
                      <div className="text-[10px] text-gray-400">{app.duration}</div>
                    </td>
                    <td className="py-3.5 text-gray-600 dark:text-zinc-400">
                      {app.deliveryType === 'magaza' ? 'Mağaza Teslim' :
                       app.deliveryType === 'ankara_yerinde' ? 'Ankara Yerinde' : 'Kargo'}
                    </td>
                    <td className="py-3.5 font-bold text-gray-900 dark:text-white">
                      {app.price.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === 'teslim_edildi' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                        app.status === 'hazirlandi' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400' :
                        app.status === 'onaylandi' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400' :
                        app.status === 'iptal' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 font-medium"
                      >
                        İncele
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Activity Logs & Actions (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Messages summary card */}
          <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">İletişim Mesajları</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400">
                {unreadMessages} Yeni
              </span>
            </div>

            <div className="space-y-2.5">
              {messages.slice(0, 3).map((m) => (
                <div 
                  key={m.id}
                  onClick={() => onNavigate('messages')}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 cursor-pointer hover:border-blue-500 transition"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-gray-900 dark:text-white">{m.name}</span>
                    <span className="text-gray-400">{new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-1">{m.subject}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('messages')}
              className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-800 dark:text-zinc-200 transition"
            >
              Gelen Kutusunu Aç
            </button>
          </div>

          {/* System logs */}
          <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Sistem İşlem Günlüğü</span>
            </h4>

            <div className="space-y-3 max-h-56 overflow-y-auto">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between font-semibold text-gray-900 dark:text-zinc-200">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
