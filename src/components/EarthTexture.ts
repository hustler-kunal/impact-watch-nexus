// Simple procedural earth-like material builder (fallback if texture not available)
import * as THREE from 'three';

export function createEarthMaterial(textures?: {
  map?: THREE.Texture;
  normalMap?: THREE.Texture;
  roughnessMap?: THREE.Texture;
  emissiveMap?: THREE.Texture;
  specularMap?: THREE.Texture;
}) {
  return new THREE.MeshStandardMaterial({
    map: textures?.map,
    normalMap: textures?.normalMap,
    roughnessMap: textures?.roughnessMap,
    emissiveMap: textures?.emissiveMap,
    color: textures?.map ? 0xffffff : new THREE.Color('#1d3357'),
    roughness: 0.85,
    metalness: 0.05,
    emissive: new THREE.Color('#0b3d91'),
    emissiveIntensity: 0.15,
  });
}
