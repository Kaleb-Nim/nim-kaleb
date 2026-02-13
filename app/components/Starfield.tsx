'use client';

import { useEffect, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  hasGreenTint: boolean;
};

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate stars
    const starCount = 70;
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      baseOpacity: Math.random() * 0.2 + 0.1,
      twinkleSpeed: Math.random() * 0.001 + 0.0005,
      hasGreenTint: Math.random() > 0.7, // 30% have green tint
    }));

    // Animation loop (30fps cap)
    const fps = 30;
    const frameInterval = 1000 / fps;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed > frameInterval) {
        lastFrameTimeRef.current = timestamp - (elapsed % frameInterval);

        // Clear canvas
        ctx.fillStyle = '#010810';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars
        starsRef.current.forEach((star) => {
          const opacity = star.baseOpacity + Math.sin(timestamp * star.twinkleSpeed) * 0.15;

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

          if (star.hasGreenTint) {
            ctx.fillStyle = `rgba(0, 255, 0, ${opacity * 0.4})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          }

          ctx.fill();
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ background: '#010810' }}
    />
  );
}
