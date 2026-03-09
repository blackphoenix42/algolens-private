import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* bucketSort(input: unknown) {
  const arr = input as number[];
  const n = arr.length;

  yield {
    array: [...arr],
    highlights: {},
    explain:
      "Starting Bucket Sort - distribute into buckets, sort each, concatenate",
    pcLine: 1,
  };

  if (n === 0) {
    yield {
      array: [...arr],
      highlights: {},
      explain: "Bucket Sort completed! (empty array)",
      pcLine: -1,
    };
    return;
  }

  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const bucketCount = Math.min(n, 10);
  const bucketSize = (max - min) / bucketCount || 1;
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  yield {
    array: [...arr],
    highlights: {},
    explain: `Creating ${bucketCount} buckets. Range: [${min}, ${max}]`,
    pcLine: 2,
  };

  // Distribute elements into buckets
  for (let i = 0; i < n; i++) {
    const bucketIndex = Math.min(
      Math.floor((arr[i] - min) / bucketSize),
      bucketCount - 1
    );
    buckets[bucketIndex].push(arr[i]);

    yield {
      array: [...arr],
      highlights: {
        indices: [i],
      },
      explain: `Distributing ${arr[i]} into bucket ${bucketIndex}`,
      pcLine: 3,
    };
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "Distribution complete. Sorting each bucket with insertion sort.",
    pcLine: 4,
  };

  for (let b = 0; b < bucketCount; b++) {
    if (buckets[b].length === 0) continue;

    yield {
      array: [...arr],
      highlights: {},
      explain: `Sorting bucket ${b} (${buckets[b].length} elements) with insertion sort`,
      pcLine: 5,
    };

    // Insertion sort within bucket
    for (let i = 1; i < buckets[b].length; i++) {
      const key = buckets[b][i];
      let j = i - 1;

      while (j >= 0 && buckets[b][j] > key) {
        buckets[b][j + 1] = buckets[b][j];
        j--;
      }
      buckets[b][j + 1] = key;

      // Update arr for visualization (copy buckets back in order so far)
      let outIdx = 0;
      for (let bi = 0; bi <= b; bi++) {
        for (let k = 0; k < buckets[bi].length; k++) {
          arr[outIdx++] = buckets[bi][k];
        }
      }

      yield {
        array: [...arr],
        highlights: {
          indices: [outIdx - 1],
        },
        explain: `Insertion sort in bucket ${b}: placed ${key}`,
        pcLine: 6,
      };
    }
  }

  // Final concatenation
  let outIdx = 0;
  for (let b = 0; b < bucketCount; b++) {
    for (let k = 0; k < buckets[b].length; k++) {
      arr[outIdx++] = buckets[b][k];
    }
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "Bucket Sort completed!",
    pcLine: -1,
  };
};
