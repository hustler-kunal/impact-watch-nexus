import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars, Trail } from "@react-three/drei";
import * as THREE from "three";

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Sphere ref={earthRef} args={[2, 64, 64]} position={[0, 0, 0]}>
      <meshStandardMaterial 
        color="#4A90E2" 
        roughness={0.7}
        metalness={0.3}
      />
    </Sphere>
  );
};

const Asteroid = ({ size, speed, distance }: { size: number; speed: number; distance: number }) => {
  const asteroidRef = useRef<THREE.Mesh>(null);
  const [angle, setAngle] = useState(0);
  
  useFrame((state, delta) => {
    if (asteroidRef.current) {
      const newAngle = angle + (speed * delta * 0.5);
      setAngle(newAngle);
      
      asteroidRef.current.position.x = Math.cos(newAngle) * distance;
      asteroidRef.current.position.z = Math.sin(newAngle) * distance;
      asteroidRef.current.rotation.x += delta * 0.5;
      asteroidRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Trail
      width={2}
      length={6}
      color="#00D9FF"
      attenuation={(t) => t * t}
    >
      <Sphere ref={asteroidRef} args={[size, 16, 16]} position={[distance, 0, 0]}>
        <meshStandardMaterial 
          color="#FF6B35" 
          emissive="#FF6B35"
          emissiveIntensity={0.5}
          roughness={0.8}
        />
      </Sphere>
    </Trail>
  );
};

interface AsteroidViewerProps {
  asteroidSize: number;
  asteroidSpeed: number;
  asteroidDistance: number;
}

const AsteroidViewer = ({ asteroidSize, asteroidSpeed, asteroidDistance }: AsteroidViewerProps) => {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-card border border-border shadow-glow-orbit">
      <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
        <color attach="background" args={["#0A0E27"]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4A90E2" />
        
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1}
        />
        
        <Earth />
        <Asteroid 
          size={asteroidSize} 
          speed={asteroidSpeed}
          distance={asteroidDistance}
        />
        
        <OrbitControls 
          enablePan={false}
          minDistance={8}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
};

export default AsteroidViewer;
