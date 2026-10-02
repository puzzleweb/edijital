import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  Check,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Building,
  User,
  Navigation,
  Sparkles
} from 'lucide-react';
import { SiteSettings } from '../types';
import { StorageService } from '../services/storage';
import { BRANCHES, Branch } from '../data/branches';

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [activeBranchId, setActiveBranchId] = useState<'eryaman' | 'ostim'>('eryaman');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    selectedBranch: 'Eryaman Şubesi',
    subject: '',
    message: ''
  });
  const [honeypot, setHoneypot] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 3, num2: 4 });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formRenderTime, setFormRenderTime] = useState(Date.now());

  const activeBranch = BRANCHES.find(b => b.id === activeBranchId) || BRANCHES[0];

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';

    let formatted = digits;
    if (!formatted.startsWith('0')) {
      formatted = '0' + formatted;
    }
    formatted = formatted.slice(0, 11);

    if (formatted.length <= 4) return formatted;
    if (formatted.length <= 7) return `${formatted.slice(0, 4)} ${formatted.slice(4)}`;
    if (formatted.length <= 9) return `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`;
    return `${formatted.slice(0, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9, 11)}`;
  };

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setCaptcha({ num1: n1, num2: n2 });
    setCaptchaAnswer('');
    setCaptchaError('');
  };

  useEffect(() => {
    generateCaptcha();
    setFormRenderTime(Date.now());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCaptchaError('');

    // 1. Honeypot check (Bots fill hidden fields)
    if (honeypot.trim() !== '') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
      }, 500);
      return;
    }

    // 2. Submission speed check (Bots submit in < 1.5 seconds)
    if (Date.now() - formRenderTime < 1500) {
      setCaptchaError('Form çok hızlı gönderildi. Lütfen tekrar deneyin.');
      return;
    }

    // 3. Math Captcha verification
    const expected = captcha.num1 + captcha.num2;
    if (parseInt(captchaAnswer.trim(), 10) !== expected) {
      setCaptchaError('Güvenlik işlemi cevabı hatalı. Lütfen işlemi tekrar yapın.');
      generateCaptcha();
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setCaptchaError('Lütfen zorunlu alanları doldurunuz.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const formattedSubject = formData.selectedBranch 
        ? `[${formData.selectedBranch}] ${formData.subject.trim() || 'E-İmza Bilgi Talebi'}`
        : formData.subject.trim() || 'Genel Bilgi Talebi';

      StorageService.addMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formattedSubject,
        message: formData.message.trim()
      });
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        selectedBranch: 'Eryaman Şubesi',
        subject: '',
        message: ''
      });
      generateCaptcha();
      setTimeout(() => setSubmitted(false), 6000);
    }, 600);
  };

  const getBranchMapEmbedUrl = (branch: Branch) => {
    if (branch.mapEmbedUrl) {
      return branch.mapEmbedUrl;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(branch.mapQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  };

  const getBranchMapSearchUrl = (branch: Branch) => {
    if (branch.mapDirectUrl) {
      return branch.mapDirectUrl;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapQuery)}`;
  };

  return (
    <section id="iletisim" className="relative min-h-[calc(100svh-var(--header-total-height,68px))] flex flex-col justify-center py-10 md:py-14 lg:py-16 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200/80 dark:border-zinc-800/80 overflow-hidden">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>2 Ayrı Şubemizle Hizmetinizdeyiz</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Gelin, Şubelerimizde Görüşelim
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Mesai saatleri içinde güvenli e-imza hizmetleri almak veya elden 15 dakikada teslim almak için <strong>Eryaman</strong> veya <strong>Ostim</strong> şubelerimizi ziyaret edebilirsiniz.
          </p>
        </div>

        {/* Top Quick Contact Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-8">
          
          {/* Working Hours */}
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition-all hover:border-amber-300 dark:hover:border-amber-800/60">
            <Clock className="w-20 h-20 text-amber-500/[0.08] dark:text-amber-400/[0.08] group-hover:scale-110 transition-all duration-300 absolute -bottom-3 -right-3 pointer-events-none" />
            <div className="relative z-10">
              <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
                Çalışma Saatleri
              </h4>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {settings.workingHours || '09:00 – 17:00'}
              </div>
              <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block">Hafta İçi Açık</span>
            </div>
          </div>

          {/* Email */}
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition-all hover:border-purple-300 dark:hover:border-purple-800/60">
            <Mail className="w-20 h-20 text-purple-500/[0.08] dark:text-purple-400/[0.08] group-hover:scale-110 transition-all duration-300 absolute -bottom-3 -right-3 pointer-events-none" />
            <div className="relative z-10">
              <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
                Resmi E-Posta
              </h4>
              <a
                href={`mailto:${settings.email}`}
                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition block truncate"
              >
                {settings.email || 'edijitalfinans@gmail.com'}
              </a>
              <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">Teklif & Destek</span>
            </div>
          </div>

          {/* Eryaman Quick Call */}
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition-all hover:border-blue-300 dark:hover:border-blue-800/60">
            <Phone className="w-20 h-20 text-blue-500/[0.08] dark:text-blue-400/[0.08] group-hover:scale-110 transition-all duration-300 absolute -bottom-3 -right-3 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                  Eryaman Şubesi
                </h4>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold">1. Şube</span>
              </div>
              <a
                href="tel:05459603303"
                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition block"
              >
                0545 960 33 03
              </a>
              <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block">Hemen Arayın</span>
            </div>
          </div>

          {/* Ostim Quick Call */}
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition-all hover:border-emerald-300 dark:hover:border-emerald-800/60">
            <Phone className="w-20 h-20 text-emerald-500/[0.08] dark:text-emerald-400/[0.08] group-hover:scale-110 transition-all duration-300 absolute -bottom-3 -right-3 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                  Ostim Şubesi
                </h4>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-bold">2. Şube</span>
              </div>
              <a
                href="tel:05432460655"
                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition block"
              >
                0543 246 06 55
              </a>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5 block">Simanur K. & Cenk G.</span>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: 2 Branches & Interactive Map */}
          <div className="lg:col-span-7 space-y-6">

            {/* Branch Tab Switcher */}
            <div className="p-1.5 bg-slate-200/80 dark:bg-zinc-900 rounded-2xl flex items-center gap-1.5 border border-slate-200 dark:border-zinc-800 shadow-inner">
              {BRANCHES.map((branch) => {
                const isActive = branch.id === activeBranchId;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setActiveBranchId(branch.id)}
                    className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-white shadow-md'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <Building className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span>{branch.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold hidden sm:inline-block ${
                      isActive 
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200' 
                        : 'bg-slate-300/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}>
                      {branch.shortName === 'Eryaman' ? 'Etimesgut' : 'Prestij Plaza'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Branch Detailed Card */}
            <div className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5 transition-all">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                        {activeBranch.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300">
                        {activeBranch.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {activeBranch.district}
                    </p>
                  </div>
                </div>

                <a
                  href={getBranchMapSearchUrl(activeBranch)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Haritada Aç</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>

              {/* Address Detail */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-750 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Şube Adresi
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {activeBranch.address}
                  </div>
                </div>
              </div>

              {/* Branch Contacts (Authorized Representatives) */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2.5">
                  {activeBranch.id === 'ostim' ? 'Şube Yetkilileri & Telefonlar' : 'Şube Telefonu & Destek'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeBranch.contacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 shadow-xs flex items-center justify-between gap-3 group hover:border-blue-400 dark:hover:border-blue-700 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-700/80 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {contact.name || 'Müşteri Temsilcisi'}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-400">
                            {contact.title || 'Şube İletişim'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`tel:${contact.phone}`}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                          title="Telefonla Ara"
                        >
                          <Phone className="w-3 h-3" />
                          <span className="hidden xs:inline">{contact.phoneDisplay}</span>
                          <span className="xs:hidden">Ara</span>
                        </a>

                        {contact.whatsapp && (
                          <a
                            href={`https://wa.me/${contact.whatsapp}?text=Merhaba%20${encodeURIComponent(contact.name || '')},%20${encodeURIComponent(activeBranch.name)}%20e-imza%20hakkinda%20bilgi%20almak%20istiyorum.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-xs"
                            title="WhatsApp Mesajı Gönder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Branch Map Frame */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{activeBranch.name} Canlı Konumu</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {activeBranch.shortName === 'Eryaman' ? 'Eryaman 1.TBMM Cad.' : 'Ostim Prestij Plaza A Blok'}
                  </span>
                </div>

                <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 shadow-inner relative">
                  <iframe
                    key={activeBranch.id}
                    title={`${activeBranch.name} Harita Konumu`}
                    src={getBranchMapEmbedUrl(activeBranch)}
                    className="w-full h-full border-0 grayscale-[5%]"
                    loading="lazy"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>


            </div>

          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs h-full flex flex-col justify-between">

              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Hızlı İletişim & Fiyat Teklifi</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Bize Mesaj Gönderin</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  E-İmza paketleri, randevu veya yerinde teslimat hakkında sormak istediklerinizi yazın, müşteri temsilcimiz hemen dönüş yapsın.
                </p>
              </div>

              {submitted ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto font-bold shadow-sm">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">Mesajınız İletildi!</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      Talebiniz ilgili şube temsilcimize iletildi. En kısa süre içinde telefon veya e-posta yoluyla sizinle iletişime geçeceğiz.
                    </p>
                  </div>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 transition cursor-pointer"
                    >
                      Yeni Mesaj Gönder
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Adınız Soyadınız *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Ahmet Yılmaz"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Telefon Numaranız *
                      </label>
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        maxLength={14}
                        placeholder="0545 960 33 03"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Branch / Service Preference */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      İlgilendiğiniz Şube / Teslimat Şekli
                    </label>
                    <select
                      value={formData.selectedBranch}
                      onChange={(e) => setFormData({ ...formData, selectedBranch: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Eryaman Şubesi">Eryaman Şubesi (1. TBMM Caddesi No:59/4)</option>
                      <option value="Ostim Şubesi">Ostim Şubesi (Prestij Plaza A Blok Kat:2)</option>
                      <option value="Adrese Teslimat & Yerinde Kurulum">Ankara Adrese Teslimat & Yerinde Kurulum</option>
                      <option value="Genel Bilgi">Genel Bilgi & Fiyat Danışma</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        E-Posta Adresiniz
                      </label>
                      <input
                        type="email"
                        placeholder="ahmet@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Konu
                      </label>
                      <input
                        type="text"
                        placeholder="E-İmza Fiyat / Randevu"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Mesajınız *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Size nasıl yardımcı olabiliriz? İhtiyacınızı veya teslimat tercihinizi belirtin..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    ></textarea>
                  </div>

                  {/* Honeypot Trap Input (Hidden from humans) */}
                  <div className="hidden" aria-hidden="true" style={{ display: 'none', position: 'absolute', left: '-9999px' }}>
                    <label htmlFor="website_url_hp">Website</label>
                    <input
                      id="website_url_hp"
                      type="text"
                      name="website_url"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* Anti-Bot Security Verification (Math Captcha) */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block leading-tight">
                          Güvenlik Doğrulaması
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Spam ve bot koruması
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 font-mono font-bold text-xs text-slate-900 dark:text-white select-none tracking-wider">
                        {captcha.num1} + {captcha.num2} = ?
                      </span>
                      <input
                        type="number"
                        required
                        placeholder="Sonuç"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        className="w-20 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-center text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition cursor-pointer"
                        title="Yeni Soru Üret"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Captcha Error Alert */}
                  {captchaError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{captchaError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-[0.99]"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Mesajı Gönder</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
