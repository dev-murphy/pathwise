module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "chore", release: "patch" },
          { type: "docs", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "test", release: "patch" },
          { type: "ci", release: "patch" },
          { type: "revert", release: "patch" },
          { type: "style", release: "patch" },
          { type: "build", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "improvement", release: "patch" },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "✨ Features" },
            { type: "fix", section: "🐛 Bug Fixes" },
            { type: "chore", section: "🧹 Miscellaneous" },
            { type: "docs", section: "📖 Documentation" },
            { type: "refactor", section: "🔨 Code Refactors" },
            { type: "test", section: "🧪 Tests" },
            { type: "ci", section: "⚙️ CI/CD" },
            { type: "revert", section: "⏪ Reverts" },
            { type: "style", section: "💅 UI Updates" },
            { type: "build", section: "🏗️ Build System" },
            { type: "perf", section: "⚡ Performance Improvements" },
            { type: "improvement", section: "📈 Improvements" },
          ],
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle: "# Changelog",
      },
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: [
          "package.json",
          "package-lock.json",
          "pnpm-lock.yaml",
          "CHANGELOG.md",
        ],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    [
      "@semantic-release/github",
      {
        successComment: false,
        failTitle: false,
      },
    ],
  ],
};
