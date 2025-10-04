import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

/*
  ProceduralEarth
  Self-contained 3D Earth built entirely in shaders (no external textures).
  Features:
    - Fractal simplex noise to carve continents vs oceans
    - Day/night lambert + specular highlight on oceans
    - Night lights on land in darkness
    - Animated cloud noise shell
    - Thin atmosphere rim (Fresnel style)
  Tunable via props without asset dependencies.
*/

interface ProceduralEarthProps {
  radius?: number;
  rotationSpeed?: number; // radians per second
  lightDirection?: THREE.Vector3; // direction TO light (normalized)
  detail?: number; // sphere segment detail
}

const ProceduralEarth = ({
  radius = 2,
  rotationSpeed = 0.05,
  lightDirection = new THREE.Vector3(1, 0.8, 0.4).normalize(),
  detail = 192,
}: ProceduralEarthProps) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uLightDir: { value: lightDirection },
    uRotationMatrix: { value: new THREE.Matrix3() },
    uCloudTime: { value: 0 },
  }), [lightDirection]);

  // GLSL Simplex noise (3D) + fbm adapted (public domain / IQ).
  const common = /* glsl */`
    // 3D simplex noise (iq / ashima)
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);} 
    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      // First corner
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
      // Other corners
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      //  x0 = x0 - 0. + 0.0 * C
      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1. + 3.0 * C.xxx;
      // Permutations
      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ) );
      // Gradients
      float n_ = 1.0/7.0; // 7x7 points over a square, mapped onto an octahedron.
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      //Normalise gradients
      vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      // Mix contributions
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }
    float fbm(vec3 p){
      float f=0.0; float a=0.5; for(int i=0;i<5;i++){f+=a*snoise(p); p*=2.02; a*=0.5;} return f;
    }
  `;

  const earthVertex = /* glsl */`
    varying vec3 vPos; varying vec3 vNormal; varying vec2 vUv; uniform float uTime; 
    void main(){ vUv = uv; vNormal = normal; vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `;

  const earthFragment = /* glsl */`
    precision highp float; varying vec3 vPos; varying vec3 vNormal; varying vec2 vUv; uniform vec3 uLightDir; uniform float uTime; ${common}
    // Helper: latitude ( -1 pole S, +1 pole N )
    float latitude(vec3 p){ return p.y; }
    
    vec3 biomeColor(float continents, float elev, float lat, float moisture){
      // Ice caps near poles or very cold
      float ice = smoothstep(0.6, 0.8, abs(lat)) * smoothstep(0.15,0.05, elev); // more ice at low elevation
      // Temperature (approx) from latitude
      float temp = 1.0 - abs(lat);
      // Desert factor (hot + low moisture)
      float desert = smoothstep(0.55,0.9,temp) * smoothstep(0.25,0.1, moisture);
      // Forest factor (mid latitude & enough moisture)
      float forest = smoothstep(0.15,0.5, moisture) * smoothstep(0.2,0.8,temp);
      // Grassland transitional
      float grass = forest * (1.0 - desert);
      vec3 desertCol = vec3(0.72,0.62,0.38);
      vec3 forestCol = vec3(0.07,0.35,0.09);
      vec3 grassCol  = vec3(0.25,0.45,0.20);
      vec3 iceCol    = vec3(0.92,0.95,0.98);
      // Blend hierarchy
      vec3 base = mix(grassCol, forestCol, forest);
      base = mix(base, desertCol, desert);
      base = mix(base, iceCol, ice);
      // Elevation lightening
      base = mix(base, vec3(0.65,0.6,0.55), elev*0.5);
      return base;
    }
    
    void main(){
      vec3 N = normalize(vNormal);
      vec3 p = normalize(vPos);
      // Low frequency continents mask
      float cBase = fbm(p*1.6 + 3.0);
      float cDetail = fbm(p*4.0 + 10.0);
      float cWarp = fbm(p*2.5 + vec3( fbm(p*3.5) ));
      float continentsField = (cBase*0.55 + cDetail*0.35 + cWarp*0.25);
      float continents = smoothstep(0.28, 0.33, continentsField);
      // Elevation detail over land
      float elev = fbm(p*7.5 + 5.0) * continents;
      // Moisture proxy
      float moisture = fbm(p*5.5 + 20.0)*0.5 + fbm(p*11.0 + 40.0)*0.3 + 0.2;
      float lat = latitude(p);
      // Ocean color gradient: depth by negative field
      float shelf = smoothstep(0.25,0.33, continentsField);
      float coastBand = smoothstep(0.31,0.33, continentsField) - smoothstep(0.33,0.35, continentsField);
      vec3 deepOcean = vec3(0.015,0.05,0.12);
      vec3 midOcean  = vec3(0.02,0.12,0.25);
      vec3 shallowOcean = vec3(0.1,0.55,0.65);
      vec3 ocean = mix(deepOcean, midOcean, shelf);
      ocean = mix(ocean, shallowOcean, smoothstep(0.32,0.34, continentsField));
      // Land biomes
      vec3 land = biomeColor(continents, elev, lat, moisture);
      // Coastline highlight
      vec3 coastColor = vec3(0.9,0.85,0.55);
      land = mix(land, coastColor, clamp(coastBand*3.0,0.0,0.7));
      vec3 base = mix(ocean, land, continents);
      // Lighting
      vec3 L = normalize(uLightDir);
      float diff = max(dot(N,L),0.0);
      // Ambient term
      float amb = 0.18;
      // Night lights only on land & dark
      float night = smoothstep(0.02,0.12,diff);
      float cityNoise = fbm(p*45.0 + uTime*0.015);
      float cityMask = continents * (1.0-night) * smoothstep(0.55,0.9, cityNoise);
      vec3 cityLights = vec3(1.0,0.82,0.55) * cityMask * 0.6;
      // Specular oceans
      vec3 V = normalize(-p);
      vec3 R = reflect(-L,N);
      float spec = pow(max(dot(R,V),0.0), 70.0) * (1.0-continents) * 0.45;
      // Compose
      vec3 col = base * (amb + diff*(1.0-amb)) + cityLights + vec3(spec);
      // Atmospheric rim
      float rim = pow(1.0 - max(dot(N,V),0.0), 2.4);
      col += vec3(0.12,0.35,0.85) * rim * 0.4;
      // Subtle hue shift night side
      col = mix(col, col*vec3(0.55,0.6,0.8), (1.0-night)*(1.0-continents*0.3));
      gl_FragColor = vec4(col,1.0);
    }
  `;

  const cloudsVertex = /* glsl */`
    varying vec3 vPos; uniform float uTime; void main(){ vPos = position; vec3 displaced = position + normal * 0.01; gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced,1.0);} 
  `;
  const cloudsFragment = /* glsl */`
    precision highp float; varying vec3 vPos; uniform float uTime; ${common}
    void main(){ float n = fbm(normalize(vPos)*4.0 + vec3(0.0,uTime*0.02,0.0)); float m = smoothstep(0.5,0.7,n); gl_FragColor = vec4(vec3(1.0), m*0.5); }
  `;

  const earthMat = useMemo(() => new THREE.ShaderMaterial({ uniforms, vertexShader: earthVertex, fragmentShader: earthFragment }), [uniforms, earthVertex, earthFragment]);
  const cloudMat = useMemo(() => new THREE.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, vertexShader: cloudsVertex, fragmentShader: cloudsFragment }), [uniforms, cloudsVertex, cloudsFragment]);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    if (earthRef.current) earthRef.current.rotation.y += rotationSpeed * delta;
    if (cloudsRef.current) cloudsRef.current.rotation.y += rotationSpeed * 0.4 * delta;
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += rotationSpeed * 0.1 * delta;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[radius, detail, detail]} />
        <primitive object={earthMat} attach="material" />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[radius * 1.02, Math.max(32, detail/2), Math.max(32, detail/2)]} />
        <primitive object={cloudMat} attach="material" />
      </mesh>
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[radius * 1.06, 64, 64]} />
        <meshBasicMaterial color={'#4ab8ff'} transparent opacity={0.08} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

export default ProceduralEarth;
