import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Home } from 'lucide-react';
import * as THREE from 'three';
import { hardwareProjects, modeDetails, PortfolioMode, projects, socials } from '../portfolioData';
import { CassetteScreen, ComputerScreen, ContactScreen, ProjectBottomScreen, ProjectTopScreen } from './DeviceScreens';

type SceneProps = { activeMode: PortfolioMode | null; onSelectMode: (mode: PortfolioMode | null) => void };
type DeviceProps = SceneProps & { mode: PortfolioMode };
type Vector = [number, number, number];

const desktopSurfaceY = 0.0725;
const deviceScales: Record<PortfolioMode, number> = { about: 1, projects: 0.68, hardware: 0.71, contact: 1 };
const cassetteYaw = -0.32;
const cassetteTilt = -0.16;
const cassettePosition: Vector = [3.2, desktopSurfaceY + 0.17 * deviceScales.hardware, 1.12];
const cassetteScreenCenter = new THREE.Vector3(0, 0.49, 0.171)
  .applyAxisAngle(new THREE.Vector3(1, 0, 0), cassetteTilt)
  .add(new THREE.Vector3(0, 0.007, 0))
  .multiplyScalar(deviceScales.hardware)
  .applyAxisAngle(new THREE.Vector3(0, 1, 0), cassetteYaw)
  .add(new THREE.Vector3(...cassettePosition));
const locations: Record<PortfolioMode, Vector> = {
  about: [-0.3, 1.12, 0.15],
  projects: [-3.2, desktopSurfaceY + (0.99 - desktopSurfaceY) * deviceScales.projects, 1.05 - 0.23 * deviceScales.projects],
  hardware: cassetteScreenCenter.toArray() as Vector,
  contact: [3.15, 1.35, -1.07],
};

function Box({ size, position = [0, 0, 0], color, radius = 0.05, rotation, metalness = 0.08 }: { size: Vector; position?: Vector; color: string; radius?: number; rotation?: Vector; metalness?: number }) {
  return <RoundedBox args={size} position={position} rotation={rotation} radius={radius} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.58} metalness={metalness} /></RoundedBox>;
}

function DeviceLabel({ mode, position, activeMode, onSelectMode }: DeviceProps & { position: Vector }) {
  const portal = useRef(document.querySelector<HTMLDivElement>('.world-scene')!);
  const detail = modeDetails[mode];
  return <Html portal={portal} position={position} center zIndexRange={[110, 100]} style={{ display: activeMode === null ? 'block' : 'none' }}><button className="object-label" style={{ '--object-color': detail.accent } as React.CSSProperties} onClick={() => onSelectMode(mode)}><span className="label-dot" />{detail.label}<span className="label-device">{detail.device}</span></button></Html>;
}

function Screen({ children, mode, activeMode, onSelectMode, position, rotation, factor, physical = false }: DeviceProps & { children: React.ReactNode; position: Vector; rotation?: Vector; factor: number; physical?: boolean }) {
  const portal = useRef(document.querySelector<HTMLDivElement>('.world-scene')!);
  return <Html portal={portal} transform position={position} rotation={rotation} distanceFactor={factor} zIndexRange={[90, 0]} style={{ display: physical || activeMode === null || activeMode === mode ? 'block' : 'none' }}>
    <div className={`device-surface ${activeMode === mode ? 'device-focused' : ''}`} onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); if (activeMode !== mode) onSelectMode(mode); }}>{children}</div>
  </Html>;
}

