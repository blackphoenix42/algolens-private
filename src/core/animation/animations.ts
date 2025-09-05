/**
 * Enhanced animations system for 60fps smooth animations
 */

import { useEffect, useRef, useState } from "react";

import { useAnimationFrame } from "@/services/performance";

// Animation presets for consistent 60fps performance
export const animationPresets = {
  // Micro-interactions (< 100ms)
  micro: {
    duration: 80,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    transform: "scale(1.02)",
  },

  // Fast interactions (100-300ms)
  fast: {
    duration: 200,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    transform: "translateY(-2px)",
  },

  // Medium interactions (300-500ms)
  medium: {
    duration: 400,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    transform: "translateY(-4px)",
  },

  // Slow interactions (500ms+)
  slow: {
    duration: 600,
    easing: "cubic-bezier(0.23, 1, 0.32, 1)",
    transform: "translateY(-8px)",
  },

  // Special effects
  bounce: {
    duration: 500,
    easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    transform: "scale(1.1)",
  },

  elastic: {
    duration: 800,
    easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    transform: "scale(1.05)",
  },
};

// Performance-optimized animation hook
export function useOptimizedAnimation(
  trigger: boolean,
  preset: keyof typeof animationPresets = "medium"
) {
  const elementRef = useRef<HTMLElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const config = animationPresets[preset];

    if (trigger) {
      setIsAnimating(true);
      element.style.transition = `transform ${config.duration}ms ${config.easing}`;
      element.style.transform = config.transform;

      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, config.duration);

      return () => clearTimeout(timeout);
    } else {
      element.style.transform = "none";
    }
  }, [trigger, preset]);

  return { elementRef, isAnimating };
}

// Stagger animation hook for lists
export function useStaggerAnimation<T>(
  items: T[],
  delay = 50,
  // preset kept for future extension (e.g., varying easing/duration per item)
  preset: keyof typeof animationPresets = "medium"
) {
  const [visibleIndexes, setVisibleIndexes] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-index") || "0"
            );

            setTimeout(() => {
              setVisibleIndexes((prev) => new Set([...prev, index]));
            }, index * delay);
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    const elements = containerRef.current.children;
    // Access preset config (future: could vary delay/easing per item)
    const cfg = animationPresets[preset];
    if (cfg && cfg.duration > 0) {
      // noop usage to satisfy lint and document intent
    }
    Array.from(elements).forEach((element, index) => {
      element.setAttribute("data-index", index.toString());
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items.length, delay, preset]);

  return { containerRef, visibleIndexes };
}

// Parallax scroll effect
export function useParallaxScroll(speed = 0.5) {
  const elementRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * speed;
      setOffset(parallax);
    };

    const throttledScroll = throttle(handleScroll, 16); // 60fps
    window.addEventListener("scroll", throttledScroll);

    return () => window.removeEventListener("scroll", throttledScroll);
  }, [speed]);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.style.transform = `translateY(${offset}px)`;
    }
  }, [offset]);

  return elementRef;
}

// Smooth page transitions
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const startTransition = async (callback: () => void) => {
    if (!containerRef.current) return;

    setIsTransitioning(true);

    // Fade out
    containerRef.current.style.opacity = "0";
    containerRef.current.style.transform = "translateY(20px)";

    await new Promise((resolve) => setTimeout(resolve, 200));

    // Execute callback (navigation, state change, etc.)
    callback();

    // Fade in
    await new Promise((resolve) => setTimeout(resolve, 50));
    containerRef.current.style.opacity = "1";
    containerRef.current.style.transform = "translateY(0)";

    setTimeout(() => setIsTransitioning(false), 200);
  };

  return { containerRef, isTransitioning, startTransition };
}

// Loading skeleton animation
export function useSkeletonAnimation() {
  const [progress, setProgress] = useState(0);

  useAnimationFrame((deltaTime: number) => {
    setProgress((prev) => (prev + deltaTime * 0.001) % 2);
  });

  const shimmerStyle = {
    background: `linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0.5) 60%,
      rgba(255, 255, 255, 0) 100%
    )`,
    backgroundSize: "200% 100%",
    backgroundPosition: `${(progress - 1) * 200}% 0`,
    animation: "none", // Use transform for better performance
  };

  return shimmerStyle;
}

// Morphing button animation
export function useMorphingButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    if (!buttonRef.current) return;

    setIsExpanded((prev) => !prev);

    const button = buttonRef.current;
    if (isExpanded) {
      button.style.width = "auto";
      button.style.borderRadius = "0.5rem";
    } else {
      button.style.width = "200px";
      button.style.borderRadius = "2rem";
    }
  };

  return { buttonRef, isExpanded, toggle };
}

// Card flip animation
export function useCardFlip() {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const flip = () => {
    if (!cardRef.current) return;

    setIsFlipped((prev) => !prev);
    cardRef.current.style.transform = isFlipped
      ? "rotateY(0deg)"
      : "rotateY(180deg)";
  };

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transformStyle = "preserve-3d";
      cardRef.current.style.transition =
        "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
    }
  }, []);

  return { cardRef, isFlipped, flip };
}

// Utility function for throttling
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as T;
}

// Spring animation hook
export function useSpringAnimation(
  to: number,
  config = { tension: 120, friction: 14 }
) {
  const [value, setValue] = useState(0);
  const velocity = useRef(0);
  const target = useRef(to);

  useEffect(() => {
    target.current = to;
  }, [to]);

  useAnimationFrame((deltaTime: number) => {
    const dt = deltaTime / 1000; // Convert to seconds

    const force = -config.tension * (value - target.current);
    const damping = -config.friction * velocity.current;
    const acceleration = force + damping;

    velocity.current += acceleration * dt;
    setValue((prev) => prev + velocity.current * dt);
  });

  return value;
}

// Gesture animation hook
export function useGestureAnimation(elementRef: React.RefObject<HTMLElement>) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handlePointerDown = (e: PointerEvent) => {
      setIsDragging(true);
      startPos.current = { x: e.clientX, y: e.clientY };
      element.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      setPosition({ x: deltaX, y: deltaY });
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    };

    const handlePointerUp = (e: PointerEvent) => {
      setIsDragging(false);
      setPosition({ x: 0, y: 0 });
      element.style.transform = "translate(0, 0)";
      element.releasePointerCapture(e.pointerId);
    };

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerUp);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, elementRef]);

  return { isDragging, position };
}
