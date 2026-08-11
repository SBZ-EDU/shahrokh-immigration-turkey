
import React, { useState, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import SiteHeader from './components/Header';
import HomePage from './components/Home';
import EligibilityAssessmentPage from './components/EligibilityAssessment';
import OfficeFinderPage from './components/OfficeFinder';
import ImmigrationNewsPage from './components/ImmigrationNews';
import OurConsultantsPage from './components/ConsultantsPage';
import MyApplicationsPage from './components/MyApplications';
// FIX: Changed to a named import as there is no default export.
import { PathwayAnalyzerPage } from './components/PathwayAnalyzer';
import AiConsultantPage from './components/AiConsultant';
import CorporateInvestmentPage from './components/InvestorPage';
import DestinationVisualizerPage from './components/DestinationVisualizer';
import Turkey4XPage from './components/Turkey4XPage';
import AdminPanel from './components/AdminPanel';
import UserPanel from './components/UserPanel';
import BusinessAnalyzer from './components/BusinessAnalyzer';
import { useAuth } from './contexts/AuthContext';
import ImmigrationDashboardPage from './components/DashboardPage';
import SiteFooter from './components/Footer';
import QuotaErrorModal from './components/QuotaErrorModal';
import PathwayDetailModal from './components/PathwayDetailModal';
import LoginModal from './components/LoginModal';
import SystemLogsModal from './components/SystemLogsModal';
import TelegramBotWidget from './components/TelegramBotWidget';
import { useToast } from './components/Toast';

import { useLanguage, Page, EligibilityInputs, ImmigrationPathway, SavedApplication, PathwayAnalysisResult, DestinationExperience, OfficialOffice, Message, SiteHealth, ErrorLog, ImmigrationBriefing } from './types';
import * as geminiService from './services/geminiService';
import * as dbService from './services/dbService';

const initialInputs: EligibilityInputs = {
  profileDescription: '',
  useHistory: false,
  backgroundInfo: '',
  supportingDocument: null,
};

const App: React.FC = () => {
  const { language, t } = useLanguage();
  const { addToast } = useToast();
  const [page, setPage] = useState<Page>('home');
  
  // State for Eligibility Assessment
  const [eligibilityInputs, setEligibilityInputs] = useState<EligibilityInputs>(initialInputs);
  const [immigrationPathways, setImmigrationPathways] = useState<ImmigrationPathway[]>([]);
  const [isGeneratingPathway, setIsGeneratingPathway] = useState(false);
  
  // State for Saved Applications
  const [savedApplications, setSavedApplications] = useState<SavedApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPathway, setViewingPathway] = useState<ImmigrationPathway | null>(null);

  // State for Pathway Analyzer
  const [pathwayResult, setPathwayResult] = useState<PathwayAnalysisResult | null>(null);
  const [isAnalyzingPathway, setIsAnalyzingPathway] = useState(false);

  // State for Destination Experience
  const [destinationExperience, setDestinationExperience] = useState<DestinationExperience | null>(null);
  const [isGeneratingExperience, setIsGeneratingExperience] = useState(false);
  const [experienceOfficeResults, setExperienceOfficeResults] = useState<OfficialOffice[] | null>(null);
  const [isFindingExperienceOffices, setIsFindingExperienceOffices] = useState(false);


  // State for Office Finder
  const [officeFinderResults, setOfficeFinderResults] = useState<OfficialOffice[] | null>(null);
  const [isFindingOffices, setIsFindingOffices] = useState(false);

  // State for AI Consultant
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isChatStreaming, setIsChatStreaming] = useState(false);

  // State for Video Generation (Destination Visualizer)
  const [videoPrompt, setVideoPrompt] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState('');

  // State for Immigration Dashboard
  const [immigrationBriefing, setImmigrationBriefing] = useState<ImmigrationBriefing | null>(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);


  // Global State
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Health & Logging State
  const [siteHealth, setSiteHealth] = useState<SiteHealth>('healthy');
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  useEffect(() => {
    dbService.initDB().then(() => {
      loadSavedApplications();
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = (language === 'fa' || language === 'ar') ? 'rtl' : 'ltr';
  }, [language]);
  
  const reportErrorToBackend = (errorDetails: object) => {
    console.log("--- SIMULATING: Reporting Error to Backend ---");
    console.log(JSON.stringify(errorDetails, null, 2));
    console.log("----------------------------------------------");
  };
  
  const handleApiError = useCallback((error: unknown): string => {
    const errorDetails = {
      timestamp: new Date().toISOString(),
      message: 'An API error occurred.',
      status: (error as any)?.status || (error as any)?.response?.status,
      statusText: (error as any)?.statusText || (error as any)?.response?.statusText,
      fullError: error,
    };

    console.error("Detailed API Error Log:", errorDetails);
    reportErrorToBackend(errorDetails);

    const errorString = (error instanceof Error) ? error.toString() : JSON.stringify(error);
    
    dbService.addErrorLog({
        timestamp: Date.now(),
        message: errorString.substring(0, 120),
        details: JSON.stringify(errorDetails, null, 2)
    });

    const lowerError = errorString.toLowerCase();
    let message: string;

    if (lowerError.includes('429') || lowerError.includes('resource_exhausted') || lowerError.includes('rate limit')) {
       setIsQuotaExhausted(true);
       setSiteHealth('error');
       message = t('errors.rateLimit');
    } else if (lowerError.includes('400') || lowerError.includes('invalid argument')) {
       setSiteHealth('degraded');
       message = t('errors.invalidInput');
    } else if (lowerError.includes('failed to fetch') || lowerError.includes('network')) {
        setSiteHealth('degraded');
        message = t('errors.network');
    } else {
        setSiteHealth('degraded');
        message = t('errors.generic');
    }
    
    addToast(message, 'error');
    return message;
  }, [addToast, t]);

  // --- Auth Logic (now via AuthContext) ---
  const handleLogin = () => {
    // actual login handled inside LoginModal via useAuth
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  // --- Logging Logic ---
  const handleOpenLogsModal = async () => {
    const logs = await dbService.getAllErrorLogs();
    setErrorLogs(logs);
    setIsLogsModalOpen(true);
  };

  const handleClearLogs = async () => {
    await dbService.clearErrorLogs();
    setErrorLogs([]);
  };

  // --- AI Consultant Logic ---
  useEffect(() => {
    if (page === 'ai_consultant') {
      const newChat = geminiService.startChat(language);
      setChat(newChat);
      setChatHistory([{
        role: 'model',
        parts: [{ text: t('aiConsultant.welcomeMessage') }]
      }]);
    } else {
      setChat(null);
      setChatHistory([]);
      setIsChatStreaming(false);
    }
  }, [page, language, t]);

  const handleSendMessage = async (message: string) => {
    if (!chat) return;

    const userMessage: Message = { role: 'user', parts: [{ text: message }] };
    setChatHistory(prev => [...prev, userMessage]);
    setIsChatStreaming(true);

    try {
      const stream = await chat.sendMessageStream({ message });
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      for await (const chunk of stream) {
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].parts[0].text = chunk.text;
          return newHistory;
        });
      }
    } catch (err) {
      handleApiError(err);
      setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setIsChatStreaming(false);
    }
  };


  // --- Immigration Pathway Logic ---
  const handleGetImmigrationPathway = useCallback(async () => {
    setIsGeneratingPathway(true);
    setImmigrationPathways([]);
    try {
      const results = await geminiService.generateImmigrationPathways(eligibilityInputs, language);
      setImmigrationPathways(results);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsGeneratingPathway(false);
    }
  }, [eligibilityInputs, language, handleApiError]);

  // --- Immigration Dashboard Logic ---
  const handleGenerateDailyBriefing = useCallback(async () => {
    setIsGeneratingBriefing(true);
    try {
      const result = await geminiService.generateImmigrationBriefing(language);
      setImmigrationBriefing(result);
    } catch (err) {
      handleApiError(err);
      setImmigrationBriefing(null); // Clear on error
    } finally {
      setIsGeneratingBriefing(false);
    }
  }, [language, handleApiError]);
  
  useEffect(() => {
    // Fetch briefing only when navigating to the dashboard for the first time in a session
    if (page === 'immigration_dashboard' && !immigrationBriefing && !isGeneratingBriefing) {
        handleGenerateDailyBriefing();
    }
  }, [page, immigrationBriefing, isGeneratingBriefing, handleGenerateDailyBriefing]);

  // --- Destination Experience Logic ---
  const handleGenerateExperience = async (description: string) => {
    setIsGeneratingExperience(true);
    setExperienceOfficeResults(null);
    setDestinationExperience({
      culturalInsights: '',
      jobMarketOverview: [],
      lifestyleTips: '',
      cityscapeImage: [],
      localAmbianceImage: [],
      isLoadingCityscape: true,
      isLoadingAmbiance: true,
    });

    try {
      const textResult = await geminiService.generateDestinationExperienceText(description, language);
      setDestinationExperience(prev => ({ ...prev!, ...textResult }));

      try {
        const cityscapeImage = await geminiService.generateImage(textResult.cityscapeImagePrompt, 'ambiance', '16:9', 1);
        setDestinationExperience(prev => ({ ...prev!, cityscapeImage, isLoadingCityscape: false }));
      } catch (err) {
        console.error("Cityscape image generation failed:", err);
        handleApiError(err);
        setDestinationExperience(prev => ({ ...prev!, cityscapeImage: null, isLoadingCityscape: false }));
      }

      try {
        const localAmbianceImage = await geminiService.generateImage(textResult.localAmbianceImagePrompt, 'ambiance', '16:9', 1);
        setDestinationExperience(prev => ({ ...prev!, localAmbianceImage, isLoadingAmbiance: false }));
      } catch (err) {
        console.error("Ambiance image generation failed:", err);
        handleApiError(err);
        setDestinationExperience(prev => ({ ...prev!, localAmbianceImage: null, isLoadingAmbiance: false }));
      }
    } catch (err) {
      handleApiError(err);
      setDestinationExperience(null);
    } finally {
      setIsGeneratingExperience(false);
    }
  };
  
  const handleFindOfficesForPathway = async (pathway: ImmigrationPathway) => {
    setIsFindingExperienceOffices(true);
    setExperienceOfficeResults(null);
    try {
      const result = await geminiService.findOfficesForPathway(pathway, language);
      setExperienceOfficeResults(result.offices);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsFindingExperienceOffices(false);
    }
  };

  // --- Video Generation Logic (Destination Visualizer) ---
  const handleGenerateVideo = async (prompt: string) => {
      setIsGeneratingVideo(true);
      setGeneratedVideoUrl(null);
      setVideoGenerationProgress('');

      const onProgress = (message: string) => {
          setVideoGenerationProgress(message);
      };
      
      try {
          const videoBlob = await geminiService.generateVideo(
              prompt, 
              onProgress, 
              t('destinationVisualizer.progressMessages')
          );
          const videoUrl = URL.createObjectURL(videoBlob);
          setGeneratedVideoUrl(videoUrl);
      } catch (err) {
          handleApiError(err);
      } finally {
          setIsGeneratingVideo(false);
          setVideoGenerationProgress('');
      }
  };

  // --- Office Finder Logic ---
  const handleGeoSearch = () => {
    setIsFindingOffices(true);
    setOfficeFinderResults(null);
    
    if (!navigator.geolocation) {
      addToast(t('officeFinder.locationError'), 'error');
      setIsFindingOffices(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await geminiService.findOfficialOffices({ latitude, longitude }, language);
          setOfficeFinderResults(result.offices);
        } catch (err) {
          handleApiError(err);
        } finally {
          setIsFindingOffices(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        addToast(t('officeFinder.locationError'), 'error');
        setIsFindingOffices(false);
      }
    );
  };

  const handleTextSearch = async (query: string) => {
    setIsFindingOffices(true);
    setOfficeFinderResults(null);
    try {
      const result = await geminiService.findOfficialOffices({ query }, language);
      setOfficeFinderResults(result.offices);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsFindingOffices(false);
    }
  };
  
  // --- Pathway Analyzer Logic ---
  const handleAnalyzePathway = async (description: string) => {
    setIsAnalyzingPathway(true);
    setPathwayResult(null);
    try {
      const result = await geminiService.analyzePathway(description, language);
      setPathwayResult(result);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsAnalyzingPathway(false);
    }
  };

  // --- Saved Applications Logic ---
  const loadSavedApplications = async () => {
    const applications = await dbService.getAllSavedApplications();
    setSavedApplications(applications);
  };
  
  const handleSaveApplication = async (pathwayToSave: ImmigrationPathway) => {
    const name = pathwayToSave.pathwayTitle;
    if (savedApplications.some(p => p.name === name)) {
      if (!window.confirm("An application with this name already exists. Overwrite it?")) {
        return;
      }
    }
    const newSavedApplication: SavedApplication = {
      id: self.crypto.randomUUID(),
      name: name,
      timestamp: Date.now(),
      state: {
        inputs: eligibilityInputs,
        result: pathwayToSave,
      },
    };
    await dbService.saveApplication(newSavedApplication);
    await loadSavedApplications();
    addToast(`Application "${name}" saved!`, 'success');
  };

  const handleRestoreApplication = (appId: string) => {
    const appToRestore = savedApplications.find(p => p.id === appId);
    if (appToRestore) {
      setEligibilityInputs(appToRestore.state.inputs);
      setImmigrationPathways([appToRestore.state.result]);
      setPage('eligibility_assessment');
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (window.confirm(t('myApplications.deleteConfirm'))) {
      await dbService.deleteApplication(appId);
      await loadSavedApplications();
    }
  };
  
  const handleViewPathway = (pathway: ImmigrationPathway) => {
    setViewingPathway(pathway);
    setIsModalOpen(true);
  };

  const renderPage = () => {
    switch (page) {
      case 'immigration_dashboard':
        return <ImmigrationDashboardPage
                  briefing={immigrationBriefing}
                  isLoading={isGeneratingBriefing}
                  onRefresh={handleGenerateDailyBriefing}
                  setPage={setPage}
                />;
      case 'eligibility_assessment':
        return <EligibilityAssessmentPage
                  onGeneratePathway={handleGetImmigrationPathway}
                  isPathwayLoading={isGeneratingPathway}
                  inputs={eligibilityInputs}
                  setInputs={setEligibilityInputs}
                  immigrationPathways={immigrationPathways}
                  onViewPathway={handleViewPathway}
                  onGenerateGuide={handleGenerateExperience}
                  isGuideLoading={isGeneratingExperience}
                  guideResult={destinationExperience}
                  isQuotaExhausted={isQuotaExhausted}
                  onFindOfficesForGuide={handleFindOfficesForPathway}
                  isFindingGuideOffices={isFindingExperienceOffices}
                  guideOfficeResults={experienceOfficeResults}
                />;
      case 'destination_visualizer':
        return <DestinationVisualizerPage
                  onGenerate={handleGenerateVideo}
                  isLoading={isGeneratingVideo}
                  isQuotaExhausted={isQuotaExhausted}
                  videoUrl={generatedVideoUrl}
                  prompt={videoPrompt}
                  setPrompt={setVideoPrompt}
                  progressMessage={videoGenerationProgress}
                />;
      case 'office_finder':
        return <OfficeFinderPage
                  onGeoSearch={handleGeoSearch}
                  onTextSearch={handleTextSearch}
                  isLoading={isFindingOffices}
                  results={officeFinderResults}
                  isQuotaExhausted={isQuotaExhausted}
                />;
       case 'ai_consultant':
        return <AiConsultantPage
                  chatHistory={chatHistory}
                  isStreaming={isChatStreaming}
                  onSendMessage={handleSendMessage}
                />;
      case 'pathway_analyzer':
        return <PathwayAnalyzerPage
                  onAnalyze={handleAnalyzePathway}
                  isLoading={isAnalyzingPathway}
                  analysis={pathwayResult}
                  isQuotaExhausted={isQuotaExhausted}
                />;
      case 'immigration_news':
        return <ImmigrationNewsPage handleApiError={handleApiError} />;
      case 'our_consultants':
        return <OurConsultantsPage />;
      case 'humanitarian_aid':
      case 'investor':
        return <CorporateInvestmentPage />;
      case 'my_applications':
        return <MyApplicationsPage
                  savedApplications={savedApplications}
                  onRestore={handleRestoreApplication}
                  onDelete={handleDeleteApplication}
                  setPage={setPage}
                />;

      case 'turkey_4x':
        return <Turkey4XPage />;
      case 'admin':
        return <AdminPanel />;
      case 'user_panel':
        return <UserPanel setPage={setPage} />;
      case 'business_analyzer':
        return <BusinessAnalyzer />;
      case 'home':
      default:
        return <HomePage setPage={setPage} />;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <SiteHeader 
        currentPage={page} 
        setPage={setPage}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
      />
      <main>
        {renderPage()}
      </main>
      <SiteFooter siteHealth={siteHealth} onStatusClick={handleOpenLogsModal} />
      <QuotaErrorModal 
        isOpen={isQuotaExhausted} 
        onClose={() => setIsQuotaExhausted(false)}
      />
       <PathwayDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pathway={viewingPathway}
        onSave={handleSaveApplication}
        handleApiError={handleApiError}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
      <SystemLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={errorLogs}
        onClear={handleClearLogs}
      />
      {/* Floating Telegram */}
      <TelegramBotWidget variant="floating" />
    </div>
  );
};

export default App;