function CameraRig({ activeMode }: { activeMode: PortfolioMode | null }) {
  const { camera, size, gl } = useThree();
  const lookAt = useRef(new THREE.Vector3(0, 1, 0));
  const initialized = useRef(false);
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useFrame((state, delta) => {
    const aspect = size.width / size.height;
    const target = new THREE.Vector3(...(activeMode ? locations[activeMode] : [0, 1, 0] as Vector));
    const height = activeMode === 'about' ? 2.9 / Math.max(0.4, 1 - 140 / size.height) : activeMode === 'projects' ? 2.65 / Math.max(0.4, 1 - 140 / size.height) : activeMode ? 2.3 : 5.4;
    const width = activeMode === 'about' ? (aspect < 0.8 ? 3.2 : 4.0) : activeMode === 'projects' ? (aspect < 0.8 ? 2.6 : 3.1) : activeMode ? (aspect < 0.8 ? 2.45 : 2.75) : 10.4;
    // Match close-up distance to physical scale so smaller devices retain readable screens.
    const distance = Math.max(height / (2 * Math.tan(THREE.MathUtils.degToRad(21))), width / (2 * Math.tan(THREE.MathUtils.degToRad(21)) * aspect)) * (activeMode ? deviceScales[activeMode] : 1);
    const slope = activeMode === 'projects' ? 0.78 : activeMode === 'hardware' ? Math.tan(-cassetteTilt) : activeMode === 'contact' ? 0.72 : activeMode === 'about' ? 0.34 : 0.28;
    const yaw = activeMode === 'projects' ? 0.3 : activeMode === 'hardware' ? cassetteYaw : activeMode === 'contact' ? -0.17 : 0;
    const destination = target.clone().add(new THREE.Vector3(Math.sin(yaw), slope, Math.cos(yaw)).normalize().multiplyScalar(distance));
    const alpha = !initialized.current || reducedMotion.current ? 1 : 1 - Math.exp(-delta * 5);
    camera.position.lerp(destination, alpha);
    lookAt.current.lerp(target, alpha);
    camera.lookAt(lookAt.current);
    if (!initialized.current) { initialized.current = true; gl.domElement.dataset.ready = 'true'; }
  });
  return null;
}

function Computer(props: SceneProps) {
  const device = { ...props, mode: 'about' as const };
  return <group position={[-0.3, 0, -0.8]} onClick={event => { event.stopPropagation(); props.onSelectMode('about'); }}>
    <Box size={[3.12, 2.38, 0.9]} position={[0, 1.5, 0]} color="#82cfc0" radius={0.16} />
    <Box size={[2.8, 1.84, 0.06]} position={[0, 1.65, 0.48]} color="#344d50" radius={0.08} />
    <Box size={[2.56, 1.64, 0.012]} position={[0, 1.65, 0.519]} color="#102a31" radius={0.025} />
    <Screen {...device} position={[0, 1.65, 0.537]} factor={1.6}><ComputerScreen /></Screen>
    <Box size={[0.62, 0.35, 0.6]} position={[0, 0.18, 0.05]} color="#467d78" />
    <Box size={[1.65, 0.12, 1]} position={[0, 0.04, 0.12]} color="#5b9e92" />
    <mesh position={[1.23, 0.62, 0.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 0.025, 24]} /><meshStandardMaterial color="#ffe698" emissive="#ffb454" emissiveIntensity={0.6} /></mesh>
    {Array.from({ length: 5 }, (_, i) => <Box key={i} size={[0.03, 0.1, 0.025]} position={[-1.25 + i * 0.09, 0.63, 0.49]} color="#4c857d" radius={0.01} />)}
    <DeviceLabel {...device} position={[0, 2.98, 0]} />
  </group>;
}

function Keyboard({ onSelectMode }: SceneProps) {
  return <group position={[-0.3, 0.174, 1.12]} onClick={event => { event.stopPropagation(); onSelectMode('about'); }}>
    <Box size={[2.45, 0.14, 0.88]} color="#f8c5b7" radius={0.06} />
    {[0, 1, 2, 3].map(row => Array.from({ length: 12 }, (_, col) => row === 3 && col >= 4 && col <= 7 ? null : <Box key={`${row}-${col}`} size={[0.15, 0.04, 0.13]} position={[-1.05 + col * 0.19, 0.1, -0.27 + row * 0.18]} color={col === 0 ? '#ffa265' : row === 3 ? '#85c8b8' : '#f9e3d0'} radius={0.013} />))}
    <Box size={[0.72, 0.04, 0.13]} position={[0, 0.1, 0.28]} color="#bca3d4" radius={0.015} />
  </group>;
}

