import React from 'react';
import { useLanguage } from '../types';

interface DatingProfilePreviewProps {
  summaryHtml: string;
  styleMode: 'dark' | 'light';
}

const DatingProfilePreview = React.forwardRef<HTMLDivElement, DatingProfilePreviewProps>(({ summaryHtml, styleMode }, ref) => {
  const { t } = useLanguage();

  const themeClasses = {
    dark: {
      card: 'bg-gray-800 border-gray-700 text-gray-300',
      name: 'text-white',
      prose: 'prose-dark',
    },
    light: {
      card: 'bg-white border-gray-200 text-gray-700',
      name: 'text-gray-900',
      prose: 'prose-light',
    }
  };

  const currentTheme = themeClasses[styleMode];

  return (
    <div className={`p-4 rounded-lg font-sans transition-colors duration-300 ${currentTheme.card} border`}>
        <style>{`
            .prose-dark h3 { color: #fecdd3; border-bottom-color: #4b5563; font-size: 1.1rem; font-weight: 600; padding-bottom: 0.5rem; border-bottom-width: 1px; margin-top: 1.5rem; margin-bottom: 1rem; }
            .prose-dark ul { list-style-type: '❤ '; padding-left: 1.5rem; margin-bottom: 1rem; color: #d1d5db; }
            .prose-dark li { margin-bottom: 0.25rem; padding-left: 0.25rem; }
            .prose-dark p { line-height: 1.6; margin-bottom: 1rem; color: #d1d5db; }
            .prose-dark strong { color: #e5e7eb; }

            .prose-light h3 { color: #e11d48; border-bottom-color: #e5e7eb; font-size: 1.1rem; font-weight: 600; padding-bottom: 0.5rem; border-bottom-width: 1px; margin-top: 1.5rem; margin-bottom: 1rem; }
            .prose-light ul { list-style-type: '❤ '; padding-left: 1.5rem; margin-bottom: 1rem; color: #374151; }
            .prose-light li { margin-bottom: 0.25rem; padding-left: 0.25rem; }
            .prose-light p { line-height: 1.6; margin-bottom: 1rem; color: #4b5563; }
            .prose-light strong { color: #1f2937; }
        `}</style>

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center p-6">
            <div className="relative mb-4">
                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                     </svg>
                 </div>
                 <span className={`absolute bottom-0 right-0 block h-6 w-6 rounded-full bg-green-400 border-2 ${styleMode === 'dark' ? 'border-gray-800' : 'border-white'}`}></span>
            </div>
            <h2 className={`text-2xl font-bold ${currentTheme.name}`}>{t('datingProfilePreview.namePlaceholder')}</h2>
            <p className="text-sm">{t('datingProfilePreview.locationPlaceholder')}</p>
        </div>
      
      {/* Main Content from AI */}
      <main ref={ref} className={`${currentTheme.prose} max-w-none px-4`}>
        <div dangerouslySetInnerHTML={{ __html: summaryHtml }} />
      </main>

       {/* Action Buttons */}
       <div className={`flex items-center justify-center space-x-4 mt-6 p-4 border-t ${styleMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
           <button className={`p-4 rounded-full transition-colors ${styleMode === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
           <button className={`p-5 rounded-full shadow-lg transform hover:scale-110 transition-transform ${styleMode === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
           </button>
            <button className={`p-4 rounded-full transition-colors ${styleMode === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
           </button>
       </div>
    </div>
  );
});

export default DatingProfilePreview;
