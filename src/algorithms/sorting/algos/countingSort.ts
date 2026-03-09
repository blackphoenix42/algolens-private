import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* countingSort(input: unknown) {
  const arr = input as number[];
  const n = arr.length;

  yield {
    array: [...arr],
    highlights: {},
    explain: "Starting Counting Sort (works on non-negative integers)",
    pcLine: 1,
  };

  if (n === 0) {
    yield {
      array: [...arr],
      highlights: {},
      explain: "Counting Sort completed! (empty array)",
      pcLine: -1,
    };
    return;
  }

  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);

  yield {
    array: [...arr],
    highlights: {},
    explain: `Max value is ${max}. Creating count array of size ${max + 1}`,
    pcLine: 2,
  };

  // Count occurrences
  for (let i = 0; i < n; i++) {
    count[arr[i]]++;

    yield {
      array: [...arr],
      highlights: {
        indices: [i],
      },
      explain: `Counting: ${arr[i]} → count[${arr[i]}] = ${count[arr[i]]}`,
      pcLine: 3,
      counters: { [String(arr[i])]: count[arr[i]] },
    };
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "Count array built. Computing cumulative positions.",
    pcLine: 4,
  };

  // Compute cumulative count (positions)
  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];
    yield {
      array: [...arr],
      highlights: {},
      explain: `Cumulative: count[${i}] = ${count[i]} (position for value ${i})`,
      pcLine: 5,
    };
  }

  const output = new Array(n);

  yield {
    array: [...arr],
    highlights: {},
    explain: "Placing elements in output array using positions.",
    pcLine: 6,
  };

  // Place elements in output (traverse backwards for stability)
  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i];
    const pos = count[val] - 1;

    yield {
      array: [...arr],
      highlights: {
        indices: [i],
      },
      explain: `Placing ${val} at output position ${pos}`,
      pcLine: 7,
    };

    output[pos] = val;
    count[val]--;
  }

  // Copy output back to arr
  for (let k = 0; k < n; k++) {
    arr[k] = output[k];
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "Counting Sort completed!",
    pcLine: -1,
  };
};
