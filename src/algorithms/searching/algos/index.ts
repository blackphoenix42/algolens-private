import type { AlgoMeta } from "@/types/algorithms";

export const searchingAlgos: AlgoMeta[] = [
  {
    slug: "linear-search",
    title: "Linear Search",
    topic: "searching",
    summary:
      "A simple searching algorithm that checks every element in the array sequentially.",
    pseudocode: [
      "for i = 0 to n-1",
      "  if arr[i] == target",
      "    return i",
      "return -1",
    ],
    complexity: {
      time: { best: "O(1)", average: "O(n)", worst: "O(n)" },
      space: "O(1)",
    },
    about:
      "Linear search sequentially checks each element in the array until the target is found or the array is exhausted.",
    pros: [
      "Simple to implement",
      "Works on unsorted arrays",
      "No preprocessing required",
    ],
    cons: [
      "Poor time complexity for large arrays",
      "Inefficient for repeated searches",
    ],
    code: {
      javascript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`,
      python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
      java: `public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`,
      cpp: `int linearSearch(vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`,
    },
    codeLineMap: {
      javascript: [2, 3, 4, 7], // Maps pseudocode lines 0,1,2,3 to JS lines 2,3,4,7
      python: [2, 3, 4, 5], // Maps pseudocode lines 0,1,2,3 to Python lines 2,3,4,5
      java: [2, 3, 4, 7], // Maps pseudocode lines 0,1,2,3 to Java lines 2,3,4,7
      cpp: [2, 3, 4, 7], // Maps pseudocode lines 0,1,2,3 to C++ lines 2,3,4,7
    },
    load: () => import("./linearSearch"),
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    topic: "searching",
    summary:
      "An efficient searching algorithm that works on sorted arrays by repeatedly dividing the search interval in half.",
    pseudocode: [
      "left = 0, right = n-1",
      "while left <= right",
      "  mid = (left + right) / 2",
      "  if arr[mid] == target",
      "    return mid",
      "  else if arr[mid] < target",
      "    left = mid + 1",
      "  else",
      "    right = mid - 1",
      "return -1",
    ],
    complexity: {
      time: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
      space: "O(1)",
    },
    about:
      "Binary search efficiently finds an element in a sorted array by repeatedly dividing the search space in half.",
    pros: [
      "Very efficient O(log n) time complexity",
      "Simple logic",
      "Optimal for sorted arrays",
    ],
    cons: [
      "Requires sorted array",
      "Not suitable for linked lists",
      "Poor performance on small arrays due to overhead",
    ],
    code: {
      javascript: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`,
      python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`,
      java: `public static int binarySearch(int[] arr, int target) {
    int left = 0;
    int right = arr.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}`,
      cpp: `int binarySearch(vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}`,
    },
    codeLineMap: {
      javascript: [2, 5, 6, 8, 9, 10, 11, 12, 13, 17], // Maps pseudocode lines 0,1,2,3,4,5,6,7,8,9 to key JS lines
      python: [2, 4, 5, 7, 8, 9, 10, 11, 12, 14], // Maps pseudocode lines to key Python lines
      java: [2, 4, 5, 7, 8, 9, 10, 11, 12, 15], // Maps pseudocode lines to key Java lines
      cpp: [2, 4, 5, 7, 8, 9, 10, 11, 12, 14], // Maps pseudocode lines to key C++ lines
    },
    load: () => import("./binarySearch"),
  },
  {
    slug: "interpolation-search",
    title: "Interpolation Search",
    topic: "searching",
    summary:
      "A search algorithm for uniformly distributed sorted arrays that estimates probe position using linear interpolation.",
    pseudocode: [
      "low = 0, high = n-1",
      "while low <= high and target in [arr[low], arr[high]]",
      "  pos = low + ((target - arr[low]) * (high - low)) / (arr[high] - arr[low])",
      "  if arr[pos] == target",
      "    return pos",
      "  if arr[pos] < target",
      "    low = pos + 1",
      "  else",
      "    high = pos - 1",
      "return -1",
    ],
    complexity: {
      time: { best: "O(1)", average: "O(log log n)", worst: "O(n)" },
      space: "O(1)",
    },
    about:
      "Interpolation search estimates the position of the target using the value distribution, making it faster than binary search for uniformly distributed data.",
    pros: [
      "O(log log n) average for uniform distribution",
      "Faster than binary search when values are evenly spread",
      "Simple position formula",
    ],
    cons: [
      "Requires sorted array",
      "Worst case O(n) for non-uniform data",
      "Poor performance on skewed distributions",
    ],
    code: {
      javascript: `function interpolationSearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    const pos = low + Math.floor(
      ((target - arr[low]) * (high - low)) / (arr[high] - arr[low])
    );

    if (arr[pos] === target) return pos;
    if (arr[pos] < target) low = pos + 1;
    else high = pos - 1;
  }
  return -1;
}`,
      python: `def interpolation_search(arr, target):
    low, high = 0, len(arr) - 1

    while low <= high and arr[low] <= target <= arr[high]:
        pos = low + ((target - arr[low]) * (high - low)) // (arr[high] - arr[low])

        if arr[pos] == target:
            return pos
        if arr[pos] < target:
            low = pos + 1
        else:
            high = pos - 1
    return -1`,
      java: `public static int interpolationSearch(int[] arr, int target) {
    int low = 0;
    int high = arr.length - 1;

    while (low <= high && target >= arr[low] && target <= arr[high]) {
        int pos = low + ((target - arr[low]) * (high - low)) / (arr[high] - arr[low]);

        if (arr[pos] == target) return pos;
        if (arr[pos] < target) low = pos + 1;
        else high = pos - 1;
    }
    return -1;
}`,
      cpp: `int interpolationSearch(vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;

    while (low <= high && target >= arr[low] && target <= arr[high]) {
        int pos = low + ((target - arr[low]) * (high - low)) / (arr[high] - arr[low]);

        if (arr[pos] == target) return pos;
        if (arr[pos] < target) low = pos + 1;
        else high = pos - 1;
    }
    return -1;
}`,
    },
    codeLineMap: {
      javascript: [2, 4, 5, 7, 8, 9, 11],
      python: [2, 4, 5, 7, 8, 9, 11],
      java: [2, 4, 5, 7, 8, 9, 11],
      cpp: [2, 4, 5, 7, 8, 9, 11],
    },
    load: () => import("./interpolationSearch"),
  },
  {
    slug: "ternary-search",
    title: "Ternary Search",
    topic: "searching",
    summary:
      "A divide-and-conquer search that splits the sorted range into three parts using two midpoints.",
    pseudocode: [
      "low = 0, high = n-1",
      "while low <= high",
      "  mid1 = low + (high - low) / 3",
      "  mid2 = high - (high - low) / 3",
      "  if arr[mid1] == target return mid1",
      "  if arr[mid2] == target return mid2",
      "  if target < arr[mid1]",
      "    high = mid1 - 1",
      "  else if target > arr[mid2]",
      "    low = mid2 + 1",
      "  else",
      "    low = mid1 + 1, high = mid2 - 1",
      "return -1",
    ],
    complexity: {
      time: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
      space: "O(1)",
    },
    about:
      "Ternary search divides the search space into three parts, comparing the target with two midpoints to eliminate one-third of the range per iteration.",
    pros: [
      "Works on sorted arrays",
      "Clear divide-by-three logic",
      "Useful for unimodal functions",
    ],
    cons: [
      "More comparisons per iteration than binary search",
      "Higher constant factor",
      "Binary search is typically faster in practice",
    ],
    code: {
      javascript: `function ternarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid1 = low + Math.floor((high - low) / 3);
    const mid2 = high - Math.floor((high - low) / 3);

    if (arr[mid1] === target) return mid1;
    if (arr[mid2] === target) return mid2;

    if (target < arr[mid1]) high = mid1 - 1;
    else if (target > arr[mid2]) low = mid2 + 1;
    else {
      low = mid1 + 1;
      high = mid2 - 1;
    }
  }
  return -1;
}`,
      python: `def ternary_search(arr, target):
    low, high = 0, len(arr) - 1

    while low <= high:
        mid1 = low + (high - low) // 3
        mid2 = high - (high - low) // 3

        if arr[mid1] == target:
            return mid1
        if arr[mid2] == target:
            return mid2

        if target < arr[mid1]:
            high = mid1 - 1
        elif target > arr[mid2]:
            low = mid2 + 1
        else:
            low, high = mid1 + 1, mid2 - 1
    return -1`,
      java: `public static int ternarySearch(int[] arr, int target) {
    int low = 0;
    int high = arr.length - 1;

    while (low <= high) {
        int mid1 = low + (high - low) / 3;
        int mid2 = high - (high - low) / 3;

        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;

        if (target < arr[mid1]) high = mid1 - 1;
        else if (target > arr[mid2]) low = mid2 + 1;
        else {
            low = mid1 + 1;
            high = mid2 - 1;
        }
    }
    return -1;
}`,
      cpp: `int ternarySearch(vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;

    while (low <= high) {
        int mid1 = low + (high - low) / 3;
        int mid2 = high - (high - low) / 3;

        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;

        if (target < arr[mid1]) high = mid1 - 1;
        else if (target > arr[mid2]) low = mid2 + 1;
        else {
            low = mid1 + 1;
            high = mid2 - 1;
        }
    }
    return -1;
}`,
    },
    codeLineMap: {
      javascript: [2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 18],
      python: [2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 17],
      java: [2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 18],
      cpp: [2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 17],
    },
    load: () => import("./ternarySearch"),
  },
  {
    slug: "exponential-search",
    title: "Exponential Search",
    topic: "searching",
    summary:
      "Finds a range by doubling the index, then performs binary search within that range. Ideal for unbounded or infinite arrays.",
    pseudocode: [
      "if arr[0] == target return 0",
      "bound = 1",
      "while bound < n and arr[bound] < target",
      "  bound *= 2",
      "Binary search in range [bound/2, min(bound, n-1)]",
      "  mid = (left + right) / 2",
      "  if arr[mid] == target return mid",
      "  if arr[mid] < target left = mid + 1",
      "  else right = mid - 1",
      "return -1",
    ],
    complexity: {
      time: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
      space: "O(1)",
    },
    about:
      "Exponential search first finds a range containing the target by exponentially increasing the index, then performs binary search within that range.",
    pros: [
      "Works on unbounded/infinite arrays",
      "O(log n) when target is near start",
      "Combines range-finding with binary search",
    ],
    cons: [
      "Requires sorted array",
      "Overhead for small arrays",
      "Binary search alone may suffice for bounded arrays",
    ],
    code: {
      javascript: `function exponentialSearch(arr, target) {
  if (arr[0] === target) return 0;

  let bound = 1;
  while (bound < arr.length && arr[bound] < target) {
    bound *= 2;
  }

  let left = Math.floor(bound / 2);
  let right = Math.min(bound, arr.length - 1);

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
      python: `def exponential_search(arr, target):
    if arr[0] == target:
        return 0

    bound = 1
    while bound < len(arr) and arr[bound] < target:
        bound *= 2

    left, right = bound // 2, min(bound, len(arr) - 1)

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      java: `public static int exponentialSearch(int[] arr, int target) {
    if (arr[0] == target) return 0;

    int bound = 1;
    while (bound < arr.length && arr[bound] < target) {
        bound *= 2;
    }

    int left = bound / 2;
    int right = Math.min(bound, arr.length - 1);

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
      cpp: `int exponentialSearch(vector<int>& arr, int target) {
    if (arr[0] == target) return 0;

    int bound = 1;
    while (bound < arr.size() && arr[bound] < target) {
        bound *= 2;
    }

    int left = bound / 2;
    int right = min(bound, (int)arr.size() - 1);

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    },
    codeLineMap: {
      javascript: [2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 18],
      python: [2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 17],
      java: [2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 18],
      cpp: [2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 17],
    },
    load: () => import("./exponentialSearch"),
  },
];

// Removed static exports to allow proper code splitting
// Use dynamic imports via the AlgoMeta.load() method instead
