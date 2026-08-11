
import React, { useState } from 'react';
import { useLanguage, PathwayAnalysisResult } from '../types';

interface PathwayAnalyzerPageProps {
  onAnalyze: (description: string) => void;
  isLoading: boolean;
  analysis: PathwayAnalysisResult | null;
  isQuotaExhausted: boolean;
}

// FIX: Changed to a named export to resolve module import error.
export const PathwayAnalyzerPage: React.FC<PathwayAnalyzerPageProps> = ({
  onAnalyze,
  isLoading,
  analysis,
  isQuotaExhausted,
}) => {
  const { t } = useLanguage();
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError(t('validation.required'));
      return;
    }
    setFormError(null);
    onAnalyze(description);
  };

  const ReportSection: React.FC<{ title: string; children: React.ReactNode, icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div>
      <div className="flex items-center mb-4">
        <span className="text-blue-400 text-2xl p-2 bg-gray-900/50 rounded-lg mr-4 rtl:ml-4 rtl:mr-0">{icon}</span>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <div className="pl-14 rtl:pr-14 text-gray-300">{children}</div>
    </div>
  );

  return (
    <section id="pathway-analyzer" className="py-16 sm:py-24 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('pathwayAnalyzer.title')}
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            {t('pathwayAnalyzer.subtitle')}
          </p>
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-white/10 space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">{t('pathwayAnalyzer.descriptionLabel')}</label>
              <textarea
                id="description"
                rows={6}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (formError) setFormError(null);
                }}
                className={`mt-1 block w-full bg-gray-700 rounded-md shadow-sm py-2 px-3 sm:text-sm text-white transition-colors ${formError ? 'border-red-500 ring-2 ring-red-500/50 focus:border-red-500' : 'border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500'}`}
                placeholder={t('pathwayAnalyzer.descriptionPlaceholder')}
              />
              {formError && <p className="mt-2 text-sm text-red-400 animate-fade-in">{formError}</p>}
            </div>
            <div className="pt-2">
                <h4 className="text-xs font-semibold text-gray-400 mb-2">{t('pathwayAnalyzer.suggestionsTitle')}</h4>
                <div className="flex flex-wrap gap-2">
                    {t('pathwayAnalyzer.suggestions').map((suggestion: string, index: number) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setDescription(suggestion);
                              if (formError) setFormError(null);
                            }}
                            className="px-3 py-1.5 bg-gray-700/80 text-gray-300 text-xs font-medium rounded-full hover:bg-gray-600 hover:text-white transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading || isQuotaExhausted}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? t('pathwayAnalyzer.analyzing') : isQuotaExhausted ? t('quotaErrorModal.title') : t('pathwayAnalyzer.buttonText')}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>
                <p className="mt-4 text-gray-400">{t('pathwayAnalyzer.analyzing')}</p>
              </div>
            )}
            {!isLoading && !analysis && (
              <div className="text-center py-10 text-gray-500 bg-gray-800/20 rounded-lg max-w-3xl mx-auto">
                <p>{t('pathwayAnalyzer.placeholder')}</p>
              </div>
            )}
            {analysis && (
                <div className="animate-fade-in bg-gray-800/30 p-8 rounded-lg mt-12 border border-white/10">
                    <header className="text-center border-b-2 border-dashed border-blue-700 pb-6 mb-8">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">{t('pathwayAnalyzer.primaryConcern')}</h2>
                        <p className="text-4xl font-extrabold text-blue-300 mt-2">{analysis.primaryPathway}</p>
                        <p className="text-gray-300 mt-4 max-w-3xl mx-auto">{analysis.pathwayDescription}</p>
                    </header>

                    <div className="space-y-10">
                        <ReportSection title={t('pathwayAnalyzer.possibleFactors')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>}>
                            <ul className="list-disc list-inside space-y-2">
                                {analysis.potentialCountries.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </ReportSection>
                        
                        <ReportSection title={t('pathwayAnalyzer.homeCareSuggestions')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009.5 16.571V11.5a1 1 0 012 0v5.071a1 1 0 00.225.632l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}>
                            <ul className="list-disc list-inside space-y-2">
                                {analysis.nextSteps.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </ReportSection>
                        
                         <ReportSection title={t('pathwayAnalyzer.whenToSeeDoctor')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}>
                            <ul className="list-disc list-inside space-y-2">
                                {analysis.eligibilityFactors.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </ReportSection>
                    </div>

                    <footer className="mt-10 pt-6 border-t border-dashed border-gray-600">
                        <div className="p-4 bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-300 text-sm" role="alert">
                            <p className="font-bold mb-1">{t('pathwayAnalyzer.disclaimer')}</p>
                            <p>{analysis.disclaimer}</p>
                        </div>
                    </footer>
                </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default PathwayAnalyzerPage;
