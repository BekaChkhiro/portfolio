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
  const [isLoading] = useState(false);

  useEffect(() => {
    initializeCamera();
    loadSavedMedia();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (currentView === 'camera') {
      if (!stream || !isInitialized) {
        initializeCamera();
      } else if (videoRef.current && stream) {
        // Reconnect stream to video element
        videoRef.current.srcObject = stream;
        // Force play after a short delay to ensure element is visible
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.warn);
          }
        }, 100);
      }
    }
  }, [currentView]);

  // Additional effect to handle video element mounting
  useEffect(() => {
    if (currentView === 'camera' && videoRef.current && stream && isInitialized) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.warn);
    }
  }, [currentView, isInitialized, stream]);

  const loadSavedMedia = () => {
    try {
      const saved = localStorage.getItem('chkhiros-camera-media');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects and validate URLs
        const mediaWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })).filter((item: any) => item.url && typeof item.url === 'string');
        setCapturedMedia(mediaWithDates);
      }
    } catch (error) {
      console.error('Error loading saved media:', error);
      setCapturedMedia([]);
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
        // Ensure video starts playing
        videoRef.current.play().catch((e) => {
          console.warn('Auto-play prevented:', e);
        });
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
    
    // Convert to base64 data URL for persistent storage
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const now = new Date();
    const newPhoto: CapturedMedia = {
      id: Date.now().toString(),
      type: 'photo',
      url: dataUrl,
      timestamp: now,
      name: `Photo_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}.jpg`
    };
    
    const updatedMedia = [newPhoto, ...capturedMedia];
    setCapturedMedia(updatedMedia);
    saveMedia(updatedMedia);
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
        
        // Convert blob to base64 data URL for persistent storage
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const now = new Date();
          const newVideo: CapturedMedia = {
            id: Date.now().toString(),
            type: 'video',
            url: dataUrl,
            timestamp: now,
            name: `Video_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}.webm`
          };
          
          const updatedMedia = [newVideo, ...capturedMedia];
          setCapturedMedia(updatedMedia);
          saveMedia(updatedMedia);
        };
        reader.readAsDataURL(blob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } catch (err) {
      console.error('Video recording error:', err);
      setError('Failed to start video recording');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadMedia = (media: CapturedMedia) => {
    try {
      const link = document.createElement('a');
      link.href = media.url;
      link.download = media.name || `media_${media.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading media:', error);
    }
  };

  const deleteMedia = (mediaId: string) => {
    try {
      const updatedMedia = capturedMedia.filter(m => m.id !== mediaId);
      setCapturedMedia(updatedMedia);
      saveMedia(updatedMedia);
      
      if (selectedMedia && selectedMedia.id === mediaId) {
        setSelectedMedia(null);
      }
      
      // Force re-render to update the gallery count in tab
      setTimeout(() => {
        setCapturedMedia([...updatedMedia]);
      }, 0);
    } catch (error) {
      console.error('Error deleting media:', error);
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
          <div className={`video-container ${isFullscreen ? 'fullscreen' : ''}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
              onLoadedMetadata={() => {
                console.log('Video metadata loaded');
                if (videoRef.current) {
                  videoRef.current.play().catch(console.warn);
                }
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {!isInitialized && (
              <div className="camera-loading">
                <p>Initializing camera...</p>
              </div>
            )}

            <div className="video-overlay">
              <button 
                onClick={toggleFullscreen}
                className="overlay-button fullscreen-btn"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
              
              <div className="video-info">
                <span className="resolution-indicator">{resolution}</span>
                {isRecording && (
                  <span className="time-indicator">{formatTime(recordingTime)}</span>
                )}
              </div>
            </div>
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

            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="control-button settings-button"
            >
              <FaCog size={20} />
              Settings
            </button>

            {showSettings && (
              <div className="settings-panel">
                <h4>Resolution</h4>
                <select 
                  value={resolution} 
                  onChange={(e) => setResolution(e.target.value as '480p' | '720p' | '1080p')}
                  className="resolution-select"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
                <button 
                  onClick={() => {
                    initializeCamera();
                    setShowSettings(false);
                  }}
                  className="apply-settings"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentView === 'gallery' && (
        <div className="gallery-view">
          {isLoading ? (
            <div className="empty-gallery">
              <div className="loading-spinner"></div>
              <p>Loading gallery...</p>
            </div>
          ) : !capturedMedia || capturedMedia.length === 0 ? (
            <div className="empty-gallery">
              <FaImages size={48} />
              <p>Gallery is empty</p>
              <p>Switch to camera and capture something!</p>
            </div>
          ) : (
            <>
              <div className="media-grid">
                {capturedMedia.map((media) => {
                  if (!media || !media.id || !media.url) {
                    return null;
                  }
                  
                  return (
                    <div 
                      key={media.id} 
                      className="media-item"
                      onClick={() => setSelectedMedia(media)}
                    >
                      {media.type === 'photo' ? (
                        <img 
                          src={media.url} 
                          alt={media.name || 'Photo'} 
                          loading="lazy"
                          onError={(e) => {
                            console.error('Image load error for:', media.id);
                            const parent = e.currentTarget.parentElement;
                            if (parent && parent.classList.contains('media-item')) {
                              parent.style.display = 'none';
                            }
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', media.id);
                          }}
                        />
                      ) : (
                        <div className="video-thumbnail">
                          <video 
                            src={media.url}
                            preload="metadata"
                            muted
                            onError={(e) => {
                              console.error('Video load error for:', media.id);
                              const parent = e.currentTarget.parentElement?.parentElement;
                              if (parent && parent.classList.contains('media-item')) {
                                parent.style.display = 'none';
                              }
                            }}
                            onLoadedMetadata={() => {
                              console.log('Video loaded successfully:', media.id);
                            }}
                          />
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
                          {media.timestamp ? new Date(media.timestamp).toLocaleDateString('en-US') : 'Unknown date'}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                      <img 
                        src={selectedMedia.url} 
                        alt={selectedMedia.name || 'Photo'} 
                        onError={(e) => {
                          console.error('Preview image load error:', e);
                          setSelectedMedia(null);
                        }}
                      />
                    ) : (
                      <video 
                        src={selectedMedia.url} 
                        controls
                        onError={(e) => {
                          console.error('Preview video load error:', e);
                          setSelectedMedia(null);
                        }}
                      />
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