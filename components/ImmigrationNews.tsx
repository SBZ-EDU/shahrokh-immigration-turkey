import React, { useState } from 'react';
import { useLanguage, ImmigrationNewsResult, InDepthAnalysis, MythBusting, QuickSummary, NewsAnalysisMode, Source } from '../types';
import * as geminiService from '../services/geminiService';

interface ImmigrationNewsPageProps {
    handleApiError: (err: unknown) => string;
}

const parseImmigrationNews = (jsonResponse: string, mode: NewsAnalysisMode): ImmigrationNewsResult => {
    const { text, sources } = JSON.parse(jsonResponse);

    const getSectionContent = (header: string): string => {
        const regex = new RegExp(`## ${header}\\n([\\s\\S]*?)(?=\\n##|\\n###|$)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    };

    const getBulletedList = (header: string): string[] => {
        const content = getSectionContent(header);
        return content.split('\n').map(s => s.replace(/^- \s*/, '').trim()).filter(Boolean);
    };

    const getSuggestedQueries = (): string[] => {
        const regex = /### Suggested Queries\s*([\s\\S]*)/i;
        const match = text.match(regex);
        if (match && match[1]) {
            return match[1].split('\n').map(q => q.replace(/^- /, '').trim()).filter(Boolean);
        }
        return [];
    };

    const suggestedQueries = getSuggestedQueries();

    switch (mode) {
        case 'in-depth':
            const tipsContent = getSectionContent('Actionable Advice');
            const actionableTips = tipsContent.split('\n').map(line => {
                const match = line.match(/\*\*(.*?):\*\*\s*(.*)/);
                if (match) {
                    return { name: match[1].trim(), description: match[2].trim() };
                }
                return null;
            }).filter((t): t is { name: string; description: string } => t !== null);

            return {
                type: 'in-depth',
                keyTakeaways: getBulletedList('Key Takeaways'),
                detailedSummary: getSectionContent('Detailed Summary'),
                actionableTips,
                potentialBenefits: getBulletedList('Potential Opportunities'),
                risksToConsider: getBulletedList('Challenges to Consider'),
                sources,
                suggestedQueries,
            };
        case 'myth-busting':
            return {
                type: 'myth-busting',
                commonMyths: getBulletedList('Common Misconceptions'),
                factualClarifications: getBulletedList('Factual Clarifications'),
                expertOpinions: getBulletedList('Official Statements/Opinions'),
                sources,
                suggestedQueries,
            };
        case 'quick':
        default:
             const summaryMatch = text.match(/([\s\\S]*?)(?=\n### Suggested Queries|$)/);
            return {
                type: 'quick',
                summary: summaryMatch ? summaryMatch[0].trim() : text.trim(),
                sources,
                suggestedQueries,
            };
    }
};

const ImmigrationNewsPage: React.FC<ImmigrationNewsPageProps> = ({ handleApiError }) => {
    const { language, t } = useLanguage();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ImmigrationNewsResult | null>(null);
    const [mode, setMode] = useState<NewsAnalysisMode>('quick');

    const handleSearch = async (searchQuery = query) => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const rawResult = await geminiService.generateImmigrationNews(searchQuery, language, mode);
            const parsedResult = parseImmigrationNews(rawResult, mode);
            setResult(parsedResult);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedQuery = (suggestedQuery: string) => {
        setQuery(suggestedQuery);
        handleSearch(suggestedQuery);
    };
    
    const InDepthResult: React.FC<{ analysis: InDepthAnalysis }> = ({ analysis }) => {
        const Section: React.FC<{title: string; items: string[]}> = ({ title, items }) => items.length > 0 ? (
            <div><h3 className="text-xl font-semibold text-blue-300 mb-3">{title}</h3><ul className="list-disc list-inside space-y-2 text-gray-300">{items.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
        ) : null;
        
        return (
            <div className="space-y-8">
                <Section title={t('immigrationNews.results.keyTakeaways')} items={analysis.keyTakeaways} />
                 {analysis.detailedSummary && <div><h3 className="text-xl font-semibold text-blue-300 mb-3">{t('immigrationNews.results.detailedSummary')}</h3><p className="text-gray-300 whitespace-pre-wrap">{analysis.detailedSummary}</p></div>}
                {analysis.actionableTips.length > 0 && <div><h3 className="text-xl font-semibold text-blue-300 mb-3">{t('immigrationNews.results.actionableTips')}</h3><div className="space-y-3">{analysis.actionableTips.map(t => <p key={t.name}><strong>{t.name}:</strong> {t.description}</p>)}</div></div>}
                <Section title={t('immigrationNews.results.potentialBenefits')} items={analysis.potentialBenefits} />
                <Section title={t('immigrationNews.results.risksToConsider')} items={analysis.risksToConsider} />
            </div>
        );
    };

    const MythBustingResult: React.FC<{ analysis: MythBusting }> = ({ analysis }) => {
        const Section: React.FC<{title: string; items: string[]}> = ({ title, items }) => items.length > 0 ? (
            <div><h3 className="text-xl font-semibold text-blue-300 mb-3">{title}</h3><ul className="list-disc list-inside space-y-2 text-gray-300">{items.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
        ) : null;
        return (
            <div className="space-y-8">
                <Section title={t('immigrationNews.results.commonMyths')} items={analysis.commonMyths} />
                <Section title={t('immigrationNews.results.factualClarifications')} items={analysis.factualClarifications} />
                <Section title={t('immigrationNews.results.expertOpinions')} items={analysis.expertOpinions} />
            </div>
        );
    };
    
     const Sources: React.FC<{ sources: Source[] }> = ({ sources }) => (
        <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-3">{t('immigrationNews.sources')}</h3>
            <div className="space-y-2 text-sm">
            {sources.map((source, index) => (
                <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-900/50 hover:bg-gray-800 rounded-md transition-colors truncate">
                    <p className="font-semibold text-blue-300">{source.title}</p>
                    <p className="text-gray-400 text-xs truncate">{source.uri}</p>
                </a>
            ))}
            </div>
        </div>
    );
    
    const SuggestedQueries: React.FC<{ queries: string[] }> = ({ queries }) => (
        <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-3">{t('immigrationNews.relatedTopics')}</h3>
            <div className="flex flex-wrap gap-2">
            {queries.map((q, index) => (
                <button key={index} onClick={() => handleSuggestedQuery(q)} className="px-3 py-1.5 bg-gray-700 text-gray-200 text-sm font-medium rounded-full hover:bg-gray-600 transition-colors">
                    {q}
                </button>
            ))}
            </div>
        </div>
    );

    return (
        <section id="immigration-news" className="py-16 sm:py-24 animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{t('immigrationNews.title')}</h1>
                    <p className="mt-4 text-lg text-gray-300">{t('immigrationNews.subtitle')}</p>
                </div>

                <div className="mt-12 max-w-2xl mx-auto space-y-4">
                    <div className="grid grid-cols-3 gap-2 p-1 bg-gray-800/50 rounded-lg border border-white/10">
                        {(['quick', 'in-depth', 'myth-busting'] as NewsAnalysisMode[]).map(m => (
                            <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                {t(`immigrationNews.analysisModes.${m}`)}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex items-center bg-gray-800/50 border border-white/10 rounded-lg shadow-md p-2">
                        <input
                            type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('immigrationNews.searchPlaceholder')}
                            className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-2 focus:outline-none"
                        />
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-500">
                            {isLoading ? t('immigrationNews.searching') : t('immigrationNews.searchButton')}
                        </button>
                    </form>
                </div>
                
                <div className="mt-12">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>
                            <p className="mt-4 text-gray-400">{t('immigrationNews.searching')}</p>
                        </div>
                    )}
                    {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}
                    {!isLoading && !result && !error && (
                        <div className="text-center py-10 text-gray-500 bg-gray-800/20 rounded-lg">
                            <p>{t('immigrationNews.placeholder')}</p>
                        </div>
                    )}
                    {result && (
                        <div className="animate-fade-in bg-gray-800/30 p-8 rounded-lg mt-8 border border-white/10 space-y-8">
                            {result.type === 'quick' && <p className="text-gray-300 whitespace-pre-wrap">{(result as QuickSummary).summary}</p>}
                            {result.type === 'in-depth' && <InDepthResult analysis={result as InDepthAnalysis} />}
                            {result.type === 'myth-busting' && <MythBustingResult analysis={result as MythBusting} />}
                            
                            {(result.sources && result.sources.length > 0) && <Sources sources={result.sources} />}
                            {(result.suggestedQueries && result.suggestedQueries.length > 0) && <SuggestedQueries queries={result.suggestedQueries} />}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ImmigrationNewsPage;
