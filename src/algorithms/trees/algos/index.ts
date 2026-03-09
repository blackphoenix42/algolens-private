import type { AlgoMeta } from "@/types/algorithms";

export const treesAlgos: AlgoMeta[] = [
  {
    slug: "bst-insert",
    title: "BST Insert",
    topic: "trees",
    summary:
      "Inserts elements one by one into a Binary Search Tree, maintaining the BST property.",
    pseudocode: [
      "for each value in input:",
      "  if tree is empty:",
      "    place value at root",
      "  else:",
      "    current = root",
      "    while true:",
      "      if value < current: go left (2i+1)",
      "      else: go right (2i+2)",
      "      if slot empty: place value and break",
    ],
    complexity: {
      time: { best: "O(log n)", average: "O(log n)", worst: "O(n)" },
      space: "O(n)",
    },
    about:
      "BST Insert builds a binary search tree by inserting each element in order. Smaller values go left, larger or equal go right. The tree is stored in level-order (heap layout).",
    pros: [
      "Maintains sorted order for in-order traversal",
      "Efficient search after construction",
      "Dynamic structure supports insertions",
    ],
    cons: [
      "Can degenerate to O(n) for sorted input",
      "No balancing - height may be large",
      "Requires extra space for tree structure",
    ],
    code: {
      javascript: `function bstInsert(values) {
  const tree = [];
  const EMPTY = -1;

  for (const value of values) {
    if (tree.length === 0) {
      tree.push(value);
      continue;
    }
    let i = 0;
    while (true) {
      if (value < tree[i]) {
        const left = 2 * i + 1;
        if (tree[left] === undefined || tree[left] === EMPTY) {
          tree[left] = value;
          break;
        }
        i = left;
      } else {
        const right = 2 * i + 2;
        if (tree[right] === undefined || tree[right] === EMPTY) {
          tree[right] = value;
          break;
        }
        i = right;
      }
    }
  }
  return tree;
}`,
      python: `def bst_insert(values):
    tree = []
    EMPTY = -1

    for value in values:
        if not tree:
            tree.append(value)
            continue
        i = 0
        while True:
            if value < tree[i]:
                left = 2 * i + 1
                if left >= len(tree) or tree[left] == EMPTY:
                    while len(tree) <= left:
                        tree.append(EMPTY)
                    tree[left] = value
                    break
                i = left
            else:
                right = 2 * i + 2
                if right >= len(tree) or tree[right] == EMPTY:
                    while len(tree) <= right:
                        tree.append(EMPTY)
                    tree[right] = value
                    break
                i = right
    return tree`,
      java: `public static int[] bstInsert(int[] values) {
    List<Integer> tree = new ArrayList<>();
    final int EMPTY = -1;

    for (int value : values) {
        if (tree.isEmpty()) {
            tree.add(value);
            continue;
        }
        int i = 0;
        while (true) {
            if (value < tree.get(i)) {
                int left = 2 * i + 1;
                if (left >= tree.size() || tree.get(left) == EMPTY) {
                    while (tree.size() <= left) tree.add(EMPTY);
                    tree.set(left, value);
                    break;
                }
                i = left;
            } else {
                int right = 2 * i + 2;
                if (right >= tree.size() || tree.get(right) == EMPTY) {
                    while (tree.size() <= right) tree.add(EMPTY);
                    tree.set(right, value);
                    break;
                }
                i = right;
            }
        }
    }
    return tree.stream().mapToInt(Integer::intValue).toArray();
}`,
      cpp: `vector<int> bstInsert(vector<int>& values) {
    vector<int> tree;
    const int EMPTY = -1;

    for (int value : values) {
        if (tree.empty()) {
            tree.push_back(value);
            continue;
        }
        int i = 0;
        while (true) {
            if (value < tree[i]) {
                int left = 2 * i + 1;
                if (left >= (int)tree.size() || tree[left] == EMPTY) {
                    while ((int)tree.size() <= left) tree.push_back(EMPTY);
                    tree[left] = value;
                    break;
                }
                i = left;
            } else {
                int right = 2 * i + 2;
                if (right >= (int)tree.size() || tree[right] == EMPTY) {
                    while ((int)tree.size() <= right) tree.push_back(EMPTY);
                    tree[right] = value;
                    break;
                }
                i = right;
            }
        }
    }
    return tree;
}`,
    },
    codeLineMap: {
      javascript: [1, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      python: [1, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      java: [1, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      cpp: [1, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    },
    load: () => import("./bstInsert"),
  },
  {
    slug: "bst-search",
    title: "BST Search",
    topic: "trees",
    summary:
      "Searches for a target value in a BST by traversing left or right based on comparisons.",
    pseudocode: [
      "current = root (index 0)",
      "while current is valid:",
      "  compare target with tree[current]",
      "  if equal: return current",
      "  if target < current: go left (2i+1)",
      "  else: go right (2i+2)",
      "return not found",
    ],
    complexity: {
      time: { best: "O(1)", average: "O(log n)", worst: "O(n)" },
      space: "O(1)",
    },
    about:
      "BST Search finds a target by starting at the root and repeatedly comparing: go left if target is smaller, right if larger. The tree must be pre-built in level-order.",
    pros: [
      "Efficient O(log n) on balanced trees",
      "No extra space beyond tree",
      "Simple comparison logic",
    ],
    cons: [
      "Requires valid BST structure",
      "Degenerates to O(n) on unbalanced trees",
      "Does not support range queries directly",
    ],
    code: {
      javascript: `function bstSearch(tree, target) {
  let i = 0;
  const EMPTY = -1;

  while (i < tree.length && tree[i] !== EMPTY) {
    if (tree[i] === target) return i;
    if (target < tree[i]) {
      i = 2 * i + 1;
    } else {
      i = 2 * i + 2;
    }
  }
  return -1;
}`,
      python: `def bst_search(tree, target):
    i = 0
    EMPTY = -1

    while i < len(tree) and tree[i] != EMPTY:
        if tree[i] == target:
            return i
        if target < tree[i]:
            i = 2 * i + 1
        else:
            i = 2 * i + 2
    return -1`,
      java: `public static int bstSearch(int[] tree, int target) {
    int i = 0;
    final int EMPTY = -1;

    while (i < tree.length && tree[i] != EMPTY) {
        if (tree[i] == target) return i;
        if (target < tree[i]) {
            i = 2 * i + 1;
        } else {
            i = 2 * i + 2;
        }
    }
    return -1;
}`,
      cpp: `int bstSearch(vector<int>& tree, int target) {
    int i = 0;
    const int EMPTY = -1;

    while (i < (int)tree.size() && tree[i] != EMPTY) {
        if (tree[i] == target) return i;
        if (target < tree[i]) {
            i = 2 * i + 1;
        } else {
            i = 2 * i + 2;
        }
    }
    return -1;
}`,
    },
    codeLineMap: {
      javascript: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11],
      python: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11],
      java: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11],
      cpp: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11],
    },
    load: () => import("./bstSearch"),
  },
];
