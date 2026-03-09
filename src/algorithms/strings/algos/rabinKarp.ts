import type { Algorithm } from "@/engine/types";

const BASE = 10;
const MOD = 1_000_000_007;

function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

export const run: Algorithm = function* rabinKarp(input: unknown) {
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
      explain: "Rabin-Karp search completed.",
      pcLine: -1,
    };
    return;
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: `Rabin-Karp: Text length=${text.length}, pattern length=${patternLen}. Using base=${BASE}, mod=${MOD}.`,
    pcLine: 1,
  };

  // Compute pattern hash
  let patternHash = 0;
  for (let i = 0; i < patternLen; i++) {
    patternHash = (patternHash * BASE + pattern[i]) % MOD;
  }
  patternHash = ((patternHash % MOD) + MOD) % MOD;

  yield {
    array: [...arr],
    highlights: { indices: pattern.map((_, i) => i) },
    explain: `Pattern hash = ${patternHash}`,
    pcLine: 3,
  };

  // Compute first window hash
  let windowHash = 0;
  const h = modPow(BASE, patternLen - 1, MOD);

  for (let i = 0; i < patternLen; i++) {
    windowHash = (windowHash * BASE + text[i]) % MOD;
  }
  windowHash = ((windowHash % MOD) + MOD) % MOD;

  const textStartIdx = patternLen;
  yield {
    array: [...arr],
    highlights: {
      indices: Array.from({ length: patternLen }, (_, k) => textStartIdx + k),
    },
    explain: `Initial window hash = ${windowHash}`,
    pcLine: 5,
  };

  // Slide window
  for (let i = 0; i <= text.length - patternLen; i++) {
    const windowIndices = Array.from(
      { length: patternLen },
      (_, k) => textStartIdx + i + k
    );

    yield {
      array: [...arr],
      highlights: { indices: windowIndices, compared: [i, 0] },
      explain: `Window at position ${i}: hash=${windowHash}, comparing with pattern hash=${patternHash}`,
      pcLine: 7,
    };

    if (windowHash === patternHash) {
      let match = true;
      for (let j = 0; j < patternLen; j++) {
        if (text[i + j] !== pattern[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        yield {
          array: [...arr],
          highlights: { indices: windowIndices },
          explain: `Hash match! Verified: pattern found at position ${i}`,
          pcLine: 9,
        };
      } else {
        yield {
          array: [...arr],
          highlights: { indices: windowIndices },
          explain: `Hash collision - spurious match at ${i}, verified false`,
          pcLine: 11,
        };
      }
    } else {
      yield {
        array: [...arr],
        highlights: { indices: windowIndices },
        explain: `Hash mismatch - slide window`,
        pcLine: 13,
      };
    }

    if (i < text.length - patternLen) {
      const oldVal = text[i];
      const newVal = text[i + patternLen];
      windowHash =
        ((((windowHash - oldVal * h) * BASE + newVal) % MOD) + MOD) % MOD;
    }
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "Rabin-Karp search completed.",
    pcLine: -1,
  };
};
