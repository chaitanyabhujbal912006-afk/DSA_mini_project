# DSA Mini Project — SocialGraph Engine

## Project Structure
```
DSA_mini_project/
├── web/                    # Vite-powered web application
│   ├── index.html          # Main HTML shell
│   ├── index.css           # Design system & styles
│   ├── app.js              # Application controller
│   ├── SocialNetwork.js    # Core graph engine (BFS, Heap, HashMap)
│   ├── graph.js            # Force-directed Canvas visualizer
│   ├── package.json        # npm dependencies
│   └── package-lock.json   # Lock file
│
├── src/java/               # Original Java Swing application
│   ├── MainWindow.java     # App entry point & layout
│   ├── DashboardPanel.java # Main dashboard view
│   ├── SocialNetwork.java  # Java graph engine
│   ├── DatabaseManager.java
│   ├── AddFriendPanel.java
│   ├── AddUserPanel.java
│   ├── MutualFriendsPanel.java
│   ├── SuggestFriendsPanel.java
│   ├── GraphPanel.java
│   ├── DataPersistence.java
│   ├── Theme.java
│   ├── User.java
│   └── NetworkStatsTracker.java
│
├── docs/                   # Technical documentation
│   ├── DSA_SUMMARY.md      # Algorithm breakdown (BFS, Heap, HashMap)
│   └── PROJECT_DOCUMENTATION.md
│
├── .gitignore
└── README.md
```

## Quick Start

### Web App (Recommended)
```bash
cd web
npm install
npm run dev
```
Visit `http://localhost:5173`

### Java App (Legacy)
```bash
cd src/java
javac -cp ".;sqlite-jdbc.jar" *.java
java -cp ".;sqlite-jdbc.jar" MainWindow
```

## Tech Stack
- **Web**: Vanilla JS, HTML5 Canvas, Vite
- **Java**: Swing GUI, SQLite via JDBC
- **Algorithms**: BFS traversal, Max-Heap (friend suggestions), HashMap lookups

## Author
Chaitanya Bhujbal — [GitHub](https://github.com/chaitanyabhujbal912006-afk)
