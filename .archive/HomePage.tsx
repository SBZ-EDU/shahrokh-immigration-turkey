import React from 'react';
import { useLanguage, Page } from '../types';
import { useToast } from './Toast';

interface HomePageProps {
    setPage: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
  const { t } = useLanguage();
  const { addToast } = useToast();

  const services = [
    {
      key: 'eligibility_assessment',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      ...t('hero.services.assessment')
    },
    {
      key: 'destination_visualizer',
      icon: <svg xmlns="http://www.w.3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
      ...t('hero.services.visualizer')
    },
    {
      key: 'pathway_analyzer',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      ...t('hero.services.eligibility')
    },
    {
      key: 'office_finder',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      ...t('hero.services.finder')
    },
    {
      key: 'ai_consultant',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
      ...t('hero.services.ai_consultant')
    },
    {
      key: 'student',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12v7l11 6 11-6v-7" /></svg>,
      ...t('hero.services.student')
    },
    {
      key: 'work',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      ...t('hero.services.work')
    },
    {
      key: 'investment',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      ...t('hero.services.investment')
    },
    {
      key: 'sponsorship',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      ...t('hero.services.sponsorship')
    }
  ];

  const existingPages: Page[] = ['eligibility_assessment', 'destination_visualizer', 'pathway_analyzer', 'office_finder', 'ai_consultant'];

  const handleServiceClick = (key: string) => {
    window.scrollTo(0,0);
    if (existingPages.includes(key as Page)) {
      setPage(key as Page);
    } else {
      addToast(t('toast.comingSoon'), 'info');
    }
  };

  return (
    <div className="animate-fade-in bg-gray-900 text-white">
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
          src="https://cdn.pixabay.com/video/2023/06/23/168750-840286043_large.mp4"
          poster="https://cdn.pixabay.com/photo/2017/08/30/17/23/fantasy-2697968_1280.jpg"
        />
        <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
        <div className="z-20 p-4 space-y-6">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight"
            dangerouslySetInnerHTML={{ __html: t('hero.title') }}
          />
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">{t('hero.subtitle')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button onClick={() => setPage('eligibility_assessment')} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-all text-lg shadow-lg transform duration-300 hover:scale-105 hover:-translate-y-1">
                {t('hero.button1')}
              </button>
              <a href="#services" className="px-8 py-3 bg-gray-700/50 border border-gray-500 text-white font-semibold rounded-md hover:bg-gray-700 transition-all text-lg transform duration-300 hover:scale-105 hover:-translate-y-1">
                {t('hero.button2')}
              </a>
          </div>
        </div>
      </section>
      
      <section id="services" className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {t('hero.servicesTitle')}
                </h2>
            </div>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service) => (
                    <div
                        key={service.key}
                        onClick={() => handleServiceClick(service.key)}
                        className="bg-gray-800/50 border border-white/10 rounded-lg p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:bg-gray-800/80 hover:border-blue-400/50"
                    >
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-900/50 text-blue-400 mx-auto mb-6">
                            {service.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white">{service.title}</h3>
                        <p className="mt-2 text-sm text-gray-400">{service.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;