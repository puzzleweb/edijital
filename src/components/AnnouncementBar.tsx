import React from 'react';
import { Sparkles, Phone, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface AnnouncementBarProps {
  settings: SiteSettings;
  onOpenApply: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ settings, onOpenApply }) => {
  if (!settings.announcementActive) return null;

  return (
    <div className="hidden md:block bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-blue-900/90 text-white text-xs sm:text-sm py-2 px-4 border-b border-blue-500/20 backdrop-blur-md relative z-40 transition-all">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="font-medium text-blue-200 hidden sm:inline">Hemen Teslim:</span>
          <span className="text-gray-200 text-xs sm:text-sm truncate">{settings.announcementText}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`tel:${settings.phone}`}
            className="hidden md:flex items-center gap-1.5 text-blue-300 hover:text-white transition font-medium text-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{settings.phoneDisplay}</span>
          </a>
          <button
            onClick={onOpenApply}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm transition active:scale-95"
          >
            <span>Hızlı Başvur</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
