import React, { useState, useEffect } from 'react';
import './RemoteControl.css';

const RemoteControl: React.FC = () => {
  const [networkIP, setNetworkIP] = useState<string>('localhost');
  const [connectionUrl, setConnectionUrl] = useState<string>('http://localhost:8080');
  const [isProduction, setIsProduction] = useState<boolean>(false);
  const [backendUrl, setBackendUrl] = useState<string>('');

  const generateQRCode = (url: string): string => {
    // In production, use separate backend URL directly
    // In development, use local server
    const targetUrl = isProduction ? backendUrl : url;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;
  };

  const getNetworkIP = async () => {
    try {
      // შევცდით network IP-ის პოვნას
      const response = await fetch('/api/network-ip').catch(() => null);
      if (response && response.ok) {
        const data = await response.json();
        return data.ip;
      }
      
      // ალტერნატივა - WebRTC-ით IP detection
      return new Promise<string>((resolve) => {
        const rtc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        rtc.createDataChannel('');
        rtc.createOffer().then(rtc.setLocalDescription.bind(rtc));
        
        rtc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const match = candidate.match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/);
            if (match && !match[0].startsWith('127.')) {
              rtc.close();
              resolve(match[0]);
            }
          }
        };
        
        // Timeout after 3 seconds
        setTimeout(() => {
          rtc.close();
          resolve('localhost');
        }, 3000);
      });
    } catch (error) {
      console.error('Error getting network IP:', error);
      return 'localhost';
    }
  };

  useEffect(() => {
    // Check if we're in production (not localhost)
    const isProd = !window.location.hostname.includes('localhost') && 
                   !window.location.hostname.includes('127.0.0.1') &&
                   !window.location.hostname.includes('192.168') &&
                   !window.location.hostname.includes('10.');
    setIsProduction(isProd);

    // Get backend URL from environment variable
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9090';
    
    if (isProd) {
      // Production: Use backend URL from env
      setBackendUrl(BACKEND_URL);
      setConnectionUrl(BACKEND_URL);
    } else {
      // Development: Use backend URL or local network IP
      if (BACKEND_URL && BACKEND_URL !== 'http://localhost:9090') {
        setConnectionUrl(BACKEND_URL);
      } else {
        getNetworkIP().then(ip => {
          setNetworkIP(ip);
          const url = `http://${ip}:9090`;
          setConnectionUrl(url);
        });
      }
    }
  }, []);

  const qrCode = generateQRCode(connectionUrl);

  if (isProduction && (!backendUrl || backendUrl === 'http://localhost:9090')) {
    return (
      <div className="remote-control">
        <div className="remote-control-header">
          <h2>📱 Remote Control</h2>
          <div className="status-indicator">
            <span className="status-dot inactive"></span>
            <span>Backend Required</span>
          </div>
        </div>

        <div className="production-notice">
          <div className="notice-content">
            <h3>🚧 Separate Backend Required</h3>
            <p>Remote control requires a separate backend server.</p>
            <p>Deploy the backend and update the configuration.</p>
            
            <div className="local-instructions">
              <h4>🚀 Setup Instructions:</h4>
              <ol>
                <li>Deploy <code>remote-control-backend</code> folder</li>
                <li>Update <code>BACKEND_URL</code> in this component</li>
                <li>Backend handles mouse control with RobotJS</li>
                <li>QR code will work after backend deployment</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="remote-control">
      <div className="remote-control-header">
        <h2>📱 Phone Mouse Control</h2>
        <div className="status-indicator">
          <span className="status-dot inactive"></span>
          <span>Ready to Setup</span>
        </div>
      </div>

      <div className="network-info">
        <div className="network-status">
          <strong>🌐 Network IP: </strong>
          <span className="ip-address">{networkIP}</span>
          {networkIP !== 'localhost' && (
            <span className="ip-status success">✅ Detected</span>
          )}
          {networkIP === 'localhost' && (
            <span className="ip-status warning">⚠️ Using localhost</span>
          )}
        </div>
      </div>

      <div className="qr-section">
        {qrCode && !isProduction && (
          <div className="qr-container-large">
            <div className="qr-frame">
              <img src={qrCode} alt="QR Code for Phone Connection" className="qr-code-large" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoteControl;