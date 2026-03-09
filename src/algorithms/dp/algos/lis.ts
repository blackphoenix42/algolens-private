import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* lis(input: unknown) {
  const arr = input as number[];
  const n = arr.length;
  const dp = Array(n).fill(1);

  yield {
    array: [...dp],
    highlights: {},
    explain: "Starting LIS. dp[i] = length of LIS ending at index i.",
    pcLine: 1,
  };

  for (let i = 1; i < n; i++) {
    yield {
      array: [...dp],
      highlights: { indices: [i] },
      explain: `Computing dp[${i}] for element ${arr[i]}`,
      pcLine: 2,
    };

    for (let j = 0; j < i; j++) {
      yield {
        array: [...dp],
        highlights: {
          compared: [j, i],
        },
        explain: `Comparing arr[${j}]=${arr[j]} with arr[${i}]=${arr[i]}`,
        pcLine: 3,
      };

      if (arr[j] < arr[i]) {
        const candidate = dp[j] + 1;
        if (candidate > dp[i]) {
          dp[i] = candidate;
          yield {
            array: [...dp],
            highlights: {
              indices: [i],
              compared: [j, i],
            },
            explain: `arr[${j}] < arr[${i}], dp[${i}] = dp[${j}]+1 = ${dp[i]}`,
            pcLine: 4,
          };
        }
      }
    }
  }

  const maxLis = Math.max(...dp);

  yield {
    array: [...dp],
    highlights: {},
    explain: `Completed! Longest Increasing Subsequence length: ${maxLis}`,
    pcLine: -1,
  };
};
