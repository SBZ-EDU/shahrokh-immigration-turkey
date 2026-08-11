import React, { useState } from 'react';
import { useLanguage } from '../types';
import { useToast } from './Toast';

const CorporateInvestmentPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        tier: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canvasItems: { [key: string]: { title: string; description: string } } = t('corporateInvestment.canvasItems');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            addToast(t('corporateInvestment.form.success'), 'success');
            setFormData({ name: '', email: '', tier: t('corporateInvestment.form.tierOptions')[0], message: '' });
        }, 1500);
    };

    const handleWhatsAppInquiry = () => {
        const message = encodeURIComponent(t('corporateInvestment.whatsappMessage'));
        const whatsappUrl = `https://wa.me/?text=${message}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
        <div className={`bg-gray-800/50 p-6 sm:p-8 rounded-lg shadow-lg backdrop-blur-sm border border-white/10 ${className}`}>
            {children}
        </div>
    );
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-in">
            <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {t('corporateInvestment.title')}
                </h1>
                <p className="mt-4 text-lg text-gray-300">{t('corporateInvestment.subtitle')}</p>
            </div>

            <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Information */}
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-2xl font-bold text-blue-300 mb-4">{t('corporateInvestment.visionTitle')}</h2>
                        <p className="text-gray-300 leading-relaxed">{t('corporateInvestment.visionText')}</p>
                    </Card>
                    <Card>
                        <h2 className="text-2xl font-bold text-blue-300 mb-4">{t('corporateInvestment.canvasTitle')}</h2>
                        <div className="space-y-4">
                            {Object.values(canvasItems).map((item, index) => (
                                <div key={index}>
                                    <h3 className="font-semibold text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-400">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                     <Card>
                        <h2 className="text-2xl font-bold text-blue-300 mb-4">{t('corporateInvestment.opportunityTitle')}</h2>
                        <p className="text-gray-300 leading-relaxed">{t('corporateInvestment.opportunityText')}</p>
                    </Card>
                </div>
                
                {/* Right Column: Form & Contact */}
                <div className="space-y-8 lg:sticky top-28">
                    <Card>
                        <h2 className="text-2xl font-bold text-blue-300 mb-2">{t('corporateInvestment.inquiryTitle')}</h2>
                         <p className="text-sm text-gray-400 mb-6">{t('corporateInvestment.inquiryText')}</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300">{t('corporateInvestment.form.name')}</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('corporateInvestment.form.namePlaceholder')} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">{t('corporateInvestment.form.email')}</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('corporateInvestment.form.emailPlaceholder')} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white" />
                            </div>
                            <div>
                                <label htmlFor="tier" className="block text-sm font-medium text-gray-300">{t('corporateInvestment.form.tier')}</label>
                                <select id="tier" name="tier" value={formData.tier} onChange={handleInputChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white">
                                    {t('corporateInvestment.form.tierOptions').map((option: string) => <option key={option} value={option.includes('...') ? '' : option} disabled={option.includes('...')}>{option}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300">{t('corporateInvestment.form.message')}</label>
                                <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={3} placeholder={t('corporateInvestment.form.messagePlaceholder')} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"></textarea>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-500">
                                {isSubmitting ? t('corporateInvestment.form.submitting') : t('corporateInvestment.form.submit')}
                            </button>
                        </form>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4">{t('corporateInvestment.contactTitle')}</h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleWhatsAppInquiry} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.908 6.161l4.563-1.318-1.362 4.532z"/></svg>
                                <span>{t('corporateInvestment.whatsappButton')}</span>
                            </button>
                            <a href="mailto:invest@ai-immigration.com" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors text-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                <span>{t('corporateInvestment.emailButton')}</span>
                            </a>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CorporateInvestmentPage;