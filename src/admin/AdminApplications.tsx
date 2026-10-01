import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Application, DeliveryType, ApplicationStatus, Package as PkgType } from '../types';
import { StorageService } from '../services/storage';
import { ConfirmModal } from '../components/ConfirmModal';

interface AdminApplicationsProps {
  applications: Application[];
  packages: PkgType[];
  selectedApp: Application | null;
  onSelectApplication: (app: Application | null) => void;
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
  
  // Detail modal state
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [editingStatus, setEditingStatus] = useState<ApplicationStatus>('yeni');
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [isSavedDetailSuccess, setIsSavedDetailSuccess] = useState(false);

  // Deletion state
  const [appToDelete, setAppToDelete] = useState<string | null>(null);

  // New manual application modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    fullName: '',
    tcVkn: '',
    phone: '',
    email: '',
    isCorporate: false,
    companyName: '',
    packageId: packages[0]?.id || '',
    deliveryType: 'Adreste Yerinde Teslim' as DeliveryType,
    district: '',
    address: '',
    notes: ''
  });

  const getDeliveryLabel = (app: Application) => {
    if (app.deliveryType && !['magaza', 'ankara_yerinde', 'kargo', 'kurye'].includes(app.deliveryType)) {
      return app.deliveryType;
    }
    const noteMatch = app.notes?.match(/Teslimat:\s*([^\n\r]+)/) || app.notes?.match(/Hızlı Form Başvurusu\s*\(([^)]+)\)/);
    if (noteMatch && noteMatch[1]) {
      return noteMatch[1];
    }
    if (app.deliveryType === 'magaza') return 'Mağazadan Teslim';
    if (app.deliveryType === 'ankara_yerinde') return 'Adreste Yerinde Teslim';
    if (app.deliveryType === 'kurye') return 'Kurye ile Teslim';
    if (app.deliveryType === 'kargo') return 'Kargo ile Teslim';
    return app.deliveryType || 'Adrese Teslim';
  };

  // Filter applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.tcVkn.includes(searchTerm) ||
      app.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const currentDeliveryLabel = getDeliveryLabel(app);
    const matchesDelivery = deliveryFilter === 'all' || app.deliveryType === deliveryFilter || currentDeliveryLabel === deliveryFilter;

    return matchesSearch && matchesStatus && matchesDelivery;
  });

  const uniqueDeliveries = Array.from(new Set(applications.map(a => getDeliveryLabel(a)))).filter(Boolean);

  const handleOpenDetail = (app: Application) => {
    onSelectApplication(app);
    setEditingStatus(app.status);
    setAdminNoteInput(app.adminNotes || '');
    setIsSavedDetailSuccess(false);
    setIsSavingDetail(false);
  };

  const handleSaveAppDetails = () => {
    if (!selectedApp || isSavingDetail) return;
    setIsSavingDetail(true);
    StorageService.updateApplicationStatus(selectedApp.id, editingStatus, adminNoteInput);
    
    // Update local selected
    onSelectApplication({
      ...selectedApp,
      status: editingStatus,
      adminNotes: adminNoteInput
    });

    setIsSavingDetail(false);
    setIsSavedDetailSuccess(true);

    // Auto-close modal with smooth confirmation
    setTimeout(() => {
      setIsSavedDetailSuccess(false);
      onSelectApplication(null);
    }, 600);
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
      deliveryType: 'Adreste Yerinde Teslim',
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

  return (
    <div className="space-y-6">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            E-İmza Başvuru Yönetimi
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Gelen başvuruları inceleyin, kimlik onaylarını yapın ve kurye/teslimat durumlarını güncelleyin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel / CSV Dışa Aktar</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex-1 sm:flex-initial apple-btn-primary px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Başvuru Ekle</span>
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
            placeholder="İsim, T.C. No, Takip Kodu, Telefon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status and Delivery dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="all">Tüm Durumlar ({applications.length})</option>
            <option value="yeni">Yeni Başvuru</option>
            <option value="inceleniyor">İnceleniyor</option>
            <option value="onaylandi">Onaylandı</option>
            <option value="hazirlandi">Hazırlandı</option>
            <option value="teslim_edildi">Teslim Edildi</option>
            <option value="iptal">İptal Edildi</option>
          </select>

          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="all">Tüm Teslimatlar ({applications.length})</option>
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
                <th className="py-3 px-4">Takip Kodu</th>
                <th className="py-3 px-4">Müşteri / Kurum</th>
                <th className="py-3 px-4">Paket & Süre</th>
                <th className="py-3 px-4">İletişim & Bölge</th>
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
                    Arama kriterlerinize uygun başvuru bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {app.trackingCode}
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
                      <div className="font-medium text-gray-900 dark:text-zinc-300">{app.phone}</div>
                      <div className="text-[10px] text-gray-400">
                        {app.district && app.district !== 'Etimesgut' && app.district !== 'Etimesgut / Eryaman' && app.district !== 'Eryaman / Etimesgut' 
                          ? app.district 
                          : (app.city || 'Ankara')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-800 dark:text-zinc-200">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[180px]" title={getDeliveryLabel(app)}>
                          {getDeliveryLabel(app)}
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                      {app.price.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        app.status === 'teslim_edildi' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                        app.status === 'hazirlandi' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400' :
                        app.status === 'onaylandi' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400' :
                        app.status === 'iptal' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' :
                        app.status === 'inceleniyor' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' :
                        'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-400'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenDetail(app)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition"
                        title="Detay & Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition"
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

      {/* Application Detail Slide-Over / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold text-blue-600 dark:text-blue-400">
                  {selectedApp.trackingCode}
                </span>
                <span className="text-xs text-gray-500">• Başvuru Detayları</span>
              </div>
              <button
                onClick={() => onSelectApplication(null)}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-300 dark:hover:bg-zinc-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Customer info card */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{selectedApp.fullName}</h4>
                    <p className="text-gray-500 font-mono">TC/VKN: {selectedApp.tcVkn}</p>
                    {selectedApp.companyName && (
                      <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{selectedApp.companyName}</p>
                    )}
                  </div>
                  <span className="font-bold text-base text-blue-600 dark:text-blue-400">
                    {selectedApp.price.toLocaleString('tr-TR')} ₺ + KDV
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">
                  <div>Paket: <strong>{selectedApp.packageName}</strong></div>
                  <div>Süre: <strong>{selectedApp.duration}</strong></div>
                  <div>Telefon: <strong>{selectedApp.phone}</strong></div>
                  <div>E-Posta: <strong>{selectedApp.email || '-'}</strong></div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 space-y-1">
                  <div>Teslimat Şekli: <strong className="text-blue-600 dark:text-blue-400">{getDeliveryLabel(selectedApp)}</strong></div>
                  
                  {(() => {
                    const deliveryLabel = getDeliveryLabel(selectedApp);
                    const rawAddr = selectedApp.address || '';
                    const isRedundant = 
                      !rawAddr || 
                      rawAddr === deliveryLabel || 
                      rawAddr === 'Adres belirtilmedi' || 
                      rawAddr.includes('Hızlı Başvuru');

                    if (isRedundant) return null;

                    const districtText = selectedApp.district && !['Etimesgut', 'Etimesgut / Eryaman', 'Eryaman / Etimesgut'].includes(selectedApp.district)
                      ? `(${selectedApp.district})`
                      : '';

                    return (
                      <div>Adres: <strong>{rawAddr} {districtText}</strong></div>
                    );
                  })()}

                  {(() => {
                    if (!selectedApp.notes) return null;
                    const deliveryLabel = getDeliveryLabel(selectedApp);
                    const note = selectedApp.notes.trim();
                    const isNoteRedundant = 
                      note === deliveryLabel || 
                      note === `Teslimat: ${deliveryLabel}` || 
                      note === `Hızlı Form Başvurusu (${deliveryLabel})` ||
                      note === `Hızlı Form (${deliveryLabel})`;

                    if (isNoteRedundant) return null;

                    return (
                      <div className="mt-1 text-amber-700 dark:text-amber-400">
                        Müşteri Notu: {note}
                      </div>
                    );
                  })()}
                </div>

                {/* Quick actions for customer */}
                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={`tel:${selectedApp.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1 hover:bg-emerald-700 transition"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Müşteriyi Ara</span>
                  </a>
                  <a
                    href={`https://wa.me/${selectedApp.phone.replace(/[^0-9]/g, '')}?text=Merhaba%20${encodeURIComponent(selectedApp.fullName)},%20${selectedApp.trackingCode}%20nolu%20e-imza%20basvurunuz%20hakkinda%20bilgilendirme.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-green-600 text-white font-semibold flex items-center gap-1 hover:bg-green-700 transition"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp Yaz</span>
                  </a>
                </div>
              </div>

              {/* Status Updater */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Başvuru Durumunu Güncelle
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'yeni', label: 'Yeni Başvuru' },
                    { key: 'inceleniyor', label: 'İnceleniyor' },
                    { key: 'onaylandi', label: 'Onaylandı' },
                    { key: 'hazirlandi', label: 'Hazırlandı' },
                    { key: 'teslim_edildi', label: 'Teslim Edildi' },
                    { key: 'iptal', label: 'İptal' },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setEditingStatus(s.key as ApplicationStatus)}
                      className={`py-2 px-3 rounded-xl font-semibold border text-center transition ${
                        editingStatus === s.key
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin note input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Yönetici & Kurye Notu
                </label>
                <input
                  type="text"
                  placeholder="Örn: Saat 15:00 kurye teslim edecek, Kargo Takip: YK994821"
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Save button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onSelectApplication(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  disabled={isSavingDetail}
                  onClick={handleSaveAppDetails}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer text-white shadow-md active:scale-95 ${
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
                      <span>✓ Kaydedildi!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Değişiklikleri Kaydet</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* New Application Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
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
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="apple-btn-primary px-5 py-2 font-bold"
                >
                  Kaydet & Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Confirmation Modal */}
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
