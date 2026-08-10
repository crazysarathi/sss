/**
 * Procedural 3D brand objects for Salem Super Smashers.
 * Everything is generated at runtime — no external models or textures,
 * so the 3D layer costs zero network requests.
 */
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Dispose prop-passed GL resources on unmount (R3F only auto-disposes JSX-declared ones). */
function useDispose(...resources: Array<{ dispose(): void }>) {
  useEffect(() => {
    return () => resources.forEach((r) => r.dispose());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resources);
}

/* ------------------------------------------------------------------ */
/* Brand palette (mirrors tailwind.config.ts)                          */
/* ------------------------------------------------------------------ */
export const BRAND = {
  night: "#050d1f",
  navy: "#06122b",
  royal: "#1b74e0",
  royalBright: "#4fa0ff",
  royalDeep: "#0d3f8f",
  royalInk: "#0d2a55",
  lime: "#cbe66e",
  limeBright: "#e2f59a",
  ball: "#efeee6",
} as const;

/* ------------------------------------------------------------------ */
/* Pickleball — cream wiffle ball with recessed navy holes             */
/* ------------------------------------------------------------------ */

/** Evenly distributes n points on a sphere (fibonacci lattice). */
function fibonacciSphere(n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
  }
  return pts;
}

interface PickleballProps {
  radius?: number;
  holes?: number;
  /** Extra props forwarded to the group. */
  [key: string]: unknown;
}

