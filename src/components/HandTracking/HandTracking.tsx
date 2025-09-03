import React, { useRef, useEffect, useState } from 'react';
import { HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import './HandTracking.css';

interface HandTrackingProps {
  onHandPosition?: (x: number, y: number) => void;
  onPinchGesture?: () => void;
  isActive?: boolean;
}

const HandTracking: React.FC<HandTrackingProps> = ({ 
  onHandPosition, 
  onPinchGesture, 
  isActive = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  
  // Smoothing variables
  const lastPositionsRef = useRef<{x: number, y: number}[]>([]);

  const initializeHandLandmarker = async () => {
    try {
      setIsLoading(true);
      setError('');

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
      );

      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.7,
        minHandPresenceConfidence: 0.7,
        minTrackingConfidence: 0.7
      });

      setIsLoading(false);
    } catch (err) {
      setError('Failed to initialize hand tracker: ' + (err as Error).message);
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsTracking(true);
          detectHands();
        };
      }
    } catch (err) {
      setError('Failed to access camera: ' + (err as Error).message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsTracking(false);
  };

  const calculateDistance = (point1: any, point2: any): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const smoothPosition = (x: number, y: number): {x: number, y: number} => {
    // Add current position to history
    lastPositionsRef.current.push({x, y});
    
    // Keep only last 5 positions for smoothing
    if (lastPositionsRef.current.length > 5) {
      lastPositionsRef.current.shift();
    }
    
    // Calculate weighted average (newer positions have more weight)
    let totalWeight = 0;
    let smoothX = 0;
    let smoothY = 0;
    
    lastPositionsRef.current.forEach((pos, index) => {
      const weight = (index + 1) / lastPositionsRef.current.length;
      smoothX += pos.x * weight;
      smoothY += pos.y * weight;
      totalWeight += weight;
    });
    
    return {
      x: smoothX / totalWeight,
      y: smoothY / totalWeight
    };
  };

  const detectHands = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !handLandmarkerRef.current || !isActive) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const startTimeMs = performance.now();
    const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

    if (results.landmarks && results.landmarks.length > 0) {
      const drawingUtils = new DrawingUtils(ctx);
      
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
        drawingUtils.drawLandmarks(landmarks, {
          color: '#FF0000',
          lineWidth: 2
        });

        // საჩვენებელი თითი (8) და ცერა (4) - ახლა საჩვენებელი თითით კურსორი
        const indexTip = landmarks[8];  // საჩვენებელი თითი
        const thumbTip = landmarks[4];  // ცერა თითი
        
        if (indexTip && thumbTip) {
          // Raw position from index finger (pointer finger)
          const rawX = indexTip.x * canvas.width;
          const rawY = indexTip.y * canvas.height;
          
          // Apply smoothing
          const smoothed = smoothPosition(rawX, rawY);
          
          // მაუსის პოზიციის გაგზავნა (საჩვენებელი თითით)
          onHandPosition?.(smoothed.x, smoothed.y);

          // ცერა და საჩვენებელი თითის დისტანცია pinch-ისთვის
          const distance = calculateDistance(indexTip, thumbTip);
          
          // თუ დისტანცია მცირეა (< 0.06), ეს არის pinch gesture
          if (distance < 0.06) {
            onPinchGesture?.();
            
            // ვიზუალური ინდიკატორი pinch-ისთვის
            ctx.beginPath();
            ctx.arc(smoothed.x, smoothed.y, 30, 0, 2 * Math.PI);
            ctx.strokeStyle = '#00FF88';
            ctx.lineWidth = 5;
            ctx.stroke();
            
            // Inner circle for click feedback
            ctx.beginPath();
            ctx.arc(smoothed.x, smoothed.y, 18, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0, 255, 136, 0.4)';
            ctx.fill();
            
            // Add "CLICK" text
            ctx.fillStyle = '#00FF88';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('CLICK', smoothed.x, smoothed.y - 40);
          }
          
          // Show current finger position (საჩვენებელი თითი)
          ctx.beginPath();
          ctx.arc(smoothed.x, smoothed.y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = '#FF6B35';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Show finger label
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('👆', smoothed.x, smoothed.y + 30);
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectHands);
  };

  useEffect(() => {
    if (isActive) {
      initializeHandLandmarker();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  useEffect(() => {
    if (handLandmarkerRef.current && isActive && !isTracking) {
      startCamera();
    }
  }, [handLandmarkerRef.current, isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="hand-tracking-container">
      <div className="hand-tracking-header">
        <h3>🖐️ Hand Tracking</h3>
        <div className="tracking-status">
          {isLoading && <span className="status loading">Loading model...</span>}
          {isTracking && <span className="status active">✅ Active</span>}
          {error && <span className="status error">❌ Error</span>}
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="camera-container">
        <video 
          ref={videoRef}
          className="camera-feed"
          style={{ display: 'none' }}
          playsInline
          muted
        />
        <canvas 
          ref={canvasRef}
          className="tracking-canvas"
          width={640}
          height={480}
        />
      </div>
      
      <div className="instructions">
        <p>📋 Instructions:</p>
        <ul>
          <li>☝️ Point with INDEX finger to move cursor anywhere</li>
          <li>🤏 Pinch thumb + index finger to click</li>
          <li>📷 Keep your hand visible and well-lit</li>
          <li>🖱️ Cursor works on entire screen outside this window!</li>
        </ul>
      </div>
    </div>
  );
};

export default HandTracking;