import React, { useState, useMemo } from 'react';
import { useLanguage, OfficialOffice } from '../types';

interface OfficeFinderPageProps {
  onGeoSearch: () => void;
  onTextSearch: (query: string) => void;
  isLoading: boolean;
  results: OfficialOffice[] | null;
  isQuotaExhausted: boolean;
}

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

const OfficeCard: React.FC<{ office: OfficialOffice }> = ({ office }) => {
    const { t } = useLanguage();

    return (
      <div className="bg-gray-900/70 border border-white/10 rounded-lg p-8 shadow-2xl backdrop-blur-sm animate-fade-in h-full flex flex-col">
        <div className="flex-grow">
            <div className="flex justify-between items-start gap-4">
                <h3 className="text-2xl font-bold text-blue-300 tracking-tight">{office.name}</h3>
                <StarRating rating={office.rating} />
            </div>
            <p className="text-sm text-gray-400 mt-2 mb-4">{office.description}</p>
            
            {office.services && office.services.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">{t('officeFinder.services')}</h4>
                    <div className="flex flex-wrap gap-2">
                        {office.services.map((item, i) => (
                            <span key={i} className="px-2.5 py-1 bg-gray-700 text-gray-300 text-xs font-medium rounded-full">{item}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-700 text-sm text-gray-400 space-y-3">
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
};


const OfficeFinderPage: React.FC<OfficeFinderPageProps> = ({
  onGeoSearch,
  onTextSearch,
  isLoading,
  results,
  isQuotaExhausted,
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState<string | null>(null);

  const sortedResults = useMemo(() => {
    if (!results) return null;
    return [...results].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [results]);

  const handleTextSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setQueryError(t('validation.required'));
      return;
    }
    setQueryError(null);
    onTextSearch(query);
  };

  return (
    <section id="office-finder" className="py-16 sm:py-24 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('officeFinder.title')}
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            {t('officeFinder.subtitle')}
          </p>
        </div>

        <form onSubmit={handleTextSearchSubmit} className="mt-12 max-w-2xl mx-auto">
            <div className={`flex items-center bg-gray-800/50 border rounded-lg shadow-md p-2 transition-colors ${queryError ? 'border-red-500 ring-2 ring-red-500/50' : 'border-white/10'}`}>
                <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (queryError) setQueryError(null);
                    }}
                    placeholder={t('officeFinder.searchPlaceholder')}
                    className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-2 focus:outline-none"
                    aria-label={t('officeFinder.searchPlaceholder')}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || isQuotaExhausted} 
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {t('officeFinder.searchButtonText')}
                </button>
            </div>
            {queryError && <p className="mt-2 text-sm text-red-400 text-center animate-fade-in">{queryError}</p>}
        </form>

        <div className="mt-6 text-center text-gray-400 flex items-center justify-center max-w-md mx-auto">
            <span className="flex-grow border-t border-gray-700"></span>
            <span className="px-4 text-sm font-semibold">{t('officeFinder.or')}</span>
            <span className="flex-grow border-t border-gray-700"></span>
        </div>

        <div className="mt-6 max-w-md mx-auto">
          <button
            onClick={onGeoSearch}
            disabled={isLoading || isQuotaExhausted}
            className="w-full flex justify-center items-center gap-3 py-3 px-6 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {isLoading ? t('officeFinder.searching') : isQuotaExhausted ? t('quotaErrorModal.title') : t('officeFinder.geoSearchButton')}
          </button>
        </div>

        <div className="mt-16">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>
              <p className="mt-4 text-gray-400">{t('officeFinder.searching')}</p>
            </div>
          )}
          
          {!isLoading && !sortedResults && (
            <div className="text-center py-10 text-gray-500 bg-gray-800/20 rounded-lg max-w-3xl mx-auto">
              <p>{t('officeFinder.placeholder')}</p>
            </div>
          )}

          {sortedResults && (
            <div className="space-y-10">
              <h2 className="text-3xl font-bold text-white text-center">{t('officeFinder.resultsTitle')}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                 {sortedResults.map((office, index) => (
                    <OfficeCard key={`${office.name}-${index}`} office={office} />
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OfficeFinderPage;