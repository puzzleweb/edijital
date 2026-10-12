import React, { useState, useEffect } from 'react';
import { STORAGE_KEYS, StorageService } from './services/storage';
import { SupabaseService } from './services/supabaseService';
import { supabase } from './services/supabase';
import { Package, SiteSettings, CartItem, Order } from './types';
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
import { CartDrawer } from './components/CartDrawer';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackModal } from './components/OrderTrackModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AdminLayout } from './admin/AdminLayout';
import { AdminLogin } from './admin/AdminLogin';
import { Phone, MessageSquare, Shield, ArrowUp } from 'lucide-react';

import { LegalPage, LegalDocSlug, LEGAL_DOCS } from './pages/LegalPage';
import { CookieBanner } from './components/CookieBanner';
import { WelcomeInfoModal } from './components/WelcomeInfoModal';

// Helper to match legal contract URLs
const getLegalDocFromPath = (path: string, hash: string): LegalDocSlug | null => {
  const p = (path.startsWith('/') ? path.slice(1) : path).toLowerCase();
  const h = (hash.startsWith('#') ? hash.slice(1) : hash).toLowerCase();
  const target = p || h;

  if (target === 'mesafeli-satis-sozlesmesi' || target === 'mesafeli-satis' || target.includes('mesafeli')) return 'mesafeli-satis-sozlesmesi';
  if (target === 'on-bilgilendirme-formu' || target === 'on-bilgilendirme' || target.includes('onbilgi')) return 'on-bilgilendirme-formu';
  if (target === 'kvkk-aydinlatma-metni' || target === 'kvkk' || target.includes('kvkk')) return 'kvkk-aydinlatma-metni';
  if (target === 'gizlilik-politikasi' || target === 'gizlilik-ve-guvenlik' || target === 'gizlilik' || target.includes('gizlilik')) return 'gizlilik-politikasi';
  if (target === 'iptal-ve-iade-kosullari' || target === 'teslimat-ve-iade' || target === 'iade-kosullari' || target.includes('iade')) return 'iptal-ve-iade-kosullari';
  if (target === 'kullanim-kosullari' || target === 'kullanim-sartlari' || target.includes('kullanim')) return 'kullanim-kosullari';
  if (target === 'sozlesmeler' || target === 'yasal' || target === 'legal') return 'mesafeli-satis-sozlesmesi';
  return null;
};

