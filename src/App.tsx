import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { SupabaseService } from './services/supabaseService';
import { supabase } from './services/supabase';
import { Package, SiteSettings } from './types';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturesBento } from './components/FeaturesBento';
import { QuickFormSection } from './components/QuickFormSection';
import { PricingSection } from './components/PricingSection';
import { CompatibilityGrid } from './components/CompatibilityGrid';
import { AboutSection } from './components/AboutSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ApplicationModal } from './components/ApplicationModal';
import { TrackModal } from './components/TrackModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AdminLayout } from './admin/AdminLayout';
import { AdminLogin } from './admin/AdminLogin';
import { Phone, MessageSquare, Shield, ArrowUp } from 'lucide-react';

export function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('edijital_theme_dark_v1');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // App mode: 'public' | 'admin'
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash.startsWith('#admin/')) {
        return 'admin';
      }
    }
    return 'public';
  });

  const navigateToAdmin = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    setViewMode('admin');
  };

  const navigateToPublic = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setViewMode('public');
  };

  // Sync URL changes (e.g. typing /admin in URL bar, browser back/forward buttons)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const isAdmin = path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash.startsWith('#admin/');
      setViewMode(isAdmin ? 'admin' : 'public');
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => StorageService.isAdminAuthenticated());
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Data states
  const [settings, setSettings] = useState<SiteSettings>(StorageService.getSettings());
  const [packages, setPackages] = useState<Package[]>(StorageService.getPackages());

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedPackageForApply, setSelectedPackageForApply] = useState<Package | null>(null);

  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sync dark mode with document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('edijital_theme_dark_v1', String(darkMode));
  }, [darkMode]);

  // Sync dynamic theme styling (radius, primary color)
  useEffect(() => {
    const radius = settings.theme?.cardRadius || 'rounded-2xl';
    document.documentElement.classList.remove('theme-radius-rounded-md', 'theme-radius-rounded-xl', 'theme-radius-rounded-2xl', 'theme-radius-rounded-3xl');
    document.documentElement.classList.add(`theme-radius-${radius}`);

    if (settings.theme?.primaryColor) {
      document.documentElement.style.setProperty('--theme-primary', settings.theme.primaryColor);
    }
  }, [settings.theme]);

  // Sync data across components and fetch Supabase Cloud data
  useEffect(() => {
    // Initial Supabase cloud fetch
    StorageService.syncWithSupabase();

    // Check initial active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await SupabaseService.getCurrentProfile();
        if (profile && ['admin', 'superadmin', 'editor'].includes(profile.role)) {
          StorageService.setAdminAuthenticated(true, session.user.email, profile.role);
          setIsAdminAuth(true);
          setIsAuthChecking(false);
          return;
        }
      }
      StorageService.setAdminAuthenticated(false);
      setIsAdminAuth(false);
      setIsAuthChecking(false);
    }).catch(() => {
      setIsAuthChecking(false);
    });

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await SupabaseService.getCurrentProfile();
        if (profile && ['admin', 'superadmin', 'editor'].includes(profile.role)) {
          StorageService.setAdminAuthenticated(true, session.user.email, profile.role);
          setIsAdminAuth(true);
          setIsAuthChecking(false);
          return;
        } else {
          await supabase.auth.signOut();
          StorageService.setAdminAuthenticated(false);
          setIsAdminAuth(false);
          setIsAuthChecking(false);
        }
      } else {
        StorageService.setAdminAuthenticated(false);
        setIsAdminAuth(false);
        setIsAuthChecking(false);
      }
    });

    const handleSync = () => {
      setSettings(StorageService.getSettings());
      setPackages(StorageService.getPackages());
    };

    window.addEventListener('edijital_settings_updated', handleSync);
    window.addEventListener('edijital_packages_updated', handleSync);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('edijital_settings_updated', handleSync);
      window.removeEventListener('edijital_packages_updated', handleSync);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleOpenApplyWithPackage = (pkg?: Package) => {
    setSelectedPackageForApply(pkg || null);
    setIsApplyModalOpen(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ADMIN VIEW
  if (viewMode === 'admin') {
    // If checking auth state and we don't have a cached session, show smooth loader instead of login form flash
    if (isAuthChecking && !isAdminAuth) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <img
              src="/real_images/logo.png"
              alt="E-DİJİTAL FİNANS"
              className="h-10 w-auto object-contain animate-pulse"
            />
            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-xs font-semibold text-zinc-400 tracking-wider">
              Yönetici Oturumu Doğrulanıyor...
            </p>
          </div>
        </div>
      );
    }

    if (!isAdminAuth) {
      return (
        <AdminLogin
          onLoginSuccess={() => {
            setIsAdminAuth(true);
            setIsAuthChecking(false);
            navigateToAdmin();
          }}
          onBackToSite={navigateToPublic}
        />
      );
    }

    return (
      <AdminLayout
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onBackToSite={navigateToPublic}
        onLogout={async () => {
          await StorageService.signOut();
          setIsAdminAuth(false);
          setIsAuthChecking(false);
          navigateToPublic();
        }}
      />
    );
  }

  // PUBLIC WEBSITE VIEW
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-zinc-100 transition-colors">

      {/* 100% Fixed Top Navigation (Zero Jitter, Fixed on all devices) */}
      <div className="fixed top-0 left-0 right-0 z-40 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md">
        {(settings.sections?.announcement !== false && settings.announcementActive) && (
          <AnnouncementBar
            settings={settings}
            onOpenApply={() => handleOpenApplyWithPackage()}
          />
        )}

        <Header
          settings={settings}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenApply={() => handleOpenApplyWithPackage()}
          onOpenTrack={() => setIsTrackModalOpen(true)}
          onOpenAdmin={navigateToAdmin}
        />
      </div>

      {/* Spacer so main content is perfectly offset below fixed header */}
      <div
        className={`w-full shrink-0 ${(settings.sections?.announcement !== false && settings.announcementActive) ? 'h-[68px] md:h-[104px]' : 'h-[68px]'}`}
        aria-hidden="true"
      />

      {/* Main Public Content */}
      <main className="flex-1 pb-16 md:pb-0">
        {settings.sections?.hero !== false && (
          <Hero
            settings={settings}
            packages={packages}
            onOpenApply={(pkg) => handleOpenApplyWithPackage(pkg)}
            onOpenTrack={(code) => {
              setIsTrackModalOpen(true);
            }}
          />
        )}

        {settings.sections?.features !== false && (
          <FeaturesBento
            settings={settings}
            onOpenApply={() => handleOpenApplyWithPackage()}
          />
        )}

        {settings.sections?.quickForm !== false && (
          <QuickFormSection
            settings={settings}
            packages={packages}
          />
        )}

        {settings.sections?.pricing !== false && (
          <PricingSection
            packages={packages}
            settings={settings}
            onSelectPackage={(pkg) => handleOpenApplyWithPackage(pkg)}
          />
        )}

        {settings.sections?.compatibility !== false && (
          <CompatibilityGrid />
        )}

        {settings.sections?.about !== false && (
          <AboutSection
            settings={settings}
            onOpenApply={() => handleOpenApplyWithPackage()}
          />
        )}

        {settings.sections?.faq !== false && (
          <FaqSection settings={settings} />
        )}

        {settings.sections?.contact !== false && (
          <ContactSection settings={settings} />
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => setViewMode('admin')}
        onOpenTrack={() => setIsTrackModalOpen(true)}
        onOpenApply={() => handleOpenApplyWithPackage()}
      />

      {/* Desktop Floating Action Buttons (Hidden on Mobile) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-3 pointer-events-none">
        {/* Scroll To Top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="pointer-events-auto w-11 h-11 rounded-full bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            title="Yukarı Çık"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* WhatsApp Quick Chat */}
        <a
          href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20e-imza%20hakkinda%20bilgi%20ve%20fiyat%20almak%20istiyorum.`}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/30 hover:scale-105 active:scale-95 transition-all group"
          title="WhatsApp İle Danışın"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="text-xs font-bold">WhatsApp Destek</span>
        </a>

        {/* Call Now */}
        <a
          href={`tel:${settings.phone}`}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all group"
          title="Hemen Arayın"
        >
          <Phone className="w-5 h-5" />
          <span className="text-xs font-bold">{settings.phoneDisplay}</span>
        </a>
      </div>

      {/* Mobile Bottom Navigation Bar with Quick Contact Popup */}
      <MobileBottomNav
        settings={settings}
        onOpenApply={() => handleOpenApplyWithPackage()}
        onOpenTrack={() => setIsTrackModalOpen(true)}
      />

      {/* Application Modal Wizard */}
      <ApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        selectedPackage={selectedPackageForApply}
        packages={packages}
        settings={settings}
      />

      {/* Tracking Modal */}
      <TrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        settings={settings}
      />

    </div>
  );
}

export default App;
