import React, { useState, useEffect } from 'react';
import './RemoteControl.css';

const RemoteControl: React.FC = () => {
  const [networkIP, setNetworkIP] = useState<string>('localhost');
  const [connectionUrl, setConnectionUrl] = useState<string>('http://localhost:8080');

  const generateQRCode = (url: string): string => {
    try {
      const QRCode = require('qrcode-generator');
      const qr = QRCode(4, 'L');
      qr.addData(url);
      qr.make();
      return qr.createDataURL(8);
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
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
    getNetworkIP().then(ip => {
      setNetworkIP(ip);
      const url = `http://${ip}:8080`;
      setConnectionUrl(url);
    });
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
      </div>

      <div className="setup-instructions">
        <div className="step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>🖥️ Start the Server</h3>
            <p>Open Terminal and run:</p>
            <div className="code-block">
              <code>npm run remote-server</code>
              <button 
                onClick={() => navigator.clipboard.writeText('npm run remote-server')}
                className="copy-button"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        <div className="step qr-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>📱 Connect Your Phone</h3>
            <p>Once the server is running, scan this QR code with your phone's camera:</p>
            
            <div className="qr-main-section">
              {qrCode && (
                <div className="qr-container-large">
                  <div className="qr-frame">
                    <img src={qrCode} alt="QR Code for Phone Connection" className="qr-code-large" />
                    <div className="qr-label">📲 Scan with Phone Camera</div>
                  </div>
                </div>
              )}
              
              <div className="qr-instructions">
                <div className="qr-instruction-item">
                  <span className="instruction-icon">📱</span>
                  <span>Open Camera app on phone</span>
                </div>
                <div className="qr-instruction-item">
                  <span className="instruction-icon">📸</span>
                  <span>Point camera at QR code</span>
                </div>
                <div className="qr-instruction-item">
                  <span className="instruction-icon">👆</span>
                  <span>Tap notification to open</span>
                </div>
              </div>
            </div>
            
            <div className="url-fallback">
              <h4>🔗 Or manually enter this URL:</h4>
              <div className="url-display">
                <input 
                  type="text" 
                  value={connectionUrl} 
                  readOnly 
                  className="url-input"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(connectionUrl)}
                  className="copy-button"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>🎮 Control Your Mouse</h3>
            <div className="controls-info">
              <div className="control-item">
                <span className="control-icon">👆</span>
                <span>Move finger to control cursor</span>
              </div>
              <div className="control-item">
                <span className="control-icon">👆</span>
                <span>Tap for left click</span>
              </div>
              <div className="control-item">
                <span className="control-icon">👆</span>
                <span>Long press for right click</span>
              </div>
              <div className="control-item">
                <span className="control-icon">✌️</span>
                <span>Two fingers to scroll</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="requirements">
        <h3>📋 Requirements</h3>
        <ul>
          <li>Both devices must be on the same WiFi network</li>
          <li>Node.js and npm must be installed</li>
          <li>Terminal access to run the server</li>
        </ul>
      </div>
    </div>
  );
};

export default RemoteControl;