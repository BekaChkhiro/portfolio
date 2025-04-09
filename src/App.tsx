import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useState, useRef } from 'react'
import * as THREE from 'three'
import { FaPlay, FaPowerOff } from 'react-icons/fa'
import './App.css'

function Screen({ isZoomed, isPowered }: { isZoomed: boolean; isPowered: boolean }) {
  const gltf = useGLTF('./screen.glb')
  const modelRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (!modelRef.current) return;
    
    const targetScale = isZoomed ? 1.0 : 0.6;
    const targetZ = isZoomed ? 2 : 0;
    
    // Only return to original position if not powered
    if (!isPowered || !isZoomed) {
      modelRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      modelRef.current.position.z = THREE.MathUtils.lerp(modelRef.current.position.z, targetZ, 0.1);
      modelRef.current.position.y = -0.1;
      modelRef.current.rotation.x = THREE.MathUtils.lerp(modelRef.current.rotation.x, 0.2, 0.1);
    }
  });

  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      position={[0, -0.1, 0]}
      rotation={[0.2, 0, 0]} 
      scale={0.7} 
    />
  );
}

function App() {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPowered, setIsPowered] = useState(false);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url(/background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative'
    }}>
      <Canvas
        camera={{ position: [0, -0.5, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <Screen isZoomed={isZoomed} isPowered={isPowered} />
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Start button - only show when not zoomed */}
      {!isZoomed && (
        <button 
          onClick={() => setIsZoomed(true)}
          className="start-button pulse"
        >
          <FaPlay />
        </button>
      )}
      
      {/* Power button - only show when zoomed but not powered */}
      {isZoomed && !isPowered && (
        <button 
          onClick={() => {
            setIsPowered(true);
          }}
          className="power-button"
          style={{
            animation: 'buttonAppear 0.5s ease-out, powerGlow 2s infinite'
          }}
          title="Turn on screen"
        >
          <FaPowerOff />
        </button>
      )}

      {/* Power off button - only show when screen is powered on */}
      {isZoomed && isPowered && (
        <button 
          onClick={() => {
            setIsPowered(false);
          }}
          className="power-button powered"
          title="Turn off screen"
        >
          <FaPowerOff />
        </button>
      )}

      {/* Screen content - only show when both zoomed and powered */}
      {isZoomed && isPowered && (
        <div className="screen-content">
          <div className="content-container">
            <h1>Welcome!</h1>
            <p>This is your screen content.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
