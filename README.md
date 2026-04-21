# SocialGraph | Mini Engine v2.0
Developed by **Chaitanya Ajay Bhujbal**

> A high-performance, algorithm-driven social network engine built with **JavaScript** and modern web technologies.

This project visualizes and interacts with a graph-based network. It implements essential data structures (Hash Tables, Graphs, Queues, Max-Heaps) from scratch to drive features like mutual friend calculations, network visualization, and advanced friend suggestions.

---

## 🛠️ Key Features

- **Lead Architecture & Dashboard UI**: A multi-view SPA architecture built with Vite and vanilla JavaScript.
- **Core Algorithms (BFS & Max-Heap)**: level-by-level network topography visualization and ranked "Friend Suggestions" based on mutual connection density.
- **Interactive Network Graph Engine**: A custom force-directed physics engine using HTML5 Canvas for real-time node/edge simulation.
- **Premium Design System**: Glassmorphism effects, dark mode aesthetics, and responsive CSS animations.
- **State Persistence**: Automatic browser `localStorage` serialization for persistent data storage.

---

## 🧠 Core Data Structures Used

| Structure | ES6 Implementation | Algorithmic Purpose |
|---|---|---|
| **Hash Table** | `Map<String, Object>` | Guaranteed **O(1)** time-complexity for fast user lookup and modification. |
| **Adjacency List** | `Map<String, Set<String>>` | The primary Graph structure; maps users to sets of their connected friends. |
| **Queue (BFS)** | Array Operations (`push/shift`) | Used heavily for Level-1 / Level-2 friend traversal and discovery. |
| **Max-Heap** | Array Sort Simulation | Ranks friend suggestions by sorting candidates based on mutual connection count. |
| **Set** | `Set<String>` | Enables ultra-fast **O(1)** intersection calculations for mutual friends. |

---

## 🚀 How to Run Locally

You must have **Node.js** installed on your computer.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

---

## 🎨 UI & Additional Features

- **Dynamic Network Graph:** Live physics simulation of nodes and edges built entirely in vanilla JS.
- **Fully Persistent:** All added users and friendships are saved automatically to your browser cache.
- **BFS Visualizer:** Select a user and run a live visualization of their network depth tier-by-tier.

*Built with Vite · HTML5 Canvas · Vanilla JavaScript · Pure CSS*
