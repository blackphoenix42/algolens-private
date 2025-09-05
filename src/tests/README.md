# Tests Directory Structure

This directory contains unit tests for the AlgoLens application. The structure has been organized for clarity and maintainability.

## Directory Structure

```
src/tests/
├── fixtures/           # Test data and constants
│   └── testArrays.ts  # Pre-defined test arrays and expected results
├── helpers/           # Test utilities and shared functions
│   └── algorithmTestUtils.ts  # Utilities for testing algorithms
├── unit/             # Unit test files
│   ├── basic.test.ts     # Basic functionality tests
│   └── sorting.test.ts   # Sorting algorithm tests
└── setup.ts          # Vitest setup and configuration
```

## Key Features

### Fixtures (`fixtures/`)

- **testArrays.ts**: Contains predefined test arrays (empty, sorted, reverse, random, etc.) and their expected sorted results
- Reusable across multiple test files
- Type-safe constants for consistent testing

### Helpers (`helpers/`)

- **algorithmTestUtils.ts**:
  - `testSortingAlgorithm()`: Comprehensive test suite for any sorting algorithm
  - `getFinalArray()`: Extracts the final sorted array from algorithm frames
  - Validates algorithm correctness, frame structure, and edge cases

### Unit Tests (`unit/`)

- **basic.test.ts**: Environment and basic functionality verification
- **sorting.test.ts**:
  - Tests all sorting algorithms (bubble, selection, insertion, merge, quick)
  - Performance tests for large arrays
  - Cross-algorithm validation

## Running Tests

```bash
# Run all unit tests
npm test

# Run tests in single mode (no watch)
npx vitest run

# Run specific test file
npx vitest run src/tests/unit/sorting.test.ts
```

## Adding New Tests

1. **For new algorithms**: Add them to the imports in `sorting.test.ts` and they'll automatically be tested
2. **For new test data**: Add to `fixtures/testArrays.ts`
3. **For new test utilities**: Add to `helpers/algorithmTestUtils.ts`
4. **For new test categories**: Create new files in `unit/` directory

## Notes

- All algorithm imports point to `src/features/sorting/algos/` (the actual implementation)
- Tests use the standardized `Algorithm` type from `src/engine/types.ts`
- Frame validation handles optional properties correctly
- Setup file (`setup.ts`) configures vitest with jest-dom for DOM testing utilities
