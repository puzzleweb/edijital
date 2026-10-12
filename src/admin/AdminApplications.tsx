import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Trash2, 
  Eye, 
  Edit3, 
  X, 
  Check, 
  MessageSquare,
  Building2,
  User,
  AlertCircle,
  CreditCard,
  ShoppingBag,
  Truck,
  Scale,
  Printer,
  FileCheck2,
  FileText,
  ArrowLeft,
  Calendar,
  Save,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { Order, Application, DeliveryType, OrderStatus, ApplicationStatus, PaymentStatus, PaymentMethod, Package as PkgType } from '../types';
import { StorageService } from '../services/storage';
import { ConfirmModal } from '../components/ConfirmModal';
import { generateCustomerContractSnapshots } from '../data/defaultLegalDocs';

interface AdminApplicationsProps {
  applications: Order[];
  packages: PkgType[];
  selectedApp: Order | null;
  onSelectApplication: (app: Order | null) => void;
}

export const AdminApplications: React.FC<AdminApplicationsProps> = ({
  applications,
  packages,
  selectedApp,
  onSelectApplication
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  
  // Detail page state
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [editingStatus, setEditingStatus] = useState<OrderStatus>('yeni');
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<PaymentStatus>('odendi');
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [isSavedDetailSuccess, setIsSavedDetailSuccess] = useState(false);
  
  // In-page contract viewer & Fullscreen modal state
  const [activeContractSlug, setActiveContractSlug] = useState<string>('mesafeli-satis-sozlesmesi');
  const [viewingContract, setViewingContract] = useState<{ title: string; contentHtml: string } | null>(null);

  // Deletion state
  const [appToDelete, setAppToDelete] = useState<string | null>(null);

  // New manual order modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    fullName: '',
    tcVkn: '',
    phone: '',
    email: '',
    isCorporate: false,
    companyName: '',
    packageId: packages[0]?.id || '',
    deliveryType: 'ankara_yerinde' as DeliveryType,
    paymentMethod: 'credit_card' as PaymentMethod,
    paymentStatus: 'odendi' as PaymentStatus,
    district: '',
    address: '',
    notes: ''
  });

  const getPaymentMethod = (app: Order): PaymentMethod => {
    if (app.paymentMethod === 'bank_transfer' || app.paymentMethod === 'cash_on_delivery' || app.paymentMethod === 'credit_card') {
      return app.paymentMethod;
    }
    const notesLower = String(app.notes || '').toLowerCase();
    if (notesLower.includes('bank_transfer') || notesLower.includes('havale') || notesLower.includes('eft')) {
      return 'bank_transfer';
    }
    if (notesLower.includes('cash_on_delivery') || notesLower.includes('kapıda') || notesLower.includes('kapida')) {
      return 'cash_on_delivery';
    }
    return 'credit_card';
  };

  const getPaymentStatus = (app: Order): PaymentStatus => {
    if (app.paymentStatus) {
      return app.paymentStatus;
    }
    const method = getPaymentMethod(app);
    if (method === 'bank_transfer') return 'havale_bekleniyor';
    if (method === 'cash_on_delivery') return 'kapida_odeme';
    return 'odendi';
  };

  const getDeliveryLabel = (app: Order) => {
    if (app.deliveryTitle) return app.deliveryTitle;
    if (app.deliveryType && !['magaza', 'ankara_yerinde', 'kargo', 'kurye'].includes(app.deliveryType)) {
      return app.deliveryType;
    }
    const noteMatch = app.notes?.match(/Teslimat:\s*([^\n\r]+)/) || app.notes?.match(/Hızlı Sipariş\s*\(([^)]+)\)/);
    if (noteMatch && noteMatch[1]) {
      return noteMatch[1];
    }
    if (app.deliveryType === 'magaza') return 'Mağazadan Teslim';
    if (app.deliveryType === 'ankara_yerinde') return 'Adreste Yerinde Teslim';
    if (app.deliveryType === 'kurye') return 'Kurye ile Teslim';
    if (app.deliveryType === 'kargo') return 'Kargo ile Teslim';
    return app.deliveryType || 'Adrese Teslim';
  };

  // Sync state when selected application changes
  useEffect(() => {
    if (selectedApp) {
      setEditingStatus(selectedApp.status);
      setEditingPaymentStatus(getPaymentStatus(selectedApp));
      setAdminNoteInput(selectedApp.adminNotes || '');
      setIsSavedDetailSuccess(false);
      setIsSavingDetail(false);
    }
  }, [selectedApp]);

  // Filter orders
  const filteredApps = applications.filter((app) => {
    const code = app.orderNumber || app.trackingCode || '';
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.tcVkn.includes(searchTerm) ||
      app.phone.includes(searchTerm);

    const method = getPaymentMethod(app);
    const payStatus = getPaymentStatus(app);

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || payStatus === paymentFilter || method === paymentFilter;
    const currentDeliveryLabel = getDeliveryLabel(app);
    const matchesDelivery = deliveryFilter === 'all' || app.deliveryType === deliveryFilter || currentDeliveryLabel === deliveryFilter;

    return matchesSearch && matchesStatus && matchesPayment && matchesDelivery;
  });

  const uniqueDeliveries = Array.from(new Set(applications.map(a => getDeliveryLabel(a)))).filter(Boolean);

  const handleOpenDetail = (app: Order) => {
    onSelectApplication(app);
    setEditingStatus(app.status);
    setEditingPaymentStatus(getPaymentStatus(app));
    setAdminNoteInput(app.adminNotes || '');
    setIsSavedDetailSuccess(false);
    setIsSavingDetail(false);
  };

  const handleSaveAppDetails = () => {
    if (!selectedApp || isSavingDetail) return;
    setIsSavingDetail(true);
    StorageService.updateOrderStatus(selectedApp.id, editingStatus, adminNoteInput, editingPaymentStatus);
    
    // Update local selected
    onSelectApplication({
      ...selectedApp,
      status: editingStatus,
      paymentStatus: editingPaymentStatus,
      adminNotes: adminNoteInput
    });

    setIsSavingDetail(false);
    setIsSavedDetailSuccess(true);

    setTimeout(() => {
      setIsSavedDetailSuccess(false);
    }, 2500);
  };

  const handleDeleteApp = (id: string) => {
    setAppToDelete(id);
  };

  const confirmDeleteApp = () => {
    if (appToDelete) {
      StorageService.deleteApplication(appToDelete);
      if (selectedApp?.id === appToDelete) onSelectApplication(null);
      setAppToDelete(null);
    }
  };

  const handleCreateManualApp = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = packages.find(p => p.id === newForm.packageId) || packages[0];

    StorageService.addApplication({
      fullName: newForm.fullName,
      tcVkn: newForm.tcVkn,
      phone: newForm.phone,
      email: newForm.email,
      isCorporate: newForm.isCorporate,
      companyName: newForm.isCorporate ? newForm.companyName : undefined,
      packageId: pkg.id,
      packageName: pkg.name,
      duration: pkg.duration,
      price: pkg.price,
      deliveryType: newForm.deliveryType,
      address: newForm.address || 'Mağazadan teslim veya telefonla alındı',
      city: 'ANKARA',
      district: newForm.district,
      notes: newForm.notes
    });

    setIsNewModalOpen(false);
    setNewForm({
      fullName: '',
      tcVkn: '',
      phone: '',
      email: '',
      isCorporate: false,
      companyName: '',
      packageId: packages[0]?.id || '',
      deliveryType: 'ankara_yerinde',
      paymentMethod: 'credit_card',
      paymentStatus: 'odendi',
      district: '',
      address: '',
      notes: ''
    });
  };

  const handleExportCSV = () => {
    const headers = ['Takip Kodu', 'Ad Soyad', 'TC/VKN', 'Telefon', 'E-Posta', 'Paket', 'Süre', 'Fiyat (TL)', 'Teslimat', 'İlçe', 'Adres', 'Durum', 'Tarih'];
    const rows = applications.map(a => [
      a.trackingCode,
      `"${a.fullName}"`,
      a.tcVkn,
      a.phone,
      a.email,
      `"${a.packageName}"`,
      a.duration,
      a.price,
      a.deliveryType,
      `"${a.district}"`,
      `"${a.address}"`,
      a.status,
      new Date(a.createdAt).toLocaleString('tr-TR')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edijital_e_imza_basvurular_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ========================================================================= */
  /* FULL-PAGE ORDER DETAIL VIEW (WHEN selectedApp IS PRESENT)                 */
  /* ========================================================================= */
  if (selectedApp) {
    const orderNum = selectedApp.orderNumber || selectedApp.trackingCode;
    const paymentMethod = getPaymentMethod(selectedApp);
    const currentPayStatus = getPaymentStatus(selectedApp);

    // Available signed contracts
    const signedContractsList = (selectedApp.signedContracts && selectedApp.signedContracts.length > 0)
      ? selectedApp.signedContracts
      : generateCustomerContractSnapshots(selectedApp, StorageService.getSettings());

    const activeContract = signedContractsList.find(c => c.slug === activeContractSlug) || signedContractsList[0];

    return (
      <div className="space-y-6 animate-in fade-in duration-200 pb-16">
        
        {/* Top Header & Breadcrumb / Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
          
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => onSelectApplication(null)}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sipariş Listesine Dön</span>
            </button>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {orderNum}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Sipariş Detayı & Yönetim
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Oluşturulma Tarihi: {new Date(selectedApp.createdAt).toLocaleString('tr-TR')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-700 dark:text-zinc-200 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Yazdır / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => handleDeleteApp(selectedApp.id)}
              className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Siparişi Sil</span>
            </button>

            <button
              type="button"
              disabled={isSavingDetail}
              onClick={handleSaveAppDetails}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer text-white shadow-md active:scale-95 ${
                isSavedDetailSuccess
                  ? 'bg-emerald-600 shadow-emerald-600/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              {isSavingDetail ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : isSavedDetailSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>✓ Başarıyla Kaydedildi!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Değişiklikleri Kaydet</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Success Alert Banner */}
        {isSavedDetailSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Sipariş durumu, ödeme bilgisi ve yönetici notları başarıyla güncellendi!</span>
          </div>
        )}

        {/* 2-Column Page Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Customer info, Invoice info, Order items, Legal docs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. FATURA VE MÜŞTERİ / ALICI BİLGİLERİ KARTI */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      Fatura ve Alıcı Bilgileri
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                      Müşterinin sipariş verirken bildirdiği fatura ve kimlik verileri
                    </p>
                  </div>
                </div>

                {selectedApp.isCorporate || selectedApp.companyName ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Kurumsal Fatura</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Bireysel Fatura</span>
                  </span>
                )}
              </div>

              {/* Kurumsal Bilgiler Vurgu Alanı */}
              {selectedApp.isCorporate || selectedApp.companyName ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                  <div>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium block">
                      Şirket / Kurum Resmi Ünvanı:
                    </span>
                    <strong className="text-sm text-indigo-950 dark:text-indigo-200 font-bold block mt-0.5">
                      {selectedApp.companyName || 'Belirtilmedi'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium block">
                      Vergi Kimlik Numarası (VKN):
                    </span>
                    <strong className="text-sm font-mono text-gray-900 dark:text-white font-bold block mt-0.5">
                      {selectedApp.tcVkn}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium block">
                      Vergi Dairesi:
                    </span>
                    <strong className="text-xs text-gray-800 dark:text-zinc-200 block mt-0.5">
                      {selectedApp.taxOffice || 'Belirtilmedi'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium block">
                      Yetkili / İmza Sahibi:
                    </span>
                    <strong className="text-xs text-gray-900 dark:text-white font-bold block mt-0.5">
                      {selectedApp.fullName}
                    </strong>
                  </div>
                </div>
              ) : (
                /* Bireysel Bilgiler Vurgu Alanı */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/70 dark:border-zinc-700/70">
                  <div>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium block">
                      Ad Soyad (E-İmza Sahibi):
                    </span>
                    <strong className="text-sm text-gray-900 dark:text-white font-bold block mt-0.5">
                      {selectedApp.fullName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium block">
                      T.C. Kimlik Numarası:
                    </span>
                    <strong className="text-sm font-mono text-gray-900 dark:text-white font-bold block mt-0.5">
                      {selectedApp.tcVkn}
                    </strong>
                  </div>
                </div>
              )}

              {/* İletişim ve Teslimat Adresi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[11px] text-gray-400 block font-medium">Telefon Numarası</span>
                  <a 
                    href={`tel:${selectedApp.phone}`} 
                    className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedApp.phone}</span>
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[11px] text-gray-400 block font-medium">E-Posta Adresi</span>
                  <a 
                    href={`mailto:${selectedApp.email}`} 
                    className="text-sm font-bold text-gray-900 dark:text-white hover:underline flex items-center gap-1.5 mt-1 truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{selectedApp.email || 'E-posta belirtilmedi'}</span>
                  </a>
                </div>

                <div className="md:col-span-2 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[11px] text-gray-400 block font-medium">Fatura ve Teslimat Adresi</span>
                  <div className="text-xs text-gray-900 dark:text-zinc-200 font-medium leading-relaxed mt-1 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      {selectedApp.address || 'Adres belirtilmedi'} {selectedApp.district ? `(${selectedApp.district})` : ''} {selectedApp.city || 'ANKARA'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Contact Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={`tel:${selectedApp.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-emerald-700 transition cursor-pointer shadow-sm active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>Müşteriyi Doğrudan Ara</span>
                </a>

                <a
                  href={`https://wa.me/${selectedApp.phone.replace(/[^0-9]/g, '')}?text=Merhaba%20Sayin%20${encodeURIComponent(selectedApp.fullName)},%20${orderNum}%20nolu%20e-imza%20siparisiniz%20hakkinda%20bilgilendirme.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-green-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-green-700 transition cursor-pointer shadow-sm active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>WhatsApp ile Bilgi Gönder</span>
                </a>
              </div>

            </div>

            {/* 2. SİPARİŞ KALEMLERİ VE ÖDEME DÖKÜMÜ KARTI */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      Sipariş Kalemleri & Ödeme Dökümü
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                      Seçilen e-imza paketi, sertifika süresi ve teslimat yöntemi
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-medium">Toplam Sipariş Tutarı</span>
                  <span className="font-mono text-lg font-extrabold text-blue-600 dark:text-blue-400">
                    {(selectedApp.totalAmount || selectedApp.price).toLocaleString('tr-TR')} ₺ <span className="text-xs font-normal text-gray-500">(KDV Dahil)</span>
                  </span>
                </div>
              </div>

              {/* Sipariş Kalemleri Tablosu */}
              <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-zinc-400 font-semibold border-b border-gray-100 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Hizmet / Paket</th>
                      <th className="py-3 px-4">Sertifika Süresi</th>
                      <th className="py-3 px-4">Teslimat Şekli</th>
                      <th className="py-3 px-4 text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                        {selectedApp.packageName}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-zinc-300">
                        {selectedApp.duration}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{getDeliveryLabel(selectedApp)}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                        {(selectedApp.totalAmount || selectedApp.price).toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ödeme Yöntemi ve Detayı */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-gray-500 dark:text-zinc-400 block font-medium">
                    Ödeme Tercihi:
                  </span>
                  <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    {paymentMethod === 'credit_card' ? <CreditCard className="w-4 h-4 text-blue-600" /> :
                     paymentMethod === 'bank_transfer' ? <Building2 className="w-4 h-4 text-amber-600" /> : <Truck className="w-4 h-4 text-purple-600" />}
                    <span>
                      {paymentMethod === 'credit_card' ? 'Kredi / Banka Kartı (3D Secure Sanal POS)' :
                       paymentMethod === 'bank_transfer' ? 'Banka Havalesi / EFT / FAST' : 'Kapıda / Adreste Tahsilat'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-gray-500 dark:text-zinc-400 block font-medium text-right sm:text-left">
                    Mevcut Ödeme Durumu:
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mt-0.5 ${
                    currentPayStatus === 'odendi' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    currentPayStatus === 'havale_bekleniyor' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    currentPayStatus === 'kapida_odeme' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                    'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {currentPayStatus === 'odendi' ? '✓ Ödendi / Onaylandı' :
                     currentPayStatus === 'havale_bekleniyor' ? '⏳ Havale Bekleniyor' :
                     currentPayStatus === 'kapida_odeme' ? '📦 Kapıda Tahsilat' : '✕ Ödenmedi / İptal'}
                  </span>
                </div>
              </div>

              {/* Müşteri Sipariş Notu Varsa */}
              {selectedApp.notes && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                    Müşteri Tarafından Eklenen Not:
                  </span>
                  <p className="text-amber-950 dark:text-amber-200 leading-relaxed font-sans">
                    {selectedApp.notes}
                  </p>
                </div>
              )}

            </div>

            {/* 3. MÜŞTERİ TARAFINDAN ONAYLANAN YASAL SÖZLEŞMELER (İN-PAGE DOKÜMAN OKUYUCU) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-emerald-200/80 dark:border-emerald-900/40 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <span>Müşteri Tarafından Onaylanan Yasal Sözleşmeler</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                      6502 Sayılı Tüketici Kanunu ve BDDK mevzuatı gereği saklanan hukuki arşiv
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 self-start sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Elektronik Onaylı</span>
                </span>
              </div>

              {/* Contract Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {signedContractsList.map((contract) => {
                  const isActive = (activeContract?.slug === contract.slug);
                  return (
                    <button
                      key={contract.slug}
                      type="button"
                      onClick={() => setActiveContractSlug(contract.slug)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-2 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-emerald-50/60 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-emerald-200/60 dark:border-zinc-700 hover:bg-emerald-100/50'
                      }`}
                    >
                      <span>{contract.title}</span>
                      {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* In-Page Document Container */}
              {activeContract && (
                <div className="rounded-2xl border border-emerald-200/80 dark:border-zinc-800 bg-emerald-50/20 dark:bg-zinc-900/50 overflow-hidden">
                  
                  {/* Document Header & Actions */}
                  <div className="px-5 py-3 border-b border-emerald-200/60 dark:border-zinc-800 bg-emerald-50/60 dark:bg-zinc-800/60 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {activeContract.title}
                      </h4>
                      <span className="text-[10px] text-gray-500 dark:text-zinc-400">
                        {activeContract.agreedAt || 'Sipariş Tarihi ve Saatinde Onaylandı'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingContract({ title: activeContract.title, contentHtml: activeContract.contentHtml })}
                        className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Tam Ekranda Oku</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-semibold text-gray-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                        <span>Yazdır</span>
                      </button>
                    </div>
                  </div>

                  {/* Document Content Render */}
                  <div className="p-5 max-h-[460px] overflow-y-auto bg-white/70 dark:bg-zinc-950/40">
                    <div 
                      className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans space-y-3 prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: activeContract.contentHtml }}
                    />
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: Order status, Payment status, Admin note, Save CTA (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. SİPARİŞ DURUMU YÖNETİMİ */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                  Sipariş Durumu
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'yeni', label: 'Yeni Sipariş' },
                  { key: 'inceleniyor', label: 'İnceleniyor' },
                  { key: 'onaylandi', label: 'Onaylandı' },
                  { key: 'hazirlaniyor', label: 'Hazırlanıyor' },
                  { key: 'teslim_edildi', label: 'Teslim Edildi' },
                  { key: 'iptal', label: 'İptal Edildi' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setEditingStatus(s.key as OrderStatus)}
                    className={`py-2.5 px-3 rounded-xl font-bold border text-center transition cursor-pointer text-xs ${
                      editingStatus === s.key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102'
                        : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. ÖDEME DURUMU YÖNETİMİ */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                  Ödeme Durumu
                </h3>
              </div>

              <div className="space-y-2">
                {[
                  { key: 'odendi', label: '✓ Ödendi / Kart Onayı Alındı', activeBg: 'bg-emerald-600 border-emerald-600 text-white' },
                  { key: 'havale_bekleniyor', label: '⏳ Banka Havalesi Bekleniyor', activeBg: 'bg-amber-600 border-amber-600 text-white' },
                  { key: 'kapida_odeme', label: '📦 Kapıda / Yerinde Tahsilat', activeBg: 'bg-purple-600 border-purple-600 text-white' },
                  { key: 'odenmedi', label: '✕ Ödenmedi / İptal Edildi', activeBg: 'bg-red-600 border-red-600 text-white' },
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setEditingPaymentStatus(p.key as PaymentStatus)}
                    className={`w-full py-2.5 px-3.5 rounded-xl font-bold border text-left transition cursor-pointer text-xs flex items-center justify-between ${
                      editingPaymentStatus === p.key
                        ? `${p.activeBg} shadow-sm scale-101`
                        : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{p.label}</span>
                    {editingPaymentStatus === p.key && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. YÖNETİCİ & KURYE NOTU */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
                <FileText className="w-4 h-4 text-gray-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                  Kurye & Yönetici Notu
                </h3>
              </div>
              <textarea
                rows={4}
                placeholder="Örn: Saat 15:00 kurye teslim edecek, Kargo Takip No: YK-994821, kimlik teyidi alındı."
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
              />
            </div>

            {/* 4. KAYDET BUTONU */}
            <button
              type="button"
              disabled={isSavingDetail}
              onClick={handleSaveAppDetails}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer text-white shadow-lg active:scale-98 ${
                isSavedDetailSuccess
                  ? 'bg-emerald-600 shadow-emerald-600/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
              }`}
            >
              {isSavingDetail ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : isSavedDetailSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>✓ Başarıyla Kaydedildi!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Tüm Değişiklikleri Kaydet</span>
                </>
              )}
            </button>

          </div>

        </div>

        {/* FULLSCREEN POPULATED LEGAL CONTRACT VIEWER (Z-INDEX [9999] TO PREVENT HEADER OVERLAP) */}
        {viewingContract && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                      {viewingContract.title}
                    </h3>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Resmi Hukuki Onay Kopyası & Müşteri Doğrulama Belgesi (5070 & 6502 Sayılı Kanunlar)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-1.5 transition cursor-pointer"
                    title="Sözleşmeyi Yazdır"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                    <span>Yazdır / PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingContract(null)}
                    className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center justify-center cursor-pointer transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-4 bg-zinc-50/40 dark:bg-zinc-950/30">
                <div 
                  className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-4 font-sans prose dark:prose-invert max-w-none bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs"
                  dangerouslySetInnerHTML={{ __html: viewingContract.contentHtml }}
                />
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between text-xs text-zinc-500 shrink-0">
                <span className="text-[11px]">
                  5070 Sayılı Elektronik İmza & 6502 Sayılı Tüketicinin Korunması Kanunu Kapsamındadır.
                </span>
                <button
                  type="button"
                  onClick={() => setViewingContract(null)}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  Kapat
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={!!appToDelete}
          onClose={() => setAppToDelete(null)}
          onConfirm={confirmDeleteApp}
          title="Siparişi Sil"
          description="Bu e-imza sipariş kaydını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
          confirmText="Evet, Sil"
          cancelText="Vazgeç"
          variant="danger"
        />

      </div>
    );
  }

  /* ========================================================================= */
  /* MAIN APPLICATIONS TABLE LIST VIEW (WHEN selectedApp IS NULL)              */
  /* ========================================================================= */
  return (
    <div className="space-y-6">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <span>E-İmza Sipariş & Satış Yönetimi</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Gelen online siparişleri inceleyin, ödeme ve kurye/teslimat durumlarını anlık yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel / CSV Dışa Aktar</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex-1 sm:flex-initial apple-btn-primary px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Sipariş Girişi</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Sipariş No, İsim, T.C. No, Telefon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status, Payment and Delivery dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="all">Tüm Durumlar ({applications.length})</option>
            <option value="yeni">Yeni Sipariş</option>
            <option value="inceleniyor">İnceleniyor</option>
            <option value="onaylandi">Onaylandı</option>
            <option value="hazirlaniyor">Hazırlanıyor</option>
            <option value="teslim_edildi">Teslim Edildi</option>
            <option value="iptal">İptal Edildi</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="all">Tüm Ödemeler</option>
            <option value="odendi">Ödendi (Kredi Kartı)</option>
            <option value="havale_bekleniyor">Havale Bekleniyor</option>
            <option value="kapida_odeme">Kapıda / Mağazada Ödeme</option>
          </select>

          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="all">Tüm Teslimatlar</option>
            {uniqueDeliveries.map((del) => (
              <option key={del} value={del}>{del}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Data Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-zinc-800/40 border-b border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Sipariş No</th>
                <th className="py-3 px-4">Müşteri / Kurum</th>
                <th className="py-3 px-4">Paket & Süre</th>
                <th className="py-3 px-4">Ödeme</th>
                <th className="py-3 px-4">Teslimat</th>
                <th className="py-3 px-4">Tutar</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-zinc-500">
                    Arama kriterlerinize uygun sipariş bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {app.orderNumber || app.trackingCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 dark:text-white">{app.fullName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">TC/VKN: {app.tcVkn}</div>
                      {app.companyName && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[160px]">
                          {app.companyName}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-900 dark:text-zinc-200">{app.packageName}</div>
                      <div className="text-[10px] text-gray-400">{app.duration}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const method = getPaymentMethod(app);
                        const payStatus = getPaymentStatus(app);
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            payStatus === 'odendi' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            payStatus === 'havale_bekleniyor' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}>
                            {method === 'credit_card' ? <CreditCard className="w-3 h-3" /> :
                             method === 'bank_transfer' ? <Building2 className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                            <span>
                              {method === 'credit_card' ? 'Kredi Kartı' :
                               method === 'bank_transfer' ? 'Havale / EFT' : 'Kapıda Ödeme'}
                            </span>
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-800 dark:text-zinc-200">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[150px]" title={getDeliveryLabel(app)}>
                          {getDeliveryLabel(app)}
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white font-mono">
                      {(app.totalAmount || app.price).toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        app.status === 'teslim_edildi' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                        app.status === 'kargolandi' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400' :
                        app.status === 'hazirlaniyor' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400' :
                        app.status === 'onaylandi' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400' :
                        app.status === 'iptal' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' :
                        'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-400'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenDetail(app)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition cursor-pointer"
                        title="Detay & Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Application Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/50">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Manuel Yeni Başvuru Girişi</span>
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualApp} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Müşteri Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={newForm.fullName}
                    onChange={(e) => setNewForm({ ...newForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                    placeholder="Ad Soyad"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">T.C. Kimlik / VKN *</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={11}
                    value={newForm.tcVkn}
                    onChange={(e) => setNewForm({ ...newForm, tcVkn: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 font-mono"
                    placeholder="11 haneli T.C."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    maxLength={14}
                    value={newForm.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      if (!digits) { setNewForm({ ...newForm, phone: '' }); return; }
                      let formatted = digits.startsWith('0') ? digits : '0' + digits;
                      formatted = formatted.slice(0, 11);
                      if (formatted.length <= 4) setNewForm({ ...newForm, phone: formatted });
                      else if (formatted.length <= 7) setNewForm({ ...newForm, phone: `${formatted.slice(0, 4)} ${formatted.slice(4)}` });
                      else if (formatted.length <= 9) setNewForm({ ...newForm, phone: `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}` });
                      else setNewForm({ ...newForm, phone: `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9, 11)}` });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 font-medium"
                    placeholder="05XX XXX XX XX"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">E-İmza Paketi</label>
                  <select
                    value={newForm.packageId}
                    onChange={(e) => setNewForm({ ...newForm, packageId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.price} ₺)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Teslimat Şekli</label>
                  <select
                    value={newForm.deliveryType}
                    onChange={(e) => setNewForm({ ...newForm, deliveryType: e.target.value as DeliveryType })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                  >
                    <option value="ankara_yerinde">Ankara Adrese Yerinde Teslim</option>
                    <option value="magaza">Ostim Mağaza / Ofis Teslim</option>
                    <option value="kargo">Kargo ile Gönderim</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">İlçe / Bölge</label>
                  <input
                    type="text"
                    value={newForm.district}
                    onChange={(e) => setNewForm({ ...newForm, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">Açık Adres</label>
                <input
                  type="text"
                  value={newForm.address}
                  onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
                  placeholder="Cadde, sokak, no..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 font-semibold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="apple-btn-primary px-5 py-2 font-bold cursor-pointer"
                >
                  Kaydet & Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!appToDelete}
        onClose={() => setAppToDelete(null)}
        onConfirm={confirmDeleteApp}
        title="Başvuruyu Sil"
        description="Bu e-imza başvuru kaydını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        variant="danger"
      />

    </div>
  );
};
