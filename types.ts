
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from './constants';

export type Language = 'en' | 'fa' | 'pt' | 'tr' | 'ar';
export type Page = 'home' | 'turkey_4x' | 'immigration_dashboard' | 'eligibility_assessment' | 'immigration_news' | 'my_applications' | 'pathway_analyzer' | 'office_finder' | 'ai_consultant' | 'our_consultants' | 'humanitarian_aid' | 'investor' | 'destination_visualizer' | 'admin' | 'user_panel';

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const detectInitialLanguage = (): Language => {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'fa';
    if (nav.startsWith('fa')) return 'fa';
    if (nav.startsWith('ar')) return 'ar';
    if (nav.startsWith('tr')) return 'tr';
    if (nav.startsWith('pt')) return 'pt';
    // Default to Farsi as requested for Shahrokh group (Iran -> Istanbul)
    return 'fa';
  } catch { return 'fa'; }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(detectInitialLanguage());

  const t = (key: string, replacements: { [key: string]: string | number } = {}): any => {
    const keys = key.split('.');
    let result: any = (translations as any)[language] ?? (translations as any)['en'];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // fallback to English
        let fallback: any = (translations as any)['en'];
        for (const fk of keys) fallback = fallback?.[fk];
        if (fallback !== undefined) { result = fallback; break; }
        console.warn(`Translation not found for key: ${key}`);
        return key;
      }
    }

    if (typeof result === 'string') {
      return Object.entries(replacements).reduce((acc, [placeholder, value]) => {
        return acc.replace(new RegExp(`{${placeholder}}`, 'g'), String(value));
      }, result);
    }
    
    return result;
  };

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// --- AI Immigration Visa Types ---

export interface EligibilityInputs {
  profileDescription: string;
  useHistory: boolean;
  backgroundInfo: string;
  supportingDocument: {
    base64: string;
    mimeType: string;
  } | null;
}

export interface ImmigrationStep {
  icon: string;
  name: string;
  description: string;
  duration: string;
}

export interface ImmigrationPathway {
  pathwayTitle: string;
  profileSummary: string;
  suggestedSteps: ImmigrationStep[];
  disclaimer: string;
}

export interface SavedApplication {
  id: string;
  name: string;
  timestamp: number;
  state: {
    inputs: EligibilityInputs;
    result: ImmigrationPathway;
  };
}

export interface Source {
  title: string;
  uri: string;
}

export interface QuickSummary {
  type: 'quick';
  summary: string;
  sources: Source[];
  suggestedQueries: string[];
}

export interface InDepthAnalysis {
  type: 'in-depth';
  keyTakeaways: string[];
  detailedSummary: string;
  actionableTips: { name: string; description: string }[];
  potentialBenefits: string[];
  risksToConsider: string[];
  sources: Source[];
  suggestedQueries: string[];
}

export interface MythBusting {
  type: 'myth-busting';
  commonMyths: string[];
  factualClarifications: string[];
  expertOpinions: string[];
  sources: Source[];
  suggestedQueries: string[];
}

export type ImmigrationNewsResult = QuickSummary | InDepthAnalysis | MythBusting;
export type NewsAnalysisMode = 'quick' | 'in-depth' | 'myth-busting';


export interface ApplicationTimeline {
    preparation: string[];
    submission: string[];
    postSubmission: string[];
}

export interface PathwayAnalysisResult {
  primaryPathway: string;
  pathwayDescription: string;
  potentialCountries: string[];
  nextSteps: string[];
  eligibilityFactors: string[];
  disclaimer: string;
}

export interface DestinationExperience {
  culturalInsights: string;
  jobMarketOverview: string[];
  lifestyleTips: string;
  cityscapeImage: string[] | null;
  localAmbianceImage: string[] | null;
  isLoadingCityscape: boolean;
  isLoadingAmbiance: boolean;
}

export interface OfficialOffice {
  name: string;
  address: string;
  description: string;
  phone?: string;
  website?: string;
  services?: string[];
  rating?: number;
}

export interface OfficeFinderResult {
  offices: OfficialOffice[];
}

export interface ApplicationCostItem {
  name: string;
  estimatedCost: number;
  currency: string;
}

