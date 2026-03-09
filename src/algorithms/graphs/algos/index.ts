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
  {
    slug: "dijkstra",
    title: "Dijkstra's Shortest Path",
    topic: "graphs",
    summary:
      "Finds shortest paths from a source node to all other nodes in a graph with non-negative edge weights.",
    pseudocode: [
      "Initialize distances: dist[source] = 0, others = infinity",
      "Add source to priority queue",
      "while queue not empty:",
      "  u = extract min from queue",
      "  for each neighbor v of u:",
      "    if dist[u] + weight(u,v) < dist[v]:",
      "      dist[v] = dist[u] + weight(u,v)",
      "      add v to queue",
    ],
    complexity: {
      time: {
        best: "O((V+E) log V)",
        average: "O((V+E) log V)",
        worst: "O((V+E) log V)",
      },
      space: "O(V)",
    },
    about:
      "Dijkstra's algorithm uses a priority queue to greedily select the closest unvisited node and relaxes all its outgoing edges.",
    pros: [
      "Efficient for graphs with non-negative weights",
      "Guarantees shortest path",
      "Widely used in routing and navigation",
    ],
    cons: [
      "Does not work with negative edge weights",
      "Requires priority queue for efficiency",
      "May explore many nodes for sparse graphs",
    ],
    code: {
      javascript: `function dijkstra(graph, start) {
  const n = graph.length;
  const dist = new Array(n).fill(Infinity);
  dist[start] = 0;
  const visited = new Set();
  const pq = [{ node: start, dist: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u } = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);

    for (const v of graph[u]) {
      const w = 1;
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push({ node: v, dist: dist[v] });
      }
    }
  }
  return dist;
}`,
      python: `import heapq

def dijkstra(graph, start):
    n = len(graph)
    dist = [float('inf')] * n
    dist[start] = 0
    pq = [(0, start)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v in graph[u]:
            w = 1
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
      java: `public static int[] dijkstra(List<List<int[]>> graph, int start) {
    int n = graph.size();
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a,b)->a[1]-b[1]);
    pq.offer(new int[]{start, 0});

    while (!pq.isEmpty()) {
        int[] cur = pq.poll();
        int u = cur[0];
        if (cur[1] > dist[u]) continue;
        for (int[] e : graph.get(u)) {
            int v = e[0], w = e[1];
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.offer(new int[]{v, dist[v]});
            }
        }
    }
    return dist;
}`,
      cpp: `vector<int> dijkstra(vector<vector<pair<int,int>>>& graph, int start) {
    int n = graph.size();
    vector<int> dist(n, INT_MAX);
    dist[start] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : graph[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
    },
    codeLineMap: {
      javascript: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      python: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      java: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      cpp: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    },
    load: () => import("./dijkstra"),
  },
  {
    slug: "bellman-ford",
    title: "Bellman-Ford",
    topic: "graphs",
    summary:
      "Finds shortest paths from a source, relaxing all edges V-1 times. Handles negative edge weights.",
    pseudocode: [
      "Initialize distances: dist[source] = 0, others = infinity",
      "for i = 1 to V-1:",
      "  for each edge (u, v) with weight w:",
      "    if dist[u] + w < dist[v]:",
      "      dist[v] = dist[u] + w",
      "return dist",
    ],
    complexity: {
      time: { best: "O(VE)", average: "O(VE)", worst: "O(VE)" },
      space: "O(V)",
    },
    about:
      "Bellman-Ford relaxes all edges V-1 times. After V-1 iterations, shortest paths are found (or negative cycle exists).",
    pros: [
      "Handles negative edge weights",
      "Can detect negative cycles",
      "Simple implementation",
    ],
    cons: [
      "Slower than Dijkstra for non-negative graphs",
      "O(VE) vs O((V+E) log V)",
      "Inefficient for dense graphs",
    ],
    code: {
      javascript: `function bellmanFord(graph, start) {
  const n = graph.length;
  const dist = new Array(n).fill(Infinity);
  dist[start] = 0;

  const edges = [];
  for (let u = 0; u < n; u++)
    for (const v of graph[u])
      edges.push([u, v, 1]);

  for (let i = 0; i < n - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v])
        dist[v] = dist[u] + w;
    }
  }
  return dist;
}`,
      python: `def bellman_ford(graph, start):
    n = len(graph)
    dist = [float('inf')] * n
    dist[start] = 0

    edges = [(u, v, 1) for u in range(n) for v in graph[u]]

    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    return dist`,
      java: `public static int[] bellmanFord(List<List<Integer>> graph, int start) {
    int n = graph.size();
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;

    List<int[]> edges = new ArrayList<>();
    for (int u = 0; u < n; u++)
        for (int v : graph.get(u))
            edges.add(new int[]{u, v, 1});

    for (int i = 0; i < n - 1; i++) {
        for (int[] e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v])
                dist[v] = dist[u] + w;
        }
    }
    return dist;
}`,
      cpp: `vector<int> bellmanFord(vector<vector<int>>& graph, int start) {
    int n = graph.size();
    vector<int> dist(n, INT_MAX);
    dist[start] = 0;

    vector<tuple<int,int,int>> edges;
    for (int u = 0; u < n; u++)
        for (int v : graph[u])
            edges.push_back({u, v, 1});

    for (int i = 0; i < n - 1; i++) {
        for (auto [u, v, w] : edges) {
            if (dist[u] != INT_MAX && dist[u] + w < dist[v])
                dist[v] = dist[u] + w;
        }
    }
    return dist;
}`,
    },
    codeLineMap: {
      javascript: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      python: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      java: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      cpp: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    },
    load: () => import("./bellmanFord"),
  },
  {
    slug: "topological-sort",
    title: "Topological Sort (Kahn's)",
    topic: "graphs",
    summary:
      "Orders vertices of a DAG so that for every edge (u,v), u comes before v. Uses in-degree counting.",
    pseudocode: [
      "Compute in-degree for each vertex",
      "Queue all vertices with in-degree 0",
      "while queue not empty:",
      "  u = dequeue",
      "  append u to result",
      "  for each neighbor v of u:",
      "    decrement in-degree[v]",
      "    if in-degree[v] == 0, enqueue v",
      "return result",
    ],
    complexity: {
      time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
      space: "O(V)",
    },
    about:
      "Kahn's algorithm repeatedly removes nodes with no incoming edges, building a topological order. Only works on DAGs.",
    pros: [
      "Linear time O(V + E)",
      "Simple in-degree based approach",
      "Useful for scheduling and dependency resolution",
    ],
    cons: [
      "Only works on directed acyclic graphs",
      "Requires computing in-degrees first",
      "Multiple valid orderings possible",
    ],
    code: {
      javascript: `function topologicalSort(graph) {
  const n = graph.length;
  const inDegree = new Array(n).fill(0);
  for (let u = 0; u < n; u++)
    for (const v of graph[u]) inDegree[v]++;

  const queue = [];
  for (let i = 0; i < n; i++)
    if (inDegree[i] === 0) queue.push(i);

  const result = [];
  while (queue.length > 0) {
    const u = queue.shift();
    result.push(u);
    for (const v of graph[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }
  return result;
}`,
      python: `def topological_sort(graph):
    n = len(graph)
    in_degree = [0] * n
    for u in range(n):
        for v in graph[u]:
            in_degree[v] += 1

    queue = [i for i in range(n) if in_degree[i] == 0]
    result = []

    while queue:
        u = queue.pop(0)
        result.append(u)
        for v in graph[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
    return result`,
      java: `public static List<Integer> topologicalSort(List<List<Integer>> graph) {
    int n = graph.size();
    int[] inDegree = new int[n];
    for (int u = 0; u < n; u++)
        for (int v : graph.get(u)) inDegree[v]++;

    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < n; i++)
        if (inDegree[i] == 0) queue.offer(i);

    List<Integer> result = new ArrayList<>();
    while (!queue.isEmpty()) {
        int u = queue.poll();
        result.add(u);
        for (int v : graph.get(u)) {
            inDegree[v]--;
            if (inDegree[v] == 0) queue.offer(v);
        }
    }
    return result;
}`,
      cpp: `vector<int> topologicalSort(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<int> inDegree(n, 0);
    for (int u = 0; u < n; u++)
        for (int v : graph[u]) inDegree[v]++;

    queue<int> q;
    for (int i = 0; i < n; i++)
        if (inDegree[i] == 0) q.push(i);

    vector<int> result;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        result.push_back(u);
        for (int v : graph[u]) {
            inDegree[v]--;
            if (inDegree[v] == 0) q.push(v);
        }
    }
    return result;
}`,
    },
    codeLineMap: {
      javascript: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      python: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      java: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      cpp: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    },
    load: () => import("./topologicalSort"),
  },
  {
    slug: "kruskal-mst",
    title: "Kruskal's MST",
    topic: "graphs",
    summary:
      "Finds minimum spanning tree by sorting edges by weight and adding them if they don't create a cycle (Union-Find).",
    pseudocode: [
      "Sort all edges by weight",
      "Initialize Union-Find",
      "for each edge (u, v, w) in sorted order:",
      "  if Find(u) != Find(v):",
      "    Union(u, v)",
      "    add edge to MST",
      "  else",
      "    skip (would create cycle)",
      "return MST",
    ],
    complexity: {
      time: { best: "O(E log E)", average: "O(E log E)", worst: "O(E log E)" },
      space: "O(V)",
    },
    about:
      "Kruskal's algorithm greedily selects the smallest edge that doesn't form a cycle, using Union-Find to detect cycles.",
    pros: [
      "Simple greedy approach",
      "Works with any graph (connected)",
      "Efficient with Union-Find",
    ],
    cons: [
      "Requires sorting all edges",
      "Slower than Prim for dense graphs",
      "Needs Union-Find data structure",
    ],
    code: {
      javascript: `function find(parent, x) {
  if (parent[x] !== x) parent[x] = find(parent, parent[x]);
  return parent[x];
}
function union(parent, rank, x, y) {
  const px = find(parent, x), py = find(parent, y);
  if (px === py) return false;
  if (rank[px] < rank[py]) parent[px] = py;
  else if (rank[px] > rank[py]) parent[py] = px;
  else { parent[py] = px; rank[px]++; }
  return true;
}
function kruskalMST(graph) {
  const n = graph.length;
  const edges = [];
  for (let u = 0; u < n; u++)
    for (const v of graph[u])
      if (u < v) edges.push([u, v, 1]);
  edges.sort((a, b) => a[2] - b[2]);

  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  const mst = [];
  for (const [u, v, w] of edges) {
    if (union(parent, rank, u, v)) mst.push([u, v]);
  }
  return mst;
}`,
      python: `def find(parent, x):
    if parent[x] != x:
        parent[x] = find(parent, parent[x])
    return parent[x]

def union(parent, rank, x, y):
    px, py = find(parent, x), find(parent, y)
    if px == py:
        return False
    if rank[px] < rank[py]:
        parent[px] = py
    elif rank[px] > rank[py]:
        parent[py] = px
    else:
        parent[py] = px
        rank[px] += 1
    return True

def kruskal_mst(graph):
    n = len(graph)
    edges = [(u, v, 1) for u in range(n) for v in graph[u] if u < v]
    edges.sort(key=lambda e: e[2])

    parent = list(range(n))
    rank = [0] * n
    mst = []
    for u, v, w in edges:
        if union(parent, rank, u, v):
            mst.append((u, v))
    return mst`,
      java: `static int find(int[] parent, int x) {
    if (parent[x] != x) parent[x] = find(parent, parent[x]);
    return parent[x];
}
static boolean union(int[] parent, int[] rank, int x, int y) {
    int px = find(parent, x), py = find(parent, y);
    if (px == py) return false;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
}
public static List<int[]> kruskalMST(List<List<Integer>> graph) {
    int n = graph.size();
    List<int[]> edges = new ArrayList<>();
    for (int u = 0; u < n; u++)
        for (int v : graph.get(u))
            if (u < v) edges.add(new int[]{u, v, 1});
    edges.sort((a,b) -> a[2]-b[2]);

    int[] parent = new int[n];
    int[] rank = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
    List<int[]> mst = new ArrayList<>();
    for (int[] e : edges) {
        if (union(parent, rank, e[0], e[1])) mst.add(new int[]{e[0], e[1]});
    }
    return mst;
}`,
      cpp: `int find(vector<int>& parent, int x) {
    if (parent[x] != x) parent[x] = find(parent, parent[x]);
    return parent[x];
}
bool unite(vector<int>& parent, vector<int>& rank, int x, int y) {
    int px = find(parent, x), py = find(parent, y);
    if (px == py) return false;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
}
vector<pair<int,int>> kruskalMST(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<tuple<int,int,int>> edges;
    for (int u = 0; u < n; u++)
        for (int v : graph[u])
            if (u < v) edges.push_back({u, v, 1});
    sort(edges.begin(), edges.end(), [](auto& a, auto& b) { return get<2>(a) < get<2>(b); });

    vector<int> parent(n), rank(n, 0);
    iota(parent.begin(), parent.end(), 0);
    vector<pair<int,int>> mst;
    for (auto [u, v, w] : edges) {
        if (unite(parent, rank, u, v)) mst.push_back({u, v});
    }
    return mst;
}`,
    },
    codeLineMap: {
      javascript: [1, 2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      python: [1, 2, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      java: [1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      cpp: [1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    },
    load: () => import("./kruskalMST"),
  },
];

// Removed static exports to allow proper code splitting
// Use dynamic imports via the AlgoMeta.load() method instead
