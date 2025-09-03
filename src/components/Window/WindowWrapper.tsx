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
        background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.98) 0%, rgba(28, 28, 28, 0.98) 100%)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: window.isFocused 
          ? '1px solid rgba(255, 255, 255, 0.15)' 
          : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: window.isMaximized ? 0 : '12px',
        boxShadow: window.isFocused 
          ? '0 25px 80px rgba(0, 0, 0, 0.7), 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 0 120px rgba(100, 100, 255, 0.1)'
          : '0 15px 50px rgba(0, 0, 0, 0.4), 0 5px 15px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: window.isFocused ? 'translateY(-2px)' : 'translateY(0)'
      }}
      onClick={() => focusWindow(window.id)}
    >
      <div 
        className="window-header"
        onMouseDown={handleMouseDown}
        style={{
          background: window.isFocused 
            ? 'linear-gradient(180deg, rgba(55, 55, 60, 0.95) 0%, rgba(45, 45, 50, 0.95) 100%)'
            : 'linear-gradient(180deg, rgba(42, 42, 45, 0.92) 0%, rgba(35, 35, 38, 0.92) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0 16px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'move',
          userSelect: 'none',
          position: 'relative',
          zIndex: 1,
          borderTopLeftRadius: window.isMaximized ? 0 : '12px',
          borderTopRightRadius: window.isMaximized ? 0 : '12px'
        }}
      >
        <div className="window-title" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: window.isFocused ? '#ffffff' : '#888888',
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.3px'
        }}>
          {window.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{window.icon}</span>}
          {window.title}
        </div>
        <div className="window-controls" style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <button 
            className="window-control minimize"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(window.id);
            }}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: 'none',
              background: '#febc2e',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffc93d';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(254, 188, 46, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#febc2e';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '0';
            }}
          >
            <span 
              className="icon" 
              style={{ 
                opacity: 0, 
                transition: 'opacity 0.2s ease',
                color: 'rgba(0, 0, 0, 0.8)',
                fontSize: '11px',
                fontWeight: 'bold',
                lineHeight: 1,
                marginTop: '-1px'
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
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: 'none',
              background: '#28c93f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#35d74c';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(40, 201, 63, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#28c93f';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '0';
            }}
          >
            {window.isMaximized ? 
              <svg 
                className="icon"
                width="8" 
                height="8" 
                viewBox="0 0 8 8"
                style={{ 
                  opacity: 0, 
                  transition: 'opacity 0.2s ease',
                  fill: 'rgba(0, 0, 0, 0.8)'
                }}
              >
                <path d="M1 3v4h4v-1H2V3H1zm2-2h4v4h-1V2H3V1z"/>
              </svg> : 
              <svg 
                className="icon"
                width="8" 
                height="8" 
                viewBox="0 0 8 8"
                style={{ 
                  opacity: 0, 
                  transition: 'opacity 0.2s ease',
                  fill: 'rgba(0, 0, 0, 0.8)'
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
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: 'none',
              background: '#fe5f58',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff6e67';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(254, 95, 88, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fe5f58';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement;
              if (icon) icon.style.opacity = '0';
            }}
          >
            <svg 
              className="icon"
              width="8" 
              height="8" 
              viewBox="0 0 8 8"
              style={{ 
                opacity: 0, 
                transition: 'opacity 0.2s ease',
                fill: 'rgba(0, 0, 0, 0.8)'
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
        background: 'linear-gradient(135deg, rgba(26, 26, 30, 0.98) 0%, rgba(22, 22, 26, 0.98) 100%)',
        color: '#ffffff',
        padding: 0,
        borderBottomLeftRadius: window.isMaximized ? 0 : '12px',
        borderBottomRightRadius: window.isMaximized ? 0 : '12px',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
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
            background: 'radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.1) 0%, transparent 50%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.05) 0%, transparent 50%)';
          }}
        >
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRight: '2px solid rgba(255, 255, 255, 0.3)',
            borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0 0 2px 0',
            transition: 'border-color 0.2s ease',
            pointerEvents: 'none'
          }} />
        </div>
      )}
    </div>
  );
};