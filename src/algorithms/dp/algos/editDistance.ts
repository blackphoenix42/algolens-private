import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* editDistance(input: unknown) {
  const arr = input as number[];
  const mid = Math.floor(arr.length / 2);
  const s1 = arr.slice(0, mid);
  const s2 = arr.slice(mid);
  const m = s1.length;
  const n = s2.length;

  yield {
    array: Array.from({ length: n + 1 }, (_, i) => i),
    highlights: {},
    explain: `Edit Distance: s1=${s1.join(",")}, s2=${s2.join(",")}. Initialize first row.`,
    pcLine: 1,
  };

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  const curr = Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;

    yield {
      array: [...curr],
      highlights: { indices: [0] },
      explain: `Row ${i}: curr[0] = ${i}`,
      pcLine: 2,
    };

    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      const insert = curr[j - 1] + 1;
      const del = prev[j] + 1;
      const replace = prev[j - 1] + cost;

      yield {
        array: [...curr],
        highlights: {
          indices: [j],
          compared: [j - 1, j],
        },
        explain: `Cell (${i},${j}): insert=${insert}, del=${del}, replace=${replace}`,
        pcLine: 3,
      };

      curr[j] = Math.min(insert, del, replace);

      yield {
        array: [...curr],
        highlights: { indices: [j] },
        explain: `curr[${j}] = ${curr[j]}`,
        pcLine: 4,
      };
    }

    prev = [...curr];
  }

  const result = prev[n];

  yield {
    array: [...prev],
    highlights: {},
    explain: `Completed! Edit distance: ${result}`,
    pcLine: -1,
  };
};
