import React, { useState, useEffect, useRef } from 'react';
// FIX: Imported the missing `CompatibilityDetails` type to resolve the compilation error.
import { CompatibilityDetails, useLanguage } from '../types';

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
}

interface CompatibilityFormProps {
  onAnalyze: () => void;
  isLoading: boolean;
  symptoms: string;
  setSymptoms: (value: React.SetStateAction<string>) => void;
  symptomDetails: CompatibilityDetails;
  setSymptomDetails: (value: React.SetStateAction<CompatibilityDetails>) => void;
  isQuotaExhausted: boolean;
}

const CompatibilityForm: React.FC<CompatibilityFormProps> = ({ 
  onAnalyze, 
  isLoading, 
  symptoms,
  setSymptoms,
  symptomDetails,
  setSymptomDetails,
  isQuotaExhausted
}) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'fa' ? 'fa-IR' : 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setSymptoms(prev => prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim());
      }
    };
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
    }
    
    recognitionRef.current = recognition;
  }, [language, setSymptoms]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      alert(t('compatibilityQuiz.validationError'));
      return;
    }
    onAnalyze();
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-white">{t('compatibilityQuiz.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="description" className={`block text-sm font-medium text-gray-300`}>{t('compatibilityQuiz.descriptionLabel')}</label>
            <button
                type="button"
                onClick={toggleListening}
                title={isListening ? t('compatibilityQuiz.voiceInputStop') : t('compatibilityQuiz.voiceInputStart')}
                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/50 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                disabled={!recognitionRef.current}
            >
                {isListening ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                        <path d="M5.5 13a.5.5 0 01.5.5v1.5a4.5 4.5 0 009 0v-1.5a.5.5 0 011 0v1.5a5.5 5.5 0 01-11 0v-1.5a.5.5 0 01.5-.5z" />
                     </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm5 10.5a.5.5 0 01.5.5v.5a3.5 3.5 0 01-7 0v-.5a.5.5 0 01.5-.5h6zM5 8a1 1 0 011-1h1V6a1 1 0 112 0v1h1a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                )}
            </button>
          </div>
          <textarea
            id="description"
            rows={8}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white"
            placeholder={t('compatibilityQuiz.descriptionPlaceholder')}
          />
        </div>

        {/* Details Form */}
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">{t('compatibilityQuiz.detailsTitle')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            
            {/* Dealbreakers */}
            <div className="sm:col-span-2">
              <label htmlFor="dealbreakers" className="block text-sm font-medium text-gray-300">{t('compatibilityQuiz.aggravatingFactors')}</label>
              <input type="text" name="dealbreakers" id="dealbreakers" value={symptomDetails.dealbreakers} onChange={e => setSymptomDetails(d => ({ ...d, dealbreakers: e.target.value }))} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white" />
            </div>

            {/* Conflict Style */}
            <div className="sm:col-span-2">
              <label htmlFor="conflictStyle" className="block text-sm font-medium text-gray-300">{t('compatibilityQuiz.alleviateFactors')}</label>
              <input type="text" name="conflictStyle" id="conflictStyle" value={symptomDetails.conflictStyle} onChange={e => setSymptomDetails(d => ({ ...d, conflictStyle: e.target.value }))} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white" />
            </div>

             {/* Long-Distance Preference */}
            <div className="sm:col-span-2">
              <label htmlFor="longDistancePreference" className="block text-sm font-medium text-gray-300">{t('compatibilityQuiz.longDistance')}</label>
              <input type="text" name="longDistancePreference" id="longDistancePreference" value={symptomDetails.longDistancePreference} onChange={e => setSymptomDetails(d => ({ ...d, longDistancePreference: e.target.value }))} placeholder={t('compatibilityQuiz.longDistancePlaceholder')} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white" />
            </div>
            
            {/* Current Job */}
            <div>
                <label htmlFor="currentJob" className="block text-sm font-medium text-gray-300">{t('compatibilityQuiz.currentJob')}</label>
                <input type="text" name="currentJob" id="currentJob" value={symptomDetails.currentJob} onChange={e => setSymptomDetails(d => ({ ...d, currentJob: e.target.value }))} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white" />
            </div>

            {/* Work Environment */}
            <div>
                <label htmlFor="workEnvironment" className="block text-sm font-medium text-gray-300">{t('compatibilityQuiz.workEnvironment')}</label>
                <input type="text" name="workEnvironment" id="workEnvironment" value={symptomDetails.workEnvironment} onChange={e => setSymptomDetails(d => ({ ...d, workEnvironment: e.target.value }))} placeholder={t('compatibilityQuiz.workEnvironmentPlaceholder')} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white" />
            </div>

          </div>
        </div>


        <div>
          <button
            type="submit"
            disabled={isLoading || isQuotaExhausted}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-rose-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isQuotaExhausted ? t('quotaErrorModal.title') : t('compatibilityQuiz.buttonText')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompatibilityForm;