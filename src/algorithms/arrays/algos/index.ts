import type { AlgoMeta } from "@/types/algorithms";

export const arrayAlgos: AlgoMeta[] = [
  {
    slug: "find-maximum",
    title: "Find Maximum",
    topic: "arrays",
    summary:
      "Algorithm to find the maximum element in an array by comparing each element.",
    pseudocode: [
      "max = arr[0]",
      "maxIndex = 0",
      "for i = 1 to n-1",
      "  if arr[i] > max",
      "    max = arr[i]",
      "    maxIndex = i",
      "return max, maxIndex",
    ],
    complexity: {
      time: { best: "O(n)", average: "O(n)", worst: "O(n)" },
      space: "O(1)",
    },
    about:
      "This algorithm iterates through the array once, keeping track of the maximum value and its index.",
    pros: [
      "Simple and efficient",
      "Linear time complexity",
      "Constant space complexity",
    ],
    cons: [
      "Requires traversing entire array",
      "Cannot be optimized further for unsorted arrays",
    ],
    code: {
      javascript: `function findMaximum(arr) {
  let max = arr[0];
  let maxIndex = 0;
  
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
      maxIndex = i;
    }
  }
  
  return { value: max, index: maxIndex };
}`,
      python: `def find_maximum(arr):
    max_val = arr[0]
    max_index = 0
    
    for i in range(1, len(arr)):
        if arr[i] > max_val:
            max_val = arr[i]
            max_index = i
    
    return max_val, max_index`,
      java: `public static int[] findMaximum(int[] arr) {
    int max = arr[0];
    int maxIndex = 0;
    
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
            maxIndex = i;
        }
    }
    
    return new int[]{max, maxIndex};
}`,
      cpp: `pair<int, int> findMaximum(vector<int>& arr) {
    int max_val = arr[0];
    int max_index = 0;
    
    for (int i = 1; i < arr.size(); i++) {
        if (arr[i] > max_val) {
            max_val = arr[i];
            max_index = i;
        }
    }
    
    return make_pair(max_val, max_index);
}`,
    },
    codeLineMap: {
      javascript: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      python: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      java: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      cpp: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
    load: () => import("./findMaximum"),
  },
  {
    slug: "reverse-array",
    title: "Reverse Array",
    topic: "arrays",
    summary:
      "Algorithm to reverse an array in-place using two pointers technique.",
    pseudocode: [
      "left = 0",
      "right = n-1",
      "while left < right",
      "  swap arr[left] and arr[right]",
      "  left = left + 1",
      "  right = right - 1",
    ],
    complexity: {
      time: { best: "O(n)", average: "O(n)", worst: "O(n)" },
      space: "O(1)",
      inPlace: true,
    },
    about:
      "This algorithm reverses an array by swapping elements from both ends moving towards the center.",
    pros: [
      "In-place algorithm",
      "Optimal time complexity",
      "Simple two-pointer technique",
    ],
    cons: ["Modifies original array", "Cannot be parallelized easily"],
    code: {
      javascript: `function reverseArray(arr) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left < right) {
    // Swap elements
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  
  return arr;
}`,
      python: `def reverse_array(arr):
    left, right = 0, len(arr) - 1
    
    while left < right:
        # Swap elements
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    
    return arr`,
      java: `public static void reverseArray(int[] arr) {
    int left = 0;
    int right = arr.length - 1;
    
    while (left < right) {
        // Swap elements
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++;
        right--;
    }
}`,
      cpp: `void reverseArray(vector<int>& arr) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left < right) {
        // Swap elements
        swap(arr[left], arr[right]);
        left++;
        right--;
    }
}`,
    },
    codeLineMap: {
      javascript: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      python: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      java: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      cpp: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    load: () => import("./reverseArray"),
  },
];

export { run as findMaximum } from "./findMaximum";
export { run as reverseArray } from "./reverseArray";
