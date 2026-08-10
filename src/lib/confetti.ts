/**
 * Lightweight canvas confetti in the SSS brand palette.
 * Ported from the original site's celebration, self-cleaning.
 */

const COLORS = ["#1b74e0", "#4fa0ff", "#cbe66e", "#e2f59a", "#efeee6", "#0d3f8f"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
}

export function burstConfetti(canvas: HTMLCanvasElement, count = 160): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const parts: Particle[] = [];
  const spawn = (cx: number, cy: number, angleFrom: number, angleTo: number, n: number, speed: number) => {
    for (let i = 0; i < n; i++) {
      const a = angleFrom + Math.random() * (angleTo - angleFrom);
      const v = speed * (0.45 + Math.random());
      parts.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
      });
    }
  };

  // Two cannons from the bottom corners + a centre burst
  spawn(rect.width * 0.12, rect.height * 0.9, -Math.PI * 0.85, -Math.PI * 0.55, count / 3, 13);
  spawn(rect.width * 0.88, rect.height * 0.9, -Math.PI * 0.45, -Math.PI * 0.15, count / 3, 13);
  spawn(rect.width * 0.5, rect.height * 0.45, -Math.PI, 0, count / 3, 9);

  let raf = 0;
  let alive = true;

  const step = () => {
    if (!alive) return;
    ctx.clearRect(0, 0, rect.width, rect.height);
    let active = 0;
    for (const p of parts) {
      p.vy += 0.22;
      p.vx *= 0.992;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.006;
      if (p.life <= 0 || p.y > rect.height + 30) continue;
      active++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (active > 0) {
      raf = requestAnimationFrame(step);
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
  };
  raf = requestAnimationFrame(step);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, rect.width, rect.height);
  };
}
