# Pathwise

An interactive decision tree editor built with Vue Flow. Add questions, connect them with labeled answers, and visualize your logic as a directed graph.

**Live demo:** https://pathwise-two.vercel.app/

---

## Features

- **Question nodes** — add questions as nodes on a canvas
- **Answers as edges** — connections between questions carry an answer label (e.g. "Yes", "No", "Maybe")
- **Start node** — mark any question as the entry point of your tree; auto-assigned to the first question added
- **Inline editing** — click any node or edge on the canvas to edit its text directly in the sidebar
- **Connect panel** — wire up questions via dropdowns with duplicate-path prevention
- **Reorganize** — auto-layout the graph as a top-down tree from the start node using BFS
- **Node list** — scrollable list of all questions with selection highlights and start node management
- **Edge selection** — clicking an edge highlights both connected nodes in the sidebar

---

## Stack

| | |
|---|---|
| Framework | Vue 3 (`<script setup>`) |
| Graph engine | Vue Flow |
| Styling | Tailwind CSS v4 |
| Utilities | VueUse |
| Language | TypeScript |
| Build tool | Vite |

---

## Getting started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type-check and build
pnpm build

# Preview production build
pnpm preview
```

---

## Project structure

```
src/
├── App.vue                      # Root component — all state and sidebar logic
├── style.css                    # Tailwind + Vue Flow styles + design tokens
├── components/
│   ├── common/
│   │   ├── XButton.vue          # Reusable button (primary / default variants)
│   │   ├── XInput.vue           # Input stub
│   │   └── XSelect.vue          # Custom dropdown with separate value/display label
│   ├── flow/
│   │   ├── QuestionNode.vue     # Custom Vue Flow node (Start indicator, selected state)
│   │   └── FlowEdge.vue         # Custom Vue Flow edge (labeled, selected state)
│   └── icons/
│       └── ChevronDown.vue      # SVG icon
└── types/
    ├── auto-imports.d.ts        # Generated auto-import declarations
    └── components.d.ts          # Generated component declarations
```

---

## How it works

**Questions** are nodes. **Answers** are directed edges between nodes — each edge carries a required label that represents the answer a user would give to move from one question to the next.

### Adding a question
1. Type the question text in the **Add Question** panel
2. Click **Add Question** — the node appears on the canvas

### Editing a question or answer
- Click a **node** on the canvas → the sidebar switches to **Edit Question** mode with the text pre-filled
- Click an **edge** on the canvas → the sidebar switches to **Edit Answer** mode with the label pre-filled
- Click **Save Changes** to apply

### Connecting questions
1. Select **From** (the source question) and **To** (the target question) in the **Connect** panel
2. The **To** dropdown automatically excludes the source node and any already-connected targets
3. Enter the **Answer text** for the edge label
4. Click **Connect**

### Start node
The first question added is automatically marked as the start. To change it, click **Set start** on any other question in the node list.

### Reorganize
Click **Reorganize** in the node list header to auto-layout the graph as a top-down tree from the start node. Disconnected nodes are placed below the tree.

---

## Releases

Releases are automated via [semantic-release](https://github.com/semantic-release/semantic-release) on push to `main`. See [CHANGELOG.md](./CHANGELOG.md) for history.

---

## License

[MIT](./LICENSE) — Murphy Facey
