'use client';
import { useEffect, useRef } from 'react';

/**
 * Streamlines drifting through a slowly changing vector field: a quiet nod to hydraulic
 * modelling. Canvas 2D only, paused whenever it is off screen, skipped for reduced motion.
 */
export default function FlowField({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0, frame = 0, visible = false;
    let particles: { x: number; y: number; life: number; hue: number }[] = [];
    const pointer = { x: -9999, y: -9999 };

    const spawn = () => ({ x: Math.random() * w, y: Math.random() * h, life: 60 + Math.random() * 220, hue: Math.random() });
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      w = box.width; h = box.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(900, (w * h) / 2600) * density);
      particles = Array.from({ length: count }, spawn);
    };

    const angle = (x: number, y: number, t: number) =>
      (Math.sin(x * 0.0017 + t * 0.00011) + Math.cos(y * 0.0023 - t * 0.00009) + Math.sin((x + y) * 0.0011 + t * 0.00007)) * 1.3;

    const draw = (t: number) => {
      frame = requestAnimationFrame(draw);
      if (!visible || document.hidden) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.045)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 1;
      for (const p of particles) {
        let a = angle(p.x, p.y, t);
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < 48000) a += (1 - d2 / 48000) * 1.6;
        const nx = p.x + Math.cos(a) * 1.5, ny = p.y + Math.sin(a) * 1.5;
        ctx.strokeStyle = p.hue > 0.82 ? 'rgba(200,244,96,0.55)' : 'rgba(236,230,214,0.22)';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
        p.x = nx; p.y = ny; p.life -= 1;
        if (p.life < 0 || nx < -10 || nx > w + 10 || ny < -10 || ny > h + 10) Object.assign(p, spawn());
      }
    };

    const move = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = e.clientX - box.left; pointer.y = e.clientY - box.top;
    };
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '100px' });
    const ro = new ResizeObserver(resize);
    resize(); io.observe(canvas); ro.observe(canvas);
    window.addEventListener('pointermove', move, { passive: true });
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); io.disconnect(); ro.disconnect(); window.removeEventListener('pointermove', move); };
  }, [density]);

  return <canvas ref={ref} className="k-flow" aria-hidden="true" />;
}
