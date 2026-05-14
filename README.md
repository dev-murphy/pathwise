# Pathwise

A visual flow-based form builder. Design multi-step forms by placing typed field nodes on a canvas and connecting them to define the flow between fields.

**Live demo:** https://pathwise-two.vercel.app/

---

## Features

- **Typed field nodes** — each node is a form field with one of seven types: Text, Textarea, Number, Checkbox, Dropdown, Radio, or Multiselect
- **Drag to connect** — drag from a node's handle to another to create a path between fields
- **Conditional branching** — Dropdown and Radio fields support multiple outgoing paths; each branch is labeled with a free-text condition
- **Single-path fields** — Text, Textarea, Number, Checkbox, and Multiselect always proceed to the next field with no branching prompt
- **Options editor** — manage Dropdown, Radio, and Multiselect options directly in the sidebar
- **Required toggle** — mark any field as required
- **Inline editing** — click any node or edge on the canvas to edit it in the sidebar
- **Delete connections** — select an edge to edit its label or remove it entirely
- **Start node** — mark any field as the entry point; auto-assigned to the first field added
- **Reorganize** — auto-layout the canvas as a top-down tree from the start node using BFS
- **Field list** — scrollable list of all fields with type labels, selection highlights, and start node management

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

**Prerequisites:** [Node.js](https://nodejs.org/) 18+ and [pnpm](https://pnpm.io/)

```bash
# Install dependencies
pnpm install
```

### Development

Starts a local dev server with hot module replacement at `http://localhost:5173`.

```bash
pnpm dev
```

### Production

Type-checks the project with `vue-tsc` then bundles with Vite. Output goes to `dist/`.

```bash
pnpm build
```

Preview the production build locally before deploying:

```bash
pnpm preview
```

---

## Project structure

```
src/
├── App.vue                      # Root component — all state and sidebar logic
├── style.css                    # Tailwind + Vue Flow styles + design tokens
├── types/
│   ├── flow.ts                  # Domain types: FieldType, FieldOption, QuestionNodeData
│   ├── auto-imports.d.ts        # Generated auto-import declarations
│   └── components.d.ts          # Generated component declarations
├── components/
│   ├── common/
│   │   ├── XButton.vue          # Reusable button (primary / default variants)
│   │   ├── XInput.vue           # Input stub
│   │   └── XSelect.vue          # Custom dropdown with separate value/display label
│   ├── flow/
│   │   ├── QuestionNode.vue     # Custom Vue Flow node (field type pill, selected state)
│   │   └── FlowEdge.vue         # Custom Vue Flow edge (labeled, selected state)
│   └── icons/
│       └── ChevronDown.vue      # SVG icon
```

---

## How it works

Each **node** is a form field. **Edges** define the path a user takes from one field to the next. Branching is determined by the source field's type.

### Field types

| Type | Branching | Options |
|---|---|---|
| Text | Single path | — |
| Textarea | Single path | — |
| Number | Single path | — |
| Checkbox | Single path | — |
| Multiselect | Single path | Configurable list |
| Dropdown | Multi-path | Configurable list |
| Radio | Multi-path | Configurable list |

### Adding a field
1. Enter a label in the **Add Field** panel
2. Choose a type from the dropdown
3. For Dropdown, Radio, or Multiselect — add options using the options editor
4. Toggle **Required** if needed
5. Click **Add Field**

### Connecting fields
Drag from the bottom handle of a source node to the top handle of a target node:
- **Single-path types** — the connection is created immediately
- **Multi-path types** (Dropdown, Radio) — the sidebar prompts for a branch label; click **Save** to confirm or **Cancel** to discard

### Editing a field or connection
- Click a **node** on the canvas → the sidebar switches to **Edit Field** with all values pre-filled
- Click an **edge** on the canvas → the sidebar switches to **Edit Answer** with the label pre-filled; you can also delete the connection from here

### Start node
The first field added is automatically marked as the start. To change it, click **Set start** on any other field in the field list.

### Reorganize
Click **Reorganize** in the field list header to auto-layout the canvas as a top-down tree from the start node. Disconnected nodes are placed below the tree.

---

## Releases

Releases are automated via [semantic-release](https://github.com/semantic-release/semantic-release) on push to `main`. See [CHANGELOG.md](./CHANGELOG.md) for history.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for commit message guidelines.

---

## License

[MIT](./LICENSE) — Murphy Facey
