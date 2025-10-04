import * as THREE from 'three';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export interface TexturedEarthProps {
  radius?: number;
  basePath?: string;              // directory under public containing textures
  dayMap?: string;                // filename for day texture
  nightMap?: string;              // filename for night lights
  normalMap?: string;
  specularMap?: string;
  cloudsMap?: string;
  rotationSpeed?: number;         // radians / second
  lightDirection?: THREE.Vector3; // direction TO light
  shaderBlend?: number;           // width of the day/night transition
  onReady?: (success: boolean) => void; // callback when primary texture finished
  animateSun?: boolean;           // rotate light automatically
  sunSpeed?: number;              // rotation speed of sun around Y
  timeOfDay?: number;             // manual override 0..1 for sun position if provided
  atmosphereStrength?: number;    // multiplier for rim/atmosphere
}

type LoadedTextures = {
  day?: THREE.Texture;
  night?: THREE.Texture;
  normal?: THREE.Texture;
  specular?: THREE.Texture;
  clouds?: THREE.Texture;
};

const defaultFilenames = {
  dayMap: 'earth_day.jpg',
  nightMap: 'earth_night.jpg',
  normalMap: 'earth_normal.jpg',
  specularMap: 'earth_specular.jpg',
  cloudsMap: 'earth_clouds.png'
};

// Utility loader that resolves to undefined on failure instead of throwing.
function loadTexture(path: string): Promise<THREE.Texture | undefined> {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(path, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      resolve(tex);
    }, undefined, () => resolve(undefined));
  });
}

