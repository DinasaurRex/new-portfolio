import { useCursor } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

type Vector = [number, number, number];
const heads: { position: Vector; path: Vector[] }[] = [
  { position: [0.14, 1.56, -0.03], path: [[0, 0.08, 0], [0, 1.3, 0], [-0.06, 1.78, -0.02], [0.13, 1.8, -0.02], [0.14, 1.65, -0.03]] },
  { position: [-0.29, 1.28, 0.07], path: [[0, 0.85, 0], [-0.15, 1.3, 0.02], [-0.32, 1.51, 0.04], [-0.29, 1.37, 0.07]] },
  { position: [0.38, 1.16, -0.05], path: [[0, 0.75, 0], [0.2, 1.3, -0.04], [0.39, 1.4, -0.05], [0.38, 1.25, -0.05]] },
  { position: [-0.32, 0.86, 0.05], path: [[0, 0.25, 0], [-0.15, 0.78, 0.02], [-0.35, 1.1, 0.04], [-0.32, 0.95, 0.05]] },
  { position: [0.33, 0.55, 0.15], path: [[0, 0.16, 0], [0.15, 0.57, 0.1], [0.34, 0.78, 0.13], [0.33, 0.64, 0.15]] },
];

function petalRadius(t: number) { return 0.025 + 0.17 * Math.sin(t * Math.PI / 2); }

export function FlowerLamp({ night, lampOn, onToggleLamp }: { night: boolean; lampOn: boolean; onToggleLamp: () => void }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const geometry = useMemo(() => {
    const profile = Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      return new THREE.Vector2(petalRadius(t), 0.09 - 0.38 * t);
    });
    const glass = new THREE.LatheGeometry(profile, 72);
    const positions = glass.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const angle = Math.atan2(positions.getZ(i), positions.getX(i));
      const t = (0.09 - positions.getY(i)) / 0.38;
      const scallop = Math.cos(angle * 6);
      const ripple = 1 + 0.07 * scallop * t;
      positions.setX(i, positions.getX(i) * ripple);
      positions.setZ(i, positions.getZ(i) * ripple);
      positions.setY(i, positions.getY(i) - 0.028 * scallop * Math.pow(t, 5));
    }
    glass.computeVertexNormals();
    const ribPoints = profile.map((point, i) => {
      const t = i / 24;
      return new THREE.Vector3(point.x * (1 + 0.07 * t), point.y - 0.028 * Math.pow(t, 5), 0);
    });
    const rib = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribPoints), 24, 0.0045, 6, false);
    const rim = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 72 }, (_, i) => {
      const angle = i * Math.PI * 2 / 72;
      const radius = petalRadius(1) * (1 + 0.07 * Math.cos(angle * 6));
      return new THREE.Vector3(radius * Math.cos(angle), -0.29 - 0.028 * Math.cos(angle * 6), radius * Math.sin(angle));
    }), true), 72, 0.005, 6, true);
    const stems = heads.map(head => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(head.path.map(point => new THREE.Vector3(...point))), 40, 0.018, 10, false));
    return { glass, rib, rim, stems };
  }, []);
  const target = useMemo(() => { const object = new THREE.Object3D(); object.position.set(0.8, -0.3, 0.9); return object; }, []);
  useEffect(() => () => { geometry.glass.dispose(); geometry.rib.dispose(); geometry.rim.dispose(); geometry.stems.forEach(stem => stem.dispose()); }, [geometry]);
  return <group name="cozy-flower-lamp" position={[-4.4, 0.0725, -0.9]} onClick={event => { event.stopPropagation(); onToggleLamp(); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
    <mesh position={[0, 0.37, 0]} castShadow receiveShadow><cylinderGeometry args={[0.43, 0.43, 0.07, 48]} /><meshStandardMaterial color="#e5b48e" roughness={0.75} /></mesh>
    {[0, 1, 2].map(i => <mesh key={i} position={[Math.cos(i * Math.PI * 2 / 3) * 0.3, 0.1675, Math.sin(i * Math.PI * 2 / 3) * 0.3]} castShadow><cylinderGeometry args={[0.045, 0.052, 0.335, 16]} /><meshStandardMaterial color="#ba8762" roughness={0.8} /></mesh>)}
    <group position={[0, 0.405, 0]}>
      <mesh position={[0, 0.045, 0]} castShadow receiveShadow><cylinderGeometry args={[0.3, 0.32, 0.09, 48]} /><meshStandardMaterial color="#71814a" roughness={0.35} metalness={0.15} /></mesh>
      <mesh position={[0, 0.008, 0]}><cylinderGeometry args={[0.31, 0.31, 0.016, 48]} /><meshStandardMaterial color="#394e34" roughness={0.6} /></mesh>
      {geometry.stems.map((stem, i) => <mesh key={i} geometry={stem} castShadow><meshStandardMaterial color="#586e36" roughness={0.4} metalness={0.1} /></mesh>)}
      {([-1, 1] as const).map(side => [0, 1, 2].map(i => <mesh key={`${side}-${i}`} position={[side * (0.07 + i * 0.025), 0.2 + i * 0.18, 0.04]} rotation={[0, 0, side * -0.45]} scale={[0.045, 0.17, 0.016]} castShadow><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={i % 2 ? '#82944a' : '#647a3e'} roughness={0.5} /></mesh>))}
      {heads.map((head, i) => <group key={i} position={head.position} rotation={[0.06 * (i % 2 ? -1 : 1), 0.3 * i, (i - 2) * 0.06]}>
        <mesh geometry={geometry.glass}><meshStandardMaterial color="#fff0cf" roughness={0.22} metalness={0.05} transparent opacity={0.65} side={THREE.DoubleSide} emissive="#ffd098" emissiveIntensity={lampOn ? (night ? 0.45 : 0.15) : 0} /></mesh>
        {Array.from({ length: 6 }, (_, rib) => <mesh key={rib} geometry={geometry.rib} rotation={[0, rib * Math.PI / 3, 0]}><meshStandardMaterial color="#d7bf88" emissive="#ffcf8f" emissiveIntensity={lampOn ? 0.25 : 0} metalness={0.2} roughness={0.4} /></mesh>)}
        <mesh geometry={geometry.rim}><meshStandardMaterial color="#ddc58d" metalness={0.2} roughness={0.4} /></mesh>
        <mesh position={[0, -0.08, 0]}><sphereGeometry args={[0.09, 20, 16]} /><meshStandardMaterial color="#fff4d3" emissive="#ffd49b" emissiveIntensity={lampOn ? 2.5 : 0} toneMapped={false} /></mesh>
        <pointLight position={[0, -0.15, 0]} color="#ffd6a4" intensity={lampOn ? (night ? 1.25 : 0.16) : 0} distance={6} />
      </group>)}
      <mesh position={[0.2, 0.07, 0.16]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.025, 16]} /><meshStandardMaterial color="#bba06b" metalness={0.5} roughness={0.4} /></mesh>
      <primitive object={target} />
      <spotLight target={target} position={[0, 1.05, 0]} color="#ffcf91" intensity={lampOn ? (night ? 9 : 0.8) : 0} angle={0.85} penumbra={0.9} distance={7} castShadow={lampOn} shadow-mapSize={[1024, 1024]} shadow-camera-near={0.05} shadow-camera-far={7} shadow-radius={4} shadow-normalBias={0.025} />
    </group>
  </group>;
}
