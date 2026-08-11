
import React, { useState, useEffect, useRef } from 'react';
// FIX: Imported several missing types and constants for this unused component to resolve compilation errors.
import { ConversationCoachState, Goal, Message, useLanguage, TrainingPath, TrainingScenario, Difficulty } from '../types';
import { TRAINING_PATHS } from '../constants';

interface ConversationCoachProps {
  state: ConversationCoachState;
  setState: React.Dispatch<React.SetStateAction<ConversationCoachState>>;
  onSendMessage: (message: string) => void;
  onEndSession: () => void;
  onStartPractice: (goal: Goal) => void;
  onNextPractice: () => void;
  onReset: (isEndingScenario?: boolean) => void;
  onFullReset: () => void;
  activePath: TrainingPath | null;
  activeScenario: TrainingScenario | null;
  onStartTrainingPath: (path: TrainingPath) => void;
  onStartScenario: (scenario: TrainingScenario, difficulty: Difficulty) => void;
  onExitTraining: () => void;
}

const partnerOptions = [
  { id: 'supportive', name: 'همراه و همدل', en: 'Supportive & Empathetic' },
  { id: 'direct', name: 'رک و منطقی', en: 'Direct & Logical' },
  { id: 'playful', name: 'شوخ و پرانرژی', en: 'Playful & Witty' },
  { id: 'reserved', name: 'متفکر و آرام', en: 'Thoughtful & Reserved' },
];

