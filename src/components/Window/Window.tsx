import React, { useState } from 'react';
import { FaTimes, FaMinus, FaExpand } from 'react-icons/fa';
import './Window.css';

interface WindowProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultX?: number;
  defaultY?: number;
}

export const Window: React.FC<WindowProps> = ({
  title,
  icon,
  children,
  isOpen,
  onClose,
  onMinimize,
  defaultWidth = 400,
  defaultHeight = 300,
  defaultX = 50,
  defaultY = 50
}) => {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isMaximized) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (!isOpen) return null;

  const windowStyle = isMaximized 
    ? { top: 0, left: 0, width: '100%', height: '100%' }
    : { 
        top: position.y, 
        left: position.x, 
        width: size.width, 
        height: size.height 
      };

  return (
    <div 
      className={`window ${isMaximized ? 'maximized' : ''}`}
      style={windowStyle}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="window-header"
        onMouseDown={handleMouseDown}
      >
        <div className="window-title">
          {icon && <span className="window-icon">{icon}</span>}
          {title}
        </div>
        <div className="window-controls">
          {onMinimize && (
            <button className="window-control minimize" onClick={onMinimize}>
              <FaMinus size={10} />
            </button>
          )}
          <button className="window-control maximize" onClick={handleMaximize}>
            <FaExpand size={10} />
          </button>
          <button className="window-control close" onClick={onClose}>
            <FaTimes size={10} />
          </button>
        </div>
      </div>
      <div className="window-content">
        {children}
      </div>
    </div>
  );
};