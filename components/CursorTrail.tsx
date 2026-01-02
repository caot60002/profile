import React, { useEffect, useRef } from 'react';

const CursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparklesRef = useRef<Array<{x: number, y: number, size: number, speedX: number, speedY: number, life: number}>>([]);
  const mouseRef = useRef<{x: number, y: number}>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Add new sparkles on move
      for (let i = 0; i < 3; i++) {
        sparklesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 1,
          speedY: (Math.random() - 0.5) * 1,
          life: 1.0
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw sparkles
      for (let i = 0; i < sparklesRef.current.length; i++) {
        const p = sparklesRef.current[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.02; // Fade out speed
        
        if (p.life > 0) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          // Draw a tiny cross/star shape
          ctx.fillRect(p.x, p.y - p.size, 1, p.size * 2);
          ctx.fillRect(p.x - p.size, p.y, p.size * 2, 1);
        } else {
          sparklesRef.current.splice(i, 1);
          i--;
        }
      }
      
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

export default CursorTrail;
