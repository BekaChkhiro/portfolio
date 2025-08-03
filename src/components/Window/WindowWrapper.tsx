import React, { useState, useEffect } from 'react';
import { useWindows, WindowState } from '../../contexts/WindowContext';
import './Window.css';

interface WindowWrapperProps {
  window: WindowState;
}

export const WindowWrapper: React.FC<WindowWrapperProps> = ({ window }) => {
  const { 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    focusWindow, 
    updateWindowPosition,
    updateWindowSize 
  } = useWindows();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y
    });
    focusWindow(window.id);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: window.size.width,
      height: window.size.height,
      x: e.clientX,
      y: e.clientY
    });
    focusWindow(window.id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.isMaximized) {
        updateWindowPosition(window.id, {
          x: Math.max(0, e.clientX - dragStart.x),
          y: Math.max(0, e.clientY - dragStart.y)
        });
      }
      
      if (isResizing && !window.isMaximized) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        updateWindowSize(window.id, {
          width: Math.max(300, resizeStart.width + deltaX),
          height: Math.max(200, resizeStart.height + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, window.id, window.isMaximized]);

  if (window.isMinimized) return null;

  const windowStyle = window.isMaximized 
    ? { 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: 'calc(100% - 48px)',
        borderRadius: 0
      }
    : { 
        top: window.position.y, 
        left: window.position.x, 
        width: window.size.width, 
        height: window.size.height,
        maxWidth: 'calc(100% - 20px)',
        maxHeight: 'calc(100% - 68px)'
      };

  return (
    <div 
      className={`window ${window.isMaximized ? 'maximized' : ''} ${window.isFocused ? 'focused' : ''}`}
      style={{
        ...windowStyle,
        zIndex: window.zIndex,
        position: 'fixed',
        background: 'rgba(32, 32, 32, 0.98)',
        backdropFilter: 'blur(20px)',
        border: window.isFocused ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: window.isMaximized ? 0 : '12px',
        boxShadow: window.isFocused 
          ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
          : '0 10px 40px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s, border 0.2s'
      }}
      onClick={() => focusWindow(window.id)}
    >
      <div 
        className="window-header"
        onMouseDown={handleMouseDown}
        style={{
          background: window.isFocused 
            ? 'linear-gradient(180deg, rgba(60, 60, 60, 0.9) 0%, rgba(40, 40, 40, 0.9) 100%)'
            : 'linear-gradient(180deg, rgba(45, 45, 45, 0.9) 0%, rgba(35, 35, 35, 0.9) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0 12px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'move',
          userSelect: 'none',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="window-title" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: window.isFocused ? '#fff' : '#aaa',
          fontSize: '13px',
          fontWeight: 500
        }}>
          {window.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{window.icon}</span>}
          {window.title}
        </div>
        <div className="window-controls" style={{
          display: 'flex',
          gap: '4px'
        }}>
          <button 
            className="window-control minimize"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(window.id);
            }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: '#febc2e',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffc93d';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#febc2e';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '0';
            }}
          >
            <span 
              className="icon" 
              style={{ 
                opacity: 0, 
                transition: 'opacity 0.2s',
                color: 'rgba(0, 0, 0, 0.7)',
                fontSize: '10px',
                fontWeight: 'bold',
                lineHeight: 1,
                marginTop: '-2px'
              }}
            >
              −
            </span>
          </button>
          <button 
            className="window-control maximize"
            onClick={(e) => {
              e.stopPropagation();
              maximizeWindow(window.id);
            }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: '#28c93f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#35d74c';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#28c93f';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '0';
            }}
          >
            {window.isMaximized ? 
              <svg 
                className="icon"
                width="6" 
                height="6" 
                viewBox="0 0 8 8"
                style={{ 
                  opacity: 0, 
                  transition: 'opacity 0.2s',
                  fill: 'rgba(0, 0, 0, 0.7)'
                }}
              >
                <path d="M1 3v4h4v-1H2V3H1zm2-2h4v4h-1V2H3V1z"/>
              </svg> : 
              <svg 
                className="icon"
                width="6" 
                height="6" 
                viewBox="0 0 8 8"
                style={{ 
                  opacity: 0, 
                  transition: 'opacity 0.2s',
                  fill: 'rgba(0, 0, 0, 0.7)'
                }}
              >
                <path d="M0 0v8h8V0H0zm7 7H1V1h6v6z"/>
              </svg>
            }
          </button>
          <button 
            className="window-control close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(window.id);
            }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: '#fe5f58',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff6e67';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fe5f58';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '0';
            }}
          >
            <svg 
              className="icon"
              width="6" 
              height="6" 
              viewBox="0 0 8 8"
              style={{ 
                opacity: 0, 
                transition: 'opacity 0.2s',
                fill: 'rgba(0, 0, 0, 0.7)'
              }}
            >
              <path d="M1.414 1L4 3.586 6.586 1 7 1.414 4.414 4 7 6.586 6.586 7 4 4.414 1.414 7 1 6.586 3.586 4 1 1.414z"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="window-content" style={{
        flex: 1,
        overflow: 'auto',
        background: 'rgba(24, 24, 24, 0.95)',
        color: '#fff',
        padding: 0
      }}>
        {window.component}
      </div>
      {!window.isMaximized && (
        <div 
          className="window-resize-handle"
          onMouseDown={handleResizeStart}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '20px',
            height: '20px',
            cursor: 'nwse-resize',
            background: 'transparent'
          }}
        />
      )}
    </div>
  );
};