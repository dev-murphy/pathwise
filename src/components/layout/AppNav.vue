<script setup lang="ts">
import { useRouter } from 'vue-router'
import logoUrl from '~/assets/images/logo.png'

const props = withDefaults(defineProps<{
  showReset?: boolean
  showFitView?: boolean
  showPreview?: boolean
  showShare?: boolean
  showBack?: boolean
  backLabel?: string
  backTo?: string
}>(), {
  showReset: false,
  showFitView: false,
  showPreview: false,
  showShare: false,
  showBack: false,
  backLabel: 'Dashboard',
  backTo: '/dashboard',
})

const emit = defineEmits<{
  (e: 'reset'): void
  (e: 'fitView'): void
  (e: 'preview'): void
  (e: 'share'): void
}>()

const router = useRouter()
</script>

<template>
  <nav class="bg-surface border-b border-border px-4 py-3 shrink-0">
    <div class="flex items-center justify-between text-text">
      <!-- Left: logo + optional back -->
      <div class="flex items-center gap-x-3">
        <RouterLink to="/" class="flex items-center gap-x-2 select-none">
          <img :src="logoUrl" alt="Pathwise" class="w-7 aspect-square" />
          <span class="text-accent text-lg font-head font-black uppercase">Pathwise</span>
        </RouterLink>

        <button
          v-if="showBack"
          class="flex items-center gap-x-1 text-xs text-muted hover:text-accent font-mono transition-colors duration-150 cursor-pointer"
          @click="router.push(backTo)"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          {{ backLabel }}
        </button>
      </div>

      <!-- Right: actions -->
      <div class="flex items-center gap-x-2">
        <slot name="actions" />

        <button
          v-if="showShare"
          class="flex items-center gap-x-1.5 text-xs text-muted hover:text-accent font-mono transition-colors duration-150 cursor-pointer px-2 py-1"
          @click="emit('share')"
        >
          <Share class="w-4 h-4" />
          Share
        </button>

        <button
          v-if="showPreview"
          class="flex items-center gap-x-1.5 text-xs text-muted hover:text-accent font-mono transition-colors duration-150 cursor-pointer px-2 py-1"
          @click="emit('preview')"
        >
          <Eye class="w-4 h-4" />
          Preview
        </button>

        <XButton v-if="showFitView" text="Fit View" @trigger="emit('fitView')" />
        <XButton v-if="showReset" text="Reset" variants="default" @trigger="emit('reset')" />
      </div>
    </div>
  </nav>
</template>
