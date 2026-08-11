import React, { useState, useEffect } from 'react';
import {
  ImmigrationPathway,
  useLanguage,
  ApplicationTimeline,
  ApplicationCostResult,
  ApplicationCostItem,
  DocumentPrepPlanResult,
  DocumentPrepItem,
  ImmigrationStep
} from '../types';
import * as geminiService from '../services/geminiService';

interface PathwayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathway: ImmigrationPathway | null;
  onSave: (pathway: ImmigrationPathway) => void;
  handleApiError: (error: unknown) => string;
}

const ImmigrationStepDisplay: React.FC<{ items: ImmigrationStep[], title: string }> = ({ items, title }) => (
  <div>
    <h4 className="text-xl font-bold text-blue-300 mb-4">{title}</h4>
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-start">
          <span className="text-3xl mr-4 rtl:ml-4 rtl:mr-0">{item.icon}</span>
          <div>
            <p className="font-semibold text-white">{item.name}</p>
            <p className="text-sm text-gray-400">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PathwayDetailModal: React.FC<PathwayDetailModalProps> = ({ isOpen, onClose, pathway, onSave, handleApiError }) => {
  const { language, t } = useLanguage();

  const [applicationTimeline, setApplicationTimeline] = useState<ApplicationTimeline | null>(null);
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const [applicationCosts, setApplicationCosts] = useState<ApplicationCostResult | null>(null);
  const [isCalculatingCosts, setIsCalculatingCosts] = useState(false);
  const [costsError, setCostsError] = useState<string | null>(null);
  
  const [documentPrepPlan, setDocumentPrepPlan] = useState<DocumentPrepPlanResult | null>(null);
  const [isGeneratingDocPlan, setIsGeneratingDocPlan] = useState(false);
  const [docPlanError, setDocPlanError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setApplicationTimeline(null);
      setApplicationCosts(null);
      setDocumentPrepPlan(null);
      setTimelineError(null);
      setCostsError(null);
      setDocPlanError(null);
    }
  }, [isOpen]);

  const handleGenerateApplicationTimeline = async () => {
    if (!pathway) return;
    setIsGeneratingTimeline(true);
    setApplicationTimeline(null);
    setTimelineError(null);
    try {
      const result = await geminiService.generateApplicationTimeline(pathway, language);
      setApplicationTimeline(result);
    } catch (err) {
      setTimelineError(handleApiError(err));
    } finally {
      setIsGeneratingTimeline(false);
    }
  };
  
  const handleCalculateCosts = async () => {
    if (!pathway) return;
    setIsCalculatingCosts(true);
    setApplicationCosts(null);
    setCostsError(null);
    try {
      const result = await geminiService.calculateApplicationCosts(pathway, language);
      setApplicationCosts(result);
    } catch (err) {
      setCostsError(handleApiError(err));
    } finally {
      setIsCalculatingCosts(false);
    }
  };
  
  const handleGenerateDocumentPrepPlan = async () => {
    if (!pathway) return;
    setIsGeneratingDocPlan(true);
    setDocumentPrepPlan(null);
    setDocPlanError(null);
    try {
      const result = await geminiService.generateDocumentPrepPlan(pathway, language);
      setDocumentPrepPlan(result);
    } catch (err) {
      setDocPlanError(handleApiError(err));
    } finally {
      setIsGeneratingDocPlan(false);
    }
  };

  if (!isOpen || !pathway) {
    return null;
  }
  
  const totalCost = applicationCosts?.applicationCosts.reduce((acc, item) => acc + item.estimatedCost, 0) ?? 0;

  const DocumentPrepPlanSection: React.FC<{ items: DocumentPrepItem[], title: string }> = ({ items, title }) => (
    items.length > 0 ? (
      <div>
        <h5 className="font-bold text-white mb-2">{title}</h5>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
          {items.map((item, i) => <li key={i}><strong>{item.document}:</strong> {item.details}</li>)}
        </ul>
      </div>
    ) : null
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 border border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-5 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h3 className="text-2xl font-bold text-white tracking-tight">{pathway.pathwayTitle}</h3>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main className="p-6 sm:p-8 overflow-y-auto space-y-8">
          <ImmigrationStepDisplay items={pathway.suggestedSteps} title={t('pathwayDetailModal.treatments')} />

          <div className="p-4 bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-300 text-sm">
            <p className="font-bold mb-1">{t('pathwayDetailModal.disclaimerTitle')}</p>
            <p>{pathway.disclaimer}</p>
          </div>
          
          {/* Application Timeline */}
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-xl font-bold text-blue-300 mb-4">{t('pathwayDetailModal.aftercareTitle')}</h4>
            {!applicationTimeline && (
              <button onClick={handleGenerateApplicationTimeline} disabled={isGeneratingTimeline} className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-gray-500">
                {isGeneratingTimeline ? t('pathwayDetailModal.generatingAftercare') : t('pathwayDetailModal.generateAftercareButton')}
              </button>
            )}
            {timelineError && <p className="text-red-400 mt-2 text-sm">{timelineError}</p>}
            {applicationTimeline && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h5 className="font-semibold text-white mb-2">{t('pathwayDetailModal.instructions')}</h5>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {applicationTimeline.preparation.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-white mb-2">{t('pathwayDetailModal.precautions')}</h5>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {applicationTimeline.submission.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                 <div>
                  <h5 className="font-semibold text-white mb-2">{t('pathwayDetailModal.evening')}</h5>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {applicationTimeline.postSubmission.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Cost Analysis */}
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-xl font-bold text-blue-300 mb-4">{t('pathwayDetailModal.costAnalysisTitle')}</h4>
             {!applicationCosts && (
              <button onClick={handleCalculateCosts} disabled={isCalculatingCosts} className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-gray-500">
                {isCalculatingCosts ? t('pathwayDetailModal.calculatingCosts') : t('pathwayDetailModal.calculateCostsButton')}
              </button>
            )}
            {costsError && <p className="text-red-400 mt-2 text-sm">{costsError}</p>}
            {applicationCosts && (
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-400">
                  <tr>
                    <th className="p-2">{t('pathwayDetailModal.tableHeaderItem')}</th>
                    <th className="p-2 text-right">{t('pathwayDetailModal.tableHeaderCost')}</th>
                    <th className="p-2">{t('pathwayDetailModal.tableHeaderUnit')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {applicationCosts.applicationCosts.map((item: ApplicationCostItem, i: number) => (
                    <tr key={i}>
                      <td className="p-2 text-white">{item.name}</td>
                      <td className="p-2 text-right font-mono text-white">{item.estimatedCost.toLocaleString()}</td>
                      <td className="p-2 text-gray-400">{item.currency}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-600">
                  <tr>
                    <td className="p-2 font-bold text-white">{t('pathwayDetailModal.tableHeaderTotal')}</td>
                    <td className="p-2 text-right font-bold font-mono text-white">{totalCost.toLocaleString()} {t('pathwayDetailModal.currency')}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Document Prep Plan */}
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-xl font-bold text-blue-300 mb-4">{t('pathwayDetailModal.prePlanTitle')}</h4>
            {!documentPrepPlan && (
              <button onClick={handleGenerateDocumentPrepPlan} disabled={isGeneratingDocPlan} className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-gray-500">
                {isGeneratingDocPlan ? t('pathwayDetailModal.generatingPrePlan') : t('pathwayDetailModal.generatePrePlanButton')}
              </button>
            )}
            {docPlanError && <p className="text-red-400 mt-2 text-sm">{docPlanError}</p>}
            {documentPrepPlan && (
              <div className="space-y-6">
                <DocumentPrepPlanSection items={documentPrepPlan.threeMonthsBefore} title={t('pathwayDetailModal.oneWeekBefore')} />
                <DocumentPrepPlanSection items={documentPrepPlan.oneMonthBefore} title={t('pathwayDetailModal.dayBefore')} />
                <DocumentPrepPlanSection items={documentPrepPlan.oneWeekBefore} title={t('pathwayDetailModal.dayOf')} />
              </div>
            )}
          </div>

        </main>
        
        <footer className="p-5 border-t border-gray-700 flex-shrink-0 text-right">
          <button onClick={() => { onSave(pathway); onClose(); }} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">
            {t('pathwayDetailModal.savePlan')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PathwayDetailModal;