function Nintendo3DS(props: SceneProps) {
  const tilt = 0.35;
  const cradleShape = useMemo(() => {
    const top = 0.4 - 0.07 / Math.cos(tilt) - 0.0725;
    const shape = new THREE.Shape();
    shape.moveTo(-0.45, 0);
    shape.lineTo(0.52, 0);
    shape.lineTo(0.52, top + 0.52 * Math.tan(tilt));
    shape.lineTo(-0.45, top - 0.45 * Math.tan(tilt));
    shape.closePath();
    return shape;
  }, [tilt]);
  const [index, setIndex] = useState(0);
  const [details, setDetails] = useState(false);
  const device = { ...props, mode: 'projects' as const };
  const change = (direction: number) => { setIndex(value => (value + direction + projects.length) % projects.length); setDetails(false); };
  useEffect(() => {
    if (props.activeMode !== 'projects') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); change(event.key === 'ArrowLeft' ? -1 : 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props.activeMode]);
  const project = projects[index];
  return <group position={[-3.2, desktopSurfaceY * (1 - deviceScales.projects), 1.05]} scale={deviceScales.projects} rotation={[0, 0.3, 0]} onClick={event => { event.stopPropagation(); props.onSelectMode('projects'); }}>
    <mesh position={[-0.66, 0.0725, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow><extrudeGeometry args={[cradleShape, { depth: 1.32, bevelEnabled: false }]} /><meshStandardMaterial color="#bd8d43" roughness={0.8} /></mesh>
    <group position={[0, 0.4, 0]} rotation={[tilt, 0, 0]}>
      <Box size={[2.26, 0.14, 1.45]} color="#cf9f42" radius={0.06} />
      <Box size={[2.2, 0.04, 1.39]} position={[0, 0.077, 0]} color="#f9d77b" radius={0.015} />
      <mesh position={[0, 0.107, 0.05]}><boxGeometry args={[1.59, 0.025, 1.2]} /><meshStandardMaterial color="#343b3c" roughness={0.75} /></mesh>
      <Screen {...device} position={[0, 0.125, 0.05]} rotation={[-Math.PI / 2, 0, 0]} factor={1.65}><ProjectBottomScreen project={project} index={index} onChange={change} details={details} onToggleDetails={() => setDetails(value => !value)} /></Screen>
      <Screen {...device} physical position={[-0.94, 0.13, -0.32]} rotation={[-Math.PI / 2, 0, 0]} factor={1.05}><button className="physical-circle-pad" aria-label="3DS circle pad next project" title="Next project" onClick={() => change(1)}><span /></button></Screen>
      <Screen {...device} physical position={[-0.94, 0.13, 0.27]} rotation={[-Math.PI / 2, 0, 0]} factor={1.02}><div className="physical-dpad"><button className="dpad-up" aria-label="3DS show details" title="Project details" onClick={() => setDetails(true)}><ChevronUp size={21} /></button><button className="dpad-left" aria-label="3DS previous project" title="Previous project" onClick={() => change(-1)}><ArrowLeft size={21} /></button><span className="dpad-center" /><button className="dpad-right" aria-label="3DS next project" title="Next project" onClick={() => change(1)}><ArrowRight size={21} /></button><button className="dpad-down" aria-label="3DS show stack" title="Project stack" onClick={() => setDetails(false)}><ChevronDown size={21} /></button></div></Screen>
      <Screen {...device} physical position={[0.94, 0.13, 0.03]} rotation={[-Math.PI / 2, 0, 0]} factor={1.02}><div className="physical-ab"><button className="ab-x" aria-label="3DS X previous project" title="Previous project" onClick={() => change(-1)}>X</button><button className="ab-y" aria-label="3DS Y next project" title="Next project" onClick={() => change(1)}>Y</button><a className="ab-a" aria-label={`3DS open ${project.name}`} href={project.href} target="_blank" rel="noopener noreferrer" title={`Open ${project.name}`}>A</a><button className="ab-b" aria-label="3DS project details" title="Project details" onClick={() => setDetails(value => !value)}>B</button></div></Screen>
      <Screen {...device} physical position={[0, 0.119, 0.685]} rotation={[-Math.PI / 2, 0, 0]} factor={0.95}><button className="physical-home" aria-label="3DS return to desk" title="Desk" onClick={event => { event.stopPropagation(); props.onSelectMode(null); }}><Home size={20} /></button></Screen>
      <mesh position={[0.98, -0.005, 0.726]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.008, 16]} /><meshStandardMaterial color="#75cde2" emissive="#43aed5" emissiveIntensity={0.6} /></mesh>
      <mesh position={[0, 0.1, -0.64]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.072, 0.072, 2.12, 32]} /><meshStandardMaterial color="#b88732" metalness={0.35} /></mesh>
      <group position={[0, 0.1, -0.64]} rotation={[-0.48, 0, 0]}>
        <Box size={[2.26, 1.27, 0.125]} position={[0, 0.62, 0]} color="#efbd52" radius={0.055} />
        <mesh position={[0, 0.62, 0.075]}><boxGeometry args={[1.96, 1.1, 0.016]} /><meshStandardMaterial color="#333d43" roughness={0.75} /></mesh>
        <Screen {...device} position={[0, 0.62, 0.088]} factor={1.55}><ProjectTopScreen project={project} index={index} /></Screen>
        <mesh position={[0, 1.19, 0.069]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.012, 20]} /><meshStandardMaterial color="#354041" /></mesh>
        {[-1.055, 1.055].map(x => Array.from({ length: 6 }, (_, i) => <mesh key={`${x}-${i}`} position={[x + (i % 2 - 0.5) * 0.035, 0.49 + Math.floor(i / 2) * 0.055, 0.071]}><sphereGeometry args={[0.009, 8, 8]} /><meshStandardMaterial color="#8d6c32" /></mesh>))}
      </group>
    </group>
    <DeviceLabel {...device} position={[0, 2.4, 0.3]} />
  </group>;
}

