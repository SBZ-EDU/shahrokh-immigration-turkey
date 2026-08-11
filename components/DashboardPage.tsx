
import React, { useState } from 'react';
// FIX: Changed non-existent DailyBriefing type to the correct ImmigrationBriefing type.
import { useLanguage, ImmigrationBriefing, Page } from '../types';

interface DailyDashboardPageProps {
  // FIX: Use the correct briefing type.
  briefing: ImmigrationBriefing | null;
  isLoading: boolean;
  onRefresh: () => void;
  setPage: (page: Page) => void;
}

const DailyDashboardPage: React.FC<DailyDashboardPageProps> = ({ briefing, isLoading, onRefresh, setPage }) => {
  const { t } = useLanguage();
  const [revealedAnswer, setRevealedAnswer] = useState(false);

  const Card: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    action?: { label: string; onClick: () => void; };
  }> = ({ title, icon, children, className, action }) => (
    <div className={`bg-gray-800/50 border border-white/10 rounded-xl p-6 shadow-2xl backdrop-blur-sm h-full flex flex-col ${className}`}>
      <div className="flex items-center mb-4">
        <span className="text-blue-400 text-3xl mr-4">{icon}</span>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="flex-grow text-gray-300 text-sm leading-relaxed">
        {children}
      </div>
      {action && (
        <div className="mt-4 pt-4 border-t border-white/15 text-right">
            <button onClick={action.onClick} className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                {action.label} &rarr;
            </button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-in">
          <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>
              <p className="mt-4 text-gray-300 text-lg">{t('dailyDashboard.loading')}</p>
          </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 animate-fade-in">
      <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <div className="text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{t('dailyDashboard.title')}</h1>
          <p className="mt-2 text-lg text-gray-400">{t('dailyDashboard.subtitle')}</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-500 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5" /></svg>
          {isLoading ? t('dailyDashboard.refreshing') : t('dailyDashboard.refresh')}
        </button>
      </div>

      {!briefing ? (
          <div className="text-center py-20 bg-gray-800/20 rounded-lg">
            <p className="text-gray-400">{briefing === null && !isLoading ? t('dailyDashboard.error') : t('dailyDashboard.placeholder')}</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          
          {/* FIX: Changed briefing.wellnessTip to briefing.visaTip */}
          <Card title={t('dailyDashboard.tipTitle')} icon={<>&#x1F4A1;</>}>
            <p>{briefing.visaTip}</p>
          </Card>

          <Card 
            title={t('dailyDashboard.activityTitle')} 
            // FIX: Changed briefing.gentleActivity to briefing.countrySpotlight
            icon={<span className="text-2xl">{briefing.countrySpotlight.icon}</span>}
            // FIX: Changed invalid page 'health_checkup' to 'eligibility_assessment'
            action={{label: 'Explore more', onClick: () => setPage('eligibility_assessment')}}
            >
            {/* FIX: Changed briefing.gentleActivity to briefing.countrySpotlight */}
            <p className="font-semibold text-white mb-1">{briefing.countrySpotlight.name}</p>
            <p>{briefing.countrySpotlight.description}</p>
          </Card>

          {/* FIX: Changed briefing.brainGame to briefing.quickFact */}
          <Card title={t('dailyDashboard.gameTitle')} icon={<>&#x1F9E0;</>}>
            <p className="mb-3">{briefing.quickFact.question}</p>
            {!revealedAnswer ? (
                <button onClick={() => setRevealedAnswer(true)} className="text-sm font-semibold px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors">
                    {t('dailyDashboard.gameReveal')}
                </button>
            ) : (
                <p className="p-3 bg-gray-900/50 rounded-md border border-white/10">
                    <strong className="text-blue-300">{t('dailyDashboard.gameAnswer')}:</strong> {briefing.quickFact.answer}
                </p>
            )}
          </Card>

           <Card 
            title={t('dailyDashboard.newsTitle')} 
            icon={<>&#x1F30D;</>}
            className="md:col-span-2"
             action={{label: t('dailyDashboard.newsSource'), onClick: () => window.open(briefing.positiveNews.source.uri, '_blank')}}
            >
             <p className="mb-2">{briefing.positiveNews.summary}</p>
             <p className="text-xs text-gray-500">Source: {briefing.positiveNews.source.title}</p>
          </Card>
          
          <Card 
            title={t('dailyDashboard.connectTitle')} 
            icon={<>&#x1F4DE;</>}
            // FIX: Changed invalid page 'ai_companion' to 'ai_consultant'
            action={{label: 'Chat with AI Consultant', onClick: () => setPage('ai_consultant')}}
          >
             <p>{t('dailyDashboard.connectBody')}</p>
          </Card>

        </div>
      )}
    </div>
  );
};

export default DailyDashboardPage;
