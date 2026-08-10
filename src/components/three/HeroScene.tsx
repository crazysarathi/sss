/**
 * HeroScene — the cinematic 3D layer floating behind the hero copy.
 *
 * A cream pickleball drifts right-of-center (centered high on touch
 * devices), ringed by ambient royal-blue dust and two faint paddle
 * silhouettes far behind. The rig leans toward the pointer, and the
 * hero's scrubbed ScrollTrigger feeds progress in through a shared
 * ref: the ball lifts away and the camera pushes in as you scroll.
 *
 * Lazy-loaded by HeroSection; renders nothing network-fetched.
 */
import { useEffect, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  BrandLights,
  FloatGroup,
  Paddle,
  ParticleField,
  Pickleball,
} from "@/components/three/models";
import { useInViewport } from "@/hooks/useInViewport";
import { useIsCoarsePointer } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface HeroSceneProps {
  /** 0 → 1 scroll progress of the hero, written by HeroSection's ScrollTrigger. */
  scrollProgress: MutableRefObject<number>;
}

interface HeroRigProps extends HeroSceneProps {
  coarse: boolean;
  reduced: boolean;
}

const BASE_CAMERA_Z = 7;
const CAMERA_PUSH = 1.2; // 7 → 5.8 across the hero scroll
const BALL_LIFT = 2.5;
const POINTER_YAW = 0.12;
const POINTER_PITCH = 0.07;

function HeroRig({ scrollProgress, coarse, reduced }: HeroRigProps) {
  const rigRef = useRef<THREE.Group>(null);
  const ballRef = useRef<THREE.Group>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  const ballPos: [number, number, number] = coarse ? [0, 1.7, -1.4] : [2.75, -0.2, -0.7];
  const ballScale = coarse ? 0.7 : 0.95;

  // Window-level pointer tracking: the canvas sits behind the hero copy
  // (pointer-events: none), so R3F's own pointer state never updates.
  useEffect(() => {
    if (reduced || coarse) return;
    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, coarse]);

  useFrame((state, delta) => {
    if (reduced) return;
    const rig = rigRef.current;
    const ball = ballRef.current;
    if (!rig || !ball) return;

    const progress = scrollProgress.current;
    const pointer = pointerRef.current;

    // Mouse parallax — the whole rig leans gently toward the cursor.
    rig.rotation.y = THREE.MathUtils.damp(rig.rotation.y, pointer.x * POINTER_YAW, 3.2, delta);
    rig.rotation.x = THREE.MathUtils.damp(rig.rotation.x, pointer.y * POINTER_PITCH, 3.2, delta);

    // Baseline spin + scroll-driven lift.
    ball.rotation.y += delta * 0.25;
    ball.position.y = THREE.MathUtils.damp(
      ball.position.y,
      ballPos[1] + progress * BALL_LIFT,
      4,
      delta
    );

    // Camera pushes in as the hero scrolls away.
    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      BASE_CAMERA_Z - progress * CAMERA_PUSH,
      4,
      delta
    );
  });

  return (
    <group ref={rigRef}>
      <group ref={ballRef} position={ballPos} scale={ballScale}>
        {reduced ? (
          <group rotation={[0.3, 0.7, 0]}>
            <Pickleball radius={1.15} />
          </group>
        ) : (
          <FloatGroup amplitude={0.16} rotAmplitude={0.06} speed={0.9}>
            <Pickleball radius={1.15} />
          </FloatGroup>
        )}
      </group>

      {/* Faint paddle silhouettes far behind — depth, not decoration. */}
      {!coarse && (
        <>
          <Paddle scale={0.8} position={[-3.7, -0.5, -4]} rotation={[0.18, 0.55, -0.62]} />
          <Paddle scale={0.62} position={[3.6, 2.3, -4.6]} rotation={[-0.22, -0.7, 0.95]} />
        </>
      )}
    </group>
  );
}

export default function HeroScene({ scrollProgress }: HeroSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInViewport(wrapRef);
  const coarse = useIsCoarsePointer();
  const reduced = usePrefersReducedMotion();

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, BASE_CAMERA_Z], fov: 42 }}
        frameloop={reduced ? "demand" : inView ? "always" : "never"}
      >
        <BrandLights />
        {/* Warm fill so the cream ball doesn't read grey under blue ambient */}
        <pointLight position={[3.4, 1.2, 2.2]} intensity={0.55} color="#ffe9c4" />
        <ParticleField count={coarse ? 140 : 340} />
        <HeroRig scrollProgress={scrollProgress} coarse={coarse} reduced={reduced} />
      </Canvas>
    </div>
  );
}