function CassettePlayer(props: SceneProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reels = useRef<THREE.Group>(null);
  const device = { ...props, mode: 'hardware' as const };
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useFrame((_, delta) => { if (reels.current && playing && !reducedMotion.current) reels.current.rotation.z += delta * 0.6; });
  return <group position={cassettePosition} scale={deviceScales.hardware} rotation={[0, cassetteYaw, 0]} onClick={event => { event.stopPropagation(); props.onSelectMode('hardware'); }}>
    {[-0.78, 0.78].map(x => <Box key={x} size={[0.28, 0.05, 0.28]} position={[x, -0.145, 0]} color="#b6557b" radius={0.01} />)}
    <group position={[0, 0.007, 0]} rotation={[cassetteTilt, 0, 0]}>
      <Box size={[2.2, 1.2, 0.26]} position={[0, 0.48, 0]} color="#ee77a0" radius={0.09} />
      <Box size={[1.87, 0.87, 0.035]} position={[0, 0.49, 0.1475]} color="#253f36" radius={0.04} />
      <Screen {...device} position={[0, 0.49, 0.171]} factor={1.42}><CassetteScreen index={index} playing={playing} onChange={direction => setIndex(value => (value + direction + hardwareProjects.length) % hardwareProjects.length)} onTogglePlay={() => setPlaying(value => !value)} /></Screen>
      <group position={[-0.85, 0.04, 0.04]} ref={reels}><mesh><torusGeometry args={[0.063, 0.012, 10, 24]} /><meshStandardMaterial color="#ffd974" /></mesh><Box size={[0.1, 0.018, 0.01]} color="#ffda7a" radius={0.005} /></group>
      <DeviceLabel {...device} position={[0, -0.27, 0.3]} />
    </group>
  </group>;
}

