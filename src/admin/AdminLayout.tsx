import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Package,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
  Palette
} from 'lucide-react';
import { Application, Package as PkgType, ContactMessage, SiteSettings, ActivityLog } from '../types';
import { StorageService, STORAGE_KEYS, notifyUpdated } from '../services/storage';
import { SupabaseService } from '../services/supabaseService';
import { supabase } from '../services/supabase';
import { AdminDashboard } from './AdminDashboard';
import { AdminApplications } from './AdminApplications';
import { AdminPackages } from './AdminPackages';
import { AdminMessages } from './AdminMessages';
import { AdminSettings } from './AdminSettings';
import { AdminTheme } from './AdminTheme';

interface AdminLayoutProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onBackToSite: () => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  darkMode,
  onToggleDarkMode,
  onBackToSite,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'packages' | 'messages' | 'settings' | 'theme'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live state
  const [applications, setApplications] = useState<Application[]>(StorageService.getApplications());
  const [packages, setPackages] = useState<PkgType[]>(StorageService.getPackages());
  const [messages, setMessages] = useState<ContactMessage[]>(StorageService.getMessages());
  const [settings, setSettings] = useState<SiteSettings>(StorageService.getSettings());
  const [logs, setLogs] = useState<ActivityLog[]>(StorageService.getLogs());

  const [selectedAppForDetail, setSelectedAppForDetail] = useState<Application | null>(null);

  // Sync with storage events & Supabase Realtime
  useEffect(() => {
    const handleSync = () => {
      setApplications(StorageService.getApplications());
      setPackages(StorageService.getPackages());
      setMessages(StorageService.getMessages());
      setSettings(StorageService.getSettings());
      setLogs(StorageService.getLogs());
    };

    // 1. Initial live sync with cloud
    StorageService.syncWithSupabase();

    // 2. Custom local & broadcast channel events
    window.addEventListener('edijital_applications_updated', handleSync);
    window.addEventListener('edijital_packages_updated', handleSync);
    window.addEventListener('edijital_messages_updated', handleSync);
    window.addEventListener('edijital_settings_updated', handleSync);
    window.addEventListener('storage', handleSync);

    // 3. Supabase Realtime Channel for Instant Cross-Device Sync (WebSocket push only, zero polling requests)
    const realtimeChannel = supabase
      .channel('admin_live_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, async () => {
        const cloudApps = await SupabaseService.getApplications();
        if (cloudApps) {
          localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(cloudApps));
          notifyUpdated('edijital_applications_updated');
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, async () => {
        const cloudMsgs = await SupabaseService.getMessages();
        if (cloudMsgs) {
          localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(cloudMsgs));
          notifyUpdated('edijital_messages_updated');
        }
      })
      .subscribe();

    return () => {
      window.removeEventListener('edijital_applications_updated', handleSync);
      window.removeEventListener('edijital_packages_updated', handleSync);
      window.removeEventListener('edijital_messages_updated', handleSync);
      window.removeEventListener('edijital_settings_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  const pendingAppsCount = applications.filter(a => a.status === 'yeni' || a.status === 'inceleniyor').length;
  const unreadMsgCount = messages.filter(m => !m.read).length;

  const navItems = [
    { key: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { key: 'applications', label: 'E-İmza Başvuruları', icon: FileText, badge: pendingAppsCount },
    { key: 'packages', label: 'Paketler & Fiyatlar', icon: Package },
    { key: 'theme', label: 'Tema & Sayfa Yönetimi', icon: Palette },
    { key: 'messages', label: 'İletişim Mesajları', icon: MessageSquare, badge: unreadMsgCount },
    { key: 'settings', label: 'Site & İletişim Ayarları', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100 flex transition-colors">

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <img
                src="/real_images/logo.png"
                alt="E-DİJİTAL FİNANS"
                className="h-8 w-auto object-contain"
              />
              <span className="font-bold text-xs text-zinc-900 dark:text-white">
                Yönetim Paneli
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key as any);
                    if (item.key === 'applications') setSelectedAppForDetail(null);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
          <button
            onClick={() => {
              setSidebarOpen(false);
              onBackToSite();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Web Sitesine Dön</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Güvenli Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col justify-between p-5 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0 sticky top-0 h-screen">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <img
              src="/real_images/logo.png"
              alt="E-DİJİTAL FİNANS"
              className="h-9 w-auto object-contain"
            />
            <div>
              <h1 className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                {settings.companyName}
              </h1>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                Yönetim Paneli
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key as any);
                    if (item.key === 'applications') setSelectedAppForDetail(null);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
          <button
            onClick={onBackToSite}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Web Sitesine Dön</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Güvenli Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="sticky top-0 z-20 px-4 sm:px-8 py-3.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                ArkSigner & BTK Sistem Durumu: <strong className="text-emerald-600">Çevrimiçi & Aktif</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Karanlık/Açık Mod"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onBackToSite}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Siteyi Gör</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-8 w-full mx-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              applications={applications}
              packages={packages}
              messages={messages}
              logs={logs}
              settings={settings}
              onNavigate={(tab) => setActiveTab(tab as any)}
              onSelectApplication={(app) => {
                setSelectedAppForDetail(app);
                setActiveTab('applications');
              }}
            />
          )}

          {activeTab === 'applications' && (
            <AdminApplications
              applications={applications}
              packages={packages}
              selectedApp={selectedAppForDetail}
              onSelectApplication={(app) => setSelectedAppForDetail(app)}
            />
          )}

          {activeTab === 'packages' && (
            <AdminPackages packages={packages} />
          )}

          {activeTab === 'theme' && (
            <AdminTheme settings={settings} />
          )}

          {activeTab === 'messages' && (
            <AdminMessages messages={messages} />
          )}

          {activeTab === 'settings' && (
            <AdminSettings settings={settings} />
          )}
        </main>

      </div>

    </div>
  );
};
