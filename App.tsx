import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import TemplateSelectionPage from './pages/TemplateSelectionPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import StartOptionPage from './pages/StartOptionPage';
import UploadResumePage from './pages/UploadResumePage';
import type { ResumeData } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'start-option' | 'templates' | 'upload' | 'builder'>('login');
  const [builderInitialData, setBuilderInitialData] = useState<ResumeData | null>(null);

  if (currentView === 'login') {
    return <LoginPage onGetStarted={() => setCurrentView('start-option')} />;
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
            }}
            onBack={() => setCurrentView('start-option')}
          />
      );
  }

  if (currentView === 'templates') {
    return <TemplateSelectionPage onSelect={() => setCurrentView('builder')} onBack={() => setCurrentView('start-option')} />;
  }

  return (
    <ResumeBuilderPage 
        initialData={builderInitialData} 
        onBack={() => setCurrentView('templates')} 
    />
  );
}

export default App;