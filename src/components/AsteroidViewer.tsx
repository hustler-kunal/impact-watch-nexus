import { useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars, Trail } from "@react-three/drei";
import * as THREE from "three";
import { createEarthMaterial } from "@/components/EarthTexture";
import { TextureLoader } from "three";

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  // Attempt to load earth textures (if not present will fallback)
  // Load textures together; if files missing, they may throw. To avoid build break, wrap in try
  let material: THREE.MeshStandardMaterial;
  try {
  const [day, normal, rough] = useLoader(TextureLoader, [
      '/earth-day.jpg',
      '/earth-normal.jpg',
      '/earth-roughness.jpg'
    ]);
    material = createEarthMaterial({ map: day, normalMap: normal, roughnessMap: rough });
  } catch {
    material = createEarthMaterial();
  }

  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.02;
  });

  return (
    <group>
      <Sphere ref={earthRef} args={[2, 128, 128]} position={[0, 0, 0]}>
        <primitive object={material} attach="material" />
      </Sphere>
      {/* Atmospheric glow */}
      <Sphere args={[2.08, 64, 64]} position={[0,0,0]}>
        <meshBasicMaterial color="#3ba9ff" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </Sphere>
      {/* Cloud layer (simple noise texture placeholder) */}
      <Sphere ref={cloudsRef} args={[2.05, 64, 64]}>
        <meshStandardMaterial transparent opacity={0.25} depthWrite={false} color="#ffffff" />
      </Sphere>
    </group>
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
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-card/40 border border-border shadow-md relative">
      <Canvas camera={{ position: [0, 4, 10], fov: 55 }}>
        <color attach="background" args={["#050814"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[6, 8, 4]} intensity={1.2} />
        <directionalLight position={[-6, -4, -8]} intensity={0.3} color="#3b82f6" />
        
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
        
        <OrbitControls enablePan={false} minDistance={6} maxDistance={18} />
      </Canvas>
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none bg-gradient-to-b from-background/60 to-transparent" />
    </div>
  );
};

export default AsteroidViewer;
