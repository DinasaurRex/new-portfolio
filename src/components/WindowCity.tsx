import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

type Vector = [number, number, number];
type CityPart = { position: Vector; size: Vector; color: string; yaw?: number };
const groundY = -38;

function createCity() {
  let seed = 217;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const buildings: CityPart[] = [];
  const windows: CityPart[] = [];
  const palette = ['#48445c', '#55536d', '#5f5874', '#6c617d', '#494e66'];
  for (const [count, spacing, distance, minimumHeight, heightRange] of [[39, 4, 16, 4, 6], [55, 5, 40, 8, 9], [81, 6, 90, 12, 8]]) {
    for (let i = 0; i < count; i++) {
      const x = (i - (count - 1) / 2) * spacing + (random() - 0.5) * 1.4;
      const z = -distance - random() * 7;
      const width = spacing * (0.5 + random() * 0.22);
      const depth = 2.4 + random() * 3.8;
      const height = minimumHeight + random() * heightRange;
      const color = palette[Math.floor(random() * palette.length)];
      buildings.push({ position: [x, groundY + height / 2, z], size: [width, height, depth], color });
      buildings.push({ position: [x, groundY + height + 0.15, z], size: [width + 0.18, 0.3, depth + 0.18], color: '#80718b' });
      if (random() > 0.45) {
        const rooftopHeight = 0.7 + random() * 2;
        buildings.push({ position: [x, groundY + height + rooftopHeight / 2, z], size: [width * 0.55, rooftopHeight, depth * 0.55], color });
        if (height > 18) buildings.push({ position: [x, groundY + height + rooftopHeight + 0.8, z], size: [0.08, 1.6, 0.08], color: '#9890a5' });
      }
      const rows = Math.floor((height - 1) / 1.15);
      const columns = Math.max(2, Math.floor(width / 0.85));
      for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
        const y = groundY + 0.8 + row * 1.15;
        const lit = random() > 0.5;
        windows.push({
          position: [x - width / 2 + (column + 0.5) * width / columns, y, z + depth / 2 + 0.012],
          size: [0.27, 0.46, 1],
          color: lit ? (random() > 0.3 ? '#ffd0a2' : '#f7a9ad') : '#333a54',
        });
      }
      for (const side of [-1, 1]) {
        const sideColumns = Math.max(2, Math.floor(depth / 0.9));
        for (let row = 0; row < rows; row++) for (let column = 0; column < sideColumns; column++) {
          windows.push({
            position: [x + side * (width / 2 + 0.012), groundY + 0.8 + row * 1.15, z - depth / 2 + (column + 0.5) * depth / sideColumns],
            size: [0.27, 0.46, 1], yaw: side * Math.PI / 2,
            color: random() > 0.6 ? '#f6c69e' : '#343b54',
          });
        }
      }
    }
  }
  return { buildings, windows };
}

function CityInstances({ parts, facade = false, night }: { parts: CityPart[]; facade?: boolean; night: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => {
    if (facade) return new THREE.PlaneGeometry(1, 1);
    const box = new THREE.BoxGeometry(1, 1, 1);
    const colors = [];
    // Face shading remains consistent with the sunset, independent of indoor lights.
    for (const shade of [0.65, 0.85, 1, 0.45, 0.9, 0.6]) {
      for (let vertex = 0; vertex < 4; vertex++) colors.push(shade, shade, shade);
    }
    box.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return box;
  }, [facade]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const transform = new THREE.Object3D();
    const color = new THREE.Color();
    parts.forEach((part, index) => {
      transform.position.set(...part.position);
      transform.scale.set(...part.size);
      transform.rotation.set(0, part.yaw ?? 0, 0);
      transform.updateMatrix();
      mesh.current!.setMatrixAt(index, transform.matrix);
      mesh.current!.setColorAt(index, color.set(part.color));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [parts]);
  return <instancedMesh name={facade ? 'city-window-lights' : 'city-buildings'} ref={mesh} args={[geometry, undefined, parts.length]}>
    <meshBasicMaterial color={night && !facade ? '#7782b0' : '#ffffff'} vertexColors={!facade} toneMapped={false} />
  </instancedMesh>;
}

function SunsetSky({ night }: { night: boolean }) {
  const uniforms = useMemo(() => ({
    apricot: { value: new THREE.Color(night ? '#705995' : '#ffc185') },
    coral: { value: new THREE.Color(night ? '#493a79' : '#f99591') },
    pink: { value: new THREE.Color(night ? '#30305e' : '#e699bb') },
    blue: { value: new THREE.Color(night ? '#18253f' : '#8295c8') },
  }), [night]);
  return <mesh position={[0, 0, -180]}>
    <planeGeometry args={[2000, 1000]} />
    <shaderMaterial uniforms={uniforms} toneMapped={false} vertexShader={`
      varying float skyHeight;
      void main() {
        skyHeight = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `} fragmentShader={`
      uniform vec3 apricot;
      uniform vec3 coral;
      uniform vec3 pink;
      uniform vec3 blue;
      varying float skyHeight;
      void main() {
        vec3 color = mix(apricot, coral, smoothstep(-50.0, -25.0, skyHeight));
        color = mix(color, pink, smoothstep(-25.0, -4.0, skyHeight));
        color = mix(color, blue, smoothstep(-4.0, 22.0, skyHeight));
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `} />
  </mesh>;
}

export function WindowCity({ night }: { night: boolean }) {
  const city = useMemo(createCity, []);
  return <group name="window-city">
    <SunsetSky night={night} />
    {night && <mesh position={[-115, -6, -130]}><sphereGeometry args={[1.6, 24, 16]} /><meshBasicMaterial color="#fff5dc" toneMapped={false} /></mesh>}
    <mesh position={[0, groundY - 0.1, -70]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[500, 140]} /><meshBasicMaterial color={night ? '#1e2339' : '#42455c'} toneMapped={false} />
    </mesh>
    <CityInstances parts={city.buildings} night={night} />
    <CityInstances parts={city.windows} facade night={night} />
    {[-23, -49].map(z => <group key={z}>
      <mesh position={[0, groundY + 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[300, 2.2]} /><meshBasicMaterial color="#2b3045" /></mesh>
      {Array.from({ length: 50 }, (_, i) => <mesh key={i} position={[-147 + i * 6, groundY + 0.035, z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.8, 0.06]} /><meshBasicMaterial color="#ddb29b" toneMapped={false} /></mesh>)}
    </group>)}
    {Array.from({ length: 17 }, (_, i) => <group key={i} position={[-110 + i * 14, -14 + (i % 4) * 3, -100 - (i % 3) * 15]}>
      {[-1, 0, 1].map((part, j) => <mesh key={part} position={[part * 2.4, j === 1 ? 0.15 : 0, 0]} scale={[4.5, 0.3 + j * 0.1, 1.2]}>
        <icosahedronGeometry args={[1, 2]} /><meshBasicMaterial color={night ? (i % 2 ? '#41466d' : '#505275') : (i % 2 ? '#b87fa5' : '#e2a2b7')} toneMapped={false} />
      </mesh>)}
    </group>)}
  </group>;
}
