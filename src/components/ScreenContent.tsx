import React, { useState } from 'react';
import { SetupWizard } from './SetupWizard/SetupWizard';
import { Loading } from './Loading/Loading';
import { Desktop } from './Desktop/Desktop';
import { WindowProvider } from '../contexts/WindowContext';
import './ScreenContent.css';

interface Theme {
  name: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  description: string;
  icon: React.ReactNode;
  category: 'vibrant' | 'nature' | 'minimal';
}

interface UserPreferences {
  theme: Theme;
  userName: string;
  language: string;
  avatar: string;
  soundEnabled: boolean;
}

export const ScreenContent: React.FC<{ isVisible: boolean; onPowerOff?: () => void }> = ({ isVisible, onPowerOff }) => {
  const [bootPhase, setBootPhase] = useState<'setup' | 'loading' | 'desktop'>(() => {
    // Check if setup has been completed before
    const savedPreferences = localStorage.getItem('chkhiros-preferences');
    return savedPreferences ? 'loading' : 'setup';
  });
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(() => {
    const savedPreferences = localStorage.getItem('chkhiros-preferences');
    return savedPreferences ? JSON.parse(savedPreferences) : null;
  });

  const handleSetupComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setBootPhase('loading');
    
    // Save preferences to localStorage
    localStorage.setItem('chkhiros-preferences', JSON.stringify(preferences));
  };

  const handleLoadingComplete = () => {
    setBootPhase('desktop');
  };

  if (!isVisible) return null;

  return (
    <div className="screen-content" style={{
      background: userPreferences ? userPreferences.theme.background : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <SetupWizard 
        isVisible={bootPhase === 'setup'}
        onComplete={handleSetupComplete}
      />

      <Loading 
        isVisible={bootPhase === 'loading'}
        theme={userPreferences?.theme}
        userName={userPreferences?.userName}
        onComplete={handleLoadingComplete}
      />

      {bootPhase === 'desktop' && (
        <WindowProvider>
          <Desktop 
            theme={userPreferences?.theme}
            userName={userPreferences?.userName}
            onPowerOff={onPowerOff}
          />
        </WindowProvider>
      )}
    </div>
  );
};