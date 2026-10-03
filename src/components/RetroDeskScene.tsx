import { useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { modeDetails, PortfolioMode } from '../portfolioData';

type RetroDeskSceneProps = {
  activeMode: PortfolioMode;
  onSelectMode: (mode: PortfolioMode) => void;
};

type ClickableProps = {
  children: React.ReactNode;
  mode: PortfolioMode;
  onSelectMode: (mode: PortfolioMode) => void;
};

function setCursor(cursor: string) {
  document.body.style.cursor = cursor;
}

function Clickable({ children, mode, onSelectMode }: ClickableProps) {
  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        onSelectMode(mode);
      }}
      onPointerOut={() => setCursor('auto')}
      onPointerOver={(event) => {
        event.stopPropagation();
        setCursor('pointer');
      }}
    >
      {children}
    </group>
  );
}

function useScreenTexture(activeMode: PortfolioMode) {
  return useMemo(() => {
    const detail = modeDetails[activeMode];
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a1118');
    gradient.addColorStop(0.62, '#101f27');
    gradient.addColorStop(1, '#071014');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = detail.accent;
    ctx.globalAlpha = 0.11;
    for (let y = 0; y < canvas.height; y += 24) {
      ctx.fillRect(0, y, canvas.width, 3);
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = detail.accent;
    ctx.lineWidth = 8;
    ctx.strokeRect(44, 44, canvas.width - 88, canvas.height - 88);

    ctx.font = '700 76px "Courier New", monospace';
    ctx.fillStyle = '#f4fbff';
    ctx.fillText(detail.screenLines[0], 86, 172);

    ctx.font = '600 48px "Courier New", monospace';
    detail.screenLines.slice(1).forEach((line, index) => {
      ctx.fillStyle = index === 0 ? detail.accent : '#b8f6ff';
      ctx.fillText(`> ${line}`, 92, 294 + index * 86);
    });

    ctx.font = '500 28px "Courier New", monospace';
    ctx.fillStyle = '#8aa5ac';
    ctx.fillText('CLICK THE DESK OBJECTS TO SWITCH CHANNELS', 86, 560);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, [activeMode]);
}

function Monitor({
  activeMode,
  onSelectMode,
}: {
  activeMode: PortfolioMode;
  onSelectMode: (mode: PortfolioMode) => void;
}) {
  const texture = useScreenTexture(activeMode);
  const accent = modeDetails[activeMode].accent;

  return (
    <group position={[0, 1.25, 0]}>
      <RoundedBox args={[2.95, 2.05, 0.52]} radius={0.14} smoothness={6}>
        <meshStandardMaterial color="#b8bbb0" roughness={0.74} />
      </RoundedBox>
      <RoundedBox args={[2.43, 1.46, 0.07]} position={[0, 0.12, 0.3]} radius={0.08}>
        <meshStandardMaterial color="#273234" roughness={0.9} />
      </RoundedBox>
      <Clickable mode="projects" onSelectMode={onSelectMode}>
        <mesh position={[0, 0.12, 0.342]}>
          <planeGeometry args={[2.22, 1.25]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={accent}
            emissiveIntensity={0.2}
            map={texture ?? undefined}
            roughness={0.35}
            toneMapped={false}
          />
        </mesh>
      </Clickable>
      <RoundedBox args={[1.05, 0.28, 0.62]} position={[0, -1.2, -0.04]} radius={0.06}>
        <meshStandardMaterial color="#a4a69d" roughness={0.78} />
      </RoundedBox>
      <RoundedBox args={[1.8, 0.18, 0.98]} position={[0, -1.5, 0]} radius={0.07}>
        <meshStandardMaterial color="#7e8078" roughness={0.8} />
      </RoundedBox>
      <mesh position={[1.22, -0.72, 0.33]}>
        <cylinderGeometry args={[0.065, 0.065, 0.025, 32]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function Keyboard({ onSelectMode }: { onSelectMode: (mode: PortfolioMode) => void }) {
  const rows = [
    { z: -0.02, count: 12, width: 0.13 },
    { z: 0.17, count: 11, width: 0.14 },
    { z: 0.36, count: 10, width: 0.15 },
  ];

  return (
    <Clickable mode="about" onSelectMode={onSelectMode}>
      <group position={[-0.1, 0.14, 1.55]} rotation={[-0.05, 0, 0]}>
        <RoundedBox args={[2.4, 0.16, 0.84]} radius={0.08}>
          <meshStandardMaterial color="#d7d1c0" roughness={0.86} />
        </RoundedBox>
        {rows.map((row, rowIndex) =>
          Array.from({ length: row.count }).map((_, keyIndex) => (
            <RoundedBox
              args={[row.width, 0.045, 0.105]}
              key={`${rowIndex}-${keyIndex}`}
              position={[
                (keyIndex - row.count / 2) * 0.18 + 0.09,
                0.1,
                row.z,
              ]}
              radius={0.015}
            >
              <meshStandardMaterial color={rowIndex === 1 ? '#ebe4d4' : '#c6c0b1'} />
            </RoundedBox>
          )),
        )}
        <RoundedBox args={[1.05, 0.045, 0.105]} position={[0, 0.1, 0.55]} radius={0.015}>
          <meshStandardMaterial color="#b8b1a2" />
        </RoundedBox>
      </group>
    </Clickable>
  );
}

function Cassette({
  activeMode,
  onSelectMode,
}: {
  activeMode: PortfolioMode;
  onSelectMode: (mode: PortfolioMode) => void;
}) {
  const leftReel = useRef<THREE.Mesh>(null);
  const rightReel = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const spin = state.clock.elapsedTime * 1.65;
    if (leftReel.current) {
      leftReel.current.rotation.z = spin;
    }
    if (rightReel.current) {
      rightReel.current.rotation.z = -spin;
    }
  });

  return (
    <Clickable mode="hardware" onSelectMode={onSelectMode}>
      <group position={[1.92, 0.2, 1.07]} rotation={[0, -0.27, 0]}>
        <RoundedBox args={[1.16, 0.18, 0.72]} radius={0.08}>
          <meshStandardMaterial color="#272325" roughness={0.72} />
        </RoundedBox>
        <RoundedBox args={[0.88, 0.03, 0.32]} position={[0, 0.1, 0]} radius={0.045}>
          <meshStandardMaterial color="#f5ede0" roughness={0.6} />
        </RoundedBox>
        {[-0.28, 0.28].map((x, index) => (
          <mesh
            key={x}
            position={[x, 0.13, 0]}
            ref={index === 0 ? leftReel : rightReel}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.13, 0.018, 12, 36]} />
            <meshStandardMaterial
              color={activeMode === 'hardware' ? '#a3e635' : '#94a3a5'}
              emissive={activeMode === 'hardware' ? '#608f1a' : '#000000'}
              emissiveIntensity={0.25}
            />
          </mesh>
        ))}
        <RoundedBox args={[0.4, 0.035, 0.09]} position={[0, 0.13, -0.22]} radius={0.018}>
          <meshStandardMaterial color="#f97316" emissive="#5f2103" emissiveIntensity={0.16} />
        </RoundedBox>
      </group>
    </Clickable>
  );
}

function DiskStack({ onSelectMode }: { onSelectMode: (mode: PortfolioMode) => void }) {
  return (
    <Clickable mode="contact" onSelectMode={onSelectMode}>
      <group position={[-1.95, 0.22, 1.08]} rotation={[0, 0.34, 0]}>
        {[0, 0.08, 0.16].map((height, index) => (
          <RoundedBox
            args={[0.74, 0.08, 0.74]}
            key={height}
            position={[0, height, 0]}
            radius={0.035}
          >
            <meshStandardMaterial color={index === 2 ? '#86efac' : '#cdd2cf'} roughness={0.68} />
          </RoundedBox>
        ))}
        <RoundedBox args={[0.46, 0.02, 0.16]} position={[0, 0.23, -0.16]} radius={0.012}>
          <meshStandardMaterial color="#1e293b" />
        </RoundedBox>
      </group>
    </Clickable>
  );
}

function DeskSceneContent({
  activeMode,
  onSelectMode,
}: {
  activeMode: PortfolioMode;
  onSelectMode: (mode: PortfolioMode) => void;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.32) * 0.055;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2.85, 6.2]} fov={42} />
      <color attach="background" args={['#111514']} />
      <ambientLight intensity={0.55} />
      <directionalLight color="#fff6e8" intensity={2.2} position={[3.5, 5.5, 4.5]} />
      <pointLight color={modeDetails[activeMode].accent} intensity={2.3} position={[-2.3, 1.5, 2]} />
      <Environment preset="city" />
      <Float floatIntensity={0.25} rotationIntensity={0.12} speed={1.2}>
        <group ref={group}>
          <mesh position={[0, -0.02, 0.36]} receiveShadow>
            <boxGeometry args={[5.3, 0.16, 3.15]} />
            <meshStandardMaterial color="#514337" roughness={0.82} />
          </mesh>
          <Monitor activeMode={activeMode} onSelectMode={onSelectMode} />
          <Keyboard onSelectMode={onSelectMode} />
          <Cassette activeMode={activeMode} onSelectMode={onSelectMode} />
          <DiskStack onSelectMode={onSelectMode} />
          <mesh position={[2.45, 0.37, -0.78]} rotation={[0.16, 0.2, -0.12]}>
            <cylinderGeometry args={[0.14, 0.14, 0.82, 32]} />
            <meshStandardMaterial color="#67e8f9" roughness={0.42} metalness={0.2} />
          </mesh>
          <mesh position={[-2.42, 0.38, -0.58]} rotation={[0.18, 0.3, 0.08]}>
            <torusGeometry args={[0.25, 0.035, 16, 40]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.48} />
          </mesh>
        </group>
      </Float>
      <ContactShadows blur={2.2} far={8} opacity={0.46} position={[0, -0.18, 0]} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2.12}
        minPolarAngle={Math.PI / 3.15}
      />
    </>
  );
}

export function RetroDeskScene({
  activeMode,
  onSelectMode,
}: RetroDeskSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <DeskSceneContent activeMode={activeMode} onSelectMode={onSelectMode} />
    </Canvas>
  );
}
