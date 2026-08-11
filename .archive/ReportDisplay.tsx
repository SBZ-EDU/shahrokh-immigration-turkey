import React, { useState, useEffect, useCallback, useRef } from 'react';
// FIX: Imported the missing `CompatibilityResult` type to resolve the compilation error.
import { CompatibilityResult, useLanguage } from '../types';
import DatingProfilePreview from './DoctorSummarySheet';

interface AnalysisDisplayProps {
  analysis: CompatibilityResult | null;
  isLoading: boolean;
  error: string | null;
  onGetDeeperAnalysis: (conditionName: string) => void;
  onGetAcademicAnalysis: (conditionName: string) => void;
  onGenerateSummary: () => void;
  doctorSummary: string;
  isGeneratingSummary: boolean;
  doctorSummaryError: string | null;
  onFindSpecialists: (specialists: string[]) => void;
  onRequestResearch: (conditionName: string) => void;
  onStartSimulation: () => void;
}

const InfoTag: React.FC<{ icon: React.ReactNode, value: string }> = ({ icon, value }) => (
    <div className="flex items-center gap-1.5 bg-gray-700/50 px-3 py-1.5 rounded-full text-sm">
        <span className="text-rose-300 text-xl">{icon}</span>
        <span className="text-white font-medium">{value}</span>
    </div>
);

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ 
  analysis, 
  isLoading, 
  error, 
  onGetDeeperAnalysis,
  onGetAcademicAnalysis,
  onGenerateSummary,
  doctorSummary,
  isGeneratingSummary,
  doctorSummaryError,
  onFindSpecialists,
  onRequestResearch,
  onStartSimulation,
}) => {
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);
  const [academicAnalysisCondition, setAcademicAnalysisCondition] = useState<string | null>(null);
  const [profileStyle, setProfileStyle] = useState<'dark' | 'light'>('dark');


  const handleConditionToggle = (conditionName: string) => {
    const isCurrentlyExpanded = expandedCondition === conditionName;
    const targetCondition = analysis?.personalityTraits.find(c => c.name === conditionName);

    setExpandedCondition(isCurrentlyExpanded ? null : conditionName);
    setAcademicAnalysisCondition(null); // Close academic view when toggling details

    if (!isCurrentlyExpanded && targetCondition && !targetCondition.details && !targetCondition.isLoadingDetails) {
        onGetDeeperAnalysis(conditionName);
    }
  };

  const handleAcademicAnalysisToggle = (conditionName: string) => {
      const isCurrentlyExpanded = academicAnalysisCondition === conditionName;
      const targetCondition = analysis?.personalityTraits.find(c => c.name === conditionName);

      setAcademicAnalysisCondition(isCurrentlyExpanded ? null : conditionName);
      setExpandedCondition(null); // Close details view when toggling academic

      if (!isCurrentlyExpanded && targetCondition && !targetCondition.furtherReading && !targetCondition.isLoadingFurtherReading) {
          onGetAcademicAnalysis(conditionName);
      }
  };

    // Text-to-Speech Logic for the main analysis
    const toggleSpeak = useCallback(() => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else if (analysis) {
            let textToSpeak = `${t('compatibilityQuiz.specialistsTitle')}: ${analysis.idealPartnerTraits.join(', ')}. ${t('compatibilityQuiz.conditionsTitle')}: `;
            analysis.personalityTraits.forEach(c => {
                textToSpeak += `${c.name}. ${c.description}. `;
            });
            textToSpeak += analysis.disclaimer;

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = language === 'fa' ? 'fa-IR' : 'en-US';
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = (e) => {
                console.error("Speech synthesis error", e);
                setIsSpeaking(false);
            };
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    }, [isSpeaking, analysis, language, t]);

    useEffect(() => {
        // Cleanup speech synthesis on component unmount
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const copySummaryToClipboard = useCallback(() => {
        if (summaryRef.current) {
            const textToCopy = summaryRef.current.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                setCopySuccess(t('compatibilityQuiz.copySuccess'));
                setTimeout(() => setCopySuccess(''), 2000);
            });
        }
    }, [t]);

  const allLowRelevance = analysis && analysis.personalityTraits.length > 0 && analysis.personalityTraits.every(c => c.relevance === 'Low');

  return (
    <div className="p-6 sm:p-8 min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">{t('compatibilityQuiz.analysisTitle')}</h3>
        {analysis && !isLoading && (
            <button
                onClick={toggleSpeak}
                title={isSpeaking ? "Stop reading aloud" : "Read analysis aloud"}
                className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
                {isSpeaking ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                   </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3z" />
                    </svg>
                )}
            </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-rose-400"></div>
          <span className={`${language === 'fa' ? 'mr-4' : 'ml-4'} text-gray-400`}>{t('compatibilityQuiz.generating')}</span>
        </div>
      )}

      {error && !error.includes('(Quota Exceeded)') && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}

      {!isLoading && !analysis && !error && (
        <div className="text-center py-10 text-gray-500">
          <p>{t('compatibilityQuiz.placeholder1')}</p>
          <p className="text-sm">{t('compatibilityQuiz.placeholder2')}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-8 animate-fade-in">
          {/* Disclaimer */}
          <div className="p-4 bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-300 text-sm" role="alert">
            <p>{analysis.disclaimer}</p>
          </div>

          {/* Ideal Partner Traits */}
          <div>
            <h4 className="text-lg font-semibold text-gray-200 mb-3">{t('compatibilityQuiz.specialistsTitle')}</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.idealPartnerTraits.map((trait, index) => (
                <span key={index} className="px-3 py-1 bg-gray-700 text-gray-200 text-sm rounded-full">{trait}</span>
              ))}
            </div>
             {analysis.idealPartnerTraits.length > 0 && (
                <button
                  onClick={() => onFindSpecialists(analysis.idealPartnerTraits)}
                  className="mt-4 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-2"
                >
                  <span>{t('compatibilityQuiz.findSpecialistsButton')}</span>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
            )}
          </div>

          {/* Personality Traits */}
          <div>
            <h4 className="text-lg font-semibold text-gray-200 mb-3">{t('compatibilityQuiz.conditionsTitle')}</h4>
            {allLowRelevance && (
                <div className="mb-4 p-4 bg-gray-700/50 border border-gray-600 text-gray-300 text-sm rounded-lg" role="alert">
                    <p>{t('compatibilityQuiz.lowConfidenceFallback')}</p>
                </div>
            )}
            <div className="space-y-4">
              {analysis.personalityTraits.map((trait) => (
                <div key={trait.name} className="bg-gray-900/50 p-4 rounded-lg border border-white/10">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <h5 className="font-semibold text-white">{trait.name}</h5>
                      <p className="text-sm text-gray-400 mt-1">{trait.description}</p>
                    </div>
                  </div>
                  <p className="text-sm mt-3 text-cyan-300 bg-cyan-900/30 p-2 rounded-md">{language === 'fa' ? 'راهنمایی' : 'Guidance'}: {trait.suggestedStep}</p>

                  <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap gap-2">
                     <button
                        onClick={() => handleConditionToggle(trait.name)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
                      >
                       {expandedCondition === trait.name ? t('compatibilityQuiz.hideDetails') : t('compatibilityQuiz.viewDetails')}
                     </button>
                      <button
                        onClick={() => handleAcademicAnalysisToggle(trait.name)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
                      >
                       {academicAnalysisCondition === trait.name ? t('compatibilityQuiz.hideDetails') : t('compatibilityQuiz.academicAnalysisButton')}
                     </button>
                     {trait.relevance === 'Low' && (
                        <button
                            onClick={() => onRequestResearch(trait.name)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-yellow-800/70 hover:bg-yellow-700 text-yellow-200 transition-colors"
                        >
                            {t('compatibilityQuiz.requestResearchButton')}
                        </button>
                     )}
                  </div>
                  
                  {/* Deeper Analysis Details */}
                   {expandedCondition === trait.name && (
                    <div className="mt-4 p-4 bg-gray-900/70 rounded-md border border-white/10 animate-fade-in">
                       {trait.isLoadingDetails && <p className="text-sm text-gray-400">{t('compatibilityQuiz.loadingDetails')}</p>}
                       {trait.detailsError && <p className="text-sm text-red-400">{trait.detailsError}</p>}
                       {trait.details && <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: trait.details }} />}
                    </div>
                   )}
                   {/* Academic Analysis Details */}
                   {academicAnalysisCondition === trait.name && (
                    <div className="mt-4 p-4 bg-gray-900/70 rounded-md border border-white/10 animate-fade-in">
                       {trait.isLoadingFurtherReading && <p className="text-sm text-gray-400">{t('compatibilityQuiz.loadingAcademicAnalysis')}</p>}
                       {trait.furtherReadingError && <p className="text-sm text-red-400">{trait.furtherReadingError}</p>}
                       {trait.furtherReading && <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: trait.furtherReading }} />}
                    </div>
                   )}
                </div>
              ))}
            </div>
          </div>

           {/* Lifestyle & Date Ideas Section */}
            {(analysis.lifestyleAnalysis || (analysis.suggestedFirstDateIdeas && analysis.suggestedFirstDateIdeas.length > 0)) && (
                <div className="pt-8 border-t border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">{t('compatibilityQuiz.careerSectionTitle')}</h3>
                    
                    {analysis.lifestyleAnalysis && (
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-200 mb-3">{t('compatibilityQuiz.currentJobAnalysisTitle')}</h4>
                            <blockquote className="p-4 bg-gray-900/50 border-l-4 border-rose-400 text-gray-300">
                                {analysis.lifestyleAnalysis}
                            </blockquote>
                        </div>
                    )}
                    
                    {analysis.suggestedFirstDateIdeas && analysis.suggestedFirstDateIdeas.length > 0 && (
                        <div>
                             <h4 className="text-lg font-semibold text-gray-200 mb-4">{t('compatibilityQuiz.jobSuggestionsTitle')}</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {analysis.suggestedFirstDateIdeas.map(idea => (
                                    <div key={idea.ideaTitle} className="bg-gray-900/50 p-5 rounded-lg border border-white/10 text-center">
                                        <div className="text-4xl mb-3">{idea.icon}</div>
                                        <h5 className="font-bold text-white mb-2">{idea.ideaTitle}</h5>
                                        <p className="text-sm text-gray-400">{idea.description}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            )}


          {/* Follow up questions */}
          {analysis.followUpQuestions && analysis.followUpQuestions.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-200 mb-3">{t('compatibilityQuiz.followUpTitle')}</h4>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-dashed border-white/20">
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                        {analysis.followUpQuestions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                </div>
              </div>
          )}

          {/* Generate Summary */}
          <div>
            <button
              onClick={onGenerateSummary}
              disabled={isGeneratingSummary}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingSummary ? t('compatibilityQuiz.generatingSummary') : t('compatibilityQuiz.prepareSummaryButton')}
            </button>
          </div>

          {/* Dating Simulator CTA */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="p-6 bg-purple-900/30 border border-purple-600/50 rounded-lg text-center">
                <h4 className="text-lg font-semibold text-purple-200">{t('datingSimulator.readyToPractice')}</h4>
                <p className="mt-2 text-sm text-purple-300/80 max-w-lg mx-auto">{t('datingSimulator.practiceDescription')}</p>
                <button 
                  onClick={onStartSimulation}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  <span>{t('datingSimulator.startSimulationButton')}</span>
                </button>
            </div>
          </div>

          {/* Doctor Summary Display */}
          {(doctorSummary || doctorSummaryError) && (
             <div className="mt-6 animate-fade-in">
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-200">{t('datingProfilePreview.title')}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">{t('datingProfilePreview.style')}:</span>
                        <button
                            onClick={() => setProfileStyle('dark')}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${profileStyle === 'dark' ? 'bg-rose-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >{t('datingProfilePreview.modernDark')}</button>
                        <button
                            onClick={() => setProfileStyle('light')}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${profileStyle === 'light' ? 'bg-rose-200 text-rose-900' : 'bg-gray-700 text-gray-300'}`}
                        >{t('datingProfilePreview.classicLight')}</button>
                        <button
                            onClick={copySummaryToClipboard}
                            className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors ml-2"
                        >
                            {copySuccess || t('datingProfilePreview.copyBio')}
                        </button>
                    </div>
                </div>
                {doctorSummaryError && <p className="text-sm text-red-400 p-3 bg-red-900/30 rounded-md">{doctorSummaryError}</p>}
                {doctorSummary && (
                    <div className="overflow-hidden">
                        <DatingProfilePreview ref={summaryRef} summaryHtml={doctorSummary} styleMode={profileStyle} />
                    </div>
                )}
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisDisplay;