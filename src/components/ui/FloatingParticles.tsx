import { useEffect, useRef } from "react";

import { runWithTimeSlicing } from "@/utils/taskScheduler";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface FloatingParticlesProps {
  particleCount?: number;
  className?: string;
}

export default function FloatingParticles({
  particleCount = 50,
  className = "",
}: FloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastWidth = 0;
    let lastHeight = 0;

    // Optimized canvas resize with debouncing
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Only resize if dimensions actually changed
      if (width === lastWidth && height === lastHeight) return;

      lastWidth = width;
      lastHeight = height;

      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    };

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const colors = [
        "rgba(255, 255, 255, 0.1)",
        "rgba(255, 255, 255, 0.15)",
        "rgba(147, 197, 253, 0.1)", // blue-300
        "rgba(196, 181, 253, 0.1)", // purple-300
        "rgba(253, 186, 116, 0.1)", // orange-300
      ];

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * lastWidth,
          y: Math.random() * lastHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    // Optimized animation loop with reduced reflows
    const animate = async () => {
      // Use cached dimensions to avoid getBoundingClientRect calls
      const width = lastWidth;
      const height = lastHeight;

      if (width === 0 || height === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Use time slicing for heavy operations
      await runWithTimeSlicing(() => {
        ctx.clearRect(0, 0, width, height);

        // Batch shadow operations for better performance
        ctx.shadowBlur = 10;

        particlesRef.current.forEach((particle) => {
          // Update position
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Bounce off edges
          if (particle.x < 0 || particle.x > width) {
            particle.vx *= -1;
            particle.x = Math.max(0, Math.min(width, particle.x));
          }
          if (particle.y < 0 || particle.y > height) {
            particle.vy *= -1;
            particle.y = Math.max(0, Math.min(height, particle.y));
          }

          // Draw particle with optimized rendering
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Reset shadow for connections
        ctx.shadowBlur = 0;
      }, 3); // 3ms budget

      // Draw connections in a separate time slice to prevent blocking
      await runWithTimeSlicing(() => {
        // Draw connections between nearby particles (optimized)
        // Reduce connection checks by limiting to smaller subset
        const maxConnections = Math.min(particlesRef.current.length, 25);
        for (let i = 0; i < maxConnections; i++) {
          for (let j = i + 1; j < maxConnections; j++) {
            const dx = particlesRef.current[i].x - particlesRef.current[j].x;
            const dy = particlesRef.current[i].y - particlesRef.current[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 80) {
              // Reduced distance for fewer connections
              const opacity = 0.08 * (1 - distance / 80);
              ctx.beginPath();
              ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
              ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }, 2); // 2ms budget

      animationRef.current = requestAnimationFrame(animate);
    };

    // Simple debounce for resize events
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        initParticles();
      }, 100);
    };

    // Initial setup
    resizeCanvas();
    initParticles();
    animate();

    // Handle resize with debouncing
    window.addEventListener("resize", debouncedResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", debouncedResize);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ mixBlendMode: "screen" }}
    />
  );
}
