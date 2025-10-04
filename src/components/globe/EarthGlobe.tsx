import * as THREE from 'three';
import { useLoader, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

/*
  EarthGlobe
  - Blends day & night textures based on light direction
  - Adds clouds layer & simple atmosphere fresnel glow
  Place the following textures in /public/textures/earth/ (filenames can be changed via props):
    earth_day.jpg (or .png)
    earth_night.jpg
    earth_normal.jpg (optional)
    earth_specular.jpg (grayscale for ocean highlights)
    earth_clouds.png (transparent clouds)
*/

export interface EarthGlobeProps {
  radius?: number;
  lightPosition?: THREE.Vector3; // world-space position of main light
  texturePath?: string; // base path (default '/textures/earth')
  quality?: number; // segments (default 128)
}

const EarthGlobe = ({
  radius = 2,
  lightPosition = new THREE.Vector3(6, 8, 4),
  texturePath = '/textures/earth',
  quality = 128,
}: EarthGlobeProps) => {
  // Load all textures in consistent hook order.
  const [dayMap, nightMap, normalMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    `${texturePath}/earth_day.jpg`,
    `${texturePath}/earth_night.jpg`,
    `${texturePath}/earth_normal.jpg`,
    `${texturePath}/earth_specular.jpg`,
    `${texturePath}/earth_clouds.png`,
  ], undefined, () => { /* errors ignored - fallback handled below */ });

  const materialRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);

  const uniforms = useMemo(() => ({
    uDayMap: { value: dayMap ?? null },
    uNightMap: { value: nightMap ?? null },
    uNormalMap: { value: normalMap ?? null },
    uSpecularMap: { value: specularMap ?? null },
    uCloudsMap: { value: cloudsMap ?? null },
    uLightDir: { value: lightPosition.clone().normalize() },
    uTime: { value: 0 },
    uUseNormal: { value: normalMap ? 1 : 0 },
  }), [dayMap, nightMap, normalMap, specularMap, cloudsMap, lightPosition]);

  const vertexShader = /* glsl */`
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    void main(){
      vUv = uv;
      // normal in world space
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `;

  const fragmentShader = /* glsl */`
    precision highp float;
    uniform sampler2D uDayMap;
    uniform sampler2D uNightMap;
    uniform sampler2D uNormalMap;
    uniform sampler2D uSpecularMap;
    uniform sampler2D uCloudsMap;
    uniform vec3 uLightDir;
    uniform float uTime;
    uniform float uUseNormal;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    
    vec3 applyNormalMap(vec3 n, vec2 uv){
      if(uUseNormal < 0.5) return n;
      vec3 tangentNormal = texture2D(uNormalMap, uv).xyz * 2.0 - 1.0;
      tangentNormal.y = -tangentNormal.y; // invert Y for some normal maps
      // Construct TBN (approximate since sphere)
      vec3 up = abs(n.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0);
      vec3 tangent = normalize(cross(up, n));
      vec3 bitangent = cross(n, tangent);
      mat3 TBN = mat3(tangent, bitangent, n);
      return normalize(TBN * tangentNormal);
    }
    
    void main(){
      vec3 N = normalize(vNormal);
      N = applyNormalMap(N, vUv);
      vec3 L = normalize(uLightDir);
      vec3 V = normalize(-vWorldPos); // camera at origin (approx in view space)
      float diff = max(dot(N,L), 0.0);
      float nightFactor = smoothstep(0.0, 0.2, diff);
      vec3 dayColor = texture2D(uDayMap, vUv).rgb;
      vec3 nightColor = texture2D(uNightMap, vUv).rgb * 1.2; // boost night lights
      vec3 base = mix(nightColor, dayColor, nightFactor);
      float specMask = texture2D(uSpecularMap, vUv).r;
      vec3 R = reflect(-L, N);
      float spec = pow(max(dot(R, V), 0.0), 48.0) * specMask;
      // Clouds
      vec4 clouds = texture2D(uCloudsMap, vUv);
      float cloudLight = pow(max(dot(normalize(vNormal), L), 0.0), 0.6) * 0.6 + 0.4;
      vec3 cloudCol = clouds.rgb * clouds.a * cloudLight;
      vec3 color = base + cloudCol + vec3(spec);
      // Simple rim atmosphere: depends on view angle
      float rim = pow(1.0 - max(dot(N, V), 0.0), 2.5);
      color += vec3(0.1,0.2,0.4) * rim * 0.6;
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  }), [uniforms, vertexShader, fragmentShader]);

  // Rotate globe & clouds
  useFrame((_, delta) => {
    const mesh = materialRef.current as THREE.Mesh & { material: THREE.ShaderMaterial } | null;
    if (mesh && (mesh.material as THREE.ShaderMaterial).uniforms?.uTime) {
      (mesh.material as THREE.ShaderMaterial).uniforms.uTime.value += delta;
    }
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.01;
  });

  return (
    <group>
  <mesh ref={materialRef}>
        <sphereGeometry args={[radius, quality, quality]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[radius * 1.01, quality/1.5, quality/1.5]} />
        <meshStandardMaterial map={cloudsMap} transparent opacity={0.4} depthWrite={false} />
      </mesh>
      {/* Atmospheric glow shell (additive) */}
      <mesh>
        <sphereGeometry args={[radius * 1.05, 64, 64]} />
        <meshBasicMaterial color={'#4ab8ff'} transparent opacity={0.08} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

export default EarthGlobe;
