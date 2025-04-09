import React, { useState, useEffect } from 'react';
import { FaWindows, FaFolder, FaChrome, FaRecycle } from 'react-icons/fa';
import './ScreenContent.css';

interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, label }) => (
  <div className="desktop-icon">
    {icon}
    <span>{label}</span>
  </div>
);

export const ScreenContent: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const [bootPhase, setBootPhase] = useState<'loading' | 'desktop'>('loading');
  const [loadingText, setLoadingText] = useState('Starting Windows');
  
  useEffect(() => {
    if (isVisible) {
      setBootPhase('loading');
      setLoadingText('Starting Windows');

      // Update loading text
      const texts = [
        'Starting ChkhiroOS',
        'Loading system components',
        'Preparing your desktop',
        'Almost ready'
      ];
      
      texts.forEach((text, index) => {
        setTimeout(() => {
          setLoadingText(text);
        }, index * 1000);
      });

      // Switch to desktop after loading
      const desktopTimer = setTimeout(() => {
        setBootPhase('desktop');
      }, 3000);

      return () => {
        clearTimeout(desktopTimer);
      };
    }
  }, [isVisible]);

  const [showStartMenu, setShowStartMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="screen-content">
      {bootPhase === 'loading' && (
        <div className="boot-loading-container">
          <div className="spinner-container">
            <div className="spinner"></div>
            <div className="spinner-inner"></div>
          </div>
          <div className="loading-text">{loadingText}</div>
          <div className="loading-dots">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="loading-dot" 
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {bootPhase === 'desktop' && (
        <div className="windows-desktop">
          <div className="desktop-icons">
            <DesktopIcon icon={<FaFolder size={32} />} label="My Projects" />
            <DesktopIcon icon={<FaChrome size={32} />} label="Browser" />
            <DesktopIcon icon={<FaRecycle size={32} />} label="Recycle Bin" />
          </div>

          <div className="taskbar">
            <button 
              className={`start-menu-button ${showStartMenu ? 'active' : ''}`}
              onClick={() => setShowStartMenu(!showStartMenu)}
            >
              <FaWindows /> Start
            </button>

            {showStartMenu && (
              <div className="start-menu">
                <div className="start-menu-header">
                  <FaWindows size={20} />
                  <span>Welcome</span>
                </div>
                <div className="start-menu-items">
                  <div className="menu-item">
                    <FaFolder /> Documents
                  </div>
                  <div className="menu-item">
                    <FaChrome /> Browser
                  </div>
                </div>
              </div>
            )}

            <div className="taskbar-right">
              <div className="time">
                {currentTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
