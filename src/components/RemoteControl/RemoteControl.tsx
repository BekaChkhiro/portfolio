import React, { useState, useEffect } from 'react';
import './RemoteControl.css';

const RemoteControl: React.FC = () => {
  const [networkIP, setNetworkIP] = useState<string>('localhost');
  const [connectionUrl, setConnectionUrl] = useState<string>('http://localhost:8080');
  const [sessionId, setSessionId] = useState<string>('');

  const generateSessionId = (): string => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const generateQRCode = (url: string): string => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
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
    // Generate unique session ID
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    
    // Check if we have a backend URL from environment
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    if (backendUrl && backendUrl !== 'http://localhost:9090') {
      // Production mode - use environment backend URL
      const url = `${backendUrl}/session.html?sessionId=${newSessionId}`;
      setConnectionUrl(url);
      setNetworkIP(new URL(backendUrl).hostname);
    } else {
      // Development mode - use network IP
      getNetworkIP().then(ip => {
        setNetworkIP(ip);
        const url = `http://${ip}:9090/session.html?sessionId=${newSessionId}`;
        setConnectionUrl(url);
      });
    }
  }, []);

  const qrCode = generateQRCode(connectionUrl);


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
        {sessionId && (
          <div className="session-status">
            <strong>🆔 Session ID: </strong>
            <span className="session-id">{sessionId}</span>
          </div>
        )}
      </div>

      <div className="qr-section">
        {qrCode && (
          <div className="qr-container-large">
            <div className="qr-frame">
              <img src={qrCode} alt="QR Code for Phone Connection" className="qr-code-large" />
            </div>
            <div className="qr-url-info" style={{textAlign: 'center', marginTop: '10px', fontSize: '12px', opacity: 0.7}}>
              {connectionUrl}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoteControl;