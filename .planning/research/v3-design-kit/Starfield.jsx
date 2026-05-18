// Starfield.jsx — 70-star canvas, 30fps
// Mirrors nim-kaleb/app/components/Starfield.tsx

function Starfield() {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const stars = Array.from({length: 70}, () => ({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      size: Math.random()*1.5 + 0.5,
      base: Math.random()*0.2 + 0.1,
      speed: Math.random()*0.001 + 0.0005,
      green: Math.random() > 0.7
    }));
    let raf, last = 0; const interval = 1000/30;
    const draw = (t) => {
      if (t - last > interval) {
        last = t - ((t-last) % interval);
        ctx.fillStyle = '#010810'; ctx.fillRect(0,0,canvas.width,canvas.height);
        stars.forEach(s => {
          const op = s.base + Math.sin(t * s.speed) * 0.15;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
          ctx.fillStyle = s.green ? `rgba(0,255,0,${op*0.4})` : `rgba(255,255,255,${op})`;
          ctx.fill();
        });
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{position:'fixed', inset:0, zIndex:0, background:'#010810'}} />;
}

window.Starfield = Starfield;
