import { Html, RoundedBox, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

export function WoodFloor() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1024;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#aa9581';
    context.fillRect(0, 0, 1024, 1024);
    const colors = ['#c4af97', '#bda78f', '#c0ab93', '#c8b29b', '#b9a48e'];
    let seed = 73;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    // Stagger the board joints; the texture repeats without a checkerboard pattern.
    for (let column = 0; column < 24; column++) {
      const width = 1024 / 24;
      const offset = (column % 3) * 256 / 3;
      for (let row = -1; row < 4; row++) {
        const x = column * width;
        const y = row * 256 + offset;
        context.fillStyle = colors[Math.floor(random() * colors.length)];
        context.fillRect(x + 0.5, y + 0.5, width - 1, 255);
        context.strokeStyle = 'rgba(107, 83, 65, 0.07)';
        context.lineWidth = 0.6;
        for (let grain = 0; grain < 9; grain++) {
          const start = x + 2 + random() * (width - 4);
          context.beginPath();
          context.moveTo(start, y + 2);
          context.bezierCurveTo(start + 2, y + 75, start - 2, y + 180, start, y + 254);
          context.stroke();
        }
      }
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(100 / 12, 10);
    map.anisotropy = 4;
    return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[0, -1.44, 36.75]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[100, 80]} />
    <meshStandardMaterial map={texture} roughness={0.92} />
  </mesh>;
}

export function WallPrint() {
  const texture = useTexture('/art/wall-print.png');
  useEffect(() => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; texture.needsUpdate = true; }, [texture]);
  return <group position={[2.88, 2.9, -3.12]}>
    <RoundedBox args={[1.7, 1.14, 0.075]} radius={0.02} smoothness={3} castShadow><meshStandardMaterial color="#ffe2a8" roughness={0.8} /></RoundedBox>
    <mesh position={[0, 0, 0.044]}><boxGeometry args={[1.6, 1.05, 0.016]} /><meshStandardMaterial color="#ffe2a8" roughness={1} /></mesh>
    <mesh position={[0, 0, 0.055]} receiveShadow><planeGeometry args={[1.46, 1.46 / 1.5]} /><meshStandardMaterial map={texture} roughness={1} /></mesh>
  </group>;
}

function createPlushFabric() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#eeeae6';
  context.fillRect(0, 0, 128, 128);
  for (let row = -1; row < 9; row++) for (let column = -1; column < 9; column++) {
    const x = column * 16 + (row % 2) * 8;
    const y = row * 16;
    for (const [offset, color, width] of [[1, '#b5b2af', 5], [0, '#dedbd6', 3], [-0.8, '#ffffff', 1]] as const) {
      context.strokeStyle = color;
      context.lineWidth = width;
      context.beginPath();
      context.moveTo(x - 6, y - 5 + offset);
      context.bezierCurveTo(x - 6, y + 2 + offset, x - 1, y + 7 + offset, x, y + 6 + offset);
      context.bezierCurveTo(x + 2, y + 4 + offset, x + 6, y + offset, x + 6, y - 5 + offset);
      context.stroke();
    }
  }
  const fabric = new THREE.CanvasTexture(canvas);
  fabric.wrapS = fabric.wrapT = THREE.RepeatWrapping;
  fabric.repeat.set(4, 2);
  fabric.colorSpace = THREE.SRGBColorSpace;
  fabric.anisotropy = 4;
  return fabric;
}

function usePlushWave(idleArm: number, idleHead: number) {
  const { clock } = useThree();
  const arm = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const started = useRef(-Infinity);
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [waving, setWaving] = useState(false);
  const wave = () => { if (!reducedMotion.current) { started.current = clock.elapsedTime; setWaving(true); } };
  useFrame(() => {
    if (!arm.current || !head.current) return;
    const elapsed = clock.elapsedTime - started.current;
    if (elapsed >= 2.4) {
      arm.current.rotation.z = idleArm;
      head.current.rotation.z = idleHead;
      if (waving) setWaving(false);
      return;
    }
    const envelope = Math.sin(Math.PI * elapsed / 2.4);
    arm.current.rotation.z = idleArm + envelope * (2 + 0.16 * Math.sin(elapsed * 18));
    head.current.rotation.z = idleHead + 0.035 * envelope * Math.sin(elapsed * 6);
  });
  return { arm, head, wave, waving };
}

