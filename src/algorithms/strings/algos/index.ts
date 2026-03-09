import type { AlgoMeta } from "@/types/algorithms";

export const stringsAlgos: AlgoMeta[] = [
  {
    slug: "kmp-search",
    title: "KMP Pattern Matching",
    topic: "strings",
    summary:
      "Efficient string matching using the Knuth-Morris-Pratt algorithm with a failure function to avoid redundant comparisons.",
    pseudocode: [
      "Build failure function lps[] for pattern",
      "i = 0, j = 0",
      "while i < text.length:",
      "  if pattern[j] == text[i]: i++, j++",
      "  if j == pattern.length: match found",
      "  else if mismatch:",
      "    if j > 0: j = lps[j-1]",
      "    else: i++",
    ],
    complexity: {
      time: { best: "O(n)", average: "O(n + m)", worst: "O(n + m)" },
      space: "O(m)",
    },
    about:
      "KMP preprocesses the pattern to build a failure function (longest proper prefix that is also a suffix). When a mismatch occurs, it shifts the pattern by the failure value instead of backtracking in the text.",
    pros: [
      "Linear time - no backtracking in text",
      "Efficient for repeated pattern searches",
      "Handles overlapping matches",
    ],
    cons: [
      "Extra O(m) space for failure table",
      "Preprocessing overhead for short patterns",
      "More complex than naive matching",
    ],
    code: {
      javascript: `function kmpSearch(text, pattern) {
  const lps = buildLPS(pattern);
  let i = 0, j = 0;

  while (i < text.length) {
    if (pattern[j] === text[i]) {
      i++; j++;
    }
    if (j === pattern.length) {
      return i - j;
    } else if (i < text.length && pattern[j] !== text[i]) {
      if (j > 0) j = lps[j - 1];
      else i++;
    }
  }
  return -1;
}

function buildLPS(pattern) {
  const lps = [0];
  let len = 0, i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i++] = len;
    } else {
      if (len) len = lps[len - 1];
      else lps[i++] = 0;
    }
  }
  return lps;
}`,
      python: `def kmp_search(text, pattern):
    lps = build_lps(pattern)
    i = j = 0

    while i < len(text):
        if pattern[j] == text[i]:
            i += 1
            j += 1
        if j == len(pattern):
            return i - j
        elif i < len(text) and pattern[j] != text[i]:
            if j > 0:
                j = lps[j - 1]
            else:
                i += 1
    return -1

def build_lps(pattern):
    lps = [0]
    length, i = 0, 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps.append(length)
            i += 1
        else:
            if length:
                length = lps[length - 1]
            else:
                lps.append(0)
                i += 1
    return lps`,
      java: `public static int kmpSearch(int[] text, int[] pattern) {
    int[] lps = buildLPS(pattern);
    int i = 0, j = 0;

    while (i < text.length) {
        if (pattern[j] == text[i]) {
            i++; j++;
        }
        if (j == pattern.length) {
            return i - j;
        } else if (i < text.length && pattern[j] != text[i]) {
            if (j > 0) j = lps[j - 1];
            else i++;
        }
    }
    return -1;
}

static int[] buildLPS(int[] pattern) {
    int[] lps = new int[pattern.length];
    int len = 0, i = 1;
    while (i < pattern.length) {
        if (pattern[i] == pattern[len]) {
            lps[i++] = ++len;
        } else {
            if (len != 0) len = lps[len - 1];
            else lps[i++] = 0;
        }
    }
    return lps;
}`,
      cpp: `int kmpSearch(vector<int>& text, vector<int>& pattern) {
    vector<int> lps = buildLPS(pattern);
    int i = 0, j = 0;

    while (i < (int)text.size()) {
        if (pattern[j] == text[i]) {
            i++; j++;
        }
        if (j == (int)pattern.size()) {
            return i - j;
        } else if (i < (int)text.size() && pattern[j] != text[i]) {
            if (j > 0) j = lps[j - 1];
            else i++;
        }
    }
    return -1;
}

vector<int> buildLPS(vector<int>& pattern) {
    vector<int> lps(pattern.size());
    int len = 0, i = 1;
    while (i < (int)pattern.size()) {
        if (pattern[i] == pattern[len]) {
            lps[i++] = ++len;
        } else {
            if (len) len = lps[len - 1];
            else lps[i++] = 0;
        }
    }
    return lps;
}`,
    },
    codeLineMap: {
      javascript: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      python: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      java: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      cpp: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    load: () => import("./kmpSearch"),
  },
  {
    slug: "rabin-karp",
    title: "Rabin-Karp",
    topic: "strings",
    summary:
      "Pattern matching using rolling hash. Computes hash of pattern and sliding windows, comparing hashes for potential matches.",
    pseudocode: [
      "Compute pattern hash",
      "Compute hash of first window of text",
      "for each window position:",
      "  if window hash == pattern hash:",
      "    verify match (handle collisions)",
      "  compute next window hash (rolling)",
    ],
    complexity: {
      time: { best: "O(n + m)", average: "O(n + m)", worst: "O(n * m)" },
      space: "O(1)",
    },
    about:
      "Rabin-Karp uses a rolling hash to quickly compare windows of the text with the pattern. When hashes match, a character-by-character verification handles collisions. Average case is linear.",
    pros: [
      "Efficient for multiple pattern search",
      "Simple rolling hash update",
      "Good for plagiarism detection",
    ],
    cons: [
      "Worst case O(n*m) with many hash collisions",
      "Requires careful hash function design",
      "Modulo operations add overhead",
    ],
    code: {
      javascript: `function rabinKarp(text, pattern) {
  const base = 10, mod = 1e9 + 7;
  const m = pattern.length, n = text.length;
  let patternHash = 0, windowHash = 0;
  let h = 1;
  for (let i = 0; i < m - 1; i++) h = (h * base) % mod;

  for (let i = 0; i < m; i++) {
    patternHash = (patternHash * base + pattern[i]) % mod;
    windowHash = (windowHash * base + text[i]) % mod;
  }

  for (let i = 0; i <= n - m; i++) {
    if (patternHash === windowHash) {
      let match = true;
      for (let j = 0; j < m; j++) {
        if (text[i + j] !== pattern[j]) { match = false; break; }
      }
      if (match) return i;
    }
    if (i < n - m) {
      windowHash = ((windowHash - text[i] * h) * base + text[i + m]) % mod;
      windowHash = (windowHash + mod) % mod;
    }
  }
  return -1;
}`,
      python: `def rabin_karp(text, pattern):
    base, mod = 10, 10**9 + 7
    m, n = len(pattern), len(text)
    pattern_hash = window_hash = 0
    h = pow(base, m - 1, mod)

    for i in range(m):
        pattern_hash = (pattern_hash * base + pattern[i]) % mod
        window_hash = (window_hash * base + text[i]) % mod

    for i in range(n - m + 1):
        if pattern_hash == window_hash:
            if text[i:i+m] == pattern:
                return i
        if i < n - m:
            window_hash = (window_hash - text[i] * h) * base + text[i + m]
            window_hash %= mod
    return -1`,
      java: `public static int rabinKarp(int[] text, int[] pattern) {
    int base = 10, mod = (int)1e9 + 7;
    int m = pattern.length, n = text.length;
    long patternHash = 0, windowHash = 0;
    long h = 1;
    for (int i = 0; i < m - 1; i++) h = (h * base) % mod;

    for (int i = 0; i < m; i++) {
        patternHash = (patternHash * base + pattern[i]) % mod;
        windowHash = (windowHash * base + text[i]) % mod;
    }

    for (int i = 0; i <= n - m; i++) {
        if (patternHash == windowHash) {
            boolean match = true;
            for (int j = 0; j < m; j++) {
                if (text[i + j] != pattern[j]) { match = false; break; }
            }
            if (match) return i;
        }
        if (i < n - m) {
            windowHash = ((windowHash - (long)text[i] * h) * base + text[i + m]) % mod;
            if (windowHash < 0) windowHash += mod;
        }
    }
    return -1;
}`,
      cpp: `int rabinKarp(vector<int>& text, vector<int>& pattern) {
    const int base = 10, mod = 1e9 + 7;
    int m = pattern.size(), n = text.size();
    long long patternHash = 0, windowHash = 0;
    long long h = 1;
    for (int i = 0; i < m - 1; i++) h = (h * base) % mod;

    for (int i = 0; i < m; i++) {
        patternHash = (patternHash * base + pattern[i]) % mod;
        windowHash = (windowHash * base + text[i]) % mod;
    }

    for (int i = 0; i <= n - m; i++) {
        if (patternHash == windowHash) {
            bool match = true;
            for (int j = 0; j < m; j++) {
                if (text[i + j] != pattern[j]) { match = false; break; }
            }
            if (match) return i;
        }
        if (i < n - m) {
            windowHash = ((windowHash - text[i] * h) * base + text[i + m]) % mod;
            if (windowHash < 0) windowHash += mod;
        }
    }
    return -1;
}`,
    },
    codeLineMap: {
      javascript: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      python: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      java: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      cpp: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    },
    load: () => import("./rabinKarp"),
  },
];
