import React from 'react';
import { 
  FaFolder, 
  FaGamepad, 
  FaTerminal,
  FaCog,
  FaThumbtack,
  FaUser,
  FaCamera
} from 'react-icons/fa';
import { Taskbar } from '../Taskbar/Taskbar';
import { useWindows } from '../../contexts/WindowContext';
import { WindowWrapper } from '../Window/WindowWrapper';
import { Portfolio } from '../Portfolio/Portfolio';
import { Games } from '../Games/Games';
import { Terminal } from '../Terminal/Terminal';
import { AboutMe } from '../AboutMe/AboutMe';
import { Camera } from '../Camera/Camera';
import './Desktop.css';

interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
  color?: string;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, label, color = '#fff', onClick, onContextMenu }) => (
  <div className="desktop-icon" onClick={onClick} onContextMenu={onContextMenu}>
    <div style={{ color }}>{icon}</div>
    <span>{label}</span>
  </div>
);

interface DesktopProps {
  theme?: {
    background: string;
    name: string;
  };
  userName?: string;
  onPowerOff?: () => void;
}

export const Desktop: React.FC<DesktopProps> = ({ theme, userName = 'User', onPowerOff }) => {
  const { openWindow, togglePinApp, pinnedApps, windows } = useWindows();
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; appId: string } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, appId });
  };

  const handlePinApp = (appId: string) => {
    togglePinApp(appId);
    setContextMenu(null);
  };

  const applications = {
    portfolio: {
      id: 'portfolio',
      title: 'My Projects',
      icon: <FaFolder />,
      component: <Portfolio />,
      position: { x: 100, y: 100 },
      size: { width: 600, height: 500 }
    },
    terminal: {
      id: 'terminal',
      title: 'Terminal',
      icon: <FaTerminal />,
      component: <Terminal />,
      position: { x: 200, y: 100 },
      size: { width: 600, height: 400 }
    },
    games: {
      id: 'games',
      title: 'Games',
      icon: <FaGamepad />,
      component: <Games />,
      position: { x: 150, y: 150 },
      size: { width: 500, height: 400 }
    },
    settings: {
      id: 'settings',
      title: 'Settings',
      icon: <FaCog />,
      component: <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>⚙️ ChkhiroOS Settings</h2>
        <p>System settings coming soon!</p>
        <p>Customize your ChkhiroOS experience here.</p>
      </div>,
      position: { x: 200, y: 200 },
      size: { width: 500, height: 400 }
    },
    about: {
      id: 'about',
      title: 'About Me',
      icon: <FaUser />,
      component: <AboutMe />,
      position: { x: 30, y: 30 },
      size: { width: 480, height: 350 }
    },
    camera: {
      id: 'camera',
      title: 'Camera',
      icon: <FaCamera />,
      component: <Camera />,
      position: { x: 200, y: 100 },
      size: { width: 750, height: 650 }
    }
  };

  return (
    <div 
      className="desktop-container" 
      style={{
        background: theme?.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ffa73d 100%)',
        backgroundSize: '400% 400%'
      }}
    >
      <div className="desktop-icons">
        <DesktopIcon 
          icon={<FaFolder size={20} />} 
          label="Projects" 
          color="#ffd700"
          onClick={() => openWindow(applications.portfolio)}
          onContextMenu={(e) => handleContextMenu(e, 'portfolio')}
        />
        <DesktopIcon 
          icon={<FaTerminal size={20} />} 
          label="Terminal" 
          color="#00ff00"
          onClick={() => openWindow(applications.terminal)}
          onContextMenu={(e) => handleContextMenu(e, 'terminal')}
        />
        <DesktopIcon 
          icon={<FaGamepad size={20} />} 
          label="Games" 
          color="#ff6b6b"
          onClick={() => openWindow(applications.games)}
          onContextMenu={(e) => handleContextMenu(e, 'games')}
        />
        <DesktopIcon 
          icon={<FaCog size={20} />} 
          label="Settings" 
          color="#b8b8b8"
          onClick={() => openWindow(applications.settings)}
          onContextMenu={(e) => handleContextMenu(e, 'settings')}
        />
        <DesktopIcon 
          icon={<FaUser size={20} />} 
          label="About Me" 
          color="#9b59b6"
          onClick={() => openWindow(applications.about)}
          onContextMenu={(e) => handleContextMenu(e, 'about')}
        />
        <DesktopIcon 
          icon={<FaCamera size={20} />} 
          label="Camera" 
          color="#ff9500"
          onClick={() => openWindow(applications.camera)}
          onContextMenu={(e) => handleContextMenu(e, 'camera')}
        />
      </div>

      {/* Context menu for pinning */}
      {contextMenu && (
        <div 
          className="context-menu"
          style={{ 
            position: 'fixed', 
            left: contextMenu.x, 
            top: contextMenu.y,
            background: 'rgba(32, 32, 32, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px 0',
            minWidth: '150px',
            zIndex: 10000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <div 
            className="context-menu-item"
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#fff',
              fontSize: '13px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              const app = Object.values(applications).find(a => a.id === contextMenu.appId);
              if (app) {
                handlePinApp(app.id);
              }
            }}
          >
            <FaThumbtack size={12} />
            {pinnedApps.includes(contextMenu.appId) ? 'Unpin from taskbar' : 'Pin to taskbar'}
          </div>
        </div>
      )}

      {/* Render open windows */}
      {windows.map(window => (
        <WindowWrapper key={window.id} window={window} />
      ))}

      <Taskbar 
        userName={userName} 
        applications={applications}
        onPowerOff={onPowerOff}
      />
    </div>
  );
};