function isPenguinFace(x: number, y: number, z: number) {
  const lobe = (side: number) => ((x - side * 0.4) / 0.43) ** 2 + (y / 0.68) ** 2 < 1;
  const chin = (x / 0.8) ** 2 + ((y + 0.42) / 0.32) ** 2 < 1;
  return z > 0.12 && (lobe(-1) || lobe(1) || chin);
}

export function PlushPenguin({ interactive }: { interactive: boolean }) {
  const portal = useRef(document.querySelector<HTMLDivElement>('.world-scene')!);
  const { arm, head, wave, waving } = usePlushWave(0.6, 0);
  const resources = useMemo(() => {
    const fabric = createPlushFabric();
    const options = { roughness: 0.99, sheen: 0.8, sheenColor: '#d8cbd3', sheenRoughness: 1, map: fabric, bumpMap: fabric, bumpScale: 0.018 };
    const dark = new THREE.MeshPhysicalMaterial({ ...options, color: '#222329' });
    const cream = new THREE.MeshPhysicalMaterial({ ...options, color: '#fff3e7' });
    const peach = new THREE.MeshPhysicalMaterial({ ...options, color: '#eea08e', bumpScale: 0.022 });
    const orange = new THREE.MeshPhysicalMaterial({ ...options, color: '#f39b1c' });
    const faceData = new Uint8Array(512 * 256 * 4);
    const yarn = (fabric.image as HTMLCanvasElement).getContext('2d')!.getImageData(0, 0, 128, 128).data;
    // Paint the heart-shaped face onto the curved head, rather than floating patches.
    for (let y = 0; y < 256; y++) for (let x = 0; x < 512; x++) {
      const phi = x / 512 * Math.PI * 2;
      const theta = y / 256 * Math.PI;
      const px = -Math.cos(phi) * Math.sin(theta);
      const py = Math.cos(theta);
      const pz = Math.sin(phi) * Math.sin(theta);
      const white = isPenguinFace(px, py, pz);
      const shade = yarn[((y % 128) * 128 + x % 128) * 4];
      const color = white ? [255, 243, 231].map(value => Math.round(value * shade / 255)) : [34, 35, 41].map(value => Math.max(8, Math.round(value + (shade - 225) * 0.65)));
      const i = (y * 512 + x) * 4;
      faceData.set([...color, 255], i);
    }
    const face = new THREE.DataTexture(faceData, 512, 256, THREE.RGBAFormat);
    face.flipY = true;
    face.colorSpace = THREE.SRGBColorSpace;
    face.magFilter = face.minFilter = THREE.LinearFilter;
    face.needsUpdate = true;
    const headMaterial = new THREE.MeshPhysicalMaterial({ ...options, map: face });
    const sphere = new THREE.SphereGeometry(1, 48, 32);
    return { fabric, face, dark, cream, peach, orange, headMaterial, sphere };
  }, []);
  useEffect(() => () => {
    resources.fabric.dispose(); resources.face.dispose(); resources.sphere.dispose();
    [resources.dark, resources.cream, resources.peach, resources.orange, resources.headMaterial].forEach(material => material.dispose());
  }, [resources]);

  return <group position={[-2.05, 0.0725, 0.22]} rotation={[0, 0.08, 0]} onClick={event => { event.stopPropagation(); wave(); }}>
    <mesh geometry={resources.sphere} material={resources.dark} position={[0, 0.31, 0]} scale={[0.275, 0.31, 0.215]} castShadow receiveShadow />
    <mesh geometry={resources.sphere} material={resources.cream} position={[0, 0.288, 0.145]} scale={[0.224, 0.279, 0.12]} castShadow />
    {[-1, 1].map(side => <group key={side}>
      <mesh geometry={resources.sphere} material={resources.orange} position={[side * 0.139, 0.057, 0.135]} scale={[0.12, 0.057, 0.153]} castShadow receiveShadow />
    </group>)}
    <group position={[-0.21, 0.425, 0]} rotation={[0, 0, -0.6]}>
      <mesh geometry={resources.sphere} material={resources.dark} position={[0, -0.1, 0.035]} scale={[0.075, 0.18, 0.075]} castShadow />
    </group>
    <group ref={arm} position={[0.21, 0.425, 0]} rotation={[0, 0, 0.6]}>
      <mesh geometry={resources.sphere} material={resources.dark} position={[0, -0.1, 0.035]} scale={[0.075, 0.18, 0.075]} castShadow />
    </group>
    <group ref={head} position={[0, 0.7, 0.016]}>
      <mesh geometry={resources.sphere} material={resources.headMaterial} scale={[0.3, 0.285, 0.26]} castShadow />
      {[-1, 1].map(side => <group key={side}>
        <mesh geometry={resources.sphere} position={[side * 0.121, -0.012, 0.245]} scale={[0.03, 0.033, 0.021]}><meshPhysicalMaterial color="#17171d" roughness={0.12} clearcoat={1} /></mesh>
        <mesh geometry={resources.sphere} position={[side * 0.121 - 0.007, 0, 0.263]} scale={[0.007, 0.007, 0.002]}><meshBasicMaterial color="#fff8ed" /></mesh>
        <mesh geometry={resources.sphere} position={[side * 0.167, -0.095, 0.207]} rotation={[0, side * 0.42, 0]} scale={[0.04, 0.027, 0.008]}><meshStandardMaterial color="#f59caa" roughness={1} /></mesh>
      </group>)}
      <mesh geometry={resources.sphere} material={resources.orange} position={[0, -0.061, 0.285]} scale={[0.072, 0.052, 0.058]} castShadow />
    </group>
    {[0.463, 0.494, 0.525].map(y => <mesh key={y} position={[0, y, 0.012]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.81, 1]} material={resources.peach} castShadow><torusGeometry args={[0.246, 0.031, 16, 64]} /></mesh>)}
    <mesh geometry={resources.sphere} material={resources.peach} position={[0.098, 0.493, 0.259]} scale={[0.067, 0.062, 0.049]} castShadow />
    <RoundedBox args={[0.105, 0.29, 0.05]} position={[0.107, 0.332, 0.271]} rotation={[0, 0, 0.12]} radius={0.024} smoothness={3} material={resources.peach} castShadow />
    <RoundedBox args={[0.092, 0.253, 0.05]} position={[0.194, 0.345, 0.246]} rotation={[0, 0, 0.24]} radius={0.024} smoothness={3} material={resources.peach} castShadow />
    <Html portal={portal} transform position={[0, 0.43, 0.3]} distanceFactor={1} zIndexRange={[95, 94]} style={{ display: interactive ? 'block' : 'none' }}>
      <button className="plush-hotspot" aria-label="Wave to the penguin" title="Wave to the penguin" data-wave-state={waving ? 'waving' : 'idle'} onClick={event => { event.stopPropagation(); wave(); }} />
    </Html>
  </group>;
}

