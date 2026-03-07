'use client';

import { useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { Theme } from '../lib/types';

export type AlertType = 'success' | 'warning' | 'info' | 'reminder';

export interface AlertData {
  id: string;
  type: AlertType;
  message: string;
}

interface Props {
  alert: AlertData | null;
  onClose: () => void;
  activeTheme: Theme;
}

export default function AmeliaAlert({ alert, onClose, activeTheme }: Props) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert, onClose]);

  if (!alert) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    warning: <AlertTriangle size={18} className="text-amber-500" />,
    info: <Info size={18} className="text-blue-500" />,
    reminder: <Bell size={18} style={{ color: activeTheme.primary }} className="animate-pulse" />
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-100 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-[#1E1F22]/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg dark:shadow-black/50 rounded-full animate-in slide-in-from-top-10 fade-in duration-500 ease-out max-w-md w-full sm:w-auto">
        
        <div className="shrink-0 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-full shadow-inner">
          {icons[alert.type]}
        </div>
        
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 flex-1 truncate pr-2">
          {alert.message}
        </p>

        <button 
          onClick={onClose} 
          className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-gray-100 dark:bg-gray-800 rounded-full"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}