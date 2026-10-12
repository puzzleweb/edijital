import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, 
  FileText, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  Eye, 
  Code, 
  CheckCircle2, 
  Sparkles, 
  Bold, 
  Italic, 
  Underline, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  AlertTriangle,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { SiteSettings } from '../types';
import { StorageService } from '../services/storage';
import { LegalDocSlug } from '../pages/LegalPage';
import { DEFAULT_LEGAL_DOCS_DATA, interpolateLegalPlaceholders } from '../data/defaultLegalDocs';

const DOC_KEYS: LegalDocSlug[] = [
  'mesafeli-satis-sozlesmesi',
  'on-bilgilendirme-formu',
  'kvkk-aydinlatma-metni',
  'gizlilik-politikasi',
  'iptal-ve-iade-kosullari',
  'kullanim-kosullari'
];

export const AdminLegalDocs: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(() => StorageService.getSettings());
  const [activeSlug, setActiveSlug] = useState<LegalDocSlug>('mesafeli-satis-sozlesmesi');
  const [editMode, setEditMode] = useState<'visual' | 'code' | 'preview'>('visual');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const defaultMeta = DEFAULT_LEGAL_DOCS_DATA[activeSlug];
  const customDoc = settings.legalDocuments?.[activeSlug];

  // Form states for active contract
  const [title, setTitle] = useState(customDoc?.title || defaultMeta.title);
  const [badge, setBadge] = useState(customDoc?.badge || defaultMeta.badge);
  const [description, setDescription] = useState(customDoc?.description || defaultMeta.description);
  const [contentHtml, setContentHtml] = useState(customDoc?.contentHtml || defaultMeta.defaultHtml);

  const editorRef = useRef<HTMLDivElement>(null);

  // Sync state when active slug or settings change
  useEffect(() => {
    const dMeta = DEFAULT_LEGAL_DOCS_DATA[activeSlug];
    const cDoc = settings.legalDocuments?.[activeSlug];

    setTitle(cDoc?.title || dMeta.title);
    setBadge(cDoc?.badge || dMeta.badge);
    setDescription(cDoc?.description || dMeta.description);
    setContentHtml(cDoc?.contentHtml || dMeta.defaultHtml);

    if (editorRef.current && editMode === 'visual') {
      editorRef.current.innerHTML = cDoc?.contentHtml || dMeta.defaultHtml;
    }
  }, [activeSlug, settings.legalDocuments]);

  // Sync content from contentEditable on input
  const handleEditorInput = () => {
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, value: string = '') => {
    if (editMode !== 'visual') return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
    }
  };

  const insertHtmlAtCursor = (htmlToInsert: string) => {
    if (editMode === 'code') {
      setContentHtml(prev => prev + '\n' + htmlToInsert);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, htmlToInsert);
      setContentHtml(editorRef.current.innerHTML);
    }
  };

  const handleInsertVariable = (variableKey: string) => {
    insertHtmlAtCursor(`{{${variableKey}}}`);
    setCopiedVar(variableKey);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const handleSave = () => {
    const updatedLegalDocs = {
      ...(settings.legalDocuments || {}),
      [activeSlug]: {
        title,
        badge,
        description,
        contentHtml,
        updatedAt: new Date().toISOString()
      }
    };

    const newSettings = {
      ...settings,
      legalDocuments: updatedLegalDocs
    };

    StorageService.updateSettings(newSettings);
    setSettings(newSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    if (window.confirm(`"${defaultMeta.title}" sözleşmesini varsayılan banka/yasal standart şablonuna sıfırlamak istediğinizden emin misiniz?`)) {
      setTitle(defaultMeta.title);
      setBadge(defaultMeta.badge);
      setDescription(defaultMeta.description);
      setContentHtml(defaultMeta.defaultHtml);

      if (editorRef.current) {
        editorRef.current.innerHTML = defaultMeta.defaultHtml;
      }

      const updatedLegalDocs = { ...(settings.legalDocuments || {}) };
      delete updatedLegalDocs[activeSlug];

      const newSettings = {
        ...settings,
        legalDocuments: updatedLegalDocs
      };

      StorageService.updateSettings(newSettings);
      setSettings(newSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Sanal POS & BDDK Uyumlu Yasal Yönetim</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            Yasal Bilgilendirme & Sözleşmeler Yönetimi
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Her sözleşmeyi HTML editör ile özelleştirin, firma bilgilerinizi dinamik etiketlerle bağlayın.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={`/${activeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
          >
            <span>Canlı Sayfayı Aç</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </a>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Kaydet & Yayınla</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sözleşme başarıyla güncellendi ve sitede yayınlandı!</span>
          </div>
          <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">Bulut senkronizasyonu aktif</span>
        </div>
      )}

      {/* Contract Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {DOC_KEYS.map((slug) => {
          const item = DEFAULT_LEGAL_DOCS_DATA[slug];
          const isSelected = activeSlug === slug;
          const isCustom = !!settings.legalDocuments?.[slug];

          return (
            <button
              key={slug}
              onClick={() => setActiveSlug(slug)}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold block mb-1 uppercase tracking-wider ${isSelected ? 'text-blue-100' : 'text-zinc-400'}`}>
                  {item.shortTitle}
                </span>
                <span className="text-xs font-bold leading-snug line-clamp-2">
                  {item.title}
                </span>
              </div>
              
              <div className="mt-2.5 flex items-center justify-between text-[10px]">
                <span className={`px-2 py-0.5 rounded-md font-mono ${
                  isSelected ? 'bg-blue-700/60 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                }`}>
                  /{slug}
                </span>
                {isCustom && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} title="Özelleştirilmiş" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Document Settings Form & Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Metadata & Variables (Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Metadata Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              Sayfa & Başlık Bilgileri
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Sözleşme Başlığı
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Rozet / Kategori Etiketi
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Kısa Açıklama (Alt Başlık)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                <span>Kalıcı URL:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">/{activeSlug}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Placeholder Variables Helper */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Dinamik Değişkenler</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Metninize ekleyeceğiniz bu etiketler, site ayarlarınız değiştikçe otomatik olarak güncellenir:
            </p>

            <div className="space-y-1.5">
              {[
                { key: 'companyName', label: 'Şirket Ünvanı', val: settings.companyName },
                { key: 'officialPartner', label: 'Yetkili Ortaklık', val: settings.officialPartner },
                { key: 'phoneDisplay', label: 'Telefon', val: settings.phoneDisplay || settings.phone },
                { key: 'email', label: 'E-Posta', val: settings.email },
                { key: 'address', label: 'Adres', val: settings.address },
                { key: 'district', label: 'İlçe', val: settings.district },
                { key: 'city', label: 'İl', val: settings.city },
                { key: 'website', label: 'Web Sitesi', val: 'www.edijitalfinans.com' }
              ].map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => handleInsertVariable(v.key)}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-zinc-200/70 dark:border-zinc-700/70 text-left transition cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 block truncate">
                      {`{{${v.key}}}`}
                    </span>
                    <span className="text-[10px] text-zinc-400 block truncate">
                      {v.label}: {v.val || '-'}
                    </span>
                  </div>
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold group-hover:bg-blue-600 group-hover:text-white transition">
                    {copiedVar === v.key ? 'Eklendi!' : '+ Ekle'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Action */}
          <button
            type="button"
            onClick={handleResetToDefault}
            className="w-full py-2.5 px-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/40 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılan Yasal Şablona Sıfırla</span>
          </button>

        </div>

        {/* Right Column: HTML Editor & Live Preview (Span 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            
            {/* Toolbar & View Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              
              {/* Visual Toolbar Buttons */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => executeCommand('bold')}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  title="Kalın (Bold)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('italic')}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  title="İtalik"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('underline')}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  title="Altı Çizili"
                >
                  <Underline className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

                <button
                  type="button"
                  onClick={() => executeCommand('formatBlock', '<h2>')}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition cursor-pointer"
                  title="Madde Başlığı (H2)"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('formatBlock', '<h3>')}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition cursor-pointer"
                  title="Alt Başlık (H3)"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('formatBlock', '<p>')}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs transition cursor-pointer"
                  title="Paragraf"
                >
                  P
                </button>

                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

                <button
                  type="button"
                  onClick={() => executeCommand('insertUnorderedList')}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  title="Madde İşaretli Liste"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('insertOrderedList')}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  title="Numaralı Liste"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

                <button
                  type="button"
                  onClick={() => insertHtmlAtCursor('<div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 my-4"><strong>Önemli Yasal Uyarı:</strong> Metninizi buraya yazınız.</div>')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer"
                  title="Vurgu / Uyarı Kutusu Ekle"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Uyarı Kutusu</span>
                </button>
              </div>

              {/* Mode Switcher Tabs (Visual / HTML Code / Live Preview) */}
              <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setEditMode('visual')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    editMode === 'visual'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Görsel Editör
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editorRef.current && editMode === 'visual') {
                      setContentHtml(editorRef.current.innerHTML);
                    }
                    setEditMode('code');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    editMode === 'code'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>HTML Kodu</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editorRef.current && editMode === 'visual') {
                      setContentHtml(editorRef.current.innerHTML);
                    }
                    setEditMode('preview');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    editMode === 'preview'
                      ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Önizleme</span>
                </button>
              </div>

            </div>

            {/* 1. Visual WYSIWYG Editor View */}
            {editMode === 'visual' && (
              <div className="space-y-2">
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                  className="min-h-[480px] max-h-[700px] overflow-y-auto p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 prose dark:prose-invert max-w-none space-y-4 font-sans"
                />
                <p className="text-[11px] text-zinc-400">
                  İpucu: Metin üzerinde doğrudan seçim yaparak yukarıdaki araç çubuğu ile başlık veya biçimlendirme uygulayabilirsiniz.
                </p>
              </div>
            )}

            {/* 2. Raw HTML Code Editor View */}
            {editMode === 'code' && (
              <div className="space-y-2">
                <textarea
                  rows={20}
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-950 text-emerald-400 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                  placeholder="<section>...</section>"
                />
                <p className="text-[11px] text-zinc-400 font-mono">
                  Doğrudan geçerli HTML etiketleri (&lt;section&gt;, &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;) yazabilirsiniz.
                </p>
              </div>
            )}

            {/* 3. Live Customer Preview View */}
            {editMode === 'preview' && (
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-4">
                <div className="pb-4 border-b border-slate-200 dark:border-zinc-800">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 mb-2">
                    {badge}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    {description}
                  </p>
                </div>

                <div 
                  className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: interpolateLegalPlaceholders(contentHtml, settings)
                  }}
                />
              </div>
            )}

            {/* Bottom Save Action Bar */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                {customDoc?.updatedAt ? `Son Kayıt: ${new Date(customDoc.updatedAt).toLocaleString('tr-TR')}` : 'Varsayılan Şablon Yüklü'}
              </span>

              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Değişiklikleri Kaydet</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
