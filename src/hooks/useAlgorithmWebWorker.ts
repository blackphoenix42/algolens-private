import { useCallback, useEffect, useRef, useState } from "react";

import type { Frame as AlgoFrame } from "@/types";

interface UseWebWorkerResult {
  computeFrames: (algorithm: string, input: number[]) => Promise<AlgoFrame[]>;
  isComputing: boolean;
  progress: number;
  error: string | null;
  cancelComputation: () => void;
}

export function useAlgorithmWebWorker(): UseWebWorkerResult {
  const workerRef = useRef<Worker | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const resolveRef = useRef<((frames: AlgoFrame[]) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);

  // Initialize worker
  useEffect(() => {
    try {
      // Create worker from the algorithm worker file
      workerRef.current = new Worker(
        new URL("./algorithm.worker.ts", import.meta.url),
        { type: "module" }
      );

      workerRef.current.onmessage = (event) => {
        const { type, payload } = event.data;

        switch (type) {
          case "progress":
            if (payload?.progress !== undefined) {
              setProgress(payload.progress);
            }
            break;

          case "complete":
            if (payload?.frames) {
              setIsComputing(false);
              setProgress(100);
              resolveRef.current?.(payload.frames);
              resolveRef.current = null;
              rejectRef.current = null;
            }
            break;

          case "error": {
            setIsComputing(false);
            setProgress(0);
            const errorMessage = payload?.error || "Unknown error";
            setError(errorMessage);
            rejectRef.current?.(new Error(errorMessage));
            resolveRef.current = null;
            rejectRef.current = null;
            break;
          }
        }
      };

      workerRef.current.onerror = (error) => {
        setIsComputing(false);
        setProgress(0);
        const errorMessage = "Worker error: " + error.message;
        setError(errorMessage);
        rejectRef.current?.(new Error(errorMessage));
        resolveRef.current = null;
        rejectRef.current = null;
      };
    } catch (err) {
      console.warn(
        "Web Workers not supported, falling back to main thread",
        err
      );
      // Fallback to main thread computation
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const computeFrames = useCallback(
    (algorithm: string, input: number[]): Promise<AlgoFrame[]> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          // Fallback to main thread if worker is not available
          // This would use a synchronous algorithm implementation
          reject(new Error("Web Worker not available"));
          return;
        }

        setIsComputing(true);
        setProgress(0);
        setError(null);

        resolveRef.current = resolve;
        rejectRef.current = reject;

        workerRef.current.postMessage({
          type: "compute",
          payload: {
            algorithm,
            input: [...input], // Clone the input array
          },
        });
      });
    },
    []
  );

  const cancelComputation = useCallback(() => {
    if (workerRef.current && isComputing) {
      workerRef.current.postMessage({ type: "cancel" });
      setIsComputing(false);
      setProgress(0);
      setError(null);

      // Reject the current promise
      rejectRef.current?.(new Error("Computation cancelled"));
      resolveRef.current = null;
      rejectRef.current = null;
    }
  }, [isComputing]);

  return {
    computeFrames,
    isComputing,
    progress,
    error,
    cancelComputation,
  };
}

export default useAlgorithmWebWorker;
