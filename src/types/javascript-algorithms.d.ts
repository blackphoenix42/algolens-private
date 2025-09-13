// Type declarations for javascript-algorithms package
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "javascript-algorithms/src/algorithms/graph" {
  export function dijkstra(graph: any, startVertex: any): any;
}

declare module "javascript-algorithms/src/algorithms/search" {
  export function binarySearch<T>(
    array: T[],
    element: T,
    compareFn?: (a: T, b: T) => number
  ): any;
  export function linearSearch<T>(
    array: T[],
    element: T,
    compareFn?: (a: T, b: T) => number
  ): any;
}

declare module "javascript-algorithms/src/algorithms/sorting" {
  export function bubbleSort<T>(
    array: T[],
    compareFn?: (a: T, b: T) => number
  ): T[];
  export function quickSort<T>(
    array: T[],
    compareFn?: (a: T, b: T) => number
  ): T[];
  export function mergeSort<T>(
    array: T[],
    compareFn?: (a: T, b: T) => number
  ): T[];
}

declare module "javascript-algorithms/src/data-structures/graph" {
  export class Graph {
    constructor(isDirected?: boolean);
    addVertex(vertex: any): void;
    addEdge(startVertex: any, endVertex: any, weight?: number): void;
    // Add other methods as needed
  }
}
