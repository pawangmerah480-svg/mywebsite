import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let t = 0;

    type Particle = {
      x: number; y: number; r: number;
      dx: number; dy: number; opacity: number;
      color: string; pulse: number; pulseSpeed: number;
    };

    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = [
      "rgba(16,185,129,",
      "rgba(16,185,129,",
      "rgba(16,185,129,",
      "rgba(245,158,11,",
      "rgba(6,182,212,",
    ];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2 + 0.3,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.005;

      // Aurora wave 1
      const grad1 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height * 0.6);
      grad1.addColorStop(0, `rgba(16,185,129,${0.04 + 0.02 * Math.sin(t)})`);
      grad1.addColorStop(0.5, `rgba(6,182,212,${0.03 + 0.015 * Math.sin(t + 1)})`);
      grad1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Aurora wave 2 (diagonal)
      const grad2 = ctx.createLinearGradient(canvas.width, 0, 0, canvas.height);
      grad2.addColorStop(0, `rgba(245,158,11,${0.02 + 0.01 * Math.sin(t * 0.7)})`);
      grad2.addColorStop(0.4, `rgba(16,185,129,${0.03 + 0.015 * Math.cos(t * 0.5)})`);
      grad2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Particles
      particles.forEach(p => {
        p.pulse += p.pulseSpeed;
        const pulsedOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `\( {p.color} \){pulsedOpacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 -z-10 aurora-bg" />
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" />
    </>
  );
}