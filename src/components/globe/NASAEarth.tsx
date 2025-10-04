import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/*
  NASAEarth
  Loads the official NASA Earth glTF model.
  Source embed page: https://solarsystem.nasa.gov/gltf_embed/2393/
  The raw glTF is usually accessible at: https://solarsystem.nasa.gov/gltf/2393/scene.gltf
  If CORS blocks loading in your environment, download that folder (scene.gltf + textures) into /public/models/nasa-earth/ and set the local flag.
*/

export interface NASAEarthProps {
  scale?: number;
  rotationSpeed?: number; // radians per second
  useLocalCopy?: boolean; // if true, load from /models/nasa-earth/scene.gltf
}

const REMOTE_URL = 'https://solarsystem.nasa.gov/gltf/2393/scene.gltf';
const LOCAL_URL = '/models/nasa-earth/scene.gltf';

export function NASAEarth({ scale = 0.9, rotationSpeed = 0.03, useLocalCopy = false }: NASAEarthProps) {
  // Attempt to load model. drei's useGLTF caches results.
  const url = useLocalCopy ? LOCAL_URL : REMOTE_URL;
  const { scene } = useGLTF(url, true, undefined, (e) => { console.warn('Failed to load NASA Earth model', e); });
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene) return;
    // Ensure all meshes cast/receive correct lighting
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        if (Array.isArray(mesh.material)) mesh.material.forEach(m => (m.needsUpdate = true));
        else if (mesh.material) mesh.material.needsUpdate = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    let frame: number;
    const animate = (t: number) => {
      if (ref.current) {
        ref.current.rotation.y += rotationSpeed * 0.016; // approx 60fps delta
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [rotationSpeed]);

  return <primitive ref={ref} object={scene} scale={scale} />;
}

useGLTF.preload(REMOTE_URL);
export default NASAEarth;