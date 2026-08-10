/**
 * IdentityScene — the 3D stage for the "Every mark has a meaning" section.
 *
 * Four brand vignettes (twin paddles / ball / mountain / S-storm) live at the
 * origin simultaneously; the section's pinned scroll timeline drives which one
 * is "on stage" via refs (no React re-renders on scrub). Groups damp-scale in
 * and out, the active group leans subtly toward the pointer, and the whole rig
 * drifts with continuous scroll progress.
 */
import { useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  BRAND,
  BrandLights,
  Mountain,
  Paddle,
  ParticleField,
  Pickleball,
  SStorm,
} from "@/components/three/models";
import { useIsCoarsePointer } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface IdentitySceneProps {
  /** Index (0–3) of the crest element currently on stage. */
  activeIndexRef: MutableRefObject<number>;
  /** Continuous 0–1 progress of the pinned section timeline. */
  progressRef: MutableRefObject<number>;
  /** Render loop control — the owning section pauses us offscreen. */
  frameloop: "always" | "never";
}

const GROUP_COUNT = 4;
const HIDDEN_SCALE = 0.0001;
const HIDDEN_Y = -0.6;
const DAMP_LAMBDA = 4;

interface CrestRigProps {
  activeIndexRef: MutableRefObject<number>;
  progressRef: MutableRefObject<number>;
  reduced: boolean;
  coarse: boolean;
}

function CrestRig({ activeIndexRef, progressRef, reduced, coarse }: CrestRigProps) {
  const rootRef = useRef<THREE.Group>(null);
  const groupRefs = useRef<Array<THREE.Group | null>>(
    Array.from({ length: GROUP_COUNT }, () => null)
  );
  const paddlesInnerRef = useRef<THREE.Group>(null);
  const ballInnerRef = useRef<THREE.Group>(null);
  const mountainInnerRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const active = activeIndexRef.current;
    const groups = groupRefs.current;

    if (reduced) {
      // Static presentation: snap the active vignette on, everything else off.
      groups.forEach((g, i) => {
        if (!g) return;
        const on = i === active;
        g.scale.setScalar(on ? 1 : HIDDEN_SCALE);
        g.position.y = on ? 0 : HIDDEN_Y;
        g.rotation.set(0, 0, 0);
        g.visible = on;
      });
      if (rootRef.current) rootRef.current.rotation.set(0, 0, 0);
      return;
    }

    const t = state.clock.getElapsedTime();

    groups.forEach((g, i) => {
      if (!g) return;
      const on = i === active;
      const targetScale = on ? 1 : HIDDEN_SCALE;
      const targetY = on ? 0 : HIDDEN_Y;

      const s = THREE.MathUtils.damp(g.scale.x, targetScale, DAMP_LAMBDA, delta);
      g.scale.setScalar(s);
      g.position.y = THREE.MathUtils.damp(g.position.y, targetY, DAMP_LAMBDA, delta);
      g.visible = s > 0.004;

      // The active vignette leans gently toward the pointer.
      const targetRotX = on ? -state.pointer.y * 0.15 : 0;
      const targetRotY = on ? state.pointer.x * 0.15 : 0;
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetRotX, DAMP_LAMBDA, delta);
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRotY, DAMP_LAMBDA, delta);
    });

    // Idle motion per vignette.
    if (paddlesInnerRef.current) {
      paddlesInnerRef.current.rotation.y = Math.sin(t * 0.55) * 0.18;
    }
    if (ballInnerRef.current) {
      ballInnerRef.current.rotation.y += delta * 0.3;
    }
    if (mountainInnerRef.current) {
      mountainInnerRef.current.scale.setScalar(1 + Math.sin(t * 0.9) * 0.035);
    }

    // Whole-rig drift driven by continuous scroll progress.
    const root = rootRef.current;
    if (root) {
      const p = progressRef.current;
      root.rotation.y = THREE.MathUtils.damp(root.rotation.y, (p - 0.5) * 0.35, 3, delta);
      root.position.y = THREE.MathUtils.damp(
        root.position.y,
        Math.sin(p * Math.PI) * 0.12,
        3,
        delta
      );
    }
  });

  return (
    <group ref={rootRef}>
      {/* 01 — Twin Paddles: the classic crest X */}
      <group
        ref={(el: THREE.Group | null) => {
          groupRefs.current[0] = el;
        }}
      >
        <group ref={paddlesInnerRef}>
          <Paddle scale={0.9} rotation={[0, 0, 0.5]} position={[-0.55, 0.35, 0]} />
          <Paddle scale={0.9} rotation={[0, 0, -0.5]} position={[0.55, 0.35, 0.14]} />
        </group>
      </group>

      {/* 02 — The Ball: mid-flight, lime rim glow */}
      <group
        ref={(el: THREE.Group | null) => {
          groupRefs.current[1] = el;
        }}
      >
        <group ref={ballInnerRef}>
          <Pickleball radius={1.25} />
        </group>
        <pointLight position={[1.8, 1.2, 2.2]} intensity={0.6} color={BRAND.lime} />
      </group>

      {/* 03 — The Mountain: Salem's hills, tilted toward camera */}
      <group
        ref={(el: THREE.Group | null) => {
          groupRefs.current[2] = el;
        }}
      >
        <group ref={mountainInnerRef}>
          <Mountain scale={1.15} rotation={[0.28, -0.12, 0]} position={[0, -0.35, 0]} />
        </group>
      </group>

      {/* 04 — The 'S' Storm: glyphs raining on a lone paddle */}
      <group
        ref={(el: THREE.Group | null) => {
          groupRefs.current[3] = el;
        }}
      >
        <SStorm count={coarse ? 45 : 90} spread={3.4} />
        <Paddle scale={0.65} rotation={[0, 0, 0.4]} position={[0, 0.25, 0]} />
      </group>
    </group>
  );
}

export default function IdentityScene({
  activeIndexRef,
  progressRef,
  frameloop,
}: IdentitySceneProps) {
  const coarse = useIsCoarsePointer();
  const reduced = usePrefersReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6.2], fov: 45 }}
      frameloop={frameloop}
    >
      <BrandLights />
      <ParticleField count={coarse ? 60 : 120} spread={7} opacity={0.35} />
      <CrestRig
        activeIndexRef={activeIndexRef}
        progressRef={progressRef}
        reduced={reduced}
        coarse={coarse}
      />
    </Canvas>
  );
}