export function App() {
  // Theme state (Default to Light Theme on first visit)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return false; // Always default to Light Theme
  });

  // App mode: 'public' | 'admin' | 'checkout' | 'legal'
  const [viewMode, setViewMode] = useState<'public' | 'admin' | 'checkout' | 'legal'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash.startsWith('#admin/')) {
        return 'admin';
      }
      if (path === '/odeme' || path.startsWith('/odeme/') || path === '/checkout' || hash === '#odeme' || hash === '#checkout') {
        return 'checkout';
      }
      const legalMatch = getLegalDocFromPath(path, hash);
      if (legalMatch) {
        return 'legal';
      }
    }
    return 'public';
  });

  const [activeLegalSlug, setActiveLegalSlug] = useState<LegalDocSlug>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const match = getLegalDocFromPath(path, hash);
      if (match) return match;
    }
    return 'mesafeli-satis-sozlesmesi';
  });

  const navigateToAdmin = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    setViewMode('admin');
  };

  const navigateToCheckout = () => {
    if (window.location.pathname !== '/odeme') {
      window.history.pushState({}, '', '/odeme');
    }
    setViewMode('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLegal = (slug: LegalDocSlug = 'mesafeli-satis-sozlesmesi') => {
    if (window.location.pathname !== `/${slug}`) {
      window.history.pushState({}, '', `/${slug}`);
    }
    setActiveLegalSlug(slug);
    setViewMode('legal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPublic = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setViewMode('public');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync URL changes (e.g. typing /admin, /odeme, /mesafeli-satis-sozlesmesi in URL bar, browser back/forward buttons)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash.startsWith('#admin/')) {
        setViewMode('admin');
      } else if (path === '/odeme' || path.startsWith('/odeme/') || path === '/checkout' || hash === '#odeme' || hash === '#checkout') {
        setViewMode('checkout');
      } else {
        const legalMatch = getLegalDocFromPath(path, hash);
        if (legalMatch) {
          setActiveLegalSlug(legalMatch);
          setViewMode('legal');
        } else {
          setViewMode('public');
        }
      }
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
  const [cart, setCart] = useState<CartItem[]>(() => StorageService.getCart());

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderTrackOpen, setIsOrderTrackOpen] = useState(false);

  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sync dark mode with document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(darkMode));
    } catch {
      // ignore
    }
  }, [darkMode]);

  // Ref for measuring exact top navigation height
  const topNavRef = React.useRef<HTMLDivElement>(null);

  // Dynamically sync sticky header height with CSS variable and scroll padding
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (topNavRef.current) {
        const height = topNavRef.current.offsetHeight;
        if (height > 0) {
          document.documentElement.style.setProperty('--header-total-height', `${height}px`);
        }
      }
    };

    updateHeaderHeight();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && topNavRef.current) {
      observer = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      observer.observe(topNavRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [settings.announcementActive, settings.sections?.announcement, settings.announcementText]);

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
      setCart(StorageService.getCart());
    };

    window.addEventListener('edijital_settings_updated', handleSync);
    window.addEventListener('edijital_packages_updated', handleSync);
    window.addEventListener('edijital_cart_updated', handleSync);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('edijital_settings_updated', handleSync);
      window.removeEventListener('edijital_packages_updated', handleSync);
      window.removeEventListener('edijital_cart_updated', handleSync);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Cart operations
  const handleAddToCart = (pkg: Package) => {
    StorageService.addToCart(pkg);
    setCart(StorageService.getCart());
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (pkgId: string, quantity: number) => {
    StorageService.updateCartQuantity(pkgId, quantity);
    setCart(StorageService.getCart());
  };

  const handleRemoveItem = (pkgId: string) => {
    StorageService.removeFromCart(pkgId);
    setCart(StorageService.getCart());
  };

  const handleClearCart = () => {
    StorageService.clearCart();
    setCart([]);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigateToCheckout();
  };

  const handleNavigateToPricing = () => {
    setIsCartOpen(false);
    if (viewMode !== 'public') {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
      setViewMode('public');
    }
    setTimeout(() => {
      const el = document.getElementById('fiyatlar');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleBuyNow = (pkg?: Package) => {
    if (pkg) {
      StorageService.addToCart(pkg);
      setCart(StorageService.getCart());
      setIsCartOpen(true);
    } else {
      const currentCart = StorageService.getCart();
      if (currentCart.length > 0) {
        setIsCartOpen(true);
      } else {
        const el = document.getElementById('fiyatlar');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          setIsCartOpen(true);
        }
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Total cart counts & sums
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + (item.package.price * item.quantity), 0);

  // =========================================================================
  // 1. ADMIN VIEW
  // =========================================================================
  if (viewMode === 'admin') {
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

  // =========================================================================
  // 2. DEDICATED CHECKOUT / PAYMENT PAGE VIEW (/odeme)
  // =========================================================================
  if (viewMode === 'checkout') {
    return (
      <>
        <CheckoutPage
          settings={settings}
          cart={cart}
          darkMode={darkMode}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onBackToHome={navigateToPublic}
          onNavigateToLegal={navigateToLegal}
          onNavigateToTrack={(code) => {
            navigateToPublic();
            setIsOrderTrackOpen(true);
          }}
        />
        <CookieBanner onNavigateLegal={navigateToLegal} />
      </>
    );
  }

  // =========================================================================
  // 3. DEDICATED LEGAL & CONTRACTS PAGE VIEW (/mesafeli-satis-sozlesmesi, /on-bilgilendirme-formu, /kvkk-aydinlatma-metni, etc.)
  // =========================================================================
  if (viewMode === 'legal') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors">
        <LegalPage
          settings={settings}
          darkMode={darkMode}
          cartCount={cartTotalItems}
          cartTotal={cartTotalPrice}
          onToggleDarkMode={toggleDarkMode}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenApply={() => handleBuyNow()}
          onOpenTrack={() => setIsOrderTrackOpen(true)}
          onOpenAdmin={navigateToAdmin}
          activeSlug={activeLegalSlug}
          onNavigateToDoc={navigateToLegal}
          onBackToHome={navigateToPublic}
          onNavigateToCheckout={navigateToCheckout}
        />

        {/* Shopping Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onProceedToCheckout={handleProceedToCheckout}
          onNavigateToPricing={handleNavigateToPricing}
          settings={settings}
        />

        {/* Real-time Order Tracking Modal */}
        <OrderTrackModal
          isOpen={isOrderTrackOpen}
          onClose={() => setIsOrderTrackOpen(false)}
          settings={settings}
        />

        {/* KVKK & GDPR Cookie Consent Banner */}
        <CookieBanner onNavigateLegal={navigateToLegal} />
      </div>
    );
  }

  // =========================================================================
  // 4. MAIN PUBLIC STOREFRONT VIEW (/)
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-zinc-100 transition-colors">

      {/* 100% Fixed Top Navigation (Zero Jitter, Fixed on all devices) */}
      <div ref={topNavRef} className="fixed top-0 left-0 right-0 z-40 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md">
        {(settings.sections?.announcement !== false && settings.announcementActive) && (
          <AnnouncementBar
            settings={settings}
            onOpenApply={() => handleBuyNow()}
          />
        )}

        <Header
          settings={settings}
          darkMode={darkMode}
          cartCount={cartTotalItems}
          cartTotal={cartTotalPrice}
          onToggleDarkMode={toggleDarkMode}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenApply={() => handleBuyNow()}
          onOpenTrack={() => setIsOrderTrackOpen(true)}
          onOpenAdmin={navigateToAdmin}
        />
      </div>

      {/* Dynamic Spacer so main content is perfectly offset below fixed header */}
      <div
        style={{ height: 'var(--header-total-height, 68px)' }}
        className="w-full shrink-0"
        aria-hidden="true"
      />

      {/* Main Public Content */}
      <main className="flex-1 pb-16 md:pb-0">
        {settings.sections?.hero !== false && (
          <Hero
            settings={settings}
            packages={packages}
            onOpenApply={(pkg) => handleBuyNow(pkg)}
            onOpenTrack={(code) => {
              setIsOrderTrackOpen(true);
            }}
          />
        )}

        {settings.sections?.features !== false && (
          <FeaturesBento
            settings={settings}
            onOpenApply={() => handleBuyNow()}
          />
        )}

        {settings.sections?.quickForm !== false && (
          <QuickFormSection
            settings={settings}
            packages={packages}
            onQuickCheckout={(pkg) => handleBuyNow(pkg)}
          />
        )}

        {settings.sections?.pricing !== false && (
          <PricingSection
            packages={packages}
            settings={settings}
            onSelectPackage={(pkg) => handleBuyNow(pkg)}
            onAddToCart={(pkg) => handleAddToCart(pkg)}
          />
        )}

        {settings.sections?.compatibility !== false && (
          <CompatibilityGrid />
        )}

        {settings.sections?.about !== false && (
          <AboutSection
            settings={settings}
            onOpenApply={() => handleBuyNow()}
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
        onOpenTrack={() => setIsOrderTrackOpen(true)}
        onOpenApply={() => handleBuyNow()}
        onNavigateToLegal={navigateToLegal}
      />

      {/* Desktop Floating Action Buttons (Hidden on Mobile) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-3 pointer-events-none">
        {/* Scroll To Top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="pointer-events-auto w-11 h-11 rounded-full bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/30 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
          title="WhatsApp İle Danışın"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="text-xs font-bold">WhatsApp Destek</span>
        </a>
      </div>

      {/* Mobile Bottom Navigation Bar with Quick Contact Popup */}
      <MobileBottomNav
        settings={settings}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenApply={() => handleBuyNow()}
        onOpenTrack={() => setIsOrderTrackOpen(true)}
      />

      {/* Shopping Cart Drawer (Opens from Right) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
        onNavigateToPricing={handleNavigateToPricing}
        settings={settings}
      />

      {/* Real-time Order Tracking Modal */}
      <OrderTrackModal
        isOpen={isOrderTrackOpen}
        onClose={() => setIsOrderTrackOpen(false)}
        settings={settings}
      />

      {/* KVKK & GDPR Cookie Consent Banner */}
      <CookieBanner onNavigateLegal={navigateToLegal} />

      {/* Welcome E-Signature Info Modal (0545 960 33 03) */}
      {viewMode === 'public' && (
        <WelcomeInfoModal
          settings={settings}
          onExplorePackages={handleNavigateToPricing}
        />
      )}

    </div>
  );
}

export default App;
