import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

type Vector = [number, number, number];

function Block({ size, position = [0, 0, 0], color, radius = 0.02 }: { size: Vector; position?: Vector; color: string; radius?: number }) {
  return <RoundedBox args={size} position={position} radius={radius} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.85} /></RoundedBox>;
}

function WindowWall() {
  const curtain = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(0.42, 4.02, 32, 24);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) positions.setZ(i, Math.cos(positions.getX(i) * 75) * 0.035);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(() => () => curtain.dispose(), [curtain]);
  return <>
    <Block size={[100, 40, 0.12]} position={[0, 18.5, -3.25]} color="#f5afd0" radius={0.01} />
    <Block size={[100, 0.22, 0.08]} position={[0, -1.33, -3.16]} color="#f8e5e4" radius={0.01} />
    <group position={[5.5, 2.2, -0.55]} rotation={[0, -Math.PI / 2, 0]}>
      {/* A short window return joins the back wall without enclosing the front of the room. */}
      {([
        [[1.1, 5.8, 0.12], [-2.15, -0.74, -0.06]],
        [[0.2, 5.8, 0.12], [1.65, -0.74, -0.06]],
        [[3.1, 0.36, 0.12], [0, 1.98, -0.06]],
        [[3.1, 1.84, 0.12], [0, -2.72, -0.06]],
      ] as [Vector, Vector][]).map(([size, position], i) => <Block key={i} size={size} position={position} color="#f5afd0" radius={0.01} />)}
      <Block size={[4.45, 0.22, 0.08]} position={[-0.475, -3.53, 0.04]} color="#f8e5e4" radius={0.01} />
      <mesh position={[0, 0, -0.7]}><planeGeometry args={[3.5, 4.2]} /><meshBasicMaterial color="#c4e6f1" /></mesh>
      {[-0.76, 0.57].map((x, i) => <group key={x} position={[x, -0.55, -0.55]}>
        <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.035, 0.045, 1.6, 8]} /><meshBasicMaterial color="#769279" /></mesh>
        {[0, 1, 2].map(j => <mesh key={j} position={[(j - 1) * 0.22, j * 0.25, 0]} scale={[0.37, 0.48, 0.15]}><icosahedronGeometry args={[1, 2]} /><meshBasicMaterial color={i ? '#a1c89b' : '#88b69c'} /></mesh>)}
      </group>)}
      <mesh position={[0, 0, -0.03]}><planeGeometry args={[3.1, 3.6]} /><meshStandardMaterial color="#e8f7ff" transparent opacity={0.12} depthWrite={false} /></mesh>
      {[-1.62, 1.62].map(x => <Block key={x} size={[0.14, 3.9, 0.16]} position={[x, 0, 0.07]} color="#faf8f0" />)}
      {[-1.86, 1.86].map(y => <Block key={y} size={[3.38, 0.14, 0.16]} position={[0, y, 0.07]} color="#faf8f0" />)}
      <Block size={[0.055, 3.6, 0.08]} position={[0, 0, 0.035]} color="#faf8f0" radius={0.01} />
      <Block size={[3.1, 0.055, 0.08]} position={[0, 0.12, 0.035]} color="#faf8f0" radius={0.01} />
      <Block size={[3.5, 0.09, 0.38]} position={[0, -1.9, 0.16]} color="#faf8f0" />
      <mesh position={[0, 2.1, 0.19]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.022, 0.022, 3.7, 16]} /><meshStandardMaterial color="#e8dedb" /></mesh>
      {[-1.5, 1.5].map(x => <mesh key={x} geometry={curtain} position={[x, -0.07, 0.2]}><meshStandardMaterial color="#fffaf5" roughness={1} side={THREE.DoubleSide} transparent opacity={0.8} /></mesh>)}
    </group>
  </>;
}

function DeskLamp() {
  const arm = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.83, 0), new THREE.Vector3(0.1, 1.05, -0.08), new THREE.Vector3(0.25, 1.08, -0.06), new THREE.Vector3(0.34, 0.95, 0.04),
  ]), 24, 0.023, 12, false), []);
  useEffect(() => () => arm.dispose(), [arm]);
  return <group position={[-4.4, 0.0725, -1.25]}>
    <mesh position={[0, 0.035, 0]} castShadow receiveShadow><cylinderGeometry args={[0.24, 0.25, 0.07, 32]} /><meshStandardMaterial color="#b2d7ca" roughness={0.65} /></mesh>
    <mesh position={[0, 0.45, 0]} castShadow><cylinderGeometry args={[0.025, 0.025, 0.83, 16]} /><meshStandardMaterial color="#91bdb0" /></mesh>
    <mesh geometry={arm} castShadow><meshStandardMaterial color="#91bdb0" /></mesh>
    <mesh position={[0.34, 0.92, 0.04]} castShadow><sphereGeometry args={[0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#b2d7ca" side={THREE.DoubleSide} roughness={0.65} /></mesh>
    <mesh position={[0.34, 0.919, 0.04]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.23, 32]} /><meshStandardMaterial color="#fff3cc" emissive="#ffe2ae" emissiveIntensity={0.6} /></mesh>
    <pointLight position={[0.34, 0.85, 0.04]} color="#ffe2ba" intensity={0.7} distance={3} />
  </group>;
}

function DeskChair() {
  return <group position={[-0.3, -0.72, 2.9]} scale={[1.3, 1, 1.15]}>
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
  return <group position={[-0.1, -1.412, 2.6]}>
    <RoundedBox args={[6.6, 0.022, 3.3]} radius={0.009} smoothness={3} receiveShadow><meshStandardMaterial color="#e9e2e6" bumpMap={fabric} bumpScale={0.01} roughness={1} /></RoundedBox>
    {[-1, 1].map(side => Array.from({ length: 18 }, (_, i) => <Block key={`${side}-${i}`} size={[0.1, 0.008, 0.008]} position={[side * 3.34, 0, -1.55 + i * 0.18]} color="#e9e2e6" radius={0.003} />))}
  </group>;
}

export function CozyRoom() {
  return <><WindowWall /><DeskLamp /><DeskChair /><SoftRug /></>;
}
