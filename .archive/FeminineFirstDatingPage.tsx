import React, { useState } from 'react';
import { useLanguage } from '../types';

const FeminineFirstDatingPage: React.FC = () => {
    const { t } = useLanguage();
    const [auditOutput, setAuditOutput] = useState(t('feminineFirstDating.auditOutput'));
    const [repoInfo, setRepoInfo] = useState(t('feminineFirstDating.repository.noRepo'));

    const runAudit = () => {
        setAuditOutput(t('feminineFirstDating.auditRunning'));
    };

    const openGit = () => {
        const repoUrl = "https://github.com/your-org/your-repo"; // <-- replace this
        setRepoInfo(repoUrl);
        window.open(repoUrl, '_blank');
    };

    const Card: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => (
        <div className={`bg-gray-800/50 p-6 rounded-lg border border-white/10 ${className || ''}`}>
            {children}
        </div>
    );

    const H2: React.FC<{children: React.ReactNode}> = ({children}) => (
        <h2 className="text-xl font-semibold text-rose-300 mb-3">{children}</h2>
    );
    
    const H3: React.FC<{children: React.ReactNode}> = ({children}) => (
        <h3 className="text-lg font-semibold text-gray-200 mb-3">{children}</h3>
    );

    const recommendations: string[] = t('feminineFirstDating.recommendations.items');
    const metrics: string[] = t('feminineFirstDating.metrics.items');
    const checklist: string[] = t('feminineFirstDating.checklist.items');

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-white text-center mb-2">{t('feminineFirstDating.title')}</h1>
        <p className="text-gray-400 text-center mb-10">{t('feminineFirstDating.subtitle')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <Card>
              <H2>{t('feminineFirstDating.overview.title')}</H2>
              <p className="text-gray-300">{t('feminineFirstDating.overview.text')}</p>
            </Card>

            <Card>
              <H2>{t('feminineFirstDating.recommendations.title')}</H2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {recommendations.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </Card>

            <Card>
              <H2>{t('feminineFirstDating.metrics.title')}</H2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {metrics.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </Card>

            <Card>
              <H2>{t('feminineFirstDating.article.title')}</H2>
              <p className="text-gray-300" dangerouslySetInnerHTML={{ __html: t('feminineFirstDating.article.text') }}/>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <H3>{t('feminineFirstDating.actions.title')}</H3>
              <div className="flex flex-col gap-3">
                <button className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors" onClick={runAudit}>{t('feminineFirstDating.actions.auditButton')}</button>
                <button className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 transition-colors" onClick={openGit}>{t('feminineFirstDating.actions.repoButton')}</button>
              </div>
              <p className="text-gray-400 text-sm mt-4">{t('feminineFirstDating.actions.description')}</p>
            </Card>

            <Card>
              <H3>{t('feminineFirstDating.checklist.title')}</H3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                {checklist.map((item, index) => <li key={index}>{item}</li>)}
              </ol>
            </Card>

            <Card>
              <H3>{t('feminineFirstDating.repository.title')}</H3>
              <p className="text-gray-400 text-sm break-all">{repoInfo}</p>
            </Card>
          </div>
        </div>

        <pre className="w-full mt-6 bg-gray-900 text-gray-300 p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">{auditOutput}</pre>
      </div>
    );
};

export default FeminineFirstDatingPage;