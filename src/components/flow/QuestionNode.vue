<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()
</script>

<template>
  <div
    class="question-node min-w-48 max-w-64 rounded-lg p-3 shadow-lg transition-all duration-150"
    :class="selected
      ? 'bg-surface-2 border-[3px] border-accent shadow-[0_0_0_1px_var(--color-accent)]'
      : 'bg-surface border-2 border-accent/60'"
  >
    <div class="flex items-center gap-x-1.5 mb-2">
      <span
        v-if="data.isStart"
        class="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent text-bg"
      >
        Start
      </span>
      <span
        v-else
        class="text-[9px] font-mono font-bold uppercase tracking-widest text-accent/70"
      >
        Question
      </span>
    </div>
    <p class="text-text text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">{{ data.label }}</p>
    <Handle type="target" :position="Position.Top" class="!bg-accent/50 !border-accent" />
    <Handle type="source" :position="Position.Bottom" class="!bg-accent !border-accent" />
  </div>
</template>
