<script setup lang="ts">
import logoUrl from '~/assets/images/logo.png'
import pkg from '../../package.json'
</script>

<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <!-- Nav -->
    <nav class="bg-surface border-b border-border px-4 h-[65px] flex items-center justify-between shrink-0">
      <div class="flex items-center gap-x-2 select-none">
        <img :src="logoUrl" alt="Pathwise" class="w-7 aspect-square" />
        <span class="text-accent text-lg font-head font-black uppercase">Pathwise</span>
      </div>
      <div class="flex items-center gap-x-4">
        <RouterLink
          to="/docs/guide"
          class="text-xs font-mono text-muted hover:text-accent transition-colors duration-200"
        >
          Guide
        </RouterLink>
        <RouterLink
          to="/docs/changelog"
          class="text-xs font-mono text-muted hover:text-accent transition-colors duration-200"
        >
          v{{ pkg.version }}
        </RouterLink>
        <RouterLink
          to="/dashboard"
          class="flex items-center gap-x-1.5 text-sm font-mono text-muted hover:text-accent transition-colors duration-200"
        >
          <LayoutDashboard class="w-4 h-4" />
          Open Builder
        </RouterLink>
      </div>
    </nav>

    <!-- Hero -->
    <main class="grow flex flex-col items-center justify-center px-6 text-center gap-y-8">
      <div class="flex flex-col items-center gap-y-4 max-w-xl">
        <div class="flex items-center gap-x-2 px-3 py-1 rounded-full border border-border bg-surface-2 text-xs font-mono text-muted">
          <span class="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span>
          Visual · Conditional · No-code
        </div>

        <h1 class="text-5xl font-head font-black text-text leading-tight">
          Build smarter<br />
          <span class="text-accent">forms.</span>
        </h1>

        <p class="text-muted font-mono text-sm leading-relaxed max-w-sm">
          Visually connect typed field nodes into dynamic, conditional multi-step flows.
          Dropdown, radio, multiselect — every choice can branch to a different next question.
        </p>

        <div class="flex items-center gap-x-3 mt-2">
          <RouterLink
            to="/dashboard"
            class="px-6 py-2.5 bg-accent text-bg text-sm font-mono font-bold rounded-lg hover:brightness-90 transition-all duration-200"
          >
            Open Builder →
          </RouterLink>
          <RouterLink
            to="/docs/guide"
            class="px-6 py-2.5 bg-surface-2 border border-border text-text text-sm font-mono rounded-lg hover:border-accent hover:text-accent transition-all duration-200"
          >
            Read the guide
          </RouterLink>
        </div>
      </div>

      <!-- Feature grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 max-w-2xl w-full">
        <div class="flex flex-col items-center gap-y-2 p-4 rounded-xl border border-border bg-surface text-center">
          <LayoutDashboard class="w-6 h-6 text-accent" />
          <p class="text-text text-sm font-mono font-bold">Visual flow editor</p>
          <p class="text-muted text-xs font-mono leading-relaxed">Drag nodes onto a canvas and connect them intuitively</p>
        </div>
        <div class="flex flex-col items-center gap-y-2 p-4 rounded-xl border border-border bg-surface text-center">
          <ChartBar class="w-6 h-6 text-accent" />
          <p class="text-text text-sm font-mono font-bold">7 field types</p>
          <p class="text-muted text-xs font-mono leading-relaxed">Text, textarea, number, dropdown, radio, multiselect, checkbox</p>
        </div>
        <div class="flex flex-col items-center gap-y-2 p-4 rounded-xl border border-border bg-surface text-center">
          <Share class="w-6 h-6 text-accent" />
          <p class="text-text text-sm font-mono font-bold">Share & preview</p>
          <p class="text-muted text-xs font-mono leading-relaxed">Preview your form and share it with a single click</p>
        </div>
      </div>
    </main>

    <footer class="py-4 text-center text-[11px] font-mono text-muted border-t border-border">
      MIT License · Built by <a href="https://github.com/dev-murphy" class="underline hover:text-accent transition-colors duration-300" target="_blank">Murphy Facey</a>  · <a href="https://github.com/dev-murphy/pathwise" target="_blank" class="underline hover:text-accent">View Source</a>
    </footer>
  </div>
</template>
