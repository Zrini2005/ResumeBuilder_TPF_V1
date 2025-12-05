import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import TemplateSelectionPage from './pages/TemplateSelectionPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import StartOptionPage from './pages/StartOptionPage';
import UploadResumePage from './pages/UploadResumePage';
import FAQPage from './pages/FAQPage';
import type { ResumeData } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'start-option' | 'templates' | 'upload' | 'builder' | 'faq'>('login');
  const [builderInitialData, setBuilderInitialData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'on-campus' | 'modern-creative' | 'corporate-minimal'>('on-campus');

  if (currentView === 'login') {
    return <LoginPage onGetStarted={() => setCurrentView('start-option')} onHelpClick={() => setCurrentView('faq')} />;
  }

  if (currentView === 'faq') {
    return <FAQPage onBack={() => setCurrentView('login')} />;
  }

  if (currentView === 'start-option') {
    return (
        <StartOptionPage 
            onCreateNew={() => {
                setBuilderInitialData(null);
                setCurrentView('templates');
            }}
            onUpload={() => setCurrentView('upload')}
            onBack={() => setCurrentView('login')}
        />
    );
  }

  if (currentView === 'upload') {
      return (
          <UploadResumePage 
            onUploadComplete={(data) => {
                setBuilderInitialData(data);
                setCurrentView('builder');
                // Default to on-campus for uploaded resumes unless user switches
                setSelectedTemplate('on-campus'); 
            }}
            onBack={() => setCurrentView('start-option')}
          />
      );
  }

  if (currentView === 'templates') {
    return (
        <TemplateSelectionPage 
            onSelect={(templateId) => {
                setSelectedTemplate(templateId);
                setCurrentView('builder');
            }} 
            onBack={() => setCurrentView('start-option')} 
        />
    );
  }

  return (
    <ResumeBuilderPage 
        initialData={builderInitialData} 
        selectedTemplate={selectedTemplate}
        onBack={() => setCurrentView('start-option')} 
    />
  );
}

export default App;