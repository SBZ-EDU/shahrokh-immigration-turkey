import React from 'react';
import { useLanguage, ErrorLog } from '../types';

interface SystemLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ErrorLog[];
  onClear: () => void;
}

const SystemLogsModal: React.FC<SystemLogsModalProps> = ({ isOpen, onClose, logs, onClear }) => {
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 border border-gray-700 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-5 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-semibold leading-6 text-white">{t('logsModal.title')}</h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClear}
              className="px-3 py-1.5 bg-red-800/70 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={logs.length === 0}
            >
              {t('logsModal.clear')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              aria-label="Close"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </header>
        
        <div className="p-6 overflow-y-auto">
            {logs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="mt-2 text-lg font-medium text-gray-300">{t('logsModal.emptyTitle')}</h4>
                    <p className="mt-1 text-sm text-gray-500">{t('logsModal.emptyText')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {logs.map(log => (
                        <details key={log.id} className="bg-gray-900/50 p-4 rounded-lg border border-white/10">
                            <summary className="cursor-pointer font-semibold text-white flex justify-between items-center list-none">
                                <div className="truncate pr-4 flex-grow">
                                    <span className="text-red-400 font-mono text-sm mr-3">[{new Date(log.timestamp).toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US')}]</span>
                                    <span>{log.message}</span>
                                </div>
                                <span className="text-xs text-gray-400 flex-shrink-0">{t('logsModal.viewDetails')}</span>
                            </summary>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                                    {log.details}
                                </pre>
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SystemLogsModal;
