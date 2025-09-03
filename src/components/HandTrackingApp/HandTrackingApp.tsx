import React, { useState, useRef, useEffect } from 'react';
import HandTracking from '../HandTracking/HandTracking';
import './HandTrackingApp.css';

const HandTrackingApp: React.FC = () => {
  const [isActive, setIsActive] = useState(true); // ავტომატურად ჩართული
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const cursorRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);

  // მაუსის პოზიციის განახლება
  const handleHandPosition = (x: number, y: number) => {
    // Hand tracking camera coordinates (0-640, 0-480) to screen coordinates
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // NO mirroring - direct mapping (natural movement)
    const windowX = x * screenWidth / 640;
    const windowY = y * screenHeight / 480;
    
    // Clamp to screen bounds
    const clampedX = Math.max(0, Math.min(screenWidth - 1, windowX));
    const clampedY = Math.max(0, Math.min(screenHeight - 1, windowY));
    
    setCursorPosition({ x: clampedX, y: clampedY });
    
    // cursor-ის პოზიციის განახლება
    if (cursorRef.current) {
      cursorRef.current.style.left = `${clampedX}px`;
      cursorRef.current.style.top = `${clampedY}px`;
      cursorRef.current.style.display = 'block';
    }

    // მაუსის მოვმენტის simulation
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: clampedX,
      clientY: clampedY,
      bubbles: true
    });
    document.dispatchEvent(mouseMoveEvent);
  };

  // pinch gesture - კლიკი
  const handlePinchGesture = () => {
    const now = Date.now();
    
    // debouncing - ერთი წამში მხოლოდ ერთი კლიკი
    if (now - lastClickTime < 500) return;
    
    setLastClickTime(now);
    setClickCount(prev => prev + 1);

    // კლიკის simulation cursor-ის პოზიციაზე
    const clickEvent = new MouseEvent('click', {
      clientX: cursorPosition.x,
      clientY: cursorPosition.y,
      bubbles: true
    });
    
    // ვპოვოთ ელემენტი cursor-ის ქვეშ
    const elementUnderCursor = document.elementFromPoint(cursorPosition.x, cursorPosition.y);
    if (elementUnderCursor) {
      elementUnderCursor.dispatchEvent(clickEvent);
    }

    // ვიზუალური feedback
    showClickEffect();
  };

  const showClickEffect = () => {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.style.left = `${cursorPosition.x - 15}px`;
    effect.style.top = `${cursorPosition.y - 15}px`;
    document.body.appendChild(effect);

    // Virtual cursor animation
    if (cursorRef.current) {
      cursorRef.current.classList.add('clicking');
      setTimeout(() => {
        cursorRef.current?.classList.remove('clicking');
      }, 300);
    }

    setTimeout(() => {
      if (document.body.contains(effect)) {
        document.body.removeChild(effect);
      }
    }, 600);
  };

  const toggleTracking = () => {
    setIsActive(!isActive);
    if (showWelcome) {
      setShowWelcome(false);
    }
  };

  const resetStats = () => {
    setClickCount(0);
  };

  // CSS-ის დამატება click effect-ისთვის
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .click-effect {
        position: fixed;
        width: 30px;
        height: 30px;
        border: 3px solid #00ff88;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        animation: clickRipple 0.6s ease-out forwards;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
      }
      
      @keyframes clickRipple {
        0% {
          transform: scale(0.5);
          opacity: 1;
          border-width: 3px;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.8;
          border-width: 2px;
        }
        100% {
          transform: scale(2.5);
          opacity: 0;
          border-width: 1px;
        }
      }
      
      .virtual-cursor {
        position: fixed;
        width: 16px;
        height: 16px;
        background: linear-gradient(45deg, #ff0080, #ff6b35);
        border: 2px solid #ffffff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.15s ease;
        box-shadow: 
          0 0 15px rgba(255, 0, 128, 0.6),
          0 0 5px rgba(255, 255, 255, 0.8);
        display: none;
      }
      
      .virtual-cursor.clicking {
        transform: scale(1.8);
        background: linear-gradient(45deg, #00ff88, #66bb6a);
        box-shadow: 
          0 0 25px rgba(0, 255, 136, 0.8),
          0 0 10px rgba(255, 255, 255, 1);
        border-color: #00ff88;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="hand-tracking-app" ref={appRef}>
      {/* ვირტუალური cursor - absolute positioned for full screen */}
      {isActive && (
        <div 
          ref={cursorRef}
          className="virtual-cursor"
          style={{
            position: 'fixed',
            zIndex: 99999,
            pointerEvents: 'none'
          }}
        />
      )}

      <div className="app-header">
        <h2>🖐️ Hand Tracking Mouse Control</h2>
        <div className="controls">
          <button 
            className={`toggle-btn ${isActive ? 'active' : ''}`}
            onClick={toggleTracking}
          >
            {isActive ? '⏹️ Stop Tracking' : '▶️ Start Tracking'}
          </button>
          <button className="reset-btn" onClick={resetStats}>
            🔄 Reset Stats
          </button>
        </div>
      </div>

      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">Status:</span>
          <span className={`stat-value ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? '🟢 Active' : '🔴 Inactive'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Cursor Position:</span>
          <span className="stat-value">
            X: {Math.round(cursorPosition.x)}, Y: {Math.round(cursorPosition.y)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Clicks:</span>
          <span className="stat-value">{clickCount}</span>
        </div>
      </div>

      <div className="tracking-area">
        <HandTracking 
          isActive={isActive}
          onHandPosition={handleHandPosition}
          onPinchGesture={handlePinchGesture}
        />
      </div>

      {showWelcome && (
        <div className="instructions-overlay">
          <div className="instructions-content">
            <h3>🖐️ Welcome to Hand Tracking!</h3>
            <div className="welcome-message">
              <p>🎉 Hand tracking is already <strong>ACTIVE</strong> and ready to use!</p>
            </div>
            <div className="instruction-steps">
              <div className="step">
                <span className="step-number">☝️</span>
                <span className="step-text">Point with INDEX finger to move cursor anywhere on screen</span>
              </div>
              <div className="step">
                <span className="step-number">🤏</span>
                <span className="step-text">Pinch thumb + index finger to click</span>
              </div>
              <div className="step">
                <span className="step-number">🖱️</span>
                <span className="step-text">Works on entire desktop - not just this window!</span>
              </div>
              <div className="step">
                <span className="step-number">📷</span>
                <span className="step-text">Allow camera access when prompted</span>
              </div>
            </div>
            <div className="warning-note">
              💡 Pro tip: Good lighting and steady hands work best!
            </div>
            <button 
              className="got-it-btn"
              onClick={() => setShowWelcome(false)}
            >
              Got it! Let's Start 🚀
            </button>
          </div>
        </div>
      )}

      {!isActive && !showWelcome && (
        <div className="instructions-overlay">
          <div className="instructions-content">
            <h3>🖐️ Hand Tracking Paused</h3>
            <p>Click "Start Tracking" to resume hand control</p>
            <div className="warning-note">
              Your camera will be activated when you start tracking
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandTrackingApp;