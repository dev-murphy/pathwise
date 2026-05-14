<template>
  <div class="min-h-screen bg-bg flex flex-col items-center justify-center gap-y-6 text-center px-6">
    <AlertCircle class="w-16 h-16 text-muted" />

    <div class="flex flex-col gap-y-2">
      <h1 class="text-7xl font-head font-black text-text">404</h1>
      <p class="text-muted font-mono text-sm">This page doesn't exist.</p>
    </div>

    <RouterLink
      to="/"
      class="flex items-center gap-x-2 px-5 py-2 bg-surface-2 border border-border text-text font-mono text-sm rounded-lg hover:border-accent hover:text-accent transition-all duration-200"
    >
      <ArrowLeft class="w-4 h-4" />
      Go Home
    </RouterLink>
  </div>
</template>
