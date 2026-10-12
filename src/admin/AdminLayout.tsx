import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Palette,
  Scale,
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  Check
} from 'lucide-react';
import { Application, Package as PkgType, ContactMessage, SiteSettings, ActivityLog } from '../types';
import { StorageService, STORAGE_KEYS, notifyUpdated } from '../services/storage';
import { SupabaseService } from '../services/supabaseService';
import { supabase } from '../services/supabase';
import { NotificationSoundService } from '../utils/notificationSound';
import { AdminOrderNotification, AdminOrderNotificationItem } from '../components/AdminOrderNotification';
import { AdminDashboard } from './AdminDashboard';
import { AdminApplications } from './AdminApplications';
import { AdminPackages } from './AdminPackages';
import { AdminMessages } from './AdminMessages';
import { AdminSettings } from './AdminSettings';
import { AdminTheme } from './AdminTheme';
import { AdminLegalDocs } from './AdminLegalDocs';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'packages' | 'legal' | 'theme' | 'messages' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live state
  const [applications, setApplications] = useState<Application[]>(StorageService.getApplications());
  const [packages, setPackages] = useState<PkgType[]>(StorageService.getPackages());
  const [messages, setMessages] = useState<ContactMessage[]>(StorageService.getMessages());
  const [settings, setSettings] = useState<SiteSettings>(StorageService.getSettings());
  const [logs, setLogs] = useState<ActivityLog[]>(StorageService.getLogs());

  const [selectedAppForDetail, setSelectedAppForDetail] = useState<Application | null>(null);

  // Notifications & Sound State
  const [orderNotifications, setOrderNotifications] = useState<AdminOrderNotificationItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(NotificationSoundService.isSoundEnabled());
  const [desktopPermission, setDesktopPermission] = useState<NotificationPermission | 'unsupported'>(
    NotificationSoundService.getDesktopNotificationPermission()
  );
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Keep track of already known/alerted order IDs to avoid duplicate alerts
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef<boolean>(false);

  // Function to trigger audio & visual alert when a new order arrives
  const triggerOrderAlert = useCallback((order: Application) => {
    const key = String(order.id || order.trackingCode || order.orderNumber || '');
    if (!key) return;

    if (knownOrderIdsRef.current.has(key)) return;
    knownOrderIdsRef.current.add(key);
    if (order.id) knownOrderIdsRef.current.add(String(order.id));
    if (order.trackingCode) knownOrderIdsRef.current.add(String(order.trackingCode));
    if (order.orderNumber) knownOrderIdsRef.current.add(String(order.orderNumber));

    // 1. Play crystal clear, pleasant synthesized chime sound
    NotificationSoundService.playOrderChime();

    // 2. Fire OS / Desktop Browser notification (if permitted)
    NotificationSoundService.sendDesktopNotification(`🔔 Yeni Sipariş: ${order.fullName}`, {
      body: `${order.packageName || 'E-İmza Paketi'} (${(order.totalAmount || order.price || 0).toLocaleString('tr-TR')} ₺) • Kod: ${order.orderNumber || order.trackingCode}`,
      tag: `order-${key}`
    });

    // 3. Add to in-app toast stack
    const notifId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setOrderNotifications(prev => [
      { id: notifId, order, timestamp: Date.now() },
      ...prev.slice(0, 4) // Keep at most 5 toasts
    ]);

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
      setOrderNotifications(prev => prev.filter(n => n.id !== notifId));
    }, 15000);
  }, []);

  // Sync with storage events & Supabase Realtime
  useEffect(() => {
    // Populate existing order IDs on initial mount so we don't alert on existing orders
    const initialApps = StorageService.getApplications();
    initialApps.forEach(a => {
      if (a.id) knownOrderIdsRef.current.add(String(a.id));
      if (a.trackingCode) knownOrderIdsRef.current.add(String(a.trackingCode));
      if (a.orderNumber) knownOrderIdsRef.current.add(String(a.orderNumber));
    });
    isInitializedRef.current = true;

    const handleSync = () => {
      const freshApps = StorageService.getApplications();
      setApplications(freshApps);
      setPackages(StorageService.getPackages());
      setMessages(StorageService.getMessages());
      setSettings(StorageService.getSettings());
      setLogs(StorageService.getLogs());

      // If initialized, check for newly added orders from local/sync
      if (isInitializedRef.current) {
        for (const app of freshApps) {
          const k = app.id || app.trackingCode || app.orderNumber;
          if (k && !knownOrderIdsRef.current.has(String(k))) {
            triggerOrderAlert(app);
          }
        }
      }
    };

    const handleNewOrderEvent = (event: any) => {
      if (event.detail) {
        triggerOrderAlert(event.detail);
      }
    };

    const handleSoundPrefChanged = (event: any) => {
      if (event.detail?.enabled !== undefined) {
        setSoundEnabled(event.detail.enabled);
      }
    };

    // 1. Initial live sync with cloud
    StorageService.syncWithSupabase();

    // 2. Custom local & broadcast channel events
    window.addEventListener('edijital_applications_updated', handleSync);
    window.addEventListener('edijital_new_order_placed', handleNewOrderEvent);
    window.addEventListener('edijital_sound_pref_changed', handleSoundPrefChanged);
    window.addEventListener('edijital_packages_updated', handleSync);
    window.addEventListener('edijital_messages_updated', handleSync);
    window.addEventListener('edijital_settings_updated', handleSync);
    window.addEventListener('storage', handleSync);

    // 3. Supabase Realtime Channel for Instant Cross-Device Sync (WebSocket push only)
    const realtimeChannel = supabase
      .channel('admin_live_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'applications' }, async (payload) => {
        const row = payload.new as any;
        if (row) {
          const incomingOrder: Application = {
            id: row.id,
            orderNumber: row.tracking_code,
            trackingCode: row.tracking_code,
            fullName: row.full_name,
            tcVkn: row.tc_vkn,
            phone: row.phone,
            email: row.email || '',
            isCorporate: Boolean(row.is_corporate),
            companyName: row.company_name || undefined,
            packageId: row.package_id,
            packageName: row.package_name,
            duration: row.duration,
            price: Number(row.price || 0),
            totalAmount: Number(row.price || 0),
            deliveryType: row.delivery_type,
            address: row.address,
            city: row.city,
            district: row.district,
            status: row.status || 'yeni',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString()
          };
          triggerOrderAlert(incomingOrder);
        }
        const cloudApps = await SupabaseService.getApplications();
        if (cloudApps) {
          localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(cloudApps));
          notifyUpdated('edijital_applications_updated');
        }
      })
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
      window.removeEventListener('edijital_new_order_placed', handleNewOrderEvent);
      window.removeEventListener('edijital_sound_pref_changed', handleSoundPrefChanged);
      window.removeEventListener('edijital_packages_updated', handleSync);
      window.removeEventListener('edijital_messages_updated', handleSync);
      window.removeEventListener('edijital_settings_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      supabase.removeChannel(realtimeChannel);
    };
  }, [triggerOrderAlert]);

  // Handler for sending a test order notification to verify sound and visual alert
  const handleTestOrder = () => {
    const testCode = `EDF-${Math.floor(10000 + Math.random() * 90000)}`;
    const sampleOrder: Application = {
      id: `TEST-${Date.now()}`,
      orderNumber: testCode,
      trackingCode: testCode,
      fullName: 'Ahmet Yılmaz (Test Sipariş)',
      tcVkn: '12345678901',
      phone: '0545 960 33 03',
      email: 'ahmet@ornek.com',
      isCorporate: false,
      packageId: 'pkg-1-yil',
      packageName: '3 Yıllık E-İmza (Test Bildirimi)',
      duration: '3 Yıl',
      price: 2450,
      totalAmount: 2450,
      deliveryType: 'magaza',
      deliveryTitle: 'Ostim Ofisimizden Elden Teslim',
      address: 'Ostim OSB Yenimahalle',
      city: 'ANKARA',
      district: 'Yenimahalle',
      paymentMethod: 'credit_card',
      paymentStatus: 'odendi',
      status: 'yeni',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    triggerOrderAlert(sampleOrder);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    NotificationSoundService.setSoundEnabled(next);
    if (next) {
      NotificationSoundService.playOrderChime();
    }
  };

  const handleRequestDesktopPermission = async () => {
    const perm = await NotificationSoundService.requestDesktopNotificationPermission();
    setDesktopPermission(perm);
  };

  const pendingAppsCount = applications.filter(a => a.status === 'yeni' || a.status === 'inceleniyor').length;
  const unreadMsgCount = messages.filter(m => !m.read).length;

  const navItems = [
    { key: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { key: 'applications', label: 'E-İmza Siparişleri', icon: FileText, badge: pendingAppsCount },
    { key: 'packages', label: 'Paketler & Fiyatlar', icon: Package },
    { key: 'legal', label: 'Sözleşmeler (HTML Editör)', icon: Scale },
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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Order Notifications & Sound Controls Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className={`relative p-2 rounded-xl border transition flex items-center gap-1.5 ${
                  soundEnabled
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
                title="Sipariş Sesli Bildirim Ayarları"
                aria-label="Sipariş Bildirim Ayarları"
              >
                <div className="relative">
                  <Bell className={`w-4 h-4 ${soundEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 opacity-60'}`} />
                  {soundEnabled && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white dark:ring-zinc-900" />
                  )}
                </div>
                <span className="hidden md:inline-block text-[11px] font-bold">
                  {soundEnabled ? 'Ses Açık' : 'Sessiz'}
                </span>
              </button>

              {/* Notification & Sound Settings Dropdown */}
              {showNotifMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 text-xs animate-in fade-in zoom-in-95 space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-white">
                            Sipariş Bildirimleri
                          </h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            Yeni sipariş geldiğinde anlık ses ve görsel uyarı
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowNotifMenu(false)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Sound Switch */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                      <div className="flex items-center gap-2">
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-zinc-400" />
                        )}
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            Sesli Uyarı (Melodi)
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {soundEnabled ? 'Yeni siparişte özel melodi çalar' : 'Sipariş sesi kapalı'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleSound}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          soundEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            soundEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Test Audio Button */}
                    <button
                      type="button"
                      onClick={() => NotificationSoundService.playOrderChime()}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold transition"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Sesi Dinle (Zil Sesi Testi)</span>
                    </button>

                    {/* Browser Desktop Notification Status & Request */}
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            Masaüstü Bildirimi
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            Farklı sekmedeyken de bildirim görünür
                          </p>
                        </div>
                        {desktopPermission === 'granted' ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3 h-3" />
                            Aktif
                          </span>
                        ) : desktopPermission === 'denied' ? (
                          <span className="text-[11px] font-bold text-red-500">
                            Engellendi
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleRequestDesktopPermission}
                            className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition"
                          >
                            İzin Ver
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Test Full Live Alert Button */}
                    <button
                      type="button"
                      onClick={handleTestOrder}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-600/20 transition active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Canlı Sipariş & Ses Testi Yap</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Karanlık/Açık Mod"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onBackToSite}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition"
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

          {activeTab === 'legal' && (
            <AdminLegalDocs />
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

      {/* Floating Real-time Order Notification Popups */}
      <AdminOrderNotification
        notifications={orderNotifications}
        onDismiss={(id) => setOrderNotifications(prev => prev.filter(n => n.id !== id))}
        onViewOrder={(order) => {
          setSelectedAppForDetail(order);
          setActiveTab('applications');
        }}
      />

    </div>
  );
};
