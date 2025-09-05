import type { AlgoMeta } from "@/types/algorithms";

// Algorithm metadata
export const sortingAlgos: AlgoMeta[] = [
  {
    slug: "bubble-sort",
    title: "Bubble Sort",
    topic: "sorting",
    summary:
      "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    pseudocode: [
      "for i = 0 to n-2",
      "  for j = 0 to n-i-2",
      "    if arr[j] > arr[j+1]",
      "      swap arr[j] and arr[j+1]",
    ],
    complexity: {
      time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
      space: "O(1)",
      stable: true,
      inPlace: true,
    },
    about:
      "Bubble sort is a simple sorting algorithm that works by repeatedly swapping adjacent elements if they are in wrong order.",
    pros: [
      "Simple to understand and implement",
      "Stable sorting algorithm",
      "In-place sorting",
    ],
    cons: ["Poor time complexity O(n²)", "Not suitable for large datasets"],
    code: {
      javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
      java: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
      cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
    },
    codeLineMap: {
      javascript: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      python: [1, 2, 3, 4, 5, 6],
      java: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      cpp: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    load: () => import("./bubbleSort"),
  },
  {
    slug: "selection-sort",
    title: "Selection Sort",
    topic: "sorting",
    summary:
      "An in-place comparison sorting algorithm that divides the input list into sorted and unsorted regions.",
    pseudocode: [
      "for i = 0 to n-2",
      "  minIndex = i",
      "  for j = i+1 to n-1",
      "    if arr[j] < arr[minIndex]",
      "      minIndex = j",
      "  swap arr[i] and arr[minIndex]",
    ],
    complexity: {
      time: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
      space: "O(1)",
      stable: false,
      inPlace: true,
    },
    about:
      "Selection sort works by finding the minimum element and placing it at the beginning.",
    pros: [
      "Simple implementation",
      "In-place sorting",
      "Performs well on small lists",
    ],
    cons: [
      "Poor time complexity O(n²)",
      "Not stable",
      "Many unnecessary swaps",
    ],
    code: {
      javascript: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
  }
  return arr;
}`,
      python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_index = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_index]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr`,
      java: `public static void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        int temp = arr[i];
        arr[i] = arr[minIndex];
        arr[minIndex] = temp;
    }
}`,
      cpp: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        swap(arr[i], arr[minIndex]);
    }
}`,
    },
    codeLineMap: {
      javascript: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      python: [1, 2, 3, 4, 5, 6, 7, 8],
      java: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      cpp: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    load: () => import("./selectionSort"),
  },
  {
    slug: "insertion-sort",
    title: "Insertion Sort",
    topic: "sorting",
    summary:
      "A simple sorting algorithm that builds the final sorted array one item at a time.",
    pseudocode: [
      "for i = 1 to n-1",
      "  key = arr[i]",
      "  j = i - 1",
      "  while j >= 0 and arr[j] > key",
      "    arr[j+1] = arr[j]",
      "    j = j - 1",
      "  arr[j+1] = key",
    ],
    complexity: {
      time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
      space: "O(1)",
      stable: true,
      inPlace: true,
    },
    about:
      "Insertion sort iterates through the array and for each element, finds the correct position in the already sorted portion.",
    pros: [
      "Simple implementation",
      "Efficient for small datasets",
      "Adaptive",
      "Stable",
      "In-place",
    ],
    cons: [
      "Poor time complexity for large datasets",
      "More writes than selection sort",
    ],
    code: {
      javascript: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
      python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
      java: `public static void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
      cpp: `void insertionSort(vector<int>& arr) {
    for (int i = 1; i < arr.size(); i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    },
    codeLineMap: {
      javascript: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      python: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      java: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      cpp: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    load: () => import("./insertionSort"),
  },
  {
    slug: "merge-sort",
    title: "Merge Sort",
    topic: "sorting",
    summary: "An efficient, stable, divide-and-conquer sorting algorithm.",
    pseudocode: [
      "if left < right",
      "  mid = (left + right) / 2",
      "  mergeSort(arr, left, mid)",
      "  mergeSort(arr, mid+1, right)",
      "  merge(arr, left, mid, right)",
    ],
    complexity: {
      time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
      space: "O(n)",
      stable: true,
      inPlace: false,
    },
    about:
      "Merge sort divides the array into halves, sorts them separately, then merges them back together.",
    pros: [
      "Consistent O(n log n) performance",
      "Stable sorting",
      "Predictable performance",
    ],
    cons: [
      "Requires O(n) extra space",
      "Not in-place",
      "Slower than quicksort in practice",
    ],
    code: {
      javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  let result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
      java: `public static void mergeSort(int[] arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

public static void merge(int[] arr, int left, int mid, int right) {
    int[] temp = new int[right - left + 1];
    int i = left, j = mid + 1, k = 0;
    
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
        }
    }
    
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    
    for (i = left; i <= right; i++) {
        arr[i] = temp[i - left];
    }
}`,
      cpp: `void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> temp(right - left + 1);
    int i = left, j = mid + 1, k = 0;
    
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
        }
    }
    
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    
    for (i = left; i <= right; i++) {
        arr[i] = temp[i - left];
    }
}`,
    },
    codeLineMap: {
      javascript: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23,
      ],
      python: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23,
      ],
      java: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25,
      ],
      cpp: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22,
      ],
    },
    load: () => import("./mergeSort"),
  },
  {
    slug: "quick-sort",
    title: "Quick Sort",
    topic: "sorting",
    summary:
      "An efficient divide-and-conquer sorting algorithm that works by selecting a pivot element.",
    pseudocode: [
      "if low < high",
      "  pivotIndex = partition(arr, low, high)",
      "  quickSort(arr, low, pivotIndex-1)",
      "  quickSort(arr, pivotIndex+1, high)",
    ],
    complexity: {
      time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
      space: "O(log n)",
      stable: false,
      inPlace: true,
    },
    about:
      "Quick sort picks a pivot element and partitions the array around the pivot.",
    pros: [
      "Generally faster than other O(n log n) algorithms",
      "In-place sorting",
      "Cache efficient",
    ],
    cons: [
      "Worst case O(n²) performance",
      "Not stable",
      "Performance depends on pivot selection",
    ],
    code: {
      javascript: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
      python: `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        pivot_index = partition(arr, low, high)
        quick_sort(arr, low, pivot_index - 1)
        quick_sort(arr, pivot_index + 1, high)
    
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
      java: `public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}

public static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}`,
      cpp: `void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    
    swap(arr[i + 1], arr[high]);
    return i + 1;
}`,
    },
    codeLineMap: {
      javascript: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21,
      ],
      python: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ],
      java: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23,
      ],
      cpp: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    },
    load: () => import("./quickSort"),
  },
];

// Note: Individual algorithm exports removed to avoid naming conflicts
// Import them directly from their respective files if needed
