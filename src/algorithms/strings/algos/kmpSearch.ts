import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* kmpSearch(input: unknown) {
  const arr = input as number[];
  const patternLen = Math.max(1, Math.min(3, Math.floor(arr.length / 2)));
  const text = arr.slice(patternLen);
  const pattern = arr.slice(0, patternLen);

  if (text.length < patternLen) {
    yield {
      array: [...arr],
      highlights: {},
      explain:
        "Array too short for pattern matching (need text length >= pattern length)",
      pcLine: 1,
    };
    yield {
      array: [...arr],
      highlights: {},
      explain: "KMP search completed.",
      pcLine: -1,
    };
    return;
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: `KMP: Text length=${text.length}, pattern (first ${patternLen} elements)=[${pattern.join(", ")}]`,
    pcLine: 1,
  };

  // Build failure function (lps)
  const lps: number[] = new Array(patternLen).fill(0);
  let len = 0;
  let i = 1;

  yield {
    array: [...arr],
    highlights: { indices: [0] },
    explain:
      "Building failure function (longest proper prefix which is also suffix)",
    pcLine: 2,
  };

  while (i < patternLen) {
    yield {
      array: [...arr],
      highlights: { indices: [i, len], compared: [i, len] },
      explain: `Comparing pattern[${i}]=${pattern[i]} with pattern[${len}]=${pattern[len]}`,
      pcLine: 3,
    };

    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
      yield {
        array: [...arr],
        highlights: { indices: [i - 1, len - 1] },
        explain: `Match! lps[${i - 1}]=${len}`,
        pcLine: 5,
      };
    } else {
      if (len !== 0) {
        len = lps[len - 1];
        yield {
          array: [...arr],
          highlights: { indices: [i, len] },
          explain: `Mismatch - backtrack len to lps[${len - 1}]=${len}`,
          pcLine: 7,
        };
      } else {
        lps[i] = 0;
        i++;
        yield {
          array: [...arr],
          highlights: { indices: [i - 1] },
          explain: `No match - lps[${i - 1}]=0, advance i`,
          pcLine: 9,
        };
      }
    }
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: `Failure function built: [${lps.join(", ")}]. Starting search.`,
    pcLine: 11,
  };

  // Search
  let ti = 0;
  let pi = 0;
  const textStartIdx = patternLen;

  while (ti < text.length) {
    const textIdx = textStartIdx + ti;
    const arrIdx = textIdx;

    yield {
      array: [...arr],
      highlights: {
        indices: [arrIdx, pi],
        compared: [arrIdx, pi],
      },
      explain: `Comparing text[${ti}]=${text[ti]} with pattern[${pi}]=${pattern[pi]}`,
      pcLine: 13,
    };

    if (pattern[pi] === text[ti]) {
      pi++;
      ti++;
      if (pi === patternLen) {
        const matchStart = ti - patternLen;
        yield {
          array: [...arr],
          highlights: {
            indices: Array.from(
              { length: patternLen },
              (_, k) => textStartIdx + matchStart + k
            ),
          },
          explain: `Pattern found at text position ${matchStart}!`,
          pcLine: 15,
        };
        pi = lps[pi - 1];
        continue;
      }
    } else {
      if (pi !== 0) {
        pi = lps[pi - 1];
        yield {
          array: [...arr],
          highlights: { indices: [arrIdx, pi] },
          explain: `Mismatch - shift pattern by lps[${pi - 1}]=${pi}`,
          pcLine: 18,
        };
      } else {
        ti++;
        yield {
          array: [...arr],
          highlights: { indices: [arrIdx] },
          explain: `Mismatch at start - advance text pointer`,
          pcLine: 20,
        };
      }
    }
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "KMP search completed.",
    pcLine: -1,
  };
};
