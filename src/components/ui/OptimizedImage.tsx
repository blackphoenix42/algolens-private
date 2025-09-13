/**
 * Optimized Image Component
 * Provides lazy loading, modern format support, and performance optimization
 */

import React, { useRef, useState } from "react";

import { useIntersectionObserver } from "@/services/performance";
import { cn } from "@/utils";

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder,
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Use intersection observer for lazy loading
  useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: "50px",
  });

  // Monitor intersection changes
  React.useEffect(() => {
    if (!priority && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isInView) {
            setIsInView(true);
          }
        },
        {
          threshold: 0.1,
          rootMargin: "50px",
        }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string) => {
    if (baseSrc.startsWith("data:") || baseSrc.startsWith("blob:")) {
      return baseSrc;
    }

    // For public assets, generate responsive sizes
    const ext = baseSrc.split(".").pop()?.toLowerCase();
    if (ext && ["jpg", "jpeg", "png", "webp"].includes(ext)) {
      const base = baseSrc.replace(/\.[^.]+$/, "");
      return `${base}.webp 1x, ${base}@2x.webp 2x`;
    }

    return baseSrc;
  };

  const shouldRender = priority || isInView;

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        !isLoaded && !hasError && "animate-pulse bg-gray-200 dark:bg-gray-700",
        className
      )}
      data-width={width}
      data-height={height}
      data-aspect-ratio={width && height ? `${width}/${height}` : undefined}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && placeholder && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-sm filter"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {shouldRender && !hasError && (
        <img
          src={src}
          srcSet={generateSrcSet(src)}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          {...props}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
          <div className="text-center">
            <div className="mb-2 text-2xl">🖼️</div>
            <div className="text-sm">Failed to load image</div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {shouldRender && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;
