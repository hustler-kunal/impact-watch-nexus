import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useCallback, useMemo, useRef, useState } from 'react';
import { latLonToVector, deg2rad, rad2deg } from '@/lib/geo';

interface GlobeLocationPickerProps {
  value?: { lat: number; lon: number };
  onChange?: (lat: number, lon: number) => void;
  markerColor?: string;
}

// Simple procedural color function for continents vs ocean (not physically accurate)
const fragmentShader = /* glsl */`
  varying vec3 vNormal; varying vec2 vUv; varying vec3 vPos;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(23.43,45.17)))*45234.145); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); float a=hash(i); float b=hash(i+vec2(1,0)); float c=hash(i+vec2(0,1)); float d=hash(i+vec2(1,1)); vec2 u=f*f*(3.-2.*f); return mix(a,b,u.x)+ (c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y; }
  void main(){
    // vUv.y ~ latitude mapping in this sphere UV (0..1)
    float n = noise(vUv*8.0) + 0.35*noise(vUv*16.0);
    float continent = step(0.55, n);
    vec3 ocean = vec3(0.05,0.18,0.35);
    vec3 land = vec3(0.08,0.35,0.12);
    vec3 col = mix(ocean, land, continent);
    float light = max(dot(normalize(vNormal), normalize(vec3(1.0,0.7,0.4))),0.0);
    col *= 0.4 + 0.6*light;
    gl_FragColor = vec4(col,1.0);
  }
`;

const vertexShader = /* glsl */`
  varying vec3 vNormal; varying vec2 vUv; varying vec3 vPos;
  void main(){ vNormal = normalMatrix * normal; vUv = uv; vPos = (modelMatrix*vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vPos,1.0); }
`;

const Marker = ({ position, color }: { position: THREE.Vector3, color: string }) => {
  return (
    <mesh position={position.toArray()}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// Inner component rendered inside <Canvas/> so it can safely use R3F hooks
const RotatingGlobe = ({ onPick }: { onPick: (lat: number, lon: number) => void }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const point = e.point.clone().normalize();
    const lat = rad2deg(Math.asin(point.y));
    const lon = rad2deg(Math.atan2(point.z, point.x));
    onPick(parseFloat(lat.toFixed(2)), parseFloat(lon.toFixed(2)));
  }, [onPick]);
  useFrame((_, delta) => { if (globeRef.current) globeRef.current.rotation.y += delta * 0.03; });
  return (
    <mesh ref={globeRef} onPointerDown={handlePointerDown}>
      <sphereGeometry args={[2, 96, 96]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
};

export const GlobeLocationPicker = ({ value, onChange, markerColor = '#ff487a' }: GlobeLocationPickerProps) => {
  const [internal, setInternal] = useState<{ lat: number; lon: number }>(value || { lat: 0, lon: 0 });
  const markerPos = useMemo(() => {
    const v = latLonToVector(internal.lat, internal.lon);
    return new THREE.Vector3(v.x, v.y, v.z).multiplyScalar(2.01);
  }, [internal]);

  const update = (lat: number, lon: number) => {
    const next = { lat, lon };
    setInternal(next);
    onChange?.(lat, lon);
  };

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border border-border bg-card/30 relative">
      <Canvas camera={{ position: [0,0,5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4,4,2]} intensity={1.1} />
        <Stars radius={40} count={2000} depth={15} factor={3} saturation={0} fade speed={0.5} />
        <RotatingGlobe onPick={update} />
        <Marker position={markerPos} color={markerColor} />
        <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.6} />
      </Canvas>
      <div className="absolute p-2 text-xs text-muted-foreground font-mono select-none">
        {internal.lat.toFixed(2)}°, {internal.lon.toFixed(2)}°
      </div>
    </div>
  );
};

export default GlobeLocationPicker;