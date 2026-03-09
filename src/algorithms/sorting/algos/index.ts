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
      javascript: [3, 4, 5, 6], // Maps pseudocode lines 0,1,2,3 to JS lines 3,4,5,6
      python: [3, 4, 5, 6], // Maps pseudocode lines 0,1,2,3 to Python lines 3,4,5,6
      java: [3, 4, 5, 6], // Maps pseudocode lines 0,1,2,3 to Java lines 3,4,5,6
      cpp: [3, 4, 5, 6], // Maps pseudocode lines 0,1,2,3 to C++ lines 3,4,5,6
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
      javascript: [3, 4, 5, 6, 7, 10], // Maps pseudocode lines 0,1,2,3,4,5 to JS lines 3,4,5,6,7,10
      python: [3, 4, 5, 6, 7, 8], // Maps pseudocode lines 0,1,2,3,4,5 to Python lines 3,4,5,6,7,8
      java: [3, 4, 5, 6, 7, 10], // Maps pseudocode lines 0,1,2,3,4,5 to Java lines 3,4,5,6,7,10
      cpp: [3, 4, 5, 6, 7, 9], // Maps pseudocode lines 0,1,2,3,4,5 to C++ lines 3,4,5,6,7,9
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
      javascript: [2, 3, 4, 5, 6, 7, 9], // Maps pseudocode lines 0,1,2,3,4,5,6 to JS lines 2,3,4,5,6,7,9
      python: [2, 3, 4, 5, 6, 7, 8], // Maps pseudocode lines 0,1,2,3,4,5,6 to Python lines 2,3,4,5,6,7,8
      java: [2, 3, 4, 5, 6, 7, 9], // Maps pseudocode lines 0,1,2,3,4,5,6 to Java lines 2,3,4,5,6,7,9
      cpp: [2, 3, 4, 5, 6, 7, 9], // Maps pseudocode lines 0,1,2,3,4,5,6 to C++ lines 2,3,4,5,6,7,9
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
      javascript: [2, 3, 4, 5], // Maps pseudocode lines 0,1,2,3 to JS lines 2,3,4,5
      python: [4, 5, 6, 7], // Maps pseudocode lines 0,1,2,3 to Python lines 4,5,6,7
      java: [2, 3, 4, 5], // Maps pseudocode lines 0,1,2,3 to Java lines 2,3,4,5
      cpp: [2, 3, 4, 5], // Maps pseudocode lines 0,1,2,3 to C++ lines 2,3,4,5
    },
    load: () => import("./quickSort"),
  },
  {
    slug: "heap-sort",
    title: "Heap Sort",
    topic: "sorting",
    summary:
      "A comparison-based sorting algorithm that uses a binary heap data structure. Builds a max heap, then repeatedly extracts the maximum.",
    pseudocode: [
      "Build max heap from array",
      "for end = n-1 down to 1",
      "  swap arr[0] with arr[end]",
      "  reduce heap size by 1",
      "  heapify(arr, 0, end)",
    ],
    complexity: {
      time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
      space: "O(1)",
      stable: false,
      inPlace: true,
    },
    about:
      "Heap sort builds a max heap from the array, then repeatedly extracts the maximum element and places it at the end. Uses the heapify operation to maintain heap property.",
    pros: [
      "O(n log n) guaranteed",
      "In-place sorting",
      "No extra space needed",
    ],
    cons: [
      "Not stable",
      "Poor cache performance",
      "Slower than quicksort in practice",
    ],
    code: {
      javascript: `function heapSort(arr) {
  const n = arr.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    heapify(arr, end, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
      python: `def heap_sort(arr):
    n = len(arr)

    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)

    for end in range(n - 1, 0, -1):
        arr[0], arr[end] = arr[end], arr[0]
        heapify(arr, end, 0)
    return arr

def heapify(arr, n, i):
    largest = i
    left, right = 2 * i + 1, 2 * i + 2

    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right

    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)`,
      java: `public static void heapSort(int[] arr) {
    int n = arr.length;

    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);

    for (int end = n - 1; end > 0; end--) {
        int temp = arr[0];
        arr[0] = arr[end];
        arr[end] = temp;
        heapify(arr, end, 0);
    }
}

static void heapify(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1, right = 2 * i + 2;

    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;

    if (largest != i) {
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        heapify(arr, n, largest);
    }
}`,
      cpp: `void heapSort(vector<int>& arr) {
    int n = arr.size();

    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);

    for (int end = n - 1; end > 0; end--) {
        swap(arr[0], arr[end]);
        heapify(arr, end, 0);
    }
}

