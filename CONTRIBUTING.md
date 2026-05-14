# Contributing

## Commit messages

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) with the [Conventional Commits](https://www.conventionalcommits.org/) format. All commits to `main` trigger an automated release, so commit types matter.

```
<type>(<scope>): <short description>

<optional body>
```

### Types

| Type | Section | Release |
|---|---|---|
| `feat` | ✨ Features | minor |
| `fix` | 🐛 Bug Fixes | patch |
| `style` | 💅 UI Updates | patch |
| `improvement` | 📈 Improvements | patch |
| `refactor` | 🔨 Code Refactors | patch |
| `perf` | ⚡ Performance | patch |
| `chore` | 🧹 Miscellaneous | patch |
| `docs` | 📖 Documentation | patch |
| `build` | 🏗️ Build System | patch |
| `ci` | ⚙️ CI/CD | patch |
| `test` | 🧪 Tests | patch |
| `revert` | ⏪ Reverts | patch |

### Scopes

Use scopes to indicate what area of the codebase is affected. There are no strict rules but common ones are:

- `app` — `App.vue` or top-level application logic
- `flow` — canvas node/edge components
- `ui` — shared UI components (`XButton`, `XSelect`, etc.)
- `style` — CSS or design tokens
- `release` — release config or CI
- `readme` / `docs` — documentation

### Examples

```
feat(app): add BFS reorganize layout from start node
fix(flow): prevent duplicate edges in connect panel
style(ui): add displayOptions prop to XSelect
improvement(app): auto-clear answer text after connecting
refactor(flow): extract edge label logic into FlowEdge
docs(readme): update readme to reflect decision tree editor
```