function Turntable(props: SceneProps) {
  const [index, setIndex] = useState(0);
  const disc = useRef<THREE.Group>(null);
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const device = { ...props, mode: 'contact' as const };
  useFrame((_, delta) => { if (disc.current && !reducedMotion.current) disc.current.rotation.y += delta * 0.45; });
  return <group position={[3.15, 1.065, -1.15]} rotation={[0, -0.17, 0]} onClick={event => { event.stopPropagation(); props.onSelectMode('contact'); }}>
    <Box size={[2.18, 0.18, 1.6]} color="#988bd0" radius={0.045} />
    <Box size={[2.13, 0.022, 1.55]} position={[0, 0.096, 0]} color="#b1a4d3" radius={0.025} />
    {[-0.84, 0.84].map(x => [-0.59, 0.59].map(z => <mesh key={`${x}-${z}`} position={[x, -0.105, z]} castShadow><cylinderGeometry args={[0.095, 0.085, 0.03, 24]} /><meshStandardMaterial color="#3b354d" roughness={0.9} /></mesh>))}
    <mesh position={[-0.32, 0.132, 0.17]} castShadow><cylinderGeometry args={[0.59, 0.59, 0.043, 96]} /><meshStandardMaterial color="#b7b8c2" roughness={0.32} metalness={0.78} /></mesh>
    <mesh position={[-0.32, 0.158, 0.17]}><cylinderGeometry args={[0.568, 0.568, 0.01, 96]} /><meshStandardMaterial color="#35303e" roughness={0.95} /></mesh>
    <group position={[-0.32, 0.172, 0.17]} ref={disc}>
      <mesh castShadow><cylinderGeometry args={[0.56, 0.56, 0.012, 96]} /><meshStandardMaterial color="#201e2b" roughness={0.34} metalness={0.2} /></mesh>
      {Array.from({ length: 15 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 0]}><torusGeometry args={[0.205 + i * 0.024, 0.0014, 6, 96]} /><meshStandardMaterial color="#51485c" roughness={0.6} /></mesh>)}
      <mesh position={[0, 0.008, 0]}><cylinderGeometry args={[0.15, 0.15, 0.004, 48]} /><meshStandardMaterial color="#f5c77d" roughness={0.95} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]}><torusGeometry args={[0.112, 0.002, 6, 48]} /><meshStandardMaterial color="#b3727b" /></mesh>
      <Box size={[0.09, 0.003, 0.018]} position={[0, 0.012, 0.052]} color="#9c5c76" radius={0.002} />
    </group>
    <mesh position={[-0.32, 0.196, 0.17]}><cylinderGeometry args={[0.012, 0.012, 0.046, 20]} /><meshStandardMaterial color="#e3e1e8" metalness={0.85} roughness={0.2} /></mesh>
    <mesh position={[0.76, 0.145, -0.27]} castShadow><cylinderGeometry args={[0.105, 0.105, 0.065, 32]} /><meshStandardMaterial color="#685981" metalness={0.35} /></mesh>
    <mesh position={[0.76, 0.226, -0.27]} castShadow><cylinderGeometry args={[0.045, 0.045, 0.1, 24]} /><meshStandardMaterial color="#c4bfce" metalness={0.8} roughness={0.3} /></mesh>
    <group position={[0.76, 0.27, -0.27]} rotation={[0, -0.74, 0]}>
      <Box size={[0.12, 0.09, 0.1]} color="#726380" radius={0.018} />
      <mesh position={[0, 0, 0.435]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.019, 0.019, 0.87, 24]} /><meshStandardMaterial color="#d9d7e1" roughness={0.24} metalness={0.8} /></mesh>
      <mesh position={[0, 0.005, -0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.065, 0.065, 0.13, 32]} /><meshStandardMaterial color="#7d748d" metalness={0.55} roughness={0.35} /></mesh>
      <Box size={[0.095, 0.038, 0.16]} position={[0, -0.024, 0.94]} color="#eee0c9" radius={0.01} />
      <Box size={[0.065, 0.038, 0.09]} position={[0, -0.051, 0.97]} color="#cf7d92" radius={0.007} />
      <mesh position={[0, -0.081, 0.97]}><cylinderGeometry args={[0.004, 0.002, 0.022, 12]} /><meshStandardMaterial color="#d8d6df" metalness={0.7} /></mesh>
    </group>
    <Box size={[0.06, 0.115, 0.065]} position={[0.87, 0.165, 0.34]} color="#746782" radius={0.01} />
    <Box size={[0.11, 0.03, 0.08]} position={[0.87, 0.23, 0.34]} color="#e0d8e9" radius={0.01} />
    <Box size={[0.3, 0.025, 0.09]} position={[0.73, 0.124, 0.65]} color="#675a7c" radius={0.012} />
    <Box size={[0.095, 0.02, 0.065]} position={[0.79, 0.145, 0.65]} color="#e6c799" radius={0.008} />
    <Box size={[0.34, 0.045, 0.015]} position={[-0.76, -0.015, 0.801]} color="#695a80" radius={0.007} />
    <Box size={[1.98, 0.1, 0.19]} position={[0, 0.158, -0.695]} color="#7660a6" radius={0.02} />
    <mesh position={[0, 0.195, -0.69]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.052, 0.052, 1.88, 32]} /><meshStandardMaterial color="#645278" metalness={0.3} /></mesh>
    <group position={[0, 0.195, -0.69]} rotation={[-0.38, 0, 0]}>
      <Box size={[1.98, 0.65, 0.11]} position={[0, 0.325, 0]} color="#7660a6" radius={0.035} />
      <mesh position={[0, 0.325, 0.059]}><boxGeometry args={[1.9, 0.605, 0.012]} /><meshStandardMaterial color="#171c29" roughness={0.38} /></mesh>
      <Screen {...device} position={[0, 0.325, 0.067]} factor={1.54}><ContactScreen index={index} onChange={direction => setIndex(value => (value + direction + socials.length) % socials.length)} /></Screen>
    </group>
    <DeviceLabel {...device} position={[0, 1.07, -0.78]} />
  </group>;
}

