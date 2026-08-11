import React from 'react';
import { useLanguage, SiteHealth } from '../types';

interface SiteFooterProps {
    siteHealth: SiteHealth;
    onStatusClick: () => void;
}

const SiteFooter: React.FC<SiteFooterProps> = ({ siteHealth, onStatusClick }) => {
    const { t } = useLanguage();

     const healthStatus = {
        healthy: {
            color: 'bg-green-500',
            text: t('healthCheck.healthy'),
        },
        degraded: {
            color: 'bg-yellow-500',
            text: t('healthCheck.degraded'),
        },
        error: {
            color: 'bg-red-500',
            text: t('healthCheck.error'),
        },
    };

    return (
        <footer id="footer" className="bg-black/20 backdrop-blur-sm text-gray-400 border-t border-white/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start space-x-2 rtl:space-x-reverse">
                           <svg className="h-8 w-8 text-rose-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 2a.75.75 0 01.75.75v.255a.25.25 0 00.5 0V2.75A.75.75 0 0112 2h.25a.25.25 0 000-.5H12a.75.75 0 01-.75-.75V.5a.25.25 0 00-.5 0v.25A.75.75 0 0110 2zM8 4.25a.25.25 0 00-.5 0V5a.75.75 0 01-1.5 0V4.25a.25.25 0 00-.5 0V5A.75.75 0 014 5h-.25a.25.25 0 000 .5H4A.75.75 0 014.75 6v.25a.25.25 0 00.5 0V6A.75.75 0 016 5.25h.25a.25.25 0 000-.5H6A.75.75 0 015.25 4V3.75a.25.25 0 00-.5 0V4c0 .414.336.75.75.75h.5a.75.75 0 01.75-.75V3.75a.25.25 0 00-.5 0v.5zM12.25 6a.25.25 0 00.5 0V5.75A.75.75 0 0114 5h.25a.25.25 0 000-.5H14a.75.75 0 01-.75-.75V3.5a.25.25 0 00-.5 0v.25A.75.75 0 0112 4.5h-.25a.25.25 0 000 .5h.25A.75.75 0 0112.75 6z" />
                              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V10zm1.5 0V8.75a.75.75 0 00-1.5 0V10a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 000-1.5H6a.75.75 0 000 1.5h.75zm1.5 0a.75.75 0 000-1.5h-.01a.75.75 0 000 1.5h.01zM10 8.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm1.5.75a.75.75 0 00-.75-.75h-.01a.75.75 0 000 1.5h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zM15.25 10a.75.75 0 00-1.5 0v.01a.75.75 0 001.5 0V10zM3 15a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-.01zm1.5 0V13.75a.75.75 0 00-1.5 0V15a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 000-1.5H6a.75.75 0 000 1.5h.75zm1.5 0a.75.75 0 000-1.5h-.01a.75.75 0 000 1.5h.01zM10 13.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm1.5.75a.75.75 0 00-.75-.75h-.01a.75.75 0 000 1.5h.01a.75.75 0 00.75-.75zm1.5.75a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zm2.25.75a.75.75 0 000-1.5h-.01a.75.75 0 000 1.5h.01z" clipRule="evenodd" />
                           </svg>
                            <span className="font-bold text-xl text-white">گروه مهاجرتی <span class="text-cyan-400">شاهرخ</span></span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm mx-auto md:mx-0">{t('footer.description')}</p>
                    </div>
                    <div className="md:col-start-2 text-center md:text-right">
                        <div className="flex items-center justify-center md:justify-end gap-3 mb-3">
                            <a href="https://t.me/shahrokh_imigration_bot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-[#2AABEE] hover:bg-[#229ED9] text-white px-3 py-1.5 rounded-full text-xs font-bold transition">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm3.721 5.26-1.136 5.364s-.106.48-.394.567c-.288.086-1.13-.345-1.716-.63l-2.07-1.34s-.205-.13-.295-.205c-.09-.074-.228-.226-.168-.4.06-.174.38-.253.38-.253l5.42-2.1s.303-.13.38.074c.077.205-.08.307-.08.307z"/></svg>
                              تلگرام شاهرخ
                            </a>
                            <button onClick={onStatusClick} title={t('healthCheck.tooltip')} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                                <span className="relative flex h-3 w-3">
                                    <span className={`absolute inline-flex h-full w-full rounded-full ${healthStatus[siteHealth].color} opacity-75 ${siteHealth !== 'healthy' ? 'animate-ping' : ''}`}></span>
                                    <span className={`relative inline-flex rounded-full h-3 w-3 ${healthStatus[siteHealth].color}`}></span>
                                </span>
                                <span>{healthStatus[siteHealth].text}</span>
                            </button>
                        </div>
                         <p className="text-xs">{t('footer.copyright')}</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default SiteFooter;