export const TexturedEarth = ({
  radius = 2,
  basePath = '/textures/earth',
  dayMap = defaultFilenames.dayMap,
  nightMap = defaultFilenames.nightMap,
  normalMap = defaultFilenames.normalMap,
  specularMap = defaultFilenames.specularMap,
  cloudsMap = defaultFilenames.cloudsMap,
  rotationSpeed = 0.05,
  lightDirection = new THREE.Vector3(1, 0.8, 0.4).normalize(),
  shaderBlend = 0.15,
  onReady,
  animateSun = true,
  sunSpeed = 0.02,
  timeOfDay,
  atmosphereStrength = 1,
}: TexturedEarthProps) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [textures, setTextures] = useState<LoadedTextures>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [day, night, normal, spec, clouds] = await Promise.all([
        loadTexture(`${basePath}/${dayMap}`),
        loadTexture(`${basePath}/${nightMap}`),
        loadTexture(`${basePath}/${normalMap}`),
        loadTexture(`${basePath}/${specularMap}`),
        loadTexture(`${basePath}/${cloudsMap}`)
      ]);
      if (!cancelled) {
        const success = !!day;
        setTextures({ day, night, normal, specular: spec, clouds });
        setReady(success); // require day map at minimum
        if (onReady) onReady(success);
      }
    })();
    return () => { cancelled = true; };
  }, [basePath, dayMap, nightMap, normalMap, specularMap, cloudsMap, onReady]);

  // Shader for day/night blending & specular oceans.
  const material = useMemo(() => {
    if (!ready || !textures.day) return undefined;
    const fallback = textures.day as THREE.Texture;
    const uniforms: Record<string, { value: THREE.Texture | THREE.Vector3 | number }> = {
      uDay: { value: fallback },
      uNight: { value: (textures.night ?? fallback) as THREE.Texture },
      uNormalMap: { value: (textures.normal ?? fallback) },
      uSpecularMap: { value: (textures.specular ?? fallback) },
      uLightDir: { value: lightDirection.clone().normalize() },
      uBlend: { value: shaderBlend },
      uUseNormal: { value: textures.normal ? 1 : 0 },
      uUseSpecular: { value: textures.specular ? 1 : 0 },
      uTime: { value: 0 },
      uAtmosphereStrength: { value: atmosphereStrength },
    };
    const vertex = /* glsl */`
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
      void main(){ vUv = uv; vNormal = normalMatrix * normal; vPos = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vPos,1.0); }
    `;
    const fragment = /* glsl */`
      precision highp float; varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
      uniform sampler2D uDay; uniform sampler2D uNight; uniform sampler2D uNormalMap; uniform sampler2D uSpecularMap;
      uniform vec3 uLightDir; uniform float uBlend; uniform float uUseNormal; uniform float uUseSpecular; uniform float uTime; uniform float uAtmosphereStrength;
      vec3 applyNormal(vec3 N){
        if(uUseNormal < 0.5) return normalize(N);
        vec3 tangentNormal = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
        tangentNormal.y *= -1.0; // invert Y
        vec3 up = abs(N.y) < 0.99 ? vec3(0.,1.,0.) : vec3(1.,0.,0.);
        vec3 T = normalize(cross(up,N)); vec3 B = cross(N,T);
        mat3 TBN = mat3(T,B,N); return normalize(TBN * tangentNormal);
      }
      void main(){
        vec3 N = applyNormal(normalize(vNormal));
        float diffuse = max(dot(N, normalize(uLightDir)), 0.0);
        // Blend window around terminator
        float dayFactor = smoothstep(-uBlend, uBlend, diffuse);
        vec3 dayCol = texture2D(uDay, vUv).rgb;
        vec3 nightCol = texture2D(uNight, vUv).rgb;
        // Twilight warm tint near terminator
        float twilightBand = smoothstep(0.0, uBlend, abs(diffuse));
        vec3 twilightTint = vec3(1.05, 0.55, 0.35); // warm scatter
        vec3 base = mix(nightCol, dayCol, dayFactor);
        base = mix(twilightTint * 0.6 + base * 0.4, base, twilightBand);
        // Specular highlight (oceans from night map darker = treat as mask alt fallback)
        float specMask = (uUseSpecular > 0.5) ? texture2D(uSpecularMap, vUv).r : 1.0;
        vec3 V = normalize(-vPos);
        vec3 R = reflect(-normalize(uLightDir), N);
        float spec = pow(max(dot(R,V),0.0), 80.0) * specMask * clamp(dayFactor*1.2,0.0,1.0);
        // Fresnel for atmosphere edge coloring
        float fres = pow(1.0 - max(dot(N,V),0.0), 3.0);
        vec3 atmosphere = vec3(0.15,0.35,0.9) * fres * (0.4 + 0.6*dayFactor) * uAtmosphereStrength;
        // Night lights intensify away from terminator
        float nightBoost = (1.0 - dayFactor);
        base += nightCol * nightBoost * 0.25;
        vec3 col = base + vec3(spec) + atmosphere;
        gl_FragColor = vec4(col,1.0);
      }
    `;
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: false
    });
  }, [ready, textures.day, textures.night, textures.normal, textures.specular, lightDirection, shaderBlend, atmosphereStrength]);

  // Animate rotation & sun movement
  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += rotationSpeed * delta;
    if (cloudsRef.current) cloudsRef.current.rotation.y += rotationSpeed * 0.4 * delta;
    if (material) {
      material.uniforms.uTime.value += delta;
      // Update light direction if animated or manual timeOfDay provided
      if (animateSun || typeof timeOfDay === 'number') {
        const t = typeof timeOfDay === 'number' ? timeOfDay : (material.uniforms.uTime.value * sunSpeed * 0.1) % 1.0;
        // Sun orbit around equator: angle 0 at +X
        const angle = t * Math.PI * 2.0;
        const dir = new THREE.Vector3(Math.cos(angle), 0.25, Math.sin(angle)).normalize();
        material.uniforms.uLightDir.value.copy(dir);
      }
    }
  });

  if (!ready || !material) {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial color="#1d3557" emissive="#0b2847" emissiveIntensity={0.15} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[radius, 192, 192]} />
        <primitive object={material} attach="material" />
      </mesh>
      {textures.clouds && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[radius * 1.02, 128, 128]} />
          <meshStandardMaterial map={textures.clouds} transparent opacity={0.5} depthWrite={false} />
        </mesh>
      )}
      {/* Atmosphere shell with additive glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.05, 64, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{ uLightDir: { value: material.uniforms.uLightDir.value } }}
          vertexShader={`varying vec3 vNormal; varying vec3 vPos; void main(){ vNormal = normalMatrix*normal; vPos = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vPos,1.); }`}
          fragmentShader={`precision highp float; varying vec3 vNormal; varying vec3 vPos; uniform vec3 uLightDir; void main(){ vec3 N = normalize(vNormal); vec3 V = normalize(-vPos); float fres = pow(1.0 - max(dot(N,V),0.0), 3.5); float sun = max(dot(N, normalize(uLightDir)),0.0); vec3 col = vec3(0.15,0.35,0.9)*fres*(0.3+0.7*sun); gl_FragColor = vec4(col, col.b*0.55); }`}
        />
      </mesh>
    </group>
  );
};

export default TexturedEarth;