function Plant({ position, scale = 1 }: { position: Vector; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.15, 0]} castShadow receiveShadow><cylinderGeometry args={[0.18, 0.13, 0.3, 32]} /><meshStandardMaterial color="#eebc70" roughness={0.8} /></mesh>
    <mesh position={[0, 0.298, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.166, 0.018, 10, 32]} /><meshStandardMaterial color="#d89e59" roughness={0.8} /></mesh>
    <mesh position={[0, 0.295, 0]}><cylinderGeometry args={[0.155, 0.155, 0.012, 32]} /><meshStandardMaterial color="#594a3a" roughness={1} /></mesh>
    {([[-0.14, 0.64, 0.025], [0.15, 0.69, -0.035], [0, 0.79, -0.04], [-0.17, 0.45, 0.085], [0.16, 0.48, 0.07]] as Vector[]).map((tip, i) => {
      const start = new THREE.Vector3(0, 0.292, 0);
      const end = new THREE.Vector3(...tip);
      const direction = end.clone().sub(start);
      const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
      return <group key={i}>
        <mesh position={start.clone().add(end).multiplyScalar(0.5)} quaternion={orientation} castShadow><cylinderGeometry args={[0.008, 0.012, direction.length(), 8]} /><meshStandardMaterial color="#447957" roughness={0.9} /></mesh>
        <mesh position={tip} quaternion={orientation} scale={[0.085, 0.16, 0.035]} castShadow><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={i % 2 ? '#408064' : '#76a86a'} roughness={0.8} /></mesh>
      </group>;
    })}
  </group>;
}

function Bookshelf() {
  const surfaceY = 0.065;
  return <group position={[-3.43, 2.8, -2.87]}>
    <Box size={[2.45, 0.13, 0.49]} color="#e8c6b2" />
    {['#df7994', '#799ac1', '#e8b65e', '#79bfa2'].map((color, i) => {
      const height = 0.56 + i % 2 * 0.13;
      return <group key={color} position={[-0.79 + i * 0.28, surfaceY, 0.03]}>
        <Box size={[0.19, height - 0.024, 0.27]} position={[0, height / 2, 0]} color="#f1eadb" radius={0.004} />
        {[-0.104, 0.104].map(x => <Box key={x} size={[0.014, height, 0.31]} position={[x, height / 2, 0]} color={color} radius={0.004} />)}
        <Box size={[0.214, height, 0.022]} position={[0, height / 2, 0.145]} color={color} radius={0.008} />
        {[0.07, height - 0.07].map(y => <Box key={y} size={[0.15, 0.014, 0.004]} position={[0, y, 0.159]} color="#f4dfb2" radius={0.001} />)}
        <Box size={[0.065, 0.15, 0.004]} position={[0, height * 0.54, 0.159]} color="#f1eadb" radius={0.001} />
      </group>;
    })}
    <Plant position={[0.75, surfaceY, 0.04]} scale={0.8} />
  </group>;
}

