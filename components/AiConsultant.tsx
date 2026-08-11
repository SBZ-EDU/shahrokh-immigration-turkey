import React, { useState, useEffect, useRef } from 'react';
import { useLanguage, Message } from '../types';

interface AiConsultantPageProps {
  chatHistory: Message[];
  isStreaming: boolean;
  onSendMessage: (message: string) => void;
}

const AiConsultantPage: React.FC<AiConsultantPageProps> = ({ chatHistory, isStreaming, onSendMessage }) => {
  const { t } = useLanguage();
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isStreaming]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isStreaming) {
      onSendMessage(userInput);
      setUserInput('');
    }
  };

  const renderMessage = (msg: Message, index: number) => {
    const isUser = msg.role === 'user';
    const isLastMessage = index === chatHistory.length - 1;
    const showTypingIndicator = isStreaming && isLastMessage && msg.role === 'model' && msg.parts[0].text === '';
    
    return (
      <div key={index} className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center border-2 border-blue-600">
             <svg className="h-5 w-5 text-blue-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
             </svg>
          </div>
        )}
        <div className={`max-w-xl p-4 rounded-2xl shadow-md ${isUser ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-gray-700 text-gray-200 rounded-bl-lg'}`}>
          <p className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
            {msg.parts[0].text}
            {isStreaming && isLastMessage && !isUser && msg.parts[0].text !== '' && <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse"></span>}
          </p>
           {showTypingIndicator && (
             <div className="flex items-center space-x-1 p-2">
                <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
             </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <section id="ai-consultant" className="py-16 sm:py-24 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{t('aiConsultant.title')}</h1>
          <p className="mt-4 text-lg text-gray-300">{t('aiConsultant.subtitle')}</p>
        </div>

        <div className="mt-12 bg-gray-800/50 rounded-lg shadow-2xl backdrop-blur-sm border border-white/10 flex flex-col h-[70vh] max-h-[700px]">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {chatHistory.map(renderMessage)}
            <div ref={chatEndRef}></div>
          </div>

          <div className="p-4 border-t border-white/10">
            <form onSubmit={handleSend} className="flex items-start gap-3">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                placeholder={t('aiConsultant.placeholder')}
                className="flex-grow bg-gray-700 border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none max-h-32"
                rows={1}
                disabled={isStreaming}
                aria-label={t('aiConsultant.placeholder')}
              />
              <button 
                type="submit" 
                disabled={isStreaming || !userInput.trim()} 
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiConsultantPage;
