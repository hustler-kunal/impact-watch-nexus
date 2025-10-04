import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars, Trail } from "@react-three/drei";
import * as THREE from "three";
// Remove external dependencies: use self-contained procedural earth
import ProceduralEarth from "@/components/globe/ProceduralEarth";
import TexturedEarth from "@/components/globe/TexturedEarth";

// Simple procedural fallback Earth (no external textures required)
const SimpleEarth = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });
  return (
    <Sphere ref={ref} args={[2, 64, 64]} position={[0,0,0]}>
      <meshStandardMaterial color="#1E3A8A" roughness={0.9} metalness={0.05} emissive="#0b3d91" emissiveIntensity={0.05} />
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
  // No remote loading now; always display procedural earth

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-card/40 border border-border shadow-md relative">
      <Canvas camera={{ position: [0, 4, 10], fov: 55 }}>
        <color attach="background" args={["#050814"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 8, 4]} intensity={1.4} />
        <directionalLight position={[-6, -4, -8]} intensity={0.4} color="#3b82f6" />
        <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />
        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('earth') === 'texture' ? (
          <TexturedEarth />
        ) : (
          <ProceduralEarth />
        )}
        <Asteroid size={asteroidSize} speed={asteroidSpeed} distance={asteroidDistance} />
        <OrbitControls enablePan={false} minDistance={6} maxDistance={18} />
      </Canvas>
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none bg-gradient-to-b from-background/60 to-transparent" />
    </div>
  );
};

export default AsteroidViewer;