function Room() {
  return <>
    <mesh position={[0, -1.5, 0]} receiveShadow><boxGeometry args={[20, 0.1, 20]} /><meshStandardMaterial color="#777b87" /></mesh>
    {Array.from({ length: 12 }, (_, row) => Array.from({ length: 12 }, (_, col) => <mesh key={`${row}-${col}`} position={[col * 1.25 - 7.5, -1.439, row * 1.25 - 6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[1.25, 1.25]} /><meshStandardMaterial color={(row + col) % 2 ? '#afc9ba' : '#d9e7d9'} /></mesh>))}
    <Box size={[16, 8, 0.12]} position={[0, 2.5, -3.25]} color="#c5b6ce" radius={0.01} />
    <Box size={[0.12, 8, 13]} position={[-6, 2.5, 2.9]} color="#b6cbc8" radius={0.01} />
    <Box size={[16, 0.18, 0.08]} position={[0, -0.95, -3.14]} color="#8c839f" radius={0.01} />
    <Box size={[9.8, 0.18, 4.3]} position={[0, -0.06, 0.2]} color="#f2bf8f" radius={0.08} />
    <Box size={[9.62, 0.055, 4.12]} position={[0, 0.045, 0.2]} color="#ffce9d" radius={0.07} />
    {[-4.3, 4.3].map(x => <Box key={x} size={[0.16, 1.4, 0.16]} position={[x, -0.83, 1.65]} color="#b68458" />)}
    <Box size={[2.4, 0.11, 1.66]} position={[3.15, 0.89, -1.15]} color="#c99c88" />
    {[2.16, 4.14].map(x => <Box key={x} size={[0.11, 0.84, 1.48]} position={[x, 0.48, -1.15]} color="#c99c88" radius={0.02} />)}
    <Box size={[2.9, 0.028, 1.22]} position={[-0.3, 0.09, 1.12]} color="#b18ed1" radius={0.05} />
    <Bookshelf />
    <Box size={[1.7, 1.22, 0.08]} position={[2.88, 2.9, -3.12]} color="#ffe2a8" radius={0.02} />
    <Box size={[1.57, 1.08, 0.015]} position={[2.88, 2.9, -3.065]} color="#e27f79" radius={0.01} />
    {[0, 1, 2, 3, 4].map(i => <Box key={i} size={[0.92 - i * 0.1, 0.044, 0.016]} position={[2.88, 3.13 - i * 0.12, -3.049]} color={i % 2 ? '#ffc789' : '#f8ddb4'} radius={0.005} />)}
    <Box size={[0.46, 0.3, 0.66]} position={[1.65, 0.3, -1.12]} color="#ffc879" radius={0.04} />
    {[0, 1, 2, 3].map(i => <Box key={i} size={[0.019, 0.19, 0.012]} position={[1.49 + i * 0.1, 0.33, -0.78]} color="#bc8549" radius={0.006} />)}
  </>;
}

function SceneContent(props: SceneProps) {
  return <>
    <color attach="background" args={['#c4b7cc']} />
    <ambientLight intensity={1.05} />
    <hemisphereLight args={['#fff4d9', '#866da3', 1.15]} />
    <directionalLight castShadow intensity={2.7} position={[-3, 7, 5]} color="#fff0d4" shadow-mapSize={[1024, 1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-normalBias={0.03} />
    <pointLight position={[4, 4, 1]} color="#ffb0b9" intensity={12} />
    <CameraRig activeMode={props.activeMode} />
    <Room />
    <Computer {...props} />
    <Keyboard {...props} />
    <Nintendo3DS {...props} />
    <CassettePlayer {...props} />
    <Turntable {...props} />
  </>;
}

export function RetroDeskScene(props: SceneProps) {
  return <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 4, 10], fov: 42, near: 0.1, far: 80 }} gl={{ antialias: true, powerPreference: 'high-performance' }}><Suspense fallback={null}><SceneContent {...props} /></Suspense></Canvas>;
}
