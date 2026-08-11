
import React from 'react';
import { useLanguage } from '../types';

// FIX: Renamed props interface to match the component name and theme.
interface DestinationVisualizerPageProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  isQuotaExhausted: boolean;
  videoUrl: string | null;
  prompt: string;
  setPrompt: (prompt: string) => void;
  progressMessage: string;
}

// FIX: Renamed component from ReminiscenceTherapyPage to DestinationVisualizerPage.
const DestinationVisualizerPage: React.FC<DestinationVisualizerPageProps> = ({
  onGenerate,
  isLoading,
  isQuotaExhausted,
  videoUrl,
  prompt,
  setPrompt,
  progressMessage,
}) => {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    // FIX: Corrected translation key for component ID.
    <section id="destination-visualizer" className="py-16 sm:py-24 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            {/* FIX: Corrected translation key. */}
            {t('destinationVisualizer.title')}
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            {/* FIX: Corrected translation key. */}
            {t('destinationVisualizer.subtitle')}
          </p>
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-white/10 space-y-6">
            <div>
              {/* FIX: Corrected translation key. */}
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">{t('destinationVisualizer.promptLabel')}</label>
              <textarea
                id="prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                // FIX: Corrected translation key.
                placeholder={t('destinationVisualizer.promptPlaceholder')}
              />
            </div>
             <div className="pt-2">
                {/* FIX: Corrected translation key. */}
                <h4 className="text-xs font-semibold text-gray-400 mb-2">{t('destinationVisualizer.suggestionsTitle')}</h4>
                <div className="flex flex-wrap gap-2">
                    {/* FIX: Corrected translation key. */}
                    {t('destinationVisualizer.suggestions').map((suggestion: string, index: number) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setPrompt(suggestion)}
                            className="px-3 py-1.5 bg-gray-700/80 text-gray-300 text-xs font-medium rounded-full hover:bg-gray-600 hover:text-white transition-all transform hover:scale-105"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading || isQuotaExhausted}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                {/* FIX: Corrected translation key. */}
                {isLoading ? t('destinationVisualizer.generating') : isQuotaExhausted ? t('quotaErrorModal.title') : t('destinationVisualizer.buttonText')}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>
              {/* FIX: Corrected translation key. */}
              <p className="mt-4 text-gray-300">{progressMessage || t('destinationVisualizer.generating')}</p>
            </div>
          )}
          
          {!isLoading && !videoUrl && (
            <div className="text-center py-10 text-gray-500 bg-gray-800/20 rounded-lg max-w-3xl mx-auto">
              {/* FIX: Corrected translation key. */}
              <p>{t('destinationVisualizer.placeholder')}</p>
            </div>
          )}

          {videoUrl && (
            <div className="animate-fade-in max-w-3xl mx-auto">
              {/* FIX: Corrected translation key. */}
              <h2 className="text-3xl font-bold text-white text-center mb-6">{t('destinationVisualizer.resultsTitle')}</h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                <video src={videoUrl} controls autoPlay loop className="w-full h-full" />
              </div>
              <div className="text-center mt-6">
                <a
                  href={videoUrl}
                  download="destination-video.mp4"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {/* FIX: Corrected translation key. */}
                  {t('destinationVisualizer.downloadButton')}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// FIX: Exported the renamed component.
export default DestinationVisualizerPage;
