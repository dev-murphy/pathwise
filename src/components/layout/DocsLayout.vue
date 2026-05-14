<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <AppNav />

    <main class="flex-1 overflow-y-auto scrollbar-none w-full max-w-3xl mx-auto px-6 py-12">
      <slot />
    </main>
  </div>
</template>