const ConversationCoach: React.FC<ConversationCoachProps> = ({
  state,
  setState,
  onSendMessage,
  onEndSession,
  onStartPractice,
  onNextPractice,
  onReset,
  onFullReset,
  activePath,
  activeScenario,
  onStartTrainingPath,
  onStartScenario,
  onExitTraining
}) => {
  const { language, t } = useLanguage();
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [difficultyModalScenario, setDifficultyModalScenario] = useState<TrainingScenario | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory]);
  
  const handleSend = () => {
    if (userInput.trim()) {
      onSendMessage(userInput);
      setUserInput('');
    }
  };

  const renderMessage = (msg: Message, index: number) => (
    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-rose-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
        <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.parts[0].text}</p>
      </div>
    </div>
  );
  
  const renderPathSelection = () => (
    <div className="bg-gray-800/50 rounded-lg p-6 sm:p-8 shadow-lg backdrop-blur-sm border border-white/10 animate-fade-in">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{t('coach.trainingPathsTitle')}</h2>
            <p className="mt-2 text-gray-400 max-w-2xl mx-auto">{t('coach.trainingPathsSubtitle')}</p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {TRAINING_PATHS.map(path => (
                <div key={path.id} className="bg-gray-900/50 p-6 rounded-lg border border-white/10 flex flex-col items-center text-center">
                    <h3 className="text-xl font-semibold text-rose-300">{path.title[language]}</h3>
                    <p className="text-sm text-gray-400 mt-2 flex-grow">{path.description[language]}</p>
                    <button
                        onClick={() => onStartTrainingPath(path)}
                        className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-rose-500"
                    >
                        {t('coach.startPathButton')}
                    </button>
                </div>
            ))}
        </div>
    </div>
  );

  const renderActivePath = () => {
    if (!activePath) return null;
    return (
        <div className="bg-gray-800/50 rounded-lg p-6 sm:p-8 shadow-lg backdrop-blur-sm border border-white/10 animate-fade-in">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white">{activePath.title[language]}</h2>
                    <p className="mt-1 text-gray-400">{activePath.description[language]}</p>
                </div>
                <button onClick={onExitTraining} className="text-sm text-gray-400 hover:text-white">&times; {t('coach.exitTraining')}</button>
            </div>
            <div className="mt-8 space-y-4">
                {activePath.scenarios.map((scenario) => {
                    const completions = state.completedScenarios[scenario.id] || [];
                    const easyCompleted = completions.includes('easy');
                    const hardCompleted = completions.includes('hard');
                    
                    return (
                        <div key={scenario.id} className="bg-gray-900/50 p-4 rounded-lg border border-white/10 flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h4 className="font-semibold text-white">{scenario.title[language]}</h4>
                                <p className="text-xs text-gray-400 mt-1">{scenario.description[language]}</p>
                                
                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/15">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                                        easyCompleted 
                                            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                            : 'bg-gray-700/50 text-gray-400 border-gray-600'
                                    }`}>
                                        {easyCompleted ? '✓ ' : ''}{t('coach.easy')}
                                    </span>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                                        hardCompleted 
                                            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                            : 'bg-gray-700/50 text-gray-400 border-gray-600'
                                    }`}>
                                        {hardCompleted ? '✓ ' : ''}{t('coach.hard')}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setDifficultyModalScenario(scenario)}
                                className="self-center px-4 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors text-sm shadow-lg flex-shrink-0"
                            >
                                {t('coach.practiceButton')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };
  
  const renderAnalysis = () => (
    <div className="p-6 bg-gray-900/50 rounded-lg border border-white/10 animate-fade-in">
        {state.isLoadingAnalysis ? (
             <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-rose-400"></div>
                <p className="mt-4 text-gray-400">{t('coach.analyzing')}</p>
             </div>
        ) : state.currentAnalysis ? (
            <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-bold text-white mb-3 text-center">{t('coach.analysisTitle')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {(Object.keys(state.currentAnalysis.scores) as (keyof typeof state.currentAnalysis.scores)[]).map(key => (
                            <div key={key} className="bg-gray-700/50 p-3 rounded-lg">
                                {/* FIX: Explicitly convert `key` to a string in the template literal to avoid implicit conversion errors with strict TypeScript settings. */}
                                <div className="text-xs font-bold uppercase text-gray-400">{t(`coach.scores.${String(key)}`)}</div>
                                <div className="text-2xl font-bold text-rose-300">{state.currentAnalysis!.scores[key]}%</div>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div>
                    <h4 className="font-semibold text-gray-200">{t('coach.strengths')}</h4>
                    <p className="text-sm text-gray-300 mt-1">{state.currentAnalysis.strengths}</p>
                 </div>
                  <div>
                    <h4 className="font-semibold text-gray-200">{t('coach.areasForImprovement')}</h4>
                    <p className="text-sm text-gray-300 mt-1">{state.currentAnalysis.areasForImprovement}</p>
                 </div>
                 <div className="p-4 bg-rose-900/30 border-l-4 border-rose-500 text-rose-200 text-sm">
                    <h4 className="font-bold">{t('coach.suggestedNextStep')}</h4>
                    <p>{state.currentAnalysis.suggestedNextStep}</p>
                 </div>
                 <div className="flex justify-between items-center pt-4 border-t border-white/15">
                     <button onClick={() => onReset(true)} className="text-sm font-semibold text-gray-300 hover:text-white">{t('coach.endScenario')}</button>
                     {state.activeGoal && state.practiceCount < state.activeGoal.maxPractices && (
                        <button onClick={onNextPractice} className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors">{t('coach.nextPractice')} ({state.practiceCount}/{state.activeGoal.maxPractices})</button>
                     )}
                 </div>
            </div>
        ) : null}
    </div>
  );

  const renderActiveScenario = () => {
    if (!activeScenario) return null;

    return (
       <div className="animate-fade-in">
            {state.currentAnalysis ? renderAnalysis() : (
                <>
                  <div className="p-4 text-center bg-gray-900/50 rounded-lg border-b border-white/10 mb-4">
                     <h2 className="font-bold text-white">{activeScenario.title[language]}</h2>
                     <p className="text-xs text-gray-400">{t(`coach.${state.activeDifficulty}`)}</p>
                  </div>
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {state.chatHistory.map(renderMessage)}
                    {state.isStreaming && renderMessage({ role: 'model', parts: [{ text: '' }] }, state.chatHistory.length)}
                    <div ref={chatEndRef}></div>
                  </div>
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-start gap-3">
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder={t('coach.placeholder')}
                        className="flex-grow bg-gray-700 border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-white resize-none max-h-32"
                        rows={1}
                        disabled={state.isStreaming}
                      />
                      <button 
                        type="button"
                        onClick={handleSend}
                        disabled={state.isStreaming || !userInput.trim()} 
                        className="p-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex-shrink-0"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                      </button>
                    </div>
                     <div className="text-center mt-3">
                         <button onClick={onEndSession} disabled={state.isStreaming} className="text-xs text-gray-400 hover:text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-colors">{t('coach.endSession')}</button>
                     </div>
                  </div>
                </>
            )}
       </div>
    );
  };

  const DifficultyModal: React.FC<{ scenario: TrainingScenario, onClose: () => void }> = ({ scenario, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] animate-fade-in" onClick={onClose}>
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 border border-rose-500/50" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white text-center">{scenario.title[language]}</h3>
            <p className="text-sm text-gray-400 text-center mt-2 mb-6">{t('coach.difficultyPrompt')}</p>
            <div className="flex flex-col gap-3">
                <button
                    onClick={() => { onStartScenario(scenario, 'easy'); onClose(); }}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
                >
                    {t('coach.easy')}
                </button>
                 <button
                    onClick={() => { onStartScenario(scenario, 'hard'); onClose(); }}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
                >
                    {t('coach.hard')}
                </button>
            </div>
        </div>
    </div>
  );


  return (
    <>
    <section id="coach" className="py-16 sm:py-24 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
         {state.activeScenarioId ? renderActiveScenario() : state.activeTrainingPathId ? renderActivePath() : renderPathSelection()}
         {difficultyModalScenario && <DifficultyModal scenario={difficultyModalScenario} onClose={() => setDifficultyModalScenario(null)} />}
      </div>
    </section>
    </>
  );
};

export default ConversationCoach;
