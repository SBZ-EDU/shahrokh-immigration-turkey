import React, { useState, useEffect, useRef } from 'react';
import { useLanguage, EligibilityInputs, ImmigrationPathway, DestinationExperience, ImmigrationStep, OfficialOffice } from '../types';
import { useToast } from './Toast';

// --- Sub-components for Destination Experience ---

const ImageCard: React.FC<{
    imageUrl: string | null;
    isLoading: boolean;
    isError: boolean;
    aspectRatio: '1/1' | '16/9';
}> = ({ imageUrl, isLoading, isError, aspectRatio }) => {
    const { t } = useLanguage();
    const aspectClass = aspectRatio === '16/9' ? 'aspect-video' : 'aspect-square';

    return (
        <div className={`${aspectClass} bg-gray-800 flex items-center justify-center w-full rounded-lg border border-white/10 overflow-hidden`}>
            {isLoading && (
                <div className="flex flex-col items-center text-center text-gray-400">
                    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>
                    <span className="text-sm mt-3">{t('eligibilityAssessment.generatingImage')}</span>
                </div>
            )}
            {isError && (
                 <div className="flex flex-col items-center text-center text-red-400 p-4">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm mt-2">{t('eligibilityAssessment.imageFailed')}</span>
                </div>
            )}
            {!isLoading && !isError && imageUrl && <img src={imageUrl} alt="Generated guide image" className="w-full h-full object-cover" />}
        </div>
    );
};

// --- Main Page Component ---
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

interface EligibilityAssessmentPageProps {
  onGeneratePathway: () => void;
  isPathwayLoading: boolean;
  inputs: EligibilityInputs;
  setInputs: (value: React.SetStateAction<EligibilityInputs>) => void;
  immigrationPathways: ImmigrationPathway[];
  onViewPathway: (pathway: ImmigrationPathway) => void;
  onGenerateGuide: (description: string) => void;
  isGuideLoading: boolean;
  guideResult: DestinationExperience | null;
  isQuotaExhausted: boolean;
  onFindOfficesForGuide: (pathway: ImmigrationPathway) => void;
  isFindingGuideOffices: boolean;
  guideOfficeResults: OfficialOffice[] | null;
}

