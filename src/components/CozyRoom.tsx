import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { WindowCity } from './WindowCity';
import { FlowerLamp } from './FlowerLamp';

type Vector = [number, number, number];

function Block({ size, position = [0, 0, 0], color, radius = 0.02 }: { size: Vector; position?: Vector; color: string; radius?: number }) {
  return <RoundedBox args={size} position={position} radius={radius} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.85} /></RoundedBox>;
}

function WindowWall({ night }: { night: boolean }) {
  const curtain = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(0.42, 4.02, 32, 24);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) positions.setZ(i, Math.cos(positions.getX(i) * 75) * 0.035);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(() => () => curtain.dispose(), [curtain]);
  return <>
    <Block size={[55.5, 42, 0.12]} position={[-22.25, 18.3, -3.25]} color="#f5afd0" radius={0.01} />
    <Block size={[55.5, 0.22, 0.08]} position={[-22.25, -2.59, -3.16]} color="#f8e5e4" radius={0.01} />
    <group position={[5.5, 2.2, -0.55]} rotation={[0, -Math.PI / 2, 0]}>
      {/* The wall continues past the window, with a framed opening for daylight. */}
      {([
        [[1.15, 42, 0.12], [-2.125, 16.1, -0.06]],
        [[35.4, 42, 0.12], [23.85, 16.1, -0.06]],
        [[7.7, 35.3, 0.12], [2.3, 19.45, -0.06]],
        [[7.7, 3.1, 0.12], [2.3, -3.35, -0.06]],
      ] as [Vector, Vector][]).map(([size, position], i) => <Block key={i} size={size} position={position} color="#f5afd0" radius={0.01} />)}
      <Block size={[44.25, 0.22, 0.08]} position={[19.425, -4.79, 0.04]} color="#f8e5e4" radius={0.01} />
      <WindowCity night={night} />
      <mesh position={[2.3, 0, -0.03]}><planeGeometry args={[7.7, 3.6]} /><meshStandardMaterial color="#e8f7ff" transparent opacity={0.12} depthWrite={false} /></mesh>
      {[-1.62, 6.22].map(x => <Block key={x} size={[0.14, 3.9, 0.16]} position={[x, 0, 0.07]} color="#faf8f0" />)}
      {[-1.86, 1.86].map(y => <Block key={y} size={[7.98, 0.14, 0.16]} position={[2.3, y, 0.07]} color="#faf8f0" />)}
      {[0, 1.65, 3.3, 4.95].map(x => <Block key={x} size={[0.055, 3.6, 0.08]} position={[x, 0, 0.035]} color="#faf8f0" radius={0.01} />)}
      <Block size={[7.7, 0.055, 0.08]} position={[2.3, 0.12, 0.035]} color="#faf8f0" radius={0.01} />
      <Block size={[8.1, 0.09, 0.38]} position={[2.3, -1.9, 0.16]} color="#faf8f0" />
      <mesh position={[2.3, 2.1, 0.19]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.022, 0.022, 8.3, 16]} /><meshStandardMaterial color="#e8dedb" /></mesh>
      {[-1.5, 6.1].map(x => <mesh key={x} geometry={curtain} position={[x, -0.07, 0.2]}><meshStandardMaterial color="#fffaf5" roughness={1} side={THREE.DoubleSide} transparent opacity={0.8} /></mesh>)}
    </group>
  </>;
}

function DeskChair() {
  return <group position={[-0.3, -1.26, 2.9]} scale={[1.65, 2, 1.5]}>
    <Block size={[0.98, 0.14, 0.88]} position={[0, 0.03, 0]} color="#b3d6c8" radius={0.06} />
    <group position={[0, 0.6, 0.38]} rotation={[-0.12, 0, 0]}><Block size={[1.02, 1.12, 0.13]} color="#b3d6c8" radius={0.06} /></group>
    {[-0.57, 0.57].map(x => <group key={x}>
      <Block size={[0.1, 0.08, 0.58]} position={[x, 0.27, 0]} color="#f4efeb" />
      <Block size={[0.055, 0.25, 0.07]} position={[x, 0.115, 0.16]} color="#e6dfdc" />
    </group>)}
    <mesh position={[0, -0.31, 0]} castShadow><cylinderGeometry args={[0.04, 0.045, 0.47, 20]} /><meshStandardMaterial color="#c8c4c2" metalness={0.65} roughness={0.3} /></mesh>
    {Array.from({ length: 5 }, (_, i) => <group key={i} rotation={[0, i * Math.PI * 2 / 5, 0]}>
      <Block size={[0.56, 0.045, 0.065]} position={[0.23, -0.63, 0]} color="#e6dfdc" radius={0.02} />
      <mesh position={[0.47, -0.675, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.045, 0.045, 0.065, 16]} /><meshStandardMaterial color="#9c9e9f" roughness={0.8} /></mesh>
    </group>)}
  </group>;
}

function SoftRug() {
  const fabric = useMemo(() => {
    const data = new Uint8Array(32 * 32 * 4);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
      const i = (y * 32 + x) * 4;
      const value = (x % 4 === 0 || y % 4 === 0) ? 90 : 180;
      data.set([value, value, value, 255], i);
    }
    const map = new THREE.DataTexture(data, 32, 32, THREE.RGBAFormat);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(35, 18);
    map.needsUpdate = true;
    return map;
  }, []);
  useEffect(() => () => fabric.dispose(), [fabric]);
  return <group position={[-0.1, -2.672, 2.6]}>
    <RoundedBox args={[6.6, 0.022, 3.3]} radius={0.009} smoothness={3} receiveShadow><meshStandardMaterial color="#e9e2e6" bumpMap={fabric} bumpScale={0.01} roughness={1} /></RoundedBox>
    {[-1, 1].map(side => Array.from({ length: 18 }, (_, i) => <Block key={`${side}-${i}`} size={[0.1, 0.008, 0.008]} position={[side * 3.34, 0, -1.55 + i * 0.18]} color="#e9e2e6" radius={0.003} />))}
  </group>;
}

export function CozyRoom({ seated, deskOffsetZ, night, lampOn, onToggleLamp }: { seated: boolean; deskOffsetZ: number; night: boolean; lampOn: boolean; onToggleLamp: () => void }) {
  return <><WindowWall night={night} /><group position={[0, 0, deskOffsetZ]}><FlowerLamp night={night} lampOn={lampOn} onToggleLamp={onToggleLamp} /><group visible={!seated}><DeskChair /></group><SoftRug /></group></>;
}
