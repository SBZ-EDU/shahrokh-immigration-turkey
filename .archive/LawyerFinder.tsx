

import React, { useState, useCallback, useMemo, useEffect } from 'react';
// FIX: Imported the correct function name. The original `generateMatches` was missing.
import { generateMatches } from '../services/geminiService';
// FIX: Imported missing types `MatchProfile` and `CompatibilityResult`.
import { MatchProfile, CompatibilityResult, useLanguage } from '../types';
import { PROMPTS } from '../constants';


const parseProviderData = (markdown: string): MatchProfile[] => {
    const profiles: MatchProfile[] = [];
    const tableRows = markdown.split('\n').map(row => row.trim()).filter(row => row.startsWith('|') && row.endsWith('|'));

    if (tableRows.length >= 2 && tableRows.some(row => row.includes('---'))) {
        const headers = tableRows[0].split('|').map(h => h.trim().toLowerCase()).slice(1, -1);
        const headerMap: { [key: string]: number } = {};
        
        const keyMap: { [key in keyof MatchProfile | 'compatibilityScore']?: string[] } = {
            name: ['name', 'نام'], age: ['age', 'سن'], city: ['city', 'شهر'], bio: ['bio', 'بیوگرافی'],
            interests: ['interests', 'علایق'], compatibilityScore: ['compatibility', 'سازگاری', 'امتیاز سازگاری']
        };

        headers.forEach((header, index) => {
            for (const key in keyMap) {
                if (keyMap[key as keyof typeof keyMap]?.some(alias => header.includes(alias))) {
                    headerMap[key] = index;
                    break;
                }
            }
        });

        if (headerMap.name !== undefined && headerMap.city !== undefined) {
            const dataRows = tableRows.slice(1).filter(row => !row.includes('---'));
            dataRows.forEach(row => {
                const columns = row.split('|').map(col => col.trim()).slice(1, -1);
                const name = columns[headerMap.name] ?? '';
                if (!name) return;
                
                const rawScore = headerMap.compatibilityScore !== undefined ? columns[headerMap.compatibilityScore] : '0';
                const compatibilityScore = parseInt(rawScore.replace('%', '').trim() || '0', 10);
                const age = parseInt(columns[headerMap.age] ?? '0', 10);
                
                profiles.push({
                    id: `${name.replace(/\s/g, '-')}-${columns[headerMap.city] ?? 'unknown'}-${age}`,
                    name,
                    age: isNaN(age) ? 0 : age,
                    city: columns[headerMap.city] ?? 'N/A',
                    bio: columns[headerMap.bio] ?? 'N/A',
                    interests: columns[headerMap.interests] ?? 'N/A',
                    compatibilityScore: isNaN(compatibilityScore) ? 0 : compatibilityScore,
                });
            });
        }
    }
    return profiles;
};

interface MatchFinderProps {
  savedProviders: MatchProfile[];
  onSaveProvider: (provider: MatchProfile) => void;
  onRemoveProvider: (provider: MatchProfile) => void;
  onClearAllSaved: () => void;
  onNoteChange: (index: number, note: string) => void;
  keywords: string;
  setKeywords: (value: React.SetStateAction<string>) => void;
  handleApiError: (err: unknown) => string;
  isQuotaExhausted: boolean;
  allProviders: MatchProfile[];
  onProvidersFound: (providers: MatchProfile[]) => void;
  onClearAllDbProviders: () => void;
  triggerSearch: boolean;
  onSearchTriggered: () => void;
  onRequestResearch: (topic: string) => void;
  compatibilityResult: CompatibilityResult | null;
}

type SortKey = 'compatibilityScore' | 'city' | 'name';

