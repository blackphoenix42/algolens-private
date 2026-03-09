import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* knapsack(input: unknown) {
  const values = input as number[];
  const n = values.length;
  const capacity = Math.floor(values.reduce((a, b) => a + b, 0) / 2);

  yield {
    array: Array(capacity + 1).fill(0),
    highlights: {},
    explain: `Starting 0/1 Knapsack (subset-sum variant: each element is both value and weight). Items: ${n}, Capacity: ${capacity}`,
    pcLine: 1,
  };

  const dp = Array(capacity + 1).fill(0);

  for (let i = 0; i < n; i++) {
    yield {
      array: [...dp],
      highlights: { indices: [0] },
      explain: `Processing item ${i + 1} (value/weight: ${values[i]})`,
      pcLine: 2,
    };

    for (let w = capacity; w >= values[i]; w--) {
      const exclude = dp[w];
      const include = dp[w - values[i]] + values[i];

      yield {
        array: [...dp],
        highlights: {
          indices: [w],
          compared: [w, w - values[i]],
        },
        explain: `Capacity ${w}: include=${include}, exclude=${exclude}`,
        pcLine: 3,
      };

      dp[w] = Math.max(include, exclude);

      yield {
        array: [...dp],
        highlights: { indices: [w] },
        explain: `dp[${w}] = ${dp[w]}`,
        pcLine: 4,
      };
    }
  }

  yield {
    array: [...dp],
    highlights: {},
    explain: `Completed! Max value achievable: ${dp[capacity]}`,
    pcLine: -1,
  };
};
