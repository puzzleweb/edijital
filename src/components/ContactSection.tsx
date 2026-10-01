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
  AlertCircle
} from 'lucide-react';
import { SiteSettings } from '../types';
import { StorageService } from '../services/storage';

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
      StorageService.addMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim() || 'Genel Bilgi Talebi',
        message: formData.message.trim()
      });
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      generateCaptcha();
      setTimeout(() => setSubmitted(false), 6000);
    }, 600);
  };

  const getMapEmbedUrl = () => {
    if (settings.mapEmbedUrl && settings.mapEmbedUrl.trim()) {
      const raw = settings.mapEmbedUrl.trim();
      const match = raw.match(/src=["']([^"']+)["']/);
      return match && match[1] ? match[1] : raw;
    }

    const targetQuery = settings.mapLocationQuery && settings.mapLocationQuery.trim()
      ? settings.mapLocationQuery.trim()
      : '39.969709, 32.744914';

    return `https://maps.google.com/maps?q=${encodeURIComponent(targetQuery)}&t=&z=17&ie=UTF8&iwloc=&output=embed`;
  };

  const getMapSearchUrl = () => {
    const targetQuery = settings.mapLocationQuery && settings.mapLocationQuery.trim()
      ? settings.mapLocationQuery.trim()
      : '39.969709, 32.744914';

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetQuery)}`;
  };

  return (
    <section id="iletisim" className="relative min-h-[calc(100svh-var(--header-total-height,68px))] flex flex-col justify-center py-10 md:py-14 lg:py-16 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200/80 dark:border-zinc-800/80 overflow-hidden">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 md:mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 block">
            İletişim & Lokasyon
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2.5">
            Gelin, Ofis & Mağazamızda Görüşelim
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-zinc-400">
            Mesai saatleri içinde güvenli e-imza hizmetleri ve fiyatları hakkında bilgi almak veya yüz yüze başvurmak için bizi dilediğiniz zaman ziyaret edebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Left: Office Info & Map */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Phone */}
              <div className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition-all hover:border-blue-300 dark:hover:border-blue-800/60">
                <Phone className="w-24 h-24 text-blue-500/[0.08] dark:text-blue-400/[0.08] group-hover:text-blue-500/[0.15] dark:group-hover:text-blue-400/[0.15] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 absolute -bottom-4 -right-4 pointer-events-none" />
                <div className="relative z-10">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
                    Telefon & Destek
                  </h4>
                  <a
                    href={`tel:${settings.phone}`}
                    className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 transition block"
                  >
                    {settings.phoneDisplay}
                  </a>
                  <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Hemen Arayabilirsiniz</span>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition-all hover:border-emerald-300 dark:hover:border-emerald-800/60">
                <MessageSquare className="w-24 h-24 text-emerald-500/[0.08] dark:text-emerald-400/[0.08] group-hover:text-emerald-500/[0.15] dark:group-hover:text-emerald-400/[0.15] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 absolute -bottom-4 -right-4 pointer-events-none" />
                <div className="relative z-10">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
                    WhatsApp Danışma
                  </h4>
                  <a
                    href={`https://wa.me/${settings.whatsapp}?text=Merhaba,%20e-imza%20hakkinda%20bilgi%20almak%20istiyorum.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition block"
                  >
                    WhatsApp Mesajı Yaz
                  </a>
                  <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Anında Yanıt</span>
                </div>
              </div>

              {/* Email */}
              <div className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition-all hover:border-purple-300 dark:hover:border-purple-800/60">
                <Mail className="w-24 h-24 text-purple-500/[0.08] dark:text-purple-400/[0.08] group-hover:text-purple-500/[0.15] dark:group-hover:text-purple-400/[0.15] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 absolute -bottom-4 -right-4 pointer-events-none" />
                <div className="relative z-10">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
                    Resmi E-Posta
                  </h4>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 transition block truncate"
                  >
                    {settings.email}
                  </a>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Teklif & Fatura Talepleri</span>
                </div>
              </div>

              {/* Working Hours */}
              <div className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs group transition-all hover:border-amber-300 dark:hover:border-amber-800/60">
                <Clock className="w-24 h-24 text-amber-500/[0.08] dark:text-amber-400/[0.08] group-hover:text-amber-500/[0.15] dark:group-hover:text-amber-400/[0.15] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 absolute -bottom-4 -right-4 pointer-events-none" />
                <div className="relative z-10">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
                    Çalışma Saatleri
                  </h4>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {settings.workingHours}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Hafta İçi Açık</span>
                </div>
              </div>

            </div>

            {/* Address Card & Map */}
            <div className="rounded-2xl p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{settings.companyName} Ofis & Mağaza</h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                      {settings.address}, {settings.addressDetail}
                    </p>
                  </div>
                </div>

                <a
                  href={getMapSearchUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 flex items-center gap-1 transition shrink-0"
                >
                  <span>Haritada Aç</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Map Frame */}
              <div className="w-full h-52 sm:h-56 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800">
                <iframe
                  title={`${settings.companyName} Konum`}
                  src={getMapEmbedUrl()}
                  className="w-full h-full border-0 grayscale-[10%]"
                  loading="lazy"
                ></iframe>
              </div>
            </div>

          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-6 flex flex-col h-full">
            <div className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs h-full flex flex-col justify-between">

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Bize Mesaj Gönderin</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  E-İmza paketleri, fiyatlar veya randevu hakkında sormak istediklerinizi yazın, müşteri temsilcimiz hemen dönüş yapsın.
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
                      Talebiniz müşteri temsilcimize ulaştı. En kısa süre içinde telefon veya e-posta yoluyla sizinle iletişime geçeceğiz.
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
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                    </div>
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
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Mesajınız *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Size nasıl yardımcı olabiliriz? İhtiyacınızı veya teslimat tercihinizi belirtin..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
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
                          Spam ve otomatik bot koruması
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
                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
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
