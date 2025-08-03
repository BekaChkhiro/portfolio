import React, { useRef, useState, useEffect } from 'react';
import { FaCamera, FaVideo, FaStop, FaImages, FaDownload, FaTrash, FaPlay, FaCog, FaExpand, FaCompress } from 'react-icons/fa';
import './Camera.css';

interface CapturedMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  timestamp: Date;
  name: string;
}

export const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentView, setCurrentView] = useState<'camera' | 'gallery'>('camera');
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<CapturedMedia | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    initializeCamera();
    loadSavedMedia();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadSavedMedia = () => {
    const saved = localStorage.getItem('chkhiros-camera-media');
    if (saved) {
      setCapturedMedia(JSON.parse(saved));
    }
  };

  const saveMedia = (media: CapturedMedia[]) => {
    localStorage.setItem('chkhiros-camera-media', JSON.stringify(media));
  };

  const getResolution = () => {
    switch (resolution) {
      case '480p': return { width: 854, height: 480 };
      case '720p': return { width: 1280, height: 720 };
      case '1080p': return { width: 1920, height: 1080 };
      default: return { width: 1280, height: 720 };
    }
  };

  const initializeCamera = async () => {
    try {
      const res = getResolution();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: res.width, height: res.height },
        audio: true
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsInitialized(true);
      setError('');
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions and try again.');
      console.error('Camera access error:', err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const newPhoto: CapturedMedia = {
        id: Date.now().toString(),
        type: 'photo',
        url,
        timestamp: now,
        name: `Photo_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}.jpg`
      };
      
      const updatedMedia = [newPhoto, ...capturedMedia];
      setCapturedMedia(updatedMedia);
      saveMedia(updatedMedia);
    }, 'image/jpeg', 0.9);
  };

  const startVideoRecording = async () => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const now = new Date();
        const newVideo: CapturedMedia = {
          id: Date.now().toString(),
          type: 'video',
          url,
          timestamp: now,
          name: `Video_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}.webm`
        };
        
        const updatedMedia = [newVideo, ...capturedMedia];
        setCapturedMedia(updatedMedia);
        saveMedia(updatedMedia);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Video recording error:', err);
      setError('Failed to start video recording');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadMedia = (media: CapturedMedia) => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteMedia = (mediaId: string) => {
    const updatedMedia = capturedMedia.filter(m => m.id !== mediaId);
    setCapturedMedia(updatedMedia);
    saveMedia(updatedMedia);
    
    if (selectedMedia && selectedMedia.id === mediaId) {
      setSelectedMedia(null);
    }
  };

  if (error) {
    return (
      <div className="camera-container">
        <div className="camera-error">
          <h3>📷 Camera Access Error</h3>
          <p>{error}</p>
          <button onClick={initializeCamera} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container">
      <div className="camera-header">
        <div className="camera-tabs">
          <button 
            className={`tab ${currentView === 'camera' ? 'active' : ''}`}
            onClick={() => setCurrentView('camera')}
          >
            <FaCamera /> Camera
          </button>
          <button 
            className={`tab ${currentView === 'gallery' ? 'active' : ''}`}
            onClick={() => setCurrentView('gallery')}
          >
            <FaImages /> Gallery ({capturedMedia.length})
          </button>
        </div>
      </div>

      {currentView === 'camera' && (
        <div className="camera-view">
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {!isInitialized && (
              <div className="camera-loading">
                <p>Initializing camera...</p>
              </div>
            )}
          </div>
          
          <div className="camera-controls">
            <button 
              onClick={capturePhoto}
              className="control-button photo-button"
              disabled={!isInitialized}
            >
              <FaCamera size={20} />
              Photo
            </button>
            
            <button 
              onClick={isRecording ? stopVideoRecording : startVideoRecording}
              className={`control-button video-button ${isRecording ? 'recording' : ''}`}
              disabled={!isInitialized}
            >
              {isRecording ? <FaStop size={20} /> : <FaVideo size={20} />}
              {isRecording ? 'Stop' : 'Video'}
            </button>
          </div>
          
          {isRecording && (
            <div className="recording-indicator">
              <div className="recording-dot"></div>
              Recording...
            </div>
          )}
        </div>
      )}

      {currentView === 'gallery' && (
        <div className="gallery-view">
          {capturedMedia.length === 0 ? (
            <div className="empty-gallery">
              <FaImages size={48} />
              <p>Gallery is empty</p>
              <p>Switch to camera and capture something!</p>
            </div>
          ) : (
            <>
              <div className="media-grid">
                {capturedMedia.map((media) => (
                  <div 
                    key={media.id} 
                    className="media-item"
                    onClick={() => setSelectedMedia(media)}
                  >
                    {media.type === 'photo' ? (
                      <img src={media.url} alt={media.name} />
                    ) : (
                      <div className="video-thumbnail">
                        <video src={media.url} />
                        <div className="video-overlay">
                          <FaPlay />
                        </div>
                      </div>
                    )}
                    <div className="media-info">
                      <span className="media-type">
                        {media.type === 'photo' ? '📷' : '🎬'}
                      </span>
                      <span className="media-date">
                        {media.timestamp.toLocaleDateString('en-US')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedMedia && (
                <div className="media-preview">
                  <div className="preview-header">
                    <h3>{selectedMedia.name}</h3>
                    <div className="preview-actions">
                      <button 
                        onClick={() => downloadMedia(selectedMedia)}
                        className="action-button download"
                      >
                        <FaDownload />
                      </button>
                      <button 
                        onClick={() => deleteMedia(selectedMedia.id)}
                        className="action-button delete"
                      >
                        <FaTrash />
                      </button>
                      <button 
                        onClick={() => setSelectedMedia(null)}
                        className="action-button close"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="preview-content">
                    {selectedMedia.type === 'photo' ? (
                      <img src={selectedMedia.url} alt={selectedMedia.name} />
                    ) : (
                      <video src={selectedMedia.url} controls />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};