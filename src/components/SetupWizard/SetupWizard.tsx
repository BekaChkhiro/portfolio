import { useState } from 'react';
import './SetupWizard.css';

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

interface SetupWizardProps {
  isVisible: boolean;
  onComplete: (preferences: UserPreferences) => void;
}

const themes: Theme[] = [
  {
    name: 'Dark Mode',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
    primary: '#00ffff',
    secondary: '#0080ff',
    accent: '#ff00ff',
    description: 'Classic dark theme',
    icon: '🌙',
    category: 'minimal'
  },
  {
    name: 'Light Mode',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
    primary: '#0066cc',
    secondary: '#004499',
    accent: '#ff6600',
    description: 'Clean light theme',
    icon: '☀️',
    category: 'minimal'
  },
  {
    name: 'Cyberpunk',
    background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
    primary: '#ff00ff',
    secondary: '#00ffff',
    accent: '#ffff00',
    description: 'Neon cyberpunk vibes',
    icon: '🌃',
    category: 'vibrant'
  }
];

export function SetupWizard({ isVisible, onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [language, setLanguage] = useState('en');
  const [avatar, setAvatar] = useState('👤');
  const [soundEnabled] = useState(true);

  if (!isVisible) return null;

  const steps = [
    {
      title: 'Welcome to ChkhiroOS',
      content: (
        <div className="welcome-step">
          <div className="welcome-icon">👋</div>
          <h2>Welcome to Your New Operating System</h2>
          <p>Let's get you set up in just a few steps.</p>
          <p className="welcome-subtitle">This will only take a minute.</p>
        </div>
      )
    },
    {
      title: 'Personalize',
      content: (
        <div className="personalize-step">
          <h2>What should we call you?</h2>
          <input
            type="text"
            className="setup-input"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoFocus
          />
          <p className="input-hint">This will be displayed on your desktop</p>
        </div>
      )
    },
    {
      title: 'Choose Theme',
      content: (
        <div className="theme-step">
          <h2>Select your preferred theme</h2>
          <div className="theme-options">
            {themes.map((theme) => (
              <div 
                key={theme.name}
                className={`theme-option ${selectedTheme.name === theme.name ? 'selected' : ''}`}
                onClick={() => setSelectedTheme(theme)}
              >
                <div 
                  className="theme-preview"
                  style={{ background: theme.background }}
                >
                  <span className="theme-icon">{theme.icon}</span>
                </div>
                <span>{theme.name}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Language',
      content: (
        <div className="language-step">
          <h2>Select your language</h2>
          <select 
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="ka">ქართული</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      )
    },
    {
      title: 'Avatar',
      content: (
        <div className="avatar-step">
          <h2>Choose your avatar</h2>
          <div className="avatar-options">
            {['👤', '🧑‍💻', '👨‍🎨', '👩‍🚀', '🦸', '🧙‍♂️', '🤖', '👽'].map((emoji) => (
              <div
                key={emoji}
                className={`avatar-option ${avatar === emoji ? 'selected' : ''}`}
                onClick={() => setAvatar(emoji)}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'All Set!',
      content: (
        <div className="complete-step">
          <div className="complete-icon">✨</div>
          <h2>You're all set, {userName || 'User'}!</h2>
          <p>Your personalized desktop is ready.</p>
          <div className="setup-summary">
            <div className="summary-item">
              <span className="summary-label">Theme:</span>
              <span className="summary-value">{selectedTheme.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Language:</span>
              <span className="summary-value">{language === 'en' ? 'English' : language === 'ka' ? 'Georgian' : language}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avatar:</span>
              <span className="summary-value">{avatar}</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup with all preferences
      const preferences: UserPreferences = {
        theme: selectedTheme,
        userName: userName || 'User',
        language,
        avatar,
        soundEnabled
      };
      onComplete(preferences);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1 && !userName.trim()) {
      return false;
    }
    return true;
  };

  return (
    <div className="setup-wizard">
      <div className="setup-container">
        <div className="setup-header">
          <div className="setup-logo">ChkhiroOS</div>
          <div className="setup-progress">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="setup-content">
          {steps[currentStep].content}
        </div>

        <div className="setup-footer">
          {currentStep > 0 && (
            <button className="setup-button secondary" onClick={handlePrevious}>
              Previous
            </button>
          )}
          <button 
            className="setup-button primary" 
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}