const EligibilityAssessmentPage: React.FC<EligibilityAssessmentPageProps> = ({
  onGeneratePathway,
  isPathwayLoading,
  inputs,
  setInputs,
  immigrationPathways,
  onViewPathway,
  onGenerateGuide,
  isGuideLoading,
  guideResult,
  isQuotaExhausted,
  onFindOfficesForGuide,
  isFindingGuideOffices,
  guideOfficeResults,
}) => {
  const { language, t } = useLanguage();
  const { addToast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    const recognition: SpeechRecognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'fa' ? 'fa-IR' : 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputs(prev => ({ ...prev, profileDescription: prev.profileDescription ? `${prev.profileDescription} ${finalTranscript.trim()}` : finalTranscript.trim() }));
        if (formError) setFormError(null);
      }
    };
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          addToast(t('errors.micPermission'), 'error');
        } else {
          addToast(t('errors.speechRecognition'), 'error');
        }
        setIsListening(false);
    }
    
    recognitionRef.current = recognition;
  }, [language, setInputs, formError, addToast, t]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const validateForm = (): boolean => {
    if (!inputs.profileDescription.trim()) {
      setFormError(t('validation.required'));
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onGeneratePathway();
    }
  };
  
  const handleGenerateGuideClick = () => {
    if (validateForm()) {
      onGenerateGuide(inputs.profileDescription);
    }
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      const ALLOWED = ['image/jpeg','image/png','image/webp','image/jpg','application/pdf'];
      if (file.size > MAX_SIZE) {
        setFormError('File too large. Max 10MB allowed.');
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!ALLOWED.includes(file.type)) {
        setFormError('Unsupported file type. Use JPG, PNG, WEBP or PDF.');
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setInputs(prev => ({
          ...prev,
          supportingDocument: {
            base64: base64String,
            mimeType: file.type,
          }
        }));
      };
      reader.onerror = () => setFormError('Failed to read file.');
      reader.readAsDataURL(file);
  };
  
  const removeImage = () => {
    setInputs(prev => ({ ...prev, supportingDocument: null }));
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const ImmigrationPathwayCard: React.FC<{ pathway: ImmigrationPathway, index: number }> = ({ pathway, index }) => {
    const { t } = useLanguage();

    const Section: React.FC<{ items: ImmigrationStep[] }> = ({ items }) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="space-y-5">
                {items.map((item, i) => (
                    <div key={`${i}`} className="flex items-start">
                        <span className="text-3xl mr-4 rtl:ml-4 rtl:mr-0 pt-1">{item.icon}</span>
                        <div className="flex-grow">
                            <div className="flex justify-between items-baseline">
                                <p className="font-bold text-white">{item.name}</p>
                                <div className="flex-grow border-b border-dashed border-gray-600 mx-2"></div>
                                <p className="font-mono text-blue-300 flex-shrink-0">{item.duration}</p>
                            </div>
                            <p className="text-sm text-gray-400 leading-snug mt-1">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-gray-800/60 border border-white/10 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm h-full flex flex-col">
            <div className="text-center mb-6">
                <h4 className="font-semibold uppercase tracking-wider text-gray-500 text-xs mb-2">{t('eligibilityAssessment.planOption', {number: index + 1})}</h4>
                <h3 className="text-2xl font-bold text-blue-300 tracking-tight">{pathway.pathwayTitle}</h3>
            </div>

            <p className="text-center text-gray-300 mb-8">{pathway.profileSummary}</p>

            <div className="flex-grow space-y-8 border-t border-gray-700 pt-8">
                <Section items={pathway.suggestedSteps} />
            </div>

            <button
                onClick={() => onViewPathway(pathway)}
                className="mt-8 w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all transform hover:-translate-y-1"
            >
                {t('eligibilityAssessment.viewPlanButton')}
            </button>
        </div>
    );
  };
  
  const isGeneratingGuideOverall = isGuideLoading || (guideResult && (guideResult.isLoadingCityscape || guideResult.isLoadingAmbiance));
  
  const Star: React.FC<{ type: 'full' | 'half' | 'empty' }> = ({ type }) => {
    const baseClass = "w-4 h-4 text-yellow-400";
    if (type === 'full') {
        return <svg className={baseClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
    }
    if (type === 'half') {
        return <svg className={baseClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /><path fillRule="evenodd" d="M10 2.563l1.236 3.794a.5.5 0 00.475.345h3.99a.5.5 0 01.294.905l-3.23 2.346a.5.5 0 00-.182.559l1.236 3.794a.5.5 0 01-.77.559L10 12.31l-3.248 2.353a.5.5 0 01-.77-.56l1.236-3.793a.5.5 0 00-.182-.559l-3.23-2.346a.5.5 0 01.294-.905h3.99a.5.5 0 00.475-.345L10 2.563z" clipRule="evenodd" transform="scale(0.95) translate(0.5, 0.5)" opacity="0.5" /></svg>;
    }
    return <svg className={`${baseClass} text-gray-600`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
  };

  const StarRating: React.FC<{ rating?: number }> = ({ rating }) => {
    if (typeof rating !== 'number') return null;
    const validRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(validRating);
    const halfStar = validRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-1">
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} type="full" />)}
            {halfStar && <Star key="half" type="half" />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} type="empty" />)}
            <span className="ml-2 rtl:mr-2 text-sm text-gray-400 font-mono">{validRating.toFixed(1)}</span>
        </div>
    );
  };

  const GuideOfficeCard: React.FC<{ office: OfficialOffice }> = ({ office }) => (
    <div className="bg-gray-900/70 border border-white/10 rounded-lg p-6 shadow-2xl backdrop-blur-sm h-full flex flex-col">
        <div className="flex-grow">
            <div className="flex justify-between items-start gap-4">
                <h3 className="text-xl font-bold text-blue-300 tracking-tight">{office.name}</h3>
                <StarRating rating={office.rating} />
            </div>
            <p className="text-sm text-gray-400 mt-2 mb-4">{office.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-700 text-sm text-gray-400 space-y-3">
             <p className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                <span>{office.address}</span>
            </p>
            {office.phone && (
                <p className="flex items-center gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                     <a href={`tel:${office.phone}`} className="hover:text-blue-300 transition-colors">{office.phone}</a>
                </p>
            )}
            {office.website && (
                 <p className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                    <a href={office.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors truncate">{office.website}</a>
                </p>
            )}
        </div>
      </div>
  );

  return (
    <section id="eligibility-assessment" className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{t('eligibilityAssessment.title')}</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start mt-12">
          {/* Left Column: Form */}
          <div className="xl:col-span-1 xl:sticky top-28">
            <div className="bg-gray-800/50 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-white/10">
              <h2 className="text-2xl font-bold mb-6 text-white">{t('eligibilityAssessment.formTitle')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Description */}
                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">{t('eligibilityAssessment.descriptionLabel')}</label>
                    <button type="button" onClick={toggleListening} disabled={!recognitionRef.current} className="p-2 rounded-full transition-colors disabled:opacity-50" title={isListening ? t('eligibilityAssessment.voiceInputStop') : t('eligibilityAssessment.voiceInputStart')}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm5 10.5a.5.5 0 01.5.5v.5a3.5 3.5 0 01-7 0v-.5a.5.5 0 01.5-.5h6zM5 8a1 1 0 011-1h1V6a1 1 0 112 0v1h1a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                  <textarea 
                    id="description" 
                    rows={5} 
                    value={inputs.profileDescription} 
                    onChange={(e) => {
                      setInputs(prev => ({...prev, profileDescription: e.target.value}));
                      if (formError) setFormError(null);
                    }} 
                    className={`mt-1 block w-full bg-gray-700 rounded-md shadow-sm py-2 px-3 sm:text-sm text-white transition-colors ${formError ? 'border-red-500 ring-2 ring-red-500/50 focus:border-red-500' : 'border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500'}`}
                    placeholder={t('eligibilityAssessment.descriptionPlaceholder')} 
                  />
                  {formError && <p className="mt-2 text-sm text-red-400 animate-fade-in">{formError}</p>}
                </div>
                
                <div className="pt-2">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">{t('eligibilityAssessment.suggestionsTitle')}</h4>
                    <div className="flex flex-wrap gap-2">
                        {t('eligibilityAssessment.suggestions').map((suggestion: string, index: number) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  setInputs(prev => ({...prev, profileDescription: suggestion}));
                                  if (formError) setFormError(null);
                                }}
                                className="px-3 py-1.5 bg-gray-700/80 text-gray-300 text-xs font-medium rounded-full hover:bg-gray-600 hover:text-white transition-all transform hover:scale-105"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex items-center">
                    <input id="use-history" type="checkbox" checked={inputs.useHistory} onChange={e => setInputs(p => ({...p, useHistory: e.target.checked, backgroundInfo: e.target.checked ? p.backgroundInfo : ''}))} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" />
                    <label htmlFor="use-history" className="ml-2 rtl:mr-2 block text-sm text-gray-300">{t('eligibilityAssessment.useHistory')}</label>
                  </div>
                  {inputs.useHistory && (
                    <textarea id="history" rows={4} value={inputs.backgroundInfo} onChange={e => setInputs(p => ({...p, backgroundInfo: e.target.value}))} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white" placeholder={t('eligibilityAssessment.historyPlaceholder')} />
                  )}
                </div>

                <div className="pt-4 border-t border-white/10">
                    <input type="file" id="supporting-document" accept="image/*,application/pdf,.doc,.docx" className="hidden" onChange={handleImageUpload} ref={fileInputRef} />
                    <label htmlFor="supporting-document" className="w-full cursor-pointer flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-gray-500 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700/50 hover:border-gray-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                      <span>{t('eligibilityAssessment.uploadPhoto')}</span>
                    </label>
                    {inputs.supportingDocument && (
                        <div className="mt-3 text-xs text-center text-green-400 bg-green-900/30 p-2 rounded-md flex justify-between items-center">
                            <span className="truncate pr-2">{t('eligibilityAssessment.photoUploaded', {fileName: fileInputRef.current?.files?.[0]?.name || ''})}</span>
                            <button type="button" onClick={removeImage} title={t('eligibilityAssessment.removePhoto')} className="text-red-400 hover:text-red-300">&times;</button>
                        </div>
                    )}
                </div>

                <div>
                  <button type="submit" disabled={isPathwayLoading || isQuotaExhausted} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1">
                    {isPathwayLoading ? t('eligibilityAssessment.generatingPlans') : isQuotaExhausted ? t('quotaErrorModal.title') : t('eligibilityAssessment.buttonText')}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="xl:col-span-2 space-y-12">
            <div id="plan-results">
              <h3 className="text-3xl font-bold text-white mb-6 text-center xl:text-left">{t('eligibilityAssessment.planResultsTitle')}</h3>
              {isPathwayLoading && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>
                    <p className="mt-4 text-gray-400">{t('eligibilityAssessment.generatingPlans')}</p>
                </div>
              )}
              {!isPathwayLoading && immigrationPathways.length === 0 && (
                <div className="text-center py-10 text-gray-500 bg-gray-800/20 rounded-lg">
                    <p>{t('eligibilityAssessment.planPlaceholder')}</p>
                </div>
              )}
              {immigrationPathways.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  {immigrationPathways.map((pathway, i) => <ImmigrationPathwayCard key={i} pathway={pathway} index={i} />)}
                </div>
              )}
            </div>

            {(immigrationPathways.length > 0 || guideResult) && (
                <div className="text-center my-8 animate-fade-in">
                    <button
                        onClick={handleGenerateGuideClick}
                        disabled={isGeneratingGuideOverall || isQuotaExhausted}
                        className="inline-flex justify-center py-3 px-8 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1"
                    >
                        {isGeneratingGuideOverall ? t('eligibilityAssessment.generatingGuide') : t('eligibilityAssessment.generateGuideButton')}
                    </button>
                </div>
            )}

            <div id="guide-results">
               <h3 className="text-3xl font-bold text-white mb-6 text-center xl:text-left">{t('eligibilityAssessment.guideResultsTitle')}</h3>
               {(isGuideLoading && !guideResult) && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>
                    <p className="mt-4 text-gray-400">{t('eligibilityAssessment.generatingGuide')}</p>
                  </div>
                )}
                {!isGuideLoading && !guideResult && (
                  <div className="text-center py-10 text-gray-500 bg-gray-800/20 rounded-lg">
                    <p>{t('eligibilityAssessment.guidePlaceholder')}</p>
                  </div>
                )}
                {guideResult && (
                    <div className="animate-fade-in space-y-10 bg-gray-800/30 p-8 rounded-lg border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-lg text-white mb-3">{t('eligibilityAssessment.culturalInsights')}</h4>
                                <p className="text-sm text-gray-300 whitespace-pre-line">{guideResult.culturalInsights}</p>
                            </div>
                             <div>
                                <h4 className="font-bold text-lg text-white mb-3">{t('eligibilityAssessment.jobMarketOverview')}</h4>
                                 <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                    {guideResult.jobMarketOverview.map((tip, i) => <li key={i}>{tip}</li>)}
                                 </ul>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-gray-700">
                             <h4 className="font-bold text-lg text-white mb-3">{t('eligibilityAssessment.lifestyleTips')}</h4>
                             <p className="text-sm text-gray-300 whitespace-pre-line">{guideResult.lifestyleTips}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-700">
                           <div>
                                <h4 className="font-bold text-lg text-white mb-3">{t('eligibilityAssessment.cityscape')}</h4>
                                <ImageCard imageUrl={guideResult.cityscapeImage?.[0] ?? null} isLoading={guideResult.isLoadingCityscape} isError={!guideResult.isLoadingCityscape && !guideResult.cityscapeImage} aspectRatio="16/9" />
                           </div>
                            <div>
                                <h4 className="font-bold text-lg text-white mb-3">{t('eligibilityAssessment.localAmbiance')}</h4>
                                <ImageCard imageUrl={guideResult.localAmbianceImage?.[0] ?? null} isLoading={guideResult.isLoadingAmbiance} isError={!guideResult.isLoadingAmbiance && !guideResult.localAmbianceImage} aspectRatio="16/9" />
                           </div>
                        </div>
                        {immigrationPathways[0] && <div className="text-center mt-10 pt-8 border-t-2 border-dashed border-gray-700">
                            <button
                                onClick={() => onFindOfficesForGuide(immigrationPathways[0])}
                                disabled={isFindingGuideOffices || isQuotaExhausted}
                                className="inline-flex items-center justify-center py-3 px-8 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1"
                            >
                                {isFindingGuideOffices ? t('eligibilityAssessment.findingClinics') : t('eligibilityAssessment.findClinicsForGuideButton')}
                            </button>
                        </div>}

                        <div id="guide-clinics-results" className="mt-12">
                            {isFindingGuideOffices && (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>
                                    <p className="mt-4 text-gray-400">{t('eligibilityAssessment.findingClinics')}</p>
                                </div>
                            )}
                             {guideOfficeResults && (
                                <>
                                 <h3 className="text-3xl font-bold text-white mb-6 text-center">{t('eligibilityAssessment.guideClinicsTitle')}</h3>
                                 {guideOfficeResults.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {guideOfficeResults.map((office, i) => <GuideOfficeCard key={i} office={office} />)}
                                    </div>
                                 ) : (
                                    <div className="text-center py-10 text-gray-500 bg-gray-900/50 rounded-lg">
                                        <p>{t('eligibilityAssessment.guideClinicsPlaceholder')}</p>
                                    </div>
                                 )}
                                </>
                             )}
                        </div>
                    </div>
                )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EligibilityAssessmentPage;
