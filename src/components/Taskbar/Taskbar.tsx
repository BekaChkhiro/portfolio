import React, { useState, useEffect } from 'react';
import { 
  FaWindows,
  FaThumbtack,
  FaTimes,
  FaPowerOff,
  FaUser,
  FaFolderOpen
} from 'react-icons/fa';
import { useWindows } from '../../contexts/WindowContext';
import './Taskbar.css';

interface TaskbarProps {
  userName?: string;
  applications: Record<string, {
    id: string;
    title: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
  onPowerOff?: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ userName = 'User', applications, onPowerOff }) => {
  const { 
    windows, 
    pinnedApps, 
    openWindow, 
    restoreWindow, 
    focusWindow, 
    minimizeWindow,
    closeWindow,
    togglePinApp 
  } = useWindows();
  
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appMenuOpen, setAppMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.taskbar-app') && !target.closest('.app-menu')) {
        setAppMenuOpen(null);
      }
    };

    if (appMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [appMenuOpen]);

  const handleAppClick = (appId: string) => {
    // Hide app menu if it's open
    if (appMenuOpen === appId) {
      setAppMenuOpen(null);
      return;
    }
    
    // Show app menu
    setAppMenuOpen(appId);
  };

  const handleAppRightClick = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    setAppMenuOpen(appMenuOpen === appId ? null : appId);
  };

  const handlePinToggle = (appId: string) => {
    const app = applications[appId];
    if (app) {
      togglePinApp(appId);
    }
    setAppMenuOpen(null);
  };

  const handleAppOpen = (appId: string) => {
    const window = windows.find(w => w.id === appId);
    const app = applications[appId];
    
    if (window) {
      if (window.isMinimized) {
        restoreWindow(appId);
      } else if (window.isFocused) {
        minimizeWindow(appId);
      } else {
        focusWindow(appId);
      }
    } else if (app) {
      openWindow(app);
    }
    setAppMenuOpen(null);
  };

  const handleAppClose = (appId: string) => {
    closeWindow(appId);
    setAppMenuOpen(null);
  };

  // Get all apps to show in taskbar (pinned + open windows)
  const taskbarApps = [...new Set([...pinnedApps, ...windows.map(w => w.id)])];

  return (
    <div className="taskbar" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '48px',
      background: 'rgba(20, 20, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      zIndex: 9999
    }}>
      <button 
        className={`start-menu-button ${showStartMenu ? 'active' : ''}`}
        onClick={() => setShowStartMenu(!showStartMenu)}
        style={{
          background: showStartMenu 
            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))'
            : 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '8px 12px',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.3s'
        }}
      >
        <FaWindows size={16} /> ChkhiroOS
      </button>

      <div className="taskbar-separator" style={{
        width: '1px',
        height: '30px',
        background: 'rgba(255, 255, 255, 0.1)',
        margin: '0 10px'
      }} />

      <div className="taskbar-apps" style={{
        display: 'flex',
        gap: '4px',
        flex: 1
      }}>
        {taskbarApps.map(appId => {
          const window = windows.find(w => w.id === appId);
          const app = applications[appId];
          const isPinned = pinnedApps.includes(appId);
          const isOpen = !!window;
          const isMinimized = window?.isMinimized;
          const isFocused = window?.isFocused;
          
          if (!app) return null;
          
          return (
            <div
              key={appId}
              className="taskbar-app"
              onClick={() => handleAppClick(appId)}
              onContextMenu={(e) => handleAppRightClick(e, appId)}
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: '8px',
                background: isFocused 
                  ? 'rgba(255, 255, 255, 0.15)'
                  : isOpen 
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'transparent',
                border: '1px solid',
                borderColor: isFocused 
                  ? 'rgba(255, 255, 255, 0.3)'
                  : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                minWidth: '40px',
                height: '40px'
              }}
              onMouseEnter={(e) => {
                if (!isFocused) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isFocused) {
                  e.currentTarget.style.background = isOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent';
                }
              }}
              title={app.title}
            >
              {app.icon}
              {isPinned && (
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '8px'
                }}>
                  <FaThumbtack />
                </div>
              )}
              {isOpen && (
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: isMinimized ? '4px' : '20px',
                  height: '2px',
                  background: isFocused 
                    ? 'linear-gradient(90deg, #667eea, #764ba2)'
                    : 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '2px',
                  transition: 'all 0.2s'
                }} />
              )}
              
              {/* App Menu Popup */}
              {appMenuOpen === appId && (
                <div 
                  className="app-menu"
                  style={{
                    position: 'absolute',
                    bottom: '52px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(32, 32, 32, 0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    zIndex: 10000,
                    minWidth: '120px'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div 
                    className="menu-item"
                    onClick={() => handleAppOpen(appId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#fff',
                      fontSize: '12px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {app.icon}
                    <span>{isOpen ? (window?.isMinimized ? 'Open' : 'Minimize') : 'Open'}</span>
                  </div>
                  
                  <div 
                    className="menu-item"
                    onClick={() => handlePinToggle(appId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#fff',
                      fontSize: '12px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <FaThumbtack />
                    <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                  </div>
                  
                  {isOpen && (
                    <div 
                      className="menu-item"
                      onClick={() => handleAppClose(appId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#ff6b6b',
                        fontSize: '12px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <FaTimes />
                      <span>Close</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showStartMenu && (
        <div className="start-menu" style={{
          position: 'absolute',
          bottom: '58px',
          left: '10px',
          width: '300px',
          background: 'rgba(32, 32, 32, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div className="start-menu-header" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '12px',
            color: '#fff',
            fontSize: '14px'
          }}>
            <FaWindows size={16} />
            <span>Welcome, {userName}</span>
          </div>
          <div className="start-menu-items">
            {/* About Me */}
            <div 
              className="menu-item"
              onClick={() => {
                const aboutApp = applications['about'];
                if (aboutApp) {
                  openWindow(aboutApp);
                }
                setShowStartMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '13px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FaUser size={16} />
              <span>About Me</span>
            </div>

            {/* My Projects */}
            <div 
              className="menu-item"
              onClick={() => {
                const projectsApp = applications['portfolio'];
                if (projectsApp) {
                  openWindow(projectsApp);
                }
                setShowStartMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '13px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FaFolderOpen size={16} />
              <span>My Projects</span>
            </div>

            {/* Separator */}
            <div style={{
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '8px 0'
            }} />

            {/* Power Off */}
            <div 
              className="menu-item"
              onClick={() => {
                if (onPowerOff) {
                  onPowerOff();
                }
                setShowStartMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#ff6b6b',
                fontSize: '13px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FaPowerOff size={16} />
              <span>Power Off</span>
            </div>
          </div>
        </div>
      )}

      <div className="taskbar-right" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginLeft: 'auto'
      }}>
        <div className="time" style={{
          color: '#fff',
          fontSize: '13px',
          fontWeight: 500
        }}>
          {currentTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};