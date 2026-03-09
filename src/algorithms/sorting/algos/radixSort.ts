import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* radixSort(input: unknown) {
  const arr = input as number[];
  const n = arr.length;

  yield {
    array: [...arr],
    highlights: {},
    explain:
      "Starting Radix Sort (LSD) - sort digit by digit from least significant",
    pcLine: 1,
  };

  if (n === 0) {
    yield {
      array: [...arr],
      highlights: {},
      explain: "Radix Sort completed! (empty array)",
      pcLine: -1,
    };
    return;
  }

  // Handle negative numbers: shift all values so the minimum becomes 0
  const minVal = Math.min(...arr);
  const offset = minVal < 0 ? -minVal : 0;
  if (offset > 0) {
    for (let i = 0; i < n; i++) arr[i] += offset;
  }

  const max = Math.max(...arr);
  let exp = 1;
  let digitPass = 0;

  while (Math.floor(max / exp) > 0) {
    digitPass++;
    yield {
      array: [...arr],
      highlights: {},
      explain: `Digit pass ${digitPass}: sorting by digit at place value ${exp}`,
      pcLine: 2,
    };

    const count = new Array(10).fill(0);

    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;

      yield {
        array: [...arr],
        highlights: {
          indices: [i],
        },
        explain: `Counting: ${arr[i]} has digit ${digit} at this place`,
        pcLine: 3,
      };
    }

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    const output = new Array(n);

    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      const pos = count[digit] - 1;

      yield {
        array: [...arr],
        highlights: {
          indices: [i],
        },
        explain: `Placing ${arr[i]} (digit ${digit}) at position ${pos}`,
        pcLine: 5,
      };

      output[pos] = arr[i];
      count[digit]--;
    }

    for (let k = 0; k < n; k++) {
      arr[k] = output[k];
    }

    yield {
      array: [...arr],
      highlights: {},
      explain: `Digit pass ${digitPass} complete`,
      pcLine: 6,
    };

    exp *= 10;
  }

  // Restore original values by removing the offset
  if (offset > 0) {
    for (let i = 0; i < n; i++) arr[i] -= offset;
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "Radix Sort completed!",
    pcLine: -1,
  };
};
