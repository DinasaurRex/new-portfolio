import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import * as THREE from 'three';
import { hardwareProjects, modeDetails, PortfolioMode, projects, socials } from '../portfolioData';
import { CassetteScreen, ComputerScreen, ContactScreen, ProjectBottomScreen, ProjectTopScreen } from './DeviceScreens';

type SceneProps = { activeMode: PortfolioMode | null; onSelectMode: (mode: PortfolioMode | null) => void };
type DeviceProps = SceneProps & { mode: PortfolioMode };
type Vector = [number, number, number];

const locations: Record<PortfolioMode, Vector> = {
  about: [-0.3, 1.67, -0.3], projects: [-3.0, 0.75, 1.05], hardware: [2.55, 0.62, 1.18], contact: [3.15, 1.42, -0.85],
};

function Box({ size, position = [0, 0, 0], color, radius = 0.05, rotation, metalness = 0.08 }: { size: Vector; position?: Vector; color: string; radius?: number; rotation?: Vector; metalness?: number }) {
  return <RoundedBox args={size} position={position} rotation={rotation} radius={radius} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.58} metalness={metalness} /></RoundedBox>;
}

function DeviceLabel({ mode, position, activeMode, onSelectMode }: DeviceProps & { position: Vector }) {
  const portal = useRef(document.querySelector<HTMLDivElement>('.world-scene'));
  const detail = modeDetails[mode];
  return <Html portal={portal} position={position} center zIndexRange={[110, 100]} style={{ display: activeMode === null ? 'block' : 'none' }}><button className="object-label" style={{ '--object-color': detail.accent } as React.CSSProperties} onClick={() => onSelectMode(mode)}><span className="label-dot" />{detail.label}<span className="label-device">{detail.device}</span></button></Html>;
}

function Screen({ children, mode, activeMode, onSelectMode, position, rotation, factor }: DeviceProps & { children: React.ReactNode; position: Vector; rotation?: Vector; factor: number }) {
  const portal = useRef(document.querySelector<HTMLDivElement>('.world-scene'));
  return <Html portal={portal} transform position={position} rotation={rotation} distanceFactor={factor} zIndexRange={[90, 0]} style={{ display: activeMode === null || activeMode === mode ? 'block' : 'none' }}>
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
    const height = activeMode === 'about' ? 3.4 : activeMode === 'projects' ? 2.3 : activeMode ? 2.3 : 5.4;
    const width = activeMode === 'about' ? 3.7 : activeMode === 'projects' ? 2.65 : activeMode ? 2.75 : 10.4;
    const distance = Math.max(height / (2 * Math.tan(THREE.MathUtils.degToRad(21))), width / (2 * Math.tan(THREE.MathUtils.degToRad(21)) * aspect));
    const slope = activeMode === 'projects' ? 0.5 : activeMode === 'hardware' || activeMode === 'contact' ? 0.72 : activeMode === 'about' ? 0.08 : 0.28;
    const yaw = activeMode === 'projects' ? 0.18 : activeMode === 'hardware' ? -0.2 : activeMode === 'contact' ? -0.17 : 0;
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
  return <group position={[-0.3, 0.08, 1.12]} onClick={event => { event.stopPropagation(); onSelectMode('about'); }}>
    <Box size={[2.45, 0.14, 0.88]} color="#f8c5b7" radius={0.06} />
    {[0, 1, 2, 3].map(row => Array.from({ length: 12 }, (_, col) => <Box key={`${row}-${col}`} size={[0.15, 0.04, 0.13]} position={[-1.05 + col * 0.19, 0.1, -0.27 + row * 0.18]} color={col === 0 ? '#ffa265' : row === 3 ? '#85c8b8' : '#f9e3d0'} radius={0.013} />))}
    <Box size={[0.72, 0.04, 0.13]} position={[0, 0.1, 0.28]} color="#bca3d4" radius={0.015} />
  </group>;
}

