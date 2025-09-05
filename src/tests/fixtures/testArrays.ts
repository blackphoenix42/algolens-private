// Test data fixtures for algorithm testing

export const testArrays = {
  empty: [],
  single: [42],
  sorted: [1, 2, 3, 4, 5],
  reverse: [5, 4, 3, 2, 1],
  duplicates: [3, 1, 4, 1, 5, 9, 2, 6, 5],
  random: [64, 34, 25, 12, 22, 11, 90],
  large: Array.from({ length: 100 }, (_, i) => 100 - i),
} as const;

export const expectedResults = {
  empty: [],
  single: [42],
  sorted: [1, 2, 3, 4, 5],
  reverse: [1, 2, 3, 4, 5],
  duplicates: [1, 1, 2, 3, 4, 5, 5, 6, 9],
  random: [11, 12, 22, 25, 34, 64, 90],
  large: Array.from({ length: 100 }, (_, i) => i + 1),
} as const;