const MatchFinder: React.FC<MatchFinderProps> = ({ 
    savedProviders,
    onSaveProvider,
    onRemoveProvider,
    onClearAllSaved,
    onNoteChange,
    keywords,
    setKeywords,
    handleApiError,
    isQuotaExhausted,
    allProviders,
    onProvidersFound,
    onClearAllDbProviders,
    triggerSearch,
    onSearchTriggered,
    onRequestResearch,
    compatibilityResult,
}) => {
    const { language, t } = useLanguage();
    const [maxResults, setMaxResults] = useState<number>(10);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [rawTextResult, setRawTextResult] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('compatibilityScore');

    const handleSearch = useCallback(async () => {
        if (!compatibilityResult) {
            setError(t('matchFinder.validationError'));
            return;
        }
        setError(null);
        setRawTextResult(null);
        setIsLoading(true);

        const userProfileText = `Personality traits are: ${compatibilityResult.personalityTraits.map(p => p.name).join(', ')}.`;
        const partnerTraitsText = `Ideal partner traits are: ${compatibilityResult.idealPartnerTraits.join(', ')}.`;

        // FIX: Corrected prompt key from `matchGenerator` to use the one defined in constants.
        const prompt = PROMPTS.matchGenerator(language)
            .replace('{user_profile}', userProfileText)
            .replace('{partner_traits}', partnerTraitsText)
            .replace('{maxResults}', maxResults.toString());

        try {
            const resultText = await generateMatches(prompt);
            const parsed = parseProviderData(resultText);
            
            if (parsed.length > 0) {
                onProvidersFound(parsed);
            } else {
                if (resultText) {
                    setRawTextResult(resultText);
                }
            }
        } catch (err) {
            const msg = handleApiError(err);
            setError(msg);
        } finally { setIsLoading(false); }
    }, [compatibilityResult, maxResults, t, handleApiError, onProvidersFound, language]);
    
    useEffect(() => {
      if (triggerSearch) {
        handleSearch();
        onSearchTriggered(); // Reset the trigger in the parent component
      }
    }, [triggerSearch, handleSearch, onSearchTriggered]);

    const isProviderSaved = useCallback((provider: MatchProfile): boolean => {
        return savedProviders.some(p => p.id === provider.id);
    }, [savedProviders]);

    const sortedProviders = useMemo(() => {
        return [...allProviders].sort((a, b) => {
            switch (sortKey) {
                case 'compatibilityScore': return (b.compatibilityScore ?? 0) - (a.compatibilityScore ?? 0);
                case 'city': return (a.city ?? '').localeCompare(b.city ?? '');
                case 'name': return (a.name ?? '').localeCompare(b.name ?? '');
                default: return 0;
            }
        });
    }, [allProviders, sortKey]);

    return (
        <section id="provider-finder" className="py-12 sm:py-16 space-y-12">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white">{t('matchFinder.title')}</h2>
                <p className="mt-2 text-gray-400 max-w-2xl mx-auto">{t('matchFinder.subtitle')}</p>
            </div>

            <div className="max-w-3xl mx-auto bg-gray-800/50 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-white/10 space-y-6">
                <div>
                    <label htmlFor="max-results" className="block text-sm font-medium text-gray-300">{t('matchFinder.maxResults')} ({maxResults})</label>
                    <input id="max-results" type="range" min="5" max="25" step="5" value={maxResults} onChange={(e) => setMaxResults(Number(e.target.value))}
                        className="mt-1 block w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                </div>
                <div>
                    <button onClick={handleSearch} disabled={isLoading || !compatibilityResult || isQuotaExhausted}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-rose-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                        {isLoading ? t('matchFinder.finding') : isQuotaExhausted ? t('quotaErrorModal.title') : t('matchFinder.findButton')}
                    </button>
                    {!compatibilityResult && <p className="text-xs text-center mt-2 text-yellow-400">{t('matchFinder.validationError')}</p>}
                </div>
            </div>
            
            {savedProviders.length > 0 && (
                <div className="mt-12 space-y-8 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-white">{t('matchFinder.savedTitle')}</h3>
                        <button onClick={onClearAllSaved} className="px-3 py-1 bg-red-800/70 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors">{t('matchFinder.clearAll')}</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedProviders.map((provider, index) => (
                            <div key={`${provider.id}-${index}`} className="bg-gray-800/50 rounded-lg shadow-lg backdrop-blur-sm border border-white/10 p-6 flex flex-col">
                                <h4 className="text-lg font-bold text-teal-300">{provider.name}, {provider.age}</h4>
                                <p className="text-sm text-gray-400">{provider.city}</p>
                                
                                <div className="text-sm text-gray-300 space-y-2 mt-4 pt-4 border-t border-white/10">
                                    <p><strong>{t('matchFinder.bio')}:</strong> {provider.bio}</p>
                                    <p><strong>{t('matchFinder.interests')}:</strong> {provider.interests}</p>
                                    <p><strong>{t('matchFinder.relevance')}:</strong> <span className="font-bold text-teal-300">{provider.compatibilityScore}%</span></p>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-white/10 flex-grow">
                                    <label htmlFor={`notes-${index}`} className="block text-sm font-medium text-gray-300 mb-2">{t('matchFinder.notesLabel')}</label>
                                    <textarea id={`notes-${index}`} rows={3}
                                        className="w-full h-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white transition-colors"
                                        placeholder={t('matchFinder.notesPlaceholder')} value={provider.notes || ''} onChange={(e) => onNoteChange(index, e.target.value)} />
                                </div>
                                <div className="mt-6">
                                     <button onClick={() => onRemoveProvider(provider)} className="w-full text-center bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition-colors">{t('matchFinder.remove')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-12 space-y-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-white">{t('matchFinder.crateTitle')}</h3>
                        <p className="text-sm text-gray-400">{t('matchFinder.crateSubtitle')}</p>
                    </div>
                    {allProviders.length > 0 &&
                        <button onClick={onClearAllDbProviders} className="px-3 py-1 bg-red-800/70 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors">{t('matchFinder.clearCrate')}</button>
                    }
                </div>

                {isLoading && (
                    <div className="text-center p-8"><div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-rose-400 mx-auto"></div></div>
                )}
                {error && !error.includes('(Quota Exceeded)') && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}
                
                {!isLoading && (
                    <div className="space-y-6">
                        {sortedProviders.length > 0 ? (
                            <>
                                <div className="flex justify-end">
                                    <label htmlFor="sort-key" className="text-sm text-gray-400 self-center mr-2">{t('matchFinder.rankBy')}:</label>
                                    <select id="sort-key" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
                                        className="bg-gray-700 border-gray-600 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm text-white">
                                        <option value="compatibilityScore">{t('matchFinder.sort.relevance')}</option>
                                        <option value="city">{t('matchFinder.sort.city')}</option>
                                        <option value="name">{t('matchFinder.sort.name')}</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {sortedProviders.map((provider) => (
                                        <div key={provider.id} className="bg-gray-800/50 rounded-lg p-6 flex flex-col border border-white/10">
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-lg font-bold text-teal-300 truncate" title={provider.name}>{provider.name}, {provider.age}</h4>
                                                    <span className="text-sm font-bold text-teal-300 bg-teal-900/50 px-3 py-1 rounded-full">{provider.compatibilityScore}%</span>
                                                </div>
                                                <p className="text-sm text-gray-400 mb-3">{provider.city}</p>
                                                <div className="space-y-2 text-sm">
                                                    <p><strong className="text-gray-300">{t('matchFinder.bio')}:</strong> {provider.bio}</p>
                                                    <p><strong className="text-gray-300">{t('matchFinder.interests')}:</strong> {provider.interests}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-end">
                                                <button onClick={() => onSaveProvider(provider)} disabled={isProviderSaved(provider)} className="text-center font-semibold py-2 px-4 rounded-md transition-colors bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed">{isProviderSaved(provider) ? t('matchFinder.saved') : t('matchFinder.save')}</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            rawTextResult ? (
                                <div className="p-6 bg-gray-800/50 border border-white/10 rounded-lg">
                                    <h4 className="font-semibold text-white mb-2">{t('matchFinder.parseErrorTitle')}</h4>
                                    <p className="text-sm text-gray-400 mb-4">{t('matchFinder.parseErrorSubtitle')}</p>
                                    <pre className="whitespace-pre-wrap bg-gray-900/50 p-4 rounded-md text-sm text-gray-300">{rawTextResult}</pre>
                                </div>
                            ) : (
                                !error && <div className="text-center text-gray-500 py-10 bg-gray-800/30 rounded-lg"><p>{t('matchFinder.crateEmpty')}</p></div>
                            )
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default MatchFinder;