export interface ApplicationCostResult {
  applicationCosts: ApplicationCostItem[];
}

export interface DocumentPrepItem {
  document: string;
  details: string;
}

export interface DocumentPrepPlanResult {
  threeMonthsBefore: DocumentPrepItem[];
  oneMonthBefore: DocumentPrepItem[];
  oneWeekBefore: DocumentPrepItem[];
}

export interface ConsultantProfile {
  name: string;
  specialty: string;
  bio: string;
  credentials: string;
}

export interface ImmigrationBriefing {
  visaTip: string;
  // FIX: Removed space from property name `country Spotlight` to make it a valid identifier.
  countrySpotlight: {
    name: string;
    description: string;
    icon: string;
  };
  quickFact: {
    question: string;
    answer: string;
  };
  positiveNews: {
    summary: string;
    source: Source;
  };
}

// --- Site Health & Logging ---
export type SiteHealth = 'healthy' | 'degraded' | 'error';

export interface ErrorLog {
  id: string;
  timestamp: number;
  message: string;
  details: string; // JSON string of the full error object
}


// --- Chat Types ---
export interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

// FIX: Added missing types for unused/legacy components to resolve compilation errors.

// For ReportGenerator.tsx (legacy version of MyApplications)
export type SavedReport = SavedApplication;

// For GeneratorForm.tsx
export interface CompatibilityDetails {
  dealbreakers: string;
  conflictStyle: string;
  longDistancePreference: string;
  currentJob: string;
  workEnvironment: string;
}

// For ReportDisplay.tsx and LawyerFinder.tsx
export interface PersonalityTrait {
  name: string;
  description: string;
  relevance: 'Low' | 'Medium' | 'High';
  suggestedStep: string;
  details?: string;
  isLoadingDetails?: boolean;
  detailsError?: string;
  furtherReading?: string;
  isLoadingFurtherReading?: boolean;
  furtherReadingError?: string;
}
export interface DateIdea {
  ideaTitle: string;
  icon: string;
  description: string;
}
export interface CompatibilityResult {
  disclaimer: string;
  idealPartnerTraits: string[];
  personalityTraits: PersonalityTrait[];
  lifestyleAnalysis?: string;
  suggestedFirstDateIdeas?: DateIdea[];
  followUpQuestions?: string[];
}

// For GoogleBabaModal.tsx
export interface ChangelogChange {
  type: 'new' | 'improvement' | 'fix';
  text: string;
}
export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    [key in Language]: ChangelogChange[];
  };
}

// For LawyerFinder.tsx
export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string;
  compatibilityScore: number;
  notes?: string;
}

// For DatingSimulator.tsx
export type Difficulty = 'easy' | 'hard';
export interface AnalysisResult {
  scores: { empathy: number; clarity: number; confidence: number; engagement: number; };
  strengths: string;
  areasForImprovement: string;
  suggestedNextStep: string;
}
export interface ConversationCoachState {
  chatHistory: Message[];
  isStreaming: boolean;
  isLoadingAnalysis: boolean;
  currentAnalysis: AnalysisResult | null;
  activeGoal: Goal | null;
  practiceCount: number;
  completedScenarios: { [scenarioId: string]: Difficulty[] };
  activeScenarioId: string | null;
  activeTrainingPathId: string | null;
  activeDifficulty: Difficulty | null;
}
export interface Goal {
  id: string;
  title: { [key in Language]: string };
  description: { [key in Language]: string };
  maxPractices: number;
}
export interface TrainingScenario {
  id: string;
  title: { [key in Language]: string };
  description: { [key in Language]: string };
  goals: Goal[];
}
export interface TrainingPath {
  id: string;
  title: { [key in Language]: string };
  description: { [key in Language]: string };
  scenarios: TrainingScenario[];
}

// For BaristaStyler.tsx
export interface BaristaStyleResult {
    femaleOutfitUrls: string[] | null;
    isLoadingFemaleOutfits: boolean;
    maleOutfitUrls: string[] | null;
    isLoadingMaleOutfits: boolean;
    counterUrls: string[] | null;
    isLoadingCounterDesigns: boolean;
    musicTheme: string | null;
}
