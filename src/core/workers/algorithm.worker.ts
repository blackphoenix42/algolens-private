// Web Worker for algorithm computation

interface AlgoFrame {
  array: number[];
  highlights?: {
    compared?: [number, number];
    swapped?: [number, number];
    pivot?: number;
    indices?: number[];
  };
  explain?: string;
  pcLine?: number;
}

interface WorkerMessage {
  type: "compute" | "cancel";
  payload?: {
    algorithm: string;
    input: number[];
    options?: Record<string, unknown>;
  };
}

interface WorkerResponse {
  type: "progress" | "complete" | "error";
  payload?: {
    frames?: AlgoFrame[];
    progress?: number;
    error?: string;
  };
}

// Global worker state
let currentComputation: {
  frames: AlgoFrame[];
  cancelled: boolean;
} | null = null;

// Mock algorithm implementations (in a real app, these would be imported)
const algorithms = {
  "bubble-sort": (arr: number[]) => bubbleSort([...arr]),
  "quick-sort": (arr: number[]) => quickSort([...arr]),
  "merge-sort": (arr: number[]) => mergeSort([...arr]),
  // Add more algorithms as needed
};

function bubbleSort(arr: number[]): AlgoFrame[] {
  const frames: AlgoFrame[] = [];
  const n = arr.length;

  frames.push({
    array: [...arr],
    highlights: {},
    explain: "Starting Bubble Sort",
    pcLine: 0,
  });

  for (let i = 0; i < n - 1; i++) {
    if (currentComputation?.cancelled) break;

    for (let j = 0; j < n - i - 1; j++) {
      if (currentComputation?.cancelled) break;

      frames.push({
        array: [...arr],
        highlights: {
          compared: [j, j + 1] as [number, number],
        },
        explain: `Comparing elements at positions ${j} and ${j + 1}`,
        pcLine: 1,
      });

      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        frames.push({
          array: [...arr],
          highlights: {
            swapped: [j, j + 1] as [number, number],
          },
          explain: `Swapped elements ${arr[j + 1]} and ${arr[j]}`,
          pcLine: 2,
        });
      }
    }
  }

  frames.push({
    array: [...arr],
    highlights: {},
    explain: "Bubble Sort completed!",
    pcLine: -1,
  });

  return frames;
}

function quickSort(arr: number[]): AlgoFrame[] {
  const frames: AlgoFrame[] = [];

  frames.push({
    array: [...arr],
    highlights: {},
    explain: "Starting Quick Sort",
    pcLine: 0,
  });

  function quickSortHelper(arr: number[], low: number, high: number) {
    if (currentComputation?.cancelled) return;

    if (low < high) {
      const pivotIndex = partition(arr, low, high);

      frames.push({
        array: [...arr],
        highlights: {
          pivot: pivotIndex,
        },
        explain: `Pivot placed at position ${pivotIndex}`,
        pcLine: 1,
      });

      quickSortHelper(arr, low, pivotIndex - 1);
      quickSortHelper(arr, pivotIndex + 1, high);
    }
  }

  function partition(arr: number[], low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;

    frames.push({
      array: [...arr],
      highlights: {
        pivot: high,
      },
      explain: `Partitioning with pivot ${pivot}`,
      pcLine: 2,
    });

    for (let j = low; j < high; j++) {
      if (currentComputation?.cancelled) break;

      frames.push({
        array: [...arr],
        highlights: {
          compared: [j, high] as [number, number],
          pivot: high,
        },
        explain: `Comparing ${arr[j]} with pivot ${pivot}`,
        pcLine: 3,
      });

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];

        frames.push({
          array: [...arr],
          highlights: {
            swapped: [i, j] as [number, number],
            pivot: high,
          },
          explain: `Swapped ${arr[j]} and ${arr[i]}`,
          pcLine: 4,
        });
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

    frames.push({
      array: [...arr],
      highlights: {
        swapped: [i + 1, high] as [number, number],
      },
      explain: `Placed pivot in final position`,
      pcLine: 5,
    });

    return i + 1;
  }

  quickSortHelper(arr, 0, arr.length - 1);

  frames.push({
    array: [...arr],
    highlights: {},
    explain: "Quick Sort completed!",
    pcLine: -1,
  });

  return frames;
}

