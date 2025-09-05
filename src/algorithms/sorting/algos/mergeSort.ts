import type { Algorithm, Frame } from "@/engine/types";

export const run: Algorithm = function* mergeSort(input: unknown) {
  const arr = input as number[];

  yield {
    array: [...arr],
    highlights: {},
    explain: "Starting Merge Sort",
    pcLine: 1,
  };

  function* mergeSortHelper(
    arr: number[],
    left: number,
    right: number
  ): Generator<Frame> {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);

      yield {
        array: [...arr],
        highlights: {
          indices: [left, mid, right],
        },
        explain: `Dividing array: [${left}...${mid}] and [${mid + 1}...${right}]`,
        pcLine: 2,
      };

      yield* mergeSortHelper(arr, left, mid);
      yield* mergeSortHelper(arr, mid + 1, right);
      yield* merge(arr, left, mid, right);
    }
  }

  function* merge(
    arr: number[],
    left: number,
    mid: number,
    right: number
  ): Generator<Frame> {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    yield {
      array: [...arr],
      highlights: {
        indices: [left, right],
      },
      explain: `Merging subarrays [${left}...${mid}] and [${mid + 1}...${right}]`,
      pcLine: 5,
    };

    let i = 0,
      j = 0,
      k = left;

    while (i < leftArr.length && j < rightArr.length) {
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }

      yield {
        array: [...arr],
        highlights: {
          indices: [k],
        },
        explain: `Placed ${arr[k]} at position ${k}`,
        pcLine: 5,
      };

      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      yield {
        array: [...arr],
        highlights: {
          indices: [k],
        },
        explain: `Copying remaining element ${arr[k]}`,
        pcLine: 5,
      };
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      yield {
        array: [...arr],
        highlights: {
          indices: [k],
        },
        explain: `Copying remaining element ${arr[k]}`,
        pcLine: 5,
      };
      j++;
      k++;
    }
  }

  yield* mergeSortHelper(arr, 0, arr.length - 1);

  yield {
    array: [...arr],
    highlights: {},
    explain: "Merge Sort completed!",
    pcLine: 5,
  };
};
