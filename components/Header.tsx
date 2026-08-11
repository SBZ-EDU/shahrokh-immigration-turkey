import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Page } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SiteHeaderProps {
    currentPage: Page;
    setPage: (page: Page) => void;
    isAuthenticated: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ currentPage, setPage, isAuthenticated, onLoginClick, onLogoutClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) setIsLangMenuOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setIsMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  
  const go = (page: Page) => { setPage(page); setIsMobileMenuOpen(false); setIsMoreOpen(false); window.scrollTo(0, 0); }
  
  // Primary — only 5 items visible on desktop (standard)
  const primary = [
    { key: 'home' as Page, text: t('header.home') },
    { key: 'turkey_4x' as Page, text: 'شاهرخ' },
    { key: 'eligibility_assessment' as Page, text: t('header.eligibilityAssessment') },
    { key: 'our_consultants' as Page, text: t('header.ourConsultants') },
    { key: 'ai_consultant' as Page, text: t('header.aiConsultant') },
  ];
  // More — rest in dropdown (so desktop not huge)
  const more = [
    { key: 'immigration_dashboard' as Page, text: t('header.immigrationDashboard') },
    { key: 'destination_visualizer' as Page, text: t('header.destinationVisualizer') },
    { key: 'office_finder' as Page, text: t('header.officeFinder') },
    { key: 'pathway_analyzer' as Page, text: t('header.pathwayAnalyzer') },
    { key: 'immigration_news' as Page, text: t('header.immigrationNews') },
    { key: 'investor' as Page, text: t('header.humanitarianAid') },
    { key: 'user_panel' as Page, text: 'پنل کاربری' },
    { key: 'admin' as Page, text: 'ادمین' },
    { key: 'my_applications' as Page, text: t('header.myApplications') },
  ];

  const allForMobile = [...primary, ...more];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — compact */}
          <button onClick={() => go('home')} className="flex items-center gap-2 shrink-0">
            <img src="/shahrokh-logo.png" alt="Shahrokh" className="h-8 w-8 rounded-full border border-gray-200 hidden sm:block" />
            <span className="font-black text-gray-900 text-lg">شاهرخ</span>
            <span className="hidden sm:inline text-xs bg-gray-900 text-white px-1.5 py-0.5 rounded-full">SR</span>
          </button>

          {/* Desktop — primary only (5) + More */}
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {primary.map(l => (
              <button key={l.key} onClick={() => go(l.key)} className={`px-3 py-2 rounded-full text-sm font-medium transition ${currentPage===l.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                {l.text}
              </button>
            ))}
            <div className="relative" ref={moreRef}>
              <button onClick={() => setIsMoreOpen(!isMoreOpen)} aria-expanded={isMoreOpen} aria-haspopup="true" className="px-3 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-1">
                بیشتر <span className={`transition ${isMoreOpen?'rotate-180':''}`}>▾</span>
              </button>
              {isMoreOpen && (
                <div className="absolute top-full mt-2 right-0 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-20">
                  {more.map(l => (
                    <button key={l.key} onClick={() => go(l.key)} className={`w-full text-right px-4 py-2 text-sm hover:bg-gray-50 ${currentPage===l.key?'bg-gray-900 text-white':''}`}>
                      {l.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Actions — compact */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={langMenuRef}>
              <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} aria-expanded={isLangMenuOpen} aria-haspopup="true" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-full hover:bg-gray-100">
                <span className="text-sm">🌐</span>
                <span className="text-xs font-bold">{language==='fa'?'FA':language==='ar'?'AR':language==='tr'?'TR':language==='pt'?'PT':'EN'}</span>
              </button>
              {isLangMenuOpen && (
                <div className={`absolute mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-20 ${(language==='fa'||language==='ar')?'left-0':'right-0'}`}>
                  <button onClick={() => { setLanguage('fa'); setIsLangMenuOpen(false); }} className="block w-full text-right px-4 py-2 text-sm hover:bg-gray-50">🇮🇷 فارسی</button>
                  <button onClick={() => { setLanguage('tr'); setIsLangMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">🇹🇷 Türkçe</button>
                  <button onClick={() => { setLanguage('ar'); setIsLangMenuOpen(false); }} className="block w-full text-right px-4 py-2 text-sm hover:bg-gray-50">🇸🇦 العربية</button>
                  <button onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">🇬🇧 English</button>
                </div>
              )}
            </div>

            <a href="https://t.me/shahrokh_imigration_bot" target="_blank" className="hidden sm:inline-flex bg-[#2AABEE] text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-[#229ED9]">تلگرام</a>

            {isAuthenticated ? (
              <button onClick={onLogoutClick} className="hidden sm:flex w-8 h-8 rounded-full bg-gray-900 text-white items-center justify-center text-sm">•</button>
            ) : (
              <button onClick={onLoginClick} className="hidden sm:inline-flex bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-black">{t('header.login')}</button>
            )}

            {/* Mobile hamburger — only on <lg */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-expanded={isMobileMenuOpen} aria-controls="mobile-menu" className="lg:hidden p-2 rounded-full bg-gray-100 text-gray-600">
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile — full list, but compact */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white max-h-[70vh] overflow-y-auto">
          <div className="px-4 py-3 grid grid-cols-2 gap-2">
            {allForMobile.map(l => (
              <button key={l.key} onClick={() => go(l.key)} className={`text-right px-3 py-2 rounded-xl text-sm border ${currentPage===l.key?'bg-gray-900 text-white border-gray-900':'bg-gray-50 border-gray-100 text-gray-700'}`}>
                {l.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
