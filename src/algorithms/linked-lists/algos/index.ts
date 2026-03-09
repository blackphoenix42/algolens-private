import type { AlgoMeta } from "@/types/algorithms";

export const linkedListAlgos: AlgoMeta[] = [
  {
    slug: "linked-list-traversal",
    title: "Linked List Traversal",
    topic: "linked-lists",
    summary:
      "Traverse a linked list by following next pointers from head to tail, visiting each node once.",
    pseudocode: [
      "curr = head",
      "while curr != null",
      "  visit(curr)",
      "  curr = curr.next",
      "return visited",
    ],
    complexity: {
      time: { best: "O(n)", average: "O(n)", worst: "O(n)" },
      space: "O(1)",
    },
    about:
      "Linked list traversal visits each node by following the next pointer. The array visualization represents the list where index i corresponds to the i-th node.",
    pros: [
      "Simple and fundamental operation",
      "Linear time complexity",
      "Constant space",
    ],
    cons: ["No random access", "Must traverse sequentially"],
    code: {
      javascript: `function traverse(head) {
  const visited = [];
  let curr = head;

  while (curr !== null) {
    visited.push(curr.value);
    curr = curr.next;
  }

  return visited;
}`,
      python: `def traverse(head):
    visited = []
    curr = head

    while curr is not None:
        visited.append(curr.value)
        curr = curr.next

    return visited`,
      java: `public static List<Integer> traverse(Node head) {
    List<Integer> visited = new ArrayList<>();
    Node curr = head;

    while (curr != null) {
        visited.add(curr.value);
        curr = curr.next;
    }

    return visited;
}`,
      cpp: `vector<int> traverse(Node* head) {
    vector<int> visited;
    Node* curr = head;

    while (curr != nullptr) {
        visited.push_back(curr->value);
        curr = curr->next;
    }

    return visited;
}`,
    },
    codeLineMap: {
      javascript: [2, 4, 5, 6, 7, 10],
      python: [2, 4, 5, 6, 7, 10],
      java: [2, 4, 5, 6, 7, 10],
      cpp: [2, 4, 5, 6, 7, 10],
    },
    load: () => import("./linkedListTraversal"),
  },
  {
    slug: "linked-list-reverse",
    title: "Linked List Reverse",
    topic: "linked-lists",
    summary:
      "Reverse a linked list in-place using the three-pointer (prev, curr, next) approach.",
    pseudocode: [
      "prev = null, curr = head",
      "while curr != null",
      "  next = curr.next",
      "  curr.next = prev",
      "  prev = curr, curr = next",
      "return prev",
    ],
    complexity: {
      time: { best: "O(n)", average: "O(n)", worst: "O(n)" },
      space: "O(1)",
    },
    about:
      "The three-pointer approach reverses a linked list in one pass by reversing each node's next pointer. On arrays, this is visualized as in-place reversal with prev/curr/next indices.",
    pros: ["In-place reversal", "Single pass O(n)", "Constant space"],
    cons: ["Modifies the original structure", "Loses reference to old head"],
    code: {
      javascript: `function reverse(head) {
  let prev = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  return prev;
}`,
      python: `def reverse(head):
    prev = None
    curr = head

    while curr is not None:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node

    return prev`,
      java: `public static Node reverse(Node head) {
    Node prev = null;
    Node curr = head;

    while (curr != null) {
        Node next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }

    return prev;
}`,
      cpp: `Node* reverse(Node* head) {
    Node* prev = nullptr;
    Node* curr = head;

    while (curr != nullptr) {
        Node* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }

    return prev;
}`,
    },
    codeLineMap: {
      javascript: [2, 3, 5, 6, 7, 8, 11],
      python: [2, 3, 5, 6, 7, 8, 11],
      java: [2, 3, 5, 6, 7, 8, 11],
      cpp: [2, 3, 5, 6, 7, 8, 11],
    },
    load: () => import("./linkedListReverse"),
  },
];
