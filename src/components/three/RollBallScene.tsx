/**
 * RollBallScene — a tiny transparent canvas holding just the 3D
 * pickleball, lit identically to the hero scene, for BallJourney's
 * scroll-scrubbed zigzag below the fold. The wrapper div is what moves
 * (GSAP transforms); this scene only spins the ball and applies the
 * scrubbed roll angle written into the shared ref by the timeline.
 *
 * Lazy-loaded by BallJourney on desktop only; shares the same models
 * chunk the hero scene already loads, so it costs no extra network.
 */
import { useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BrandLights, Pickleball } from "@/components/three/models";
import { useInViewport } from "@/hooks/useInViewport";

interface RollBallSceneProps {
  /** Scrubbed roll angle (radians), written by BallJourney's timeline. */
  roll: MutableRefObject<{ z: number }>;
}

function RollingBall({ roll }: RollBallSceneProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    // Same idle spin as the hero ball, plus the scroll-driven roll.
    g.rotation.y += delta * 0.25;
    g.rotation.z = roll.current.z;
  });

  return (
    <group ref={ref} rotation={[0.3, 0.7, 0]}>
      <Pickleball radius={1.15} />
    </group>
  );
}

export default function RollBallScene({ roll }: RollBallSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInViewport(wrapRef);

  return (
    <div ref={wrapRef} className="h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 3.2], fov: 42 }}
        frameloop={inView ? "always" : "never"}
      >
        <BrandLights />
        {/* Warm fill so the cream ball doesn't read grey under blue ambient */}
        <pointLight position={[3.4, 1.2, 2.2]} intensity={0.55} color="#ffe9c4" />
        <RollingBall roll={roll} />
      </Canvas>
    </div>
  );
}