export function PlushBear({ interactive }: { interactive: boolean }) {
  const portal = useRef(document.querySelector<HTMLDivElement>('.world-scene')!);
  const { arm, head, wave, waving } = usePlushWave(0.25, -0.055);
  const resources = useMemo(() => {
    const fabric = createPlushFabric();
    const options = { roughness: 0.99, sheen: 0.85, sheenColor: '#efdbc7', sheenRoughness: 1, bumpMap: fabric, bumpScale: 0.01 };
    const fur = new THREE.MeshPhysicalMaterial({ ...options, color: '#c99166' });
    const cream = new THREE.MeshPhysicalMaterial({ ...options, color: '#ffead3' });
    const pink = new THREE.MeshPhysicalMaterial({ ...options, color: '#df9d97' });
    const sphere = new THREE.SphereGeometry(1, 48, 32);
    const smiles = [-1, 1].map(side => new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -0.049, 0.262),
      new THREE.Vector3(side * 0.021, -0.089, 0.261),
      new THREE.Vector3(side * 0.047, -0.067, 0.253),
    ), 16, 0.003, 8, false));
    return { fabric, fur, cream, pink, sphere, smiles };
  }, []);
  useEffect(() => () => {
    resources.fabric.dispose(); resources.sphere.dispose();
    [resources.fur, resources.cream, resources.pink].forEach(material => material.dispose());
    resources.smiles.forEach(geometry => geometry.dispose());
  }, [resources]);
  return <group position={[1.65, 0.0725, 0.65]} rotation={[0, -0.12, 0]} onClick={event => { event.stopPropagation(); wave(); }}>
    <mesh geometry={resources.sphere} material={resources.fur} position={[0, 0.3, 0]} scale={[0.235, 0.275, 0.185]} castShadow receiveShadow />
    <mesh geometry={resources.sphere} material={resources.cream} position={[0, 0.272, 0.158]} scale={[0.162, 0.193, 0.043]} castShadow />
    {[-1, 1].map(side => <group key={side}>
      <mesh geometry={resources.sphere} material={resources.fur} position={[side * 0.139, 0.087, 0.14]} scale={[0.131, 0.087, 0.155]} castShadow receiveShadow />
      <mesh geometry={resources.sphere} material={resources.cream} position={[side * 0.139, 0.091, 0.276]} scale={[0.077, 0.049, 0.024]} />
    </group>)}
    <group position={[-0.22, 0.421, 0]} rotation={[0, 0, -0.25]}>
      <mesh geometry={resources.sphere} material={resources.fur} position={[0, -0.095, 0.036]} scale={[0.094, 0.163, 0.096]} castShadow />
    </group>
    <group ref={arm} position={[0.22, 0.421, 0]} rotation={[0, 0, 0.25]}>
      <mesh geometry={resources.sphere} material={resources.fur} position={[0, -0.095, 0.036]} scale={[0.094, 0.163, 0.096]} castShadow />
    </group>
    <group ref={head} position={[0, 0.659, 0.016]} rotation={[0, 0, -0.055]}>
      <mesh geometry={resources.sphere} material={resources.fur} scale={[0.285, 0.257, 0.224]} castShadow />
      {[-1, 1].map(side => <group key={side}>
        <mesh geometry={resources.sphere} material={resources.fur} position={[side * 0.215, 0.179, -0.015]} scale={[0.103, 0.114, 0.073]} castShadow />
        <mesh geometry={resources.sphere} material={resources.cream} position={[side * 0.217, 0.18, 0.045]} scale={[0.061, 0.071, 0.024]} />
        <mesh geometry={resources.sphere} position={[side * 0.102, -0.007, 0.215]} scale={[0.024, 0.027, 0.017]}><meshPhysicalMaterial color="#342a27" roughness={0.13} clearcoat={1} /></mesh>
        <mesh geometry={resources.sphere} position={[side * 0.102 - 0.006, 0.002, 0.229]} scale={[0.006, 0.006, 0.002]}><meshBasicMaterial color="#fff9ee" /></mesh>
        <mesh geometry={resources.sphere} material={resources.pink} position={[side * 0.16, -0.06, 0.181]} rotation={[0, side * 0.44, 0]} scale={[0.032, 0.02, 0.008]} />
      </group>)}
      <mesh geometry={resources.sphere} material={resources.cream} position={[0, -0.078, 0.212]} scale={[0.104, 0.078, 0.045]} castShadow />
      <mesh geometry={resources.sphere} position={[0, -0.045, 0.255]} scale={[0.028, 0.021, 0.017]}><meshStandardMaterial color="#573b32" roughness={0.75} /></mesh>
      {resources.smiles.map((geometry, i) => <mesh key={i} geometry={geometry}><meshStandardMaterial color="#69493d" roughness={1} /></mesh>)}
    </group>
    <Html portal={portal} transform position={[0, 0.43, 0.3]} distanceFactor={1} zIndexRange={[95, 94]} style={{ display: interactive ? 'block' : 'none' }}>
      <button className="plush-hotspot" aria-label="Wave to the bear" title="Wave to the bear" data-wave-state={waving ? 'waving' : 'idle'} onClick={event => { event.stopPropagation(); wave(); }} />
    </Html>
  </group>;
}
