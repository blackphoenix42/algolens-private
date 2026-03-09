import type { AlgoMeta } from "@/types/algorithms";

export const dpAlgos: AlgoMeta[] = [
  {
    slug: "knapsack",
    title: "0/1 Knapsack",
    topic: "dp",
    summary:
      "Dynamic programming solution for the 0/1 knapsack problem: maximize value with capacity constraint.",
    pseudocode: [
      "dp[w] = 0 for all w",
      "for each item i",
      "  for w from capacity down to weight[i]",
      "    dp[w] = max(dp[w], dp[w-weight[i]] + value[i])",
      "return dp[capacity]",
    ],
    complexity: {
      time: { best: "O(n·W)", average: "O(n·W)", worst: "O(n·W)" },
      space: "O(W)",
    },
    about:
      "0/1 Knapsack uses dynamic programming to find the maximum value achievable with a given capacity. Each item can be used at most once.",
    pros: [
      "Optimal solution for 0/1 knapsack",
      "Space-optimized with 1D DP array",
      "Handles integer weights efficiently",
    ],
    cons: ["Pseudopolynomial time O(n·W)", "Not suitable for large capacities"],
    code: {
      javascript: `function knapsack(values, weights, capacity) {
  const n = values.length;
  const dp = Array(capacity + 1).fill(0);

  for (let i = 0; i < n; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }

  return dp[capacity];
}`,
      python: `def knapsack(values, weights, capacity):
    n = len(values)
    dp = [0] * (capacity + 1)

    for i in range(n):
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])

    return dp[capacity]`,
      java: `public static int knapsack(int[] values, int[] weights, int capacity) {
    int n = values.length;
    int[] dp = new int[capacity + 1];

    for (int i = 0; i < n; i++) {
        for (int w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }

    return dp[capacity];
}`,
      cpp: `int knapsack(vector<int>& values, vector<int>& weights, int capacity) {
    int n = values.size();
    vector<int> dp(capacity + 1, 0);

    for (int i = 0; i < n; i++) {
        for (int w = capacity; w >= weights[i]; w--) {
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }

    return dp[capacity];
}`,
    },
    codeLineMap: {
      javascript: [2, 4, 5, 6, 7, 10],
      python: [2, 4, 5, 6, 7, 9],
      java: [2, 4, 5, 6, 7, 10],
      cpp: [2, 4, 5, 6, 7, 10],
    },
    load: () => import("./knapsack"),
  },
  {
    slug: "lis",
    title: "Longest Increasing Subsequence",
    topic: "dp",
    summary:
      "O(n²) dynamic programming solution to find the length of the longest strictly increasing subsequence.",
    pseudocode: [
      "dp[i] = 1 for all i",
      "for i = 1 to n-1",
      "  for j = 0 to i-1",
      "    if arr[j] < arr[i]",
      "      dp[i] = max(dp[i], dp[j] + 1)",
      "return max(dp)",
    ],
    complexity: {
      time: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
      space: "O(n)",
    },
    about:
      "LIS uses DP where dp[i] represents the length of the longest increasing subsequence ending at index i. Each element is compared with all previous elements.",
    pros: [
      "Simple to understand",
      "Straightforward implementation",
      "O(n) space",
    ],
    cons: [
      "O(n²) time - slower than O(n log n) binary search approach",
      "Does not reconstruct the actual subsequence",
    ],
    code: {
      javascript: `function lis(arr) {
  const n = arr.length;
  const dp = Array(n).fill(1);

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp);
}`,
      python: `def lis(arr):
    n = len(arr)
    dp = [1] * n

    for i in range(1, n):
        for j in range(i):
            if arr[j] < arr[i]:
                dp[i] = max(dp[i], dp[j] + 1)

    return max(dp)`,
      java: `public static int lis(int[] arr) {
    int n = arr.length;
    int[] dp = new int[n];
    Arrays.fill(dp, 1);

    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (arr[j] < arr[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }

    return Arrays.stream(dp).max().getAsInt();
}`,
      cpp: `int lis(vector<int>& arr) {
    int n = arr.size();
    vector<int> dp(n, 1);

    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (arr[j] < arr[i]) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
    }

    return *max_element(dp.begin(), dp.end());
}`,
    },
    codeLineMap: {
      javascript: [2, 4, 5, 6, 7, 11],
      python: [2, 4, 5, 6, 7, 10],
      java: [2, 4, 5, 6, 7, 11],
      cpp: [2, 4, 5, 6, 7, 11],
    },
    load: () => import("./lis"),
  },
  {
    slug: "edit-distance",
    title: "Edit Distance (Levenshtein)",
    topic: "dp",
    summary:
      "Compute the minimum number of insertions, deletions, or substitutions to transform one sequence into another.",
    pseudocode: [
      "dp[0][j] = j, dp[i][0] = i",
      "for i = 1 to m",
      "  for j = 1 to n",
      "    dp[i][j] = min(insert, delete, replace)",
      "return dp[m][n]",
    ],
    complexity: {
      time: { best: "O(m·n)", average: "O(m·n)", worst: "O(m·n)" },
      space: "O(min(m,n))",
    },
    about:
      "Edit distance (Levenshtein) finds the minimum edits to transform one string/sequence into another. Uses a DP table with insert, delete, and replace operations.",
    pros: [
      "Optimal solution",
      "Space-optimized with two rows",
      "Widely used in spell-checking, DNA alignment",
    ],
    cons: [
      "Quadratic time and space for full table",
      "Does not output the actual edit operations",
    ],
    code: {
      javascript: `function editDistance(s1, s2) {
  const m = s1.length, n = s2.length;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
    }
    prev = curr;
  }

  return prev[n];
}`,
      python: `def edit_distance(s1, s2):
    m, n = len(s1), len(s2)
    prev = list(range(n + 1))

    for i in range(1, m + 1):
        curr = [i]
        for j in range(1, n + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            curr.append(min(
                curr[j - 1] + 1,
                prev[j] + 1,
                prev[j - 1] + cost
            ))
        prev = curr

    return prev[n]`,
      java: `public static int editDistance(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    int[] prev = new int[n + 1];
    for (int j = 0; j <= n; j++) prev[j] = j;

    for (int i = 1; i <= m; i++) {
        int[] curr = new int[n + 1];
        curr[0] = i;
        for (int j = 1; j <= n; j++) {
            int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
            curr[j] = Math.min(
                curr[j - 1] + 1,
                prev[j] + 1,
                prev[j - 1] + cost
            );
        }
        prev = curr;
    }

    return prev[n];
}`,
      cpp: `int editDistance(const string& s1, const string& s2) {
    int m = s1.size(), n = s2.size();
    vector<int> prev(n + 1);
    iota(prev.begin(), prev.end(), 0);

    for (int i = 1; i <= m; i++) {
        vector<int> curr(n + 1);
        curr[0] = i;
        for (int j = 1; j <= n; j++) {
            int cost = s1[i - 1] == s2[j - 1] ? 0 : 1;
            curr[j] = min({
                curr[j - 1] + 1,
                prev[j] + 1,
                prev[j - 1] + cost
            });
        }
        prev = curr;
    }

    return prev[n];
}`,
    },
    codeLineMap: {
      javascript: [2, 5, 6, 7, 8, 9, 10, 14],
      python: [2, 5, 6, 7, 8, 9, 10, 14],
      java: [2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18],
      cpp: [2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18],
    },
    load: () => import("./editDistance"),
  },
];
