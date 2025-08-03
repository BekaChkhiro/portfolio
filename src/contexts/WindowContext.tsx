import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WindowState {
  id: string;
  title: string;
  icon: ReactNode;
  component: ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  isPinned: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

interface WindowContextType {
  windows: WindowState[];
  pinnedApps: string[];
  openWindow: (window: Omit<WindowState, 'isMinimized' | 'isMaximized' | 'isFocused' | 'isPinned' | 'zIndex'>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  togglePinApp: (appId: string) => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const useWindows = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindows must be used within a WindowProvider');
  }
  return context;
};

export const WindowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [pinnedApps, setPinnedApps] = useState<string[]>(() => {
    const saved = localStorage.getItem('chkhiros-pinned-apps');
    return saved ? JSON.parse(saved) : [];
  });
  const [nextZIndex, setNextZIndex] = useState(1000);

  const openWindow = (window: Omit<WindowState, 'isMinimized' | 'isMaximized' | 'isFocused' | 'isPinned' | 'zIndex'>) => {
    const existingWindow = windows.find(w => w.id === window.id);
    
    if (existingWindow) {
      // If window exists, restore and focus it
      if (existingWindow.isMinimized) {
        restoreWindow(window.id);
      }
      focusWindow(window.id);
      return;
    }

    // Create new window
    const newWindow: WindowState = {
      ...window,
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      isPinned: pinnedApps.includes(window.id),
      zIndex: nextZIndex
    };

    setNextZIndex(prev => prev + 1);
    setWindows(prev => [...prev.map(w => ({ ...w, isFocused: false })), newWindow]);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
    ));
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const restoreWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: false, isMaximized: false } : w
    ));
    focusWindow(id);
  };

  const focusWindow = (id: string) => {
    setWindows(prev => prev.map(w => ({
      ...w,
      isFocused: w.id === id,
      zIndex: w.id === id ? nextZIndex : w.zIndex
    })));
    setNextZIndex(prev => prev + 1);
  };

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, position } : w
    ));
  };

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, size } : w
    ));
  };

  const togglePinApp = (appId: string) => {
    setPinnedApps(prev => {
      const newPinned = prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId];
      
      localStorage.setItem('chkhiros-pinned-apps', JSON.stringify(newPinned));
      return newPinned;
    });
  };

  return (
    <WindowContext.Provider value={{
      windows,
      pinnedApps,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      togglePinApp
    }}>
      {children}
    </WindowContext.Provider>
  );
};