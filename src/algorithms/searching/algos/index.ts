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
];

// Removed static exports to allow proper code splitting
// Use dynamic imports via the AlgoMeta.load() method instead