void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1, right = 2 * i + 2;

    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;

    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}`,
    },
    codeLineMap: {
      javascript: [3, 7, 8, 9, 15],
      python: [3, 7, 8, 9, 15],
      java: [3, 7, 8, 9, 15],
      cpp: [3, 7, 8, 9, 15],
    },
    load: () => import("./heapSort"),
  },
  {
    slug: "shell-sort",
    title: "Shell Sort",
    topic: "sorting",
    summary:
      "A generalization of insertion sort that allows exchange of elements that are far apart. Uses gap sequences to improve performance.",
    pseudocode: [
      "Compute initial gap (Knuth: gap = gap*3+1)",
      "while gap >= 1",
      "  for i = gap to n-1",
      "    while j >= gap and arr[j-gap] > temp",
      "      arr[j] = arr[j-gap], j -= gap",
      "    arr[j] = temp",
    ],
    complexity: {
      time: { best: "O(n log n)", average: "O(n^1.3)", worst: "O(n²)" },
      space: "O(1)",
      stable: false,
      inPlace: true,
    },
    about:
      "Shell sort improves insertion sort by comparing elements separated by a gap. Uses Knuth's gap sequence (1, 4, 13, 40...) for better performance.",
    pros: [
      "Better than insertion sort for medium-sized data",
      "In-place",
      "Simple to implement",
    ],
    cons: [
      "Not stable",
      "Gap sequence affects performance",
      "Complex analysis",
    ],
    code: {
      javascript: `function shellSort(arr) {
  const n = arr.length;
  let gap = 1;
  while (gap < n) gap = gap * 3 + 1;
  gap = Math.floor(gap / 3);

  while (gap >= 1) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
    gap = Math.floor(gap / 3);
  }
  return arr;
}`,
      python: `def shell_sort(arr):
    n = len(arr)
    gap = 1
    while gap < n:
        gap = gap * 3 + 1
    gap //= 3

    while gap >= 1:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 3
    return arr`,
      java: `public static void shellSort(int[] arr) {
    int n = arr.length;
    int gap = 1;
    while (gap < n) gap = gap * 3 + 1;
    gap /= 3;

    while (gap >= 1) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
        gap /= 3;
    }
}`,
      cpp: `void shellSort(vector<int>& arr) {
    int n = arr.size();
    int gap = 1;
    while (gap < n) gap = gap * 3 + 1;
    gap /= 3;

    while (gap >= 1) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
        gap /= 3;
    }
}`,
    },
    codeLineMap: {
      javascript: [2, 6, 7, 8, 9, 11],
      python: [2, 6, 7, 8, 9, 11],
      java: [2, 6, 7, 8, 9, 11],
      cpp: [2, 6, 7, 8, 9, 11],
    },
    load: () => import("./shellSort"),
  },
  {
    slug: "counting-sort",
    title: "Counting Sort",
    topic: "sorting",
    summary:
      "A non-comparison sorting algorithm that counts occurrences of each value. Works on non-negative integers with a known range.",
    pseudocode: [
      "Find max value in array",
      "Create count array of size max+1",
      "Count occurrences of each value",
      "Compute cumulative counts (positions)",
      "Place elements in output using positions",
    ],
    complexity: {
      time: { best: "O(n+k)", average: "O(n+k)", worst: "O(n+k)" },
      space: "O(k)",
      stable: true,
      inPlace: false,
    },
    about:
      "Counting sort counts the number of occurrences of each value, then uses cumulative counts to determine each element's position. Works only on non-negative integers.",
    pros: ["Linear time when k is small", "Stable sort", "No comparisons"],
    cons: [
      "Only for non-negative integers",
      "Space O(k) - inefficient when range is large",
      "Not in-place",
    ],
    code: {
      javascript: `function countingSort(arr) {
  if (arr.length === 0) return arr;
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);

  for (let i = 0; i < arr.length; i++)
    count[arr[i]]++;

  for (let i = 1; i <= max; i++)
    count[i] += count[i - 1];

  const output = new Array(arr.length);
  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
  }
  return output;
}`,
      python: `def counting_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    count = [0] * (max_val + 1)

    for x in arr:
        count[x] += 1

    for i in range(1, max_val + 1):
        count[i] += count[i - 1]

    output = [0] * len(arr)
    for i in range(len(arr) - 1, -1, -1):
        output[count[arr[i]] - 1] = arr[i]
        count[arr[i]] -= 1
    return output`,
      java: `public static int[] countingSort(int[] arr) {
    if (arr.length == 0) return arr;
    int max = Arrays.stream(arr).max().getAsInt();
    int[] count = new int[max + 1];

    for (int x : arr) count[x]++;

    for (int i = 1; i <= max; i++)
        count[i] += count[i - 1];

    int[] output = new int[arr.length];
    for (int i = arr.length - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    return output;
}`,
      cpp: `vector<int> countingSort(vector<int>& arr) {
    if (arr.empty()) return arr;
    int maxVal = *max_element(arr.begin(), arr.end());
    vector<int> count(maxVal + 1, 0);

    for (int x : arr) count[x]++;

    for (int i = 1; i <= maxVal; i++)
        count[i] += count[i - 1];

    vector<int> output(arr.size());
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    return output;
}`,
    },
    codeLineMap: {
      javascript: [2, 4, 6, 8, 11],
      python: [2, 5, 7, 10, 13],
      java: [2, 5, 7, 10, 13],
      cpp: [2, 5, 7, 10, 13],
    },
    load: () => import("./countingSort"),
  },
  {
    slug: "radix-sort",
    title: "Radix Sort",
    topic: "sorting",
    summary:
      "A non-comparison sorting algorithm that sorts integers digit by digit from least significant to most significant (LSD).",
    pseudocode: [
      "Find max value",
      "for each digit position (LSD to MSD)",
      "  Count occurrences of each digit",
      "  Compute cumulative positions",
      "  Place elements in output by digit",
      "  Copy output back to array",
    ],
    complexity: {
      time: { best: "O(nk)", average: "O(nk)", worst: "O(nk)" },
      space: "O(n+k)",
      stable: true,
      inPlace: false,
    },
    about:
      "Radix sort processes digits from least significant to most. Each pass uses counting sort on the current digit. k is the number of digits.",
    pros: [
      "Linear time for fixed-width integers",
      "Stable when counting sort is stable",
      "Good for sorting strings",
    ],
    cons: [
      "Only for integers or fixed-length keys",
      "Extra space required",
      "Not in-place",
    ],
    code: {
      javascript: `function radixSort(arr) {
  if (arr.length === 0) return arr;
  const max = Math.max(...arr);
  let exp = 1;

  while (Math.floor(max / exp) > 0) {
    const count = new Array(10).fill(0);
    for (let i = 0; i < arr.length; i++)
      count[Math.floor(arr[i] / exp) % 10]++;

    for (let i = 1; i < 10; i++)
      count[i] += count[i - 1];

    const output = new Array(arr.length);
    for (let i = arr.length - 1; i >= 0; i--) {
      const d = Math.floor(arr[i] / exp) % 10;
      output[count[d] - 1] = arr[i];
      count[d]--;
    }
    for (let i = 0; i < arr.length; i++) arr[i] = output[i];
    exp *= 10;
  }
  return arr;
}`,
      python: `def radix_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    exp = 1

    while max_val // exp > 0:
        count = [0] * 10
        for x in arr:
            count[(x // exp) % 10] += 1

        for i in range(1, 10):
            count[i] += count[i - 1]

        output = [0] * len(arr)
        for i in range(len(arr) - 1, -1, -1):
            d = (arr[i] // exp) % 10
            output[count[d] - 1] = arr[i]
            count[d] -= 1
        arr = output
        exp *= 10
    return arr`,
      java: `public static void radixSort(int[] arr) {
    if (arr.length == 0) return;
    int max = Arrays.stream(arr).max().getAsInt();
    int exp = 1;

    while (max / exp > 0) {
        int[] count = new int[10];
        for (int x : arr)
            count[(x / exp) % 10]++;

        for (int i = 1; i < 10; i++)
            count[i] += count[i - 1];

        int[] output = new int[arr.length];
        for (int i = arr.length - 1; i >= 0; i--) {
            int d = (arr[i] / exp) % 10;
            output[count[d] - 1] = arr[i];
            count[d]--;
        }
        System.arraycopy(output, 0, arr, 0, arr.length);
        exp *= 10;
    }
}`,
      cpp: `void radixSort(vector<int>& arr) {
    if (arr.empty()) return;
    int maxVal = *max_element(arr.begin(), arr.end());
    int exp = 1;

    while (maxVal / exp > 0) {
        vector<int> count(10, 0);
        for (int x : arr)
            count[(x / exp) % 10]++;

        for (int i = 1; i < 10; i++)
            count[i] += count[i - 1];

        vector<int> output(arr.size());
        for (int i = arr.size() - 1; i >= 0; i--) {
            int d = (arr[i] / exp) % 10;
            output[count[d] - 1] = arr[i];
            count[d]--;
        }
        arr = output;
        exp *= 10;
    }
}`,
    },
    codeLineMap: {
      javascript: [2, 5, 6, 9, 12, 15],
      python: [2, 6, 7, 10, 13, 16],
      java: [2, 6, 7, 10, 13, 16],
      cpp: [2, 6, 7, 10, 13, 16],
    },
    load: () => import("./radixSort"),
  },
  {
    slug: "bucket-sort",
    title: "Bucket Sort",
    topic: "sorting",
    summary:
      "Distributes elements into buckets based on value range, sorts each bucket (e.g. with insertion sort), then concatenates.",
    pseudocode: [
      "Create empty buckets",
      "Find min and max values",
      "Distribute elements into buckets",
      "Sort each bucket (insertion sort)",
      "Concatenate buckets into result",
    ],
    complexity: {
      time: { best: "O(n+k)", average: "O(n+k)", worst: "O(n²)" },
      space: "O(n)",
      stable: true,
      inPlace: false,
    },
    about:
      "Bucket sort assumes uniform distribution. Elements are distributed into buckets, each bucket is sorted, then buckets are concatenated for the final result.",
    pros: [
      "Linear average case for uniform distribution",
      "Stable when bucket sort is stable",
      "Good for floating-point numbers",
    ],
    cons: [
      "Worst case O(n²) if all in one bucket",
      "Requires knowledge of data distribution",
      "Extra space for buckets",
    ],
    code: {
      javascript: `function bucketSort(arr) {
  if (arr.length === 0) return arr;
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const bucketCount = Math.min(arr.length, 10);
  const bucketSize = (max - min) / bucketCount || 1;
  const buckets = Array.from({ length: bucketCount }, () => []);

  for (let i = 0; i < arr.length; i++) {
    const idx = Math.min(Math.floor((arr[i] - min) / bucketSize), bucketCount - 1);
    buckets[idx].push(arr[i]);
  }

  for (let b = 0; b < bucketCount; b++) {
    buckets[b].sort((a, b) => a - b);
  }

  return buckets.flat();
}`,
      python: `def bucket_sort(arr):
    if not arr:
        return arr
    max_val, min_val = max(arr), min(arr)
    bucket_count = min(len(arr), 10)
    bucket_size = (max_val - min_val) / bucket_count or 1
    buckets = [[] for _ in range(bucket_count)]

    for x in arr:
        idx = min(int((x - min_val) / bucket_size), bucket_count - 1)
        buckets[idx].append(x)

    for b in buckets:
        b.sort()

    return [x for b in buckets for x in b]`,
      java: `public static void bucketSort(double[] arr) {
    int n = arr.length;
    if (n == 0) return;
    ArrayList<ArrayList<Double>> buckets = new ArrayList<>(n);
    for (int i = 0; i < n; i++) buckets.add(new ArrayList<>());

    double max = Arrays.stream(arr).max().getAsDouble();
    double min = Arrays.stream(arr).min().getAsDouble();

    for (double x : arr) {
        int idx = (int) ((x - min) / (max - min + 1) * n);
        buckets.get(idx).add(x);
    }

    for (ArrayList<Double> b : buckets) Collections.sort(b);

    int i = 0;
    for (ArrayList<Double> b : buckets)
        for (double x : b) arr[i++] = x;
}`,
      cpp: `void bucketSort(vector<double>& arr) {
    int n = arr.size();
    if (n == 0) return;
    vector<vector<double>> buckets(n);

    double maxVal = *max_element(arr.begin(), arr.end());
    double minVal = *min_element(arr.begin(), arr.end());

    for (double x : arr) {
        int idx = (x - minVal) / (maxVal - minVal + 1) * n;
        buckets[idx].push_back(x);
    }

    for (auto& b : buckets) sort(b.begin(), b.end());

    int i = 0;
    for (auto& b : buckets)
        for (double x : b) arr[i++] = x;
}`,
    },
    codeLineMap: {
      javascript: [2, 5, 6, 9, 14, 16],
      python: [2, 5, 6, 9, 14, 16],
      java: [2, 5, 8, 11, 14, 17],
      cpp: [2, 5, 8, 11, 14, 17],
    },
    load: () => import("./bucketSort"),
  },
];

// Note: Individual algorithm exports removed to avoid naming conflicts
// Import them directly from their respective files if needed