function Nintendo3DS(props: SceneProps) {
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
  return <group position={[-3.0, 0.12, 1.05]} rotation={[0, 0.18, 0]} onClick={event => { event.stopPropagation(); props.onSelectMode('projects'); }}>
    <Box size={[2.05, 0.13, 1.12]} color="#e3af48" radius={0.085} />
    <Box size={[1.97, 0.045, 1.06]} position={[0, 0.081, 0]} color="#ffe083" radius={0.045} />
    <group position={[0, 0.14, -0.48]}>
      <Box size={[2.05, 1.19, 0.13]} position={[0, 0.58, 0]} color="#efbd52" radius={0.08} />
      <Box size={[1.75, 0.97, 0.015]} position={[0, 0.57, 0.077]} color="#333d43" radius={0.025} />
      <Screen {...device} position={[0, 0.57, 0.091]} factor={1.47}><ProjectTopScreen project={project} index={index} /></Screen>
      <mesh position={[0, 1.095, 0.075]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.012, 18]} /><meshStandardMaterial color="#354041" /></mesh>
      {[-0.92, 0.92].map(x => [0, 1, 2].map(i => <mesh key={`${x}-${i}`} position={[x, 0.45 + i * 0.09, 0.074]}><sphereGeometry args={[0.015, 8, 8]} /><meshStandardMaterial color="#9d7830" /></mesh>))}
    </group>
    <mesh position={[0, 0.1, -0.48]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.08, 0.08, 1.87, 32]} /><meshStandardMaterial color="#cf9b3c" metalness={0.3} /></mesh>
    <Box size={[1.07, 0.016, 0.74]} position={[0, 0.113, 0.04]} color="#273739" radius={0.02} />
    <Screen {...device} position={[0, 0.13, 0.04]} rotation={[-Math.PI / 2, 0, 0]} factor={1.08}><ProjectBottomScreen project={project} index={index} onChange={change} details={details} onToggleDetails={() => setDetails(value => !value)} /></Screen>
    <Screen {...device} position={[-0.77, 0.12, 0.15]} rotation={[-Math.PI / 2, 0, 0]} factor={1.15}><div className="physical-dpad"><button aria-label="3DS previous project" title="Previous project" onClick={() => change(-1)}><ArrowLeft size={25} /></button><button aria-label="3DS next project" title="Next project" onClick={() => change(1)}><ArrowRight size={25} /></button></div></Screen>
    <Screen {...device} position={[0.76, 0.12, 0.1]} rotation={[-Math.PI / 2, 0, 0]} factor={1.1}><div className="physical-ab"><a aria-label={`3DS open ${project.name}`} href={project.href} target="_blank" rel="noopener noreferrer" title={`Open ${project.name}`}>A</a><button aria-label="3DS project details" title="Project details" onClick={() => setDetails(value => !value)}>B</button></div></Screen>
    <Box size={[0.16, 0.024, 0.045]} position={[0.67, 0.113, 0.47]} color="#bc8c31" radius={0.01} />
    <DeviceLabel {...device} position={[0, 1.6, -0.48]} />
  </group>;
}

function CassettePlayer(props: SceneProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reels = useRef<THREE.Group>(null);
  const device = { ...props, mode: 'hardware' as const };
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useFrame((_, delta) => { if (reels.current && playing && !reducedMotion.current) reels.current.rotation.z += delta * 0.6; });
  return <group position={[2.55, 0.15, 1.12]} rotation={[-0.35, -0.2, 0]} onClick={event => { event.stopPropagation(); props.onSelectMode('hardware'); }}>
    <Box size={[2.2, 1.2, 0.4]} position={[0, 0.48, 0]} color="#ee77a0" radius={0.13} />
    <Box size={[1.87, 0.87, 0.035]} position={[0, 0.49, 0.225]} color="#253f36" radius={0.04} />
    <Screen {...device} position={[0, 0.49, 0.25]} factor={1.42}><CassetteScreen index={index} playing={playing} onChange={direction => setIndex(value => (value + direction + hardwareProjects.length) % hardwareProjects.length)} onTogglePlay={() => setPlaying(value => !value)} /></Screen>
    <group position={[-0.85, -0.06, 0.12]} ref={reels}><mesh><torusGeometry args={[0.063, 0.012, 10, 24]} /><meshStandardMaterial color="#ffd974" /></mesh><Box size={[0.1, 0.018, 0.01]} color="#ffda7a" radius={0.005} /></group>
    <Box size={[0.78, 0.08, 0.25]} position={[0, 1.13, -0.03]} color="#ffc4d7" radius={0.035} />
    <DeviceLabel {...device} position={[0, -0.27, 0.3]} />
  </group>;
}

