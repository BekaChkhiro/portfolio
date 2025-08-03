import { useEffect, useState } from 'react';
import './Loading.css';

interface LoadingProps {
  isVisible: boolean;
  theme?: any;
  userName?: string;
  onComplete: () => void;
}

export function Loading({ isVisible, userName, onComplete }: LoadingProps) {
  if (!isVisible) return null;

  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing system...');

  const loadingSteps = [
    { text: 'Loading system files...', duration: 20 },
    { text: 'Initializing graphics...', duration: 35 },
    { text: 'Loading user interface...', duration: 50 },
    { text: 'Starting services...', duration: 70 },
    { text: 'Configuring desktop...', duration: 85 },
    { text: `Welcome${userName ? ', ' + userName : ''} to ChkhiroOS`, duration: 100 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        // Update loading text based on progress
        const currentStep = loadingSteps.find(step => newProgress <= step.duration);
        if (currentStep) {
          setLoadingText(currentStep.text);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="os-logo">
          <div className="logo-text">ChkhiroOS</div>
          <div className="logo-version">v1.0.0</div>
        </div>
        
        <div className="loading-bar-container">
          <div className="loading-bar">
            <div 
              className="loading-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="loading-percentage">{progress}%</div>
        </div>
        
        <div className="loading-text">{loadingText}</div>
        
        <div className="boot-messages">
          {progress > 10 && <div className="boot-message">✓ Kernel loaded</div>}
          {progress > 25 && <div className="boot-message">✓ Drivers initialized</div>}
          {progress > 40 && <div className="boot-message">✓ Network configured</div>}
          {progress > 60 && <div className="boot-message">✓ User profile loaded</div>}
          {progress > 80 && <div className="boot-message">✓ Desktop ready</div>}
        </div>
      </div>
    </div>
  );
}