function mergeSort(arr: number[]): AlgoFrame[] {
  const frames: AlgoFrame[] = [];

  frames.push({
    array: [...arr],
    highlights: {},
    explain: "Starting Merge Sort",
    pcLine: 0,
  });

  function mergeSortHelper(arr: number[], left: number, right: number) {
    if (currentComputation?.cancelled) return;

    if (left < right) {
      const mid = Math.floor((left + right) / 2);

      frames.push({
        array: [...arr],
        highlights: {
          indices: [left, mid, right],
        },
        explain: `Dividing array: [${left}...${mid}] and [${mid + 1}...${right}]`,
        pcLine: 1,
      });

      mergeSortHelper(arr, left, mid);
      mergeSortHelper(arr, mid + 1, right);
      merge(arr, left, mid, right);
    }
  }

  function merge(arr: number[], left: number, mid: number, right: number) {
    if (currentComputation?.cancelled) return;

    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    frames.push({
      array: [...arr],
      highlights: {
        indices: [left, right],
      },
      explain: `Merging subarrays [${left}...${mid}] and [${mid + 1}...${right}]`,
      pcLine: 2,
    });

    let i = 0,
      j = 0,
      k = left;

    while (i < leftArr.length && j < rightArr.length) {
      if (currentComputation?.cancelled) break;

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }

      frames.push({
        array: [...arr],
        highlights: {
          indices: [k],
        },
        explain: `Placed ${arr[k]} at position ${k}`,
        pcLine: 3,
      });

      k++;
    }

    while (i < leftArr.length) {
      if (currentComputation?.cancelled) break;
      arr[k] = leftArr[i];
      frames.push({
        array: [...arr],
        highlights: {
          indices: [k],
        },
        explain: `Copying remaining element ${arr[k]}`,
        pcLine: 4,
      });
      i++;
      k++;
    }

    while (j < rightArr.length) {
      if (currentComputation?.cancelled) break;
      arr[k] = rightArr[j];
      frames.push({
        array: [...arr],
        highlights: {
          indices: [k],
        },
        explain: `Copying remaining element ${arr[k]}`,
        pcLine: 4,
      });
      j++;
      k++;
    }
  }

  mergeSortHelper(arr, 0, arr.length - 1);

  frames.push({
    array: [...arr],
    highlights: {},
    explain: "Merge Sort completed!",
    pcLine: -1,
  });

  return frames;
}

// Worker message handler
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case "compute":
      if (payload) {
        currentComputation = {
          frames: [],
          cancelled: false,
        };

        const { algorithm, input } = payload;

        try {
          // Post progress updates
          const progressInterval = setInterval(() => {
            if (currentComputation?.cancelled) {
              clearInterval(progressInterval);
              return;
            }

            self.postMessage({
              type: "progress",
              payload: {
                progress: Math.min(50, currentComputation?.frames.length || 0),
              },
            } as WorkerResponse);
          }, 100);

          // Run the algorithm
          const algorithmFn = algorithms[algorithm as keyof typeof algorithms];
          if (!algorithmFn) {
            throw new Error(`Algorithm ${algorithm} not found`);
          }

          const frames = algorithmFn(input);

          clearInterval(progressInterval);

          if (!currentComputation?.cancelled) {
            self.postMessage({
              type: "complete",
              payload: {
                frames,
              },
            } as WorkerResponse);
          }
        } catch (error) {
          self.postMessage({
            type: "error",
            payload: {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          } as WorkerResponse);
        }
      }
      break;

    case "cancel":
      if (currentComputation) {
        currentComputation.cancelled = true;
        currentComputation = null;
      }
      break;
  }
};

// Export types for TypeScript
export type { WorkerMessage, WorkerResponse };