function Turntable(props: SceneProps) {
  const [index, setIndex] = useState(0);
  const disc = useRef<THREE.Group>(null);
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const device = { ...props, mode: 'contact' as const };
  useFrame((_, delta) => { if (disc.current && !reducedMotion.current) disc.current.rotation.y += delta * 0.45; });
  return <group position={[3.15, 1.11, -1.15]} rotation={[0, -0.17, 0]} onClick={event => { event.stopPropagation(); props.onSelectMode('contact'); }}>
    <Box size={[2.15, 0.28, 1.5]} color="#988bd0" radius={0.08} />
    <group position={[-0.26, 0.19, -0.1]} ref={disc}>
      <mesh castShadow><cylinderGeometry args={[0.58, 0.58, 0.045, 64]} /><meshStandardMaterial color="#252337" roughness={0.44} metalness={0.25} /></mesh>
      {[0.28, 0.38, 0.48, 0.55].map(r => <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}><torusGeometry args={[r, 0.003, 8, 64]} /><meshStandardMaterial color="#655b7e" /></mesh>)}
      <mesh><cylinderGeometry args={[0.16, 0.16, 0.056, 32]} /><meshStandardMaterial color="#ffb575" /></mesh>
      <Box size={[0.15, 0.013, 0.025]} position={[0, 0.04, 0]} color="#56365d" radius={0.006} />
    </group>
    <Box size={[0.055, 0.045, 0.85]} position={[0.69, 0.24, -0.14]} color="#d6c8e8" rotation={[0, -0.25, 0]} radius={0.01} metalness={0.6} />
    <Box size={[1.96, 0.69, 0.12]} position={[0, 0.32, 0.74]} rotation={[-0.5, 0, 0]} color="#7660a6" radius={0.04} />
    <Screen {...device} position={[0, 0.35, 0.807]} rotation={[-0.5, 0, 0]} factor={1.54}><ContactScreen index={index} onChange={direction => setIndex(value => (value + direction + socials.length) % socials.length)} /></Screen>
    <DeviceLabel {...device} position={[0, 1.18, -0.08]} />
  </group>;
}

function Plant({ position, scale = 1 }: { position: Vector; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh castShadow><cylinderGeometry args={[0.18, 0.13, 0.33, 24]} /><meshStandardMaterial color="#ffb763" /></mesh>
    {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[Math.sin(i * 2) * 0.15, 0.26 + i % 3 * 0.1, Math.cos(i * 2) * 0.12]} rotation={[i * 0.22, i, 0.4]} scale={[0.07, 0.22, 0.09]} castShadow><sphereGeometry args={[1, 12, 12]} /><meshStandardMaterial color={i % 2 ? '#387b57' : '#8fbb63'} /></mesh>)}
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
    <Plant position={[-4.25, 0.28, -1.16]} scale={1.35} />
    <Box size={[2.45, 0.13, 0.49]} position={[-3.43, 2.8, -2.87]} color="#e8c6b2" />
    {['#df7994', '#799ac1', '#e8b65e', '#79bfa2'].map((color, i) => <Box key={color} size={[0.22, 0.56 + i % 2 * 0.13, 0.31]} position={[-4.22 + i * 0.28, 3.13, -2.84]} color={color} radius={0.014} />)}
    <Plant position={[-2.68, 3.0, -2.83]} scale={0.8} />
    <Box size={[1.7, 1.22, 0.08]} position={[2.88, 2.9, -3.12]} color="#ffe2a8" radius={0.02} />
    <Box size={[1.57, 1.08, 0.015]} position={[2.88, 2.9, -3.065]} color="#e27f79" radius={0.01} />
    {[0, 1, 2, 3, 4].map(i => <Box key={i} size={[0.92 - i * 0.1, 0.044, 0.016]} position={[2.88, 3.13 - i * 0.12, -3.049]} color={i % 2 ? '#ffc789' : '#f8ddb4'} radius={0.005} />)}
    <group position={[4.51, 0.35, -1.36]}>
      <mesh castShadow><cylinderGeometry args={[0.2, 0.16, 0.48, 24]} /><meshStandardMaterial color="#71c2c5" /></mesh>
      {[0, 1, 2].map(i => <mesh key={i} position={[-0.1 + i * 0.09, 0.41, 0]} rotation={[0, 0, -0.16 + i * 0.16]} castShadow><cylinderGeometry args={[0.022, 0.022, 0.55, 10]} /><meshStandardMaterial color={['#ffa371', '#eec857', '#bf81bd'][i]} /></mesh>)}
    </group>
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