export function Pickleball({ radius = 1, holes = 26, ...props }: PickleballProps) {
  const holeData = useMemo(() => {
    return fibonacciSphere(holes).map((dir) => {
      const pos = dir.clone().multiplyScalar(radius * 0.985);
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        dir.clone().normalize()
      );
      return { pos, quat };
    });
  }, [holes, radius]);

  const holeGeom = useMemo(() => new THREE.CircleGeometry(radius * 0.16, 20), [radius]);
  const holeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: BRAND.royalInk,
        roughness: 0.85,
        metalness: 0,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      }),
    []
  );
  useDispose(holeGeom, holeMat);

  return (
    <group {...props}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial color={BRAND.ball} roughness={0.38} metalness={0.05} />
      </mesh>
      {holeData.map(({ pos, quat }, i) => (
        <mesh
          key={i}
          geometry={holeGeom}
          material={holeMat}
          position={pos}
          quaternion={quat}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Paddle — rounded royal-blue face, lime rim, wrapped handle          */
/* ------------------------------------------------------------------ */

function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Canvas texture that rains tiny "S" glyphs across the paddle face. */
function makeSPatternTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = BRAND.royal;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "rgba(13, 63, 143, 0.55)";
  ctx.font = "700 26px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const jitter = (row % 2) * 16;
      ctx.save();
      ctx.translate(col * 32 + 16 + jitter, row * 32 + 16);
      ctx.rotate(-0.12);
      ctx.fillText("S", 0, 0);
      ctx.restore();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

interface PaddleProps {
  scale?: number;
  [key: string]: unknown;
}

export function Paddle({ scale = 1, ...props }: PaddleProps) {
  const faceGeom = useMemo(() => {
    const shape = roundedRectShape(1.5, 1.9, 0.62);
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
      curveSegments: 24,
    });
    geom.center();
    return geom;
  }, []);

  const rimGeom = useMemo(() => {
    const shape = roundedRectShape(1.62, 2.02, 0.68);
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 24,
    });
    geom.center();
    return geom;
  }, []);

  const sTexture = useMemo(() => makeSPatternTexture(), []);
  useDispose(faceGeom, rimGeom, sTexture);

  return (
    <group scale={scale} {...props}>
      {/* lime rim behind the face */}
      <mesh geometry={rimGeom} position={[0, 0, -0.03]}>
        <meshStandardMaterial color={BRAND.lime} roughness={0.4} metalness={0.15} />
      </mesh>
      {/* royal face with the S-storm pattern */}
      <mesh geometry={faceGeom} position={[0, 0, 0.04]} castShadow>
        <meshStandardMaterial
          map={sTexture}
          color="#ffffff"
          roughness={0.45}
          metalness={0.2}
        />
      </mesh>
      {/* throat + handle */}
      <mesh position={[0, -1.18, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.17, 0.5, 12]} />
        <meshStandardMaterial color={BRAND.royalDeep} roughness={0.5} />
      </mesh>
      <mesh position={[0, -1.62, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.5, 6, 12]} />
        <meshStandardMaterial color={BRAND.royalInk} roughness={0.65} />
      </mesh>
      {/* white grip stripes */}
      <mesh position={[0, -1.5, 0]}>
        <torusGeometry args={[0.155, 0.018, 8, 20]} />
        <meshStandardMaterial color={BRAND.ball} roughness={0.6} />
      </mesh>
      <mesh position={[0, -1.68, 0]}>
        <torusGeometry args={[0.155, 0.018, 8, 20]} />
        <meshStandardMaterial color={BRAND.ball} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Mountain — the hills of Salem: layered night ridges with glowing    */
/* ridgelines, like the crest's mountain lit for a night match.        */
/* ------------------------------------------------------------------ */

interface RidgeLayer {
  /** ridge profile as [x, y] pairs, left → right */
  profile: Array<[number, number]>;
  z: number;
  fill: string;
  fillOpacity: number;
  line: string;
  lineOpacity: number;
  driftAmp: number;
  driftSpeed: number;
  driftPhase: number;
}

const RIDGE_BOTTOM = -1.9;

const RIDGE_LAYERS: RidgeLayer[] = [
  {
    // far range — tallest, hazy
    profile: [
      [-3.6, 0.1], [-2.7, 1.25], [-2.0, 0.75], [-1.1, 1.65], [-0.3, 1.0],
      [0.5, 1.9], [1.3, 1.05], [2.1, 1.5], [2.9, 0.7], [3.6, 1.0],
    ],
    z: -1.4, fill: BRAND.royalDeep, fillOpacity: 0.45,
    line: BRAND.royalBright, lineOpacity: 0.4,
    driftAmp: 0.22, driftSpeed: 0.06, driftPhase: 0,
  },
  {
    // middle range
    profile: [
      [-3.6, -0.05], [-2.5, 0.95], [-1.6, 0.4], [-0.7, 1.25], [0.2, 0.55],
      [1.1, 1.4], [2.1, 0.5], [3.0, 0.95], [3.6, 0.35],
    ],
    z: -0.7, fill: BRAND.royalInk, fillOpacity: 0.85,
    line: BRAND.royalBright, lineOpacity: 0.65,
    driftAmp: 0.14, driftSpeed: 0.09, driftPhase: 2.1,
  },
  {
    // near range — darkest, lime ridgeline
    profile: [
      [-3.6, -0.45], [-2.3, 0.55], [-1.3, -0.05], [0.0, 0.9], [0.9, 0.15],
      [2.0, 0.7], [3.6, -0.35],
    ],
    z: 0, fill: "#071630", fillOpacity: 1,
    line: BRAND.lime, lineOpacity: 0.8,
    driftAmp: 0.07, driftSpeed: 0.12, driftPhase: 4.2,
  },
];

interface MountainProps {
  [key: string]: unknown;
}

export function Mountain(props: MountainProps) {
  const layerRefs = useRef<Array<THREE.Group | null>>([]);

  const layers = useMemo(() => {
    return RIDGE_LAYERS.map((layer) => {
      // filled silhouette
      const shape = new THREE.Shape();
      shape.moveTo(layer.profile[0][0], RIDGE_BOTTOM);
      layer.profile.forEach(([x, y]) => shape.lineTo(x, y));
      shape.lineTo(layer.profile[layer.profile.length - 1][0], RIDGE_BOTTOM);
      shape.closePath();
      const fillGeom = new THREE.ShapeGeometry(shape);
      const fillMat = new THREE.MeshBasicMaterial({
        color: layer.fill,
        transparent: true,
        opacity: layer.fillOpacity,
        depthWrite: false,
      });

      // glowing ridgeline along the top edge
      const points = layer.profile.map(([x, y]) => new THREE.Vector3(x, y, 0.001));
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: layer.line,
        transparent: true,
        opacity: layer.lineOpacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(lineGeom, lineMat);

      return { layer, fillGeom, fillMat, lineGeom, lineMat, line };
    });
  }, []);

  useDispose(
    ...layers.flatMap((l) => [l.fillGeom, l.fillMat, l.lineGeom, l.lineMat])
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    layers.forEach(({ layer }, i) => {
      const g = layerRefs.current[i];
      if (!g) return;
      g.position.x = Math.sin(t * layer.driftSpeed + layer.driftPhase) * layer.driftAmp;
    });
  });

  return (
    <group {...props}>
      {layers.map(({ layer, fillGeom, fillMat, line }, i) => (
        <group
          key={i}
          ref={(node) => {
            layerRefs.current[i] = node;
          }}
          position={[0, -0.15, layer.z]}
        >
          <mesh geometry={fillGeom} material={fillMat} />
          <primitive object={line} />
        </group>
      ))}
      {/* lime summit beacon on the near range's tallest peak */}
      <mesh position={[0, 0.78, 0.05]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color={BRAND.lime} />
      </mesh>
      <pointLight position={[0, 1.0, 0.6]} intensity={0.8} color={BRAND.lime} distance={4.5} />
      {/* drifting fireflies over the near slope */}
      <ParticleField
        count={26}
        spread={2.4}
        size={0.05}
        color={BRAND.lime}
        opacity={0.45}
        position={[0, 0.2, -0.3]}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* S-Storm — instanced field of glowing "S" sprites                    */
/* ------------------------------------------------------------------ */

function makeSGlyphTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 104px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S", 64, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 2;
  return tex;
}

interface SStormProps {
  count?: number;
  spread?: number;
  color?: string;
  [key: string]: unknown;
}

export function SStorm({ count = 90, spread = 4, color = BRAND.lime, ...props }: SStormProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const texture = useMemo(() => makeSGlyphTexture(), []);
  useDispose(texture);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        pos: new THREE.Vector3(
          (Math.sin(i * 12.9898) * 0.5) * spread * 2,
          (Math.sin(i * 78.233) * 0.5) * spread * 2,
          (Math.sin(i * 43.758) * 0.5) * spread,
        ),
        rot: Math.sin(i * 91.7) * Math.PI,
        scale: 0.12 + Math.abs(Math.sin(i * 3.3)) * 0.22,
        speed: 0.2 + Math.abs(Math.sin(i * 7.1)) * 0.6,
      })),
    [count, spread]
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    seeds.forEach((s, i) => {
      dummy.position.set(
        s.pos.x + Math.sin(t * s.speed + i) * 0.25,
        s.pos.y + Math.cos(t * s.speed * 0.8 + i * 2) * 0.3,
        s.pos.z
      );
      dummy.rotation.set(0, 0, s.rot + t * s.speed * 0.4);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} {...props}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        color={color}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* ParticleField — ambient drifting dust                               */
/* ------------------------------------------------------------------ */

interface ParticleFieldProps {
  count?: number;
  spread?: number;
  size?: number;
  color?: string;
  opacity?: number;
  [key: string]: unknown;
}

export function ParticleField({
  count = 350,
  spread = 12,
  size = 0.035,
  color = BRAND.royalBright,
  opacity = 0.6,
  ...props
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // deterministic pseudo-random spread
      arr[i * 3] = (Math.sin(i * 12.9898) * 0.5) * spread * 2;
      arr[i * 3 + 1] = (Math.sin(i * 78.233) * 0.5) * spread * 1.2;
      arr[i * 3 + 2] = (Math.sin(i * 43.758) * 0.5) * spread - spread * 0.25;
    }
    return arr;
  }, [count, spread]);

  useFrame(({ clock }) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const t = clock.getElapsedTime();
    pts.rotation.y = t * 0.02;
    pts.position.y = Math.sin(t * 0.15) * 0.3;
  });

  return (
    <points ref={pointsRef} {...props}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* FloatGroup — gentle bobbing/rocking wrapper                         */
/* ------------------------------------------------------------------ */

interface FloatGroupProps {
  children: ReactNode;
  amplitude?: number;
  rotAmplitude?: number;
  speed?: number;
  [key: string]: unknown;
}

export function FloatGroup({
  children,
  amplitude = 0.18,
  rotAmplitude = 0.08,
  speed = 1,
  ...props
}: FloatGroupProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.getElapsedTime() * speed;
    g.position.y = Math.sin(t * 0.8) * amplitude;
    g.rotation.x = Math.sin(t * 0.6) * rotAmplitude;
    g.rotation.z = Math.cos(t * 0.5) * rotAmplitude * 0.6;
  });

  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Standard light rig — consistent look across scenes                  */
/* ------------------------------------------------------------------ */

export function BrandLights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.35 * intensity} color="#8fb4ff" />
      <directionalLight position={[4, 6, 5]} intensity={1.4 * intensity} color="#ffffff" />
      <directionalLight position={[-6, -2, -4]} intensity={0.7 * intensity} color={BRAND.royalBright} />
      <pointLight position={[0, -3, 3]} intensity={0.5 * intensity} color={BRAND.lime} />
    </>
  );
}
