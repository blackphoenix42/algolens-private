import type { AlgoMeta } from "@/types/algorithms";

export const graphAlgos: AlgoMeta[] = [
  {
    slug: "depth-first-search",
    title: "Depth-First Search (DFS)",
    topic: "graphs",
    summary:
      "A graph traversal algorithm that explores as far as possible along each branch before backtracking.",
    pseudocode: [
      "DFS(graph, start):",
      "  stack = [start]",
      "  visited = set()",
      "  while stack is not empty:",
      "    node = stack.pop()",
      "    if node not in visited:",
      "      visit(node)",
      "      visited.add(node)",
      "      for neighbor in graph[node]:",
      "        stack.push(neighbor)",
    ],
    complexity: {
      time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
      space: "O(V)",
    },
    about:
      "DFS explores the graph by going as deep as possible before backtracking, using a stack (or recursion).",
    pros: [
      "Memory efficient for deep graphs",
      "Can find solutions faster in deep search spaces",
      "Simple to implement recursively",
    ],
    cons: [
      "May get stuck in infinite loops without cycle detection",
      "Not optimal for shortest path",
      "Can be slow for wide graphs",
    ],
    code: {
      javascript: `function dfs(graph, start) {
  const visited = new Set();
  const stack = [start];
  const result = [];
  
  while (stack.length > 0) {
    const node = stack.pop();
    
    if (!visited.has(node)) {
      visited.add(node);
      result.push(node);
      
      // Add neighbors in reverse order
      for (let i = graph[node].length - 1; i >= 0; i--) {
        const neighbor = graph[node][i];
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }
  
  return result;
}`,
      python: `def dfs(graph, start):
    visited = set()
    stack = [start]
    result = []
    
    while stack:
        node = stack.pop()
        
        if node not in visited:
            visited.add(node)
            result.append(node)
            
            # Add neighbors in reverse order
            for neighbor in reversed(graph[node]):
                if neighbor not in visited:
                    stack.append(neighbor)
    
    return result`,
      java: `public static List<Integer> dfs(List<List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    Stack<Integer> stack = new Stack<>();
    List<Integer> result = new ArrayList<>();
    
    stack.push(start);
    
    while (!stack.isEmpty()) {
        int node = stack.pop();
        
        if (!visited.contains(node)) {
            visited.add(node);
            result.add(node);
            
            // Add neighbors in reverse order
            for (int i = graph.get(node).size() - 1; i >= 0; i--) {
                int neighbor = graph.get(node).get(i);
                if (!visited.contains(neighbor)) {
                    stack.push(neighbor);
                }
            }
        }
    }
    
    return result;
}`,
      cpp: `vector<int> dfs(vector<vector<int>>& graph, int start) {
    unordered_set<int> visited;
    stack<int> st;
    vector<int> result;
    
    st.push(start);
    
    while (!st.empty()) {
        int node = st.top();
        st.pop();
        
        if (visited.find(node) == visited.end()) {
            visited.insert(node);
            result.push_back(node);
            
            // Add neighbors in reverse order
            for (int i = graph[node].size() - 1; i >= 0; i--) {
                int neighbor = graph[node][i];
                if (visited.find(neighbor) == visited.end()) {
                    st.push(neighbor);
                }
            }
        }
    }
    
    return result;
}`,
    },
    codeLineMap: {
      javascript: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21,
      ],
      python: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      java: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24,
      ],
      cpp: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22,
      ],
    },
    load: () => import("./depthFirstSearch"),
  },
  {
    slug: "breadth-first-search",
    title: "Breadth-First Search (BFS)",
    topic: "graphs",
    summary:
      "A graph traversal algorithm that explores all neighbors at the current depth before moving to nodes at the next depth.",
    pseudocode: [
      "BFS(graph, start):",
      "  queue = [start]",
      "  visited = set()",
      "  while queue is not empty:",
      "    node = queue.dequeue()",
      "    if node not in visited:",
      "      visit(node)",
      "      visited.add(node)",
      "      for neighbor in graph[node]:",
      "        queue.enqueue(neighbor)",
    ],
    complexity: {
      time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
      space: "O(V)",
    },
    about:
      "BFS explores the graph level by level, visiting all nodes at distance k before visiting nodes at distance k+1.",
    pros: [
      "Finds shortest path in unweighted graphs",
      "Optimal for wide, shallow graphs",
      "Guarantees minimum depth solution",
    ],
    cons: [
      "Higher memory usage for deep graphs",
      "Can be slow for very deep search spaces",
      "May explore many irrelevant nodes",
    ],
    code: {
      javascript: `function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  const result = [];
  
  while (queue.length > 0) {
    const node = queue.shift();
    
    if (!visited.has(node)) {
      visited.add(node);
      result.push(node);
      
      // Add unvisited neighbors to queue
      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor) && !queue.includes(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }
  
  return result;
}`,
      python: `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    result = []
    
    while queue:
        node = queue.popleft()
        
        if node not in visited:
            visited.add(node)
            result.append(node)
            
            # Add unvisited neighbors to queue
            for neighbor in graph[node]:
                if neighbor not in visited and neighbor not in queue:
                    queue.append(neighbor)
    
    return result`,
      java: `public static List<Integer> bfs(List<List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new LinkedList<>();
    List<Integer> result = new ArrayList<>();
    
    queue.offer(start);
    
    while (!queue.isEmpty()) {
        int node = queue.poll();
        
        if (!visited.contains(node)) {
            visited.add(node);
            result.add(node);
            
            // Add unvisited neighbors to queue
            for (int neighbor : graph.get(node)) {
                if (!visited.contains(neighbor) && !queue.contains(neighbor)) {
                    queue.offer(neighbor);
                }
            }
        }
    }
    
    return result;
}`,
      cpp: `vector<int> bfs(vector<vector<int>>& graph, int start) {
    unordered_set<int> visited;
    queue<int> q;
    vector<int> result;
    
    q.push(start);
    
    while (!q.empty()) {
        int node = q.front();
        q.pop();
        
        if (visited.find(node) == visited.end()) {
            visited.insert(node);
            result.push_back(node);
            
            // Add unvisited neighbors to queue
            for (int neighbor : graph[node]) {
                if (visited.find(neighbor) == visited.end()) {
                    q.push(neighbor);
                }
            }
        }
    }
    
    return result;
}`,
    },
    codeLineMap: {
      javascript: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
      ],
      python: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      java: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22,
      ],
      cpp: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22,
      ],
    },
    load: () => import("./breadthFirstSearch"),
  },
];

export { run as breadthFirstSearch } from "./breadthFirstSearch";
export { run as depthFirstSearch } from "./depthFirstSearch";
